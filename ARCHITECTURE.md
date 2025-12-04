# Architecture Documentation

This document outlines the technical architecture, design decisions, and system structure of the DormDeals marketplace application.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Architectural Components](#architectural-components)
- [Component Responsibilities](#component-responsibilities)
- [MVC Architecture Mapping](#mvc-architecture-mapping)
- [Non-Functional Requirements](#non-functional-requirements)
- [Tradeoffs](#tradeoffs)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Design Decisions](#design-decisions)
- [Database Design](#database-design)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)

## 🏗️ System Overview

DormDeals is a **single-page application (SPA)** built with React and TypeScript, using **Firebase** as the complete backend-as-a-service (BaaS) solution. The application follows a **client-side architecture** where all business logic, authentication, and data operations are handled directly from the browser using Firebase SDKs.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser (SPA)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   React UI   │  │   Context    │  │   Services   │    │
│  │  Components  │◄─►│  Providers   │◄─►│  (Firebase)│    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
│         └──────────────────┴──────────────────┘            │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                             │ Firebase SDK
                             │
        ┌────────────────────┴────────────────────┐
        │                                            │
┌───────▼────────┐  ┌──────────────┐  ┌───────────▼──────┐
│ Firebase Auth  │  │  Firestore   │  │ Firebase Storage │
│ (Authentication)│  │  (Database)  │  │  (File Storage) │
└────────────────┘  └──────────────┘  └──────────────────┘
```

### Architecture Pattern: **Client-Side MVC with Firebase BaaS**

The application uses a **hybrid MVC pattern** where:
- **Model**: Firebase Firestore collections (users, listings, cart, favorites)
- **View**: React components (pages, UI components)
- **Controller**: React Context providers + Service layer (Firebase SDK wrappers)

## 🧩 Architectural Components

### 1. **Presentation Layer (View)**

**Location**: `src/components/`, `src/pages/`

**Components**:
- **Pages**: `Home.tsx`, `Marketplace.tsx`, `Profile.tsx`, `CreateListing.tsx`, etc.
- **UI Components**: `Button.tsx`, `Card.tsx`, `Modal.tsx`, `Input.tsx`, etc.
- **Layout Components**: `Layout.tsx`, `Navbar.tsx`, `Footer.tsx`

**Responsibility**:
- Render user interface
- Handle user interactions (clicks, form submissions)
- Display data from context/state
- Manage UI state (modals, drawers, loading states)

### 2. **State Management Layer (Controller)**

**Location**: `src/context/`

**Components**:
- **AuthContext**: Manages user authentication state
- **ShopContext**: Manages cart, wishlist, and shopping state
- **ThemeContext**: Manages UI theme (light/dark mode)

**Responsibility**:
- Maintain application-wide state
- Coordinate between UI and services
- Handle business logic (cart operations, authentication flow)
- Provide state to components via React Context

### 3. **Service Layer (Model Access)**

**Location**: `src/services/`

**Components**:
- **userService.ts**: User profile CRUD operations
- **listingsService.ts**: Listing CRUD operations
- **cartService.ts**: Cart operations
- **favoritesService.ts**: Wishlist operations
- **api.ts**: Legacy API configuration (minimal, mostly unused)

**Responsibility**:
- Abstract Firebase SDK calls
- Provide type-safe interfaces to Firebase operations
- Handle data transformation (Firestore ↔ TypeScript types)
- Error handling and retry logic
- Business rule enforcement

### 4. **Data Layer (Model)**

**Location**: Firebase Firestore

**Collections**:
- **users**: User profiles and metadata
- **listings**: Product listings
- **cart**: Shopping cart items (user-specific subcollections)
- **favorites**: Wishlist items (user-specific subcollections)

**Responsibility**:
- Persistent data storage
- Data validation via Firestore security rules
- Real-time data synchronization
- Query optimization via Firestore indexes

### 5. **Authentication Layer**

**Location**: Firebase Authentication + `src/context/AuthContext.tsx`

**Components**:
- Firebase Auth SDK (email/password)
- AuthContext wrapper

**Responsibility**:
- User authentication (login, signup, logout)
- Session management
- User identity verification
- Integration with Firestore security rules

### 6. **Static Server Layer**

**Location**: `index.js` (Express.js)

**Responsibility**:
- Serve static files (React build output)
- SPA routing fallback
- Health check endpoint (`/health`)
- **Note**: No API endpoints - all API operations are client-side via Firebase

## 📦 Component Responsibilities

### Frontend Components

| Component | Responsibility | Dependencies |
|-----------|---------------|--------------|
| **Pages** | Route-level components, page-specific UI | Context, Services |
| **UI Components** | Reusable UI elements (buttons, cards, inputs) | None (pure components) |
| **Layout Components** | Page structure (navbar, footer, layout wrapper) | Context (auth, theme) |
| **Context Providers** | Global state management, business logic | Services |
| **Services** | Firebase SDK wrappers, data access | Firebase SDK, Types |

### Backend Components (Firebase)

| Component | Responsibility | Access Method |
|-----------|---------------|---------------|
| **Firebase Auth** | User authentication, session management | `firebase/auth` SDK |
| **Firestore** | NoSQL document database | `firebase/firestore` SDK |
| **Firebase Storage** | File storage (images, documents) | `firebase/storage` SDK |
| **Security Rules** | Access control, data validation | Firestore Rules |

## 🎯 MVC Architecture Mapping

### Traditional MVC vs. DormDeals Architecture

```
Traditional MVC:
┌──────────┐    ┌──────────┐    ┌──────────┐
│   View   │◄──►│Controller│◄──►│  Model   │
│  (HTML)  │    │  (Logic) │    │ (Database)│
└──────────┘    └──────────┘    └──────────┘

DormDeals MVC:
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│      View        │    │    Controller     │    │      Model       │
│  React Components│◄──►│ Context Providers │◄──►│  Firestore DB   │
│  (UI Rendering)   │    │  + Services      │    │  (Collections)   │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Detailed MVC Mapping

#### **Model (Data Layer)**
- **Location**: Firebase Firestore
- **Representation**: 
  - Collections: `users`, `listings`, `cart`, `favorites`
  - Documents: Individual records (user profile, listing, cart item)
- **Access**: Via service layer (`userService`, `listingsService`, etc.)
- **Responsibilities**:
  - Data persistence
  - Data structure definition
  - Data validation (via security rules)

#### **View (Presentation Layer)**
- **Location**: `src/pages/`, `src/components/`
- **Representation**: React functional components
- **Access**: Direct rendering, receives props/context
- **Responsibilities**:
  - UI rendering
  - User interaction handling
  - Display data from context/state
  - No direct data access (goes through Controller)

#### **Controller (Business Logic Layer)**
- **Location**: `src/context/` (state management) + `src/services/` (data access)
- **Representation**: 
  - Context providers: `AuthContext`, `ShopContext`
  - Service functions: `createListing`, `addToCart`, `getUserProfile`
- **Responsibilities**:
  - Business logic (cart operations, authentication flow)
  - State management
  - Data transformation
  - Error handling
  - Coordinates between View and Model

### MVC Flow Example: Adding Item to Cart

```
1. VIEW (Marketplace.tsx)
   User clicks "Add to Cart" button
   ↓
2. CONTROLLER (ShopContext.addToCart)
   - Validates user authentication
   - Calls cartService.addToCart()
   - Updates local state
   - Shows success/error toast
   ↓
3. MODEL (Firestore cart collection)
   - Service writes to Firestore
   - Security rules validate access
   - Data persisted
   ↓
4. CONTROLLER (ShopContext)
   - Reloads cart from Firestore
   - Updates context state
   ↓
5. VIEW (Cart Drawer)
   - React re-renders with new cart items
   - User sees updated cart
```

## ⚡ Non-Functional Requirements/Properties

### 1. **Performance**

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| **Page Load Time** | < 3 seconds | Code splitting, lazy loading routes |
| **Time to Interactive** | < 5 seconds | Optimized bundle size, Firebase CDN |
| **API Response Time** | < 500ms | Firestore queries with indexes |
| **Image Loading** | Progressive loading | Base64 encoding, lazy loading |

**Mechanisms**:
- React lazy loading for routes (`React.lazy()`)
- Code splitting via Vite
- Firestore query optimization
- Firebase CDN for static assets

### 2. **Scalability**

| Aspect | Approach | Limitation |
|--------|----------|------------|
| **Horizontal Scaling** | Firebase auto-scales | Firestore read/write limits |
| **Data Growth** | Firestore collections | Document size limits (1MB) |
| **User Growth** | Firebase Auth scales | Concurrent connections |
| **Traffic Spikes** | Firebase CDN | Rate limiting per project |

**Scaling Strategy**:
- Client-side architecture reduces server load
- Firebase handles infrastructure scaling
- Firestore indexes for query performance
- Pagination for large datasets

### 3. **Reliability**

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| **Uptime** | 99.9% | Firebase SLA |
| **Data Durability** | 99.999% | Firebase replication |
| **Error Recovery** | Graceful degradation | Try-catch, fallback UI |
| **Offline Support** | Basic caching | Browser localStorage |

**Reliability Mechanisms**:
- Firebase multi-region replication
- Error boundaries in React
- Retry logic in services
- Offline data caching

### 4. **Security**

| Requirement | Implementation |
|-------------|----------------|
| **Authentication** | Firebase Auth (email/password) |
| **Authorization** | Firestore Security Rules |
| **Data Encryption** | Firebase TLS in transit, encryption at rest |
| **Input Validation** | Client-side + Firestore rules |
| **XSS Protection** | React auto-escaping |
| **CSRF Protection** | Firebase token-based auth |

**Security Layers**:
1. **Client-side**: Input validation, sanitization
2. **Firebase Auth**: Token-based authentication
3. **Firestore Rules**: Server-side access control
4. **HTTPS**: All communications encrypted

### 5. **Maintainability**

| Aspect | Approach |
|--------|----------|
| **Code Organization** | Feature-based structure |
| **Type Safety** | TypeScript throughout |
| **Documentation** | JSDoc comments, README |
| **Testing** | Unit tests, E2E tests |
| **Code Quality** | ESLint, Prettier |

### 6. **Usability**

| Requirement | Implementation |
|-------------|----------------|
| **Responsive Design** | Tailwind CSS breakpoints |
| **Accessibility** | Semantic HTML, ARIA labels |
| **Loading States** | Loading spinners, skeletons |
| **Error Messages** | User-friendly error toasts |
| **Dark Mode** | ThemeContext |

## ⚖️ Tradeoffs

### 1. **Firebase BaaS vs. Custom Backend**

| Aspect | Firebase (Chosen) | Custom Backend (Alternative) |
|--------|-------------------|------------------------------|
| **Development Speed** | ✅ Fast (no backend code) | ❌ Slower (build everything) |
| **Cost** | ⚠️ Pay per use | ✅ Fixed server costs |
| **Control** | ❌ Limited customization | ✅ Full control |
| **Scalability** | ✅ Auto-scales | ⚠️ Manual scaling |
| **Vendor Lock-in** | ❌ High | ✅ None |
| **Complex Queries** | ⚠️ Limited (Firestore) | ✅ Full SQL power |

**Decision Rationale**: 
- Faster time-to-market
- Reduced infrastructure management
- Built-in authentication and security
- Acceptable cost for MVP/early stage

### 2. **Client-Side vs. Server-Side Rendering**

| Aspect | Client-Side (Chosen) | Server-Side (Alternative) |
|--------|---------------------|---------------------------|
| **Initial Load** | ❌ Slower | ✅ Faster |
| **Interactivity** | ✅ Fast after load | ⚠️ Requires round-trips |
| **SEO** | ⚠️ Requires SSR | ✅ Better |
| **Server Load** | ✅ Minimal | ❌ High |
| **Complexity** | ✅ Simpler | ❌ More complex |

**Decision Rationale**:
- Better user experience after initial load
- Simpler architecture (no SSR setup)
- Firebase works well with SPAs
- SEO not critical for marketplace (users find via app)

### 3. **Firestore vs. PostgreSQL**

| Aspect | Firestore (Chosen) | PostgreSQL (Alternative) |
|--------|-------------------|--------------------------|
| **Query Flexibility** | ⚠️ Limited | ✅ Full SQL |
| **Relationships** | ⚠️ Manual (references) | ✅ Foreign keys |
| **Transactions** | ⚠️ Limited | ✅ Full ACID |
| **Real-time Updates** | ✅ Built-in | ❌ Requires WebSockets |
| **Scalability** | ✅ Auto-scales | ⚠️ Manual |
| **Cost** | ⚠️ Pay per read/write | ✅ Fixed |

**Decision Rationale**:
- Real-time capabilities needed
- Simpler data model (marketplace doesn't need complex joins)
- Auto-scaling important for growth
- Reduced operational overhead

### 4. **Context API vs. Redux**

| Aspect | Context API (Chosen) | Redux (Alternative) |
|--------|---------------------|---------------------|
| **Boilerplate** | ✅ Minimal | ❌ High |
| **Learning Curve** | ✅ Easy | ⚠️ Steeper |
| **DevTools** | ❌ Limited | ✅ Excellent |
| **Performance** | ⚠️ Can cause re-renders | ✅ Optimized |
| **Complexity** | ✅ Simple | ❌ More complex |

**Decision Rationale**:
- Application complexity doesn't require Redux
- Faster development
- Easier for team to understand
- Can migrate to Redux if needed later

### 5. **Static Server vs. Full Backend**

| Aspect | Static Server (Chosen) | Full Backend (Alternative) |
|--------|------------------------|---------------------------|
| **Deployment** | ✅ Simple (static files) | ⚠️ More complex |
| **Cost** | ✅ Lower | ❌ Higher |
| **API Endpoints** | ❌ None (Firebase only) | ✅ Custom APIs |
| **Business Logic** | ⚠️ Client-side | ✅ Server-side |
| **Security** | ⚠️ Client-exposed | ✅ Server-protected |

**Decision Rationale**:
- Firebase handles all backend needs
- Simpler deployment (just static files)
- Lower operational costs
- Security handled by Firebase rules

## 📁 Project Structure

### Frontend Structure (`/src`)

```
src/
├── components/           # Reusable UI components (View)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Modal.tsx
│   ├── ProtectedRoute.tsx
│   └── ...
├── context/             # State management (Controller)
│   ├── AuthContext.tsx  # Authentication state
│   ├── ShopContext.tsx # Cart/wishlist state
│   └── ThemeContext.tsx # Theme state
├── pages/               # Page components (View)
│   ├── Home.tsx
│   ├── Marketplace.tsx
│   ├── Profile.tsx
│   ├── CreateListing.tsx
│   └── ...
├── services/           # Firebase service layer (Controller)
│   ├── userService.ts      # User CRUD
│   ├── listingsService.ts  # Listing CRUD
│   ├── cartService.ts      # Cart operations
│   ├── favoritesService.ts # Wishlist operations
│   └── api.ts              # Legacy API config (unused)
├── config/             # Configuration
│   └── firebase.ts     # Firebase initialization
├── types/              # TypeScript definitions
│   ├── index.ts
│   └── user.ts
├── utils/              # Utility functions
│   ├── constants.ts
│   ├── helpers.ts
│   ├── accessControl.ts
│   └── animations.ts
├── hooks/              # Custom React hooks
│   └── useAccessControl.ts
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

### Backend Structure (Minimal)

```
├── index.js            # Express static server
├── package.json        # Dependencies
└── dist/               # Built React app (served statically)
```

## 🔄 Data Flow

### Authentication Flow

```
1. User enters credentials
   ↓
2. AuthContext.login()
   ↓
3. Firebase Auth SDK (signInWithEmailAndPassword)
   ↓
4. Firebase Auth validates
   ↓
5. AuthContext receives Firebase User
   ↓
6. userService.getUserProfile() fetches Firestore profile
   ↓
7. AuthContext updates state
   ↓
8. Components re-render with user data
```

### Data Creation Flow (Creating Listing)

```
1. User fills form (CreateListing.tsx)
   ↓
2. Form submission handler
   ↓
3. listingsService.createListing()
   ↓
4. Firebase Firestore SDK (addDoc)
   ↓
5. Firestore Security Rules validate
   ↓
6. Document created in Firestore
   ↓
7. Service returns created listing
   ↓
8. Component navigates to listing page
```

### Data Reading Flow (Loading Marketplace)

```
1. Marketplace component mounts
   ↓
2. useEffect triggers
   ↓
3. listingsService.getListings()
   ↓
4. Firebase Firestore SDK (getDocs with query)
   ↓
5. Firestore returns documents
   ↓
6. Service transforms to Item[] type
   ↓
7. Component state updates
   ↓
8. Component renders listings
```

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Library |
| TypeScript | 5.9.3 | Type Safety |
| Vite | 6.4.1 | Build Tool |
| Tailwind CSS | 3.3.6 | Styling |
| Framer Motion | 10.16.16 | Animations |
| React Router DOM | 6.30.1 | Routing |
| Firebase SDK | 12.5.0 | Backend Services |
| React Hot Toast | 2.4.1 | Notifications |

### Backend Technologies (Firebase)

| Service | Purpose |
|---------|---------|
| Firebase Authentication | User auth (email/password) |
| Firestore | NoSQL database |
| Firebase Storage | File storage (future) |
| Firebase Hosting | Static hosting (optional) |

### Server Technologies (Minimal)

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Static file server |
| Helmet | Security headers |
| CORS | Cross-origin support |

## 🎯 Design Decisions

### 1. **Firebase-First Architecture**

**Decision**: Use Firebase as complete backend solution.

**Rationale**:
- Rapid development (no backend code)
- Built-in authentication and security
- Real-time capabilities
- Auto-scaling infrastructure
- Reduced operational overhead

**Tradeoffs**: Vendor lock-in, cost scaling, limited query flexibility

### 2. **Client-Side State Management**

**Decision**: React Context API for global state.

**Rationale**:
- Simpler than Redux
- Built into React
- Sufficient for current complexity
- Easy to understand

**Tradeoffs**: Can cause unnecessary re-renders, no time-travel debugging

### 3. **TypeScript Throughout**

**Decision**: Full TypeScript adoption.

**Rationale**:
- Type safety catches errors early
- Better IDE support
- Self-documenting code
- Easier refactoring

**Tradeoffs**: Slightly slower development, learning curve

### 4. **Component-Based Architecture**

**Decision**: React functional components with hooks.

**Rationale**:
- Modern React patterns
- Easier to test
- Better performance
- Hooks for reusable logic

**Tradeoffs**: Learning curve for hooks, potential over-abstraction

## 🗄️ Database Design (Firestore)

### Collections Structure

```
Firestore
├── users/                    # User profiles
│   └── {userId}/
│       ├── email: string
│       ├── displayName: string
│       ├── userType: enum
│       ├── school: string
│       ├── rating: number
│       └── ...
├── listings/                 # Product listings
│   └── {listingId}/
│       ├── title: string
│       ├── description: string
│       ├── price: number
│       ├── sellerId: string
│       ├── category: string
│       ├── isActive: boolean
│       └── ...
├── cart/                     # Shopping carts (user subcollections)
│   └── {userId}/
│       └── items/
│           └── {itemId}/
│               ├── listingId: string
│               ├── quantity: number
│               └── ...
└── favorites/                # Wishlists (user subcollections)
    └── {userId}/
        └── items/
            └── {itemId}/
                └── listingId: string
```

### Data Relationships

- **Users ↔ Listings**: One-to-many (user.sellerId → listing.sellerId)
- **Users ↔ Cart**: One-to-many (user subcollection)
- **Users ↔ Favorites**: One-to-many (user subcollection)
- **Listings ↔ Cart**: Many-to-many (via cart items)

### Indexes

Firestore requires composite indexes for:
- Listings queries: `sellerId + isActive + createdAt`
- Search queries: `category + isActive + createdAt`

## 🔒 Security Architecture

### Authentication Flow

1. **User Registration/Login**
   - Firebase Auth handles credentials
   - JWT tokens managed by Firebase
   - Tokens stored in browser memory

2. **Authorization**
   - Firestore Security Rules enforce access
   - Rules check `request.auth.uid`
   - User can only access their own data

### Security Rules Example

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: read own profile, write own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Listings: read all active, write own
    match /listings/{listingId} {
      allow read: if resource.data.isActive == true;
      allow create: if request.auth != null && 
                       request.resource.data.sellerId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.sellerId == request.auth.uid;
    }
    
    // Cart: user can only access their own cart
    match /cart/{userId}/{document=**} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == userId;
    }
  }
}
```

## 🚀 Deployment Architecture

### Production Architecture

```
┌─────────────────────────────────────────┐
│         Render Platform                 │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Express Static Server           │  │
│  │   - Serves React build (dist/)    │  │
│  │   - Health check endpoint         │  │
│  │   - SPA routing fallback          │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
              │
              │ HTTPS
              │
┌─────────────▼─────────────────────────────┐
│         Firebase Services                │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   Auth   │  │ Firestore│  │Storage │ │
│  └──────────┘  └──────────┘  └────────┘ │
└──────────────────────────────────────────┘
```

### Deployment Flow

1. **Build**: `npm run build` → Creates `dist/` folder
2. **Deploy**: Render serves `dist/` via Express
3. **Runtime**: Browser loads React app
4. **Data Access**: App connects directly to Firebase

### Environment Variables

**Client-side (VITE_*)**:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**Server-side**:
- `PORT` (Render sets automatically)
- `NODE_ENV=production`

---

## 📊 Architecture Summary

### Key Characteristics

1. **Client-Side Architecture**: All logic runs in browser
2. **Firebase BaaS**: Complete backend via Firebase
3. **MVC Pattern**: React components (View), Context/Services (Controller), Firestore (Model)
4. **Type-Safe**: TypeScript throughout
5. **Component-Based**: React functional components
6. **State Management**: Context API for global state

### Strengths

- ✅ Rapid development
- ✅ Auto-scaling infrastructure
- ✅ Built-in security
- ✅ Real-time capabilities
- ✅ Simple deployment

### Limitations

- ⚠️ Vendor lock-in (Firebase)
- ⚠️ Cost scales with usage
- ⚠️ Limited query flexibility (Firestore)
- ⚠️ Client-side business logic (security concerns)

---

**Last Updated**: After Firebase-only migration (PostgreSQL removed)
**Architecture Version**: 2.0 (Firebase BaaS)
