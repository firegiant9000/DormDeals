# Observability & Analytics

Source issue: [Month 1 #8](issues/meta-and-month1.md) · Feeds: META epic #1 (the tracking spine).

DormDeals has two observability channels, both **inert until configured** (no DSN / no
measurement ID = no network, no events). This keeps local dev and tests clean.

| Channel | Purpose | Env var | Free tier |
|---|---|---|---|
| Sentry (`@sentry/react`) | Uncaught error + exception tracking | `VITE_SENTRY_DSN` | 5k events/mo |
| Firebase Analytics (`firebase/analytics`) | Funnel / behavior events | `VITE_FIREBASE_MEASUREMENT_ID` | included |

## Error tracking (Sentry)

- Init: [src/lib/sentry.ts](../src/lib/sentry.ts) — `initSentry()` called once in
  [src/index.tsx](../src/index.tsx). No-ops without `VITE_SENTRY_DSN`. Only `enabled` in
  production builds; `tracesSampleRate` is 0.1 to stay inside the free tier.
- Boundary: [src/components/ErrorBoundary.tsx](../src/components/ErrorBoundary.tsx) wraps the
  whole tree (outermost in `index.tsx`). Renders a reload fallback and, when Sentry is live,
  reports the error.

## The conversion funnel (tracking spine)

The program-level funnel the META epic depends on:

```
visit → signup → .edu verify → first listing → first message → first sale
```

Month 1 instruments the front half. `verify`, `message`, and `sale` events are added in
later months as those features land.

| Funnel step | Event | Fired from | Status |
|---|---|---|---|
| visit | (GA `page_view`, automatic) | Firebase Analytics | ✅ auto |
| signup | `signup_complete` | [AuthContext.tsx](../src/context/AuthContext.tsx) signup success | ✅ M1 |
| .edu verify | `verify` | — | ⏳ Month 2 |
| first listing | `listing_create` | [CreateListing.tsx](../src/pages/CreateListing.tsx) create success | ✅ M1 |
| (engagement) | `search` | [MainFeaturePage.tsx](../src/pages/MainFeaturePage.tsx) search submit | ✅ M1 |
| (engagement) | `listing_view` | [ListingDetailPage.tsx](../src/pages/ListingDetailPage.tsx) once per listing | ✅ M1 |
| (engagement) | `cart_add` | [ShopContext.tsx](../src/context/ShopContext.tsx) add-to-cart success | ✅ M1 |
| first message | `message` | — | ⏳ Month 3 |
| first sale | `sale` | — | ⏳ Month 4 |

## Event catalog

All events go through the typed wrapper [src/services/analytics.ts](../src/services/analytics.ts).
Add/extend events by editing the `AnalyticsEventParams` interface there — `trackEvent` is fully
typed against it.

| Event | Params |
|---|---|
| `listing_view` | `listing_id`, `category?` |
| `listing_create` | `listing_id`, `category?`, `price?` |
| `search` | `query`, `results_count?` |
| `signup_complete` | `method: 'email'` |
| `cart_add` | `listing_id` |

`setAnalyticsUser(uid \| null)` associates subsequent events with a user; it's called on every
auth-state change in `AuthContext`.

## Verifying

**Sentry** (requires a real DSN in `.env`):
1. Build/run with `VITE_SENTRY_DSN` set.
2. Throw a test error (e.g. a temporary `throw new Error('sentry test')` in a render path).
3. Confirm it appears in the Sentry project's Issues view.

**Firebase Analytics** (requires `VITE_FIREBASE_MEASUREMENT_ID` + an Analytics-enabled project):
1. Run the app, perform the 5 actions (sign up, search, view a listing, create a listing, add to cart).
2. In the Firebase console → Analytics → **DebugView** (or Realtime), confirm the 5 named events fire.
   DebugView is the fastest path; standard reports lag ~24h.

> Both channels are intentionally silent in dev/test. To smoke-test analytics locally, set a
> measurement ID and watch DebugView — events still require GA `isSupported()` to be true.
