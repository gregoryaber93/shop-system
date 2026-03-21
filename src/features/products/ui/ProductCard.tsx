import { useCart } from "@/features/cart";

import { type Product } from "../model/product.types";

interface ProductCardProps {
  product: Product;
}

const formatPrice = (price: number): string => {
  return `${price.toFixed(2)} USD`;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <article>
      <h3>{product.name}</h3>
      <p>Type: {product.type}</p>
      <p>Shop: {product.shopId}</p>
      <p aria-label={`Price ${formatPrice(product.price)}`}>Price: {formatPrice(product.price)}</p>
      <button
        type="button"
        onClick={() =>
          addItem({
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: 1,
            shopId: product.shopId,
          })
        }
      >
        Add to cart
      </button>
    </article>
  );
};
