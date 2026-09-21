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

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-products',
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
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {

  private readonly productService = inject(ProductService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  products = signal<Product[]>([]);

  productDialogVisible = false;

  editedProductId: number | null = null;

  productForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),

    reference: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),

    category: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),

    unitPrice: new FormControl(0, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(0.01)
      ]
    }),

    stockQuantity: new FormControl(0, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(0)
      ]
    }),

    minimumStock: new FormControl(0, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(0)
      ]
    })
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les produits.'
        });
      }
    });
  }

  isLowStock(product: Product): boolean {
    return product.stockQuantity <= product.minimumStock;
  }

  openCreateProductDialog(): void {
    this.editedProductId = null;

    this.productForm.reset({
      name: '',
      reference: '',
      category: '',
      unitPrice: 0,
      stockQuantity: 0,
      minimumStock: 0
    });

    this.productDialogVisible = true;
  }

  openEditProductDialog(product: Product): void {
    this.editedProductId = product.id;

    this.productForm.setValue({
      name: product.name,
      reference: product.reference,
      category: product.category,
      unitPrice: product.unitPrice,
      stockQuantity: product.stockQuantity,
      minimumStock: product.minimumStock
    });

    this.productDialogVisible = true;
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const productData = this.productForm.getRawValue();

    if (this.editedProductId === null) {
      this.createProduct(productData);
      return;
    }

    this.updateProduct(
      this.editedProductId,
      productData
    );
  }

  createProduct(productData: Omit<Product, 'id'>): void {
    this.productService.createProduct(productData).subscribe({
      next: (createdProduct) => {
        this.products.update(products => [
          ...products,
          createdProduct
        ]);

        this.closeProductDialog();

        this.messageService.add({
          severity: 'success',
          summary: 'Produit créé',
          detail: `${createdProduct.name} a été ajouté.`
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de créer le produit.'
        });
      }
    });
  }

  updateProduct(
    id: number,
    productData: Omit<Product, 'id'>
  ): void {
    this.productService.updateProduct(id, productData).subscribe({
      next: (updatedProduct) => {
        this.products.update(products =>
          products.map(product =>
            product.id === updatedProduct.id
              ? updatedProduct
              : product
          )
        );

        this.closeProductDialog();

        this.messageService.add({
          severity: 'success',
          summary: 'Produit modifié',
          detail: `${updatedProduct.name} a été mis à jour.`
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de modifier le produit.'
        });
      }
    });
  }

  confirmDeleteProduct(product: Product): void {
    this.confirmationService.confirm({
      header: 'Supprimer le produit',
      message: `Voulez-vous vraiment supprimer ${product.name} ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',

      accept: () => {
        this.deleteProduct(product);
      }
    });
  }

  deleteProduct(product: Product): void {
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.products.update(products =>
          products.filter(
            existingProduct =>
              existingProduct.id !== product.id
          )
        );

        this.messageService.add({
          severity: 'success',
          summary: 'Produit supprimé',
          detail: `${product.name} a été supprimé.`
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer le produit.'
        });
      }
    });
  }

  closeProductDialog(): void {
    this.productDialogVisible = false;
    this.editedProductId = null;
  }
}