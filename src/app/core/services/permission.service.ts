import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {}

  getPermissions(): Observable<Permission[]> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.permissions.list);
    return this.http.get<Permission[]>(url);
  }

  getPermissionById(id: number): Observable<Permission> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.permissions.getById, { id });
    return this.http.get<Permission>(url);
  }

  getPermissionsByPlatform(platformId: number): Observable<Permission[]> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.permissions.getByPlatform, { platformId });
    return this.http.get<Permission[]>(url);
  }

  createPermission(request: CreatePermissionRequest): Observable<Permission> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.permissions.create);
    return this.http.post<Permission>(url, request);
  }

  updatePermission(id: number, request: UpdatePermissionRequest): Observable<Permission> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.permissions.update, { id });
    return this.http.put<Permission>(url, request);
  }

  deletePermission(id: number): Observable<void> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.permissions.delete, { id });
    return this.http.delete<void>(url);
  }
}
