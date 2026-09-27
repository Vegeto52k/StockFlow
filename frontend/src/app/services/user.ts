import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateUserRequest,
  UpdateUserRoleRequest,
  User
} from '../models/user.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(
      this.apiUrl
    );
  }

  createUser(
    request: CreateUserRequest
  ): Observable<User> {
    return this.http.post<User>(
      this.apiUrl,
      request
    );
  }

  updateUserRole(
    id: number,
    request: UpdateUserRoleRequest
  ): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/${id}/role`,
      request
    );
  }

  deleteUser(
    id: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}