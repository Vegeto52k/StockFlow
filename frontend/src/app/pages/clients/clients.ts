import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { Client } from '../../models/client.model';
import { ClientService } from '../../services/client';

@Component({
  selector: 'app-clients',
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients implements OnInit {

  private readonly clientService = inject(ClientService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  clients = signal<Client[]>([]);

  clientDialogVisible = false;

  editedClientId: number | null = null;

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
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les clients.'
        });
      }
    });
  }

  openCreateClientDialog(): void {
    this.editedClientId = null;
    this.clientForm.reset();
    this.clientDialogVisible = true;
  }

  openEditClientDialog(client: Client): void {
    this.editedClientId = client.id;

    this.clientForm.setValue({
      name: client.name,
      email: client.email,
      phone: client.phone,
      city: client.city
    });

    this.clientDialogVisible = true;
  }

  saveClient(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const clientData = this.clientForm.getRawValue();

    if (this.editedClientId === null) {
      this.createClient(clientData);
      return;
    }

    this.updateClient(
      this.editedClientId,
      clientData
    );
  }

  createClient(clientData: Omit<Client, 'id'>): void {
    this.clientService.createClient(clientData).subscribe({
      next: (createdClient) => {
        this.clients.update(clients => [
          ...clients,
          createdClient
        ]);

        this.closeClientDialog();

        this.messageService.add({
          severity: 'success',
          summary: 'Client créé',
          detail: `${createdClient.name} a été ajouté.`
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de créer le client.'
        });
      }
    });
  }

  updateClient(
    id: number,
    clientData: Omit<Client, 'id'>
  ): void {
    this.clientService.updateClient(id, clientData).subscribe({
      next: (updatedClient) => {
        this.clients.update(clients =>
          clients.map(client =>
            client.id === updatedClient.id
              ? updatedClient
              : client
          )
        );

        this.closeClientDialog();

        this.messageService.add({
          severity: 'success',
          summary: 'Client modifié',
          detail: `${updatedClient.name} a été mis à jour.`
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de modifier le client.'
        });
      }
    });
  }

  confirmDeleteClient(client: Client): void {
    this.confirmationService.confirm({
      header: 'Supprimer le client',
      message: `Voulez-vous vraiment supprimer ${client.name} ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.deleteClient(client);
      }
    });
  }

  deleteClient(client: Client): void {
    this.clientService.deleteClient(client.id).subscribe({
      next: () => {
        this.clients.update(clients =>
          clients.filter(
            existingClient =>
              existingClient.id !== client.id
          )
        );

        this.messageService.add({
          severity: 'success',
          summary: 'Client supprimé',
          detail: `${client.name} a été supprimé.`
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer le client.'
        });
      }
    });
  }

  closeClientDialog(): void {
    this.clientDialogVisible = false;
    this.editedClientId = null;
    this.clientForm.reset();
  }
}