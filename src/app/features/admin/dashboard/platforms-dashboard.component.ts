import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { PlatformService } from '../../../core/services/platform.service';
import { AuthService } from '../../../core/services/auth.service';

interface PlatformAccess {
  platformId: number;
  platformName: string;
  description?: string;
  redirectUris?: string[];
  icon: string;
  color: string;
}

@Component({
  selector: 'app-platforms-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="platforms-layout">
      <mat-toolbar class="toolbar">
        <span class="app-name">Platform Access Portal</span>
        <span class="spacer"></span>
        
        @if (currentUser()) {
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            <span class="user-name">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
        }
        
        <mat-menu #userMenu="matMenu">
          <div class="user-info">
            <div class="user-name-menu">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</div>
            <div class="user-email">{{ currentUser()?.email }}</div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <div class="dashboard-content">
        @if (loading()) {
          <div class="loading">
            <mat-spinner></mat-spinner>
          </div>
        } @else {
          <div class="dashboard-container">
            <h1>Welcome, {{ currentUser()?.firstName }}!</h1>
            <p class="subtitle">Select a platform to access</p>

            <div class="platforms-grid">
              @for (platform of accessiblePlatforms(); track platform.platformId) {
                <mat-card class="platform-card" (click)="accessPlatform(platform)">
                  <mat-card-content>
                    <div class="platform-icon" [style.background]="platform.color">
                      <mat-icon>{{ platform.icon }}</mat-icon>
                    </div>
                    <div class="platform-info">
                      <div class="platform-name">{{ platform.platformName }}</div>
                      @if (platform.description) {
                        <div class="platform-description">{{ platform.description }}</div>
                      }
                    </div>
                    <div class="platform-arrow">
                      <mat-icon>arrow_forward</mat-icon>
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .platforms-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }

    .app-name {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.25px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-name {
      margin: 0 8px;
      font-weight: 500;
      color: #1e293b;
    }

    .user-info {
      padding: 16px;
      background-color: #f8fafc;
    }

    .user-name-menu {
      font-weight: 600;
      margin-bottom: 4px;
      color: #1e293b;
    }

    .user-email {
      font-size: 14px;
      color: #64748b;
    }

    mat-divider {
      margin: 8px 0;
      background-color: #e2e8f0;
    }

    .dashboard-content {
      flex: 1;
      overflow-y: auto;
      padding: 40px 20px;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 48px;
      font-weight: 700;
      margin: 0 0 16px 0;
      color: white;
      letter-spacing: -1px;
      text-align: center;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .subtitle {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.9);
      margin: 0 0 48px 0;
      font-weight: 400;
      text-align: center;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .platforms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      padding: 20px;
    }

    .platform-card {
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 2px solid transparent;
      background: white;
      position: relative;
      overflow: hidden;
      border-radius: 16px;
    }

    .platform-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    .platform-card:hover::before {
      transform: scaleX(1);
    }

    .platform-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .platform-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 32px !important;
      gap: 20px;
    }

    .platform-icon {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .platform-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: white;
    }

    .platform-info {
      flex: 1;
      min-width: 0;
    }

    .platform-name {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .platform-description {
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .platform-arrow {
      flex-shrink: 0;
      opacity: 0.4;
      transition: all 0.3s ease;
    }

    .platform-card:hover .platform-arrow {
      opacity: 1;
      transform: translateX(8px);
    }

    .platform-arrow mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #64748b;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 32px;
      }

      .subtitle {
        font-size: 16px;
        margin-bottom: 32px;
      }

      .platforms-grid {
        grid-template-columns: 1fr;
        padding: 0;
      }

      .dashboard-content {
        padding: 24px 16px;
      }
    }

    ::ng-deep .mat-mdc-menu-panel {
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  `]
})
export class PlatformsDashboardComponent implements OnInit {
  loading = signal(true);
  accessiblePlatforms = signal<PlatformAccess[]>([]);
  currentUser = computed(() => this.authService.getCurrentUser());

  private platformColors = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', 
    '#ef4444', '#06b6d4', '#ec4899', '#6366f1'
  ];

  private platformIcons = [
    'admin_panel_settings', 'analytics', 'store', 'school',
    'business', 'account_balance', 'shopping_cart', 'assessment'
  ];

  constructor(
    private userService: UserService,
    private platformService: PlatformService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccessiblePlatforms();
  }

  loadAccessiblePlatforms(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.loading.set(false);
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserPermissions(currentUser.userId).subscribe({
      next: (permissions) => {
        // Extract unique platforms from permissions
        const platformMap = new Map<number, PlatformAccess>();
        
        permissions.forEach((permission, index) => {
          if (!platformMap.has(permission.platformId)) {
            platformMap.set(permission.platformId, {
              platformId: permission.platformId,
              platformName: permission.platformName || 'Unknown Platform',
              description: `Access to ${permission.platformName || 'platform'}`,
              icon: this.platformIcons[index % this.platformIcons.length],
              color: this.platformColors[index % this.platformColors.length]
            });
          }
        });

        // Always include UMS platform with specific styling
        if (!platformMap.has(1)) {
          platformMap.set(1, {
            platformId: 1,
            platformName: 'User Management System',
            description: 'Manage users, roles, permissions and platforms',
            icon: 'admin_panel_settings',
            color: '#3b82f6'
          });
        } else {
          // Update UMS platform details if it exists
          const umsData = platformMap.get(1);
          if (umsData) {
            umsData.platformName = 'User Management System';
            umsData.description = 'Manage users, roles, permissions and platforms';
            umsData.icon = 'admin_panel_settings';
            umsData.color = '#3b82f6';
          }
        }

        this.accessiblePlatforms.set(Array.from(platformMap.values()));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading user permissions:', error);
        // If error, at least show UMS platform
        this.accessiblePlatforms.set([{
          platformId: 1,
          platformName: 'User Management System',
          description: 'Manage users, roles, permissions and platforms',
          icon: 'admin_panel_settings',
          color: '#3b82f6'
        }]);
        this.loading.set(false);
      }
    });
  }

  accessPlatform(platform: PlatformAccess): void {
    // Special handling for UMS (platformId 1)
    if (platform.platformId === 1) {
      // Navigate to UMS admin area
      this.router.navigate(['/admin/ums']);
      return;
    }

    // For other platforms, get the platform details and redirect
    this.platformService.getPlatformById(platform.platformId).subscribe({
      next: (platformDetails) => {
        if (platformDetails.redirectUris && platformDetails.redirectUris.length > 0) {
          // Use the first redirect URI
          const redirectUri = platformDetails.redirectUris[0];
          window.open(redirectUri, '_blank');
        } else {
          console.warn('No redirect URI configured for platform:', platformDetails.name);
        }
      },
      error: (error) => {
        console.error('Error accessing platform:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
