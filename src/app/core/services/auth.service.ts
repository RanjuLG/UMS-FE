import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { ConfigService } from './config.service';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
  RefreshTokenRequest, 
  TokenResponse, 
  LogoutRequest 
} from '../models/user.model';

interface PlatformInToken {
  platformId: number;
  name: string;
  clientId: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
}

interface DecodedToken {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  username: string;
  name: string;
  jti: string;
  platforms?: string;  // JSON string containing PlatformInToken[]
  role: string;
  exp: number;
  iss: string;
  aud: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated = signal(false);
  
  private accessTokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';
  private userKey = 'user';

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  /**
   * Login using new manual JWT authentication
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = this.config.buildUrl(this.config.getEndpoints().auth.login);
    
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap(response => {
        if (response.success && response.accessToken) {
          this.setToken(response.accessToken);
          if (response.refreshToken) {
            this.setRefreshToken(response.refreshToken);
          }
          if (response.user) {
            this.setUser(response.user);
          }
        }
      })
    );
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(refreshToken: string, clientId?: string): Observable<TokenResponse> {
    const url = this.config.buildUrl(this.config.getEndpoints().auth.refresh);
    const request: RefreshTokenRequest = { refreshToken, clientId };
    
    return this.http.post<TokenResponse>(url, request).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<User> {
    const url = this.config.buildUrl(this.config.getEndpoints().auth.register);
    return this.http.post<User>(url, request);
  }

  /**
   * Logout and revoke tokens
   */
  logout(): void {
    const url = this.config.buildUrl(this.config.getEndpoints().auth.logout);
    const refreshToken = this.getRefreshToken();
    const logoutRequest: LogoutRequest = { refreshToken: refreshToken || undefined };
    
    // Try to call logout endpoint, but proceed with local cleanup regardless
    this.http.post(url, logoutRequest).subscribe({
      next: () => {
        this.clearAuthData();
      },
      error: (err) => {
        console.error('Logout API call failed:', err);
        this.clearAuthData();
      }
    });
  }

  /**
   * Revoke all tokens (logout from all devices)
   */
  revokeAllTokens(): Observable<void> {
    const url = this.config.buildUrl(this.config.getEndpoints().auth.revokeAll);
    return this.http.post<void>(url, {}).pipe(
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Store access token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.accessTokenKey, token);
    this.isAuthenticated.set(true);
  }

  /**
   * Store refresh token
   */
  private setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.clearUser();
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Check if user has valid token
   */
  hasToken(): boolean {
    return !!this.getAccessToken();
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
        this.clearAuthData();
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

  /**
   * Decode JWT token and extract platform information
   */
  getPlatformsFromToken(): PlatformInToken[] {
    const token = this.getAccessToken();
    if (!token) {
      return [];
    }

    try {
      // JWT tokens are in format: header.payload.signature
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      const decoded = decodedPayload as DecodedToken;
      
      if (decoded.platforms) {
        return JSON.parse(decoded.platforms);
      }
      return [];
    } catch (error) {
      console.error('Failed to decode token platforms:', error);
      return [];
    }
  }

  /**
   * Get user info from decoded token
   */
  getTokenInfo(): DecodedToken | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload as DecodedToken;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
}
