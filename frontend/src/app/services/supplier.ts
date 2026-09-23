import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5166/api/suppliers';

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(
      this.apiUrl
    );
  }

  getSupplierById(
    id: number
  ): Observable<Supplier> {
    return this.http.get<Supplier>(
      `${this.apiUrl}/${id}`
    );
  }

  createSupplier(
    supplier: Omit<Supplier, 'id'>
  ): Observable<Supplier> {
    return this.http.post<Supplier>(
      this.apiUrl,
      supplier
    );
  }

  updateSupplier(
    id: number,
    supplier: Omit<Supplier, 'id'>
  ): Observable<void> {

    return this.http.put<void>(
      `${this.apiUrl}/${id}`,
      {
        id,
        ...supplier
      }
    );
  }

  deleteSupplier(
    id: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}