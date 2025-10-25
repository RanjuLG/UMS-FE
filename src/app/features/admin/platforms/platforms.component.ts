import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { PlatformService } from '../../../core/services/platform.service';
import { Platform } from '../../../core/models/platform.model';
import { PlatformDialogComponent } from './platform-dialog.component';

@Component({
  selector: 'app-platforms',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatExpansionModule
  ],
  template: `
    <div class="platforms-container">
      <div class="header">
        <div>
          <h1>Platforms Management</h1>
          <p class="subtitle">Manage OAuth platforms and client applications</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Add Platform
        </button>
      </div>

      @if (loading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <div class="platforms-grid">
          @for (platform of platforms(); track platform.platformId) {
            <mat-card class="platform-card">
              <mat-card-header>
                <mat-card-title>{{ platform.name }}</mat-card-title>
                <mat-card-subtitle>{{ platform.clientId }}</mat-card-subtitle>
                <div class="actions">
                  <button mat-icon-button color="primary" [matTooltip]="'Edit'" (click)="openEditDialog(platform)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" [matTooltip]="'Delete'" (click)="deletePlatform(platform)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </mat-card-header>
              
              <mat-card-content>
                <p class="description">{{ platform.description }}</p>
                
                <div class="status-chip">
                  <mat-chip [class.active]="platform.isActive" [class.inactive]="!platform.isActive">
                    {{ platform.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </div>

                <mat-accordion>
                  <mat-expansion-panel>
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <mat-icon>link</mat-icon>
                        Redirect URIs ({{ platform.redirectUris.length }})
                      </mat-panel-title>
                    </mat-expansion-panel-header>
                    <div class="uris-list">
                      @for (uri of platform.redirectUris; track uri) {
                        <div class="uri-item">{{ uri }}</div>
                      }
                    </div>
                  </mat-expansion-panel>

                  <mat-expansion-panel>
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <mat-icon>logout</mat-icon>
                        Post Logout URIs ({{ platform.postLogoutRedirectUris.length }})
                      </mat-panel-title>
                    </mat-expansion-panel-header>
                    <div class="uris-list">
                      @for (uri of platform.postLogoutRedirectUris; track uri) {
                        <div class="uri-item">{{ uri }}</div>
                      }
                    </div>
                  </mat-expansion-panel>

                  <mat-expansion-panel>
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <mat-icon>security</mat-icon>
                        Allowed Scopes ({{ platform.allowedScopes.length }})
                      </mat-panel-title>
                    </mat-expansion-panel-header>
                    <div class="scopes-list">
                      @for (scope of platform.allowedScopes; track scope) {
                        <mat-chip>{{ scope }}</mat-chip>
                      }
                    </div>
                  </mat-expansion-panel>
                </mat-accordion>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .platforms-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    h1 {
      font-size: 32px;
      font-weight: 500;
      margin: 0 0 8px 0;
      color: #333;
    }

    .subtitle {
      font-size: 16px;
      color: #666;
      margin: 0;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .platforms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .platform-card {
      transition: all 0.3s ease;
    }

    .platform-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    mat-card-header {
      position: relative;
    }

    mat-card-header .actions {
      position: absolute;
      top: 0;
      right: 0;
    }

    mat-card-subtitle {
      font-family: monospace;
      font-size: 12px;
      margin-top: 4px;
    }

    .description {
      color: #666;
      margin: 16px 0;
      min-height: 40px;
    }

    .status-chip {
      margin-bottom: 16px;
    }

    mat-chip.active {
      background-color: #4caf50 !important;
      color: white;
    }

    mat-chip.inactive {
      background-color: #f44336 !important;
      color: white;
    }

    mat-expansion-panel {
      margin-bottom: 8px;
    }

    mat-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .uris-list {
      padding: 16px 0;
    }

    .uri-item {
      padding: 8px 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 8px;
      font-family: monospace;
      font-size: 13px;
      word-break: break-all;
    }

    .scopes-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 16px 0;
    }

    .scopes-list mat-chip {
      font-size: 12px;
    }
  `]
})
export class PlatformsComponent implements OnInit {
  platforms = signal<Platform[]>([]);
  loading = signal(true);

  constructor(
    private platformService: PlatformService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPlatforms();
  }

  loadPlatforms(): void {
    this.loading.set(true);
    this.platformService.getPlatforms().subscribe({
      next: (platforms) => {
        this.platforms.set(platforms);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open('Failed to load platforms', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PlatformDialogComponent, {
      width: '700px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPlatforms();
      }
    });
  }

  openEditDialog(platform: Platform): void {
    const dialogRef = this.dialog.open(PlatformDialogComponent, {
      width: '700px',
      data: { mode: 'edit', platform }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPlatforms();
      }
    });
  }

  deletePlatform(platform: Platform): void {
    if (confirm(`Are you sure you want to delete platform "${platform.name}"?`)) {
      this.platformService.deletePlatform(platform.platformId).subscribe({
        next: () => {
          this.snackBar.open('Platform deleted successfully', 'Close', { duration: 3000 });
          this.loadPlatforms();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete platform', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
