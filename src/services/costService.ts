/**
 * Firebase cost estimation (Month 1 #9 — cost controls & instrumentation hygiene).
 *
 * There is no client-callable billing API on the Spark plan, so the admin cost
 * dashboard cannot show a real "$X spent yesterday" figure without a backend
 * (out of scope — no backend rewrites). Instead this module derives an *estimate*
 * from the one number we can read cheaply (the live listing count) plus a tunable
 * "daily active sessions" assumption, and projects it against the Firestore free
 * tier. Authoritative spend always lives in the Firebase console — see
 * docs/firestore_costs.md for the budget-alert and export runbooks.
 *
 * All functions are pure and network-free so they are unit-testable.
 */

/** Firestore Spark (free) plan daily quotas. */
export const FIRESTORE_FREE_TIER = {
  readsPerDay: 50_000,
  writesPerDay: 20_000,
  deletesPerDay: 20_000,
  storedGiB: 1,
} as const;

/** Firestore Blaze (pay-as-you-go) unit pricing, us-central1. */
export const FIRESTORE_BLAZE_PRICING = {
  readPer100k: 0.06,
  writePer100k: 0.18,
  deletePer100k: 0.02,
  storageGiBMonth: 0.18,
} as const;

/** Budget alert thresholds (USD) configured in the GCP billing console (#9). */
export const BUDGET_ALERT_THRESHOLDS = [5, 10, 20, 50, 100] as const;

/**
 * Document reads consumed by one "typical" anonymous session, derived from the
 * query audit in docs/firestore_costs.md:
 *   - land on Home / MainFeaturePage  → 1 featured query (~8 docs)
 *   - browse Marketplace once          → 1 query (~30 docs on a single campus)
 *   - open 3 listing detail pages      → 3 single-doc reads
 * A signed-in session adds profile/cart/favorites reads; modelled separately.
 */
export const READS_PER_GUEST_SESSION = 8 + 30 + 3;

/** Extra reads a signed-in session adds: profile + own listings + cart + favorites. */
export const READS_PER_AUTHED_SESSION = 1 + 5 + 3 + 3;

/** Writes per session that creates one listing (the listing doc itself). */
export const WRITES_PER_LISTING_CREATE = 1;

export interface UsageAssumptions {
  /** Estimated distinct user sessions per day. */
  dailySessions: number;
  /** Fraction of sessions that are signed in (0–1). */
  authedFraction: number;
  /** Listings created per day across all users. */
  listingsCreatedPerDay: number;
  /** Approximate stored data in GiB (listings + images metadata). */
  storedGiB: number;
}

export const DEFAULT_ASSUMPTIONS: UsageAssumptions = {
  dailySessions: 50,
  authedFraction: 0.4,
  listingsCreatedPerDay: 3,
  storedGiB: 0.05,
};

export interface DailyUsage {
  reads: number;
  writes: number;
  storedGiB: number;
}

export interface UsageEstimate {
  daily: DailyUsage;
  /** Percentage of each free-tier daily quota consumed (0–100+, can exceed 100). */
  freeTierPct: { reads: number; writes: number };
  /** Projected monthly Blaze cost for usage *beyond* the free tier, in USD. */
  projectedMonthlyCostUsd: number;
  /** True when any daily quota is projected to be exceeded. */
  exceedsFreeTier: boolean;
}

/** Estimate a day's Firestore reads/writes from tunable assumptions. */
export function estimateDailyUsage(a: UsageAssumptions): DailyUsage {
  const authedSessions = a.dailySessions * a.authedFraction;
  const reads = Math.round(
    a.dailySessions * READS_PER_GUEST_SESSION +
      authedSessions * READS_PER_AUTHED_SESSION
  );
  const writes = Math.round(a.listingsCreatedPerDay * WRITES_PER_LISTING_CREATE);
  return { reads, writes, storedGiB: a.storedGiB };
}

/** Cost of a single resource's monthly usage beyond its free-tier allowance. */
function billableMonthlyCost(
  dailyUnits: number,
  freeDailyUnits: number,
  pricePer100k: number
): number {
  const billableDaily = Math.max(0, dailyUnits - freeDailyUnits);
  return (billableDaily * 30 / 100_000) * pricePer100k;
}

/** Project a full usage estimate (free-tier headroom + monthly cost) from assumptions. */
export function estimateUsage(a: UsageAssumptions): UsageEstimate {
  const daily = estimateDailyUsage(a);

  const readCost = billableMonthlyCost(
    daily.reads,
    FIRESTORE_FREE_TIER.readsPerDay,
    FIRESTORE_BLAZE_PRICING.readPer100k
  );
  const writeCost = billableMonthlyCost(
    daily.writes,
    FIRESTORE_FREE_TIER.writesPerDay,
    FIRESTORE_BLAZE_PRICING.writePer100k
  );
  const storageCost =
    Math.max(0, daily.storedGiB - FIRESTORE_FREE_TIER.storedGiB) *
    FIRESTORE_BLAZE_PRICING.storageGiBMonth;

  const freeTierPct = {
    reads: (daily.reads / FIRESTORE_FREE_TIER.readsPerDay) * 100,
    writes: (daily.writes / FIRESTORE_FREE_TIER.writesPerDay) * 100,
  };

  return {
    daily,
    freeTierPct,
    projectedMonthlyCostUsd: Number((readCost + writeCost + storageCost).toFixed(2)),
    exceedsFreeTier:
      daily.reads > FIRESTORE_FREE_TIER.readsPerDay ||
      daily.writes > FIRESTORE_FREE_TIER.writesPerDay ||
      daily.storedGiB > FIRESTORE_FREE_TIER.storedGiB,
  };
}
