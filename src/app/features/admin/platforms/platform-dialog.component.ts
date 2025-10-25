import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlatformService } from '../../../core/services/platform.service';
import { Platform } from '../../../core/models/platform.model';

@Component({
  selector: 'app-platform-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add New Platform' : 'Edit Platform' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="platformForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter platform name">
          @if (platformForm.get('name')?.hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2" placeholder="Enter platform description"></textarea>
          @if (platformForm.get('description')?.hasError('required')) {
            <mat-error>Description is required</mat-error>
          }
        </mat-form-field>

        <div class="array-field">
          <label>Redirect URIs</label>
          <div formArrayName="redirectUris">
            @for (control of redirectUris.controls; track $index) {
              <div class="array-item">
                <mat-form-field appearance="outline" class="flex-1">
                  <input matInput [formControlName]="$index" placeholder="https://example.com/callback">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeRedirectUri($index)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>
          <button mat-stroked-button type="button" (click)="addRedirectUri()">
            <mat-icon>add</mat-icon>
            Add Redirect URI
          </button>
        </div>

        <div class="array-field">
          <label>Post Logout Redirect URIs</label>
          <div formArrayName="postLogoutRedirectUris">
            @for (control of postLogoutRedirectUris.controls; track $index) {
              <div class="array-item">
                <mat-form-field appearance="outline" class="flex-1">
                  <input matInput [formControlName]="$index" placeholder="https://example.com/logout">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removePostLogoutUri($index)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>
          <button mat-stroked-button type="button" (click)="addPostLogoutUri()">
            <mat-icon>add</mat-icon>
            Add Post Logout URI
          </button>
        </div>

        <div class="array-field">
          <label>Allowed Scopes</label>
          <div formArrayName="allowedScopes">
            @for (control of allowedScopes.controls; track $index) {
              <div class="array-item">
                <mat-form-field appearance="outline" class="flex-1">
                  <input matInput [formControlName]="$index" placeholder="openid, profile, email">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeScope($index)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>
          <button mat-stroked-button type="button" (click)="addScope()">
            <mat-icon>add</mat-icon>
            Add Scope
          </button>
        </div>

        @if (data.mode === 'edit') {
          <mat-slide-toggle formControlName="isActive">
            Active
          </mat-slide-toggle>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="saving()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="platformForm.invalid || saving()">
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
      min-width: 600px;
      max-height: 70vh;
      padding: 20px 24px;
      overflow-y: auto;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .array-field {
      margin-bottom: 24px;
    }

    .array-field label {
      display: block;
      font-weight: 500;
      margin-bottom: 12px;
      color: #333;
    }

    .array-item {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .flex-1 {
      flex: 1;
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
export class PlatformDialogComponent {
  platformForm: FormGroup;
  saving = signal(false);

  constructor(
    private fb: FormBuilder,
    private platformService: PlatformService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PlatformDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', platform?: Platform }
  ) {
    this.platformForm = this.createForm();
  }

  createForm(): FormGroup {
    if (this.data.mode === 'create') {
      return this.fb.group({
        name: ['', [Validators.required]],
        description: ['', [Validators.required]],
        redirectUris: this.fb.array([this.fb.control('')]),
        postLogoutRedirectUris: this.fb.array([this.fb.control('')]),
        allowedScopes: this.fb.array([
          this.fb.control('openid'),
          this.fb.control('profile'),
          this.fb.control('email')
        ])
      });
    } else {
      return this.fb.group({
        name: [this.data.platform?.name, [Validators.required]],
        description: [this.data.platform?.description, [Validators.required]],
        redirectUris: this.fb.array(
          this.data.platform?.redirectUris.map(uri => this.fb.control(uri)) || [this.fb.control('')]
        ),
        postLogoutRedirectUris: this.fb.array(
          this.data.platform?.postLogoutRedirectUris.map(uri => this.fb.control(uri)) || [this.fb.control('')]
        ),
        allowedScopes: this.fb.array(
          this.data.platform?.allowedScopes.map(scope => this.fb.control(scope)) || [this.fb.control('')]
        ),
        isActive: [this.data.platform?.isActive ?? true]
      });
    }
  }

  get redirectUris(): FormArray {
    return this.platformForm.get('redirectUris') as FormArray;
  }

  get postLogoutRedirectUris(): FormArray {
    return this.platformForm.get('postLogoutRedirectUris') as FormArray;
  }

  get allowedScopes(): FormArray {
    return this.platformForm.get('allowedScopes') as FormArray;
  }

  addRedirectUri(): void {
    this.redirectUris.push(this.fb.control(''));
  }

  removeRedirectUri(index: number): void {
    if (this.redirectUris.length > 1) {
      this.redirectUris.removeAt(index);
    }
  }

  addPostLogoutUri(): void {
    this.postLogoutRedirectUris.push(this.fb.control(''));
  }

  removePostLogoutUri(index: number): void {
    if (this.postLogoutRedirectUris.length > 1) {
      this.postLogoutRedirectUris.removeAt(index);
    }
  }

  addScope(): void {
    this.allowedScopes.push(this.fb.control(''));
  }

  removeScope(index: number): void {
    if (this.allowedScopes.length > 1) {
      this.allowedScopes.removeAt(index);
    }
  }

  onSave(): void {
    if (this.platformForm.valid) {
      this.saving.set(true);
      
      // Filter out empty values
      const formValue = { ...this.platformForm.value };
      formValue.redirectUris = formValue.redirectUris.filter((uri: string) => uri.trim());
      formValue.postLogoutRedirectUris = formValue.postLogoutRedirectUris.filter((uri: string) => uri.trim());
      formValue.allowedScopes = formValue.allowedScopes.filter((scope: string) => scope.trim());
      
      if (this.data.mode === 'create') {
        this.platformService.createPlatform(formValue).subscribe({
          next: () => {
            this.snackBar.open('Platform created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving.set(false);
            this.snackBar.open(error.error?.message || 'Failed to create platform', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.platformService.updatePlatform(this.data.platform!.platformId, formValue).subscribe({
          next: () => {
            this.snackBar.open('Platform updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving.set(false);
            this.snackBar.open(error.error?.message || 'Failed to update platform', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
