import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

import { Client } from '../../models/client.model';

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
export class Clients {

  clientDialogVisible = false;

  clients: Client[] = [
    {
      id: 1,
      name: 'Martin Dupont',
      email: 'martin.dupont@email.fr',
      phone: '06 12 34 56 78',
      city: 'Marseille'
    },
    {
      id: 2,
      name: 'Sophie Bernard',
      email: 'sophie.bernard@email.fr',
      phone: '06 98 76 54 32',
      city: 'Aix-en-Provence'
    },
    {
      id: 3,
      name: 'Lucas Morel',
      email: 'lucas.morel@email.fr',
      phone: '06 44 28 17 90',
      city: 'Toulon'
    }
  ];

  clientForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
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

  openCreateClientDialog() {
    this.clientForm.reset();
    this.clientDialogVisible = true;
  }

  createClient() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const newClient: Client = {
      id: Math.max(...this.clients.map(client => client.id), 0) + 1,
      ...this.clientForm.getRawValue()
    };

    this.clients = [...this.clients, newClient];
    this.clientDialogVisible = false;
    this.clientForm.reset();
  }
}