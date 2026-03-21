export type OrderStatus =
  | "Created"
  | "PaymentPending"
  | "PaymentAuthorized"
  | "PaymentFailed"
  | "Fulfilled";

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  discountPercentage: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  discountApplied: number;
  loyaltyPointsEarned: number;
  status: OrderStatus;
  createdAt: string;
}

export interface PlaceOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  appliedPromotionIds: string[];
  idempotencyKey: string;
}
