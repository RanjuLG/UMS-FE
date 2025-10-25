import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { forkJoin } from 'rxjs';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';
import { Role } from '../../../core/models/role.model';
import { Permission } from '../../../core/models/permission.model';

@Component({
  selector: 'app-role-permissions-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>Manage Permissions for {{ data.role.name }}</h2>
    <mat-dialog-content>
      @if (loading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <mat-list>
          @for (permission of permissions(); track permission.permissionId) {
            <mat-list-item>
              <mat-checkbox
                [checked]="isPermissionAssigned(permission.permissionId)"
                (change)="togglePermission(permission, $event.checked)"
                [disabled]="saving()">
                <div class="permission-info">
                  <div class="permission-header">
                    <span class="permission-name">{{ permission.name }}</span>
                    <mat-chip class="platform-chip">{{ permission.platformName }}</mat-chip>
                  </div>
                  <div class="permission-description">{{ permission.description }}</div>
                  <div class="permission-meta">
                    <span class="meta-item">Resource: {{ permission.resource }}</span>
                    <span class="meta-item">Action: {{ permission.action }}</span>
                  </div>
                </div>
              </mat-checkbox>
            </mat-list-item>
          }
        </mat-list>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 700px;
      max-height: 600px;
      padding: 20px 24px;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }

    mat-list-item {
      height: auto;
      padding: 16px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    mat-list-item:last-child {
      border-bottom: none;
    }

    .permission-info {
      margin-left: 8px;
      width: 100%;
    }

    .permission-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .permission-name {
      font-weight: 500;
      font-size: 16px;
      color: #333;
    }

    .platform-chip {
      font-size: 12px;
      min-height: 24px;
      padding: 4px 8px;
    }

    .permission-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .permission-meta {
      display: flex;
      gap: 16px;
    }

    .meta-item {
      font-size: 12px;
      color: #999;
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
    }
  `]
})
export class RolePermissionsDialogComponent implements OnInit {
  permissions = signal<Permission[]>([]);
  rolePermissionIds = signal<number[]>([]);
  loading = signal(true);
  saving = signal(false);

  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RolePermissionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { role: Role }
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      permissions: this.permissionService.getPermissions(),
      rolePermissions: this.roleService.getRolePermissions(this.data.role.roleId)
    }).subscribe({
      next: (result) => {
        this.permissions.set(result.permissions);
        this.rolePermissionIds.set(result.rolePermissions.map(p => p.permissionId));
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open('Failed to load permissions', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  isPermissionAssigned(permissionId: number): boolean {
    return this.rolePermissionIds().includes(permissionId);
  }

  togglePermission(permission: Permission, checked: boolean): void {
    this.saving.set(true);
    
    if (checked) {
      this.roleService.assignPermission(this.data.role.roleId, permission.permissionId).subscribe({
        next: () => {
          this.rolePermissionIds.update(ids => [...ids, permission.permissionId]);
          this.snackBar.open(`Permission "${permission.name}" assigned successfully`, 'Close', { duration: 2000 });
          this.saving.set(false);
        },
        error: (error) => {
          this.snackBar.open('Failed to assign permission', 'Close', { duration: 3000 });
          this.saving.set(false);
        }
      });
    } else {
      this.roleService.removePermission(this.data.role.roleId, permission.permissionId).subscribe({
        next: () => {
          this.rolePermissionIds.update(ids => ids.filter(id => id !== permission.permissionId));
          this.snackBar.open(`Permission "${permission.name}" removed successfully`, 'Close', { duration: 2000 });
          this.saving.set(false);
        },
        error: (error) => {
          this.snackBar.open('Failed to remove permission', 'Close', { duration: 3000 });
          this.saving.set(false);
        }
      });
    }
  }

  onClose(): void {
    this.dialogRef.close(true);
  }
}
