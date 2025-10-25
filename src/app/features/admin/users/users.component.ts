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
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { UserDialogComponent } from './user-dialog.component';
import { UserRolesDialogComponent } from './user-roles-dialog.component';

@Component({
  selector: 'app-users',
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
    <div class="users-container">
      <div class="header">
        <div>
          <h1>Users Management</h1>
          <p class="subtitle">Manage system users and their roles</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Add User
        </button>
      </div>

      @if (loading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <table mat-table [dataSource]="users()" class="users-table">
            <ng-container matColumnDef="userId">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let user">{{ user.userId }}</td>
            </ng-container>

            <ng-container matColumnDef="userName">
              <th mat-header-cell *matHeaderCellDef>Username</th>
              <td mat-cell *matCellDef="let user">{{ user.userName }}</td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let user">{{ user.firstName }} {{ user.lastName }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>

            <ng-container matColumnDef="platform">
              <th mat-header-cell *matHeaderCellDef>Platform</th>
              <td mat-cell *matCellDef="let user">
                <mat-chip class="platform-chip">{{ user.platformName }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="roles">
              <th mat-header-cell *matHeaderCellDef>Roles</th>
              <td mat-cell *matCellDef="let user">
                <div class="roles-chips">
                  @for (role of user.roles; track role) {
                    <mat-chip>{{ role }}</mat-chip>
                  }
                  @if (!user.roles || user.roles.length === 0) {
                    <span class="no-roles">No roles assigned</span>
                  }
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="isActive">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">
                <mat-chip [class.active]="user.isActive" [class.inactive]="!user.isActive">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [matTooltip]="'Manage Roles'" (click)="openRolesDialog(user)">
                  <mat-icon>admin_panel_settings</mat-icon>
                </button>
                <button mat-icon-button color="primary" [matTooltip]="'Edit'" (click)="openEditDialog(user)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" [matTooltip]="'Delete'" (click)="deleteUser(user)">
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
    .users-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    h1 {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #1e293b;
      letter-spacing: -0.5px;
    }

    .subtitle {
      font-size: 16px;
      color: #64748b;
      margin: 0;
      font-weight: 400;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    mat-card {
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    .users-table {
      width: 100%;
      background: white;
    }

    ::ng-deep .users-table th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #1e293b;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }

    ::ng-deep .users-table td {
      color: #475569;
      font-size: 14px;
    }

    ::ng-deep .users-table td, 
    ::ng-deep .users-table th {
      padding: 16px;
    }

    ::ng-deep .users-table tr:hover {
      background-color: #f8fafc;
    }

    .roles-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    ::ng-deep .roles-chips mat-chip {
      font-size: 12px;
      min-height: 28px;
      padding: 4px 12px;
      background-color: #eff6ff;
      color: #3b82f6;
      font-weight: 500;
      border: 1px solid #bfdbfe;
    }

    ::ng-deep mat-chip.platform-chip {
      font-size: 12px;
      min-height: 28px;
      padding: 4px 12px;
      background-color: #f0fdf4;
      color: #16a34a;
      font-weight: 500;
      border: 1px solid #bbf7d0;
    }

    .no-roles {
      font-size: 13px;
      color: #94a3b8;
      font-style: italic;
    }

    ::ng-deep mat-chip.active {
      background-color: #10b981 !important;
      color: white !important;
      border: none;
      font-weight: 600;
    }

    ::ng-deep mat-chip.inactive {
      background-color: #ef4444 !important;
      color: white !important;
      border: none;
      font-weight: 600;
    }

    ::ng-deep .mat-mdc-icon-button {
      transition: all 0.2s ease;
    }

    ::ng-deep .mat-mdc-icon-button:hover {
      background-color: #f1f5f9;
      transform: scale(1.1);
    }

    ::ng-deep .mat-mdc-icon-button .mat-icon {
      color: #64748b;
    }

    ::ng-deep .mat-mdc-icon-button.mat-primary .mat-icon {
      color: #3b82f6;
    }

    ::ng-deep .mat-mdc-icon-button.mat-warn .mat-icon {
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: stretch;
      }

      ::ng-deep .users-table {
        font-size: 12px;
      }

      ::ng-deep .users-table td, 
      ::ng-deep .users-table th {
        padding: 12px 8px;
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);
  displayedColumns = ['userId', 'userName', 'name', 'email', 'platform', 'roles', 'isActive', 'actions'];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { mode: 'edit', user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  openRolesDialog(user: User): void {
    const dialogRef = this.dialog.open(UserRolesDialogComponent, {
      width: '700px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.userName}"?`)) {
      this.userService.deleteUser(user.userId).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
