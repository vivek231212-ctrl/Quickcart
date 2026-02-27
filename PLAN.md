# FreshCart: Feature Discussion & Enhancement Plan

## 1. UI/UX Strategy (Blinkit-Style)
*   **Visual Identity:** Use the signature "Blinkit Green" (#0C831F) as the primary brand color.
*   **Layout:** 
    *   **Bento Grid:** Use for category sections to make them scannable.
    *   **Sticky Header:** Keep search and location always accessible.
    *   **Fixed Checkout Bar:** A bottom bar that appears when items are in the cart, showing total and "View Cart".
*   **Animations:** Use `motion` for:
    *   Cart side-panel sliding.
    *   Product card hover scales.
    *   Smooth page transitions.
*   **Skeleton Loaders:** Implement for product grids and category lists to improve perceived performance.

## 2. Advanced Features
*   **Smart Search:** Debounced search with AI-powered suggestions (using Gemini) and "Did you mean?" functionality.
*   **AI Recommendations:** "Frequently bought together" or "You might also like" sections based on cart contents.
*   **Delivery Management:**
    *   **Time Slots:** Selection for "Instant (10 mins)" vs "Scheduled".
    *   **Address Book:** Multiple saved addresses with "Home/Work/Other" labels.
*   **Coupon System:** Discount code validation at checkout.
*   **Order Tracking:** A multi-step status bar (Ordered -> Packed -> Out for Delivery -> Delivered).

## 3. Performance & Scalability
*   **Lazy Loading:** Use React.lazy for route-based code splitting.
*   **Image Optimization:** Use modern formats and responsive sizes.
*   **Debounced Inputs:** Prevent excessive API calls during search.
*   **Optimistic UI:** Update cart count and totals immediately on the client before the server responds.

## 4. Admin Dashboard
*   **Inventory CRUD:** Add/Edit/Delete products with stock levels.
*   **Order Management:** View all orders, change status, and print invoices.
*   **Analytics:** Revenue charts and top-selling product metrics.

## 5. Security & Production Readiness
*   **Authentication:** JWT-based login/register with secure cookie storage.
*   **Validation:** Zod or similar for schema validation on both client and server.
*   **Error Handling:** Global error boundary and toast notifications for API failures.

## 6. Roadmap
### Phase 1: Core MVP
*   Blinkit-style UI (Header, Product Grid, Cart Sidebar).
*   Express/SQLite backend with basic Product/Auth APIs.
*   Basic Cart functionality.

### Phase 2: Advanced UX
*   Smart Search with suggestions.
*   Address management.
*   Order placement and basic tracking.

### Phase 3: AI & Admin
*   Gemini-powered product recommendations.
*   Full Admin Dashboard.
*   PWA support and Mobile optimization.
