# Prompt Explanations Based on DormDeals Codebase

This document explains each of the 13 prompts in detail, based on the actual implementation in the DormDeals marketplace application.

---

## 1. Flow of Control Prompts

### Prompt 1: Full Flow of Control for a Feature

**Example Feature: "Adding an Item to Cart"**

**Flow of Control:**

1. **User Action (Frontend - View Layer)**
   - User clicks "Add to Cart" button on a listing card in `Marketplace.tsx` or `ItemDetail.tsx`
   - Event handler calls `addToCart(item)` from `ShopContext`

2. **State Management (Frontend - Controller Layer)**
   - `ShopContext.addToCart()` in `src/context/ShopContext.tsx` (line 87-148):
     - Checks if user is authenticated via `useAuth()`
     - If not authenticated, shows login popup
     - If authenticated, calls `addToCartService(userId, listingId, 1)` from `cartService.ts`

3. **Service Layer (Frontend - Controller Layer)**
   - `addToCart()` in `src/services/cartService.ts` (line 88-156):
     - Validates inputs (userId, listingId, quantity)
     - Creates Firestore query to check if item already exists in cart
     - If exists: updates quantity using `updateDoc()`
     - If not: creates new document using `addDoc()` to `cart` collection
     - Uses Firebase Firestore SDK (`firebase/firestore`)

4. **Network Layer**
   - Firebase SDK makes HTTPS request to Firebase Firestore API
   - Request includes Firebase Auth token (automatically attached)
   - Request payload: `{ userId, listingId, quantity, createdAt, updatedAt }`

5. **Backend/Database Layer (Firebase Firestore)**
   - Firestore Security Rules (`firestore.rules` line 28-32) validate:
     - User is authenticated (`isAuthenticated()`)
     - User owns the cart item (`resource.data.userId == request.auth.uid`)
   - If valid: Document written to `cart` collection
   - If invalid: Returns `permission-denied` error

6. **Response Flow**
   - Service returns success/error
   - `ShopContext` reloads cart from Firestore via `getCartItems(userId)`
   - Context state updates with new cart items
   - React components re-render (Cart drawer, cart icon badge)
   - Toast notification shown: "Item added to cart"

**Key Files:**
- `src/context/ShopContext.tsx` - State management
- `src/services/cartService.ts` - Data access
- `firestore.rules` - Security validation
- `src/config/firebase.ts` - Firebase initialization

### Prompt 2: Flow Differences Between Features

**Feature A: Creating a Listing**
- **Flow**: `CreateListing.tsx` → `listingsService.createListing()` → Firestore `listings` collection
- **Authentication**: Required (must be logged in)
- **Authorization**: User must be `REGULAR` or `PREMIUM` (checked via `useAccessControl()`)
- **Data Validation**: Client-side form validation + Firestore rules
- **Security Rule**: `request.resource.data.sellerId == request.auth.uid` (line 21 in `firestore.rules`)

**Feature B: Viewing Listings (Marketplace)**
- **Flow**: `Marketplace.tsx` → `listingsService.getListings()` → Firestore `listings` collection
- **Authentication**: Not required (public read access)
- **Authorization**: None (readable by everyone)
- **Data Validation**: Firestore query filters (`isActive == true`)
- **Security Rule**: `allow read: if true` (line 19 in `firestore.rules`)

**Key Differences:**
1. **Auth Requirement**: Create requires auth, View does not
2. **RBAC Check**: Create checks user type, View does not
3. **Security Rules**: Create enforces ownership, View allows public read
4. **Data Flow**: Create writes new document, View queries existing documents

---

## 2. Data Modeling & Database Implementation Prompts

### Prompt 3: Data Models and Database Mapping

**Firestore Collections and Models:**

1. **Users Collection** (`users/{userId}`)
   - **Location**: Firestore collection `users`
   - **TypeScript Interface**: `UserProfile` in `src/types/user.ts`
   - **Fields**:
     - `id`: string (Firebase Auth UID)
     - `email`: string
     - `displayName`: string
     - `userType`: enum (`ADMIN`, `PREMIUM`, `REGULAR`, `GUEST`)
     - `phone?`: string (optional)
     - `school?`: string (optional)
     - `major?`: string (optional)
     - `profileImage?`: string (optional)
     - `isVerified`: boolean
     - `rating`: number
     - `reviewCount`: number
     - `totalSales`: number
     - `createdAt`: Timestamp
     - `updatedAt`: Timestamp
   - **Service**: `src/services/userService.ts`

2. **Listings Collection** (`listings/{listingId}`)
   - **Location**: Firestore collection `listings`
   - **TypeScript Interface**: `Item` in `src/types/index.ts`
   - **Fields**:
     - `id`: string (Firestore document ID)
     - `title`: string
     - `description`: string
     - `price`: number
     - `category`: enum (`ItemCategory`)
     - `condition`: enum (`ItemCondition`)
     - `images`: string[] (Base64 encoded)
     - `sellerId`: string (references `users/{userId}`)
     - `sellerEmail`, `sellerName`, `sellerSchool`: denormalized seller data
     - `location`: string
     - `pickupAvailable`: boolean
     - `deliveryAvailable`: boolean
     - `deliveryFee`: number
     - `isActive`: boolean
     - `isSold`: boolean
     - `isFeatured`: boolean
     - `views`: number
     - `likes`: number
     - `tags`: string[]
     - `createdAt`: Timestamp
     - `updatedAt`: Timestamp
   - **Service**: `src/services/listingsService.ts`

3. **Cart Collection** (`cart/{cartItemId}`)
   - **Location**: Firestore collection `cart`
   - **TypeScript Interface**: `Item[]` (references listings)
   - **Fields**:
     - `userId`: string (references `users/{userId}`)
     - `listingId`: string (references `listings/{listingId}`)
     - `quantity`: number
     - `createdAt`: Timestamp
     - `updatedAt`: Timestamp
   - **Service**: `src/services/cartService.ts`
   - **Note**: Cart items are fetched and joined with listing data in `getCartItems()`

4. **Favorites Collection** (`favorites/{favoriteId}`)
   - **Location**: Firestore collection `favorites`
   - **TypeScript Interface**: `Item[]` (references listings)
   - **Fields**:
     - `userId`: string (references `users/{userId}`)
     - `listingId`: string (references `listings/{listingId}`)
     - `createdAt`: Timestamp
   - **Service**: `src/services/favoritesService.ts`

**Relationships:**
- **Users ↔ Listings**: One-to-many (user can have many listings via `sellerId`)
- **Users ↔ Cart**: One-to-many (user can have many cart items via `userId`)
- **Users ↔ Favorites**: One-to-many (user can have many favorites via `userId`)
- **Listings ↔ Cart**: Many-to-many (via cart items referencing `listingId`)
- **Listings ↔ Favorites**: Many-to-many (via favorites referencing `listingId`)

**Note**: Firestore doesn't support foreign keys, so relationships are maintained via string references and denormalized data (e.g., seller info stored in listing document).

### Prompt 4: Model Usage in CRUD and Auth Operations

**Create Operations:**
- **Creating Listing**: `listingsService.createListing()` (line 207-298)
  - Validates `sellerId` matches authenticated user
  - Denormalizes seller data into listing document
  - Sets `isActive: true`, `isSold: false` by default
  - Firestore rule validates: `request.resource.data.sellerId == request.auth.uid`

**Read Operations:**
- **Reading Listings**: `listingsService.getListings()` (line 100-167)
  - Queries with filters (active, category, sellerId)
  - Orders by `createdAt` descending
  - Public read access (no auth required)
  - Transforms Firestore documents to `Item[]` type

**Update Operations:**
- **Updating Listing**: `listingsService.updateListing()` (line 303-352)
  - Only owner can update (validated by Firestore rule)
  - Updates `updatedAt` timestamp
  - Firestore rule: `resource.data.sellerId == request.auth.uid`

**Delete Operations:**
- **Deleting Listing**: `listingsService.deleteListing()` (line 357-381)
  - Only owner can delete
  - Firestore rule: `resource.data.sellerId == request.auth.uid`

**Authentication-Dependent Operations:**
- **Cart Operations**: Require authentication
  - `addToCart()`: Checks `isAuthenticated` in `ShopContext` (line 89)
  - Firestore rule: `request.auth.uid == userId`
- **User Profile Updates**: Require authentication
  - `updateUserProfile()`: Only user can update own profile
  - Firestore rule: `request.auth.uid == userId` (line 48 in `firestore.rules`)

---

## 3. MVC or Architectural Mapping Prompts

### Prompt 5: MVC Component Mapping

**Model (Data Layer):**
- **Location**: Firebase Firestore
- **Collections**:
  - `users` - User profiles
  - `listings` - Product listings
  - `cart` - Shopping cart items
  - `favorites` - Wishlist items
- **Access**: Via service layer (`src/services/`)

**View (Presentation Layer):**
- **Location**: `src/pages/` and `src/components/`
- **Page Components** (Route-level views):
  - `Home.tsx` - Homepage
  - `Marketplace.tsx` - Browse listings
  - `CreateListing.tsx` - Create listing form
  - `ListingDetailPage.tsx` - Listing details
  - `Profile.tsx` - User profile
  - `Checkout.tsx` - Checkout page
  - `LoginPage.tsx`, `RegisterPage.tsx` - Authentication
- **UI Components** (Reusable views):
  - `Button.tsx`, `Card.tsx`, `Input.tsx`, `Modal.tsx`
  - `Layout.tsx`, `Navbar.tsx`, `Footer.tsx`
- **Responsibilities**: Render UI, handle user interactions, display data from context

**Controller (Business Logic Layer):**
- **Location**: `src/context/` (state management) + `src/services/` (data access)
- **Context Providers** (State Controllers):
  - `AuthContext.tsx` - Authentication state and logic
  - `ShopContext.tsx` - Cart/wishlist state and operations
  - `ThemeContext.tsx` - UI theme state
- **Service Functions** (Data Controllers):
  - `userService.ts` - User CRUD operations
  - `listingsService.ts` - Listing CRUD operations
  - `cartService.ts` - Cart operations
  - `favoritesService.ts` - Wishlist operations
- **Responsibilities**: Business logic, state management, data transformation, error handling

**Utilities:**
- `src/utils/accessControl.ts` - RBAC helper functions
- `src/utils/helpers.ts` - General utility functions
- `src/utils/constants.ts` - Application constants

### Prompt 6: Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (View)                │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                      │
│  - Home.tsx, Marketplace.tsx, CreateListing.tsx              │
│  - Profile.tsx, Checkout.tsx, LoginPage.tsx                 │
│                                                              │
│  Components:                                                 │
│  - Button.tsx, Card.tsx, Input.tsx, Modal.tsx                │
│  - Layout.tsx, Navbar.tsx, Footer.tsx                       │
└──────────────────────┬──────────────────────────────────────┘
                        │
                        │ React Context API
                        │
┌───────────────────────▼──────────────────────────────────────┐
│              CONTROLLER LAYER (Business Logic)              │
├─────────────────────────────────────────────────────────────┤
│  Context Providers:                                          │
│  - AuthContext.tsx (authentication state)                   │
│  - ShopContext.tsx (cart/wishlist state)                     │
│  - ThemeContext.tsx (UI theme)                               │
│                                                              │
│  Services (Data Access):                                     │
│  - userService.ts (user CRUD)                                │
│  - listingsService.ts (listing CRUD)                         │
│  - cartService.ts (cart operations)                           │
│  - favoritesService.ts (wishlist operations)                 │
│                                                              │
│  Utilities:                                                   │
│  - accessControl.ts (RBAC helpers)                           │
│  - helpers.ts (formatting, validation)                       │
│  - constants.ts (app constants)                              │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ Firebase SDK
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                    MODEL LAYER (Data Storage)                │
├─────────────────────────────────────────────────────────────┤
│  Firebase Firestore Collections:                             │
│  - users/{userId} (user profiles)                            │
│  - listings/{listingId} (product listings)                   │
│  - cart/{cartItemId} (shopping cart)                         │
│  - favorites/{favoriteId} (wishlist)                         │
│                                                              │
│  Firebase Authentication:                                     │
│  - User authentication (email/password)                      │
│  - JWT token management                                      │
│                                                              │
│  Security Rules:                                              │
│  - firestore.rules (access control)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Role-Based Access Control (RBAC) Prompts

### Prompt 7: RBAC Implementation

**Role Assignment:**
- **Storage**: User roles stored in Firestore `users/{userId}` document
- **Field**: `userType` (enum: `ADMIN`, `PREMIUM`, `REGULAR`, `GUEST`)
- **Default**: New users default to `REGULAR` (see `AuthContext.tsx` line 224)
- **Location**: `src/types/user.ts` defines `UserType` enum

**Permission Checks:**
- **Client-Side**: `src/utils/accessControl.ts` provides helper functions:
  - `canAccessFeature(userType, feature)` - Check feature access
  - `isAdmin(userType)` - Check if admin
  - `isPremium(userType)` - Check if premium or admin
  - `canEdit(userType)` - Check edit permission
  - `canDelete(userType)` - Check delete permission
- **Hook**: `useAccessControl()` in `src/hooks/useAccessControl.ts` provides React hook
- **Usage**: Components use `useAccessControl()` to check permissions

**Enforcement:**
1. **Frontend Enforcement**:
   - `ProtectedFeature` component wraps premium features
   - `CreateListing.tsx` checks `isPremium()` before allowing featured listings (line 15)
   - Components conditionally render based on `canAccessFeature()`

2. **Backend Enforcement** (Firestore Security Rules):
   - Rules in `firestore.rules` validate ownership
   - Rules check `request.auth.uid` for user identity
   - No role-based rules currently (only ownership-based)
   - **Note**: RBAC is primarily client-side; Firestore rules focus on ownership

**Feature Access Matrix:**
- **Admin**: All features (line 38-40 in `accessControl.ts`)
- **Premium**: Premium features + regular features
  - Featured listings, advanced analytics, bulk operations
- **Regular**: Basic features
  - Create/edit/delete listings, view marketplace
- **Guest**: Read-only (no write access)

### Prompt 8: Runtime Example - RBAC in Action

**Scenario**: A user with role `PREMIUM` attempts to create a featured listing.

**Flow:**
1. **User Action**: User fills form in `CreateListing.tsx` and checks "Featured Listing" checkbox
2. **Permission Check**: Component calls `isPremium()` from `useAccessControl()` (line 15)
3. **Access Control**: `isPremium()` checks `user.userType === UserType.PREMIUM || user.userType === UserType.ADMIN` (line 88-90 in `accessControl.ts`)
4. **Result**: If `PREMIUM` or `ADMIN`, checkbox is enabled; otherwise disabled
5. **Form Submission**: `handleSubmit()` in `CreateListing.tsx` (line 73)
   - Calls `createListing()` with `isFeatured: true` if user is premium
6. **Service Layer**: `listingsService.createListing()` (line 207)
   - Creates Firestore document with `isFeatured: true`
7. **Firestore Rule**: Rule validates `sellerId == request.auth.uid` (line 21 in `firestore.rules`)
   - **Note**: Firestore rules don't check role; they only validate ownership
8. **Success**: Listing created with featured status

**If Regular User Attempts Featured Listing:**
- Checkbox is disabled (client-side enforcement)
- Even if bypassed, Firestore would accept it (no server-side role check)
- **Security Gap**: Server-side role validation not implemented in Firestore rules

### Prompt 9: RBAC Framework/Database Support

**Framework Support:**
- **React**: No built-in RBAC; implemented via custom hooks and utilities
- **Firebase Auth**: Provides authentication only (not authorization)
- **Firestore Security Rules**: Support conditional logic but don't have built-in RBAC

**Current Implementation:**
- **Client-Side**: TypeScript enums and utility functions (`accessControl.ts`)
- **Database**: Firestore stores `userType` as string field
- **Security Rules**: Only check ownership, not roles
  - Example: `resource.data.sellerId == request.auth.uid` (ownership check)
  - Missing: Role-based rules like `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'premium'`

**Limitations:**
- RBAC enforcement is primarily client-side (can be bypassed)
- Firestore rules don't check user roles (only ownership)
- No server-side role validation

**Recommendation for Production:**
- Add Firestore security rules that read user document to check `userType`
- Implement Cloud Functions for server-side role validation
- Use Firebase Admin SDK for trusted role checks

---

## 5. Unit Testing & End-to-End Testing Prompts

### Prompt 10: Testing Setup

**Unit Testing:**
- **Tool**: Vitest (configured in `vitest.config.ts`)
- **Environment**: jsdom (simulates browser DOM)
- **Location**: `src/**/*.{test,spec}.{js,ts,jsx,tsx}`
- **Example**: `src/__tests__/App.test.tsx` - Basic test structure
- **Coverage**: `@vitest/coverage-v8` package (run with `npm run test:coverage`)
- **Configuration**:
  - `globals: true` - Global test functions
  - `environment: 'jsdom'` - Browser-like environment
  - Excludes E2E tests from unit test runs

**End-to-End Testing:**
- **Tool**: Playwright (configured in `playwright.config.ts`)
- **Location**: `tests/e2e/specs/`
- **Browsers**: Chromium, Firefox, WebKit (Safari)
- **Devices**: Desktop, Mobile Chrome, Mobile Safari, Tablet
- **Base URL**: `https://dormdeals-9cb29.web.app/` (production)
- **Features**:
  - Screenshots on failure
  - Video recording on retry
  - Trace collection on first retry
  - HTML reporter
- **Test Structure**: Page Object Model (see `tests/e2e/pages/`)

**Test Scripts** (from `package.json`):
- `npm test` - Run Vitest unit tests
- `npm run test:coverage` - Run with coverage report
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ui` - Run with Playwright UI
- `npm run test:e2e:headed` - Run in headed mode (visible browser)

**Coverage Measurement:**
- Vitest coverage via `@vitest/coverage-v8`
- Reports show line, branch, function, and statement coverage
- Run: `npm run test:coverage`

### Prompt 11: Test Generation Example

**Function**: `addToCart()` in `ShopContext.tsx`

**Conceptually Distinct Tests:**

1. **Authentication Test**
   - Test: User not authenticated → shows login popup
   - Assert: `showLoginPopup` is true, `loginPopupAction` is 'cart'

2. **Valid Addition Test**
   - Test: Authenticated user adds valid item → item added to cart
   - Mock: `addToCartService()` returns success
   - Assert: Cart items include new item, toast shown

3. **Invalid Item Test**
   - Test: Adding item with missing `id` → error shown
   - Assert: Toast error message, cart unchanged

4. **Duplicate Item Test**
   - Test: Adding item already in cart → quantity updated
   - Mock: `getCartItems()` returns existing item
   - Assert: Item quantity incremented, not duplicated

5. **Firestore Error Test**
   - Test: Firestore unavailable → error handled gracefully
   - Mock: `addToCartService()` throws error
   - Assert: Error toast shown, local state not corrupted

6. **Wishlist Removal Test**
   - Test: Adding to cart removes from wishlist
   - Setup: Item in wishlist
   - Assert: Item removed from wishlist, added to cart

7. **State Update Test**
   - Test: Cart state updates after successful addition
   - Assert: `cartItems` state includes new item, `isInCart` returns true

### Prompt 12: E2E Test Execution Flow

**Example Test**: "User adds item to cart" (from `tests/e2e/specs/`)

**Execution Flow:**

1. **Test Setup** (`beforeEach`):
   - Playwright navigates to base URL
   - Waits for page load
   - Initializes page objects (HomePage, NavbarComponent)

2. **Test Execution**:
   - Navigate to marketplace: `await page.goto('/marketplace')`
   - Wait for listings to load: `await page.waitForSelector('[data-testid="listing-card"]')`
   - Click "Add to Cart" button: `await page.click('[data-testid="add-to-cart-btn"]')`
   - Wait for authentication check (if needed)
   - If not authenticated: Fill login form, submit
   - Wait for cart drawer to open: `await page.waitForSelector('[data-testid="cart-drawer"]')`

3. **Assertions**:
   - Verify cart drawer is visible
   - Verify item appears in cart
   - Verify cart count badge updates
   - Verify success toast appears

4. **Test Teardown**:
   - Cleanup (if needed)
   - Screenshot on failure (if configured)
   - Video saved (if test failed)

**Playwright Configuration Impact:**
- `baseURL`: Pre-configured URL for navigation
- `timeout: 30000`: Maximum test duration
- `expect.timeout: 5000`: Maximum assertion wait time
- `screenshot: 'only-on-failure'`: Captures screenshot if test fails
- `video: 'retain-on-failure'`: Records video if test fails

**Browser Execution:**
- Playwright launches headless browser (or headed if `--headed` flag)
- Executes JavaScript, interacts with DOM
- Waits for network requests to complete
- Captures screenshots/videos as configured

---

## 6. Self-Discovery Prompt

### Prompt 13: Important Architectural Questions

Based on the DormDeals codebase, here are 10+ important questions to fully understand the system:

1. **Architecture Questions:**
   - Why was Firebase chosen over a custom backend? What are the tradeoffs?
   - How does the client-side architecture handle offline scenarios?
   - What is the strategy for handling Firestore query limitations (e.g., full-text search)?

2. **Security Questions:**
   - Why are RBAC checks only client-side? How can this be secured server-side?
   - How are Firestore security rules tested and validated?
   - What is the strategy for preventing client-side manipulation of user roles?

3. **Database Questions:**
   - Why is seller data denormalized in listings? What are the consistency implications?
   - How are Firestore indexes configured for performance?
   - What is the data migration strategy if schema changes are needed?

4. **Performance Questions:**
   - How is pagination implemented for large listing datasets?
   - What is the caching strategy for frequently accessed data?
   - How are images optimized (Base64 encoding vs. Firebase Storage)?

5. **State Management Questions:**
   - Why was Context API chosen over Redux? When would migration be needed?
   - How are race conditions handled in concurrent cart operations?
   - What is the strategy for state synchronization across browser tabs?

6. **Testing Questions:**
   - How are Firebase services mocked in unit tests?
   - What is the E2E test coverage for critical user flows?
   - How are Firestore security rules tested?

7. **Deployment Questions:**
   - How is the Express static server configured for production?
   - What is the CI/CD pipeline for deployments?
   - How are environment variables managed across environments?

8. **Scalability Questions:**
   - What are Firestore read/write limits and how are they monitored?
   - How would the system handle 10x user growth?
   - What is the strategy for database sharding if needed?

9. **Data Consistency Questions:**
   - How are transactions handled for multi-step operations (e.g., checkout)?
   - What happens if Firestore write succeeds but client state update fails?
   - How is data validated before writing to Firestore?

10. **Error Handling Questions:**
    - What is the global error handling strategy?
    - How are Firestore errors (permission-denied, unavailable) handled?
    - What is the user experience when Firebase services are down?

11. **Feature-Specific Questions:**
    - How is the messaging system implemented (if exists)?
    - How are payment transactions processed?
    - How are user reviews and ratings calculated and stored?

12. **Code Organization Questions:**
    - Why are services separate from context providers?
    - How are TypeScript types organized and shared?
    - What is the strategy for code splitting and lazy loading?

---

## Summary

This document provides detailed explanations of all 13 prompts based on the actual DormDeals codebase. Each explanation includes:
- Code references (file paths and line numbers)
- Flow diagrams where applicable
- Implementation details
- Security considerations
- Testing approaches

The explanations demonstrate understanding of:
- Client-side architecture with Firebase BaaS
- MVC pattern implementation in React
- RBAC implementation (client-side)
- Testing setup (Vitest + Playwright)
- Data modeling in Firestore
- Security rules and access control


