import { Client } from './client.model';
import { Product } from './product.model';

export interface Order {
  id: number;
  createdAt: string;
  status: string;
  clientId: number;
  client: Client | null;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Product | null;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  clientId: number;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
}