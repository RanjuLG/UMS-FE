import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
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
    MatMenuModule
  ],
  template: `
    <div class="admin-layout">
      <mat-toolbar color="primary" class="toolbar">
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
            <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
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
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .app-name {
      font-size: 20px;
      font-weight: 500;
      margin-left: 16px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-name {
      margin: 0 8px;
    }

    .sidenav-container {
      flex: 1;
    }

    .sidenav {
      width: 250px;
      box-shadow: 2px 0 4px rgba(0,0,0,0.1);
    }

    .content {
      padding: 24px;
      background-color: #f5f5f5;
    }

    mat-nav-list a {
      margin: 4px 8px;
      border-radius: 4px;
    }

    mat-nav-list a.active {
      background-color: rgba(63, 81, 181, 0.1);
      color: #3f51b5;
    }

    mat-nav-list a:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .user-info {
      padding: 16px;
    }

    .user-info .user-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .user-info .user-email {
      font-size: 14px;
      color: #666;
    }

    mat-divider {
      margin: 8px 0;
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
