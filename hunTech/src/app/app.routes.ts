import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';
import { authGuard } from './servicios/guards/authGuard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', loadComponent: () => import('./componentes/home/home').then((m) => m.Home) },
  {
    path: 'contratos',
    canActivate: [authGuard],
    loadComponent: () => import('./componentes/contratos/contratos').then((m) => m.Contratos),
  },
  /* { path: 'contrato-detail', loadComponent: () => import('./componentes/contrato-detail/contrato-detail').then(m => m.ContratoDetail) }, */
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./componentes/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'miproyecto',
    canActivate: [authGuard],
    loadComponent: () => import('./componentes/miproyecto/miproyecto').then((m) => m.Miproyecto),
  },
  {
    path: 'formcreateproyect',
    canActivate: [authGuard],
    loadComponent: () => import('./views/formcreateproyect/formcreateproyect').then((m) => m.Formcreateproyect)
  },
  {
    path: 'formcreateproyect/:email',
    canActivate: [authGuard],
    loadComponent: () => import('./views/formcreateproyect/formcreateproyect').then((m) => m.Formcreateproyect)
  },
  {
    path: 'formcreatecontract',
    canActivate: [authGuard],
    loadComponent: () => import('./views/formcreatecontract/formcreatecontract').then((m) => m.Formcreatecontract)
  },
  {
    path: 'formcreatecontract/:project_id',
    canActivate: [authGuard],
    loadComponent: () => import('./views/formcreatecontract/formcreatecontract').then((m) => m.Formcreatecontract)
  },
  { 
    path: 'profile/:email',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./componentes/profile/profile.component').then((m) => m.ProfileComponent)
  },
  { 
    path: 'dashboard',
    canActivate: [authGuard], 
    loadComponent: () =>
    import('./componentes/dashboard/dashboard').then((m) => m.Dashboard)
  },

  {
    path: 'whitelist-email',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./componentes/whitelist-email/whitelist-email').then((m) => m.WhitelistEmail),
  },

  { path: '**', redirectTo: '' },
];
