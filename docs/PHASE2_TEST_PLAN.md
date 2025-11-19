# Phase 2 Test Plan - Authentication, User Types, Access Control & Real Data

## 📋 Table of Contents

- [Overview](#overview)
- [Test Environment Setup](#test-environment-setup)
- [1. Authentication Testing](#1-authentication-testing)
- [2. User Type Testing](#2-user-type-testing)
- [3. Access Control Testing](#3-access-control-testing)
- [4. Real Data Testing](#4-real-data-testing)
- [Test Execution Summary](#test-execution-summary)

## Overview

This test plan covers comprehensive testing for Phase 2 features:
- **Authentication**: Login, signup, logout, and protected routes
- **User Types**: Regular, Premium, Admin, and Guest user type management
- **Access Control**: Feature access based on user types
- **Real Data**: API integration, error handling, and loading states

**Test Coverage**: Functional, Integration, UI, and Security testing

---

## Test Environment Setup

### Prerequisites
- [ ] Application is running (`npm run dev`)
- [ ] Firebase is configured and connected
- [ ] Backend API is running
- [ ] Database is accessible
- [ ] Test user accounts are created:
  - [ ] Regular user account
  - [ ] Premium user account
  - [ ] Admin user account
- [ ] Browser developer tools are open (F12)
- [ ] Network tab is open for API monitoring
- [ ] Console is clear of errors

### Test Data Preparation
- [ ] Valid test email addresses ready
- [ ] Invalid test email addresses ready
- [ ] Valid passwords (minimum 6 characters)
- [ ] Invalid passwords (< 6 characters)
- [ ] Test items/listings available in database

---

## 1. Authentication Testing

### Test Case: TC-AUTH-001 - Login with Valid Credentials
**Priority**: High  
**Component**: Frontend, Backend  
**Test Type**: Functional

**Preconditions**:
- User account exists in Firebase
- User is on the login page (`/login`)
- Application is running

**Test Steps**:
1. Navigate to login page
2. Enter valid email address (e.g., `testuser@example.com`)
3. Enter valid password (e.g., `password123`)
4. Click "Login" button
5. Wait for authentication to complete

**Expected Results**:
- [ ] Login form accepts input
- [ ] Loading state appears on button during authentication
- [ ] User is successfully authenticated
- [ ] Success toast notification appears: "Login successful"
- [ ] User is redirected to homepage (`/`)
- [ ] User profile is loaded and displayed
- [ ] User is logged in (check auth state)
- [ ] No console errors
- [ ] Network request to Firebase succeeds (status 200)

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-AUTH-002 - Login with Invalid Email
**Priority**: High  
**Component**: Frontend  
**Test Type**: Functional, Validation

**Preconditions**:
- User is on the login page
- Application is running

**Test Steps**:
1. Navigate to login page
2. Enter invalid email address (e.g., `invalid-email`)
3. Enter any password
4. Click "Login" button

**Expected Results**:
- [ ] Form validation prevents submission OR
- [ ] Error message appears: "Invalid email address"
- [ ] Error toast notification appears
- [ ] User remains on login page
- [ ] User is NOT authenticated
- [ ] No redirect occurs
- [ ] Error is displayed in red styling

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-AUTH-003 - Login with Invalid Password
**Priority**: High  
**Component**: Frontend, Backend  
**Test Type**: Functional, Security

**Preconditions**:
- Valid user account exists
- User is on the login page

**Test Steps**:
1. Navigate to login page
2. Enter valid email address
3. Enter incorrect password (e.g., `wrongpassword`)
4. Click "Login" button
5. Wait for response

**Expected Results**:
- [ ] Error message appears: "Incorrect password" OR "No account found with this email"
- [ ] Error toast notification appears
- [ ] User remains on login page
- [ ] User is NOT authenticated
- [ ] Password field may be highlighted in red
- [ ] No redirect occurs
- [ ] Network request fails with appropriate error code

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-AUTH-004 - Login with Non-Existent User
**Priority**: Medium  
**Component**: Frontend, Backend  
**Test Type**: Functional

**Preconditions**:
- User account does NOT exist
- User is on the login page

**Test Steps**:
1. Navigate to login page
2. Enter non-existent email (e.g., `nonexistent@example.com`)
3. Enter any password
4. Click "Login" button

**Expected Results**:
- [ ] Error message appears: "No account found with this email"
- [ ] Error toast notification appears
- [ ] User remains on login page
- [ ] User is NOT authenticated
- [ ] No redirect occurs

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-AUTH-005 - Signup with Valid Data
**Priority**: High  
**Component**: Frontend, Backend  
**Test Type**: Functional

**Preconditions**:
- User is on the registration page (`/register`)
- Email address is not already registered
- Application is running

**Test Steps**:
1. Navigate to registration page
2. Enter display name (e.g., `Test User`)
3. Enter valid email address (e.g., `newuser@example.com`)
4. Enter valid password (minimum 6 characters, e.g., `password123`)
5. Enter matching password in confirm password field
6. Click "Sign Up" or "Register" button
7. Wait for account creation

**Expected Results**:
- [ ] All form fields accept input
- [ ] Loading state appears on button during registration
- [ ] User account is created in Firebase
- [ ] User profile is created in Firestore with:
  - [ ] Default userType: `REGULAR`
  - [ ] Email matches input
  - [ ] Display name matches input
- [ ] Success toast notification appears: "Account created successfully!"
- [ ] User is automatically logged in
- [ ] User is redirected to homepage (`/`)
- [ ] User profile is loaded and displayed
- [ ] No console errors
- [ ] Network requests succeed

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-AUTH-006 - Signup with Invalid Email Format
**Priority**: High  
**Component**: Frontend  
**Test Type**: Validation

**Preconditions**:
- User is on the registration page

**Test Steps**:
1. Navigate to registration page
2. Enter display name
3. Enter invalid email format (e.g., `invalid-email`, `test@`, `@example.com`)
4. Enter valid password
5. Enter matching confirm password
6. Click "Sign Up" button

**Expected Results**:
- [ ] Form validation prevents submission OR
- [ ] Error message appears: "Invalid email address"
- [ ] Error toast notification appears
- [ ] User account is NOT created
- [ ] User remains on registration page
- [ ] Email field is highlighted in red

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-AUTH-007 - Signup with Weak Password
**Priority**: High  
**Component**: Frontend, Backend  
**Test Type**: Validation, Security

**Preconditions**:
- User is on the registration page

**Test Steps**:
1. Navigate to registration page
2. Enter display name
3. Enter valid email address
4. Enter weak password (less than 6 characters, e.g., `12345`)
5. Enter matching confirm password
6. Click "Sign Up" button

**Expected Results**:
- [ ] Form validation prevents submission OR
- [ ] Error message appears: "Password must be at least 6 characters long" OR "Password is too weak. Please use at least 6 characters."
- [ ] Error toast notification appears
- [ ] User account is NOT created
- [ ] User remains on registration page
- [ ] Password field is highlighted in red

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-AUTH-008 - Signup with Mismatched Passwords
**Priority**: High  
**Component**: Frontend  
**Test Type**: Validation

**Preconditions**:
- User is on the registration page

**Test Steps**:
1. Navigate to registration page
2. Enter display name
3. Enter valid email address
4. Enter password (e.g., `password123`)
5. Enter different password in confirm field (e.g., `password456`)
6. Click "Sign Up" button

**Expected Results**:
- [ ] Error message appears: "Passwords do not match"
- [ ] Error toast notification appears
- [ ] User account is NOT created
- [ ] User remains on registration page
- [ ] Confirm password field is highlighted in red

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-AUTH-009 - Signup with Existing Email
**Priority**: Medium  
**Component**: Frontend, Backend  
**Test Type**: Functional

**Preconditions**:
- User account with email `existing@example.com` already exists
- User is on the registration page

**Test Steps**:
1. Navigate to registration page
2. Enter display name
3. Enter existing email address (e.g., `existing@example.com`)
4. Enter valid password
5. Enter matching confirm password
6. Click "Sign Up" button

**Expected Results**:
- [ ] Error message appears: "An account with this email already exists"
- [ ] Error toast notification appears
- [ ] User account is NOT created
- [ ] User remains on registration page
- [ ] No duplicate account is created

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-AUTH-010 - Logout Functionality
**Priority**: High  
**Component**: Frontend, Backend  
**Test Type**: Functional

**Preconditions**:
- User is logged in
- User is on any authenticated page

**Test Steps**:
1. Verify user is logged in (check user menu/profile)
2. Click on "Logout" button or link
3. Confirm logout if confirmation dialog appears
4. Wait for logout to complete

**Expected Results**:
- [ ] Logout button/link is visible and accessible
- [ ] Success toast notification appears: "Logged out successfully"
- [ ] User session is terminated
- [ ] User is redirected to login page or homepage
- [ ] User profile data is cleared
- [ ] Auth state shows user as logged out
- [ ] Protected routes are no longer accessible
- [ ] No console errors

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-AUTH-011 - Protected Route Redirect to Login
**Priority**: High  
**Component**: Frontend  
**Test Type**: Security, Functional

**Preconditions**:
- User is NOT logged in (logged out or new session)
- Protected routes exist (e.g., `/profile`, `/create-listing`)

**Test Steps**:
1. Ensure user is logged out
2. Navigate directly to protected route (e.g., `/profile`)
3. Observe redirect behavior
4. Try accessing another protected route (e.g., `/create-listing`)
5. Observe redirect behavior

**Expected Results**:
- [ ] User is automatically redirected to login page (`/login`)
- [ ] Original route is stored (for redirect after login)
- [ ] User cannot access protected content
- [ ] Redirect happens immediately
- [ ] No console errors
- [ ] After login, user is redirected back to originally requested route

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-AUTH-012 - Session Persistence
**Priority**: Medium  
**Component**: Frontend, Backend  
**Test Type**: Functional

**Preconditions**:
- User is logged in

**Test Steps**:
1. Log in to the application
2. Verify user is authenticated
3. Refresh the browser page (F5 or Ctrl+R)
4. Check if user remains logged in
5. Close browser tab
6. Reopen browser and navigate to application
7. Check if user remains logged in

**Expected Results**:
- [ ] User remains logged in after page refresh
- [ ] User profile data persists
- [ ] Auth state is maintained
- [ ] User does not need to log in again
- [ ] Session persists across browser tab close/reopen (if configured)
- [ ] No console errors

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

## 2. User Type Testing

### Test Case: TC-USER-001 - Default User Type Assignment (Regular)
**Priority**: High  
**Component**: Backend, Database  
**Test Type**: Functional

**Preconditions**:
- User is on registration page
- New email address (not previously registered)

**Test Steps**:
1. Navigate to registration page
2. Complete signup with valid data
3. After successful registration, navigate to profile page
4. Check user type in profile
5. Verify in database/Firestore that userType is set

**Expected Results**:
- [ ] New user is assigned `userType: REGULAR` by default
- [ ] User type is displayed in profile page
- [ ] User type is stored correctly in Firestore
- [ ] User type field shows "Regular" or "REGULAR"
- [ ] No admin or premium features are accessible

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-USER-002 - User Type Display in Profile
**Priority**: Medium  
**Component**: Frontend  
**Test Type**: UI, Functional

**Preconditions**:
- User is logged in
- User has a user type assigned (Regular, Premium, or Admin)

**Test Steps**:
1. Log in to the application
2. Navigate to profile page (`/profile`)
3. Locate user type information
4. Verify user type is displayed correctly
5. Check if user type badge/indicator is visible

**Expected Results**:
- [ ] User type is displayed on profile page
- [ ] User type is clearly visible (badge, label, or text)
- [ ] User type matches the actual user type in database
- [ ] Display format is user-friendly (e.g., "Regular User", "Premium Member", "Administrator")
- [ ] Visual indicator (badge color, icon) matches user type

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-USER-003 - Admin Can Change User Types
**Priority**: High  
**Component**: Frontend, Backend  
**Test Type**: Functional, Authorization

**Preconditions**:
- Admin user is logged in
- Target user exists (Regular user)
- Admin has access to user management interface

**Test Steps**:
1. Log in as admin user
2. Navigate to user management page (admin panel)
3. Find a Regular user in the list
4. Click on user to view/edit
5. Change user type from "Regular" to "Premium"
6. Save changes
7. Log out and log in as the target user
8. Verify user type has changed

**Expected Results**:
- [ ] Admin can access user management interface
- [ ] Admin can see list of users
- [ ] Admin can edit user type field
- [ ] User type dropdown/selector shows all options (Regular, Premium, Admin)
- [ ] Changes are saved successfully
- [ ] Success message appears after save
- [ ] User type is updated in database
- [ ] Target user now has Premium access when they log in
- [ ] No console errors

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-USER-004 - Users Cannot Change Their Own Type
**Priority**: High  
**Component**: Frontend, Backend  
**Test Type**: Security, Authorization

**Preconditions**:
- Regular user is logged in
- User is on their profile page

**Test Steps**:
1. Log in as Regular user
2. Navigate to profile page (`/profile`)
3. Look for user type field
4. Attempt to edit/change user type
5. Try to save changes if field is editable

**Expected Results**:
- [ ] User type field is read-only OR
- [ ] User type field is not visible OR
- [ ] User type field is visible but disabled
- [ ] User cannot modify their own user type
- [ ] If user attempts to change via API, request is rejected (403 Forbidden)
- [ ] Error message appears if user tries to change: "You cannot change your own user type"
- [ ] User type remains unchanged

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-USER-005 - Premium User Type Display
**Priority**: Medium  
**Component**: Frontend  
**Test Type**: UI

**Preconditions**:
- Premium user is logged in

**Test Steps**:
1. Log in as Premium user
2. Navigate to profile page
3. Check user type display
4. Navigate to other pages
5. Check for Premium badges/indicators

**Expected Results**:
- [ ] User type displays as "Premium" or "Premium Member"
- [ ] Premium badge/indicator is visible
- [ ] Premium features are accessible
- [ ] Visual styling indicates Premium status (e.g., gold badge, special icon)

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-USER-006 - Admin User Type Display
**Priority**: Medium  
**Component**: Frontend  
**Test Type**: UI

**Preconditions**:
- Admin user is logged in

**Test Steps**:
1. Log in as Admin user
2. Navigate to profile page
3. Check user type display
4. Navigate to admin panel (if exists)
5. Check for Admin indicators

**Expected Results**:
- [ ] User type displays as "Admin" or "Administrator"
- [ ] Admin badge/indicator is visible
- [ ] Admin panel is accessible
- [ ] Visual styling indicates Admin status (e.g., red badge, admin icon)

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

## 3. Access Control Testing

### Test Case: TC-ACCESS-001 - Regular User Sees Basic Features
**Priority**: High  
**Component**: Frontend  
**Test Type**: Functional, Authorization

**Preconditions**:
- Regular user is logged in

**Test Steps**:
1. Log in as Regular user
2. Navigate through the application
3. Check available features:
   - Create listing
   - Edit listing
   - Delete listing
   - View marketplace
   - View profile
4. Check for Premium/Admin-only features

**Expected Results**:
- [ ] Regular user CAN access:
  - [ ] Create listing (`/create-listing`)
  - [ ] Edit own listings
  - [ ] Delete own listings
  - [ ] View marketplace
  - [ ] View profile
  - [ ] Basic search and filters
- [ ] Regular user CANNOT access:
  - [ ] Advanced analytics
  - [ ] Premium listings
  - [ ] Bulk operations
  - [ ] Export data
  - [ ] Custom reports
  - [ ] Priority support
  - [ ] Unlimited listings (if limited)
  - [ ] Featured listings
  - [ ] User management (admin panel)
- [ ] Premium/Admin features are hidden or disabled
- [ ] Upgrade prompts appear for Premium features

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-ACCESS-002 - Premium User Sees Premium Features
**Priority**: High  
**Component**: Frontend  
**Test Type**: Functional, Authorization

**Preconditions**:
- Premium user is logged in

**Test Steps**:
1. Log in as Premium user
2. Navigate through the application
3. Check available Premium features:
   - Advanced analytics
   - Premium listings
   - Bulk operations
   - Export data
   - Custom reports
   - Priority support
   - Unlimited listings
   - Featured listings
4. Verify all features are accessible

**Expected Results**:
- [ ] Premium user CAN access:
  - [ ] All Regular user features
  - [ ] Advanced analytics
  - [ ] Premium listings
  - [ ] Bulk operations
  - [ ] Export data
  - [ ] Custom reports
  - [ ] Priority support
  - [ ] Unlimited listings
  - [ ] Featured listings
- [ ] Premium user CANNOT access:
  - [ ] User management (admin panel)
- [ ] Premium features are visible and functional
- [ ] No upgrade prompts appear
- [ ] Premium badge/indicator is visible

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-ACCESS-003 - Admin Sees All Features
**Priority**: High  
**Component**: Frontend  
**Test Type**: Functional, Authorization

**Preconditions**:
- Admin user is logged in

**Test Steps**:
1. Log in as Admin user
2. Navigate through the application
3. Check available features:
   - All Regular features
   - All Premium features
   - Admin-specific features
   - User management
4. Verify admin panel is accessible

**Expected Results**:
- [ ] Admin CAN access:
  - [ ] All Regular user features
  - [ ] All Premium user features
  - [ ] User management (admin panel)
  - [ ] Ability to change user types
  - [ ] System administration features
- [ ] Admin panel is accessible
- [ ] All features are visible and functional
- [ ] Admin badge/indicator is visible
- [ ] No restrictions on any features

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-ACCESS-004 - Guest Sees Limited Features
**Priority**: High  
**Component**: Frontend  
**Test Type**: Functional, Authorization

**Preconditions**:
- User is NOT logged in (Guest)

**Test Steps**:
1. Navigate to application without logging in
2. Browse the application
3. Attempt to access various features:
   - View marketplace
   - View item details
   - Create listing
   - Edit listing
   - Delete listing
   - View profile
4. Check for login prompts

**Expected Results**:
- [ ] Guest CAN access:
  - [ ] View marketplace (browse items)
  - [ ] View item details
  - [ ] Basic search
- [ ] Guest CANNOT access:
  - [ ] Create listing (redirected to login)
  - [ ] Edit listing (redirected to login)
  - [ ] Delete listing (redirected to login)
  - [ ] View profile (redirected to login)
  - [ ] Add to cart (may require login)
  - [ ] Send messages (redirected to login)
- [ ] Login prompts appear for restricted features
- [ ] "Sign Up" and "Login" buttons are visible
- [ ] Protected actions redirect to login page

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-ACCESS-005 - Upgrade Prompts Appear Correctly
**Priority**: Medium  
**Component**: Frontend  
**Test Type**: UI, Functional

**Preconditions**:
- Regular user is logged in

**Test Steps**:
1. Log in as Regular user
2. Navigate to features that require Premium:
   - Advanced analytics
   - Premium listings
   - Bulk operations
   - Export data
3. Attempt to access these features
4. Check for upgrade prompts

**Expected Results**:
- [ ] Upgrade prompts appear when accessing Premium features
- [ ] Prompt message is clear and informative
- [ ] Upgrade button/link is visible
- [ ] Upgrade button navigates to upgrade page or shows upgrade modal
- [ ] Prompt explains benefits of Premium
- [ ] User can dismiss prompt (if applicable)
- [ ] Prompt styling is consistent with design system

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-ACCESS-006 - Protected Feature Component
**Priority**: High  
**Component**: Frontend  
**Test Type**: Functional, Authorization

**Preconditions**:
- Regular user is logged in
- Application uses ProtectedFeature component

**Test Steps**:
1. Log in as Regular user
2. Navigate to page with ProtectedFeature components
3. Check which features are visible
4. Log out and log in as Premium user
5. Check which features are now visible
6. Log out and access as Guest
7. Check which features are visible

**Expected Results**:
- [ ] ProtectedFeature component hides/shows features based on user type
- [ ] Regular user sees only Regular features
- [ ] Premium user sees Regular + Premium features
- [ ] Admin sees all features
- [ ] Guest sees only public features
- [ ] Component handles undefined/null user gracefully
- [ ] No console errors

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-ACCESS-007 - API Access Control
**Priority**: High  
**Component**: Backend  
**Test Type**: Security, Authorization

**Preconditions**:
- Regular user is logged in
- Premium user is logged in
- Admin user is logged in

**Test Steps**:
1. As Regular user, attempt to access Premium API endpoint
2. Check response status and message
3. As Regular user, attempt to access Admin API endpoint
4. Check response status and message
5. As Premium user, attempt to access Admin API endpoint
6. Check response status and message

**Expected Results**:
- [ ] Regular user receives 403 Forbidden for Premium endpoints
- [ ] Regular user receives 403 Forbidden for Admin endpoints
- [ ] Premium user receives 403 Forbidden for Admin endpoints
- [ ] Admin user can access all endpoints (200 OK)
- [ ] Error messages are clear and appropriate
- [ ] No sensitive data is exposed in error responses

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

## 4. Real Data Testing

### Test Case: TC-DATA-001 - API Calls Succeed
**Priority**: High  
**Component**: Frontend, Backend  
**Test Type**: Integration

**Preconditions**:
- User is logged in
- Backend API is running
- Network connection is stable

**Test Steps**:
1. Log in to the application
2. Navigate to marketplace page
3. Observe API call in Network tab
4. Check API response
5. Verify data is displayed correctly
6. Test other API calls:
   - Get user profile
   - Get items/listings
   - Get categories
   - Search items

**Expected Results**:
- [ ] API calls are made successfully
- [ ] HTTP status codes are 200 OK
- [ ] Response data is received
- [ ] Data is displayed correctly in UI
- [ ] Response time is acceptable (< 2 seconds)
- [ ] No network errors in console
- [ ] Request headers include authentication token (if required)
- [ ] Response format matches expected structure

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-DATA-002 - Error Handling When API Fails
**Priority**: High  
**Component**: Frontend, Backend  
**Test Type**: Error Handling

**Preconditions**:
- User is logged in
- Backend API can be stopped/simulated to fail

**Test Steps**:
1. Log in to the application
2. Stop backend server OR simulate network failure
3. Attempt to load data (marketplace, profile, etc.)
4. Observe error handling
5. Restore backend server
6. Attempt to load data again

**Expected Results**:
- [ ] Error message is displayed to user
- [ ] Error toast notification appears
- [ ] Error message is user-friendly (not technical)
- [ ] UI shows error state (not broken/blank)
- [ ] Retry option is available (if applicable)
- [ ] Console shows appropriate error logs
- [ ] Network tab shows failed request
- [ ] After restoring server, data loads successfully

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-DATA-003 - Loading States Display
**Priority**: Medium  
**Component**: Frontend  
**Test Type**: UI, UX

**Preconditions**:
- User is logged in
- Application is running

**Test Steps**:
1. Navigate to marketplace page
2. Observe loading state during data fetch
3. Navigate to profile page
4. Observe loading state
5. Perform search operation
6. Observe loading state
7. Create new listing
8. Observe loading state during submission

**Expected Results**:
- [ ] Loading spinner/skeleton appears during data fetch
- [ ] Loading state is visible and clear
- [ ] Button shows loading state (disabled + spinner)
- [ ] Loading indicators are consistent across pages
- [ ] Loading state disappears when data loads
- [ ] No flickering or layout shifts
- [ ] Loading animation is smooth

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-DATA-004 - Empty Results Handling
**Priority**: Medium  
**Component**: Frontend  
**Test Type**: UI, UX

**Preconditions**:
- User is logged in
- Search can return empty results

**Test Steps**:
1. Navigate to marketplace/search page
2. Perform search with no matching results (e.g., search for "nonexistentitem12345")
3. Observe empty state display
4. Clear search and perform another search
5. Check empty state for other scenarios:
   - Empty favorites list
   - Empty cart
   - No listings created by user

**Expected Results**:
- [ ] Empty state message is displayed
- [ ] Message is helpful and user-friendly
- [ ] Empty state includes:
  - [ ] Clear message (e.g., "No items found")
  - [ ] Helpful suggestion (e.g., "Try different search terms")
  - [ ] Call-to-action (e.g., "Create your first listing")
- [ ] Empty state styling is consistent
- [ ] No errors in console
- [ ] UI doesn't appear broken

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-DATA-005 - API Timeout Handling
**Priority**: Medium  
**Component**: Frontend, Backend  
**Test Type**: Error Handling

**Preconditions**:
- User is logged in
- Can simulate slow network or timeout

**Test Steps**:
1. Log in to the application
2. Simulate slow network (throttle in DevTools)
3. Attempt to load data
4. Wait for timeout (if configured)
5. Observe timeout handling

**Expected Results**:
- [ ] Request times out after configured timeout period
- [ ] Timeout error message is displayed
- [ ] User-friendly error message appears
- [ ] Retry option is available
- [ ] No infinite loading state
- [ ] Console shows timeout error

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-DATA-006 - Network Error Handling
**Priority**: Medium  
**Component**: Frontend  
**Test Type**: Error Handling

**Preconditions**:
- User is logged in
- Can simulate network disconnection

**Test Steps**:
1. Log in to the application
2. Disconnect from network (disable WiFi/ethernet)
3. Attempt to perform actions that require API calls:
   - Load marketplace
   - Search items
   - Update profile
   - Create listing
4. Observe error handling
5. Reconnect to network
6. Retry actions

**Expected Results**:
- [ ] Network error message is displayed
- [ ] Error message: "Network error. Please check your connection."
- [ ] Error toast notification appears
- [ ] User can retry after reconnecting
- [ ] No application crash
- [ ] Console shows network error

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-DATA-007 - API Response Validation
**Priority**: High  
**Component**: Frontend, Backend  
**Test Type**: Integration, Validation

**Preconditions**:
- User is logged in
- Backend API is running

**Test Steps**:
1. Log in to the application
2. Make various API calls
3. Check response data structure
4. Verify required fields are present
5. Check data types match expected types
6. Verify null/undefined handling

**Expected Results**:
- [ ] API responses match expected structure
- [ ] Required fields are present in responses
- [ ] Data types are correct (strings, numbers, booleans, arrays, objects)
- [ ] Null/undefined values are handled gracefully
- [ ] Missing fields don't cause errors
- [ ] Data validation occurs before display
- [ ] No TypeScript/JavaScript errors from invalid data

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case: TC-DATA-008 - Concurrent API Requests
**Priority**: Low  
**Component**: Frontend, Backend  
**Test Type**: Performance

**Preconditions**:
- User is logged in
- Multiple API endpoints are available

**Test Steps**:
1. Log in to the application
2. Simultaneously trigger multiple API calls:
   - Load marketplace
   - Load user profile
   - Load categories
   - Load favorites
3. Observe behavior
4. Check for race conditions
5. Verify all requests complete

**Expected Results**:
- [ ] All API requests are made
- [ ] All requests complete successfully
- [ ] No race conditions occur
- [ ] Data is displayed correctly
- [ ] No duplicate requests
- [ ] Performance is acceptable

**Actual Result**: 
[To be filled during testing]

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

## Test Execution Summary

### Test Execution Report

**Date**: [Date]  
**Tester**: [Name]  
**Environment**: [Development/Staging/Production]  
**Build Version**: [Version Number]  
**Phase**: Phase 2

### Test Results Summary

| Category | Total | Passed | Failed | Blocked | Pass Rate |
|----------|-------|--------|--------|---------|-----------|
| Authentication | 12 | [ ] | [ ] | [ ] | [ ]% |
| User Type | 6 | [ ] | [ ] | [ ] | [ ]% |
| Access Control | 7 | [ ] | [ ] | [ ] | [ ]% |
| Real Data | 8 | [ ] | [ ] | [ ] | [ ]% |
| **Total** | **33** | [ ] | [ ] | [ ] | [ ]% |

### Issues Found

**Critical Issues**: [Number]
- [List critical issues]

**High Priority Issues**: [Number]
- [List high priority issues]

**Medium Priority Issues**: [Number]
- [List medium priority issues]

**Low Priority Issues**: [Number]
- [List low priority issues]

### Test Coverage

- [ ] All authentication test cases executed
- [ ] All user type test cases executed
- [ ] All access control test cases executed
- [ ] All real data test cases executed
- [ ] All critical test cases passed
- [ ] All high priority test cases passed

### Recommendations

1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

### Sign-off

**QA Lead**: _________________ Date: _________

**Development Lead**: _________________ Date: _________

---

**Note**: This test plan should be executed systematically, with all results documented. Any failures should be reported using the bug report template in `.gitlab/issue_templates/bug_report.md`.
