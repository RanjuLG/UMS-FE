export interface Permission {
  permissionId: number;
  name: string;
  description: string;
  resource: string;
  action: string;
  platformId: number;
  platformName?: string;
  isActive: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export interface CreatePermissionRequest {
  name: string;
  description: string;
  resource: string;
  action: string;
  platformId: number;
}

export interface UpdatePermissionRequest {
  name: string;
  description: string;
  resource: string;
  action: string;
  platformId: number;
  isActive: boolean;
}
