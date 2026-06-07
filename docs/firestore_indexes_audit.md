# Firestore Composite Index Audit (Month 1 · Issue #6)

**Source of truth:** [`firestore.indexes.json`](../firestore.indexes.json) (deployed via [`firebase.json`](../firebase.json)).
**Deploy:** `firebase deploy --only firestore:indexes` — then confirm each shows `READY` in
Firebase console → Firestore → Indexes.

Single-field indexes (Firestore auto-creates these) are out of scope; only **composite** indexes
are tracked here.

---

## 1. Audit of previously-defined indexes

All 5 indexes that existed before this issue map to a live query — **none deleted**.

| Index | Used by |
|---|---|
| `status, createdAt↓` | `fetchMarketplace` (newest) — [listingsProvider.ts:31](../src/data/listingsProvider.ts#L31); `getListings` — [listingService.ts:290](../src/services/listingService.ts#L290) |
| `status, price↑` | `fetchMarketplace` (priceLow) — [listingsProvider.ts:32](../src/data/listingsProvider.ts#L32) |
| `status, price↓` | `fetchMarketplace` (priceHigh) — [listingsProvider.ts:33](../src/data/listingsProvider.ts#L33) |
| `status, category, createdAt↓` | `fetchMarketplace` (category + newest) |
| `status, condition, createdAt↓` | `fetchMarketplace` (condition + newest) |

## 2. Gap indexes added (real queries that had no index)

These queries already exist in the code. They were either created only in the Firebase console
(drifted out of the repo file) or fail at runtime / fall back silently via `try/catch`. Added so a
clean deploy reproduces the full set.

| Index | Query that needs it |
|---|---|
| `status, category, price↑` / `price↓` | Marketplace: category filter + price sort — [Marketplace.tsx:43-46](../src/pages/Marketplace.tsx#L43-L46) |
| `status, condition, price↑` / `price↓` | Marketplace: condition filter + price sort |
| `status, category, condition, createdAt↓` | Marketplace: category **and** condition selected + newest |
| `status, category, condition, price↑` / `price↓` | Marketplace: category **and** condition + price sort |
| `status, isFeatured, createdAt↓` | Featured row — [listingService.ts:269-290](../src/services/listingService.ts#L269-L290) (Home / MainFeaturePage) |
| `ownerId, createdAt↓` | Profile's own listings — [Profile.tsx:212-216](../src/pages/Profile.tsx#L212-L216) |

## 3. Month 4 pre-creation

| Index | Future query |
|---|---|
| `status, category, price↑/↓` | Pagination + sort dropdown ([ROADMAP §M4.4-5](../ROADMAP.md#L816)) — already added in §2 |
| `conversations: participantIds⊇, lastMessageAt↓` | Messaging inbox listener ([ROADMAP:1317](../ROADMAP.md#L1317)) |

`status + sort` (the issue's third Month-4 target) is already satisfied by the `status, price↑/↓`
and `status, createdAt↓` indexes from §1.

---

## Known gaps / risks (to address in Month 4 #29 — pagination + sort)

1. **Combinatorial index explosion.** The marketplace filter model lets `category` and `condition`
   combine freely with 3 sorts, so every new equality filter multiplies the index count by 3
   (15 `listings` indexes today). Each composite index adds write amplification on every listing
   write. **Recommendation:** when reworking sort/pagination in Month 4, push price/condition
   filtering client-side (as [Marketplace.tsx:70-87](../src/pages/Marketplace.tsx#L70-L87) already
   does after fetch) and keep only `status + (category) + sortField` server-side, collapsing the
   matrix back to ~5 indexes.

2. **Invalid range + orderBy query.** `fetchListings` passes `minPrice`/`maxPrice` (inequality on
   `price`) together with `sort: 'newest'` (orderBy `createdAt`) —
   [listingsProvider.ts:28-31](../src/data/listingsProvider.ts#L28-L31). Firestore rejects an
   inequality filter unless its field is the first `orderBy`; no index fixes this. It is currently
   only reachable from the (likely dead) `ResultsPage`. Fix or remove that path in #29.

3. **`isActive` legacy fallback** ([listingService.ts:312-343](../src/services/listingService.ts#L312-L343))
   is wrapped in `try/catch` that swallows missing-index errors by design. Left un-indexed
   intentionally — it is backward-compat scaffolding slated for removal, not a query to optimize.

4. **`status != 'active'`** ([listingService.ts:279](../src/services/listingService.ts#L279)) — the
   inequality reads admin/inactive listings; verify it resolves against the `status, createdAt↓`
   index after #5's rules land, or constrain it to admin-only callers.

5. **`sellerId` is deprecated by #5.** The hardened listing-create `hasOnly()` whitelist in
   [firestore.rules:51-54](../firestore.rules#L51-L54) permits `ownerId` only — new listings cannot
   carry `sellerId`. The legacy `getListings({ sellerId })` path
   ([userService.ts:261](../src/services/userService.ts#L261)) is `.catch(() => [])`-guarded, so its
   missing index degrades gracefully and is intentionally **not** indexed. **Recommendation
   (#2/#4 follow-up):** migrate `getUserProfileWithStats` and the
   [Profile.tsx:231-235](../src/pages/Profile.tsx#L231-L235) fallback off `sellerId` onto `ownerId`,
   which the `ownerId, createdAt↓` index already covers.
