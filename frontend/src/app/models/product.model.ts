import { Supplier } from './supplier.model';

export interface Product {
  id: number;
  name: string;
  reference: string;
  category: string;
  unitPrice: number;
  stockQuantity: number;
  minimumStock: number;
  supplierId: number | null;
  supplier: Supplier | null;
}

export interface ProductSaveRequest {
  name: string;
  reference: string;
  category: string;
  unitPrice: number;
  stockQuantity: number;
  minimumStock: number;
  supplierId: number | null;
}