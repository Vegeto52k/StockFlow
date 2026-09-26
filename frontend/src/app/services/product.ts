import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Product,
  ProductSaveRequest
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5166/api/products';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(
      this.apiUrl
    );
  }

  getProductById(
    id: number
  ): Observable<Product> {
    return this.http.get<Product>(
      `${this.apiUrl}/${id}`
    );
  }

  createProduct(
    product: ProductSaveRequest
  ): Observable<Product> {
    return this.http.post<Product>(
      this.apiUrl,
      product
    );
  }

  updateProduct(
    id: number,
    product: ProductSaveRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${id}`,
      product
    );
  }

  restockProduct(
    id: number,
    quantity: number,
    reason: string
  ): Observable<Product> {
    return this.http.post<Product>(
      `${this.apiUrl}/${id}/restock`,
      {
        quantity,
        reason
      }
    );
  }

  adjustStock(
    id: number,
    actualQuantity: number,
    reason: string
  ): Observable<Product> {
    return this.http.post<Product>(
      `${this.apiUrl}/${id}/adjust-stock`,
      {
        actualQuantity,
        reason
      }
    );
  }

  deleteProduct(
    id: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}