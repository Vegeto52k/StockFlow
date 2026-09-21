import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateOrderRequest,
  Order
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5166/api/orders';

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(
      `${this.apiUrl}/${id}`
    );
  }

  createOrder(
    request: CreateOrderRequest
  ): Observable<Order> {
    return this.http.post<Order>(
      this.apiUrl,
      request
    );
  }
}