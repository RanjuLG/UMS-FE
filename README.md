# User Management System (UMS) - Frontend

A modern, comprehensive User Management System built with Angular 20 and Angular Material. This application provides a complete RBAC (Role-Based Access Control) system with OAuth platform management capabilities.

## 🚀 Features

### Authentication
- **User Login/Registration** with form validation
- **Cookie-based session management** with HTTP interceptor
- **Protected routes** with authentication guards
- **Password strength validation** and matching confirmation

### Admin Dashboard
- **Statistics Overview** - Real-time counts for users, roles, permissions, and platforms
- **Quick Action Cards** - Fast navigation to key management sections
- **Responsive Design** - Material Design with collapsible navigation

### User Management
- **CRUD Operations** - Create, Read, Update, Delete users
- **Role Assignment** - Assign/remove multiple roles per user
- **User Activation** - Toggle user active status
- **Advanced Table** - Sortable columns with action buttons
- **Role Display** - Material chips showing assigned roles

### Role Management
- **CRUD Operations** - Full role lifecycle management
- **Permission Assignment** - Assign/remove permissions from roles
- **Permission Preview** - View associated permissions with platform context
- **Hierarchical Display** - Material table with expandable permission details

### Permission Management
- **CRUD Operations** - Create and manage permissions
- **Platform Association** - Link permissions to OAuth platforms
- **Resource/Action Model** - Define permissions by resource and action type
- **Visual Indicators** - Material chips for platforms and actions

### Platform Management
- **OAuth/OIDC Configuration** - Manage OAuth platforms and clients
- **Dynamic Arrays** - Add/remove redirect URIs and scopes
- **Expansion Panels** - Collapsible sections for URIs and scopes
- **Complete Details** - Authority, client ID, secret, and configuration

## 🛠️ Tech Stack

- **Angular 20.3** - Latest framework with standalone components
- **Angular Material** - Material Design component library
- **TypeScript 5.9** - Strict type checking
- **RxJS 7.8** - Reactive programming
- **angular-auth-oidc-client** - OAuth/OIDC authentication
- **Cookie-based Auth** - Session management with HTTP interceptors

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI 20.3.7

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd UMS-FE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoints**
   
   Edit `public/endpoints.json`:
   ```json
   {
     "baseUrl": "http://localhost:5184",
     "endpoints": {
       "auth": {
         "login": "/api/Auth/login",
         "register": "/api/Auth/register",
         "changePassword": "/api/Auth/change-password"
       }
     }
   }
   ```

4. **Configure application settings**
   
   Edit `public/config.json` for OIDC and app settings:
   ```json
   {
     "oidc": {
       "authority": "https://your-identity-server.com",
       "clientId": "ums-client"
     },
     "app": {
       "name": "User Management System",
       "version": "1.0.0"
     }
   }
   ```

5. **Start development server**
   ```bash
   ng serve
   ```
   
   Navigate to `http://localhost:4200/`

## 🔧 Configuration

### Endpoints Configuration (`public/endpoints.json`)

The application uses a centralized endpoint configuration system. All API URLs are stored in `endpoints.json` with parameter placeholders:

```json
{
  "baseUrl": "http://localhost:5184",
  "endpoints": {
    "admin": {
      "users": {
        "getAll": "/api/Admin/users",
        "getById": "/api/Admin/users/{id}",
        "create": "/api/Admin/users",
        "update": "/api/Admin/users/{id}",
        "delete": "/api/Admin/users/{id}",
        "assignRole": "/api/Admin/users/{userId}/roles/{roleId}",
        "removeRole": "/api/Admin/users/{userId}/roles/{roleId}"
      }
    }
  }
}
```

The `ConfigService` automatically replaces `{id}`, `{userId}`, `{roleId}`, etc. with actual values.

### Application Configuration (`public/config.json`)

Contains OIDC settings, application metadata, and theme configuration:

```json
{
  "oidc": {
    "authority": "https://identity.example.com",
    "clientId": "ums-spa-client",
    "redirectUrl": "http://localhost:4200/callback",
    "postLogoutRedirectUri": "http://localhost:4200",
    "scope": "openid profile email ums_api",
    "responseType": "code",
    "silentRenew": true
  },
  "app": {
    "name": "User Management System",
    "version": "1.0.0",
    "description": "Comprehensive RBAC and OAuth Platform Management"
  },
  "theme": {
    "primaryColor": "#1976d2",
    "accentColor": "#ff4081"
  }
}
```

## 🏗️ Architecture

### Project Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── guards/              # Route guards
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/        # HTTP interceptors
│   │   │   └── auth.interceptor.ts
│   │   ├── models/              # Data models
│   │   │   ├── user.model.ts
│   │   │   ├── role.model.ts
│   │   │   ├── permission.model.ts
│   │   │   └── platform.model.ts
│   │   └── services/            # Core services
│   │       ├── config.service.ts
│   │       ├── auth.service.ts
│   │       ├── user.service.ts
│   │       ├── role.service.ts
│   │       ├── permission.service.ts
│   │       └── platform.service.ts
│   │
│   ├── features/                # Feature modules
│   │   ├── auth/                # Authentication
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── admin/               # Admin features
│   │       ├── layout/
│   │       ├── dashboard/
│   │       ├── users/
│   │       ├── roles/
│   │       ├── permissions/
│   │       └── platforms/
│   │
│   ├── app.config.ts            # App providers & initialization
│   ├── app.routes.ts            # Routing configuration
│   └── app.ts                   # Root component
│
└── public/
    ├── config.json              # Application configuration
    └── endpoints.json           # API endpoints
```

### Key Design Patterns

1. **Configuration Loading via APP_INITIALIZER**
   - Loads `endpoints.json` and `config.json` before app starts
   - Ensures configuration is available throughout the application

2. **Service Layer with ConfigService Integration**
   - All API services use `ConfigService.buildUrl()` for dynamic URL construction
   - Centralized endpoint management with parameter substitution

3. **Signal-based State Management**
   - Uses Angular signals for reactive state (user authentication, loading states)
   - Computed signals for derived state (responsive mode, statistics)

4. **Standalone Components**
   - Modern Angular 20 standalone component architecture
   - Direct imports without NgModule declarations

5. **Material Dialog Pattern**
   - Separate dialog components for CRUD operations
   - Data injection via MAT_DIALOG_DATA
   - Reusable across different entities

6. **HTTP Interceptor for Authentication**
   - Automatic `withCredentials: true` for cookie-based auth
   - Centralized request/response handling

## 🔐 Security

### Authentication Flow
1. User logs in via `/login` with email/password
2. Backend validates credentials and sets HTTP-only cookie
3. All subsequent requests include cookie via `withCredentials: true`
4. `AuthGuard` protects admin routes, redirects unauthenticated users

### Authorization
- **Role-Based Access Control (RBAC)** - Users assigned to roles
- **Permission-Based Actions** - Roles have specific permissions
- **Platform Scoping** - Permissions associated with OAuth platforms

### Best Practices Implemented
- Password strength validation (min 8 chars, uppercase, lowercase, number, special char)
- HTTP-only cookies for session tokens (configured server-side)
- Protected routes with canActivate guards
- Input validation on all forms
- CORS configuration via `withCredentials`

## 🎨 UI/UX Features

### Material Design Components
- **MatSidenav** - Responsive navigation drawer
- **MatTable** - Data tables with sorting and actions
- **MatDialog** - Modal dialogs for CRUD operations
- **MatCard** - Information and action cards
- **MatChip** - Tag-style displays for roles/permissions
- **MatExpansionPanel** - Collapsible content sections
- **MatSnackBar** - Toast notifications for user feedback

### Responsive Design
- Mobile-friendly navigation with hamburger menu
- Adaptive layouts using CSS Grid and Flexbox
- Material breakpoints for different screen sizes
- Touch-friendly buttons and controls

### Custom Styling
- Custom scrollbar design (webkit)
- Material theme overrides for consistent look
- Gradient backgrounds for statistics cards
- Smooth transitions and animations

## 📚 API Integration

### Default Credentials
For initial login, use these default credentials (configured in backend):
- **Email:** `admin@ums.com`
- **Password:** `Admin@123`

### API Endpoints Structure

All endpoints follow RESTful conventions:

**Authentication:**
- `POST /api/Auth/login` - User login
- `POST /api/Auth/register` - New user registration
- `POST /api/Auth/change-password` - Change user password

**Users:**
- `GET /api/Admin/users` - List all users
- `GET /api/Admin/users/{id}` - Get user by ID
- `POST /api/Admin/users` - Create user
- `PUT /api/Admin/users/{id}` - Update user
- `DELETE /api/Admin/users/{id}` - Delete user
- `POST /api/Admin/users/{userId}/roles/{roleId}` - Assign role
- `DELETE /api/Admin/users/{userId}/roles/{roleId}` - Remove role

**Roles, Permissions, Platforms** follow similar patterns.

## 🚀 Development

### Start Development Server
```bash
ng serve
```

### Build for Production
```bash
ng build --configuration production
```

### Run Tests
```bash
ng test
```

### Code Generation
```bash
ng generate component component-name
ng generate service service-name
```

## 📝 Usage Guide

### Creating a New User
1. Navigate to **Admin > Users**
2. Click **Add User** button
3. Fill in email, full name, and password
4. Toggle **Is Active** if needed
5. Click **Create**

### Assigning Roles to User
1. In the Users table, click **Manage Roles** for a user
2. Check/uncheck roles in the dialog
3. Changes are saved automatically

### Creating a New Role
1. Navigate to **Admin > Roles**
2. Click **Add Role** button
3. Enter role name and description
4. Click **Create**
5. Use **Manage Permissions** to assign permissions

### Adding an OAuth Platform
1. Navigate to **Admin > Platforms**
2. Click **Add Platform** button
3. Fill in platform details (name, authority, client ID/secret)
4. Add redirect URIs and allowed scopes
5. Click **Create**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Complete RBAC system
- OAuth platform management
- Material Design UI
- Cookie-based authentication
- Responsive design

---

Built with ❤️ using Angular 20 and Material Design
