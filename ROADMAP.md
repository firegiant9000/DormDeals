# DormDeals — Solo 6-Month Roadmap

**Author:** Arlo Kharod
**Drafted:** 2026-05-12
**Status:** ARCHIVED — not pursued. The project was frozen on 2026-09-29 (see below).
**Horizon:** 2026-05 through 2026-11 (as originally proposed)

---

> **Freeze notice (2026-09-29).** DormDeals is a completed team course project,
> kept public as an archived portfolio piece. This roadmap was a proposal for a
> solo continuation. Only the Month 1 foundation work shipped: GitHub Actions CI,
> Firestore rules hardening with emulator tests, the admin registry, Sentry and
> analytics wiring, and the cost and index audits. Everything from Month 2 onward
> is **CANCELLED**, including .edu verification, messaging, the transaction
> lifecycle, PWA/push, the soft launch and growth playbook, the monetization
> experiment and every Phase 2 branch. The Month 6 go/pivot/wind-down decision is
> made: **wind down**. The plan is kept as written, as a record of what was
> proposed.

## TL;DR

You have a ~60–70% complete campus marketplace MVP. The core (auth, listings, search, cart, favorites, admin) is real and working. **Checkout and messaging are facades**, and there is **no .edu verification** — both are credibility-blockers for a campus product.

**Recommended path:** *Don't pivot away. Don't try to monetize early. Don't add Stripe.* Spend 6 months turning DormDeals into a **trusted, peer-to-peer coordination platform** for ONE campus (yours), with real verification, real messaging, and a "meet in person, settle off-platform" deal flow. Ship to 100 real users by Month 5, decide on monetization in Month 6 based on data.

This is a high-leverage path because:
1. It plays to your existing 70% — nothing here is throwaway work.
2. It sidesteps the hardest regulatory/financial complexity (marketplace payouts, KYC, Stripe Connect) until you have demand to justify it.
3. It produces a portfolio piece with real users and a real story regardless of whether you scale, sell, or shelve it.

---

## Goal / Scope / Constraints / Verification / Risks

**Goal:** Convert DormDeals from a school-project MVP into a trusted, usable campus marketplace with 100+ active users at one university by 2026-11, and a clear monetization decision based on observed behavior.

**Scope (in):**
- .edu verification, ratings/reviews, real messaging, transaction lifecycle
- Service-layer consolidation, Firestore rules hardening, CI test gate
- PWA + push notifications, SEO meta on listings
- Analytics + error tracking
- Soft launch to one campus, feedback loop, monetization experiment

**Scope (out):**
- Native iOS/Android apps (PWA only)
- Stripe / Stripe Connect / any payment processing (intentionally deferred)
- Multi-campus rollout (only after Month 6 decision)
- Shipping/logistics, third-party APIs (Algolia, SendGrid) unless explicitly approved
- New core dependencies beyond Firebase ecosystem

**Constraints:**
- Solo developer, balancing classes and pro work — assume **8–12 productive hours/week** on this project.
- Stack frozen: React 18 + TS + Vite + Tailwind + Firebase. No backend rewrites.
- Budget: <$30/mo total infra. Firebase Spark + Render free or hobby tier.
- No new dependencies without an explicit cost/benefit note in this doc.

**Verification:**
- Each month has measurable exit criteria (see per-month sections).
- Month 5 launch gates on: 25 listings, 50 sign-ups, 3 completed transactions, p95 page load <2.5s, zero critical Firestore rule warnings.
- Month 6 monetization decision is data-driven, not vibes.

**Risks (top 5, mitigations in body):**
1. **Solo burnout** — scope-cut each month aggressively; if a month slips, drop a stretch goal, not a core goal.
2. **No user pickup at launch** — pre-seed the first 20 listings yourself + 10 friends *before* opening sign-ups.
3. **Firebase cost spike** — set hard budget alerts at $5/$10/$20. Review reads-per-page weekly.
4. **.edu verification breaks for community colleges / non-standard domains** — design domain allowlist as data, not code, so it's editable without redeploy.
5. **Sunk-cost loyalty to existing code** — be willing to delete duplicate services and the fake checkout. The audit identifies what to cut.

---

## Strategic Options Considered

Before committing to the plan, here's the option space I evaluated:

| Option | Description | Pros | Cons | Verdict |
|---|---|---|---|---|
| **A. Ship as marketplace at home campus** *(chosen)* | Polish DormDeals into a trusted single-campus platform with peer-to-peer coordination | Reuses 70% of existing work; small, testable user base; portfolio-grade story | Slow growth; non-trivial trust/moderation work | **Recommended** |
| B. Pivot to textbooks-only | Specialize as a textbook resale tool | Sharper value prop; easier search (ISBN); seasonal demand | Already crowded (Chegg, Facebook Marketplace, eBay); requires you to scrap most of current UX | Not recommended |
| C. Pivot to sublease/housing | Apartment & sublease listings between students | Higher transaction value; less inventory turnover | Legal/liability complexity; rental laws vary by state; you don't have domain expertise | Not recommended for solo |
| D. Repurpose as B2B / white-label | Sell "campus marketplace as a service" to universities | High contract value if it lands; differentiated | 12+ month sales cycle; need a champion at a university; no existing distribution | Not viable in 6 months |
| E. Portfolio piece, then wind down | Polish for resume, stop active dev | Low effort; useful for job hunt | Sunk-cost waste; you've already done the hard part | Not recommended |

**Why A:** the marginal effort to go from "demo" → "real product at one campus" is far lower than starting any pivot from scratch, and the result still serves as a portfolio piece *even if* you decide to wind down at Month 6.

---

## Feature Catalog (Prioritized)

This is the universe of features a campus marketplace *could* have, ranked by priority and effort. The 6-month plan picks from **P0** and most of **P1**. P2/P3 land in Phase 2 (Months 7–12) or never. Use this as your backlog when deciding what to build next.

**Priority key:** P0 = ship-blocker for credibility · P1 = strong ROI within 6 months · P2 = nice-to-have / Phase 2 · P3 = speculative
**Effort key:** S = <1 day · M = 1–5 days · L = 1–3 weeks · XL = month+

### Trust & Safety

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| .edu email verification (allowlist domains as data) | P0 | M | 2 | Hard gate on listing creation & messaging |
| Server-side admin role check (Firestore rule lookup) | P0 | S | 2 | Stop relying on client-side gating |
| Listing/user reporting + moderation queue | P0 | M | 2 | Plus banned-phrase autoflag |
| Ratings & reviews (post-sale only) | P0 | M | 2 | Aggregate to seller doc; 1–5 stars + text |
| Block another user (hide listings, refuse messages) | P1 | S | 3 | Common safety request |
| Seller badge tiers (bronze/silver/gold by completed sales) | P1 | S | 4 | Auto-awarded, no admin work |
| Designated safe-meetup locations per campus (campus security, library) | P1 | S | 4 | Static list in `campusMeta` collection; show on listing |
| Auto-expiring reservations (14d) with day-7 nudge | P1 | S | 4 | Cron via Cloud Scheduler + Function |
| Image safety scan (Cloud Vision SafeSearch on upload) | P1 | M | 3 | Auto-reject explicit content |
| Banned-phrase detector on listing & message content | P1 | S | 2 | Simple denylist regex |
| Prohibited items policy enforcement (see policy below) | P1 | M | 2 | Combination of allowlist categories + denylist phrases |
| Account warning ladder (warn → suspend 7d → ban) | P1 | M | 2 | Admin tool, stored in audit log |
| Phone verification (SMS OTP) for high-value listings | P2 | M | 7+ | Firebase Phone Auth; cost concern |
| Identity verification (student ID photo upload) | P2 | L | 7+ | Manual admin review queue |
| Two-factor auth (TOTP) on account settings | P2 | M | 7+ | Firebase doesn't natively support; needs custom or auth provider swap |
| Ghosting/no-show flag with seller protection | P2 | M | 7+ | Buyer accumulates flags → lose privileges |
| Dispute resolution workflow (mediated by admin) | P2 | L | 7+ | Low volume until you have payments |
| Geo check-in at meetup ("I'm here" with location ping) | P3 | L | — | Speculative; privacy implications |
| Device fingerprinting for ban evasion | P3 | L | — | FingerprintJS free tier; only if abuse becomes real |
| Sanctions / global ban list shared across campuses | P3 | M | — | Only if multi-campus |

### Listings

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| Multi-image upload with reorder + main-image selection | P0 | S | 1 | Already exists; verify reorder works |
| Listing edit with version history (or at least lastEditedAt) | P0 | S | 1 | Trust signal |
| Listing auto-expire (30 days default, renewable) | P0 | S | 4 | Prevents zombie listings |
| Listing analytics (views, saves, messages) for seller | P1 | M | 5 | Increment counters in Firestore; aggregate nightly |
| Listing drafts with autosave | P1 | M | 1 | Currently has `status: 'draft'` — wire it up |
| Quick re-list ("sell again") | P1 | S | 4 | Clone listing, reset status |
| ISBN lookup for textbooks (Google Books API, free) | P1 | M | 5 | Massive UX win for the most common category |
| Listing tags beyond category (`new`, `vintage`, `gift`, `move-out`) | P1 | S | 4 | Faceted search |
| "Make an offer" — buyer-initiated price negotiation | P1 | M | 4 stretch | Captured in conversation thread |
| Free-pile category (price = 0) with separate browse | P1 | S | 4 | Surprisingly popular on campus |
| ISO ("wanted") listings — buyer posts what they need | P1 | M | 7+ | Inverse marketplace, drives engagement |
| Listing share with auto-generated OG image | P1 | M | 5 | Critical for organic distribution |
| QR code per listing for physical flyers | P2 | S | 5 | Library/dorm board distribution |
| Bundle listings (sell 3 items together at discount) | P2 | M | 7+ | |
| Short video clips (15s, like Vinted) | P2 | L | 7+ | Storage cost spike risk |
| Auction format with countdown timer | P3 | L | — | Niche on campus |
| Bulk import via CSV for power sellers | P3 | M | — | Only if power-seller cohort emerges |

### Discovery & Search

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| Pagination (cursor-based, 24/page) | P0 | S | 4 | Required before launch |
| Sort dropdown (newest / price / best-rated seller) | P0 | S | 4 | |
| Faceted filters (category, price, condition, tags) | P1 | M | 4 | Most done client-side already; tighten UX |
| Saved searches with email/push alerts on match | P1 | M | 7+ | Sticky engagement feature |
| Price-drop alerts on favorited listings | P1 | S | 7+ | Push when seller lowers price |
| "Recently viewed" + "Recommended for you" (collab filter from views/favs) | P1 | M | 7+ | Simple co-view counter is enough at small scale |
| Trending listings (most-viewed last 24h) | P1 | S | 5 | Homepage block |
| Map view of listings on campus (Mapbox free tier or Leaflet+OSM) | P2 | M | 7+ | Visual delight, low search value |
| Time-based filters ("new today", "this week", "ending soon") | P2 | S | 7+ | |
| Image-based search ("find similar") | P3 | XL | — | Needs ML infra |
| Algolia / Typesense full-text search | P2 | M | 7+ | Only when client-side breaks (~3k+ listings) |
| Voice search | P3 | M | — | |

### Communication

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| Real-time chat (Firestore listeners) | P0 | L | 3 | Replaces mock |
| Unread badges per conversation | P0 | S | 3 | |
| Image attachments in messages | P0 | S | 3 | |
| Read receipts | P1 | S | 3 | |
| Push notifications via FCM | P0 | M | 3 | Service worker + Cloud Function |
| Canned reply templates ("Is this still available?", "Can I see more pics?") | P1 | S | 3 | One-tap responses |
| Pin meetup location (with map link) | P1 | S | 3 | Reuses safe-meetup list |
| Mute / archive conversation | P1 | S | 3 | |
| Search within messages | P2 | M | 7+ | |
| Typing indicators | P2 | M | 7+ | Read-cost concern |
| Voice messages | P3 | M | — | |
| Auto-translate for international students | P3 | M | — | Google Translate API; cost concern |

### User Profile

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| Avatar upload | P0 | S | 1 | Trust signal |
| Public profile (displayName, school, year, ratingAvg, active listings) | P0 | S | 2 | Drives buyer confidence |
| Verified badges (email, phone, ID — earn separately) | P1 | M | 2–7 | Stackable |
| Major / dorm (optional, privacy-aware) | P1 | S | 5 | Helps with meetup logistics |
| Social links (Instagram, etc., optional) | P2 | S | 5 | Trust signal but privacy considerations |
| Privacy settings (hide last-seen, hide listings count) | P2 | M | 7+ | |
| Following / followers (social graph) | P3 | L | — | Probably not worth the complexity |
| Public activity feed | P3 | L | — | |

### Notifications

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| In-app notification center (bell icon) | P0 | M | 3 | Centralizes everything |
| Per-type push/email preferences | P1 | M | 3 | Required before scaling email |
| Quiet hours (no push 11pm–8am local) | P1 | S | 3 | |
| Email digest (weekly summary of activity) | P1 | M | 5 | Re-engagement |
| Snooze notifications | P2 | S | 7+ | |
| Notification grouping (3 messages → 1 push) | P2 | M | 7+ | Critical at scale |

### Engagement & Gamification

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| Achievement badges (First Sale, 10 Sales, First Review) | P1 | S | 5 | Cheap motivator |
| Founding member badge (first 100 users) | P0 | S | 5 | Launch tactic, retention driver |
| Top-rated-seller auto badge after N reviews | P1 | S | 4 | Already half-built via ratings |
| Referral program (invite a verified friend → both get a badge) | P0 | M | 5 | Primary growth lever for free product |
| Seller streak counter (consecutive weeks active) | P2 | S | 7+ | |
| Leaderboard per category | P3 | S | — | Probably gimmicky |

### Operations & Admin

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| Admin metrics dashboard (DAU, listings, transactions, reports) | P0 | M | 2 | Replaces guessing |
| Audit log (every admin action) | P0 | S | 2 | Required for trust |
| User search/lookup with full activity timeline | P1 | M | 2 | Speeds up moderation |
| Feature flags (LaunchDarkly-free DIY in Firestore) | P1 | M | 5 | Ship dark, enable gradually |
| Maintenance mode toggle | P1 | S | 5 | |
| Bulk listing actions (admin) | P2 | M | 7+ | |
| Cost dashboard with daily Firebase spend | P1 | S | 1 | Stay ahead of cost surprises |
| Daily ops digest emailed to you | P1 | M | 5 | "Yesterday: 12 sign-ups, 3 sales, 2 reports, $0.42 spend" |

### Growth, Marketing & Distribution

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| OG/Twitter cards on listing pages | P0 | S | 5 | Free organic distribution |
| Sitemap + robots.txt | P0 | S | 5 | |
| Auto-generated share images per listing | P1 | M | 5 | `@vercel/og` style, or static gen via Function |
| Referral codes with attribution | P0 | M | 5 | First growth lever |
| University-specific landing pages (`/ull`, `/lsu`) with school-branded hero | P1 | M | 5 | SEO + warm welcome |
| Onboarding email sequence (D1, D3, D7, D14) | P1 | M | 5 | Resend free tier (3k/mo) or Firebase Extension |
| "Invite your dorm" flow with shareable image | P1 | S | 5 | |
| Re-engagement push (no activity in 14d) | P1 | M | 6 | |
| Abandoned-draft email (started listing, didn't finish) | P2 | S | 6 | |
| Campus ambassador program (free premium for referrals) | P2 | M | 7+ | Hand-recruited, doesn't scale until product does |
| Seasonal campaigns (move-in, finals, move-out, graduation) | P1 | M | per-season | Calendar-driven, prep templates ahead |
| Embed widget (post a listing on a subreddit/IG with a card) | P3 | L | — | |
| Long-form SEO blog | P2 | M ongoing | 7+ | "Move-out checklist", "Best dorm furniture under $50" |
| Year-end recap ("DormDeals Wrapped") | P2 | M | annual | Shareable, drives organic acquisition in Dec |
| QR codes for physical flyers | P2 | S | 5 | |

### Monetization

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| Featured listings ($2 boost, 7 days) — Stripe Checkout one-time | P0 | M | 6 | Simplest monetization that works |
| Premium seller subscription ($3/mo) — Stripe Billing | P1 | L | 6 | Test in Month 6 |
| Verified-seller badge upsell ($5 one-time after N sales) | P2 | M | 7+ | |
| Promoted slot at top of category | P2 | M | 7+ | |
| Stripe Connect marketplace payments (real escrow) | P3 | XL | — | Only with real demand + legal review |
| Affiliate links to Amazon (dorm essentials) | P3 | M | — | Off-brand; tread carefully |
| Display ads (Google AdSense) | P3 | S | — | Cheap revenue, ugly UX — last resort |
| University partnership / sponsored category | P3 | XL | — | Slow but high-leverage |
| Move-out service partnerships (storage, shipping) | P3 | L | — | Possible Phase 2+ |
| Sponsored campus events / ticket fees | P3 | L | — | |

### Mobile / PWA

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| PWA manifest + service worker | P0 | M | 3 | `vite-plugin-pwa` |
| "Add to Home Screen" prompt | P1 | S | 3 | After 2nd visit |
| Offline draft creation | P2 | M | 7+ | |
| Native share sheet integration | P1 | S | 3 | `navigator.share()` |
| Camera-direct listing creation | P1 | M | 5 | `<input capture>` |
| iOS/Android deep links from emails | P2 | M | 7+ | |

### Performance & Infrastructure

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| Image responsive `srcset` with WebP/AVIF | P0 | M | 5 | Firebase Extension: "Resize Images" |
| Lazy-load images below the fold | P0 | S | 5 | Native `loading="lazy"` |
| Skeleton loaders on listings/profile | P1 | S | 5 | Perceived perf |
| Optimistic UI on favorite/cart toggles | P1 | S | 5 | |
| Firestore composite indexes audit | P0 | S | 1 | |
| Backup/export strategy (scheduled Firestore export to GCS) | P1 | S | 1 | Free in Spark? — verify quota |
| Sentry alert thresholds (p95 latency, error rate) | P1 | S | 1 | |
| Lighthouse CI on PRs | P2 | M | 7+ | |
| Edge caching for static listings (CDN headers) | P2 | M | 7+ | |

### Compliance & Legal

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| Privacy Policy + Terms of Service | P0 | M | 5 | Use Termly/iubenda template, lawyer-review later |
| Cookie banner (only if you set non-essential cookies) | P1 | S | 5 | Probably needed for GA/PostHog in EU |
| Data export (user right under GDPR/CCPA) | P1 | M | 6 | Even non-EU/CA users appreciate it |
| Account deletion ("right to be forgotten") with grace period | P0 | M | 5 | Soft-delete 30d, then purge |
| Prohibited items policy (see dedicated section below) | P0 | S | 2 | Written + enforced |
| DMCA takedown procedure (designated agent, contact form) | P1 | S | 5 | Required for safe-harbor |
| Acceptable Use Policy | P0 | S | 5 | |
| Disclaimer: DormDeals is not party to transactions | P0 | S | 5 | Reduces liability surface |
| Age gate (13+ COPPA, 18+ for some categories) | P1 | S | 5 | Tied to .edu verification |

### Analytics & Instrumentation

| Feature | Priority | Effort | Month | Notes |
|---|---|---|---|---|
| Funnel: visit → signup → verify → first listing → first message → first sale | P0 | M | 1 | The most important dashboard you'll build |
| Per-event analytics (signup, listing_create, search, message_sent, sale_completed) | P0 | S | 1 | Firebase Analytics or PostHog |
| Cohort retention curves | P1 | M | 5 | Weekly cohorts, month-over-month |
| Search query log (anonymized) | P1 | S | 5 | Find missing categories; tune relevance |
| Empty-results rate | P1 | S | 5 | Critical search-quality metric |
| Time-to-first-listing for new users | P1 | S | 5 | Onboarding effectiveness |
| Heatmaps / session replay (PostHog free tier) | P2 | S | 5 | Optional but cheap |
| Self-serve admin dashboard (vs. raw analytics tool) | P1 | M | 5 | One source of truth |

---

## Marketing & Growth Playbook

The product side gets all the attention but a marketplace lives or dies on distribution. Here's a concrete playbook for the 6 months and beyond.

### Acquisition channels, ranked for solo dev on a $0 budget

| Channel | Effort/wk | Expected yield | Verdict |
|---|---|---|---|
| University subreddit/Discord posts | 1–2h | 5–30 sign-ups per post | **Primary** — repeatable, free, where students hang out |
| Dorm common-area flyers (QR → ref code) | 2–3h once | 10–50 over a week | **Strong supplement** — high-trust environment |
| Personal IG story + friends' shares | 30m | Long tail; depends on social graph | **Worth it** for the first 50 |
| Campus email listserv (CS dept, clubs you're in) | 1h | 20–100 if approved | **High-leverage**, requires permission |
| Student newspaper (free classifieds or feature pitch) | 3–4h | Variable; can be huge | **Worth pitching once** |
| TikTok content | 5–10h ongoing | Wildly variable | **Skip** unless you already make content |
| Google Ads / Meta Ads | $$ + 3h setup | Bad CPA without conversion optimization | **Skip** for now |
| Partnerships with student orgs (sponsored category page) | 3–5h per partner | 50–200 motivated users | **Mid-priority Phase 2** |
| Move-in week tabling | Full day | 100+ in-person sign-ups | **Strong seasonal play** if timing aligns |

### Pre-launch checklist (Month 5 week 1)

- [ ] 20 personal listings live (real items you'd actually sell — clothes, books, mini-fridge, etc.)
- [ ] 5–10 friends recruited as seed sellers (with at least 2 listings each)
- [ ] OG image renders correctly on iMessage, Instagram DM, Twitter, Discord link previews
- [ ] First 3 referral codes minted, attached to your physical flyers
- [ ] Reddit/Discord post drafts written and reviewed by 1 friend
- [ ] Privacy Policy + ToS live and linked in footer
- [ ] Feedback button reaches your email within 2 minutes (you've tested it)
- [ ] You can monitor sign-ups and listings without opening Firebase console (admin dashboard)
- [ ] Email digest cron is firing (even if you're the only recipient)

### Launch week protocol

Day 0 (Sunday night): post in 2 university subreddits/Discords. Pin "founder here, answering all questions" comment.
Day 1 (Monday): drop flyers at 3 dorm common rooms in the morning. Email the CS listserv.
Day 2–4: respond to every single comment, DM, and feedback submission within 4 hours. Personally message new sign-ups. This does not scale; that's fine.
Day 5: tally. If <30 sign-ups, do a second wave with adjusted messaging. If 30+, hold and observe retention through Day 14.

### Content calendar (seasonal campaigns)

- **August (move-in):** "Furnish your dorm for under $100" — curated listings.
- **October–November:** "Mid-semester refresh" — textbook trades, swap days.
- **December:** "DormDeals Wrapped" recap + holiday gift listings + dorm-decor.
- **April–May (move-out):** **biggest seller of the year.** Move-out marketplace + "free pile" surge. Email every active user the week before finals end.
- **August next year:** repeat the move-in wave with social proof + referral push.

### Referral mechanics

- New user enters a code OR follows a referral link.
- After referee completes .edu verification AND first listing, both parties get the "verified inviter" + "founding member" badges.
- Track in `users.referredBy` and a `referrals` collection for analytics.
- Future: graduate to tangible rewards (free featured listing) once monetization exists.

### Owned-channel inventory

- **Email list:** start collecting at signup. Goal by Month 6: 200 verified emails. Use for digest, re-engagement, seasonal campaigns.
- **Push subscriber list:** opt-in after first transaction. Goal: 50% of WAU.
- **Social:** keep a single university-specific IG with weekly featured listings. Outsource posting once you have an ambassador.

---

## Trust & Safety Framework

A campus marketplace is fundamentally a trust system. Bad first impressions kill it. This section operationalizes the principles.

### Trust signals, layered

1. **Identity:** verified .edu email (M2) → optional phone (P2) → optional student ID (P2)
2. **Reputation:** rating average + review count, displayed on every listing
3. **Activity:** member-since date, listings completed, response time
4. **Badges:** founding member, top-rated, verified inviter, seller-tier (bronze/silver/gold)
5. **Behavior:** no warnings ladder visible publicly, but visible internally to admins

### Risk signals, monitored

- New account creating high-value (>$100) listing within 24h
- Same image appearing on multiple accounts (perceptual hash; Phase 2)
- Rapid messaging burst from one user to many recipients (spam)
- Listing edited to change price >50% after favorites accumulate (bait & switch)
- Multiple reports against same user within a week

### Enforcement ladder

| Action | Trigger | Effect | Reversible? |
|---|---|---|---|
| Soft warning | First report, low-severity | In-app banner, no functional impact | Auto-clears in 30d |
| Listing hide | Confirmed violation | Listing not shown publicly | Yes, admin can restore |
| Account warn | Second offense | Email + in-app warning, must acknowledge | Yes |
| 7-day suspension | Third offense or moderate violation | Cannot list/message; can browse | Auto-expires |
| Permanent ban | Severe violation (harassment, scam) | Account disabled, listings removed | Appeal via email |
| Hard ban | Severe + repeated | Email blocked from re-signup; flag IP for review | Manual review only |

Every action lands in `auditLog` collection with `{ adminId, targetType, targetId, action, reason, timestamp, prevState }`. Never delete from audit log.

### Designated safe-meetup locations

Per campus, maintain a `campusMeta/{campusId}.meetupSpots: []` array — campus security building, library main entrance, dining commons, etc. Surface on listing detail page: *"Meet safely at: [Edith Garland Dupré Library]"*. Cheap feature, large trust delta.

---

## Prohibited Items & Content Policy

Write this once, enforce automatically + manually. Add to ToS.

**Always prohibited:**
- Alcohol, tobacco, vapes, cannabis, drugs of any kind
- Firearms, ammunition, knives, weapons
- Prescription medication or supplements
- Live animals
- Counterfeit goods or knockoffs
- Stolen property
- Adult content / sexual services
- Academic dishonesty (test answers, completed assignments, ghostwriting)
- Hazing services or anything related to a specific student org's private content
- Government IDs, university IDs, parking permits
- Tickets for events that explicitly prohibit resale
- Recordings of lectures or copyrighted academic content

**Restricted (require disclosures or specific category):**
- Subleases (must follow housing rules, off-platform contract required)
- Services involving labor (tutoring is fine; "writing my essay" is not)
- Electronics older than 10 years or non-functional (must disclose)
- Food (only sealed, packaged, non-perishable; no homemade)

**Allowed (encouraged):**
- Textbooks, study guides (used, owned), school supplies
- Dorm furniture, decor, electronics, appliances
- Apparel, sports equipment, bikes, scooters
- Sports / concert tickets that allow resale
- Tutoring, photography, hairstyling, rides (services category)
- Free pile (moving out, no longer needed)

**Enforcement mechanism:**
- Banned-phrase regex on title + description (e.g., `\b(adderall|xanax|nudes|exam answer)\b/i`)
- Auto-flag for admin queue rather than auto-reject — false positives are common
- Category-level constraints (e.g., "Services" requires description >50 chars)
- Image SafeSearch on upload (Cloud Vision); reject explicit, flag suspicious
- User can appeal any takedown via the existing report system in reverse

---

## Campus Partnerships (Phase 2 onward)

Not Month 1–6 work, but worth knowing what you're building toward. Keep these in mind so today's data model doesn't preclude them.

### Tier 1: student organizations
- Sponsored category page ("Engineering Society resale corner")
- Partnership donation: % of featured-listing revenue donated to club
- Cost: a few hours per org to onboard. Yield: 30–100 motivated users each.

### Tier 2: campus services
- Residence Life ("official move-out resale partner")
- Sustainability office ("reduce dorm waste, reuse instead of trash")
- Student government endorsement
- Cost: weeks of meetings. Yield: legitimacy, listserv access, possibly co-marketing budget.

### Tier 3: university itself
- Official campus marketplace contract (white label?)
- Data licensing (anonymized: what students buy/sell, sustainability metrics)
- IT/Procurement involvement = long sales cycle (6–18 months)

**Posture:** don't pitch Tier 3 until you have signal at Tier 1 + 2. Tier 1 is achievable post-launch as a solo dev.

---

## Current State (Decision-Oriented Summary)

| Area | State | Action this roadmap takes |
|---|---|---|
| Auth (email/password) | ✅ Works | Add .edu verification on top (Month 2) |
| Listing CRUD + image upload | ✅ Works | Consolidate duplicate services (Month 1) |
| Browse/search | ✅ Works (client-side text search) | Defer Algolia; add basic relevance & pagination (Month 4) |
| Cart | ✅ Works | Repurpose as "Saved for Checkout" → meetup intent (Month 4) |
| Favorites | ✅ Works | Pick one service, delete the other (Month 1) |
| Admin tools | ✅ Works | Wire to moderation queue (Month 2) |
| Checkout | ❌ Fake (2s setTimeout) | **Delete**. Replace with meetup coordination (Month 4) |
| Messaging | ❌ Mock data | Rebuild on Firestore with real-time listeners (Month 3) |
| Ratings/reviews | ❌ Missing | Build post-transaction (Month 2) |
| .edu verification | ❌ Missing | Build (Month 2) |
| Firestore rules | ⚠️ Listings/cart/favs only — no `/users` rule | Harden (Month 1) |
| Dead code (api.ts, apiService.ts, duplicates) | ⚠️ Present | Delete (Month 1) |
| CI/CD | ⚠️ No test stage | Add test gate (Month 1) |
| Mobile | ✅ Responsive | Add PWA + push (Month 3) |

---

## The 6-Month Plan

Each month follows the same template: **Theme · Goals · Concrete Tasks · Exit Criteria · Risks · Stretch**.

Cadence assumption: **8–12 hrs/week**, ~40 hrs/month of focused work. If a month is light (finals, work crunch), drop stretch items first, then non-blocking goals.

---

### Month 1 — Foundation Cleanup (2026-05 → 2026-06)

**Theme:** Make the codebase a place you actually want to work in for the next 5 months. No new features.

**Why first:** Every gap below either (a) blocks a Month 2+ task or (b) slows every future change. Pay the debt now while you still have momentum from the school project.

**Goals**
- Eliminate duplicate services & dead code.
- Harden Firestore rules (close the `/users` collection gap).
- Move stray root-level files to where they belong.
- Get tests running in CI and gating merges.
- Wire up Sentry (free tier) and PostHog or Firebase Analytics.

**Concrete tasks**

1. **Service consolidation** *(critical)*
   - Pick one canonical service per resource:
     - **Listings:** keep [src/services/listingService.ts](src/services/listingService.ts) (it owns image upload). Migrate any reads in [src/services/listingsService.ts](src/services/listingsService.ts) into it, then delete the old file.
     - **Favorites:** pick the subcollection variant ([src/services/favoriteService.ts](src/services/favoriteService.ts)) because Firestore rules already cover `users/{uid}/favorites/{listingId}`. Migrate any callers of `favoritesService.ts`, then delete.
   - Delete [src/services/api.ts](src/services/api.ts) and [src/services/apiService.ts](src/services/apiService.ts) — unused. Investigate [src/services/commerceService.ts](src/services/commerceService.ts); delete if unused.
   - Run `npm run type-check` and `npm run lint` to confirm no broken imports.

2. **Root-level cleanup**
   - Move [ResultsPage.tsx](ResultsPage.tsx) → `src/pages/` (or delete if it's a duplicate of `Marketplace.tsx`).
   - Delete `blank-check.png` (810 KB), the stray `concurrently` / `nodemon` / `dormdeals@1.0.0` files (these are botched npm install artifacts).
   - Investigate root [index.ts](index.ts) and [index.js](index.js); document or delete.

3. **Firestore rules hardening** — see [firestore.rules](firestore.rules):
   - Add `match /users/{uid}` allowing read-self, write-self, and public-read of a *whitelisted* subset (displayName, school, rating) — split into a `publicProfile` subdoc if needed.
   - Add `request.resource.data.keys().hasOnly([...])` on listing create to prevent field injection.
   - Add `request.time` check vs. `createdAt` to mitigate timestamp spoofing.
   - Add stub rules for upcoming collections (`reviews`, `conversations`, `reports`) — start with `allow read, write: if false;` so you can't forget later.

4. **CI test gate** — edit [.gitlab-ci.yml](.gitlab-ci.yml):
   - Add a `test` stage between `build` and `deploy` running `npm test` (Vitest) and `npm run test:e2e` (Playwright, headless, against Firebase emulator).
   - Make it `allow_failure: false` for unit; allow E2E to be `allow_failure: true` for one month while you stabilize.

5. **Observability (one-time setup)**
   - Sentry React SDK with `VITE_SENTRY_DSN` env var (free tier: 5k events/mo). Wrap `<App>` in `<ErrorBoundary>`.
   - Add Firebase Analytics with 4–5 named events: `listing_view`, `listing_create`, `search`, `signup_complete`, `cart_add`. (PostHog optional alternative if you want session replay; free up to 1M events/mo.)

6. **`.env.example` scrub** — remove the real UID currently in `VITE_VALIDATE_ONLY_ALLOWLIST`.

**Exit criteria**
- One service per resource. `grep -r "listingsService\|favoritesService\|apiService" src` returns zero matches.
- `firestore.rules` covers users/listings/cart/favorites/reviews/conversations/reports.
- CI runs unit tests on every push, blocks merge on failure.
- Sentry receives a test exception from production.
- Repo root contains no stray files — only the listed top-level configs and docs.

**Risks**
- Service migration breaks reads. Mitigation: do it on a branch with feature-flag fallback to old service; manual smoke test before merging.
- E2E in CI flakes against Firebase emulator. Mitigation: emulator + seeded test data, retry-once policy.

7. **Cost & instrumentation hygiene**
   - Set Firebase budget alerts at $5 / $10 / $20 / $50 / $100 (each one notifies you earlier than you'd think).
   - Document current reads/writes per page in a `docs/firestore_costs.md` baseline so you have a "before" measurement.
   - Add a `costDashboard` page (admin-only) showing yesterday's reads/writes/storage from Firebase's monitoring API. Even a static "you spent $X yesterday" line is enough.
   - Set up Firestore daily export to Cloud Storage (free, runs nightly via Cloud Scheduler).

8. **Indexes audit**
   - Open Firebase console → Firestore → Indexes. List every composite index currently defined.
   - Verify each is still used by a query in code. Delete unused indexes (they cost write amplification).
   - Pre-create indexes for the queries Month 4 will add (status + sort, status + category + sort, conversations + lastMessageAt).

9. **Type system unification**
   - Audit [src/types/index.ts](src/types/index.ts) and [src/types/user.ts](src/types/user.ts) for `Item` vs `Listing` mismatch. Pick one canonical name.
   - Add `as const` on enum literals; tighten any `any`/`unknown` you find in services.

10. **`useCommerce` / `useAccessControl` hooks audit**
    - Two custom hooks exist. Verify they're not duplicating context functionality. Consolidate.

**Exit criteria**
- One service per resource. `grep -r "listingsService\|favoritesService\|apiService" src` returns zero matches.
- `firestore.rules` covers users/listings/cart/favorites/reviews/conversations/reports/transactions/reports/auditLog/campusMeta with at least reject-by-default stubs for the unbuilt ones.
- CI runs unit tests on every push, blocks merge on failure. E2E runs in `allow_failure: true` mode.
- Sentry receives a test exception from production.
- Repo root contains no stray files — only the listed top-level configs and docs.
- Budget alerts configured; cost baseline measurement documented.
- Composite indexes audited; pre-built for Month 4 needs.

**Risks**
- Service migration breaks reads. Mitigation: do it on a branch with feature-flag fallback to old service; manual smoke test before merging.
- E2E in CI flakes against Firebase emulator. Mitigation: emulator + seeded test data, retry-once policy.
- Index pre-creation requires writing the future query first as a stub. Mitigation: temporary throwaway query just for the index; delete after merge.

**Stretch**
- Add Prettier + a single-source formatter config to remove style drift between you and the original team.
- Convert `cartService` cart docs to use array-of-IDs in a single user doc instead of subcollection — reduces reads on cart load 10x.
- Set up renovate or dependabot for monthly dep updates (low priority but pays compounding dividends).

---

### Month 2 — Trust Layer (2026-06 → 2026-07)

**Theme:** Make DormDeals trustworthy. Anyone can sign up today with `aol.com` — that's a dealbreaker for a campus product.

**Goals**
- `.edu` email verification gates listing creation and messaging.
- Reviews/ratings after meetups.
- User reporting + admin moderation queue.

**Concrete tasks**

1. **.edu verification**
   - Firebase Auth supports `sendSignInLinkToEmail` — use email-link verification on top of the existing email/password flow:
     - On signup, store `emailVerified: false` and `schoolDomain: <derived>` in the user doc.
     - Block listing creation and outbound messages until verified (UI + Firestore rule).
   - Maintain an `allowedDomains` Firestore collection (`{ domain: "louisiana.edu", schoolName: "UL Lafayette", active: true }`) so you can expand to new campuses without redeploying.
   - Update [src/utils/accessControl.ts](src/utils/accessControl.ts) with `canCreateListing(user)` / `canMessage(user)` helpers.
   - **Edge cases to handle:** community college subdomains, name@cs.school.edu, transfer students whose old domain is deactivated.

2. **Ratings/reviews**
   - New Firestore subcollection: `listings/{listingId}/reviews/{reviewId}` and aggregate `users/{uid}.ratingAvg` + `ratingCount`.
   - Rule: only users with a *completed* transaction (status flips to `sold`) can review. Defer the transaction state machine to Month 4 — for Month 2, allow reviews if cart item was checked-out historically; refine later.
   - 1–5 star + optional text + thumbs-up "helpful" counter.
   - Display on listing detail and seller profile.

3. **Reporting & moderation queue**
   - New collection: `reports/{reportId}` with `{ targetType: 'listing'|'user', targetId, reporterId, reason, status, createdAt }`.
   - Add "Report" button on listing detail and user profile.
   - Build a moderation page in [src/pages/Profile.tsx](src/pages/Profile.tsx)'s admin tab (it already exists per audit) showing open reports, with one-click actions (hide listing, warn user, ban user — `adminService` functions already exist).

4. **Server-side admin check**
   - Current admin gating is client-side via [src/hooks/useAccessControl.ts](src/hooks/useAccessControl.ts). Add a Firestore-rules-level check: store `admin: true` flag in user doc, reference it in rules via `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.admin == true` for admin-only operations.

**Exit criteria**
- Unverified user cannot create a listing or send a message — verified in browser + by attempted Firestore writes.
- Test review flow works: buyer marks "received" → can leave review → average updates.
- Filing a report appears in admin queue; admin action removes listing.
- Pen-test yourself: try to escalate to admin via client. It should fail at the rules layer.

**Risks**
- Verification email links land in spam. Mitigation: configure Firebase Auth custom sender domain with SPF/DKIM; provide manual re-send.
- Review brigading. Mitigation: rate-limit reviews to 1 per user-listing pair via rule + client check.

5. **Prohibited-items policy + auto-flag**
   - Write the policy doc to `docs/POLICIES.md` mirroring the "Prohibited Items & Content Policy" section above.
   - Implement a banned-phrase regex check on listing create/update. Hits go to `flaggedListings` collection rather than blocking publish — false positives are common.
   - Link policy in CreateListing UI ("By posting, you agree to our [item policy](docs/POLICIES.md)").

6. **Image safety scan**
   - On upload to Storage, trigger Cloud Function calling Cloud Vision SafeSearch.
   - If `adult` or `violence` score = `VERY_LIKELY`, soft-reject (mark listing as flagged + invisible until admin reviews).
   - Cost guard: cap to 1 scan per listing per day; reuse cached result on edits.

7. **Account warning ladder**
   - Schema: `users.{uid}.warnings: [{ reason, byAdmin, at, severity }]`.
   - Admin action UI: warn / suspend 7d / ban with required `reason` field.
   - Suspended user can still log in (to see why) but cannot list/message.
   - Automatic state machine: 3 active warnings → 7-day suspension; 2 suspensions → permanent ban (admin can override).

8. **Audit log**
   - New collection: `auditLog/{logId}` with `{ adminId, action, targetType, targetId, prevState, newState, reason, at }`.
   - Append-only via security rules (allow create, never update/delete).
   - Admin profile page surfaces "last 50 actions you took" — accountability for future-you.

9. **Avatar upload + public profile**
   - Profile photo upload to Firebase Storage (`avatars/{uid}/{timestamp}.jpg`).
   - Public profile page `/u/{uid}` showing displayName, school, member-since, rating, active listings count, badges.
   - Linked from every listing detail (seller's avatar+name → public profile).

10. **Founding member tracking**
    - On signup, if `users` count < 100, set `users.{uid}.foundingMember: true` and `members` counter increments.
    - Founding badge displays on public profile and reviews. Marketing gold for launch.

11. **Designated safe-meetup spots (data model only)**
    - Add `campusMeta/{campusId}.meetupSpots: [{ name, address, hours, mapUrl }]`.
    - Seed with 3–4 spots for your home campus.
    - Display on listing detail in a "Where to meet" section (passive — not enforced yet).

**Exit criteria**
- Unverified user cannot create a listing or send a message — verified in browser + by attempted Firestore writes.
- Test review flow works: buyer marks "received" → can leave review → average updates.
- Filing a report appears in admin queue; admin action removes listing AND adds an `auditLog` entry.
- Pen-test yourself: try to escalate to admin via client. It should fail at the rules layer.
- Prohibited-phrase regex catches a test listing with "vape" in title.
- Image SafeSearch test: upload an obviously non-allowed image; it's flagged.
- Public profile renders correctly; founding member badge appears for first 100 sign-ups.

**Risks**
- Verification email links land in spam. Mitigation: configure Firebase Auth custom sender domain with SPF/DKIM; provide manual re-send.
- Review brigading. Mitigation: rate-limit reviews to 1 per user-listing pair via rule + client check.
- Cloud Vision is on the Blaze plan only. Mitigation: budget alert at $5 catches a runaway scanner; can disable extension instantly.
- Banned-phrase regex hits legitimate listings (e.g., "weight loss tea" matches a substance pattern). Mitigation: flag, don't block; admin reviews.

**Stretch**
- Email notification when a report is filed (Firebase Cloud Function trigger to send via Resend or SendGrid free tier — *only* if you want to take on one dependency).
- Seller-tier badges (bronze: 1+ sale, silver: 5+, gold: 25+) — pure derived data, costs nothing.
- "Block this user" feature with `users/{uid}/blocks/{blockedUid}` subcollection; messages from blocked users hidden.

---

### Month 3 — Real Messaging + PWA (2026-07 → 2026-08)

**Theme:** Replace the messaging mock with a real-time system. Make the site installable.

**Goals**
- Working buyer-seller chat with Firestore listeners and unread badges.
- Web Push notifications via FCM.
- PWA install prompt on mobile.

**Concrete tasks**

1. **Messaging backend (Firestore design)**
   - Collections:
     - `conversations/{conversationId}`: `{ participantIds: [uid1, uid2], listingId, lastMessageAt, lastMessagePreview, unreadCounts: { uid1: 0, uid2: 3 } }`
     - `conversations/{conversationId}/messages/{messageId}`: `{ senderId, body, type: 'text'|'image', createdAt, readBy: [uid] }`
   - `conversationId` = deterministic hash of `sorted(uid1, uid2, listingId)` so opening a conversation twice doesn't duplicate.
   - Listener: `onSnapshot` on user's conversations sorted by `lastMessageAt`.
   - Rules: only participants can read; only sender can write a message; updates to `unreadCounts` allowed for any participant.

2. **Rewrite MessagePage**
   - Delete the hardcoded mocks at [src/pages/MessagePage.tsx](src/pages/MessagePage.tsx) lines ~22-100.
   - Two-pane UI: conversation list + message thread. You already have the layout; just rewire the data.
   - Image attachments use the same Firebase Storage pattern as listings (`conversations/{convoId}/{messageId}/{filename}`).
   - "Block user" and "Report conversation" buttons feed into Month 2's moderation queue.

3. **Push notifications (FCM)**
   - Register service worker (`firebase-messaging-sw.js` at public root).
   - Request notification permission after first successful sign-in (don't ask on first visit — kills conversion).
   - Send a push when `unreadCounts[recipient]` increments. Two implementation paths:
     - **A (no backend):** Skip server push, do in-app toast only when tab is open. Cheap but no real notifications.
     - **B (Cloud Function):** Firestore trigger on new message → `admin.messaging().send(...)`. **Pick this** — it's the only Cloud Function in the whole roadmap and it's worth it.

4. **PWA**
   - Add `manifest.webmanifest` with icons (192, 512), theme color, display: standalone.
   - Service worker: cache app shell + listing thumbnails (use Workbox via `vite-plugin-pwa`).
   - "Add to Home Screen" prompt after 2nd visit.

**Exit criteria**
- Two test accounts can have a real-time conversation; unread badge updates within 1s.
- Installing the PWA on iOS Safari + Android Chrome works.
- Push notification fires on new message while app is closed (Android Chrome — iOS web push has known limitations).
- Lighthouse PWA score ≥ 90.

**Risks**
- Firestore listener cost on busy users. Mitigation: paginate to 20 most recent conversations; load older on scroll.
- iOS Safari web push is finicky (only iOS 16.4+). Document this; don't promise iOS push in marketing.

5. **In-app notification center**
   - New collection: `users/{uid}/notifications/{notifId}` with `{ type, body, link, read, createdAt }`.
   - Bell icon in navbar with unread count.
   - Types: `message_received`, `listing_favorited`, `listing_sold` (when reservation moves to sold; placeholder for Month 4), `review_received`, `report_resolved`, `system_announcement`.
   - Mark-all-read button.

6. **Notification preferences**
   - Settings page section with per-channel × per-type matrix (push / email / in-app for each type).
   - Stored as `users.{uid}.notificationPrefs: { type: { push, email, inApp } }`.
   - Honored before sending: skip if user opted out.

7. **Quiet hours**
   - Per-user `quietHours: { start: '23:00', end: '08:00', timezone }`.
   - Cloud Function checks local time before push; queues delayed delivery (write to `pendingPushes` with `sendAfter`).

8. **Canned reply templates**
   - Top of message input: chips like "Is this still available?", "Can I see more pics?", "Where can we meet?", "Will you take $X?".
   - Configurable per-user later (Phase 2).

9. **Meetup spot picker in messages**
   - In a conversation, "Suggest meetup" button → opens picker from `campusMeta.meetupSpots`.
   - Inserts a structured message that renders as a map card with directions link.

10. **Native share + camera-direct listing (groundwork)**
    - Add `navigator.share()` to listing detail "Share" button.
    - On listing creation: `<input type="file" accept="image/*" capture="environment">` to open camera directly on mobile.

11. **iOS Safari quirks**
    - Test push notification permission flow on iOS 16.4+ (web push limitations).
    - Add "Add to Home Screen" inline guide for iOS users since they need explicit instructions.
    - Document known limitations in `docs/MOBILE.md`.

**Exit criteria**
- Two test accounts can have a real-time conversation; unread badge updates within 1s.
- Installing the PWA on iOS Safari + Android Chrome works.
- Push notification fires on new message while app is closed (Android Chrome).
- Lighthouse PWA score ≥ 90.
- Notification preferences page lets a user fully opt out of all push/email except security-critical (e.g., account warnings).
- Quiet hours prevent a test push from firing at 2 AM local time.
- Camera-direct upload works on Android Chrome + iOS Safari.

**Risks**
- Firestore listener cost on busy users. Mitigation: paginate to 20 most recent conversations; load older on scroll.
- iOS Safari web push is finicky (only iOS 16.4+). Document this; don't promise iOS push in marketing.
- FCM service worker collisions with the PWA service worker — must be registered correctly. Mitigation: use Firebase's recommended dual-SW setup pattern.
- Quiet-hours queue grows unbounded if Function fails. Mitigation: TTL of 24h on queued pushes.

**Stretch**
- Typing indicators (presence). Costly in reads — only if Month 3 finishes early.
- Voice messages via MediaRecorder API (max 30s, stored as audio/webm in Storage).
- Read receipts: `messages.{id}.readBy: [uid]` array; UI shows "Seen" under last message.
- Conversation search across all messages for a user (client-side filter is fine at small scale).

---

### Month 4 — Transaction Lifecycle (No Stripe) (2026-08 → 2026-09)

**Theme:** Kill the fake checkout. Replace it with a coordination flow that matches how students *actually* trade — meet on campus, pay cash or Venmo, mark it done.

**Goals**
- Listing status machine: `active → reserved → sold` with both parties confirming.
- "Request Pickup" flow that creates a conversation + reservation.
- Buyer/seller transaction history on the profile.
- Basic pagination + sorting on the marketplace.

**Concrete tasks**

1. **Delete the fake checkout**
   - Remove the credit card form and fake `setTimeout` in [src/pages/Checkout.tsx](src/pages/Checkout.tsx). Keep the route, repurpose to a "Pickup Confirmation" page or redirect.
   - Cart concept stays — rename to "Shortlist" or "Saved Items" so the mental model is "things I'm interested in" rather than "things I'm about to buy."

2. **Reservation flow**
   - New action on listing detail: **"Request to Buy"** → creates a `transactions/{txId}` doc with `{ listingId, buyerId, sellerId, status: 'requested', requestedAt }`.
   - Seller sees in their inbox/profile; can `accept` (status → `reserved`, listing.status → `reserved`) or `decline`.
   - When both parties tap "Mark Completed" (or seller marks + buyer doesn't dispute within 7 days), status → `sold` and listing comes off the marketplace.
   - Reviews from Month 2 unlock at `sold`.

3. **Payment hint (intentionally minimal)**
   - Listing detail shows a "Preferred payment" field the seller sets: Cash / Venmo / Cash App / Zelle.
   - If Venmo: open a `venmo://paycharge?...` deep link with prefilled amount. **No money flows through DormDeals.** This is the entire "payment" surface for now.

4. **Pagination**
   - Marketplace currently fetches all active listings. Switch to `limit(24)` + cursor-based pagination using `startAfter(lastDoc)`.
   - Add a "Sort by" dropdown: Newest, Price asc/desc, Best rated seller.

5. **Search improvements (still no Algolia)**
   - Add Firestore composite indexes for the new sorts (`status==active + sortField`).
   - Client-side text search stays for now — document that it only matches loaded results.

**Exit criteria**
- Cannot reach a credit-card form anywhere in the app.
- Two test accounts complete a full flow: list → request → accept → mark sold → review.
- Marketplace pages load 24 listings in <500ms (Firebase emulator + prod).
- Sold listings disappear from default marketplace view but remain on seller profile.

**Risks**
- Users won't actually "mark completed" — listings get stuck reserved forever. Mitigation: auto-expire reservations after 14 days; nudge email at day 7.
- Venmo/Cash App ToS issues with marketplace use. Mitigation: you're not processing payments, you're displaying a deep link. Document this in your ToS.

6. **Listing analytics for sellers**
   - Counters on listing doc: `viewCount`, `favoriteCount`, `messageCount` (debounced increments via Cloud Function or batched in client).
   - Seller's listing card shows mini-stats: "👁 142 · ❤ 11 · 💬 4".
   - Aggregate analytics page on seller profile: total views, top listing, average time-to-sell.

7. **Free-pile / $0 listings**
   - Treat `price: 0` as a first-class state, not a bug.
   - Separate "Free Pile" tab in marketplace.
   - Listing card visually distinct ("Free" instead of price).
   - Around move-out weeks (Apr–May), surface free-pile listings prominently on the homepage.

8. **Listing tags**
   - Optional multi-select chips on listing creation: `move-out`, `new-with-tags`, `vintage`, `gift`, `negotiable`, `pickup-only`.
   - Filterable in marketplace.
   - Auto-tag: listings created in last 7 days of a semester get `move-out` automatically.

9. **Listing auto-expire + renew**
   - On create, set `expiresAt = createdAt + 30 days`.
   - Cloud Scheduler nightly: listings past `expiresAt` move to `status: 'expired'`.
   - Email + push to seller: "Your listing is expiring — renew?" 3 days prior and on expiry.
   - One-click renew bumps `expiresAt` and `updatedAt`.

10. **Listing edit history (lightweight)**
    - Track `priceHistory: [{ price, at }]` and `titleHistory: [{ title, at }]` to detect bait-and-switch.
    - If listing has been favorited and price increases >25% post-favorite, flag for admin.
    - Future buyers see "Price reduced from $X" if downward, increasing urgency.

11. **Seller-tier badge automation**
    - Compute `sellerTier: 'bronze' | 'silver' | 'gold'` from `completedSales` count: 1+, 5+, 25+.
    - Cached on user doc, recomputed on each completed sale.
    - Display next to seller name on listing detail.

12. **Quick re-list**
    - On sold/expired listing, a "List again" button clones the listing with fresh dates and `status: 'active'`.

**Exit criteria**
- Cannot reach a credit-card form anywhere in the app.
- Two test accounts complete a full flow: list → request → accept → mark sold → review.
- Marketplace pages load 24 listings in <500ms (Firebase emulator + prod).
- Sold listings disappear from default marketplace view but remain on seller profile.
- Listing analytics counters tick up correctly on view/favorite/message.
- Test listing auto-expires after manual date manipulation; renewal works.
- Seller tier upgrades from bronze to silver after 5 test sales.

**Risks**
- Users won't actually "mark completed" — listings get stuck reserved forever. Mitigation: auto-expire reservations after 14 days; nudge email at day 7.
- Venmo/Cash App ToS issues with marketplace use. Mitigation: you're not processing payments, you're displaying a deep link. Document this in your ToS.
- View counter inflation from bots / repeated views by same user. Mitigation: dedupe by `(listingId, uid OR ip)` within a 24h window via Cloud Function.
- Auto-expiry surprises users who don't see notification. Mitigation: 3-day-prior + on-expiry email; "grace period" of 7 days where listing is hidden but renewable.

**Stretch**
- Negotiation: buyer can offer a different price; seller accepts/counters. This is high-value if you can fit it. Store as structured messages with `type: 'offer'` so the conversation thread shows offer history.
- ISO ("In Search Of") inverse listings — buyer posts "Wanted: mini-fridge under $50, can pick up." Sellers can respond with matches.
- Bundle listings (sell N items together) — relevant for move-out.
- Bulk listing edit for power sellers (select multiple, mark all sold, etc.).

---

### Month 5 — Soft Launch to Your Campus (2026-09 → 2026-10)

**Theme:** Get real users. Everything before now has been infrastructure; this month is distribution.

**Goals**
- 100 sign-ups, 25 active listings, 3 completed transactions at one university.
- Public URL with onboarding optimized for first-time users.
- Tight feedback loop: in-app form + analytics dashboard you check weekly.

**Concrete tasks**

1. **Pre-launch hygiene**
   - SEO meta on listing detail pages: `<title>`, `<meta name="description">`, OpenGraph image (use first listing image). Use React Helmet or just `useEffect` to set document head.
   - Sitemap.xml + robots.txt (Render serves these statically).
   - Custom domain if you don't already have one (`dormdeals.app` or similar — $12/yr).
   - Privacy Policy + Terms of Service stubs. Required for FCM and for any future Stripe.
   - Run Lighthouse, fix top 5 perf issues. Target p95 LCP <2.5s.

2. **Onboarding**
   - New-user wizard after sign-up: verify .edu → set school + dorm/area → optional avatar → "Create your first listing" CTA.
   - Empty marketplace state: show curated/featured listings if user is in a campus with <10 listings.

3. **Seed data**
   - **Personally list 15–20 of your own items** before opening sign-ups. Empty marketplaces don't bootstrap.
   - Recruit 5–10 friends to list items in the week before launch. Pay them in pizza.
   - Make sure search returns relevant results across all major categories.

4. **Distribution plan (pick 2-3, not all)**
   - University subreddit + Discord servers (with mod approval where needed).
   - Flyers in dorm common rooms — QR code to a landing page with `?ref=flyer_<location>`.
   - Email your CS dept listserv.
   - Personal Instagram / friend group.
   - **Avoid:** paid ads (no ROI signal yet), TikTok content (huge time sink for solo dev).

5. **Feedback channel**
   - Floating "Send feedback" button → simple Firestore form.
   - You read everything; respond to first 50 users personally. This is unglamorous and load-bearing.

**Exit criteria**
- 100 sign-ups, 25 active listings, 3 sold transactions verified in your analytics dashboard.
- p95 LCP <2.5s on slow 4G.
- Zero P0 bugs reported in the last 7 days of the month.

**Risks**
- You get 5 sign-ups, not 100. This is the most likely failure mode for a solo dev launch. Mitigation: the *failure here is informative* — if no one signs up after a serious distribution push, that's the input to the Month 6 decision.
- Spam listings flood in. Mitigation: Month 2's moderation queue handles this; you may need to manually review for the first 2 weeks.
- One user has a bad meetup experience and trashes you in their group chat. Mitigation: you can't fully prevent this, but you can have the moderation tools to respond fast.

6. **ISBN lookup for textbooks**
   - Integrate Google Books API (free, no key needed for basic usage).
   - On textbook listing creation, ISBN input autofills title, author, edition, cover image.
   - Single biggest UX win for the most popular campus marketplace category.

7. **University-specific landing pages**
   - `/u/ull`, `/u/lsu` etc. with school branding (colors, mascot reference if licensed), local meetup spots, hero CTA "Join {schoolName} students already buying & selling on DormDeals".
   - Pulls active listings count + transactions count for the campus as social proof.
   - SEO-friendly: each is a real URL with unique meta, indexed by Google.

8. **Onboarding wizard (post-signup)**
   - Step 1: verify .edu email (already done in M2 — fold into wizard).
   - Step 2: pick school from allowlist + dorm/area.
   - Step 3: optional avatar.
   - Step 4: "Create your first listing" with a guided form (or skip).
   - Track completion in `users.{uid}.onboardingComplete` and surface re-engagement nudges if abandoned.

9. **Empty-state handling**
   - If marketplace has <10 listings for a school: show curated/featured listings from neighbor schools + "Be the first to list at {school}!" CTA.
   - If search returns 0 results: show top 5 alternative searches + "Create an ISO listing" prompt.

10. **Auto-generated OG share images**
    - Cloud Function `/og/listing/{id}` that renders a 1200×630 PNG with listing photo, title, price, seller rating, DormDeals branding.
    - Caches in Storage; expires when listing updates.
    - Hugely improves social shareability — every Instagram story / Discord link looks intentional.

11. **Referral codes with attribution**
    - Each user has `referralCode: <6-char>` derived from uid.
    - URL: `dormdeals.app/?ref=ABC123`. Cookie + localStorage stores ref for 30d.
    - On signup, set `users.{uid}.referredBy = <uid>`.
    - Both parties get "founding inviter" badge after referee completes verification + first listing.
    - Track in `referrals` collection for analytics.

12. **Email digest infrastructure**
    - Resend free tier (3k/mo) or `firebase-extensions/email-trigger`. Pick one, install.
    - Templates: weekly digest, listing-expiring nudge, abandoned-draft nudge, founding-member welcome.
    - Cron-driven from Cloud Scheduler; user can unsubscribe per type.

13. **Seasonal landing campaign (whichever season Month 5 falls in)**
    - August move-in: hero CTA "Furnish your dorm under $100" + curated list.
    - October mid-semester: "Trade textbooks before midterms."
    - April–May move-out: "Sell before you pack."
    - Prep templates ahead so future-you doesn't scramble.

14. **Distribution week (the actual launch)**
    - **Day 0 (Sun PM):** Reddit + Discord posts in 2 university communities.
    - **Day 1 (Mon AM):** flyers in 3 dorm common rooms; email CS listserv.
    - **Day 2–4:** respond to every comment / DM / feedback submission within 4 hours.
    - **Day 5:** tally; adjust messaging if <30 sign-ups.
    - **Day 14:** retention checkpoint. Did Week 1 users return?

15. **In-app feedback widget**
    - Floating "?" button → form: type (bug / suggestion / praise) + text + optional screenshot upload.
    - Posts to `feedback` collection; emails you instantly.
    - First 50 responders get a personal reply from you. Unglamorous, load-bearing.

**Exit criteria**
- 100 sign-ups, 25 active listings, 3 sold transactions verified in your analytics dashboard.
- p95 LCP <2.5s on slow 4G.
- Zero P0 bugs reported in the last 7 days of the month.
- Referral attribution working: signups via `?ref=` correctly populate `referredBy`.
- At least one OG share image renders correctly when pasted into iMessage, Instagram DM, Twitter, and Discord.
- ISBN lookup successfully autofills a real textbook.
- Lighthouse: Performance ≥85, Accessibility ≥90, Best Practices ≥90, SEO ≥95.

**Risks**
- You get 5 sign-ups, not 100. This is the most likely failure mode for a solo dev launch. Mitigation: the *failure here is informative* — if no one signs up after a serious distribution push, that's the input to the Month 6 decision.
- Spam listings flood in. Mitigation: Month 2's moderation queue handles this; you may need to manually review for the first 2 weeks.
- One user has a bad meetup experience and trashes you in their group chat. Mitigation: you can't fully prevent this, but you can have the moderation tools to respond fast.
- Email digest accidentally spams real users with a bug. Mitigation: send to yourself only for first 2 weeks; verify content + frequency before broadening.
- Resend rate-limits or your domain gets flagged. Mitigation: warm up the sending domain by sending small volumes first.

**Stretch**
- Referral feature: invite a verified friend → both get a "verified inviter" badge.
- "Trending now" homepage block — most-viewed listings in last 24h.
- Achievement badges (First Sale, 10 Sales, First Review) — cheap motivator.
- Year-end recap email teaser ("Your DormDeals 2026 wrap-up is coming soon!").

---

### Month 6 — Data, Decision, Direction (2026-10 → 2026-11)

**Theme:** What did you actually build, who used it, and what comes next? Decide based on signal, not feelings.

**Goals**
- Run 1–2 small monetization experiments.
- Make a clear go/pivot/wind-down decision with criteria you set *before* you look at the data.
- Document the project — for yourself, for portfolios, for any future contributor or acquirer.

**Concrete tasks**

1. **Set decision criteria up front (week 1 of Month 6)**
   Write these down *before* checking your launch numbers — otherwise you'll rationalize whatever you find:
   - **Scale signal:** ≥50 weekly active users by mid-month, ≥10 completed transactions in Month 5.
   - **Engagement signal:** Average user creates ≥1 listing OR sends ≥3 messages in their first 14 days.
   - **Monetization signal:** ≥5% of users click into a paid feature when shown.

2. **Monetization experiment (pick ONE)**
   - **A — Featured listings:** $2 to bump a listing for 7 days. Tests: do sellers value visibility? Use Stripe Checkout (one-time, no Connect needed → much simpler than marketplace payouts).
   - **B — Premium tier:** $3/mo for sellers — unlimited listings, badge, advanced analytics. Tests: do power sellers exist?
   - **C — Free verification, paid "trusted seller" badge:** $5 one-time for an extra-trust badge after N successful sales. Tests: do buyers value seller signals?
   - I'd lean toward **A** for fastest signal. Either way, only one experiment — don't dilute.

3. **Performance retrospective**
   - Firebase cost analysis: reads/writes per active user. Project at 10x and 100x scale.
   - Page-level analytics: which pages drive sign-up? Which kill it?
   - Cohort retention: do Week 1 users come back in Week 4?

4. **Documentation pass**
   - Update [README.md](README.md) to reflect post-school reality (you're the sole maintainer).
   - Archive [TESTING.md](TESTING.md), [TEST-RESULTS.md](TEST-RESULTS.md), [TESTING-PHASE3.md](TESTING-PHASE3.md) — these are school-deliverable artifacts.
   - Write a short "case study" markdown describing the project, the metrics, what worked. This is portfolio gold regardless of go/no-go.

5. **The decision**
   Three branches:
   - **Scale:** Hit signals. Plan Month 7+: second campus, possibly Algolia search, possibly Stripe Connect for in-app payments, possibly first hire/co-founder conversation.
   - **Niche pivot:** Engagement OK but generic marketplace doesn't differentiate. Pivot to your strongest category (likely textbooks or sublease based on data) with the existing infra.
   - **Wind down gracefully:** Few signals, but everything works. Keep it running on free tier as a portfolio piece. Spend your time on something with better economics. Not a failure — a $0 lifetime cost real-world product is a great resume line.

5. **Data export (GDPR/CCPA-friendly)**
   - User-facing "Download my data" button on settings.
   - Generates a ZIP with their profile, listings, messages (their own), reviews. Emails them a signed URL.
   - Implement before the first international student asks.

6. **Account deletion with grace period**
   - "Delete my account" → soft-delete (`users.{uid}.deletedAt`); listings hidden; messages anonymized to "Former user".
   - Hard purge after 30 days via Cloud Scheduler.
   - Email confirmation required to trigger.

7. **Re-engagement push for dormant users**
   - Cron: if a user hasn't logged in for 14d and has push enabled, send "New listings at {school} since you've been gone."
   - Honor frequency cap (max 1 re-engagement push every 7d).

8. **Abandoned-draft email**
   - If `status: 'draft'` listing untouched for 48h, email seller "Finish your listing — it takes 2 minutes."
   - Don't be annoying: max one nudge per draft.

9. **Year-end recap ("DormDeals Wrapped")**
   - Per-user year summary: items listed, items sold, money earned (estimated from listing prices), top category, badges earned.
   - Shareable image generated server-side.
   - Releases late December — drives organic acquisition for spring semester.

10. **Decision memo (the actual deliverable)**
    Write `DECISION_2026-11.md` containing:
    - Numerical results vs. pre-committed criteria.
    - One-paragraph narrative on what surprised you.
    - The decision (scale / niche-pivot / wind down).
    - Three concrete next steps regardless of branch.
    - A "what I would tell a fresh-start solo founder" paragraph.

**Exit criteria**
- One monetization experiment shipped, measured for ≥2 weeks.
- A short written go/pivot/wind-down memo on file (in this repo as `DECISION_2026-11.md`).
- README + case study updated.
- Data export + account deletion live and tested by you.
- At least one "DormDeals Wrapped" email rendered (even if only to your own account for testing).

**Risks**
- You change your decision criteria after seeing the data. Mitigation: commit them to git in week 1 of Month 6. Don't rewrite.
- Stripe integration eats the whole month if you let it. Mitigation: timebox the monetization experiment to 1 week of impl + 2 weeks of measurement. If it's not shippable in a week, simplify the experiment.
- Data-export ZIP becomes huge for power users; Cloud Function times out. Mitigation: cap to first 1000 messages; user can request full archive via support email.

---

## Cross-Cutting Concerns

### Infrastructure cost budget

| Service | Tier | Expected cost @ 100 users |
|---|---|---|
| Firebase (Auth, Firestore, Storage, Functions) | Spark → Blaze (only for Functions) | $0–$5 |
| Render web service | Free tier (spins down) → $7/mo if needed | $0–$7 |
| Custom domain | Cloudflare or Namecheap | ~$1/mo amortized |
| Sentry | Free tier | $0 |
| PostHog (optional) | Free up to 1M events | $0 |
| **Total target** | | **<$15/mo** |

Set Firebase budget alerts at $5, $10, $20. Quota-cap reads/writes on the Blaze plan.

### Dependency policy

You explicitly don't want new deps without approval. The roadmap proposes these additions — all justified:
- `react-helmet-async` (Month 5, SEO) — tiny, mature.
- `vite-plugin-pwa` (Month 3) — official Vite plugin, replaces a half-dozen manual files.
- `firebase-admin` + a Cloud Function runtime (Month 3) — only if you go with FCM push.
- `stripe` (Month 6, conditional) — only if you pick monetization Option A or B.

No Algolia, no SendGrid, no Auth0. Push back on any future suggestion to add them unless the metric clearly justifies it.

### What NOT to do

Recording these explicitly because they're the most common solo-dev traps:
1. **Don't rebuild the backend.** Firebase has gaps but they're not the bottleneck.
2. **Don't add Stripe in Month 1–5.** It's a multi-week side quest with regulatory complexity and you don't have demand yet.
3. **Don't chase native apps.** PWA covers 95% of the value for 5% of the work.
4. **Don't expand to a second campus before Month 6.** Concentration > spread for early traction.
5. **Don't over-test new code.** Tests for service consolidation: yes. Tests for every UI variant: no. The current test count is already inflated.
6. **Don't pitch universities yet.** The B2B sales cycle is incompatible with a 6-month solo timeline.
7. **Don't refactor while building features.** Month 1 is the only refactor month. After that, fix-in-place.

### Weekly cadence (suggested)

- **Mon (1h):** Plan the week — pick 1–2 tasks from the current month's list.
- **Wed/Thu (3–4h):** Heads-down build session.
- **Sat/Sun (2–3h):** Ship, test, push, write a one-sentence weekly log in your journal.
- **Every 4 weeks:** Re-read this roadmap, mark what slipped, adjust next month.

---

---

## Phase 2: The Months 7–12 Horizon

Not committed work — but worth knowing what the runway looks like beyond Month 6 so today's data model doesn't paint you into a corner. The right Phase 2 depends entirely on the Month 6 decision; here's the shape of each branch.

### Branch A — Scale (you hit signal)

- **Second campus rollout (M7–M8)** — add 1–2 more universities to the `allowedDomains` collection. Distribution playbook re-runs.
- **Algolia or Typesense search (M7)** — drop in when client-side filter starts dropping results.
- **Stripe Connect Express marketplace payments (M8–M9)** — real in-app payments with payout to seller bank accounts. Big regulatory step. Requires terms-of-service review, 1099 considerations, KYC.
- **Native app shells (M9–M10)** — Capacitor wrapper around the PWA → iOS App Store + Google Play. Push notifications get better on iOS via APNS.
- **Hiring conversations (M10–M12)** — first contractor or co-founder if revenue supports it.

### Branch B — Niche pivot

- **Textbooks specialization** — deep integration with ISBN, course-catalog scraping, "this textbook for ENGL 101" search. Cleaner brand: "DormBooks" or similar.
- **Sublease/housing focus** — verified landlord/tenant identities, lease template, calendar-based availability. Different liability model.
- **Free-pile / sustainability angle** — "DormReuse" — partner with universities on waste reduction. Possible grant funding.

### Branch C — Wind down gracefully

- Keep app running on free tier as portfolio piece.
- Open-source the codebase with a clean README.
- Write a public retrospective post (good for personal brand).
- Optional: maintenance mode, redirect domain to a static "thanks for using DormDeals" page.

### Phase 2 feature ideas not in the catalog (so you remember them)

- **In-app calendar** integration for meetup scheduling (Google Cal, iCal).
- **"Pay-it-forward" gifts** — seller can mark a listing as a gift for the next student in their dorm.
- **Carbon savings tracker** — "By buying used, this campus saved X kg CO₂." Sustainability narrative is powerful for university partnerships.
- **Student org integration** — orgs can have a "club marketplace" for member-only items, fundraisers.
- **Embedded "campus pulse"** — what's trending across all listings (price index of used textbooks, dorm furniture demand cycles).
- **Move-out service marketplace** — paid storage, shipping, donation pickup. Separate vertical.
- **Verified roommate finder** with mutual-match (Tinder-style swipe) — different product, shared trust infra.
- **API access** for third parties (university IT, sustainability dashboards).
- **Multi-language** — Spanish first for many U.S. campuses.
- **Accessibility audit** with explicit WCAG AA certification.

---

## Appendix C — Data Model Evolution

The Firestore schema across the 6 months. Each month, *add* collections; rarely *remove*. Use this to pre-plan indexes and rules.

### Baseline (post-Month 1 cleanup)

```
users/{uid}
  email, displayName, school, schoolDomain, year, dorm?, avatarUrl?
  ratingAvg: number, ratingCount: number
  createdAt, lastSeenAt
  admin: bool, banned: bool

listings/{listingId}
  ownerId, title, description, price, category, condition
  imageUrls: string[]
  status: 'active' | 'draft' | 'reserved' | 'sold' | 'expired' | 'flagged'
  createdAt, updatedAt, expiresAt
  isFeatured: bool

users/{uid}/cart/{itemId}
  listingId, addedAt

users/{uid}/favorites/{listingId}
  addedAt
```

### After Month 2

```
+ allowedDomains/{domain}
    schoolName, active

+ users/{uid}.emailVerified, .phoneVerified?, .warnings: [...]
+ users/{uid}.foundingMember: bool, .sellerTier: 'bronze'|'silver'|'gold'
+ users/{uid}/blocks/{blockedUid}

+ listings/{listingId}/reviews/{reviewId}
    reviewerId, rating, body, helpfulCount, createdAt

+ reports/{reportId}
    reporterId, targetType, targetId, reason, status, createdAt, resolvedBy?, resolvedAt?

+ auditLog/{logId}
    adminId, action, targetType, targetId, prevState, newState, reason, at

+ flaggedListings/{listingId}
    flaggedBy: 'system'|'admin'|'user', reason, at

+ campusMeta/{campusId}
    meetupSpots: [{ name, address, hours, mapUrl }]
```

### After Month 3

```
+ conversations/{conversationId}
    participantIds: [uid1, uid2], listingId
    lastMessageAt, lastMessagePreview
    unreadCounts: { uid1: 0, uid2: 3 }

+ conversations/{conversationId}/messages/{messageId}
    senderId, body, type: 'text'|'image'|'offer'|'meetup', createdAt
    readBy: [uid]
    attachmentUrl?

+ users/{uid}/notifications/{notifId}
    type, body, link, read, createdAt

+ users/{uid}.notificationPrefs: { type: { push, email, inApp } }
+ users/{uid}.quietHours: { start, end, timezone }
+ users/{uid}.pushTokens: [token]

+ pendingPushes/{pushId}
    uid, payload, sendAfter
```

### After Month 4

```
+ transactions/{txId}
    listingId, buyerId, sellerId
    status: 'requested'|'reserved'|'sold'|'declined'|'expired'
    requestedAt, reservedAt?, soldAt?, completedAt?
    preferredPayment: 'cash'|'venmo'|'cashapp'|'zelle'

+ listings/{listingId}.viewCount, .favoriteCount, .messageCount
+ listings/{listingId}.priceHistory: [{ price, at }]
+ listings/{listingId}.tags: string[]
+ listings/{listingId}.expiresAt: timestamp
```

### After Month 5

```
+ referrals/{referralId}
    referrerUid, refereeUid, status, createdAt, completedAt?

+ feedback/{feedbackId}
    uid?, type, body, screenshotUrl?, createdAt, resolved: bool

+ users/{uid}.referralCode, .referredBy?
+ users/{uid}.onboardingComplete: bool

+ savedSearches/{searchId} (Phase 2)
```

### After Month 6

```
+ featuredPurchases/{purchaseId}    (if Stripe experiment ships)
    uid, listingId, amount, stripeSessionId, status, createdAt, expiresAt

+ users/{uid}.deletedAt?  (soft-delete grace period)
+ users/{uid}.dataExportRequestedAt?

+ systemMetrics/daily/{YYYYMMDD}
    dau, newSignups, newListings, completedSales, totalRevenue
    (snapshot table for fast dashboard reads)
```

### Indexing strategy

Pre-create composite indexes so the first query doesn't need a Firebase-console round-trip:

- `listings`: `(status, createdAt desc)`, `(status, price asc)`, `(status, category, createdAt desc)`, `(ownerId, status, createdAt desc)`, `(status, isFeatured desc, createdAt desc)`
- `conversations`: `(participantIds array-contains, lastMessageAt desc)`
- `reports`: `(status, createdAt desc)`, `(targetType, targetId)`
- `transactions`: `(buyerId, status)`, `(sellerId, status)`
- `users/{uid}/notifications`: `(read, createdAt desc)`

---

## Appendix D — Metrics & Instrumentation

Build the dashboard once; check it weekly.

### Event taxonomy (fire from client + server)

| Event | When | Properties |
|---|---|---|
| `signup_start` | Email entered on /register | `referralCode?`, `schoolDomain?` |
| `signup_complete` | Account created | `uid`, `foundingMember` |
| `verify_email_sent` | Verification link sent | |
| `verify_email_complete` | User clicked link | `timeFromSignup` |
| `listing_create_start` | CreateListing form opened | `entrypoint` (homepage / profile / cta) |
| `listing_create_complete` | Listing published | `category`, `price`, `imageCount` |
| `listing_view` | Listing detail loaded | `listingId`, `referrer` |
| `listing_favorite` / `listing_unfavorite` | Heart clicked | `listingId` |
| `listing_cart_add` | Add to cart | `listingId` |
| `listing_message_initiated` | "Message seller" clicked | `listingId` |
| `message_sent` | Message sent in conversation | `conversationId`, `hasAttachment` |
| `search` | Search executed | `query`, `category`, `resultCount` |
| `transaction_request` | "Request to Buy" clicked | `listingId` |
| `transaction_accept` | Seller accepts | `txId` |
| `transaction_complete` | Both parties marked sold | `txId`, `daysFromRequest` |
| `review_submitted` | Post-sale review | `txId`, `rating` |
| `report_filed` | Report submitted | `targetType`, `reason` |
| `share_clicked` | Share button on listing | `listingId`, `channel` |
| `referral_attributed` | Signup completed via referral link | `referrerUid` |

### Core funnels

1. **Acquisition funnel:** visit → signup_start → signup_complete → verify_email_complete → first listing_view → listing_favorite OR listing_message_initiated → transaction_request → transaction_complete
2. **Activation funnel:** signup_complete → onboarding step 1/2/3/4 → first action (listing or favorite) within 24h
3. **Engagement funnel:** logged_in (week N) → logged_in (week N+1) → at-least-one-action (week N+1)

### KPIs to track weekly

| Metric | Target by Month 6 | How to measure |
|---|---|---|
| WAU (Weekly Active Users) | 50+ | Count unique uids with any event in last 7d |
| Sign-up → verify rate | >70% | `verify_email_complete / signup_complete` |
| Sign-up → first listing rate | >25% | first `listing_create_complete` within 7d of signup |
| 7-day retention | >40% | % of signups returning in week 2 |
| 28-day retention | >20% | % returning in week 4 |
| Listings per active seller | >2 | average across users with at least one listing |
| Transaction completion rate | >60% | `transaction_complete / transaction_request` |
| Mean time to first sale (active sellers) | <14 days | days from listing to sold |
| Search empty-results rate | <15% | % of `search` events with `resultCount = 0` |
| Reports per 100 transactions | <5 | `report_filed / transaction_complete * 100` |
| Push opt-in rate | >40% | % of users with at least one `pushToken` |

### Where this surfaces

- Admin dashboard at `/admin/metrics` — built once in Month 5, queries `systemMetrics/daily` collection.
- Weekly email digest to yourself (Mondays 9 AM): yesterday's numbers + week-over-week.
- A single shared spreadsheet (Google Sheets) updated weekly with KPI history. Cheaper than a fancy BI tool, perfect for Month 1–6 scale.

---

## Appendix E — Solo Operator Playbook

Solo dev is more about operating habits than feature depth. These are not features — they're how you stay sane and shipping.

### Weekly cadence

- **Mon 1h — Plan:** read this roadmap, mark any task done since last Mon, pick 1–2 for the week. Update a single line in a `JOURNAL.md`: "Week N goal: X".
- **Wed 3–4h — Build:** heads-down on the picked task. Phone in another room.
- **Sat 2–3h — Ship + Review:** finish, deploy, write one paragraph in JOURNAL.md: "Shipped X. Learned Y. Next week Z."
- **One Sunday/month — Retro:** re-read this roadmap, mark slipped items, adjust next month explicitly, push to git.

### Tooling hygiene

- One project board (GitHub Projects / Linear / even a `TODO.md`) — must show "doing now / next 3 / icebox."
- One JOURNAL.md committed to the repo, dated entries, lightweight.
- One bookmarks folder for "DormDeals weekly checks": Firebase console, Sentry, analytics, feedback collection.
- Deploy from a branch, never main. Tag releases with date.

### Decision discipline

- **One-week rule:** no decision should take more than a week. If it does, you don't have enough info — ship something small to get info.
- **Reversibility check:** before any decision, ask "is this reversible?" If yes, default to ship and learn. If no, write down assumptions first.
- **Pre-mortems:** before shipping a big feature (transactions, payments), write what could break. Address top 3.

### Solo founder mental traps to avoid

1. **Polishing over shipping.** That CTA color isn't the problem.
2. **Reinventing what Firebase already does.** Auth, security rules, indexes — use them, don't shadow them.
3. **Building for users you don't have.** Don't build "Premium tier" with 10 features before anyone subscribes.
4. **Treating positive feedback as data.** Your friends saying "looks great" is not retention data.
5. **Ignoring negative feedback.** One angry user is worth ten happy ones for product signal.
6. **Solo means alone.** Find 1–2 other solo devs to share weekly notes with. The accountability loop matters more than any technical advice.
7. **Conflating effort with progress.** 40 hrs/wk shipping nothing is worse than 8 hrs/wk shipping one real feature.
8. **Not killing dead branches.** If a feature isn't shipping in 2 weeks, kill it or simplify. Don't carry it.

### Backup the human

- Keep a list of 3 people who'll spot-check your code: a senior at school, an internship mentor, the friend who's good at design.
- Once a month, share one screenshot in a relevant Discord (r/SideProject, Indie Hackers). Public commitment + occasional sharp feedback.
- Off-switch: pick one thing you do *not* check on the weekend (e.g., Sentry on Sundays). Sustainability matters across 6 months.

---

## Appendix F — Cost & Quota Reference

Firebase Spark (free) tier limits, as of late 2025 — verify before depending:

| Resource | Free quota | When you exceed |
|---|---|---|
| Firestore reads | 50K/day | Move to Blaze; ~$0.06 per 100K reads |
| Firestore writes | 20K/day | $0.18 per 100K writes |
| Firestore storage | 1 GiB | $0.18/GiB/month |
| Firebase Auth | unlimited | Phone Auth has $0.06/verification |
| Storage uploads | 5 GiB total, 1 GB/day | $0.026/GiB/month + egress |
| Storage downloads | 1 GB/day | $0.12/GiB egress |
| Cloud Functions | not available on Spark | Requires Blaze (Spark won't let you deploy Functions) |
| Cloud Vision API | 1K units/month free | Per-call pricing |
| Hosting | 10 GB/month bandwidth | Add'l $0.15/GB |

**Translation for DormDeals scale:**
- 100 WAU at ~50 reads/session × 7 sessions/week = ~35K reads/week → under free tier
- 100 listings × 5 images × 200 KB = ~100 MB storage → fine
- Each push notification = 1 Function invocation. 1000 messages/week × 1 push each = 1000 invocations/week. Blaze cost: ~$0
- Cloud Vision on 50 new listings/week × 5 images each = 250 calls/week → free tier covers ~4K/month

**Anticipated monthly cost at Month 6 scale (100 WAU):** $0–5 Firebase, $7 Render, $1 domain = under $15. Set alert at $20 to be safe.

**Cost scaling milestones:** budget will start to bite around 1000 WAU (image storage + Function invocations grow linearly). Algolia free tier (10K records, 100K ops/mo) hits limits around 5K listings. Stripe takes 2.9% + $0.30 per transaction.

---

## Success Criteria (overall)

By 2026-11-15 the project is judged successful if **any** of:
- Real users (≥50 WAU on home campus) and a clear path to scale.
- Real engagement (avg 3+ transactions per user) even at small scale.
- A paid feature with non-zero conversion proving willingness to pay.
- A polished, well-documented portfolio piece with a real-world case study.

It's judged unsuccessful only if all four are missing — and even then you've shipped a real product, which most projects never do.

### Pre-committed go/pivot/wind-down criteria (write these in Month 6 Week 1, before reading metrics)

Fill in with your own thresholds before launch. The point is they exist before the data does.

```
GO / SCALE (Branch A) — if ALL true at Month 6 close:
- WAU ≥ 50 on home campus
- ≥10 completed transactions during Month 5
- 28-day retention ≥ 20%
- ≥5% of users clicked a paid feature when shown

NICHE PIVOT (Branch B) — if engagement strong but vertical generic:
- WAU ≥ 20 with retention ≥ 30%
- One category accounts for >40% of all listings
- No paid signal but consistent feedback praising one specific aspect

WIND DOWN (Branch C) — if none of the above after honest distribution effort:
- <10 WAU after 4 weeks of post-launch activity
- No spontaneous referrals (users only signing up via your direct outreach)
- Repeated feedback that the product solves a problem they don't have
```

---

## Risk Register

Maintained as a single source — review monthly. Status: **O** (open), **M** (mitigated), **A** (accepted).

| # | Risk | Likelihood | Impact | Mitigation | Status |
|---|---|---|---|---|---|
| R1 | Solo burnout / time scarcity (classes + job) | High | Critical | Drop stretch items first; cut scope, not core | O |
| R2 | Launch with <20 sign-ups | Medium | High | Pre-seed listings; distribution playbook | O |
| R3 | Firebase cost spike (runaway reads / Vision API) | Medium | Medium | Budget alerts at $5/$10/$20; pagination from M4 | O |
| R4 | Scam / abuse incidents in early users | Medium | High | M2 moderation + reports + ban ladder | M (post-M2) |
| R5 | .edu verification breaks for community college subdomains | Medium | Medium | `allowedDomains` collection as data, not code | M (post-M2) |
| R6 | Bad meetup → public complaint | Low | High | Safe-meetup spots; report flow; respond fast | M (post-M2) |
| R7 | iOS push notifications limited | High | Low | Document upfront; don't promise iOS push in marketing | A |
| R8 | Vendor lock-in to Firebase | High | Low (now) | Acceptable for 6mo; escape via custom backend if scale demands | A |
| R9 | Sole maintainer = bus factor 1 | High | Critical (for users, not you) | Document architecture; OSS the code by Month 6 | O |
| R10 | Stripe/payment regulatory complexity if Branch A | Medium | High | Only if needed; consult lawyer; possibly defer to Phase 2 | A |
| R11 | Search performance at 5K+ listings (client-side filter) | Medium | Medium | Trigger: empty-results rate or perf complaints → Algolia | A |
| R12 | DMCA / IP infringement claims | Low | Medium | Designated agent contact; clear takedown process | M (post-M5) |
| R13 | Spam listings flood post-launch | Medium | Medium | Banned-phrase regex + manual review for first 2 weeks | M (post-M2) |
| R14 | Lose interest after launch (Month 6+) | Medium | High (for project) | Pre-committed decision criteria; honest exit OK | A |
| R15 | Sensitive data leaked (CC numbers) via fake checkout still live | Low | Critical | **DELETE the fake checkout in M4** — it's a real PCI scope risk while alive | O (until M4) |

**R15 is the most underrated risk** — even fake credit-card forms can become real liability if an actual user enters their card. Prioritize deleting the form even earlier (in M1) if you can.

---

## Quick-Reference Index

- **What's broken now and how to fix it?** → [Current State](#current-state-decision-oriented-summary), [Appendix A — Tech Debt Punch List](#appendix-a--tech-debt-punch-list-from-audit)
- **What features exist in the universe and which to build?** → [Feature Catalog](#feature-catalog-prioritized)
- **What am I shipping this month?** → Month sections (1–6)
- **How will users find DormDeals?** → [Marketing & Growth Playbook](#marketing--growth-playbook)
- **How do I keep bad actors out?** → [Trust & Safety Framework](#trust--safety-framework), [Prohibited Items Policy](#prohibited-items--content-policy)
- **What can I sell? What's banned?** → [Prohibited Items Policy](#prohibited-items--content-policy)
- **What does Firestore look like after 6 months?** → [Appendix C — Data Model Evolution](#appendix-c--data-model-evolution)
- **What should I measure?** → [Appendix D — Metrics & Instrumentation](#appendix-d--metrics--instrumentation)
- **How do I not burn out?** → [Appendix E — Solo Operator Playbook](#appendix-e--solo-operator-playbook)
- **How much does this cost?** → [Appendix F — Cost & Quota Reference](#appendix-f--cost--quota-reference)
- **What if I want to keep going past Month 6?** → [Phase 2: Months 7–12](#phase-2-the-months-712-horizon)
- **What could go wrong?** → [Risk Register](#risk-register)

---

## Appendix A — Tech Debt Punch List (from audit)

Items to delete or fix in Month 1, ordered by ratio of effort to risk reduction:

1. **Delete dead service files** — `src/services/api.ts`, `src/services/apiService.ts`. (15 min)
2. **Consolidate duplicate services** — `listingService` vs `listingsService`, `favoriteService` vs `favoritesService`. (4-6 hr including testing)
3. **Move `ResultsPage.tsx`** out of project root → `src/pages/` (or delete if duplicate). (15 min)
4. **Delete `blank-check.png`** (810 KB, no callers). (1 min)
5. **Delete `concurrently`, `nodemon`, `dormdeals@1.0.0`** root-level files (npm install accidents). (1 min)
6. **Investigate root `index.ts` and `index.js`** — `index.js` is the Render Express server per `package.json`; `index.ts` is unclear. (30 min)
7. **Scrub `VITE_VALIDATE_ONLY_ALLOWLIST` UID** from `.env.example` / `env.example`. (5 min)
8. **Add `/users` Firestore rule** and reject-by-default stubs for upcoming collections. (1 hr)
9. **Add CI test stage** to `.gitlab-ci.yml`. (1-2 hr)
10. **Drop "team members" section** from README — it's now you alone. (5 min)
11. **Wire Sentry + Analytics.** (2 hr)
12. **Consider archiving `TESTING.md` / `TEST-RESULTS.md` / `TESTING-PHASE3.md` / `PROMPT_EXPLANATIONS.md` / `docs/AI_logs.md`** — school-project artifacts that read awkwardly on a real product repo. (15 min)

Total Month 1 debt work: roughly 12–16 hours. Fits in 2 weeks at the assumed cadence.

---

## Appendix B — Files You'll Likely Touch Per Month

| Month | Primary files |
|---|---|
| 1 | `src/services/*`, `firestore.rules`, `.gitlab-ci.yml`, repo root |
| 2 | `src/context/AuthContext.tsx`, `src/utils/accessControl.ts`, `firestore.rules`, new `src/pages/AdminModeration.tsx`, new `src/components/ReviewStars.tsx` |
| 3 | `src/pages/MessagePage.tsx` (mostly rewrite), new `src/services/messagingService.ts`, `public/firebase-messaging-sw.js`, `vite.config.ts` (PWA plugin) |
| 4 | `src/pages/Checkout.tsx` (delete/repurpose), `src/pages/ListingDetailPage.tsx`, `src/pages/Marketplace.tsx`, new `src/services/transactionService.ts` |
| 5 | `src/pages/Home.tsx`, all listing pages (SEO), new onboarding components, `index.html`, `vite.config.ts` |
| 6 | Stripe integration in one place (if chosen), `README.md`, new `DECISION_2026-11.md`, new `CASE_STUDY.md` |

---

## Open Questions for You

These don't block adoption of the plan, but answer them when you get a chance:

1. **Which campus is "home"?** UL Lafayette per the original repo name (`fa25team04`)? Confirm the school domain(s) you'll allowlist.
2. **What's your real time budget per week?** I assumed 8–12h. If it's 5h, this becomes a 9-month plan. If it's 20h, you can pull Month 6 work into Month 4.
3. **Are you comfortable being the sole moderator?** Month 2's report-queue assumes you handle reports personally. If not, the plan needs an earlier recruit-a-trusted-friend step.
4. **Any prior commitment to GitLab vs. GitHub?** Migrating to GitHub would unlock GitHub Pages preview deploys, better Actions ecosystem, and OSS visibility — worth ~2 hours of work if not contractually tied to GitLab.
5. **Do you actually want to launch?** Some 6-month plans optimize for "ship to users." Others optimize for "build resume-grade software." This plan is the former. Tell me if you'd rather have the latter and I'll cut Month 5 distribution work in favor of polish + a tech-deep-dive case study.

---

*Revise this document as you learn. The plan exists to be edited, not preserved.*
