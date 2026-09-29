# Issue Breakdown — META Tracking + Month 1 (Foundation Cleanup)

**Source:** [ROADMAP.md](../../ROADMAP.md)
**Branch:** `docs/roadmap-meta-month1-issues`
**Scope of this doc:** the META tracking umbrella issue (#1) and Month 1 (#2–#9). Months 2–6 and the Phase 2 backlog are indexed at the end but not yet expanded.
> **ARCHIVED (2026-09-29).** This is a point-in-time snapshot. The GitLab pipeline
> it discusses was replaced by `.github/workflows/ci.yml`, the Express server was
> removed, and the roadmap was frozen after Month 1 (see the notice at the top of
> [ROADMAP.md](../../ROADMAP.md)).

**Status (2026-06-05):** Month 1 is ~85–90% implemented. Completed issues are collapsed to a line below; outstanding work and cross-cutting gaps are in **Open Gaps & Remediation**.

---

## Group map (full program)

| Group | Issues | Range |
|---|---|---|
| META tracking | 1 | #1 |
| Month 1 — Foundation Cleanup | 8 | #2–#9 |
| Month 2 — Trust Layer | 8 | #10–#17 |
| Month 3 — Messaging + PWA | 8 | #18–#25 |
| Month 4 — Transaction Lifecycle | 8 | #26–#33 |
| Month 5 — Soft Launch | 9 | #34–#42 |
| Month 6 — Data, Decision, Direction | 9 | #43–#51 |
| Phase 2 backlog | 10 | #52–#61 |

---

# #1 — META: DormDeals 6-Month Roadmap Tracking

**Type:** Epic / tracking issue (umbrella). Links and orders all child issues.

**Goal:** Single source of truth for converting DormDeals from a ~60–70% school-project MVP into a trusted single-campus marketplace with 100+ active users by 2026-11, and a data-driven monetization decision in Month 6.

**Tracking spine — conversion funnel:** `visit → signup → .edu verify → first listing → first message → first sale`. Instrumented in #8; later months add `verify`/`message`/`sale`.

**Program success gates:**
- **Month 5 launch gate:** 25 listings · 50 sign-ups · 3 completed transactions · p95 page load < 2.5s · zero critical Firestore rule warnings.
- **Month 6 decision criteria (set before looking at data):** ≥50 WAU mid-month · ≥10 completed transactions in M5 · avg user creates ≥1 listing OR sends ≥3 messages in first 14 days · ≥5% click-through on a shown paid feature.

**Child checklist:** Month 1 #2–#9 · Month 2 #10–#17 · Month 3 #18–#25 · Month 4 #26–#33 · Month 5 #34–#42 · Month 6 #43–#51 · Phase 2 #52–#61.

> **Note:** this is currently a planning doc, not a live tracker. The "single source of truth" only holds once the issues exist in the GitHub repo (`firegiant9000/DormDeals`).

---

# Month 1 — Foundation Cleanup (#2–#9)

**Dependency order (historical):** #2 → (#4, #5) → #6; #7/#8/#9 independent.

## #2 — Service-layer consolidation ✅ Done
One canonical service per resource: `listingsService`, `favoritesService`, `api`, `apiService` deleted; `listingService`/`favoriteService` kept; `commerceService` correctly retained (used by `ShopContext`). `type-check`/`lint` clean, no dangling imports.

## #3 — Repo hygiene + `.env.example` scrub ✅ Done
Root `ResultsPage.tsx`, `blank-check.png`, root `index.ts` removed; `index.js` (Express prod server) kept; `.env.example` `VITE_VALIDATE_ONLY_ALLOWLIST` scrubbed to a placeholder.

## #4 — Type unification + hooks consolidation ⚠️ Mostly done
- ✅ Hooks (`useAccessControl`, `useCartWishlist`) verified non-duplicating and cleanly layered under `ShopContext`.
- ✅ **Status unified** (this chat): `ItemStatus` enum removed, `Item.status: ListingStatus`, the dead `'Active'`/`'Sold'` comparisons in `Profile.tsx` fixed, `commerce.ts` `updatedAt: any → Timestamp`. `type-check`/`lint` clean.
- ⛔ **Remaining:** see **G6 (`sellerId`/`ownerId`)**, plus deferred cosmetics — category-casing inconsistency (`Appliances`/`Kitchen`/`Decor`) and User/Message alias fields (`name`/`displayName`, `content`/`message`, …). Both are migration-gated (touch persisted Firestore data), so they are *not* type-only edits — left intentionally.

## #5 — Firestore security rules hardening ⚠️ Mostly done
[firestore.rules](../../firestore.rules) closes the `/users` gap (read-self + world-readable `publicProfile` subdoc), adds `hasOnly()` + `status` whitelist + `createdAt == request.time` on listing create, owner-only/immutable-field update & delete, and reject-by-default stubs for `reviews`/`conversations`/`reports`/`transactions`/`auditLog`/`campusMeta`.
⛔ **Open:** **G2** (rules never deployed by CI), **G4** (view-increment denied), **G5** (no admin carve-out), **G7** (update rule under-constrained).

## #6 — Composite index audit + pre-creation ✅ Mostly done
14 `listings` indexes + `conversations` index defined and audited in [firestore_indexes_audit.md](../firestore_indexes_audit.md); Month 4 indexes pre-created.
⛔ **Open:** **G3** (`sellerId`/`ownerId` query/field mismatch), **G8** (index explosion cleanup, deferred to M4 #29), **G9** (invalid range+orderBy via dead `ResultsPage`).

## #7 — CI test gate ⚠️ Built, not effective on the real remote
[.gitlab-ci.yml](../../.gitlab-ci.yml) has lint → build (`tsc`) → unit (blocking) + rules-emulator (blocking) + e2e (non-blocking, retry-once) → deploy. `test:rules` script and `tests/firestore.rules.test.ts` exist.
⛔ **Open:** **G1** (GitLab pipeline on a GitHub remote → never runs), **G2** (deploy is `--only hosting`), **G10** (lint non-blocking), **G11** (deprecated `FIREBASE_TOKEN`).

## #8 — Observability: error tracking + event analytics ✅ Done
Sentry wired via [sentry.ts](../../src/lib/sentry.ts) + `<ErrorBoundary>` at the app root; Firebase Analytics ([analytics.ts](../../src/services/analytics.ts)) initialized at startup with all 5 funnel events firing (`listing_view`, `listing_create`, `search`, `signup_complete`, `cart_add`) + `setAnalyticsUser`.
⛔ **Open:** **G12** — both are env-gated; verify `VITE_SENTRY_DSN` and `VITE_FIREBASE_MEASUREMENT_ID` are set in the prod host or instrumentation silently no-ops.

## #9 — Cost controls & instrumentation hygiene ✅ Mostly done
Admin **Profile → Costs** dashboard ([costService.ts](../../src/services/costService.ts)) renders a live estimate; [firestore_costs.md](../firestore_costs.md) documents the baseline + budget-alert and export runbooks.
⛔ **Open:** **G13** (budget alerts are a console action — execute + confirm), **G14** (nightly export needs Blaze; project is Spark).

---

# Open Gaps & Remediation

Restated from this chat's investigation and ranked by severity. IDs (G1…) are referenced above.

**Resolution status (2026-06-05, branch `docs/roadmap-meta-month1-issues`):**

| Gap | Status | How |
|---|---|---|
| G1 CI doesn't run on GitHub | ✅ Fixed | Added [.github/workflows/ci.yml](../../.github/workflows/ci.yml) |
| G2 Rules/indexes not deployed | ✅ Fixed | Deploy job runs `--only hosting,firestore:rules,firestore:indexes` (both CIs) |
| G3 Seller stats (`sellerId`/`ownerId`) | ✅ Fixed | `getListings({ownerId})` + caller updated |
| G4 View counter dead | ✅ Fixed | Rules: signed-in viewer may increment `views` by exactly 1 |
| G5 Admin dashboard denied | ✅ Fixed | Rules: secure `admins/{uid}` carve-out (non-self-writable) |
| G7 Update rule under-constrained | ✅ Fixed | Rules: `diff().affectedKeys().hasOnly([...])` on update |
| G9 Invalid range+orderBy query | ✅ Fixed | Price filtering moved client-side in `listingsProvider` |
| G10 Lint never blocks | ✅ Fixed | Removed `allow_failure`/`|| true`; GH Actions lint is blocking |
| G11 Deprecated `FIREBASE_TOKEN` | ✅ Fixed (GH) | GH Actions deploys via service account; GitLab noted |
| G12 Instrumentation env-gated | ✅ Documented | `.env.example` + CI build-secret comments; **set the secrets** |
| G8 Index explosion | ⏸ Deferred | Intentional pre-creation; collapse in M4 #29 (per audit) |
| G13 Budget alerts unconfirmed | ⛔ User action | Run [firestore_costs.md](../firestore_costs.md) §2 console steps |
| G14 Nightly export needs Blaze | ⛔ Decision | Upgrade to Blaze or use Spark script (runbook §3) |
| G15 META not a live tracker | ⛔ User action | Create the GitHub issues, or accept this doc as tracker |

**Required follow-up to make the fixes live** (cannot be done from the repo):
- Add GitHub repo secrets: `FIREBASE_SERVICE_ACCOUNT` + the `VITE_*` build vars + `VITE_SENTRY_DSN`.
- Create an `admins/{yourUid}` doc in Firestore (console) so G5's admin carve-out grants you access.
- Run the rules tests in CI (needs a JRE) — wired into the new workflow.



### Critical

**G1 — CI never runs on the real remote.**
`origin` is GitHub but the whole pipeline is `.gitlab-ci.yml`; there is no `.github/workflows/`. The merge gate (#7) is illusory.
*Best fix:* port the pipeline to a GitHub Actions workflow (`.github/workflows/ci.yml`): jobs for `tsc --noEmit`, `vitest run`, `firebase emulators:exec ... test:rules` (needs a JRE — use `setup-java`), and a `deploy` job on `main`. Cheapest interim: enable GitLab→repo mirroring so the existing `.gitlab-ci.yml` actually executes. Recommend Actions (the remote of record is GitHub).

**G2 — Rules & indexes are never deployed.**
`deploy_production` runs `firebase deploy --only hosting`, so #5 rules and #6 indexes only go live via manual deploy → repo/prod can silently diverge.
*Best fix:* in the CI deploy job, run `firebase deploy --only hosting,firestore:rules,firestore:indexes`. Gate the deploy on `rules_test` passing (already wired in `needs:`). Verify current prod rules match the repo before the next deploy.

**G3 — Seller stats broken (`sellerId` vs `ownerId`).**
Listings store `ownerId` ([listingService.ts:70](../../src/services/listingService.ts#L70)) but `getListings({sellerId})` filters `sellerId` ([listingService.ts:286](../../src/services/listingService.ts#L286)), called by `getUserProfileWithStats` ([userService.ts:261](../../src/services/userService.ts#L261)) → `totalListings`/`totalSales` always 0.
*Best fix (small, high value):* change the `sellerId` filter to `ownerId` (covered by the existing `ownerId, createdAt↓` index); drop the dead `sellerId` query param. Keep the read-side `data.sellerId || data.ownerId` fallback for legacy docs. This is the highest value-per-line fix open.

### High

**G4 — View counter is dead.**
`incrementListingViews` does an `updateDoc` ([listingService.ts:418](../../src/services/listingService.ts#L418)) for any viewer ([ListingDetailPage.tsx:152](../../src/pages/ListingDetailPage.tsx#L152)), but the listings `update` rule requires owner == caller → denied for non-owners/guests, error swallowed. Views never increment.
*Best fix:* add a narrowly-scoped rule branch allowing an authenticated non-owner to update **only** `views` (and optionally `updatedAt`) — e.g. `request.resource.data.diff(resource.data).affectedKeys().hasOnly(['views','updatedAt']) && request.resource.data.views == resource.data.views + 1`. Longer term (M4) move counters server-side (Cloud Function) to dedupe and prevent inflation.

**G5 — Admin dashboard broken under hardened rules.**
`/users` is read-self only; `adminService.getAllUsers` reads the whole collection → Admin/Analytics tabs error today. Documented in cost doc; resolution deferred to Month 2's server-side admin check.
*Best fix:* land a small interim rule helper now — `isAdmin() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.admin == true }` — and allow admin reads on `/users`. This is the Month 2 #13 task pulled forward just enough to un-break the existing UI; full moderation tooling stays in M2. Alternatively, gate the rules deploy so the admin path and rules ship together.

### Medium

**G7 — Listing `update` rule under-constrained.**
Only ownerId/createdAt immutability is enforced; an owner can add arbitrary fields or set `isFeatured:true`/any `status` ([firestore.rules:57-60](../../firestore.rules#L57)).
*Best fix:* mirror create — add `hasOnly([...])` on update plus `request.resource.data.isFeatured == resource.data.isFeatured` (featuring only via a privileged path) and a `status in [...]` guard. Reconcile with G4's `views` exception in one rule pass.

**G8 — Index combinatorial explosion.**
14 `listings` indexes; audit recommends collapsing to ~5 in Month 4 by pushing condition/price filtering client-side. Each index is write amplification.
*Best fix:* defer to **M4 #29** as planned; when reworking sort/pagination, keep only `status + (category) + sortField` server-side. No action now beyond tracking.

**G9 — Invalid range+orderBy query.**
`minPrice`/`maxPrice` inequality + `orderBy createdAt` in `listingsProvider` is rejected by Firestore; only reachable from the likely-dead `ResultsPage`.
*Best fix:* delete the `ResultsPage` path (or move price filtering client-side). Folds into the #3/#29 cleanup.

**G14 — Nightly export needs Blaze.**
Managed Firestore export is unavailable on Spark; #9's export criterion can't be met as-is.
*Best fix:* decide explicitly — upgrade to Blaze (export bills as pennies, $5 budget alert is the guardrail) **or** accept the Spark-only Node export-script fallback in the runbook. Recommend Blaze + the existing `gcloud scheduler` runbook in [firestore_costs.md](../firestore_costs.md) §3.

### Low / hygiene

**G10 — Lint never blocks** (`allow_failure: true` + `|| true`, [.gitlab-ci.yml:36-37](../../.gitlab-ci.yml#L36)). Flip to blocking once the tree is clean (it is — `lint` passes locally).
**G11 — `FIREBASE_TOKEN` deploy auth is deprecated.** Migrate to a service-account JSON (`GOOGLE_APPLICATION_CREDENTIALS`) in CI before it stops working; do this in the same pass as G1/G2.
**G12 — Instrumentation env-gated.** Confirm `VITE_SENTRY_DSN` + `VITE_FIREBASE_MEASUREMENT_ID` are set in the Render/Firebase Hosting prod env, else #8 is inert in prod. One-time check.
**G13 — Budget alerts unconfirmed.** Execute the [firestore_costs.md](../firestore_costs.md) §2 console steps and attach a screenshot to close #9.
**G15 — META is a planning doc, not a tracker.** Create the GitHub issues (or accept this doc as the tracker) so #1's "single source of truth" is real.

---

## Suggested sequencing for the open work

1. **One CI/deploy pass** — G1 + G2 + G10 + G11 (GitHub Actions workflow that gates on tests and deploys hosting+rules+indexes via a service account). Unblocks everything else by making the gate and rules deploy real.
2. **One rules pass** — G4 + G5 + G7 (views exception + interim admin helper + tighten update). Deploy via the new pipeline.
3. **One small code fix** — G3 (`sellerId`→`ownerId`).
4. **Decisions/ops** — G14 (Blaze?), G12, G13 (one-time console/env checks).
5. **Deferred to M4 #29** — G8, G9 (index cleanup + dead `ResultsPage`).

---

## Index — later groups (not yet expanded)

- **Month 2 — Trust Layer (#10–#17):** .edu verification, ratings/reviews, reporting + moderation queue, server-side admin check, prohibited-items auto-flag, image SafeSearch, warning ladder + audit log, avatar/public profile + founding-member tracking.
- **Month 3 — Messaging + PWA (#18–#25):** Firestore chat backend, MessagePage rewrite, FCM push, PWA, notification center, notification prefs, quiet hours, canned replies/meetup picker/native-share groundwork.
- **Month 4 — Transaction Lifecycle (#26–#33):** delete fake checkout, reservation state machine, payment-hint deep links, pagination + sort, listing analytics counters, free-pile + tags, auto-expire + renew, seller-tier automation.
- **Month 5 — Soft Launch (#34–#42):** SEO/OG meta + sitemap, onboarding wizard, seed data, distribution, feedback widget, ISBN lookup, university landing pages, OG image generation, referral attribution + email digest.
- **Month 6 — Data, Decision, Direction (#43–#51):** decision criteria, one monetization experiment, perf retrospective, docs pass, the decision, data export, account deletion, re-engagement push, abandoned-draft email + Wrapped.
- **Phase 2 backlog (#52–#61):** P2/P3 items — phone/ID verification, saved searches, map view, Algolia, typing indicators, bundles, ISO listings, Stripe Connect, ambassador program, blog/SEO.
