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
import { RoleService } from '../../../core/services/role.service';
import { PlatformService } from '../../../core/services/platform.service';
import { Role } from '../../../core/models/role.model';
import { Platform } from '../../../core/models/platform.model';

@Component({
  selector: 'app-role-dialog',
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
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add New Role' : 'Edit Role' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="roleForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter role name">
          @if (roleForm.get('name')?.hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Enter role description"></textarea>
          @if (roleForm.get('description')?.hasError('required')) {
            <mat-error>Description is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Platform</mat-label>
          <mat-select formControlName="platformId" [disabled]="data.mode === 'edit'">
            <mat-option value="">-- Select Platform --</mat-option>
            @for (platform of platforms(); track platform.platformId) {
              <mat-option [value]="platform.platformId">{{ platform.name }}</mat-option>
            }
          </mat-select>
          @if (roleForm.get('platformId')?.hasError('required')) {
            <mat-error>Platform is required</mat-error>
          }
        </mat-form-field>

        @if (data.mode === 'edit') {
          <p class="platform-warning">
            ⚠️ Platform cannot be changed after role creation
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
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="roleForm.invalid || saving()">
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
export class RoleDialogComponent implements OnInit {
  roleForm: FormGroup;
  saving = signal(false);
  platforms = signal<Platform[]>([]);
  loadingPlatforms = signal(true);

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private platformService: PlatformService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', role?: Role }
  ) {
    this.roleForm = this.createForm();
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
        name: ['', [Validators.required]],
        description: ['', [Validators.required]],
        platformId: ['', [Validators.required]]
      });
    } else {
      return this.fb.group({
        name: [this.data.role?.name, [Validators.required]],
        description: [this.data.role?.description, [Validators.required]],
        platformId: [this.data.role?.platformId, [Validators.required]],
        isActive: [this.data.role?.isActive ?? true]
      });
    }
  }

  onSave(): void {
    if (this.roleForm.valid) {
      this.saving.set(true);
      
      if (this.data.mode === 'create') {
        this.roleService.createRole(this.roleForm.value).subscribe({
          next: () => {
            this.snackBar.open('Role created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving.set(false);
            this.snackBar.open(error.error?.message || 'Failed to create role', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.roleService.updateRole(this.data.role!.roleId, this.roleForm.value).subscribe({
          next: () => {
            this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving.set(false);
            this.snackBar.open(error.error?.message || 'Failed to update role', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
