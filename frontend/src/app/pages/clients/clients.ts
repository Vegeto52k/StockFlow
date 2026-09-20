import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

import { Client } from '../../models/client.model';
import { ClientService } from '../../services/client';

@Component({
  selector: 'app-clients',
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule
  ],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients implements OnInit {

  private readonly clientService = inject(ClientService);

  clientDialogVisible = false;

  clients = signal<Client[]>([]);

  clientForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email
      ]
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    city: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients.set(clients);
      },
      error: (error) => {
        console.error(
          'Erreur lors du chargement des clients',
          error
        );
      }
    });
  }

  openCreateClientDialog(): void {
    this.clientForm.reset();
    this.clientDialogVisible = true;
  }

  createClient(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const clientToCreate = this.clientForm.getRawValue();

    this.clientService.createClient(clientToCreate).subscribe({
      next: (createdClient) => {
        this.clients.update(clients => [
          ...clients,
          createdClient
        ]);

        this.clientDialogVisible = false;
        this.clientForm.reset();
      },
      error: (error) => {
        console.error(
          'Erreur lors de la création du client',
          error
        );
      }
    });
  }
}