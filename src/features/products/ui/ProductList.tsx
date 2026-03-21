import { ProductCard } from "./ProductCard";
import { type Product } from "../model/product.types";

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
}

export const ProductList = ({ products, isLoading, errorMessage, onRetry }: ProductListProps) => {
  if (errorMessage) {
    return (
      <section aria-labelledby="products-heading">
        <h2 id="products-heading">Products</h2>
        <p role="alert">Failed to load products. {errorMessage}</p>
        <button type="button" onClick={onRetry}>Retry</button>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section aria-labelledby="products-heading">
        <h2 id="products-heading">Products</h2>
        <p>Loading products...</p>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section aria-labelledby="products-heading">
        <h2 id="products-heading">Products</h2>
        <p>No products available.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="products-heading">
      <h2 id="products-heading">Products</h2>
      <div>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
