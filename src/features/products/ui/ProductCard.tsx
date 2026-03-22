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
    <article className="product-card">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          width={240}
          height={160}
          loading="lazy"
        />
      ) : null}
      <h3>{product.name}</h3>
      <p><strong>Type:</strong> {product.type}</p>
      <p><strong>Shop:</strong> {product.shopId}</p>
      <p aria-label={`Price ${formatPrice(product.price)}`}><strong>Price:</strong> {formatPrice(product.price)}</p>
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
