import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormControl,
  FormGroup,
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
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { Supplier } from '../../models/supplier.model';
import { SupplierService } from '../../services/supplier';

@Component({
  selector: 'app-suppliers',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    TableModule,
    ToastModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.scss',
})
export class Suppliers implements OnInit {

  private readonly supplierService =
    inject(SupplierService);

  private readonly confirmationService =
    inject(ConfirmationService);

  private readonly messageService =
    inject(MessageService);

  suppliers = signal<Supplier[]>([]);

  supplierDialogVisible = false;

  editingSupplierId: number | null = null;

  supplierForm = new FormGroup({
    name: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    contactName: new FormControl(
      '',
      {
        nonNullable: true
      }
    ),

    email: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.email
        ]
      }
    ),

    phone: new FormControl(
      '',
      {
        nonNullable: true
      }
    ),

    city: new FormControl(
      '',
      {
        nonNullable: true
      }
    )
  });

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService
      .getSuppliers()
      .subscribe({
        next: (suppliers) => {
          this.suppliers.set(suppliers);
        },

        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail:
              'Impossible de charger les fournisseurs.'
          });
        }
      });
  }

  openCreateDialog(): void {

    this.editingSupplierId = null;

    this.supplierForm.reset({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      city: ''
    });

    this.supplierDialogVisible = true;
  }

  openEditDialog(
    supplier: Supplier
  ): void {

    this.editingSupplierId =
      supplier.id;

    this.supplierForm.setValue({
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      city: supplier.city
    });

    this.supplierDialogVisible = true;
  }

  saveSupplier(): void {

    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    const supplier =
      this.supplierForm.getRawValue();

    if (this.editingSupplierId === null) {

      this.supplierService
        .createSupplier(supplier)
        .subscribe({
          next: (createdSupplier) => {

            this.suppliers.update(
              suppliers => [
                ...suppliers,
                createdSupplier
              ]
            );

            this.supplierDialogVisible = false;

            this.messageService.add({
              severity: 'success',
              summary: 'Fournisseur créé',
              detail:
                'Le fournisseur a été ajouté.'
            });
          },

          error: () => {
            this.showSaveError();
          }
        });

      return;
    }

    this.supplierService
      .updateSupplier(
        this.editingSupplierId,
        supplier
      )
      .subscribe({
        next: () => {

          this.loadSuppliers();

          this.supplierDialogVisible = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Fournisseur modifié',
            detail:
              'Les informations ont été mises à jour.'
          });
        },

        error: () => {
          this.showSaveError();
        }
      });
  }

  confirmDelete(
    supplier: Supplier
  ): void {

    this.confirmationService.confirm({
      message:
        `Supprimer le fournisseur "${supplier.name}" ?`,

      header:
        'Confirmation de suppression',

      icon:
        'pi pi-exclamation-triangle',

      acceptLabel:
        'Supprimer',

      rejectLabel:
        'Annuler',

      accept: () => {
        this.deleteSupplier(
          supplier
        );
      }
    });
  }

  private deleteSupplier(
    supplier: Supplier
  ): void {

    this.supplierService
      .deleteSupplier(supplier.id)
      .subscribe({
        next: () => {

          this.suppliers.update(
            suppliers =>
              suppliers.filter(
                currentSupplier =>
                  currentSupplier.id !==
                  supplier.id
              )
          );

          this.messageService.add({
            severity: 'success',
            summary: 'Fournisseur supprimé',
            detail:
              'Le fournisseur a été supprimé.'
          });
        },

        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail:
              'Impossible de supprimer le fournisseur.'
          });
        }
      });
  }

  private showSaveError(): void {

    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail:
        'Impossible d’enregistrer le fournisseur.'
    });
  }
}