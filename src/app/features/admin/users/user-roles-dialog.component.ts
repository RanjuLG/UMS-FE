import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { User } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.model';

@Component({
  selector: 'app-user-roles-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Manage Roles for {{ data.user.userName }}</h2>
    <mat-dialog-content>
      @if (loading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <div class="platform-info">
          <strong>Platform:</strong> {{ data.user.platformName }}
          <p class="info-text">Only roles from the same platform can be assigned</p>
        </div>
        <mat-list>
          @for (role of roles(); track role.roleId) {
            <mat-list-item>
              <mat-checkbox
                [checked]="isRoleAssigned(role.roleId)"
                (change)="toggleRole(role, $event.checked)"
                [disabled]="saving()">
                <div class="role-info">
                  <div class="role-name">{{ role.name }}</div>
                  <div class="role-description">{{ role.description }}</div>
                </div>
              </mat-checkbox>
            </mat-list-item>
          }
          @if (roles().length === 0) {
            <div class="no-roles">
              No roles available for this platform
            </div>
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
      min-width: 600px;
      max-height: 500px;
      padding: 20px 24px;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }

    .platform-info {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 16px;
      color: #15803d;
    }

    .info-text {
      font-size: 12px;
      margin: 4px 0 0 0;
      color: #16a34a;
    }

    .no-roles {
      text-align: center;
      padding: 32px;
      color: #666;
      font-style: italic;
    }

    mat-list-item {
      height: auto;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    mat-list-item:last-child {
      border-bottom: none;
    }

    .role-info {
      margin-left: 8px;
    }

    .role-name {
      font-weight: 500;
      font-size: 16px;
      color: #333;
    }

    .role-description {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }
  `]
})
export class UserRolesDialogComponent implements OnInit {
  roles = signal<Role[]>([]);
  userRoleIds = signal<number[]>([]);
  loading = signal(true);
  saving = signal(false);

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserRolesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      roles: this.roleService.getRoles(),
      userDetails: this.userService.getUserById(this.data.user.userId)
    }).subscribe({
      next: (result) => {
        // Filter roles to only show those from the same platform as the user
        const platformRoles = result.roles.filter(
          role => role.platformId === this.data.user.platformId
        );
        this.roles.set(platformRoles);
        
        // Map role names to role IDs
        const userRoleNames = result.userDetails.roles || [];
        const assignedRoleIds = platformRoles
          .filter(role => userRoleNames.includes(role.name))
          .map(role => role.roleId);
        this.userRoleIds.set(assignedRoleIds);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open('Failed to load roles', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  isRoleAssigned(roleId: number): boolean {
    return this.userRoleIds().includes(roleId);
  }

  toggleRole(role: Role, checked: boolean): void {
    this.saving.set(true);
    
    if (checked) {
      this.userService.assignRole(this.data.user.userId, role.roleId).subscribe({
        next: () => {
          this.userRoleIds.update(ids => [...ids, role.roleId]);
          this.snackBar.open(`Role "${role.name}" assigned successfully`, 'Close', { duration: 2000 });
          this.saving.set(false);
        },
        error: (error) => {
          this.snackBar.open('Failed to assign role', 'Close', { duration: 3000 });
          this.saving.set(false);
        }
      });
    } else {
      this.userService.removeRole(this.data.user.userId, role.roleId).subscribe({
        next: () => {
          this.userRoleIds.update(ids => ids.filter(id => id !== role.roleId));
          this.snackBar.open(`Role "${role.name}" removed successfully`, 'Close', { duration: 2000 });
          this.saving.set(false);
        },
        error: (error) => {
          this.snackBar.open('Failed to remove role', 'Close', { duration: 3000 });
          this.saving.set(false);
        }
      });
    }
  }

  onClose(): void {
    this.dialogRef.close(true);
  }
}
