# React Frontend - Feature Implementation Sequence

Plan implementacji features w logicznym porządku, aby zbudować w pełni działającą aplikację etapami.

## Sprint 1: Foundation & Auth (Days 1-3)

**Cel**: Działająca autentykacja, user może login/register.

### 1.1 Project Setup (2h)
- [ ] Vite project initialization
- [ ] Install all dependencies
- [ ] Setup environment variables
- [ ] Create folder structure (src/features, src/shared, src/lib)
- [ ] Configure path aliases (@/)

**Instrukcja**: [QUICK-START.md](QUICK-START.md#1-setup-projektu-30-min)

### 1.2 Core Infrastructure (3h)
- [ ] Setup Axios + queryClient
- [ ] Create error handling layer (ProblemDetails mapping)
- [ ] Create AuthContext + AuthProvider
- [ ] Create UserProvider
- [ ] Create CartProvider
- [ ] Setup root Providers wrapper

**Instrukcje**: 
- [08-authentication-and-jwt.instructions.md](instructions/08-authentication-and-jwt.instructions.md#axios-interceptor-do-automatycznego-dodawania-jwt)
- [13-error-handling-problemdetails.instructions.md](instructions/13-error-handling-problemdetails.instructions.md)

### 1.3 Authentication Pages (4h)
- [ ] Login page with form validation
- [ ] Register page with form validation
- [ ] JWT decoding utility
- [ ] Token storage in localStorage
- [ ] Protected route wrapper (<ProtectedRoute />)
- [ ] Logout functionality
- [ ] Auto-redirect to login on 401

**Instrukcja**: [08-authentication-and-jwt.instructions.md](instructions/08-authentication-and-jwt.instructions.md)

### 1.4 Auth Tests (2h)
- [ ] MSW setup
- [ ] Login flow test
- [ ] Register flow test
- [ ] Protected route test

**Instrukcja**: [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md#scenario-1-user-registration---login---view-profile)

**DoD (Definition of Done)**:
- ✅ Register -> Login -> JWT w localStorage
- ✅ Protected routes redirect to /login gdy !token
- ✅ Nieautoryzowane requests zwracają 401 + redirect
- ✅ Unit + integration tests przechodzą
- ✅ Brak lint/typecheck errors

---

## Sprint 2: Products & Cart (Days 4-6)

**Cel**: Przeglądanie produktów, dodawanie do koszyka.

### 2.1 Products Listing (3h)
- [ ] ProductService API client
- [ ] React Query hooks (useAllProducts, useProductsByShop)
- [ ] ProductList component with loading/error/empty states
- [ ] ProductCard component
- [ ] Product filtering by shop
- [ ] Client-side sorting

**Instrukcja**: [09-products-listing-and-caching.instructions.md](instructions/09-products-listing-and-caching.instructions.md)

### 2.2 Shopping Cart (3h)
- [ ] CartContext with add/remove/update/clear actions
- [ ] Cart persistence in localStorage
- [ ] CartItem component
- [ ] CartSummary component
- [ ] Quantity selector with min/max validation
- [ ] Remove item from cart

**Instrukcja**: [10-shopping-cart-and-orders.instructions.md](instructions/10-shopping-cart-and-orders.instructions.md#cart-context)

### 2.3 Cart UI (2h)
- [ ] Cart page/modal
- [ ] Display cart items with price breakdown
- [ ] Show cart total
- [ ] Link from ProductCard to cart
- [ ] Empty cart state

**Instrukcja**: [10-shopping-cart-and-orders.instructions.md](instructions/10-shopping-cart-and-orders.instructions.md#komponent-listy-produktow)

### 2.4 Tests (2h)
- [ ] Product listing test
- [ ] Add to cart test
- [ ] Update quantity test
- [ ] Clear cart test

**Instrukcja**: [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md#scenario-2-browse-products---add-to-cart---checkout)

**DoD**:
- ✅ Produkty ładują się z backendu
- ✅ Filtrowanie po sklepie działa
- ✅ Add to cart -> wyświetla się w cart modal
- ✅ Persist cart w localStorage
- ✅ Tests pass (50%+ pokrycie)

---

## Sprint 3: Orders & Checkout (Days 7-9)

**Cel**: Użytkownik może złożyć zamówienie z idempotencją.

### 3.1 Order Placement (3h)
- [ ] OrderService API client (placeOrder, getMyOrders, getById)
- [ ] Generate idempotencyKey (UUID v4)
- [ ] Checkout form component
- [ ] Error handling dla checkout (ProblemDetails)
- [ ] Order confirmation page
- [ ] Display order ID i summary

**Instrukcje**:
- [10-shopping-cart-and-orders.instructions.md](instructions/10-shopping-cart-and-orders.instructions.md#checkout-z-promocjami)
- [14-idempotency-and-retry-patterns.instructions.md](instructions/14-idempotency-and-retry-patterns.instructions.md)

### 3.2 Idempotency & Retry (2h)
- [ ] Idempotency key generation
- [ ] Idempotency cache in memory
- [ ] Retry logic with exponential backoff
- [ ] Retry UI (show "Retrying..." status)
- [ ] Max retries (3) logic

**Instrukcja**: [14-idempotency-and-retry-patterns.instructions.md](instructions/14-idempotency-and-retry-patterns.instructions.md)

### 3.3 Order Status Polling (2h)
- [ ] Order detail page
- [ ] Polling logic (fetch every 2s)
- [ ] Display order status (Created -> PaymentPending -> PaymentAuthorized -> Fulfilled)
- [ ] Auto-refresh when status changes
- [ ] Stop polling when order is Fulfilled

**Instrukcja**: [12-user-profile-and-history.instructions.md](instructions/12-user-profile-and-history.instructions.md#polling-dla-statusu-zamowienia)

### 3.4 Tests (2h)
- [ ] Checkout flow test
- [ ] Idempotency test (duplicate request)
- [ ] Retry on 503 test
- [ ] Order status polling test

**Instrukcja**: [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md#scenario-2-browse-products---add-to-cart---checkout)

**DoD**:
- ✅ Checkout -> Order placed (POST /api/orders)
- ✅ Idempotency-Key header sent
- ✅ Retry logic works (503 -> retry -> success)
- ✅ Cannot duplicate order (same key = same result)
- ✅ Order status polls and updates
- ✅ All tests pass

---

## Sprint 4: Promotions (Days 10-11)

**Cel**: Użytkownik może aplikować promocje na checkout.

### 4.1 Promotions Display (2h)
- [ ] PromotionService API client
- [ ] React Query hooks (useActivePromotions, useUserPromotionProfile)
- [ ] Promotions list component
- [ ] Promotion card with details (discount%, required points)
- [ ] Show which promos are applicable to cart

**Instrukcja**: [11-promotions-and-discounts.instructions.md](instructions/11-promotions-and-discounts.instructions.md#komponenty)

### 4.2 Promotion Evaluation (2h)
- [ ] evaluatePromotions API call
- [ ] Integration w checkout (call before order)
- [ ] Display applied discounts in order summary
- [ ] Display loyalty points earned
- [ ] Handle promo evaluation errors

**Instrukcja**: [11-promotions-and-discounts.instructions.md](instructions/11-promotions-and-discounts.instructions.md#api-client-dla-promocji)

### 4.3 Add Promos to Cart (2h)
- [ ] applyPromotion action w CartContext
- [ ] removePromotion action
- [ ] Display applied promos in cart
- [ ] Validate user has enough loyalty points
- [ ] Update cart UI when promo applied/removed

**Instrukcja**: [11-promotions-and-discounts.instructions.md](instructions/11-promotions-and-discounts.instructions.md#promocje-w-koszyku)

### 4.4 Tests (1.5h)
- [ ] Promotion listing test
- [ ] Apply promotion test
- [ ] Evaluate promotions test

**Instrukcja**: [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md#scenario-2-browse-products---add-to-cart---checkout)

**DoD**:
- ✅ Promotions load z backendu
- ✅ User może apply/remove promotions
- ✅ evaluatePromotions zwraca correct discounts
- ✅ Order zawiera appliedPromotionIds
- ✅ Loyalty points earned are shown
- ✅ Tests pass

---

## Sprint 5: User Profile & History (Days 12-13)

**Cel**: Użytkownik może przeglądać swój profil i historię zamówień.

### 5.1 User Profile (2h)
- [ ] UserService API client (getProfile, updateProfile)
- [ ] UserProvider z useQuery
- [ ] Profile page component
- [ ] Edit profile form (firstName, lastName, phoneNumber)
- [ ] Save changes to backend
- [ ] Show user info (email, created date)

**Instrukcja**: [12-user-profile-and-history.instructions.md](instructions/12-user-profile-and-history.instructions.md#profil-uzytkownika-component)

### 5.2 Order History (2h)
- [ ] Order history list in UserProvider
- [ ] Order history table/list component
- [ ] Click order -> go to detail page
- [ ] Show order ID, date, total, status, item count
- [ ] Link to view full order details

**Instrukcja**: [12-user-profile-and-history.instructions.md](instructions/12-user-profile-and-history.instructions.md#historia-zamowen)

### 5.3 Profile UI Polish (1h)
- [ ] Profile navigation
- [ ] Edit mode toggle
- [ ] Unsaved changes warning
- [ ] Success/error messages
- [ ] Loading states

**DoD**:
- ✅ Profile loads from backend
- ✅ User can edit firstName, lastName, phoneNumber
- ✅ Save changes persists
- ✅ Order history displays correctly
- ✅ Can navigate to order detail from history

---

## Sprint 6: Error Handling & Performance (Days 14-15)

**Cel**: Solidna obsługa błędów i szybka aplikacja.

### 6.1 Error Handling (2h)
- [ ] ErrorBoundary component
- [ ] Error UI dla 401, 404, 409, 422, 5xx, timeout
- [ ] Retry buttons na error states
- [ ] CorrelationId display w error messages
- [ ] Test error scenarios

**Instrukcja**: [13-error-handling-problemdetails.instructions.md](instructions/13-error-handling-problemdetails.instructions.md)

### 6.2 Performance (2h)
- [ ] Code splitting (lazy load pages)
- [ ] Configure React Query cache
- [ ] Implement localStorage cache
- [ ] Image optimization (lazy loading)
- [ ] Bundle analysis (`npm run analyze-bundle`)

**Instrukcja**: [17-performance-and-caching-strategies.instructions.md](instructions/17-performance-and-caching-strategies.instructions.md)

### 6.3 Testing Coverage (1h)
- [ ] Add integration test dla error scenarios
- [ ] Test retry logic
- [ ] Test timeout handling

**Instrukcja**: [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md#scenario-4-error-handling--retry)

**DoD**:
- ✅ Bundle size < 300KB (gzipped)
- ✅ All error scenarios handled
- ✅ Retry logic works
- ✅ Tests pass (70%+ coverage)

---

## Sprint 7: Integration Testing & Deployment (Days 16-17)

**Cel**: Kompletne testy i gotowe do produkcji.

### 7.1 Integration Tests (2h)
- [ ] Complete auth flow test
- [ ] Complete checkout flow test
- [ ] Error scenario tests
- [ ] Promotion scenario test
- [ ] Profile update test

**Instrukcja**: [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md)

### 7.2 gRPC Debugging (1h)
- [ ] Understand gRPC error codes
- [ ] Log correlation IDs
- [ ] Test timeout handling
- [ ] Test grpc unavailability

**Instrukcja**: [15-grpc-client-integration.instructions.md](instructions/15-grpc-client-integration.instructions.md)

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
| Day 1-3 | 1 | Auth working | ⏳ |
| Day 4-6 | 2 | Products + Cart | ⏳ |
| Day 7-9 | 3 | Checkout + Orders | ⏳ |
| Day 10-11 | 4 | Promotions | ⏳ |
| Day 12-13 | 5 | User Profile | ⏳ |
| Day 14-15 | 6 | Error & Performance | ⏳ |
| Day 16-17 | 7 | Testing & Deploy | ⏳ |

Estimated total: **17 days** od start do fully functional production app.

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
