import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { Platform, CreatePlatformRequest, UpdatePlatformRequest } from '../models/platform.model';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {}

  getPlatforms(): Observable<Platform[]> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.platforms.list);
    return this.http.get<Platform[]>(url);
  }

  getPlatformById(id: number): Observable<Platform> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.platforms.getById, { id });
    return this.http.get<Platform>(url);
  }

  getPlatformByClientId(clientId: string): Observable<Platform> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.platforms.getByClientId, { clientId });
    return this.http.get<Platform>(url);
  }

  createPlatform(request: CreatePlatformRequest): Observable<Platform> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.platforms.create);
    return this.http.post<Platform>(url, request);
  }

  updatePlatform(id: number, request: UpdatePlatformRequest): Observable<Platform> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.platforms.update, { id });
    return this.http.put<Platform>(url, request);
  }

  deletePlatform(id: number): Observable<void> {
    const url = this.config.buildUrl(this.config.getEndpoints().admin.platforms.delete, { id });
    return this.http.delete<void>(url);
  }
}
