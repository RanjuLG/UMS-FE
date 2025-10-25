import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="admin-layout">
      <mat-toolbar class="toolbar">
        <button mat-icon-button (click)="toggleSidenav()">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="app-name">UMS Admin</span>
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
            <div class="user-name">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</div>
            <div class="user-email">{{ currentUser()?.email }}</div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav 
          [opened]="sidenavOpened()" 
          [mode]="sidenavMode()" 
          class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" class="back-link">
              <mat-icon matListItemIcon>arrow_back</mat-icon>
              <span matListItemTitle>Back to Platforms</span>
            </a>
            <mat-divider style="margin: 12px 0;"></mat-divider>
            <a mat-list-item routerLink="/admin/ums" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>UMS Dashboard</span>
            </a>
            <a mat-list-item routerLink="/admin/users" routerLinkActive="active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Users</span>
            </a>
            <a mat-list-item routerLink="/admin/roles" routerLinkActive="active">
              <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
              <span matListItemTitle>Roles</span>
            </a>
            <a mat-list-item routerLink="/admin/permissions" routerLinkActive="active">
              <mat-icon matListItemIcon>verified_user</mat-icon>
              <span matListItemTitle>Permissions</span>
            </a>
            <a mat-list-item routerLink="/admin/platforms" routerLinkActive="active">
              <mat-icon matListItemIcon>apps</mat-icon>
              <span matListItemTitle>Platforms</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f8fafc;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      background: white;
      color: #1e293b;
    }

    ::ng-deep .toolbar .mat-toolbar {
      background: white;
      color: #1e293b;
    }

    ::ng-deep .toolbar .mat-icon {
      color: #64748b;
    }

    ::ng-deep .toolbar button {
      color: #1e293b;
    }

    .app-name {
      font-size: 20px;
      font-weight: 700;
      margin-left: 16px;
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
    }

    .sidenav-container {
      flex: 1;
      background-color: #f8fafc;
    }

    .sidenav {
      width: 260px;
      box-shadow: 1px 0 3px 0 rgba(0, 0, 0, 0.05);
      background-color: white;
      border-right: 1px solid #e2e8f0;
    }

    .content {
      padding: 24px;
      background-color: #f8fafc;
    }

    ::ng-deep mat-nav-list {
      padding-top: 16px;
    }

    ::ng-deep mat-nav-list a {
      margin: 4px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
      height: 48px;
    }

    ::ng-deep mat-nav-list a .mat-icon {
      color: #64748b;
      transition: color 0.2s ease;
    }

    ::ng-deep mat-nav-list a.active {
      background-color: #f1f5f9;
      color: #3b82f6;
      font-weight: 600;
      border-left: 3px solid #3b82f6;
    }

    ::ng-deep mat-nav-list a.active .mat-icon {
      color: #3b82f6;
    }

    ::ng-deep mat-nav-list a:hover:not(.active) {
      background-color: #f1f5f9;
    }

    ::ng-deep mat-nav-list a:hover:not(.active) .mat-icon {
      color: #3b82f6;
    }

    ::ng-deep mat-nav-list a.back-link {
      color: #64748b;
      font-weight: 500;
      background-color: #f8fafc;
    }

    ::ng-deep mat-nav-list a.back-link:hover {
      background-color: #e2e8f0;
      color: #1e293b;
    }

    ::ng-deep mat-nav-list a.back-link .mat-icon {
      color: #64748b;
    }

    ::ng-deep mat-nav-list a.back-link:hover .mat-icon {
      color: #1e293b;
    }

    .user-info {
      padding: 16px;
      background-color: #f8fafc;
    }

    .user-info .user-name {
      font-weight: 600;
      margin-bottom: 4px;
      color: #1e293b;
    }

    .user-info .user-email {
      font-size: 14px;
      color: #64748b;
    }

    mat-divider {
      margin: 8px 0;
      background-color: #e2e8f0;
    }

    ::ng-deep .mat-mdc-menu-panel {
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    ::ng-deep .mat-mdc-menu-item {
      border-radius: 4px;
      margin: 4px 8px;
    }

    ::ng-deep .mat-mdc-menu-item:hover {
      background-color: #f1f5f9;
    }

    ::ng-deep .mat-mdc-menu-item .mat-icon {
      color: #64748b;
      margin-right: 12px;
    }
  `]
})
export class AdminLayoutComponent {
  sidenavOpened = signal(true);
  sidenavMode = computed(() => window.innerWidth > 768 ? 'side' : 'over');
  currentUser = computed(() => this.authService.getCurrentUser());

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSidenav(): void {
    this.sidenavOpened.set(!this.sidenavOpened());
  }

  logout(): void {
    this.authService.logout();
  }
}
