import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '../models/role.model';
import { Permission } from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {}

  getRoles(): Observable<Role[]> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.roles.list);
    return this.http.get<Role[]>(url);
  }

  getRoleById(id: number): Observable<Role> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.roles.getById, { id });
    return this.http.get<Role>(url);
  }

  createRole(request: CreateRoleRequest): Observable<Role> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.roles.create);
    return this.http.post<Role>(url, request);
  }

  updateRole(id: number, request: UpdateRoleRequest): Observable<Role> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.roles.update, { id });
    return this.http.put<Role>(url, request);
  }

  deleteRole(id: number): Observable<void> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.roles.delete, { id });
    return this.http.delete<void>(url);
  }

  getRolePermissions(roleId: number): Observable<Permission[]> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.roles.getPermissions, { roleId });
    return this.http.get<Permission[]>(url);
  }

  assignPermission(roleId: number, permissionId: number): Observable<any> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.roles.assignPermission, { roleId, permissionId });
    return this.http.post(url, {});
  }

  removePermission(roleId: number, permissionId: number): Observable<void> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.roles.removePermission, { roleId, permissionId });
    return this.http.delete<void>(url);
  }
}
