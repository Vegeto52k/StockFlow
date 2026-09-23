import { Component, inject, OnInit, signal } from '@angular/core';

import { CardModule } from 'primeng/card';

import { DashboardStats } from '../../models/dashboard-stats.model';
import { DashboardService } from '../../services/dashboard';

@Component({
  selector: 'app-dashboard',
  imports: [
    CardModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  private readonly dashboardService =
    inject(DashboardService);

  stats = signal<DashboardStats>({
    revenue: 0,
    orderCount: 0,
    clientCount: 0,
    lowStockProductCount: 0
  });

  loading = signal(true);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);

    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },

      error: (error) => {
        console.error(
          'Erreur lors du chargement du dashboard',
          error
        );

        this.loading.set(false);
      }
    });
  }
}