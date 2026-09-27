import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateOrderRequest,
  Order
} from '../models/order.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/orders`;

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(
      this.apiUrl
    );
  }

  getOrderById(
    id: number
  ): Observable<Order> {
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

  updateOrderStatus(
    id: number,
    status: 'Validated' | 'Cancelled'
  ): Observable<Order> {
    return this.http.patch<Order>(
      `${this.apiUrl}/${id}/status`,
      {
        status
      }
    );
  }
}