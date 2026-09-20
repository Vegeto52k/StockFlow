import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./pages/clients/clients').then((m) => m.Clients),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products').then((m) => m.Products),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/orders/orders').then((m) => m.Orders),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];