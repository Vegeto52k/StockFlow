import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import { DatePipe } from '@angular/common';

import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { Product } from '../../models/product.model';
import { StockMovement } from '../../models/stock-movement.model';

import { ProductService } from '../../services/product';
import { StockMovementService } from '../../services/stock-movement';

@Component({
  selector: 'app-stock-movements',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    SelectModule,
    TableModule,
    ToastModule
  ],
  providers: [
    MessageService
  ],
  templateUrl: './stock-movements.html',
  styleUrl: './stock-movements.scss',
})
export class StockMovements implements OnInit {

  private readonly stockMovementService =
    inject(StockMovementService);

  private readonly productService =
    inject(ProductService);

  private readonly messageService =
    inject(MessageService);

  movements = signal<StockMovement[]>([]);

  products = signal<Product[]>([]);

  productFilter =
    new FormControl<number | null>(null);

  ngOnInit(): void {
    this.loadProducts();
    this.loadMovements();

    this.productFilter.valueChanges.subscribe(
      productId => {

        if (productId === null) {
          this.loadMovements();
          return;
        }

        this.loadMovementsByProduct(
          productId
        );
      }
    );
  }

  loadMovements(): void {

    this.stockMovementService
      .getStockMovements()
      .subscribe({
        next: (movements) => {
          this.movements.set(movements);
        },

        error: () => {
          this.showLoadError();
        }
      });
  }

  loadMovementsByProduct(
    productId: number
  ): void {

    this.stockMovementService
      .getStockMovementsByProduct(
        productId
      )
      .subscribe({
        next: (movements) => {
          this.movements.set(movements);
        },

        error: () => {
          this.showLoadError();
        }
      });
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

  getMovementLabel(
    type: string
  ): string {

    switch (type) {

      case 'Order':
        return 'Commande';

      case 'OrderCancellation':
        return 'Annulation';

      case 'Restock':
        return 'Réapprovisionnement';

      case 'Adjustment':
        return 'Ajustement';

      default:
        return type;
    }
  }

  isIncoming(
    movement: StockMovement
  ): boolean {

    return movement.quantityChange > 0;
  }

  private showLoadError(): void {

    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail:
        'Impossible de charger les mouvements de stock.'
    });
  }
}