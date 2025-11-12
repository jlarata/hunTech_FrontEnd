import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth } from 'angular-auth-oidc-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    //cognito credenciales---cambiar a un .env
    provideAuth({
      config: {
        authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_wgGrEInFW',
        clientId: 'j43do4joohlecc0dpm6af9in1',
        scope: 'email openid profile',
        responseType: 'code',
        redirectUrl: window.location.origin
      },
    }),
  ]
};
