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
    MatProgressSpinnerModule
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
              <input matInput type="email" formControlName="email" placeholder="Enter your email">
              <mat-icon matPrefix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input 
                matInput 
                [type]="hidePassword() ? 'password' : 'text'" 
                formControlName="password" 
                placeholder="Enter your password">
              <mat-icon matPrefix>lock</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button" 
                (click)="hidePassword.set(!hidePassword())"
                [attr.aria-label]="'Hide password'">
                <mat-icon>{{hidePassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              class="full-width submit-button"
              [disabled]="loading() || loginForm.invalid">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <div class="footer-links">
            <p>Don't have an account? <a routerLink="/register">Register here</a></p>
          </div>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
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
      background: 
        radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%);
      pointer-events: none;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 32px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
      background: white;
      position: relative;
      z-index: 1;
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
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-align: center;
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
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
    }

    .submit-button:hover:not(:disabled) {
      background-color: #2563eb;
      box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
      transform: translateY(-1px);
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
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = signal(true);
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response.success && response.accessToken) {
            this.snackBar.open(response.message || 'Login successful!', 'Close', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          } else {
            this.snackBar.open(response.message || 'Login failed - no token received', 'Close', { duration: 5000 });
          }
        },
        error: (error) => {
          this.loading.set(false);
          const message = error.error?.message || 'Login failed. Please check your credentials.';
          this.snackBar.open(message, 'Close', { duration: 5000 });
        }
      });
    }
  }
}
