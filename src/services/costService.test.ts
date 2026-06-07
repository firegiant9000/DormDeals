import { describe, it, expect } from 'vitest';
import {
  FIRESTORE_FREE_TIER,
  BUDGET_ALERT_THRESHOLDS,
  DEFAULT_ASSUMPTIONS,
  estimateDailyUsage,
  estimateUsage,
  type UsageAssumptions,
} from './costService';

describe('costService', () => {
  describe('estimateDailyUsage', () => {
    it('combines guest and authed session reads', () => {
      const usage = estimateDailyUsage({
        dailySessions: 100,
        authedFraction: 0.5,
        listingsCreatedPerDay: 4,
        storedGiB: 0.1,
      });
      // 100 guest sessions * 41 + 50 authed sessions * 12 = 4100 + 600
      expect(usage.reads).toBe(4700);
      expect(usage.writes).toBe(4);
      expect(usage.storedGiB).toBe(0.1);
    });

    it('returns zero reads/writes for an idle day', () => {
      const usage = estimateDailyUsage({
        dailySessions: 0,
        authedFraction: 0,
        listingsCreatedPerDay: 0,
        storedGiB: 0,
      });
      expect(usage.reads).toBe(0);
      expect(usage.writes).toBe(0);
    });
  });

  describe('estimateUsage', () => {
    it('projects $0 cost while comfortably inside the free tier', () => {
      const est = estimateUsage(DEFAULT_ASSUMPTIONS);
      expect(est.projectedMonthlyCostUsd).toBe(0);
      expect(est.exceedsFreeTier).toBe(false);
      expect(est.daily.reads).toBeLessThan(FIRESTORE_FREE_TIER.readsPerDay);
    });

    it('charges only for usage beyond the free tier', () => {
      // Drive reads to exactly 2x the free daily quota → 50k billable reads/day.
      const perSessionReads = 41 + 0 * 12; // authedFraction 0 → guest reads only
      const dailySessions = Math.round(
        (FIRESTORE_FREE_TIER.readsPerDay * 2) / perSessionReads
      );
      const a: UsageAssumptions = {
        dailySessions,
        authedFraction: 0,
        listingsCreatedPerDay: 0,
        storedGiB: 0,
      };
      const est = estimateUsage(a);
      expect(est.exceedsFreeTier).toBe(true);
      expect(est.freeTierPct.reads).toBeGreaterThan(100);
      expect(est.projectedMonthlyCostUsd).toBeGreaterThan(0);
    });

    it('reports free-tier percentage relative to the daily quota', () => {
      const est = estimateUsage(DEFAULT_ASSUMPTIONS);
      const expectedPct =
        (est.daily.reads / FIRESTORE_FREE_TIER.readsPerDay) * 100;
      expect(est.freeTierPct.reads).toBeCloseTo(expectedPct, 5);
    });
  });

  it('exposes the configured budget alert thresholds', () => {
    expect([...BUDGET_ALERT_THRESHOLDS]).toEqual([5, 10, 20, 50, 100]);
  });
});
