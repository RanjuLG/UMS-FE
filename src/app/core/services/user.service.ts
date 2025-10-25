import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { User, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {}

  getUsers(): Observable<User[]> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.users.list);
    return this.http.get<User[]>(url);
  }

  getUserById(id: number): Observable<User> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.users.getById, { id });
    return this.http.get<User>(url);
  }

  createUser(request: CreateUserRequest): Observable<User> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.users.create);
    return this.http.post<User>(url, request);
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<User> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.users.update, { id });
    return this.http.put<User>(url, request);
  }

  deleteUser(id: number): Observable<void> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.users.delete, { id });
    return this.http.delete<void>(url);
  }

  changePassword(id: number, request: ChangePasswordRequest): Observable<any> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.users.changePassword, { id });
    return this.http.put(url, request);
  }

  assignRole(userId: number, roleId: number): Observable<any> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.users.assignRole, { userId, roleId });
    return this.http.post(url, {});
  }

  removeRole(userId: number, roleId: number): Observable<void> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.users.removeRole, { userId, roleId });
    return this.http.delete<void>(url);
  }
}
