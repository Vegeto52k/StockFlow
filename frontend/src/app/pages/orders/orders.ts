import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { Client } from '../../models/client.model';
import {
  CreateOrderRequest,
  Order
} from '../../models/order.model';
import { Product } from '../../models/product.model';

import { ClientService } from '../../services/client';
import { OrderService } from '../../services/order';
import { ProductService } from '../../services/product';

type OrderItemForm = FormGroup<{
  productId: FormControl<number | null>;
  quantity: FormControl<number>;
}>;

@Component({
  selector: 'app-orders',
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    InputNumberModule,
    ReactiveFormsModule,
    ToastModule,
    DatePipe,
    DecimalPipe
  ],
  providers: [
    MessageService
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders implements OnInit {

  private readonly orderService = inject(OrderService);
  private readonly clientService = inject(ClientService);
  private readonly productService = inject(ProductService);
  private readonly messageService = inject(MessageService);

  orders = signal<Order[]>([]);
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);

  selectedOrder = signal<Order | null>(null);

  orderDialogVisible = false;
  orderDetailsVisible = false;

  orderForm = new FormGroup({
    clientId: new FormControl<number | null>(
      null,
      {
        validators: [Validators.required]
      }
    ),

    items: new FormArray<OrderItemForm>([])
  });

  get orderItems(): FormArray<OrderItemForm> {
    return this.orderForm.controls.items;
  }

  ngOnInit(): void {
    this.loadOrders();
    this.loadClients();
    this.loadProducts();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les commandes.'
        });
      }
    });
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

  createOrderItemForm(): OrderItemForm {
    return new FormGroup({
      productId: new FormControl<number | null>(
        null,
        {
          validators: [Validators.required]
        }
      ),

      quantity: new FormControl(
        1,
        {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.min(1)
          ]
        }
      )
    });
  }

  openCreateOrderDialog(): void {
    this.orderForm.controls.clientId.reset();

    this.orderItems.clear();

    this.addOrderItem();

    this.orderDialogVisible = true;
  }

  openOrderDetails(order: Order): void {
    this.selectedOrder.set(order);
    this.orderDetailsVisible = true;
  }

  closeOrderDetails(): void {
    this.orderDetailsVisible = false;
    this.selectedOrder.set(null);
  }

  addOrderItem(): void {
    this.orderItems.push(
      this.createOrderItemForm()
    );
  }

  removeOrderItem(index: number): void {
    if (this.orderItems.length <= 1) {
      return;
    }

    this.orderItems.removeAt(index);
  }

  calculateItemTotal(
    productId: number | null,
    quantity: number
  ): number {
    if (productId === null) {
      return 0;
    }

    const product = this.products().find(
      currentProduct =>
        currentProduct.id === productId
    );

    if (!product) {
      return 0;
    }

    return product.unitPrice * quantity;
  }

  calculateDraftTotal(): number {
    return this.orderItems.controls.reduce(
      (total, item) =>
        total +
        this.calculateItemTotal(
          item.controls.productId.value,
          item.controls.quantity.value
        ),
      0
    );
  }

  calculateOrderTotal(order: Order): number {
    return order.items.reduce(
      (total, item) =>
        total + item.unitPrice * item.quantity,
      0
    );
  }

  saveOrder(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.getRawValue();

    if (formValue.clientId === null) {
      return;
    }

    if (
      formValue.items.some(
        item => item.productId === null
      )
    ) {
      return;
    }

    const request: CreateOrderRequest = {
      clientId: formValue.clientId,

      items: formValue.items.map(item => ({
        productId: item.productId!,
        quantity: item.quantity
      }))
    };

    this.orderService.createOrder(request).subscribe({
      next: (createdOrder) => {
        this.orders.update(orders => [
          ...orders,
          createdOrder
        ]);

        this.orderDialogVisible = false;

        this.loadProducts();

        this.messageService.add({
          severity: 'success',
          summary: 'Commande créée',
          detail: `La commande #${createdOrder.id} a été enregistrée.`
        });
      },

      error: (error) => {
        const detail =
          typeof error.error === 'string'
            ? error.error
            : 'Impossible de créer la commande.';

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail
        });
      }
    });
  }

  updateOrderStatus(
    order: Order,
    status: 'Validated' | 'Cancelled'
  ): void {
    this.orderService
      .updateOrderStatus(order.id, status)
      .subscribe({
        next: (updatedOrder) => {
          this.orders.update(orders =>
            orders.map(currentOrder =>
              currentOrder.id === updatedOrder.id
                ? updatedOrder
                : currentOrder
            )
          );

          this.selectedOrder.set(updatedOrder);

          if (status === 'Cancelled') {
            this.loadProducts();
          }

          this.messageService.add({
            severity: 'success',
            summary:
              status === 'Validated'
                ? 'Commande validée'
                : 'Commande annulée',
            detail:
              status === 'Validated'
                ? `La commande #${updatedOrder.id} a été validée.`
                : `La commande #${updatedOrder.id} a été annulée et le stock a été restauré.`
          });
        },

        error: (error) => {
          const detail =
            typeof error.error === 'string'
              ? error.error
              : 'Impossible de modifier le statut de la commande.';

          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail
          });
        }
      });
  }

  closeOrderDialog(): void {
    this.orderDialogVisible = false;
  }
}