import { QuantitySelector } from "./QuantitySelector";
import { type CartItem as CartItemType } from "../model/cart.types";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const formatPrice = (value: number): string => `${value.toFixed(2)} USD`;

export const CartItem = ({ item, onQuantityChange, onRemove }: CartItemProps) => {
  const lineTotal = item.price * item.quantity;

  return (
    <article>
      <h4>{item.productName}</h4>
      <p>Unit price: {formatPrice(item.price)}</p>
      <p>Line total: {formatPrice(lineTotal)}</p>
      <QuantitySelector
        value={item.quantity}
        min={1}
        max={99}
        onChange={(nextValue) => onQuantityChange(item.productId, nextValue)}
      />
      <button type="button" onClick={() => onRemove(item.productId)}>
        Remove item
      </button>
    </article>
  );
};
