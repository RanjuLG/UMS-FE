export interface Role {
  roleId: number;
  name: string;
  description: string;
  isActive: boolean;
  platformId: number;
  platformName: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  platformId: number;
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
  isActive: boolean;
}
