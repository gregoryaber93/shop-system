import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { type AddCartItemInput, type CartContextType, type CartState } from "../model/cart.types";

const CART_STORAGE_KEY = "cart";
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

const emptyCart = (): CartState => ({
  items: [],
  totalPrice: 0,
  appliedPromotions: [],
  loyaltyPointsEarned: 0,
});

const calculateTotal = (items: CartState["items"]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const clampQuantity = (value: number): number => {
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, value));
};

const getInitialCart = (): CartState => {
  if (typeof window === "undefined") {
    return emptyCart();
  }

  const rawValue = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!rawValue) {
    return emptyCart();
  }

  try {
    const parsed = JSON.parse(rawValue) as CartState;
    return {
      ...parsed,
      totalPrice: calculateTotal(parsed.items ?? []),
      appliedPromotions: parsed.appliedPromotions ?? [],
      loyaltyPointsEarned: parsed.loyaltyPointsEarned ?? 0,
    };
  } catch {
    return emptyCart();
  }
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartState>(getInitialCart);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = (item: AddCartItemInput) => {
    setCart((previous) => {
      const existingItem = previous.items.find((entry) => entry.productId === item.productId);

      const items = existingItem
        ? previous.items.map((entry) =>
            entry.productId === item.productId
              ? { ...entry, quantity: clampQuantity(entry.quantity + item.quantity) }
              : entry,
          )
        : [...previous.items, { ...item, quantity: clampQuantity(item.quantity) }];

      return {
        ...previous,
        items,
        totalPrice: calculateTotal(items),
      };
    });
  };

  const removeItem = (productId: string) => {
    setCart((previous) => {
      const items = previous.items.filter((entry) => entry.productId !== productId);
      return { ...previous, items, totalPrice: calculateTotal(items) };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < MIN_QUANTITY) {
      removeItem(productId);
      return;
    }

    const safeQuantity = clampQuantity(quantity);

    setCart((previous) => {
      const items = previous.items.map((entry) =>
        entry.productId === productId ? { ...entry, quantity: safeQuantity } : entry,
      );

      return {
        ...previous,
        items,
        totalPrice: calculateTotal(items),
      };
    });
  };

  const clearCart = () => {
    setCart(emptyCart());
  };

  const applyPromotion = (promotionId: string) => {
    setCart((previous) => ({
      ...previous,
      appliedPromotions: [...new Set([...previous.appliedPromotions, promotionId])],
    }));
  };

  const removePromotion = (promotionId: string) => {
    setCart((previous) => ({
      ...previous,
      appliedPromotions: previous.appliedPromotions.filter((entry) => entry !== promotionId),
    }));
  };

  const value = useMemo<CartContextType>(() => ({
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyPromotion,
    removePromotion,
    getTotalPrice: () => cart.totalPrice,
  }), [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};
