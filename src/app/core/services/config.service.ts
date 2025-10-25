import { Injectable } from '@angular/core';

export interface EndpointsConfig {
  baseUrl: string;
  auth: {
    token: string;
    userInfo: string;
    login: string;
    register: string;
    logout: string;
    refresh: string;
    revokeAll: string;
  };
  admin: {
    users: any;
    roles: any;
    permissions: any;
    platforms: any;
  };
}

export interface AppConfig {
  appName: string;
  version: string;
  oidc: {
    authority: string;
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
    postLogoutRedirectUri: string;
    silentRenewUrl: string;
    scope: string;
    responseType: string;
    autoUserInfo: boolean;
    silentRenew: boolean;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private endpoints: EndpointsConfig | null = null;
  private appConfig: AppConfig | null = null;

  async loadConfig(): Promise<void> {
    try {
      const [endpointsResponse, configResponse] = await Promise.all([
        fetch('/endpoints.json'),
        fetch('/config.json')
      ]);

      this.endpoints = await endpointsResponse.json();
      this.appConfig = await configResponse.json();
    } catch (error) {
      console.error('Failed to load configuration:', error);
      throw error;
    }
  }

  getEndpoints(): EndpointsConfig {
    if (!this.endpoints) {
      throw new Error('Endpoints not loaded. Call loadConfig() first.');
    }
    return this.endpoints;
  }

  getConfig(): AppConfig {
    if (!this.appConfig) {
      throw new Error('Config not loaded. Call loadConfig() first.');
    }
    return this.appConfig;
  }

  getBaseUrl(): string {
    return this.getEndpoints().baseUrl;
  }

  buildUrl(endpoint: string, params?: { [key: string]: string | number }): string {
    const baseUrl = this.getBaseUrl();
    let url = endpoint;

    if (params) {
      Object.keys(params).forEach(key => {
        url = url.replace(`{${key}}`, params[key].toString());
      });
    }

    return `${baseUrl}${url}`;
  }
}
