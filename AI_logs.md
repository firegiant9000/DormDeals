# DormDeals Feature Developer Prompt

# Overview
- MainFeaturePage (Search, Filters, Cart, Wishlist)
- ResultsPage (Search & Filter to find listings that fits the user requiremetns)
- MessaggePage (Buyer-Seller communication)


# MainFeaturePage
I'm building the main feature page for DormDeals.

Here's my UI mockup description:
[DESCRIBE YOUR MOCKUP IN DETAIL:
 - Layout – profile page, chat, and add listings at the top rightmost corner. Ability to add items to cart/wishlist on the listings
 - Input fields/controls – a search tab, a filter tab
 - Buttons – profile page, chat, add listing, add items to cart/wishlist
 - What happens when user submits]

User flow:
3. Show loading state
4. Navigate to results page with data

Please create src/pages/[MainFeaturePage].tsx with:

1. Form with all necessary inputs:
   - [List all input fields]
   - Validation for each field
   - Error messages

2. State management:
   - Use useState for form data
   - Use useState for loading state
   - Use useState for errors

3. Submit handler:
   - Validate all inputs
   - Call the service from src/services/apiService.ts
   - Show loading spinner during processing
   - On success: navigate to /results with data
   - On error: show error message

4. Styling:
   - Use Tailwind CSS
   - Modern, clean design
   - Fully responsive
   - Match the style of our homepage

Use TypeScript with proper types from src/types/index.ts

I will also provide a userflow drawio file. dont code before i give you that
(I opened the drawio file for userflow and cursor build MainFeaturePage base on the userflow)

# Making the application more human friendly
- Fixing Cart & Wishlist syncying issues
Do you have 2 different list for cart and wishlist? they are not in sync when im at different pages. Can you add another feature so when an user add the items to their wishlist/cart, they cannot add it again.

Can you change the buttons for add to cart and wishlist to be able to remove from cart and wishlist for listings in marketplace and listing?

# Building result page
I need to create a results display page for DormDeals.

The page receives data from the main feature page via React Router state.

Mockup description:
The page will show the results after the users use the search taskbar/filter to find the items they want. Users can apply filters on condition, min and max price, pickup method, and different categories for the items they want.

Please create src/pages/ResultsPage.tsx that:
1. Receives data from navigation state (useLocation hook)
2. Displays results in [format: cards/table/list]
3. For each result, shows:
   - the card of the listing that consists of the price, image, description (similar to the cards in featured items)
   - [Action buttons]
   
4. Include:
   - "Try Again" button → navigate back
   - Filtering/sorting options (if applicable)
   - Detailed view on click
   - Empty state if no results

5. Make it:
   - Fully responsive
   - Well-styled with Tailwind
   - Use our Card component
   - TypeScript typed

Handle edge cases:
- No data received
- Empty results
- Error states

# Updating result page
I am trying to update the result page for DormDeals. The application will go to  @ResultsPage.tsx after the user uses the search taskbar or the advance filter.

The search bar at @ResultsPage.tsx should have the same selection of categories, condition and pickup method in the @MainFeaturePage.tsx, meaning the user can switch all the categories and other filters at ResultsPage.tsx. If the user presses reset filters, it will remove all filters and show all the listings.

Add more mock items at the Demo Listing with different time when they are posted, more variety of items for the categories and prices with greater difference so it would be easier to use when the filters are applied. (The listings should have all the descriptions, pictures, price, and category) 

# Filter taskbar isn't reusable
The filter taskbar in the @ResultsPage.tsx need to be reusable, user can change the filters and items that fit the filters will be shown everytime the user change the filters.

Have a copy of the search items taskbar from @ResultsPage.tsx and @MainFeaturePage.tsx  in the Marketplace.tsx 

# Not all filter taskbar on the application is working the same
The search bar and filter is working perfect at @Marketplace.tsx but the filter in @ResultsPage.tsx is not. When i use the categories in @ResultsPage.tsx, it only work once. No items were shown after i pick other category

# Building MessagePage
I am the feature dev for the application DormDeals. I want to create a new file called MessagePage.tsx. It will be a messaging page for the users to chat with each other. Currently there is a button in @MainFeaturePage.tsx with a message icon. That button will bring the user to the messaging page. Create a functional, responsive MessaggingPage

# Adding more features to the MessagePage to be more user friendly
When the user is messaging the seller about an item, send the item to the chat too. The button (Contact Seller) in listing page should be able to send the item to the user and start messaging

# AI prompt for login page
I am the feature lead for DormDeals.

I want to create a login page for the application

The flow of the application will be as below:
- Any user can browse the application without an account
- The user will need to have an account to create listing, add items to cart/wishlist/use the message feature

There is a button at the "account" tab that says login/log out. Make sure the button says login when the user is not logged in and says log out when the user is logged in. Create a login page that would ask user for their email & password

For the current stage of the application, we dont have to enforce/actually ask the user to log in with a valid email & password. 

Make sure the changes will pass the pipeline without error.

# AI Development Log

This document tracks the AI-assisted development process for the DormDeals application.

## Project Overview
DormDeals is a Vite + React + TypeScript + Tailwind CSS marketplace application for UL students to buy, sell, and rent items within their campus community.

## Development Sessions

### Session 1: Initial Setup and Dark Mode Implementation
**Date**: Current Session
**AI Assistant**: Claude Sonnet 4

#### Tasks Completed:
1. **Fixed JSX Structure Issues**
   - Fixed unclosed `<section>` tag in `src/pages/MainFeaturePage.tsx`
   - Ensured all JSX tags are properly balanced

2. **Dark Mode Implementation**
   - Added `--dd-surface-3` CSS token for distinct dark surfaces
   - Updated search panels to use `bg-surface-3` for better visual hierarchy
   - Made all pages dark-mode aware using tokenized CSS classes
   - Updated navbar, profile dropdown, and sell button styling

3. **Navigation Improvements**
   - Removed "Electronics" and "Textbooks" from navbar
   - Added Cart, Wishlist, and Chat buttons to navbar
   - Removed duplicate buttons from other locations
   - Updated "Add Listing" button with proper dark mode focus states

4. **Page-Specific Updates**
   - **CreateListing.tsx**: Full dark mode implementation with tokenized surfaces
   - **Profile.tsx**: Updated to use dark mode tokens
   - **Marketplace.tsx**: Applied dark mode styling
   - **MessagePage.tsx**: Updated main containers for dark mode
   - **AboutPage.tsx**: Complete dark mode overhaul with proper surface tokens

5. **Listing Detail Page Enhancement**
   - Made `src/pages/ListingDetailPage.tsx` fully dark-mode aware
   - Updated all surfaces, tags, badges, and buttons to use tokenized styling
   - Implemented proper focus states and accessibility features

6. **Home Page Layout Restructure**
   - Added search sidebar layout with responsive grid
   - Implemented compact search card on left side (desktop)
   - Mobile-first responsive design with sidebar collapsing underneath

#### Technical Decisions:
- Used CSS custom properties for consistent theming
- Implemented `darkMode: 'class'` strategy with Tailwind
- Maintained light mode compatibility throughout
- Used tokenized utilities for consistent dark mode experience

#### Code Quality:
- No TypeScript errors introduced
- All linting checks passed
- Maintained existing functionality while adding new features
- Proper accessibility considerations with focus states

### Session 2: User Revisions
**Date**: Current Session
**AI Assistant**: Claude Sonnet 4

#### User Modifications:
The user reverted some dark mode changes in:
- `src/pages/ListingDetailPage.tsx`: Reverted to light mode styling
- `src/pages/Home.tsx`: Removed search sidebar implementation

#### Analysis:
The user appears to prefer the original light mode styling for the listing detail page and removed the search sidebar from the home page. This suggests they may want to maintain the original design aesthetic while keeping other dark mode improvements.

## Key Learnings

1. **CSS Token Strategy**: Using CSS custom properties with Tailwind utilities provides excellent dark mode support
2. **Responsive Design**: Grid layouts with responsive breakpoints work well for sidebar implementations
3. **User Feedback**: It's important to balance technical improvements with user preferences
4. **Accessibility**: Focus states and proper contrast ratios are crucial for dark mode implementations

## Next Steps

1. Consider user feedback on design preferences
2. Implement any additional dark mode refinements
3. Add comprehensive testing for dark mode functionality
4. Document the theming system for future developers

## Technical Stack

- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS with custom CSS properties
- **State Management**: React Context API
- **Routing**: React Router
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Development Environment

- **Node.js**: Latest LTS version
- **Package Manager**: npm
- **Build Tool**: Vite
- **Linting**: ESLint + TypeScript
- **Git**: Version control with GitLab


# DormDeals QA/Docs Lead Prompt

## Initial Documentation

I'm the QA/Documentation Lead for [FA25TEAM04].

Please create comprehensive documentation:

1. Update README.md with:
   - Project name and slogan
   - Description
   - Features list
   - Tech stack
   - Team members section (I'll fill names)
   - Installation instructions:
     * Prerequisites
     * Clone repository
     * Install dependencies
     * Run application
   - Available scripts
   - Project structure
   - License

2. Create TESTING.md with:
   - Manual testing checklist template
   - Test case format
   - Browser testing checklist
   - Responsive design testing

3. Create ARCHITECTURE.md template with:
   - Project structure explanation
   - Component hierarchy (we'll fill this)
   - Data flow diagram placeholder
   - Design decisions section

Make it professional and easy to follow.

## Testing

I'm setting up testing for [FA25TEAM04].

Please:

1. Update TESTING.md with specific test cases for our features:
   - Homepage testing checklist
   - [Main feature] testing checklist
   - Navigation testing
   - Responsive design testing
   - Browser compatibility checklist

2. Create a manual testing script (scripts/test-checklist.md) that testers can follow step-by-step

3. Create templates for bug reports in .gitlab/issue_templates/bug_report.md

Include:
- Test case format
- Expected vs actual results template
- Screenshots placeholder
- Steps to reproduce

You are working in a Vite + React + TypeScript repo named DormDeals.

Make the following changes. Keep code modular and typed. Do not expose any real secret values—use placeholders that pull from import.meta.env.

1) Env scaffolding
- Ensure a file `.env.example` exists at repo root with these placeholder keys (one per line):
  VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
  VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN_HERE
  VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID_HERE
  VITE_FIREBASE_APP_ID=YOUR_APP_ID_HERE
  VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID_HERE
  VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID_HERE
- Ensure `.gitignore` contains `.env`.

2) Centralized Firebase initialization
- Create or overwrite `src/firebase.ts`:
  - Use modular SDK only (no compat).
  - Initialize once using getApps()/getApp().
  - Export `app` and `auth`.
  - Read config from import.meta.env:
    apiKey -> VITE_FIREBASE_API_KEY
    authDomain -> VITE_FIREBASE_AUTH_DOMAIN
    projectId -> VITE_FIREBASE_PROJECT_ID
    appId -> VITE_FIREBASE_APP_ID
    messagingSenderId -> VITE_FIREBASE_MESSAGING_SENDER_ID
  - Optionally init analytics only if `window` exists AND `VITE_FIREBASE_MEASUREMENT_ID` is set, via dynamic import('firebase/analytics') + isSupported(). Export `analytics?`.

- Remove any old hardcoded Firebase config and direct getAnalytics(app) calls elsewhere. Update imports to use `src/firebase.ts`.

3) Auth handlers
- Create `src/authHandlers.ts`:
  - handleLogin(email, password) uses signInWithEmailAndPassword(auth, ...). Return { ok: true, uid } or { ok: false, code }. Console.error with "AUTH ERROR (login)" including err.code.
  - handleRegister(email, password, displayName?) uses createUserWithEmailAndPassword + optional updateProfile. Same return shape; log "AUTH ERROR (register)".

4) Dev-only ENV sanity log
- At the top of `src/main.tsx` (or `src/App.tsx`) behind `if (import.meta.env.DEV)`, log:
  console.log('ENV CHECK', {
    HAS_API_KEY: !!import.meta.env.VITE_FIREBASE_API_KEY,
    AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  });

5) Optional Auth smoke test
- Add `src/pages/AuthSmokeTest.tsx` with simple inputs/buttons to call handleLogin and handleRegister, showing "OK" or "FAIL: <code>".
- If router is centralized, add a dev-only route `/auth-smoke-test` guarded by `if (import.meta.env.DEV)`; otherwise omit.

6) Cleanups
- Remove any `firebase/compat/*`.
- Replace `process.env.*` in client with `import.meta.env.VITE_*`.
- Remove hardcoded Firebase configs anywhere else.

7) Fix types/lint as needed.

Create (or update) Firebase Hosting config for a Vite SPA:

- Create `.firebaserc` at repo root:
  {
    "projects": { "default": "dormdeals-9cb29" }
  }

- Create `firebase.json` at repo root:
  {
    "hosting": {
      "public": "dist",
      "ignore": ["**/.*", "**/node_modules/**"],
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    }
  }

- Ensure `.gitignore` ignores:
  .firebase/
  firebase-debug.log
  dist/


  Append (or ensure present) at the end of `.gitignore`:

# Firebase (generated)
.firebase/
firebase-debug.log

# Build output
dist/

If these were tracked previously, stop tracking (run locally, not in editor):
git rm -r --cached .firebase || true
git rm -r --cached dist || true


In the login/register submit handlers, add robust error logging and return codes:

catch (err: any) {
  console.error('AUTH ERROR (login|register)', err?.code, err?.message, err);
  return { ok: false, code: err?.code || 'unknown' };
}

Temporarily surface `code` in the UI toast/message when a call fails.

Common codes to expect: 
- auth/operation-not-allowed
- auth/unauthorized-domain
- auth/invalid-api-key
- auth/email-already-in-use
- auth/weak-password
- auth/network-request-failed