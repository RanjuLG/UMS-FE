import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <h1>User Management System</h1>
          </mat-card-title>
          <mat-card-subtitle>Sign in to continue</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter your email" />
              <mat-icon matPrefix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched)
              {
              <mat-error>Email is required</mat-error>
              } @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
              <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="password"
                placeholder="Enter your password"
              />
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword.set(!hidePassword())"
                [attr.aria-label]="'Hide password'"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') &&
              loginForm.get('password')?.touched) {
              <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width submit-button"
              [disabled]="loading() || loginForm.invalid"
            >
              @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
              } @else { Sign In }
            </button>
          </form>

          <div class="divider-container">
            <mat-divider></mat-divider>
            <span class="divider-text">or</span>
            <mat-divider></mat-divider>
          </div>

          <button
            mat-stroked-button
            type="button"
            class="full-width google-button"
            (click)="loginWithGoogle()"
            [disabled]="loading() || googleLoading()"
          >
            @if (googleLoading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            }
          </button>
        </mat-card-content>

        <mat-card-footer>
          <div class="footer-links">
            <p>Don't have an account? <a routerLink="/register">Register here</a></p>
          </div>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        padding: 20px;
        position: relative;
        overflow: hidden;
      }

      .login-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
          circle at 20% 50%,
          rgba(59, 130, 246, 0.15) 0%,
          transparent 50%
        );
        pointer-events: none;
      }

      .login-card {
        width: 100%;
        max-width: 440px;
        padding: 32px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1);
        background: white;
        position: relative;
        z-index: 1;
        border: 1px solid rgba(226, 232, 240, 0.8);
      }

      mat-card-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 32px;
        padding: 0;
      }

      h1 {
        font-size: 28px;
        font-weight: 700;
        margin: 0;
        color: #3b82f6;
        text-align: center;
        letter-spacing: -0.5px;
      }

      mat-card-subtitle {
        margin-top: 8px;
        font-size: 15px;
        color: #64748b;
        font-weight: 400;
      }

      mat-card-content {
        padding: 0;
      }

      .full-width {
        width: 100%;
        margin-bottom: 20px;
      }

      ::ng-deep .login-card .mat-mdc-form-field {
        font-size: 15px;
      }

      ::ng-deep .login-card .mat-mdc-text-field-wrapper {
        background-color: #f8fafc;
      }

      ::ng-deep .login-card .mat-mdc-form-field:hover .mat-mdc-text-field-wrapper {
        background-color: #f1f5f9;
      }

      ::ng-deep .login-card .mat-icon {
        color: #64748b;
      }

      .submit-button {
        height: 48px;
        font-size: 15px;
        font-weight: 600;
        margin-top: 8px;
        background-color: #3b82f6;
        box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5), 0 2px 4px -1px rgba(59, 130, 246, 0.3);
        transition: all 0.3s ease;
        letter-spacing: 0.5px;
      }

      .submit-button:hover:not(:disabled) {
        background-color: #2563eb;
        box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.6), 0 4px 6px -2px rgba(59, 130, 246, 0.4);
        transform: translateY(-2px);
      }

      .submit-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      mat-card-footer {
        padding: 24px 0 0 0;
        border-top: 1px solid #e2e8f0;
        margin-top: 24px;
      }

      .footer-links {
        text-align: center;
      }

      .footer-links p {
        margin: 0;
        color: #64748b;
        font-size: 14px;
      }

      .footer-links a {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s ease;
      }

      .footer-links a:hover {
        color: #2563eb;
        text-decoration: underline;
      }

      mat-spinner {
        margin: 0 auto;
      }

      ::ng-deep .login-card .mat-mdc-form-field-focus-overlay {
        background-color: transparent;
      }

      .divider-container {
        display: flex;
        align-items: center;
        margin: 24px 0;
        gap: 16px;
      }

      .divider-container mat-divider {
        flex: 1;
      }

      .divider-text {
        color: #64748b;
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .google-button {
        height: 48px;
        font-size: 15px;
        font-weight: 500;
        border: 2px solid #e2e8f0;
        background-color: white;
        color: #334155;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        transition: all 0.3s ease;
      }

      .google-button:hover:not(:disabled) {
        background-color: #f8fafc;
        border-color: #cbd5e1;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .google-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .google-icon {
        flex-shrink: 0;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = signal(true);
  loading = signal(false);
  googleLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  loginWithGoogle(): void {
    this.googleLoading.set(true);
    this.authService.loginWithGoogle().subscribe({
      next: (response) => {
        this.googleLoading.set(false);
        if (response.success && response.accessToken) {
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        } else {
          this.snackBar.open(response.message || 'Google login failed', 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        this.googleLoading.set(false);
        const message = error.error?.message || 'Google login failed. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response.success && response.accessToken) {
            this.snackBar.open(response.message || 'Login successful!', 'Close', {
              duration: 3000,
            });
            this.router.navigate(['/dashboard']);
          } else {
            this.snackBar.open(response.message || 'Login failed - no token received', 'Close', {
              duration: 5000,
            });
          }
        },
        error: (error) => {
          this.loading.set(false);
          const message = error.error?.message || 'Login failed. Please check your credentials.';
          this.snackBar.open(message, 'Close', { duration: 5000 });
        },
      });
    }
  }
}
