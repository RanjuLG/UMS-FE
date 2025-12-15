import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER, inject, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { ConfigService } from './core/services/config.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

export function initializeAppConfig(configService: ConfigService) {
  return () => configService.loadConfig();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppConfig,
      deps: [ConfigService],
      multi: true
    },
    // Firebase is initialized after config is loaded via APP_INITIALIZER
    provideFirebaseApp(() => {
      const configService = inject(ConfigService);
      return initializeApp(configService.getFirebaseConfig());
    }),
    provideAuth(() => getAuth())
  ]
};
