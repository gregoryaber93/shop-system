import { useCart } from "../context/CartContext";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal = ({ isOpen, onClose }: CartModalProps) => {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();

  if (!isOpen) {
    return null;
  }

  return (
    <section aria-label="Cart modal">
      <header>
        <h2>Your cart</h2>
        <button type="button" onClick={onClose}>Close</button>
      </header>

      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cart.items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onQuantityChange={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>
      )}

      <CartSummary cart={cart} onClear={clearCart} />
    </section>
  );
};
