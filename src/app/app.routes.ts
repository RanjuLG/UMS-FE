import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AdminLayoutComponent } from './features/admin/layout/admin-layout.component';
import { PlatformsDashboardComponent } from './features/admin/dashboard/platforms-dashboard.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { UsersComponent } from './features/admin/users/users.component';
import { RolesComponent } from './features/admin/roles/roles.component';
import { PermissionsComponent } from './features/admin/permissions/permissions.component';
import { PlatformsComponent } from './features/admin/platforms/platforms.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: PlatformsDashboardComponent, 
    canActivate: [authGuard] 
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'ums', pathMatch: 'full' },
      { path: 'ums', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'platforms', component: PlatformsComponent }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];

