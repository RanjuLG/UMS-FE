export interface User {
  userId: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  roles?: string[];
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  clientId?: string;
  clientSecret?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn: number;
  user?: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  clientId?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LogoutRequest {
  refreshToken?: string;
}

export interface RegisterRequest {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserRequest {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}
