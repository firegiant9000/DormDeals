# Manual Testing Script for DormDeals

This document provides step-by-step testing instructions for QA testers to systematically test the DormDeals marketplace application.

## 📋 Pre-Testing Setup

### Environment Setup
1. **Start the application**:
   ```bash
   npm run dev
   ```
2. **Verify both servers are running**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Open browser developer tools** (F12)
5. **Check console for errors** - should be clean

### Test Data Preparation
- Ensure mock data is loaded
- Have test user accounts ready
- Prepare test images for upload testing

---

## 🏠 Homepage Testing Script

### Test Case: Homepage Load and Display
**Objective**: Verify homepage loads correctly with all sections

**Steps**:
1. Navigate to `http://localhost:5173`
2. Wait for page to fully load (no loading spinners)
3. Verify the following elements are visible:

**Expected Results**:
- [ ] Hero section displays with title "Your Campus Marketplace"
- [ ] Subtitle shows "The ultimate marketplace for UL students..."
- [ ] Two buttons are visible: "Get Started" and "Learn More"
- [ ] Background gradient is visible
- [ ] No console errors

**Screenshots**: Take screenshot of full homepage

---

### Test Case: Hero Section Buttons
**Objective**: Verify hero section buttons navigate correctly

**Steps**:
1. Click the "Get Started" button
2. Verify navigation to marketplace page
3. Use browser back button to return to homepage
4. Click the "Learn More" button
5. Verify navigation to about page

**Expected Results**:
- [ ] "Get Started" button navigates to `/marketplace`
- [ ] "Learn More" button navigates to `/about`
- [ ] Page transitions are smooth
- [ ] No navigation errors

---

### Test Case: Search Section (Sidebar)
**Objective**: Test the search functionality in the sidebar

**Steps**:
1. Locate the search section in the left sidebar
2. Enter "laptop" in the Keywords field
3. Select "Campus area" from Location dropdown
4. Select "Newest" from Sort by dropdown
5. Click the "Search" button

**Expected Results**:
- [ ] Keywords input accepts text
- [ ] Location dropdown has options
- [ ] Sort by dropdown has options
- [ ] Search button triggers search
- [ ] Search results are displayed (or appropriate message)

---

### Test Case: Featured Items Section
**Objective**: Verify featured items display correctly

**Steps**:
1. Scroll to the "Featured Items" section
2. Verify section title and subtitle
3. Check each category card (Electronics, Textbooks, Furniture)
4. Hover over each card to test hover effects
5. Click on a category card

**Expected Results**:
- [ ] Section title: "Featured Items"
- [ ] Subtitle: "Discover great deals from fellow UL students"
- [ ] Three category cards display with icons (📱, 📚, 🪑)
- [ ] Hover effects work smoothly
- [ ] Cards are clickable

---

### Test Case: Features Section
**Objective**: Verify all feature cards display correctly

**Steps**:
1. Scroll to the "Why Choose DormDeals?" section
2. Verify all 6 feature cards are visible
3. Hover over each feature card
4. Check that icons are displayed properly

**Expected Results**:
- [ ] Section title: "Why Choose DormDeals?"
- [ ] All 6 features display:
  - [ ] Easy Marketplace
  - [ ] Affordable Prices
  - [ ] Trusted Community
  - [ ] Safe Transactions
  - [ ] Smart Search
  - [ ] Sustainable Living
- [ ] Feature icons render properly
- [ ] Hover animations work

---

### Test Case: How It Works Section
**Objective**: Verify the 3-step process display

**Steps**:
1. Scroll to the "How It Works" section
2. Verify all 3 steps are visible
3. Check step numbers (1, 2, 3)
4. Verify connection lines appear on desktop
5. Test scroll animations

**Expected Results**:
- [ ] Section title: "How It Works"
- [ ] All 3 steps display:
  - [ ] Step 1: Browse & Search
  - [ ] Step 2: Connect & Chat
  - [ ] Step 3: Secure Payment
- [ ] Step numbers are visible
- [ ] Connection lines appear on desktop
- [ ] Animations work on scroll

---

### Test Case: Stats Section
**Objective**: Verify statistics display correctly

**Steps**:
1. Scroll to the stats section (blue background)
2. Verify all 4 statistics are visible
3. Check that numbers animate on scroll

**Expected Results**:
- [ ] All 4 stats display:
  - [ ] 500+ Active Students
  - [ ] 1,200+ Items Listed
  - [ ] $15K+ Money Saved
  - [ ] 4.9★ User Rating
- [ ] Background is blue (primary-600)
- [ ] Numbers animate on scroll

---

### Test Case: Final CTA Section
**Objective**: Verify final call-to-action buttons

**Steps**:
1. Scroll to the final CTA section
2. Verify section title and description
3. Click "Explore Marketplace" button
4. Return to homepage
5. Click "Start Selling" button

**Expected Results**:
- [ ] Section title: "Ready to Transform Your Campus Life?"
- [ ] Description text is visible
- [ ] "Explore Marketplace" navigates to `/marketplace`
- [ ] "Start Selling" navigates to `/create-listing`
- [ ] Button hover effects work

---

## 🔍 Main Feature Page Testing Script

### Test Case: Main Feature Page Load
**Objective**: Verify main feature page loads correctly

**Steps**:
1. Navigate to `http://localhost:5173` (homepage)
2. The page should automatically show the main feature content
3. Verify hero section displays

**Expected Results**:
- [ ] Title: "Find Your Perfect Dorm Items"
- [ ] Subtitle: "Browse items from fellow UL students..."
- [ ] Background gradient is visible
- [ ] Animations work smoothly

---

### Test Case: Search Form Basic Fields
**Objective**: Test basic search form functionality

**Steps**:
1. Locate the search form
2. Enter "textbook" in the Search Items field
3. Enter "campus" in the Location field
4. Select "Price: Low to High" from Sort By dropdown
5. Click "Search Items" button

**Expected Results**:
- [ ] Search input accepts text and shows placeholder
- [ ] Location input accepts text and shows placeholder
- [ ] Sort dropdown has all options
- [ ] Search button shows loading state
- [ ] Search results navigate to `/results` page

---

### Test Case: Advanced Filters Toggle
**Objective**: Test advanced filters functionality

**Steps**:
1. Click the "Advanced Filters" toggle button
2. Verify filters section expands
3. Test each filter field:
   - Category: Select "Electronics"
   - Condition: Select "Like New"
   - Min Price: Enter "50"
   - Max Price: Enter "200"
   - Pickup Method: Select "Both Available"
4. Click "Search Items" button

**Expected Results**:
- [ ] Advanced filters toggle works (shows/hides)
- [ ] All filter fields are functional
- [ ] Category dropdown has all options
- [ ] Condition dropdown has all options
- [ ] Price inputs accept numbers
- [ ] Pickup Method dropdown works
- [ ] Search works with filters applied

---

### Test Case: Form Validation
**Objective**: Test form validation for invalid inputs

**Steps**:
1. Enter "a" in the Search Items field (less than 2 characters)
2. Enter "100" in Min Price and "50" in Max Price (min > max)
3. Enter "abc" in Min Price field (invalid number)
4. Click "Search Items" button

**Expected Results**:
- [ ] Error message appears for search query < 2 characters
- [ ] Error message appears when min price > max price
- [ ] Error message appears for invalid number in price field
- [ ] Error messages display with red styling
- [ ] Errors clear when user starts typing

---

### Test Case: Featured Items Grid
**Objective**: Verify featured items display and functionality

**Steps**:
1. Scroll to the "Featured Items" section
2. Verify section title and "View All" button
3. Test each item card:
   - Hover over the card
   - Click "Add to Cart" button
   - Click the heart icon (wishlist)
   - Click on the item card itself
4. Click "View All" button

**Expected Results**:
- [ ] Section title: "Featured Items"
- [ ] "View All" button navigates to `/marketplace`
- [ ] Item cards display with images, titles, prices, descriptions
- [ ] Hover effects work smoothly
- [ ] "Add to Cart" button toggles (adds/removes from cart)
- [ ] Wishlist button toggles (adds/removes from wishlist)
- [ ] Item click navigates to item detail page

---

## 🧭 Navigation Testing Script

### Test Case: Main Navigation Links
**Objective**: Test all main navigation links

**Steps**:
1. Click on the logo (should go to homepage)
2. Click "Home" link
3. Click "Marketplace" link
4. Click "About" link
5. Click "Profile" link
6. Test browser back/forward buttons

**Expected Results**:
- [ ] Logo navigates to homepage
- [ ] All navigation links work correctly
- [ ] Active page is highlighted in navigation
- [ ] Page transitions are smooth
- [ ] Browser history works correctly

---

### Test Case: Mobile Navigation
**Objective**: Test navigation on mobile devices

**Steps**:
1. Resize browser to mobile width (375px)
2. Verify hamburger menu appears
3. Click hamburger menu to open navigation
4. Test all navigation links
5. Close mobile menu

**Expected Results**:
- [ ] Hamburger menu appears on mobile
- [ ] Mobile menu opens and closes properly
- [ ] All navigation links work in mobile menu
- [ ] Mobile menu is responsive

---

## 📱 Responsive Design Testing Script

### Test Case: Mobile Layout (375px width)
**Objective**: Test mobile responsiveness

**Steps**:
1. Set browser width to 375px (iPhone SE)
2. Test all major sections:
   - Hero section
   - Search form
   - Featured items
   - Features section
   - How it works section
3. Verify no horizontal scrolling
4. Test touch interactions

**Expected Results**:
- [ ] Navigation collapses to hamburger menu
- [ ] Hero section text is readable
- [ ] Search form stacks vertically
- [ ] Featured items show 1 column
- [ ] Features show 1 column
- [ ] Touch targets are at least 44px
- [ ] No horizontal scrolling

---

### Test Case: Tablet Layout (768px width)
**Objective**: Test tablet responsiveness

**Steps**:
1. Set browser width to 768px (iPad)
2. Test all major sections
3. Verify layout adapts appropriately

**Expected Results**:
- [ ] Navigation shows full menu
- [ ] Featured items show 2 columns
- [ ] Search form shows side-by-side layout
- [ ] Features show 2 columns
- [ ] Touch interactions work properly

---

### Test Case: Desktop Layout (1920px width)
**Objective**: Test desktop responsiveness

**Steps**:
1. Set browser width to 1920px
2. Test all major sections
3. Verify optimal layout

**Expected Results**:
- [ ] All features accessible
- [ ] No horizontal scrolling
- [ ] Optimal information density
- [ ] Performance is optimal

---

## 🌐 Browser Compatibility Testing Script

### Test Case: Chrome Testing
**Objective**: Test functionality in Chrome

**Steps**:
1. Open application in Chrome
2. Test all major functionality
3. Check browser console for errors
4. Test performance

**Expected Results**:
- [ ] All features work correctly
- [ ] Console shows no critical errors
- [ ] Performance is optimal
- [ ] No Chrome-specific issues

---

### Test Case: Firefox Testing
**Objective**: Test functionality in Firefox

**Steps**:
1. Open application in Firefox
2. Test all major functionality
3. Check for Firefox-specific issues

**Expected Results**:
- [ ] All features work correctly
- [ ] No layout issues
- [ ] JavaScript functions properly
- [ ] CSS animations work smoothly

---

### Test Case: Safari Testing
**Objective**: Test functionality in Safari

**Steps**:
1. Open application in Safari
2. Test all major functionality
3. Check for Safari-specific issues

**Expected Results**:
- [ ] All features work correctly
- [ ] No WebKit-specific issues
- [ ] Touch gestures work (if applicable)
- [ ] No Safari-specific bugs

---

### Test Case: Edge Testing
**Objective**: Test functionality in Edge

**Steps**:
1. Open application in Edge
2. Test all major functionality
3. Check for Edge-specific issues

**Expected Results**:
- [ ] All features work correctly
- [ ] No Microsoft-specific issues
- [ ] Performance is comparable to Chrome
- [ ] No Edge-specific problems

---

## 🐛 Bug Reporting Template

When you find a bug, use this template:

### Bug Report
**Bug ID**: BUG-[DATE]-[NUMBER]
**Title**: [Brief description of the bug]
**Severity**: [Critical/High/Medium/Low]
**Priority**: [Critical/High/Medium/Low]
**Component**: [Frontend/Backend/Database]
**Browser**: [Browser and version]
**Device**: [Device type and screen size]

**Description**:
[Detailed description of the bug]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happens]

**Screenshots/Videos**:
[Attach relevant media]

**Additional Information**:
[Any other relevant details]

---

## 📊 Test Execution Summary

After completing all tests, fill out this summary:

**Test Execution Summary**
- **Date**: [Date]
- **Tester**: [Name]
- **Environment**: [Development/Staging/Production]
- **Build Version**: [Version Number]

**Results**:
- **Total Test Cases**: [Number]
- **Passed**: [Number]
- **Failed**: [Number]
- **Blocked**: [Number]
- **Not Executed**: [Number]

**Pass Rate**: [Percentage]%

**Critical Issues Found**: [Number]
**High Priority Issues**: [Number]
**Medium Priority Issues**: [Number]
**Low Priority Issues**: [Number]

**Summary**:
[Brief summary of testing results and any critical issues found]

**Recommendations**:
[List any recommendations for fixes or improvements]

---

**Note**: This testing script should be followed systematically to ensure comprehensive testing coverage. All test results should be documented with screenshots and detailed notes for any failures or issues encountered.
