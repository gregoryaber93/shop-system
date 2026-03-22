import { ProductCard } from "./ProductCard";
import { ErrorState } from "@/shared/ui/ErrorState";
import { type Product } from "../model/product.types";

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export const ProductList = ({ products, isLoading, error, onRetry }: ProductListProps) => {
  if (error) {
    return (
      <section aria-labelledby="products-heading">
        <h2 id="products-heading">Products</h2>
        <ErrorState error={error} onRetry={onRetry} title="Products unavailable" />
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
