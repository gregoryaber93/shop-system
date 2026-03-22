# React Frontend - Feature Implementation Sequence

Implementation plan for features in logical order to build a fully functional application in stages.

## Sprint 1: Foundation & Auth (Days 1-3)

**Goal**: Working authentication, user can login/register.

### 1.1 Project Setup (2h)
- [x] Vite project initialization
- [x] Install all dependencies
- [x] Setup environment variables
- [x] Create folder structure (src/features, src/shared, src/lib)
- [x] Configure path aliases (@/)

**Instruction**: [QUICK-START.md](QUICK-START.md#1-project-setup-30-min)

### 1.2 Core Infrastructure (3h)
- [x] Setup Axios + queryClient
- [x] Create error handling layer (ProblemDetails mapping)
- [x] Create AuthContext + AuthProvider
- [x] Create UserProvider
- [x] Create CartProvider
- [x] Setup root Providers wrapper

**Instructions**: 
- [08-authentication-and-jwt.instructions.md](instructions/08-authentication-and-jwt.instructions.md#axios-interceptor-to-auto-inject-jwt)
- [13-error-handling-problemdetails.instructions.md](instructions/13-error-handling-problemdetails.instructions.md)

### 1.3 Authentication Pages (4h)
- [x] Login page with form validation
- [x] Register page with form validation
- [x] JWT decoding utility
- [x] Token storage in localStorage
- [x] Protected route wrapper (<ProtectedRoute />)
- [x] Logout functionality
- [x] Auto-redirect to login on 401

**Instruction**: [08-authentication-and-jwt.instructions.md](instructions/08-authentication-and-jwt.instructions.md)

### 1.4 Auth Tests (2h)
- [x] MSW setup
- [x] Login flow test
- [x] Register flow test
- [x] Protected route test

**Instruction**: [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md#scenario-1-user-registration---login---view-profile)

**DoD (Definition of Done)**:
- [x] Register -> Login -> JWT in localStorage
- [x] Protected routes redirect to /login when !token
- [x] Unauthorized requests return 401 + redirect
- [x] Unit + integration tests pass
- [x] No lint/typecheck errors

---

## Sprint 2: Products & Cart (Days 4-6)

**Goal**: Browse products, add to cart.

### 2.1 Products Listing (3h)
- [x] ProductService API client
- [x] React Query hooks (useAllProducts, useProductsByShop)
- [x] ProductList component with loading/error/empty states
- [x] ProductCard component
- [x] Product filtering by shop
- [x] Client-side sorting

**Instruction**: [09-products-listing-and-caching.instructions.md](instructions/09-products-listing-and-caching.instructions.md)

### 2.2 Shopping Cart (3h)
- [x] CartContext with add/remove/update/clear actions
- [x] Cart persistence in localStorage
- [x] CartItem component
- [x] CartSummary component
- [x] Quantity selector with min/max validation
- [x] Remove item from cart

**Instruction**: [10-shopping-cart-and-orders.instructions.md](instructions/10-shopping-cart-and-orders.instructions.md#cart-context)

### 2.3 Cart UI (2h)
- [x] Cart page/modal
- [x] Display cart items with price breakdown
- [x] Show cart total
- [x] Link from ProductCard to cart
- [x] Empty cart state

**Instruction**: [10-shopping-cart-and-orders.instructions.md](instructions/10-shopping-cart-and-orders.instructions.md#product-list-component)

### 2.4 Tests (2h)
- [x] Product listing test
- [x] Add to cart test
- [x] Update quantity test
- [x] Clear cart test

**Instruction**: [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md#scenario-2-browse-products---add-to-cart---checkout)

**DoD**:
- ✅ Products load from backend
- ✅ Filtering by shop works
- ✅ Add to cart -> displays in cart modal
- ✅ Cart persists in localStorage
- ✅ Tests pass (50%+ coverage)

---

## Sprint 3: Orders & Checkout (Days 7-9)

**Goal**: User can place order with idempotency.

### 3.1 Order Placement (3h)
- [x] OrderService API client (placeOrder, getMyOrders, getById)
- [x] Generate idempotencyKey (UUID v4)
- [x] Checkout form component
- [x] Error handling for checkout (ProblemDetails)
- [x] Order confirmation page
- [x] Display order ID and summary

**Instructions**:
- [10-shopping-cart-and-orders.instructions.md](instructions/10-shopping-cart-and-orders.instructions.md#checkout-with-promotions)
- [14-idempotency-and-retry-patterns.instructions.md](instructions/14-idempotency-and-retry-patterns.instructions.md)

### 3.2 Idempotency & Retry (2h)
- [x] Idempotency key generation
- [x] Idempotency cache in memory
- [x] Retry logic with exponential backoff
- [x] Retry UI (show "Retrying..." status)
- [x] Max retries (3) logic

**Instruction**: [14-idempotency-and-retry-patterns.instructions.md](instructions/14-idempotency-and-retry-patterns.instructions.md)

### 3.3 Order Status Polling (2h)
- [x] Order detail page
- [x] Polling logic (fetch every 2s)
- [x] Display order status (Created -> PaymentPending -> PaymentAuthorized -> Fulfilled)
- [x] Auto-refresh when status changes
- [x] Stop polling when order is Fulfilled

**Instruction**: [12-user-profile-and-history.instructions.md](instructions/12-user-profile-and-history.instructions.md#polling-for-order-status)

### 3.4 Tests (2h)
- [x] Checkout flow test
- [x] Idempotency test (duplicate request)
- [x] Retry on 503 test
- [x] Order status polling test

**Instruction**: [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md#scenario-2-browse-products---add-to-cart---checkout)

**DoD**:
- ✅ Checkout -> Order placed (POST /api/orders)
- ✅ Idempotency-Key header sent
- ✅ Retry logic works (503 -> retry -> success)
- ✅ Cannot duplicate order (same key = same result)
- ✅ Order status polls and updates
- ✅ All tests pass

---

## Sprint 4: Promotions (Days 10-11)

**Goal**: User can apply promotions at checkout.

### 4.1 Promotions Display (2h)
- [x] PromotionService API client
- [x] React Query hooks (useActivePromotions, useUserPromotionProfile)
- [x] Promotions list component
- [x] Promotion card with details (discount%, required points)
- [x] Show which promos are applicable to cart

**Instruction**: [11-promotions-and-discounts.instructions.md](instructions/11-promotions-and-discounts.instructions.md#components)

### 4.2 Promotion Evaluation (2h)
- [x] evaluatePromotions API call
- [x] Integration in checkout (call before order)
- [x] Display applied discounts in order summary
- [x] Display loyalty points earned
- [x] Handle promo evaluation errors

**Instruction**: [11-promotions-and-discounts.instructions.md](instructions/11-promotions-and-discounts.instructions.md#api-client-for-promotions)

### 4.3 Add Promos to Cart (2h)
- [x] applyPromotion action in CartContext
- [x] removePromotion action
- [x] Display applied promos in cart
- [x] Validate user has enough loyalty points
- [x] Update cart UI when promo applied/removed

**Instruction**: [11-promotions-and-discounts.instructions.md](instructions/11-promotions-and-discounts.instructions.md#promotions-in-cart)

### 4.4 Tests (1.5h)
- [x] Promotion listing test
- [x] Apply promotion test
- [x] Evaluate promotions test

**Instruction**: [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md#scenario-2-browse-products---add-to-cart---checkout)

**DoD**:
- ✅ Promotions load from backend
- ✅ User can apply/remove promotions
- ✅ evaluatePromotions returns correct discounts
- ✅ Order contains appliedPromotionIds
- ✅ Loyalty points earned are shown
- ✅ Tests pass

---

## Sprint 5: User Profile & History (Days 12-13)

**Goal**: User can view profile and order history.

### 5.1 User Profile (2h)
- [x] UserService API client (getProfile, updateProfile)
- [x] UserProvider with useQuery
- [x] Profile page component
- [x] Edit profile form (firstName, lastName, phoneNumber)
- [x] Save changes to backend
- [x] Show user info (email, created date)

**Instruction**: [12-user-profile-and-history.instructions.md](instructions/12-user-profile-and-history.instructions.md#user-profile-component)

### 5.2 Order History (2h)
- [x] Order history list in UserProvider
- [x] Order history table/list component
- [x] Click order -> go to detail page
- [x] Show order ID, date, total, status, item count
- [x] Link to view full order details

**Instruction**: [12-user-profile-and-history.instructions.md](instructions/12-user-profile-and-history.instructions.md#order-history)

### 5.3 Profile UI Polish (1h)
- [x] Profile navigation
- [x] Edit mode toggle
- [x] Unsaved changes warning
- [x] Success/error messages
- [x] Loading states

**DoD**:
- ✅ Profile loads from backend
- ✅ User can edit firstName, lastName, phoneNumber
- ✅ Save changes persists
- ✅ Order history displays correctly
- ✅ Can navigate to order detail from history

---

## Sprint 6: Error Handling & Performance (Days 14-15)

**Goal**: Solid error handling and fast application.

### 6.1 Error Handling (2h)
- [x] ErrorBoundary component
- [x] Error UI for 401, 404, 409, 422, 5xx, timeout
- [x] Retry buttons on error states
- [x] CorrelationId display in error messages
- [x] Test error scenarios

**Instruction**: [13-error-handling-problemdetails.instructions.md](instructions/13-error-handling-problemdetails.instructions.md)

### 6.2 Performance (2h)
- [x] Code splitting (lazy load pages)
- [x] Configure React Query cache
- [x] Implement localStorage cache
- [x] Image optimization (lazy loading)
- [x] Bundle analysis (`npm run analyze-bundle`)

**Instruction**: [17-performance-and-caching-strategies.instructions.md](instructions/17-performance-and-caching-strategies.instructions.md)

### 6.3 Testing Coverage (1h)
- [x] Add integration test for error scenarios
- [x] Test retry logic
- [x] Test timeout handling

**Instruction**: [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md#scenario-4-error-handling--retry)

**DoD**:
- ✅ Bundle size < 300KB (gzipped)
- ✅ All error scenarios handled
- ✅ Retry logic works
- ✅ Tests pass (70%+ coverage)

---

## Sprint 7: Integration Testing & Deployment (Days 16-17)

**Goal**: Complete tests and ready for production.

### 7.1 Integration Tests (2h)
- [ ] Complete auth flow test
- [ ] Complete checkout flow test
- [ ] Error scenario tests
- [ ] Promotion scenario test
- [ ] Profile update test

**Instruction**: [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md)

### 7.2 gRPC Debugging (1h)
- [ ] Understand gRPC error codes
- [ ] Log correlation IDs
- [ ] Test timeout handling
- [ ] Test grpc unavailability

**Instruction**: [15-grpc-client-integration.instructions.md](instructions/15-grpc-client-integration.instructions.md)

### 7.3 Deployment Preparation (1h)
- [ ] Build checks (lint, typecheck, tests)
- [ ] Production build
- [ ] Preview production build
- [ ] Check Lighthouse scores
- [ ] Create deployment checklist

**DoD**:
- ✅ All tests pass locally
- ✅ No lint/typecheck errors
- ✅ Lighthouse >= 80
- ✅ Bundle size optimal
- ✅ Ready to deploy

---

## Implementation Tips

### For Each Feature:
1. Read relevant instruction file completely
2. Implement API client first
3. Create Context/Hooks for data
4. Build UI components
5. Write tests
6. Get Copilot review
7. Merge & move to next

### Testing Strategy:
- Unit: Individual functions, hooks
- Integration: Full user flows with MSW
- E2E: (optional) Playwright/Cypress for production env

### Code Review Checklist:
- [ ] Types are strict (no `any`)
- [ ] Error handling present
- [ ] Loading state handled
- [ ] Tests cover happy path + errors
- [ ] Follows folder structure
- [ ] No hardcoded URLs/keys
- [ ] Accessibility considered

### Communication with Copilot:
```
"Implement [feature name] using [08-authentication-and-jwt.instructions.md]: 
- Create [component/hook/context]
- Handle [specific requirement]
- Add test for [scenario]
- Make sure [quality gate] passes"
```

### Performance Budgets:
- Initial load: < 3s
- API response: < 2s
- Bundle: < 300KB gzipped
- First paint: < 2s
- Interaction: < 100ms

---

## Rollout Timeline

| Date | Sprint | Goal | Status |
|------|--------|------|--------|
| Day 1-3 | 1 | Auth working | ✅ Done |
| Day 4-6 | 2 | Products + Cart | ✅ Done |
| Day 7-9 | 3 | Checkout + Orders | ✅ Done |
| Day 10-11 | 4 | Promotions | ✅ Done |
| Day 12-13 | 5 | User Profile | ✅ Done |
| Day 14-15 | 6 | Error & Performance | ✅ Done |
| Day 16-17 | 7 | Testing & Deploy | ⏳ |

Estimated total: **17 days** from start to fully functional production app.

## Success Criteria

App is ready when:
- ✅ User registers/logs in
- ✅ User browses products
- ✅ User adds to cart
- ✅ User applies promotional codes
- ✅ User checks out (order placed)
- ✅ User views order status
- ✅ User views profile & order history
- ✅ All tests pass (70%+ coverage)
- ✅ No critical errors
- ✅ Lighthouse score >= 80
