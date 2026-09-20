import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5166/api/clients';

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  createClient(client: Omit<Client, 'id'>): Observable<Client> {
    return this.http.post<Client>(
      this.apiUrl,
      client
    );
  }
}