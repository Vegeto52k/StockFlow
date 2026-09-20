import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard',
  imports: [CardModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

  stats = [
    {
      label: 'Chiffre d’affaires',
      value: '24 580 €',
      icon: 'pi pi-euro',
      detail: '+12 % ce mois-ci'
    },
    {
      label: 'Commandes',
      value: '128',
      icon: 'pi pi-shopping-cart',
      detail: '18 en attente'
    },
    {
      label: 'Clients',
      value: '342',
      icon: 'pi pi-users',
      detail: '12 nouveaux ce mois-ci'
    },
    {
      label: 'Stock faible',
      value: '7',
      icon: 'pi pi-exclamation-triangle',
      detail: 'Produits à réapprovisionner'
    }
  ];

}
