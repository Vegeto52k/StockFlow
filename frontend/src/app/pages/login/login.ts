import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule
  ],
  providers: [
    MessageService
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  private readonly messageService =
    inject(MessageService);

  loading = false;

  loginForm = new FormGroup({
    username: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    password: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    )
  });

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const request =
      this.loginForm.getRawValue();

    this.authService.login(request).subscribe({
      next: () => {
        this.loading = false;

        this.router.navigate([
          '/dashboard'
        ]);
      },

      error: (error) => {
        this.loading = false;

        const detail =
          typeof error.error === 'string'
            ? error.error
            : 'Impossible de se connecter.';

        this.messageService.add({
          severity: 'error',
          summary: 'Connexion impossible',
          detail
        });
      }
    });
  }
}