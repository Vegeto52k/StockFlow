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

  restockDialogVisible = false;

  adjustmentDialogVisible = false;

  editingProductId: number | null = null;

  editingProduct =
    signal<Product | null>(null);

  restockingProduct =
    signal<Product | null>(null);

  adjustingProduct =
    signal<Product | null>(null);

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

  restockForm = new FormGroup({

    quantity: new FormControl(
      1,
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(1)
        ]
      }
    ),

    reason: new FormControl(
      '',
      {
        nonNullable: true
      }
    )
  });

  adjustmentForm = new FormGroup({

    actualQuantity: new FormControl(
      0,
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(0)
        ]
      }
    ),

    reason: new FormControl(
      '',
      {
        nonNullable: true
      }
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

    this.editingProduct.set(null);

    this.productForm.reset({
      name: '',
      reference: '',
      category: '',
      unitPrice: 0,
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

    this.editingProduct.set(
      product
    );

    this.productForm.setValue({
      name: product.name,
      reference: product.reference,
      category: product.category,
      unitPrice: product.unitPrice,
      minimumStock: product.minimumStock,
      supplierId: product.supplierId
    });

    this.productDialogVisible = true;
  }

  openRestockDialog(
    product: Product
  ): void {

    this.restockingProduct.set(
      product
    );

    this.restockForm.reset({
      quantity: 1,
      reason: ''
    });

    this.restockDialogVisible = true;
  }

  openAdjustmentDialog(
    product: Product
  ): void {

    this.adjustingProduct.set(
      product
    );

    this.adjustmentForm.reset({
      actualQuantity:
        product.stockQuantity,

      reason: ''
    });

    this.adjustmentDialogVisible = true;
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
                'Le produit a été ajouté avec un stock initial de 0.'
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

          this.editingProduct.set(null);

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

  restockProduct(): void {

    if (this.restockForm.invalid) {
      this.restockForm.markAllAsTouched();
      return;
    }

    const product =
      this.restockingProduct();

    if (product === null) {
      return;
    }

    const formValue =
      this.restockForm.getRawValue();

    this.productService
      .restockProduct(
        product.id,
        formValue.quantity,
        formValue.reason
      )
      .subscribe({
        next: (updatedProduct) => {

          this.replaceProduct(
            updatedProduct
          );

          this.restockDialogVisible =
            false;

          this.restockingProduct.set(
            null
          );

          this.messageService.add({
            severity: 'success',
            summary:
              'Stock réapprovisionné',
            detail:
              `Le stock de "${updatedProduct.name}" a été augmenté de ${formValue.quantity}.`
          });
        },

        error: (error) => {
          this.showStockError(
            error,
            'Impossible de réapprovisionner le produit.'
          );
        }
      });
  }

  adjustStock(): void {

    if (this.adjustmentForm.invalid) {
      this.adjustmentForm.markAllAsTouched();
      return;
    }

    const product =
      this.adjustingProduct();

    if (product === null) {
      return;
    }

    const formValue =
      this.adjustmentForm.getRawValue();

    const difference =
      formValue.actualQuantity -
      product.stockQuantity;

    this.productService
      .adjustStock(
        product.id,
        formValue.actualQuantity,
        formValue.reason
      )
      .subscribe({
        next: (updatedProduct) => {

          this.replaceProduct(
            updatedProduct
          );

          this.adjustmentDialogVisible =
            false;

          this.adjustingProduct.set(
            null
          );

          const signedDifference =
            difference > 0
              ? `+${difference}`
              : `${difference}`;

          this.messageService.add({
            severity: 'success',
            summary: 'Stock ajusté',
            detail:
              `Le stock de "${updatedProduct.name}" a été ajusté de ${signedDifference}.`
          });
        },

        error: (error) => {
          this.showStockError(
            error,
            'Impossible d’ajuster le stock.'
          );
        }
      });
  }

  calculateAdjustmentDifference(): number {

    const product =
      this.adjustingProduct();

    if (product === null) {
      return 0;
    }

    return (
      this.adjustmentForm.controls
        .actualQuantity.value -
      product.stockQuantity
    );
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

  private replaceProduct(
    updatedProduct: Product
  ): void {

    this.products.update(
      products =>
        products.map(
          product =>
            product.id ===
            updatedProduct.id
              ? updatedProduct
              : product
        )
    );
  }

  private showStockError(
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

  private showSaveError(): void {

    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail:
        'Impossible d’enregistrer le produit.'
    });
  }
}