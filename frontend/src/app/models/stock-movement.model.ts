export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  orderId: number | null;
  quantityChange: number;
  type: string;
  reason: string;
  createdAt: string;
}