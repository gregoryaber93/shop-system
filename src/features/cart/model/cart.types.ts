export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  shopId: string;
}

export interface CartState {
  items: CartItem[];
  totalPrice: number;
  appliedPromotions: string[];
  loyaltyPointsEarned: number;
}

export interface AddCartItemInput {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  shopId: string;
}

export interface CartContextType {
  cart: CartState;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromotion: (promotionId: string) => void;
  removePromotion: (promotionId: string) => void;
  getTotalPrice: () => number;
}
