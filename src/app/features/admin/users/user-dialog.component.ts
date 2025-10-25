import { Component, Inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../core/services/user.service';
import { PlatformService } from '../../../core/services/platform.service';
import { User } from '../../../core/models/user.model';
import { Platform } from '../../../core/models/platform.model';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add New User' : 'Edit User' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="userForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Username</mat-label>
          <input matInput formControlName="userName" placeholder="Enter username">
          @if (userForm.get('userName')?.hasError('required')) {
            <mat-error>Username is required</mat-error>
          }
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName" placeholder="First name">
            @if (userForm.get('firstName')?.hasError('required')) {
              <mat-error>First name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName" placeholder="Last name">
            @if (userForm.get('lastName')?.hasError('required')) {
              <mat-error>Last name is required</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" placeholder="Enter email">
          @if (userForm.get('email')?.hasError('required')) {
            <mat-error>Email is required</mat-error>
          }
          @if (userForm.get('email')?.hasError('email')) {
            <mat-error>Please enter a valid email</mat-error>
          }
        </mat-form-field>

        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" placeholder="Enter password">
            @if (userForm.get('password')?.hasError('required')) {
              <mat-error>Password is required</mat-error>
            }
            @if (userForm.get('password')?.hasError('minlength')) {
              <mat-error>Password must be at least 8 characters</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Platform</mat-label>
          <mat-select formControlName="platformId" [disabled]="data.mode === 'edit'">
            <mat-option value="">-- Select Platform --</mat-option>
            @for (platform of platforms(); track platform.platformId) {
              <mat-option [value]="platform.platformId">{{ platform.name }}</mat-option>
            }
          </mat-select>
          @if (userForm.get('platformId')?.hasError('required')) {
            <mat-error>Platform is required</mat-error>
          }
        </mat-form-field>

        @if (data.mode === 'edit') {
          <p class="platform-warning">
            ⚠️ Platform cannot be changed after user creation
          </p>
        }

        @if (data.mode === 'edit') {
          <mat-slide-toggle formControlName="isActive">
            Active
          </mat-slide-toggle>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="saving()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="userForm.invalid || saving()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ data.mode === 'create' ? 'Create' : 'Update' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 500px;
      padding: 20px 24px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
      margin-bottom: 16px;
    }

    mat-slide-toggle {
      margin-bottom: 16px;
    }

    .platform-warning {
      font-size: 12px;
      color: #ef6c00;
      margin: -8px 0 16px 0;
      font-style: italic;
    }

    mat-spinner {
      display: inline-block;
      margin: 0 auto;
    }
  `]
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  saving = signal(false);
  platforms = signal<Platform[]>([]);
  loadingPlatforms = signal(true);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private platformService: PlatformService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', user?: User }
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadPlatforms();
  }

  loadPlatforms(): void {
    this.platformService.getPlatforms().subscribe({
      next: (platforms) => {
        this.platforms.set(platforms);
        this.loadingPlatforms.set(false);
      },
      error: (error) => {
        this.snackBar.open('Failed to load platforms', 'Close', { duration: 3000 });
        this.loadingPlatforms.set(false);
      }
    });
  }

  createForm(): FormGroup {
    if (this.data.mode === 'create') {
      return this.fb.group({
        userName: ['', [Validators.required]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        platformId: ['', [Validators.required]]
      });
    } else {
      return this.fb.group({
        userName: [this.data.user?.userName, [Validators.required]],
        firstName: [this.data.user?.firstName, [Validators.required]],
        lastName: [this.data.user?.lastName, [Validators.required]],
        email: [this.data.user?.email, [Validators.required, Validators.email]],
        platformId: [this.data.user?.platformId, [Validators.required]],
        isActive: [this.data.user?.isActive ?? true]
      });
    }
  }

  onSave(): void {
    if (this.userForm.valid) {
      this.saving.set(true);
      
      if (this.data.mode === 'create') {
        this.userService.createUser(this.userForm.value).subscribe({
          next: () => {
            this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving.set(false);
            this.snackBar.open(error.error?.message || 'Failed to create user', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.userService.updateUser(this.data.user!.userId, this.userForm.value).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving.set(false);
            this.snackBar.open(error.error?.message || 'Failed to update user', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
