---
applyTo: "src/**/*.{ts,tsx}"
---
# Shopping Cart Orders And Checkout Rules

The cart is local state; you send orders to OrderService with promotions.

## Data Structure

```typescript
interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  shopId: string;
}

interface Cart {
  items: CartItem[];
  totalPrice: number;
  appliedPromotions: string[]; // promotion IDs
  loyaltyPointsEarned: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  discountApplied: number;
  loyaltyPointsEarned: number;
  status: 'Created' | 'PaymentPending' | 'PaymentAuthorized' | 'PaymentFailed' | 'Fulfilled';
  createdAt: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  discountPercentage: number;
  lineTotal: number;
}
```

## Cart Context

```typescript
// src/features/cart/context/CartContext.tsx

interface CartContextType {
  cart: Cart;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromotion: (promotionId: string) => void;
  removePromotion: (promotionId: string) => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : { items: [], totalPrice: 0, appliedPromotions: [], loyaltyPointsEarned: 0 };
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.items.find(i => i.productId === product.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map(i =>
            i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return {
        ...prev,
        items: [...prev.items, {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity,
          shopId: product.shopId,
        }],
      };
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter(i => i.productId !== productId),
    }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.map(i =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    }));
  };

  const getTotalPrice = () => {
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const applyPromotion = (promotionId: string) => {
    setCart((prev) => ({
      ...prev,
      appliedPromotions: [...new Set([...prev.appliedPromotions, promotionId])],
    }));
  };

  const removePromotion = (promotionId: string) => {
    setCart((prev) => ({
      ...prev,
      appliedPromotions: prev.appliedPromotions.filter(id => id !== promotionId),
    }));
  };

  const clearCart = () => {
    setCart({ items: [], totalPrice: 0, appliedPromotions: [], loyaltyPointsEarned: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, applyPromotion, removePromotion, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
```

## Checkout with Promotions

```typescript
// src/features/orders/api/orderClient.ts

interface PlaceOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  appliedPromotionIds: string[];
  idempotencyKey: string; // UUID
}

export const orderApiClient = {
  placeOrder: async (request: PlaceOrderRequest, token: string): Promise<Order> => {
    const response = await axios.post(
      `${API_BASE}/api/orders`,
      request,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Idempotency-Key': request.idempotencyKey,
        },
      }
    );
    return response.data;
  },

  cartCheckout: async (request: PlaceOrderRequest, token: string): Promise<Order> => {
    const response = await axios.post(
      `${API_BASE}/api/orders/cart-checkout`,
      request,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Idempotency-Key': request.idempotencyKey,
        },
      }
    );
    return response.data;
  },

  getMyOrders: async (token: string): Promise<Order[]> => {
    const response = await axios.get(
      `${API_BASE}/api/orders/my`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
```

## Checkout Component

```typescript
// src/features/orders/ui/Checkout.tsx

import { v4 as uuidv4 } from 'uuid';
import { useCart } from '@/features/cart/context/CartContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { orderApiClient } from '../api/orderClient';
import { usePromotion } from '@/features/promotions/hooks/usePromotion';

export function Checkout() {
  const { cart, clearCart } = useCart();
  const { token } = useAuth();
  const { evaluatePromotions } = usePromotion();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Not authenticated');

      // Evaluate promotions
      const promoEvaluation = await evaluatePromotions(
        cart.items.map(i => i.productId),
        cart.appliedPromotions
      );

      if (!promoEvaluation.approved) {
        throw new Error('Promotion evaluation failed');
      }

      // Create request
      const request: PlaceOrderRequest = {
        items: cart.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        appliedPromotionIds: cart.appliedPromotions,
        idempotencyKey: uuidv4(),
      };

      return orderApiClient.cartCheckout(request, token);
    },
    onSuccess: (order) => {
      clearCart();
      // Redirect to order confirmation
      navigate(`/orders/${order.id}`);
    },
    onError: (err) => {
      setError(err.message || 'Failed to place order');
    },
  });

  return (
    <div className="checkout">
      <div className="order-summary">
        <h2>Order Summary</h2>
        {cart.items.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            {cart.items.map(item => (
              <div key={item.productId} className="cart-item">
                <span>{item.productName}</span>
                <span>{item.quantity}x</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="total">
              <strong>Total: ${useCart().getTotalPrice().toFixed(2)}</strong>
            </div>
          </>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <button
        onClick={() => placeOrderMutation.mutate()}
        disabled={cart.items.length === 0 || placeOrderMutation.isPending}
      >
        {placeOrderMutation.isPending ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
}
```

## Idempotency

- Always generate a unique `idempotencyKey` (UUID v4) for each order.
- Send it in the `Idempotency-Key` header.
- Backend will deduplicate duplicate orders using this key.

## Order Status Handling

- Status changes asynchronously: `Created` -> `PaymentPending` -> `PaymentAuthorized` -> `Fulfilled`.
- Polling: check status every few seconds using `GET /api/orders/{orderId}`.
- WebSocket (optional): listen for status changes in real-time from server.
