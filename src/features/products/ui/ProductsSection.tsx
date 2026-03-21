import { useMemo, useState, type ChangeEvent } from "react";

import { useAllProducts, useProductsByShop } from "../hooks/useProducts";
import { type Product, type ProductsFilterState } from "../model/product.types";
import { ProductList } from "./ProductList";

const sortProducts = (products: Product[], sortOrder: ProductsFilterState["sortOrder"]): Product[] => {
  const copy = [...products];

  switch (sortOrder) {
    case "name-desc":
      return copy.sort((left, right) => right.name.localeCompare(left.name));
    case "price-asc":
      return copy.sort((left, right) => left.price - right.price);
    case "price-desc":
      return copy.sort((left, right) => right.price - left.price);
    case "name-asc":
    default:
      return copy.sort((left, right) => left.name.localeCompare(right.name));
  }
};

export const ProductsSection = () => {
  const [filters, setFilters] = useState<ProductsFilterState>({
    selectedShopId: "all",
    sortOrder: "name-asc",
  });

  const allProductsQuery = useAllProducts();
  const filteredProductsQuery = useProductsByShop(filters.selectedShopId === "all" ? null : filters.selectedShopId);

  const allProducts = allProductsQuery.data ?? [];
  const activeProducts = filters.selectedShopId === "all"
    ? allProducts
    : filteredProductsQuery.data ?? [];

  const shopOptions = useMemo(() => {
    return Array.from(new Set(allProducts.map((product) => product.shopId))).sort();
  }, [allProducts]);

  const sortedProducts = useMemo(() => {
    return sortProducts(activeProducts, filters.sortOrder);
  }, [activeProducts, filters.sortOrder]);

  const isLoading = allProductsQuery.isLoading || filteredProductsQuery.isLoading;
  const error = (allProductsQuery.error ?? filteredProductsQuery.error) as Error | null;

  const onShopChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilters((current) => ({
      ...current,
      selectedShopId: event.target.value,
    }));
  };

  const onSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilters((current) => ({
      ...current,
      sortOrder: event.target.value as ProductsFilterState["sortOrder"],
    }));
  };

  const onRetry = () => {
    if (filters.selectedShopId === "all") {
      void allProductsQuery.refetch();
      return;
    }

    void filteredProductsQuery.refetch();
  };

  return (
    <section aria-labelledby="catalog-heading">
      <header>
        <h2 id="catalog-heading">Catalog</h2>
        <p>Browse products by shop and sort them client-side.</p>
      </header>

      <div>
        <label htmlFor="shop-filter">Shop</label>
        <select id="shop-filter" value={filters.selectedShopId} onChange={onShopChange}>
          <option value="all">All shops</option>
          {shopOptions.map((shopId) => (
            <option key={shopId} value={shopId}>{shopId}</option>
          ))}
        </select>

        <label htmlFor="sort-order">Sort</label>
        <select id="sort-order" value={filters.sortOrder} onChange={onSortChange}>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="price-asc">Price low-high</option>
          <option value="price-desc">Price high-low</option>
        </select>
      </div>

      <ProductList
        products={sortedProducts}
        isLoading={isLoading}
        errorMessage={error?.message ?? null}
        onRetry={onRetry}
      />
    </section>
  );
};
