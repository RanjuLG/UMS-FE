import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PlatformService } from '../../../core/services/platform.service';

interface DashboardStats {
  users: number;
  roles: number;
  permissions: number;
  platforms: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <p class="subtitle">Welcome to the User Management System</p>

      @if (loading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <div class="stats-grid">
          <mat-card class="stat-card users" routerLink="/admin/users">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>people</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats().users }}</div>
                <div class="stat-label">Total Users</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card roles" routerLink="/admin/roles">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>admin_panel_settings</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats().roles }}</div>
                <div class="stat-label">Total Roles</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card permissions" routerLink="/admin/permissions">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>verified_user</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats().permissions }}</div>
                <div class="stat-label">Total Permissions</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card platforms" routerLink="/admin/platforms">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>apps</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats().platforms }}</div>
                <div class="stat-label">Total Platforms</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <mat-card class="action-card" routerLink="/admin/users">
              <mat-card-content>
                <mat-icon>person_add</mat-icon>
                <span>Add New User</span>
              </mat-card-content>
            </mat-card>
            <mat-card class="action-card" routerLink="/admin/roles">
              <mat-card-content>
                <mat-icon>add_circle</mat-icon>
                <span>Create Role</span>
              </mat-card-content>
            </mat-card>
            <mat-card class="action-card" routerLink="/admin/permissions">
              <mat-card-content>
                <mat-icon>security</mat-icon>
                <span>Manage Permissions</span>
              </mat-card-content>
            </mat-card>
            <mat-card class="action-card" routerLink="/admin/platforms">
              <mat-card-content>
                <mat-icon>add_box</mat-icon>
                <span>Add Platform</span>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      font-size: 32px;
      font-weight: 500;
      margin: 0 0 8px 0;
      color: #333;
    }

    .subtitle {
      font-size: 16px;
      color: #666;
      margin: 0 0 32px 0;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat-card {
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 24px !important;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .stat-card.users .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-card.roles .stat-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-card.permissions .stat-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-card.platforms .stat-icon {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 36px;
      font-weight: 600;
      color: #333;
      line-height: 1;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .quick-actions {
      margin-top: 40px;
    }

    .quick-actions h2 {
      font-size: 24px;
      font-weight: 500;
      margin: 0 0 24px 0;
      color: #333;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-card {
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      background-color: #f5f5f5;
    }

    .action-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px !important;
      text-align: center;
    }

    .action-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
      margin-bottom: 12px;
    }

    .action-card span {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  stats = signal<DashboardStats>({ users: 0, roles: 0, permissions: 0, platforms: 0 });

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private platformService: PlatformService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    forkJoin({
      users: this.userService.getUsers(),
      roles: this.roleService.getRoles(),
      permissions: this.permissionService.getPermissions(),
      platforms: this.platformService.getPlatforms()
    }).subscribe({
      next: (data) => {
        this.stats.set({
          users: data.users.length,
          roles: data.roles.length,
          permissions: data.permissions.length,
          platforms: data.platforms.length
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loading.set(false);
      }
    });
  }
}
