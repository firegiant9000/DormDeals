# Architecture Documentation

This document outlines the technical architecture, design decisions, and system structure of the DormDeals marketplace application.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Project Structure](#project-structure)
- [Component Hierarchy](#component-hierarchy)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Design Decisions](#design-decisions)
- [Database Design](#database-design)
- [API Design](#api-design)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)

## 🏗️ System Overview

DormDeals is a full-stack web application built with a modern architecture that separates concerns between the frontend and backend. The application follows a client-server model with a React-based frontend communicating with a Node.js/Express backend through RESTful APIs.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express.js)  │◄──►│   (PostgreSQL)  │
│   Port: 5173    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

### Frontend Structure (`/src`)

```
src/
├── components/           # Reusable UI components
│   ├── Button.tsx       # Custom button component
│   ├── Card.tsx         # Card layout component
│   ├── Layout.tsx       # Main layout wrapper
│   ├── Navbar.tsx       # Navigation component
│   ├── Footer.tsx       # Footer component
│   ├── Modal.tsx        # Modal dialog component
│   ├── Input.tsx        # Form input component
│   ├── LoadingSpinner.tsx # Loading indicator
│   ├── PageTransition.tsx # Page transition wrapper
│   ├── SearchFiltersBar.tsx # Search and filter UI
│   ├── CartSummary.tsx  # Shopping cart summary
│   └── index.ts         # Component exports
├── context/             # React Context providers
│   ├── ShopContext.tsx  # Shopping cart and app state
│   └── ThemeContext.tsx # Theme management
├── pages/               # Page components (routes)
│   ├── Home.tsx         # Landing page
│   ├── Marketplace.tsx  # Main marketplace view
│   ├── ItemDetail.tsx   # Individual item view
│   ├── CreateListing.tsx # Create new listing
│   ├── Profile.tsx      # User profile page
│   ├── ResultsPage.tsx  # Search results page
│   ├── AboutPage.tsx    # About page
│   ├── MainFeaturePage.tsx # Feature showcase
│   ├── ListingDetailPage.tsx # Detailed listing view
│   ├── MessagePage.tsx  # Messaging interface
│   ├── Checkout.tsx     # Checkout process
│   └── NotFoundPage.tsx # 404 error page
├── services/            # API and external services
│   ├── api.ts          # API configuration
│   └── apiService.ts   # API service functions
├── types/               # TypeScript type definitions
│   └── index.ts        # Shared type definitions
├── utils/               # Utility functions
│   ├── constants.ts    # Application constants
│   ├── helpers.ts      # Helper functions
│   └── animations.ts   # Animation utilities
├── __tests__/          # Test files
│   └── App.test.tsx    # Main app tests
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

### Backend Structure

```
├── index.js            # Main server entry point
├── database/
│   └── schema.sql      # Database schema definition
├── package.json        # Dependencies and scripts
└── [Backend modules will be added here]
```

## 🧩 Component Hierarchy

### Main Application Structure

```
App
├── Layout
│   ├── Navbar
│   │   ├── Logo
│   │   ├── Navigation Links
│   │   ├── Search Bar
│   │   └── User Menu
│   ├── Main Content Area
│   │   └── [Page Components]
│   └── Footer
│       ├── Links
│       ├── Social Media
│       └── Copyright
└── ShopDrawers (Context)
    ├── Cart Drawer
    ├── Wishlist Drawer
    └── Notifications
```

### Page Component Hierarchy

#### Marketplace Page
```
Marketplace
├── SearchFiltersBar
│   ├── Search Input
│   ├── Category Filter
│   ├── Price Range Filter
│   └── Sort Options
├── Item Grid
│   └── ItemCard (multiple)
│       ├── Item Image
│       ├── Item Title
│       ├── Price
│       ├── Seller Info
│       └── Action Buttons
└── Pagination
```

#### Item Detail Page
```
ItemDetail
├── Image Gallery
├── Item Information
│   ├── Title
│   ├── Price
│   ├── Description
│   ├── Condition
│   └── Category
├── Seller Information
│   ├── Seller Name
│   ├── Rating
│   └── Contact Button
├── Action Buttons
│   ├── Add to Cart
│   ├── Add to Wishlist
│   └── Message Seller
└── Related Items
```

#### Create Listing Page
```
CreateListing
├── Form Container
│   ├── Image Upload
│   ├── Basic Information
│   │   ├── Title Input
│   │   ├── Description Textarea
│   │   ├── Category Select
│   │   └── Condition Select
│   ├── Pricing
│   │   ├── Price Input
│   │   └── Negotiable Checkbox
│   └── Submit Button
└── Preview Section
```

### Context Providers

#### ShopContext
```typescript
interface ShopContextType {
  // Cart Management
  cart: CartItem[]
  addToCart: (item: Item) => void
  removeFromCart: (itemId: string) => void
  updateCartQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  
  // Wishlist Management
  wishlist: Item[]
  addToWishlist: (item: Item) => void
  removeFromWishlist: (itemId: string) => void
  
  // UI State
  isCartOpen: boolean
  isWishlistOpen: boolean
  toggleCart: () => void
  toggleWishlist: () => void
}
```

#### ThemeContext
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}
```

## 🔄 Data Flow

### Frontend Data Flow

```
User Interaction
       ↓
Component Event Handler
       ↓
Context/Action Dispatch
       ↓
API Service Call
       ↓
HTTP Request (Axios)
       ↓
Backend API Endpoint
       ↓
Database Query
       ↓
Response Processing
       ↓
State Update
       ↓
Component Re-render
```

### State Management Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Action   │───►│   Context       │───►│   API Service   │
│   (Click, Form) │    │   (State Mgmt)  │    │   (HTTP Calls)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Component     │◄───│   Backend API   │
                       │   Re-render     │    │   (Express.js)  │
                       └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   Database      │
                                               │   (PostgreSQL)  │
                                               └─────────────────┘
```

### API Data Flow

```
Frontend Request
       ↓
Express.js Middleware
├── CORS
├── Helmet (Security)
├── Morgan (Logging)
└── Body Parser
       ↓
Route Handler
       ↓
Business Logic
       ↓
Database Query
       ↓
Response Formatting
       ↓
JSON Response
       ↓
Frontend Processing
```

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Library |
| TypeScript | 5.2.2 | Type Safety |
| Vite | 6.4.1 | Build Tool |
| Tailwind CSS | 3.3.6 | Styling |
| Framer Motion | 10.16.16 | Animations |
| React Router DOM | 6.30.1 | Routing |
| Axios | 1.6.2 | HTTP Client |
| React Hot Toast | 2.4.1 | Notifications |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 16.0.0+ | Runtime |
| Express.js | 4.18.2 | Web Framework |
| PostgreSQL | 12+ | Database |
| CORS | 2.8.5 | Cross-Origin |
| Helmet | 7.1.0 | Security |
| Morgan | 1.10.0 | Logging |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code Linting |
| Jest | Testing Framework |
| Testing Library | Component Testing |
| Nodemon | Development Server |
| Concurrently | Multi-command Runner |

## 🎯 Design Decisions

### Frontend Architecture Decisions

#### 1. React with TypeScript
**Decision**: Use React with TypeScript for type safety and better developer experience.
**Rationale**: 
- Type safety catches errors at compile time
- Better IDE support and autocomplete
- Easier refactoring and maintenance
- Improved code documentation

#### 2. Context API for State Management
**Decision**: Use React Context API instead of Redux for state management.
**Rationale**:
- Simpler setup and less boilerplate
- Sufficient for current application complexity
- Built-in React solution
- Easier to understand for team members

#### 3. Tailwind CSS for Styling
**Decision**: Use Tailwind CSS for utility-first styling.
**Rationale**:
- Rapid development with utility classes
- Consistent design system
- Small bundle size with purging
- Easy to maintain and customize

#### 4. Vite as Build Tool
**Decision**: Use Vite instead of Create React App.
**Rationale**:
- Faster development server
- Better performance
- Modern build tooling
- Better TypeScript support

### Backend Architecture Decisions

#### 1. Express.js Framework
**Decision**: Use Express.js for the backend API.
**Rationale**:
- Lightweight and flexible
- Large ecosystem and community
- Easy to learn and implement
- Good performance

#### 2. PostgreSQL Database
**Decision**: Use PostgreSQL as the primary database.
**Rationale**:
- ACID compliance for data integrity
- Strong typing and constraints
- JSON support for flexible data
- Excellent performance and scalability

#### 3. RESTful API Design
**Decision**: Implement RESTful API endpoints.
**Rationale**:
- Standard and well-understood pattern
- Easy to consume by frontend
- Good caching support
- Clear separation of concerns

### Security Decisions

#### 1. CORS Configuration
**Decision**: Implement proper CORS settings.
**Rationale**:
- Prevents unauthorized cross-origin requests
- Configurable for different environments
- Essential for production security

#### 2. Helmet Middleware
**Decision**: Use Helmet for security headers.
**Rationale**:
- Sets various HTTP headers for security
- Protects against common vulnerabilities
- Easy to implement and configure

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Users       │    │     Items       │    │   Categories    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ email           │◄───┤ seller_id (FK)  │    │ name            │
│ password_hash   │    │ title           │    │ description     │
│ first_name      │    │ description     │    │ created_at      │
│ last_name       │    │ price           │    └─────────────────┘
│ phone           │    │ category_id (FK)│              │
│ created_at      │    │ condition       │              │
│ updated_at      │    │ status          │              │
└─────────────────┘    │ created_at      │              │
                       │ updated_at      │              │
                       └─────────────────┘              │
                                │                       │
                                │                       │
                       ┌─────────────────┐              │
                       │   Item_Images   │              │
                       ├─────────────────┤              │
                       │ id (PK)         │              │
                       │ item_id (FK)    │              │
                       │ image_url       │              │
                       │ is_primary      │              │
                       │ created_at      │              │
                       └─────────────────┘              │
                                                        │
┌─────────────────┐    ┌─────────────────┐              │
│     Orders      │    │   Order_Items   │              │
├─────────────────┤    ├─────────────────┤              │
│ id (PK)         │    │ id (PK)         │              │
│ buyer_id (FK)   │◄───┤ order_id (FK)   │              │
│ total_amount    │    │ item_id (FK)    │              │
│ status          │    │ quantity        │              │
│ created_at      │    │ price           │              │
│ updated_at      │    └─────────────────┘              │
└─────────────────┘                                     │
                                                        │
┌─────────────────┐    ┌─────────────────┐              │
│    Messages     │    │   Conversations │              │
├─────────────────┤    ├─────────────────┤              │
│ id (PK)         │    │ id (PK)         │              │
│ conversation_id │◄───┤ buyer_id (FK)   │              │
│ sender_id (FK)  │    │ seller_id (FK)  │              │
│ content         │    │ item_id (FK)    │              │
│ created_at      │    │ created_at      │              │
└─────────────────┘    └─────────────────┘              │
                                                        │
                       ┌─────────────────┐              │
                       │   Cart_Items    │              │
                       ├─────────────────┤              │
                       │ id (PK)         │              │
                       │ user_id (FK)    │              │
                       │ item_id (FK)    │              │
                       │ quantity        │              │
                       │ created_at      │              │
                       └─────────────────┘              │
                                                        │
                       ┌─────────────────┐              │
                       │   Wishlist      │              │
                       ├─────────────────┤              │
                       │ id (PK)         │              │
                       │ user_id (FK)    │              │
                       │ item_id (FK)    │              │
                       │ created_at      │              │
                       └─────────────────┘              │
                                                        │
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   Categories    │
                                              └─────────────────┘
```

### Database Schema Details

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Items Table
```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    condition VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Design

### RESTful Endpoints

#### Authentication Endpoints
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
POST   /api/auth/refresh      # Refresh token
```

#### User Endpoints
```
GET    /api/users/profile     # Get user profile
PUT    /api/users/profile     # Update user profile
GET    /api/users/:id         # Get user by ID
```

#### Item Endpoints
```
GET    /api/items             # Get all items (with pagination)
GET    /api/items/:id         # Get item by ID
POST   /api/items             # Create new item
PUT    /api/items/:id         # Update item
DELETE /api/items/:id         # Delete item
GET    /api/items/search      # Search items
```

#### Category Endpoints
```
GET    /api/categories        # Get all categories
GET    /api/categories/:id    # Get category by ID
```

#### Cart Endpoints
```
GET    /api/cart              # Get user's cart
POST   /api/cart/items        # Add item to cart
PUT    /api/cart/items/:id    # Update cart item
DELETE /api/cart/items/:id    # Remove item from cart
DELETE /api/cart              # Clear cart
```

#### Order Endpoints
```
GET    /api/orders            # Get user's orders
POST   /api/orders            # Create new order
GET    /api/orders/:id        # Get order by ID
PUT    /api/orders/:id        # Update order status
```

#### Message Endpoints
```
GET    /api/conversations     # Get user's conversations
POST   /api/conversations     # Create new conversation
GET    /api/conversations/:id # Get conversation messages
POST   /api/conversations/:id/messages # Send message
```

### API Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

## 🔒 Security Architecture

### Authentication & Authorization

#### JWT Token Strategy
```
1. User logs in with credentials
2. Server validates credentials
3. Server generates JWT token with user info
4. Token sent to client and stored securely
5. Client includes token in subsequent requests
6. Server validates token on each request
```

#### Password Security
- Passwords hashed using bcrypt
- Minimum password requirements
- Password reset functionality
- Account lockout after failed attempts

### Data Protection

#### Input Validation
- Server-side validation for all inputs
- SQL injection prevention
- XSS protection
- File upload restrictions

#### HTTPS Enforcement
- All communications encrypted
- Secure cookie settings
- HSTS headers
- Certificate validation

### Security Headers

```javascript
// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 🚀 Deployment Architecture

### Development Environment
```
Developer Machine
├── Frontend (Vite Dev Server) - Port 5173
├── Backend (Express.js) - Port 3001
└── Database (PostgreSQL) - Port 5432
```

### Production Environment
```
Load Balancer
├── Frontend (Static Files)
│   └── CDN (Static Assets)
├── Backend (Express.js)
│   ├── API Server 1
│   └── API Server 2
└── Database
    ├── Primary (PostgreSQL)
    └── Replica (PostgreSQL)
```

### Deployment Strategy

#### Frontend Deployment
1. Build production bundle (`npm run build`)
2. Deploy static files to CDN
3. Configure caching headers
4. Set up SSL certificate

#### Backend Deployment
1. Build and test application
2. Deploy to server with PM2
3. Configure reverse proxy (Nginx)
4. Set up monitoring and logging

#### Database Deployment
1. Set up PostgreSQL cluster
2. Configure backups
3. Set up monitoring
4. Configure connection pooling

---

**Note**: This architecture documentation should be updated as the system evolves and new components are added. Regular reviews ensure the documentation remains accurate and useful for the development team.
