export interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  shopId: string;
}

export interface ProductsFilterState {
  selectedShopId: string;
  sortOrder: "name-asc" | "name-desc" | "price-asc" | "price-desc";
}
