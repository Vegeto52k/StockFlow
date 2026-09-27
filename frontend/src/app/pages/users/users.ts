import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ConfirmationService,
  MessageService
} from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import {
  CreateUserRequest,
  User
} from '../../models/user.model';

import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-users',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    TableModule,
    ToastModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {

  private readonly userService =
    inject(UserService);

  private readonly authService =
    inject(AuthService);

  private readonly confirmationService =
    inject(ConfirmationService);

  private readonly messageService =
    inject(MessageService);

  users =
    signal<User[]>([]);

  createDialogVisible = false;

  roleOptions = [
    {
      label: 'Utilisateur',
      value: 'User'
    },
    {
      label: 'Administrateur',
      value: 'Admin'
    }
  ];

  currentUsername =
    this.authService.username;

  createForm = new FormGroup({

    username: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3)
        ]
      }
    ),

    password: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8)
        ]
      }
    ),

    role:
      new FormControl<'Admin' | 'User'>(
        'User',
        {
          nonNullable: true,
          validators: [
            Validators.required
          ]
        }
      )
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {

    this.userService
      .getUsers()
      .subscribe({
        next: (users) => {
          this.users.set(users);
        },

        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail:
              'Impossible de charger les utilisateurs.'
          });
        }
      });
  }

  openCreateDialog(): void {

    this.createForm.reset({
      username: '',
      password: '',
      role: 'User'
    });

    this.createDialogVisible = true;
  }

  createUser(): void {

    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const request:
      CreateUserRequest =
        this.createForm.getRawValue();

    this.userService
      .createUser(request)
      .subscribe({
        next: (user) => {

          this.users.update(
            users => [
              ...users,
              user
            ]
          );

          this.users.update(
            users =>
              [...users].sort(
                (first, second) =>
                  first.username.localeCompare(
                    second.username
                  )
              )
          );

          this.createDialogVisible =
            false;

          this.messageService.add({
            severity: 'success',
            summary:
              'Utilisateur créé',
            detail:
              `Le compte "${user.username}" a été créé.`
          });
        },

        error: (error) => {
          this.showApiError(
            error,
            'Impossible de créer l’utilisateur.'
          );
        }
      });
  }

  changeRole(
    user: User,
    role: 'Admin' | 'User'
  ): void {

    if (user.role === role) {
      return;
    }

    this.userService
      .updateUserRole(
        user.id,
        { role }
      )
      .subscribe({
        next: (updatedUser) => {

          this.replaceUser(
            updatedUser
          );

          this.messageService.add({
            severity: 'success',
            summary:
              'Rôle modifié',
            detail:
              `Le rôle de "${updatedUser.username}" est maintenant ${updatedUser.role}.`
          });
        },

        error: (error) => {

          this.showApiError(
            error,
            'Impossible de modifier le rôle.'
          );

          this.loadUsers();
        }
      });
  }

  confirmDelete(
    user: User
  ): void {

    this.confirmationService.confirm({
      message:
        `Supprimer le compte "${user.username}" ?`,

      header:
        'Confirmation de suppression',

      icon:
        'pi pi-exclamation-triangle',

      acceptLabel:
        'Supprimer',

      rejectLabel:
        'Annuler',

      accept: () => {
        this.deleteUser(user);
      }
    });
  }

  isCurrentUser(
    user: User
  ): boolean {

    return (
      user.username ===
      this.currentUsername()
    );
  }

  private deleteUser(
    user: User
  ): void {

    this.userService
      .deleteUser(user.id)
      .subscribe({
        next: () => {

          this.users.update(
            users =>
              users.filter(
                currentUser =>
                  currentUser.id !== user.id
              )
          );

          this.messageService.add({
            severity: 'success',
            summary:
              'Utilisateur supprimé',
            detail:
              `Le compte "${user.username}" a été supprimé.`
          });
        },

        error: (error) => {
          this.showApiError(
            error,
            'Impossible de supprimer l’utilisateur.'
          );
        }
      });
  }

  private replaceUser(
    updatedUser: User
  ): void {

    this.users.update(
      users =>
        users.map(
          user =>
            user.id === updatedUser.id
              ? updatedUser
              : user
        )
    );
  }

  private showApiError(
    error: any,
    fallbackMessage: string
  ): void {

    const detail =
      typeof error.error === 'string'
        ? error.error
        : fallbackMessage;

    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail
    });
  }
}