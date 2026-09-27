import { HttpClient } from '@angular/common/http';

import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  Observable,
  tap
} from 'rxjs';

import {
  AuthResponse,
  LoginRequest
} from '../models/auth.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/auth`;

  private readonly tokenKey =
    'stockflow_token';

  private readonly usernameKey =
    'stockflow_username';

  private readonly roleKey =
    'stockflow_role';

  private readonly currentToken =
    signal<string | null>(
      localStorage.getItem(
        this.tokenKey
      )
    );

  private readonly currentUsername =
    signal<string | null>(
      localStorage.getItem(
        this.usernameKey
      )
    );

  private readonly currentRole =
    signal<string | null>(
      localStorage.getItem(
        this.roleKey
      )
    );

  username =
    this.currentUsername.asReadonly();

  role =
    this.currentRole.asReadonly();

  isAuthenticated =
    computed(
      () =>
        this.currentToken() !== null
    );

  login(
    request: LoginRequest
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        request
      )
      .pipe(
        tap(response => {
          this.saveSession(
            response
          );
        })
      );
  }

  logout(): void {

    localStorage.removeItem(
      this.tokenKey
    );

    localStorage.removeItem(
      this.usernameKey
    );

    localStorage.removeItem(
      this.roleKey
    );

    this.currentToken.set(null);
    this.currentUsername.set(null);
    this.currentRole.set(null);
  }

  getToken(): string | null {
    return this.currentToken();
  }

  getRole(): string | null {
    return this.currentRole();
  }

  private saveSession(
    response: AuthResponse
  ): void {

    localStorage.setItem(
      this.tokenKey,
      response.token
    );

    localStorage.setItem(
      this.usernameKey,
      response.username
    );

    localStorage.setItem(
      this.roleKey,
      response.role
    );

    this.currentToken.set(
      response.token
    );

    this.currentUsername.set(
      response.username
    );

    this.currentRole.set(
      response.role
    );
  }
}