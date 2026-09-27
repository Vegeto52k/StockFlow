import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Client } from '../models/client.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/clients`;

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(
      this.apiUrl
    );
  }

  createClient(
    client: Omit<Client, 'id'>
  ): Observable<Client> {
    return this.http.post<Client>(
      this.apiUrl,
      client
    );
  }

  updateClient(
    id: number,
    client: Omit<Client, 'id'>
  ): Observable<Client> {
    return this.http.put<Client>(
      `${this.apiUrl}/${id}`,
      client
    );
  }

  deleteClient(
    id: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}