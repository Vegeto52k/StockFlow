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
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import {
  Product,
  ProductSaveRequest
} from '../../models/product.model';

import { Supplier } from '../../models/supplier.model';

import { ProductService } from '../../services/product';
import { SupplierService } from '../../services/supplier';

@Component({
  selector: 'app-products',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    ToastModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {

  private readonly productService =
    inject(ProductService);

  private readonly supplierService =
    inject(SupplierService);

  private readonly confirmationService =
    inject(ConfirmationService);

  private readonly messageService =
    inject(MessageService);

  products = signal<Product[]>([]);

  suppliers = signal<Supplier[]>([]);

  productDialogVisible = false;

  editingProductId: number | null = null;

  productForm = new FormGroup({

    name: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    reference: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    category: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    unitPrice: new FormControl(
      0,
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(0.01)
        ]
      }
    ),

    stockQuantity: new FormControl(
      0,
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(0)
        ]
      }
    ),

    minimumStock: new FormControl(
      0,
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(0)
        ]
      }
    ),

    supplierId:
      new FormControl<number | null>(
        null
      )
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadSuppliers();
  }

  loadProducts(): void {
    this.productService
      .getProducts()
      .subscribe({
        next: (products) => {
          this.products.set(products);
        },

        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail:
              'Impossible de charger les produits.'
          });
        }
      });
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

    this.editingProductId = null;

    this.productForm.reset({
      name: '',
      reference: '',
      category: '',
      unitPrice: 0,
      stockQuantity: 0,
      minimumStock: 0,
      supplierId: null
    });

    this.productDialogVisible = true;
  }

  openEditDialog(
    product: Product
  ): void {

    this.editingProductId =
      product.id;

    this.productForm.setValue({
      name: product.name,
      reference: product.reference,
      category: product.category,
      unitPrice: product.unitPrice,
      stockQuantity: product.stockQuantity,
      minimumStock: product.minimumStock,
      supplierId: product.supplierId
    });

    this.productDialogVisible = true;
  }

  saveProduct(): void {

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const product: ProductSaveRequest =
      this.productForm.getRawValue();

    if (this.editingProductId === null) {

      this.productService
        .createProduct(product)
        .subscribe({
          next: () => {

            this.loadProducts();

            this.productDialogVisible =
              false;

            this.messageService.add({
              severity: 'success',
              summary: 'Produit créé',
              detail:
                'Le produit a été ajouté.'
            });
          },

          error: () => {
            this.showSaveError();
          }
        });

      return;
    }

    this.productService
      .updateProduct(
        this.editingProductId,
        product
      )
      .subscribe({
        next: () => {

          this.loadProducts();

          this.productDialogVisible =
            false;

          this.messageService.add({
            severity: 'success',
            summary: 'Produit modifié',
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
    product: Product
  ): void {

    this.confirmationService.confirm({
      message:
        `Supprimer le produit "${product.name}" ?`,

      header:
        'Confirmation de suppression',

      icon:
        'pi pi-exclamation-triangle',

      acceptLabel:
        'Supprimer',

      rejectLabel:
        'Annuler',

      accept: () => {
        this.deleteProduct(product);
      }
    });
  }

  private deleteProduct(
    product: Product
  ): void {

    this.productService
      .deleteProduct(product.id)
      .subscribe({
        next: () => {

          this.products.update(
            products =>
              products.filter(
                currentProduct =>
                  currentProduct.id !==
                  product.id
              )
          );

          this.messageService.add({
            severity: 'success',
            summary: 'Produit supprimé',
            detail:
              'Le produit a été supprimé.'
          });
        },

        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail:
              'Impossible de supprimer le produit.'
          });
        }
      });
  }

  isLowStock(
    product: Product
  ): boolean {
    return (
      product.stockQuantity <=
      product.minimumStock
    );
  }

  private showSaveError(): void {

    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail:
        'Impossible d’enregistrer le produit.'
    });
  }
}