import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', loadComponent: () => import('./componentes/home/home').then(m => m.Home) },
  { path: 'profile', loadComponent: () => import('./componentes/profile/profile.component').then(m => m.ProfileComponent) },
  { path: '**', redirectTo:'' }
];
