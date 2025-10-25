import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PermissionService } from '../../../core/services/permission.service';
import { PlatformService } from '../../../core/services/platform.service';
import { Permission } from '../../../core/models/permission.model';
import { Platform } from '../../../core/models/platform.model';

@Component({
  selector: 'app-permission-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add New Permission' : 'Edit Permission' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="permissionForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g., user.read">
          @if (permissionForm.get('name')?.hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2" placeholder="Enter permission description"></textarea>
          @if (permissionForm.get('description')?.hasError('required')) {
            <mat-error>Description is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Resource</mat-label>
          <input matInput formControlName="resource" placeholder="e.g., users, roles">
          @if (permissionForm.get('resource')?.hasError('required')) {
            <mat-error>Resource is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Action</mat-label>
          <input matInput formControlName="action" placeholder="e.g., read, write, delete">
          @if (permissionForm.get('action')?.hasError('required')) {
            <mat-error>Action is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Platform</mat-label>
          <mat-select formControlName="platformId">
            @for (platform of platforms(); track platform.platformId) {
              <mat-option [value]="platform.platformId">{{ platform.name }}</mat-option>
            }
          </mat-select>
          @if (permissionForm.get('platformId')?.hasError('required')) {
            <mat-error>Platform is required</mat-error>
          }
        </mat-form-field>

        @if (data.mode === 'edit') {
          <mat-slide-toggle formControlName="isActive">
            Active
          </mat-slide-toggle>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="saving()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="permissionForm.invalid || saving()">
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

    mat-spinner {
      display: inline-block;
      margin: 0 auto;
    }
  `]
})
export class PermissionDialogComponent implements OnInit {
  permissionForm: FormGroup;
  platforms = signal<Platform[]>([]);
  saving = signal(false);

  constructor(
    private fb: FormBuilder,
    private permissionService: PermissionService,
    private platformService: PlatformService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', permission?: Permission }
  ) {
    this.permissionForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadPlatforms();
  }

  loadPlatforms(): void {
    this.platformService.getPlatforms().subscribe({
      next: (platforms) => {
        this.platforms.set(platforms);
      },
      error: (error) => {
        this.snackBar.open('Failed to load platforms', 'Close', { duration: 3000 });
      }
    });
  }

  createForm(): FormGroup {
    if (this.data.mode === 'create') {
      return this.fb.group({
        name: ['', [Validators.required]],
        description: ['', [Validators.required]],
        resource: ['', [Validators.required]],
        action: ['', [Validators.required]],
        platformId: ['', [Validators.required]]
      });
    } else {
      return this.fb.group({
        name: [this.data.permission?.name, [Validators.required]],
        description: [this.data.permission?.description, [Validators.required]],
        resource: [this.data.permission?.resource, [Validators.required]],
        action: [this.data.permission?.action, [Validators.required]],
        platformId: [this.data.permission?.platformId, [Validators.required]],
        isActive: [this.data.permission?.isActive ?? true]
      });
    }
  }

  onSave(): void {
    if (this.permissionForm.valid) {
      this.saving.set(true);
      
      if (this.data.mode === 'create') {
        this.permissionService.createPermission(this.permissionForm.value).subscribe({
          next: () => {
            this.snackBar.open('Permission created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving.set(false);
            this.snackBar.open(error.error?.message || 'Failed to create permission', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.permissionService.updatePermission(this.data.permission!.permissionId, this.permissionForm.value).subscribe({
          next: () => {
            this.snackBar.open('Permission updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving.set(false);
            this.snackBar.open(error.error?.message || 'Failed to update permission', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
