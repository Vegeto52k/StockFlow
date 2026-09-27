import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  StockMovement
} from '../models/stock-movement.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/stockmovements`;

  getStockMovements():
    Observable<StockMovement[]> {

    return this.http.get<StockMovement[]>(
      this.apiUrl
    );
  }

  getStockMovementsByProduct(
    productId: number
  ): Observable<StockMovement[]> {

    return this.http.get<StockMovement[]>(
      `${this.apiUrl}/product/${productId}`
    );
  }
}