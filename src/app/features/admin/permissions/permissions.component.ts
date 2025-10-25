import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { PermissionService } from '../../../core/services/permission.service';
import { Permission } from '../../../core/models/permission.model';
import { PermissionDialogComponent } from './permission-dialog.component';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  template: `
    <div class="permissions-container">
      <div class="header">
        <div>
          <h1>Permissions Management</h1>
          <p class="subtitle">Manage platform-specific permissions</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Add Permission
        </button>
      </div>

      @if (loading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <table mat-table [dataSource]="permissions()" class="permissions-table">
            <ng-container matColumnDef="permissionId">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let permission">{{ permission.permissionId }}</td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let permission">
                <strong>{{ permission.name }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let permission">{{ permission.description }}</td>
            </ng-container>

            <ng-container matColumnDef="resource">
              <th mat-header-cell *matHeaderCellDef>Resource</th>
              <td mat-cell *matCellDef="let permission">
                <mat-chip>{{ permission.resource }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let permission">
                <mat-chip>{{ permission.action }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="platform">
              <th mat-header-cell *matHeaderCellDef>Platform</th>
              <td mat-cell *matCellDef="let permission">
                <mat-chip color="accent">{{ permission.platformName }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="isActive">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let permission">
                <mat-chip [class.active]="permission.isActive" [class.inactive]="!permission.isActive">
                  {{ permission.isActive ? 'Active' : 'Inactive' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let permission">
                <button mat-icon-button color="primary" [matTooltip]="'Edit'" (click)="openEditDialog(permission)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" [matTooltip]="'Delete'" (click)="deletePermission(permission)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .permissions-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
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
      margin: 0;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    mat-card {
      overflow-x: auto;
    }

    .permissions-table {
      width: 100%;
      min-width: 1000px;
    }

    .permissions-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    .permissions-table td, .permissions-table th {
      padding: 16px;
    }

    mat-chip {
      font-size: 12px;
      min-height: 24px;
      padding: 4px 8px;
    }

    mat-chip.active {
      background-color: #4caf50 !important;
      color: white;
    }

    mat-chip.inactive {
      background-color: #f44336 !important;
      color: white;
    }
  `]
})
export class PermissionsComponent implements OnInit {
  permissions = signal<Permission[]>([]);
  loading = signal(true);
  displayedColumns = ['permissionId', 'name', 'description', 'resource', 'action', 'platform', 'isActive', 'actions'];

  constructor(
    private permissionService: PermissionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.loading.set(true);
    this.permissionService.getPermissions().subscribe({
      next: (permissions) => {
        this.permissions.set(permissions);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open('Failed to load permissions', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PermissionDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPermissions();
      }
    });
  }

  openEditDialog(permission: Permission): void {
    const dialogRef = this.dialog.open(PermissionDialogComponent, {
      width: '600px',
      data: { mode: 'edit', permission }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPermissions();
      }
    });
  }

  deletePermission(permission: Permission): void {
    if (confirm(`Are you sure you want to delete permission "${permission.name}"?`)) {
      this.permissionService.deletePermission(permission.permissionId).subscribe({
        next: () => {
          this.snackBar.open('Permission deleted successfully', 'Close', { duration: 3000 });
          this.loadPermissions();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete permission', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
