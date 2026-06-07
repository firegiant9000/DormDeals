# Firestore Cost Baseline & Controls (Month 1 · Issue #9)

**Source issue:** [Month 1 #9](issues/meta-and-month1.md) · **Feeds:** META epic #1 (Firebase cost spike risk).
**Goal:** stay ahead of Firebase cost surprises and capture a "before" baseline while traffic is near zero.

DormDeals runs on the Firebase **Spark (free)** plan today. This doc records (1) the current
read/write cost per page, (2) the budget-alert runbook, and (3) the nightly-export runbook. The
live estimate is surfaced in **Profile → Costs** (admin only); the code is
[`src/services/costService.ts`](../src/services/costService.ts).

---

## 1. Reads/writes per page — "before" baseline

Audited from the actual queries in code. Counts are **document operations** (Firestore bills per
doc read/written, not per query). "N docs" = a collection query returns N matching documents, each
billed as one read.

| Page / action | Reads | Writes | Source |
|---|---|---|---|
| Home / MainFeaturePage (load) | 1 featured query (~8 docs) | 0 | [`listingService.ts:269-302`](../src/services/listingService.ts#L269-L302) |
| Marketplace (load / filter) | 1 query (~N active listings) | 0 | [`fetchMarketplace`](../src/data/listingsProvider.ts#L21-L39) |
| ListingDetailPage (view) | 1 doc | 0 | [`getListingById` → `getDoc`](../src/services/listingService.ts#L106) |
| CreateListing (submit) | 1 doc (read-back) | 1 doc + image upload (Storage) | [`listingService.ts:77`](../src/services/listingService.ts#L77) |
| Edit listing (submit) | 1 doc | 1 doc | [`listingService.ts:143-149`](../src/services/listingService.ts#L143-L149) |
| Profile → My Listings | ~5 docs (`ownerId` query) | 0 | [`Profile.tsx`](../src/pages/Profile.tsx) |
| Profile → Cart | ~3 docs (subcollection) | 0/1 on change | [`cartService`](../src/services/cartService.ts) |
| Profile → Favorites | ~3 docs (subcollection) | 0/1 on toggle | [`favoriteService`](../src/services/favoriteService.ts) |
| Profile → Admin / Analytics | **whole `users` collection** | 0 | [`adminService.getAllUsers`](../src/services/adminService.ts#L27) |

### Session model used by the dashboard
- **Guest session** ≈ 41 reads (Home featured 8 + one Marketplace browse ~30 + 3 detail views).
- **Authed session** adds ≈ 12 reads (profile + own listings + cart + favorites).
- **Free-tier daily quota:** 50,000 reads · 20,000 writes · 20,000 deletes · 1 GiB stored.

At the default assumption (50 sessions/day, 40% signed in, 3 new listings/day) projected usage is
well under 1% of the free tier — i.e. **$0/mo**. The dashboard recomputes live as you tune the
assumptions.

### ⚠️ Known cost/correctness issue surfaced by this audit
`getAllUsers()` reads the **entire `users` collection** on every Admin/Analytics tab open. Two
problems:
1. **It is currently broken** — #5 locked `/users` to read-self ([`firestore.rules:17-18`](../firestore.rules#L17)),
   so a collection read is denied. The Analytics tab errors today.
2. **It is unbounded** — even once a server-side admin path exists (Month 2 #13), reading all users
   client-side scales linearly with sign-ups. The Costs dashboard deliberately avoids it (listings
   only). Replace with an aggregation counter or a Cloud Function in Month 2.

---

## 2. Budget alerts runbook ($5 / $10 / $20 / $50 / $100)

Budgets live in **Google Cloud Billing**, not Firebase, and cannot be set from app code. One-time
console setup:

1. [GCP Console → Billing](https://console.cloud.google.com/billing) → select the billing account
   linked to the Firebase project.
2. **Budgets & alerts → Create budget.**
3. Scope to the DormDeals project. Set **Target amount = $100** (the ceiling).
4. Under **Set alert threshold rules**, add percentage rules that map to the dollar figures:
   `5%, 10%, 20%, 50%, 100%` of $100 → **$5 / $10 / $20 / $50 / $100**.
5. Tick **Email alerts to billing admins**; optionally wire a Pub/Sub topic for programmatic
   reaction later.
6. Confirm with a screenshot or the test notification, then attach it to issue #9.

> Budgets alert only — they do **not** cap spend. To hard-stop, add a Cloud Function on the budget
> Pub/Sub topic that disables billing (Phase 2 hardening, not Month 1).

---

## 3. Nightly Firestore export runbook (Cloud Scheduler → Cloud Storage)

**⚠️ Tier gap:** managed Firestore exports (`gcloud firestore export`) require the **Blaze** plan
and the Datastore Import/Export API — they are **not available on Spark**. The issue's
"verify Spark-tier quota" assumption does not hold. Options:

- **Recommended (still ~$0):** upgrade to Blaze (pay-as-you-go) — the export itself is billed as
  reads + Storage, pennies at this data volume, and the $5 budget alert above is the guardrail.
- **Spark-only fallback:** a scheduled client/Node script that paginates `listings` and writes JSON
  to Storage. Cheaper to keep on Spark but re-implements what managed export does for free-ish.

### Blaze managed-export setup (run once, requires `gcloud` + Owner role)

```bash
PROJECT_ID="<your-project-id>"
BUCKET="gs://${PROJECT_ID}-firestore-backups"

# 1. Bucket for exports (same region as Firestore)
gcloud storage buckets create "$BUCKET" --project="$PROJECT_ID" --location=us-central1

# 2. Grant the Cloud Scheduler / export service account write access
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_ID}@appspot.gserviceaccount.com" \
  --role="roles/datastore.importExportAdmin"

# 3. Nightly job at 03:00 — calls the Firestore export REST endpoint
gcloud scheduler jobs create http nightly-firestore-export \
  --project="$PROJECT_ID" \
  --schedule="0 3 * * *" \
  --time-zone="America/Chicago" \
  --uri="https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default):exportDocuments" \
  --http-method=POST \
  --oauth-service-account-email="${PROJECT_ID}@appspot.gserviceaccount.com" \
  --message-body="{\"outputUriPrefix\": \"${BUCKET}\"}"

# 4. Verify the "runs once successfully" acceptance criterion
gcloud scheduler jobs run nightly-firestore-export --project="$PROJECT_ID"
gcloud storage ls "$BUCKET"   # expect a timestamped export folder
```

Attach the `gcloud storage ls` output (or console screenshot) to issue #9 to close the criterion.

---

## Acceptance criteria mapping

| Criterion | Status |
|---|---|
| Budget alerts configured and confirmed | Runbook §2 (console action — execute + screenshot) |
| `docs/firestore_costs.md` baseline committed | ✅ this file |
| Admin cost line/page renders | ✅ Profile → Costs ([`costService.ts`](../src/services/costService.ts)) |
| Nightly export runs once successfully | Runbook §3 (requires Blaze — execute + verify) |
