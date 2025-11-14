# DormDeals Feature Developer Prompt

## Overview
- MainFeaturePage (Search, Filters, Cart, Wishlist)
- ResultsPage (Search & Filter to find listings that fit user requirements)
- MessagePage (Buyer–Seller communication)

## MainFeaturePage
I'm building the main feature page for DormDeals.

**UI mockup description (fill in details):**
- Layout – profile page, chat, and add listings at the top-right. Ability to add items to cart/wishlist on the listings.
- Input fields/controls – a search tab, a filter tab.
- Buttons – profile page, chat, add listing, add/remove items to cart/wishlist.
- What happens when user submits.

**User flow**
1. Validate inputs  
2. Show loading state  
3. Navigate to results page with data

**Create** `src/pages/MainFeaturePage.tsx` with:

1) **Form**  
   - List all input fields  
   - Validation for each field  
   - Error messages

2) **State management**  
   - `useState` for form data  
   - `useState` for loading state  
   - `useState` for errors

3) **Submit handler**  
   - Validate all inputs  
   - Call `src/services/apiService.ts`  
   - Show loading spinner during processing  
   - On success: navigate to `/results` with data  
   - On error: show error message

4) **Styling**  
   - Tailwind CSS  
   - Modern, clean, responsive  
   - Match the style of our homepage

Use TypeScript with proper types from `src/types/index.ts`.

> I will also provide a userflow drawio file. Build `MainFeaturePage` based on the userflow.

## Making the application more human friendly
- Fix cart & wishlist syncing issues (single source of truth; prevent duplicates).
- Change the buttons for add to cart/wishlist to toggle **Add/Remove** on marketplace and listing cards.

## Building ResultsPage
Create `src/pages/ResultsPage.tsx`.

**Context:** The page receives data from the main feature page via React Router state.

**Mockup description:**  
Show results after users use the search taskbar/filter to find items. Users can apply filters on condition, min/max price, pickup method, and categories.

**Requirements:**
1) Receives data from navigation state (`useLocation`)  
2) Displays results in cards/table/list  
3) Each result shows price, image, description, and actions  
4) Include:
   - “Try Again” → navigate back
   - Filtering/sorting options (if applicable)
   - Detailed view on click
   - Empty state if no results
5) Make it:
   - Fully responsive
   - Tailwind-styled
   - Use our Card component
   - TypeScript typed

**Edge cases:** no data, empty results, error states.

## Updating ResultsPage
- The search bar in `ResultsPage.tsx` should mirror categories/condition/pickup filters in `MainFeaturePage.tsx`.  
- “Reset filters” clears everything and shows all listings.  
- Add more mock items to demo data with varied times, categories, and prices (include descriptions, pictures, price, category).

## Filter taskbar reusability
- Make the filter taskbar reusable in `ResultsPage.tsx`.  
- Reuse it in `Marketplace.tsx` and `MainFeaturePage.tsx`.

## Filter behavior bug
- In `ResultsPage.tsx`, category filter should work repeatedly (currently only works once).

## Building MessagePage
Create `src/pages/MessagePage.tsx` (functional, responsive).  
Button in `MainFeaturePage.tsx` (message icon) routes here.

## MessagePage – add user-friendly features
- When the user messages the seller about an item, send that item into the chat thread.  
- The “Contact Seller” button on a listing should start a chat and include the item.

---

# User classification
Implement user classification for DormDeals (Firebase Auth in place).

1) **Types** (`src/types/user.ts`)  
   - `UserType` enum: `'admin' | 'premium' | 'regular' | 'guest'`  
   - `User` interface with `type: UserType`

2) **Auth context**  
   - Add `userType` to auth state  
   - Fetch user type from Firestore on login  
   - Default to `regular` on signup  
   - Store user type in user profile (Firestore)

3) **User profile**  
   - On signup, create user doc in Firestore (`users` collection): email, displayName, userType, createdAt  
   - Support updating `userType`

4) **Signup flow**  
   - After signup, create profile with `userType: 'regular'` in Firestore

5) **Login flow**  
   - Fetch user profile and include `userType` in auth context  
   - Handle missing profile gracefully

Use TypeScript; handle errors; add loading states.

---

# Access control based on user type
User types: **Admin** (full), **Premium** (premium features), **Regular** (basic), **Guest** (limited read-only).

1) **Utilities** (`src/utils/accessControl.ts`)  
   - `canAccessFeature(userType, feature)`  
   - `isAdmin(userType)`  
   - `isPremium(userType)`  
   - `canEdit(userType)`  
   - `canDelete(userType)`

2) **Hook** (`src/hooks/useAccessControl.ts`)  
   - `useAccessControl()` returns `canAccess`, `isAdmin`, `isPremium`  
   - Reads from auth context

3) **Component** (`src/components/ProtectedFeature.tsx`)  
   - Props: `requiredUserTypes`, `children`, `fallback`  
   - Show `children` only if authorized; otherwise show `fallback`/upgrade prompt

4) **Apply in pages**  
   - Hide premium features for regular users; show upgrade prompts  
   - Protect admin-only pages  
   - Add role checks before actions

5) **Navigation**  
   - Hide menu items based on `userType`  
   - Show/hide “Upgrade” button accordingly

Examples:  
- Premium “Advanced Analytics” → Premium/Admin only  
- Admin “User Management” → Admin only  
- Regular “Basic Dashboard” → all logged-in users

---

# AI prompt for login page
Feature lead wants a login page.

**Flow**
- Browsing allowed without account  
- Account required to create listings, cart/wishlist, messaging  
- “Account” tab shows **Login** if logged out; **Log out** if logged in  
- For now, do **not** enforce real email/password validation (UI only)  
- Ensure CI passes

---

# AI Development Log

## Project Overview
DormDeals is a Vite + React + TypeScript + Tailwind CSS marketplace for UL students.

## Session 1: Initial Setup and Dark Mode Implementation
**Assistant:** Claude Sonnet 4

- Fixed JSX tag issues (e.g., unclosed `<section>`).  
- Dark mode tokens (`--dd-surface-3`), pages dark-mode aware.  
- Navbar/profile/sell button updates; removed duplicated buttons.  
- Page updates: `CreateListing.tsx`, `Profile.tsx`, `Marketplace.tsx`, `MessagePage.tsx`, `AboutPage.tsx`.  
- `ListingDetailPage.tsx` fully dark-mode aware.  
- Home layout restructure with responsive sidebar/card.

**Decisions:** CSS custom properties + Tailwind, `darkMode: 'class'`, light-mode compatible, tokenized utilities.  
**Quality:** No TS errors, lint passes, accessibility focus states.

## Session 2: User Revisions
User reverted some dark-mode changes:  
- `ListingDetailPage.tsx` back to light mode; `Home.tsx` removed sidebar.

**Analysis:** Keep original aesthetic while retaining other dark-mode improvements.

**Key Learnings:** CSS tokens, responsive grids, incorporate user feedback, accessibility contrast/focus.  
**Next:** Consider design prefs, refine dark mode, add tests, document theming.

**Stack:** Vite + React + TS; Tailwind; Context; React Router; Lucide; Framer Motion.  
**Env:** Node LTS, npm, Vite, ESLint + TS, Git/GitLab.

---

# DormDeals QA/Docs Lead Prompt

## Initial Documentation
Create/update:

- **README.md**: name/slogan, description, features, tech stack, team section, install (prereqs, clone, install, run), scripts, structure, license.  
- **TESTING.md**: manual checklist template, test case format, browser/responsive checklist.  
- **ARCHITECTURE.md**: structure, component hierarchy (placeholder), data-flow diagram placeholder, design decisions.

## Testing docs
- Update **TESTING.md** with concrete test cases: homepage, main feature, navigation, responsive, browser compatibility.  
- Add **scripts/test-checklist.md** (step-by-step manual script).  
- Add **.gitlab/issue_templates/bug_report.md** with fields for steps, expected vs actual, screenshots placeholder.

---

# Firebase env + centralized Auth init + Hosting + .gitignore + error codes

**Refactor + Config Prompt**
```text
You are working in a Vite + React + TypeScript repo named DormDeals.

Make the following changes. Keep code modular and typed. Do not expose real secrets—use import.meta.env with VITE_*.

1) Env scaffolding
- Create `.env.example`:
  VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
  VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN_HERE
  VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID_HERE
  VITE_FIREBASE_APP_ID=YOUR_APP_ID_HERE
  VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID_HERE
  VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID_HERE
- Ensure `.gitignore` contains `.env`.

2) Centralized Firebase init (`src/firebase.ts`)
- Modular SDK only; init once with getApps()/getApp()
- Export `app`, `auth`
- Read config from `import.meta.env.VITE_*`
- Optionally init analytics if window exists & MEASUREMENT_ID set (dynamic import + isSupported), export `analytics?`
- Remove hardcoded configs & direct getAnalytics(app) elsewhere; import from `src/firebase.ts`

3) Auth handlers (`src/authHandlers.ts`)
- `handleLogin(email, password)` → `signInWithEmailAndPassword` → return `{ ok: true, uid }` or `{ ok: false, code }` and `console.error("AUTH ERROR (login)", err.code)`
- `handleRegister(email, password, displayName?)` → `createUserWithEmailAndPassword` + optional `updateProfile`; same returns; log `"AUTH ERROR (register)"`

4) Dev-only ENV sanity log
- In `main.tsx` or `App.tsx`, behind `if (import.meta.env.DEV)`:
  console.log('ENV CHECK', { HAS_API_KEY: !!import.meta.env.VITE_FIREBASE_API_KEY, AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID });

5) Optional Auth smoke test
- `src/pages/AuthSmokeTest.tsx` with simple inputs/buttons calling the handlers; show "OK" or "FAIL: <code>"
- Add dev-only route `/auth-smoke-test` if router is centralized

6) Cleanups
- Remove any `firebase/compat/*`
- Replace `process.env.*` with `import.meta.env.VITE_*`
- Remove remaining hardcoded configs
