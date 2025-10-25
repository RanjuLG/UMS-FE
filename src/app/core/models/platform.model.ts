export interface Platform {
  platformId: number;
  name: string;
  clientId: string;
  clientSecret?: string;
  description: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  allowedScopes: string[];
  isActive: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export interface CreatePlatformRequest {
  name: string;
  description: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  allowedScopes: string[];
}

export interface UpdatePlatformRequest {
  name: string;
  description: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  allowedScopes: string[];
  isActive: boolean;
}
