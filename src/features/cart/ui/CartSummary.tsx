import { type CartState } from "../model/cart.types";

interface CartSummaryProps {
  cart: CartState;
  onClear: () => void;
}

const formatPrice = (value: number): string => `${value.toFixed(2)} USD`;

export const CartSummary = ({ cart, onClear }: CartSummaryProps) => {
  return (
    <section aria-labelledby="cart-summary-title">
      <h3 id="cart-summary-title">Cart summary</h3>
      <p>Total items: {cart.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
      <p>Subtotal: {formatPrice(cart.totalPrice)}</p>
      <p>Applied promotions: {cart.appliedPromotions.length}</p>
      <button type="button" onClick={onClear} disabled={cart.items.length === 0}>
        Clear cart
      </button>
    </section>
  );
};
