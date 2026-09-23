import {
  Component,
  inject
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  appTitle = 'StockFlow';

  username =
    this.authService.username;

  role =
    this.authService.role;

  isAuthenticated =
    this.authService.isAuthenticated;

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);
  }
}