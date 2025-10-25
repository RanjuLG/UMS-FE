import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { ConfigService } from './config.service';
import { LoginRequest, RegisterRequest, User } from '../models/user.model';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated = signal(false);
  
  private tokenKey = 'access_token';
  private userKey = 'current_user';

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  /**
   * Login using OAuth token endpoint with password grant type
   */
  login(credentials: LoginRequest): Observable<TokenResponse> {
    const url = this.config.buildUrl(this.config.getEndpoints().auth.token);
    const appConfig = this.config.getConfig();
    
    // Create URL-encoded body as per OAuth spec
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', credentials.email);
    body.set('password', credentials.password);
    body.set('client_id', appConfig.oidc.clientId);
    body.set('client_secret', appConfig.oidc.clientSecret);
    body.set('scope', appConfig.oidc.scope);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<TokenResponse>(url, body.toString(), { headers }).pipe(
      tap(response => {
        if (response.access_token) {
          this.setToken(response.access_token);
          // Fetch user info after successful token retrieval
          this.getUserInfo().subscribe({
            next: (user) => {
              this.setUser(user);
            },
            error: (err) => {
              console.error('Failed to fetch user info:', err);
            }
          });
        }
      })
    );
  }

  /**
   * Get current user information from backend
   */
  getUserInfo(): Observable<User> {
    const url = this.config.buildUrl(this.config.getEndpoints().auth.userInfo);
    return this.http.get<User>(url);
  }

  register(request: RegisterRequest): Observable<User> {
    const url = this.config.buildUrl(this.config.getEndpoints().auth.register);
    return this.http.post<User>(url, request);
  }

  logout(): void {
    this.clearToken();
    this.clearUser();
    this.router.navigate(['/login']);
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Store JWT token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticated.set(true);
  }

  /**
   * Clear JWT token
   */
  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated.set(false);
  }

  /**
   * Check if user has valid token
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  private setUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private clearUser(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.userKey);
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson && this.hasToken()) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        console.error('Failed to parse user from storage:', error);
        this.clearUser();
        this.clearToken();
      }
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) ?? false;
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }
}
