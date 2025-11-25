import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { PlatformService } from '../../../core/services/platform.service';
import { Platform } from '../../../core/models/platform.model';

@Component({
  selector: 'app-register',
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
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>
            <h1>Create Account</h1>
          </mat-card-title>
          <mat-card-subtitle>Register to access the system</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="First name">
                <mat-icon matPrefix>person</mat-icon>
                @if (registerForm.get('firstName')?.hasError('required') && registerForm.get('firstName')?.touched) {
                  <mat-error>First name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" placeholder="Last name">
                <mat-icon matPrefix>person</mat-icon>
                @if (registerForm.get('lastName')?.hasError('required') && registerForm.get('lastName')?.touched) {
                  <mat-error>Last name is required</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="userName" placeholder="Choose a username">
              <mat-icon matPrefix>account_circle</mat-icon>
              @if (registerForm.get('userName')?.hasError('required') && registerForm.get('userName')?.touched) {
                <mat-error>Username is required</mat-error>
              }
              @if (registerForm.get('userName')?.hasError('minlength')) {
                <mat-error>Username must be at least 3 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter your email">
              <mat-icon matPrefix>email</mat-icon>
              @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email')) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input 
                matInput 
                [type]="hidePassword() ? 'password' : 'text'" 
                formControlName="password" 
                placeholder="Create a password">
              <mat-icon matPrefix>lock</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button" 
                (click)="hidePassword.set(!hidePassword())"
                [attr.aria-label]="'Hide password'">
                <mat-icon>{{hidePassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (registerForm.get('password')?.hasError('minlength')) {
                <mat-error>Password must be at least 8 characters</mat-error>
              }
              @if (registerForm.get('password')?.hasError('pattern')) {
                <mat-error>Password must contain uppercase, lowercase, number and special character</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input 
                matInput 
                [type]="hideConfirmPassword() ? 'password' : 'text'" 
                formControlName="confirmPassword" 
                placeholder="Confirm your password">
              <mat-icon matPrefix>lock</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button" 
                (click)="hideConfirmPassword.set(!hideConfirmPassword())"
                [attr.aria-label]="'Hide password'">
                <mat-icon>{{hideConfirmPassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if (registerForm.get('confirmPassword')?.hasError('required') && registerForm.get('confirmPassword')?.touched) {
                <mat-error>Please confirm your password</mat-error>
              }
              @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
                <mat-error>Passwords do not match</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Platforms</mat-label>
              <mat-select formControlName="platformIds" multiple>
                @for (platform of platforms(); track platform.platformId) {
                  <mat-option [value]="platform.platformId">{{ platform.name }}</mat-option>
                }
              </mat-select>
              <mat-icon matPrefix>business</mat-icon>
              @if (registerForm.get('platformIds')?.hasError('required') && registerForm.get('platformIds')?.touched) {
                <mat-error>At least one platform is required</mat-error>
              }
            </mat-form-field>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              class="full-width submit-button"
              [disabled]="loading() || registerForm.invalid">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Create Account
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <div class="footer-links">
            <p>Already have an account? <a routerLink="/login">Sign in here</a></p>
          </div>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .register-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
      pointer-events: none;
    }

    .register-card {
      width: 100%;
      max-width: 560px;
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
      color: #1e293b;
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

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .half-width {
      flex: 1;
      margin-bottom: 20px;
    }

    ::ng-deep .register-card .mat-mdc-form-field {
      font-size: 15px;
    }

    ::ng-deep .register-card .mat-mdc-text-field-wrapper {
      background-color: #f8fafc;
    }

    ::ng-deep .register-card .mat-mdc-form-field:hover .mat-mdc-text-field-wrapper {
      background-color: #f1f5f9;
    }

    ::ng-deep .register-card .mat-icon {
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

    ::ng-deep .register-card .mat-mdc-form-field-focus-overlay {
      background-color: transparent;
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  loading = signal(false);
  platforms = signal<Platform[]>([]);
  loadingPlatforms = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private platformService: PlatformService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]],
      platformIds: [[], [Validators.required]]
    }, { validators: this.passwordMatchValidator });
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

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading.set(true);
      const { confirmPassword, ...registerData } = this.registerForm.value;
      
      this.authService.register(registerData).subscribe({
        next: () => {
          this.loading.set(false);
          this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 3000 });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading.set(false);
          this.snackBar.open(error.error?.message || 'Registration failed. Please try again.', 'Close', { duration: 5000 });
        }
      });
    }
  }
}
