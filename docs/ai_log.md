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

