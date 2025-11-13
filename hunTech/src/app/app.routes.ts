import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', loadComponent: () => import('./componentes/home/home').then((m) => m.Home) },
  {
    path: 'contratos',
    loadComponent: () => import('./componentes/contratos/contratos').then((m) => m.Contratos),
  },
  /* { path: 'contrato-detail', loadComponent: () => import('./componentes/contrato-detail/contrato-detail').then(m => m.ContratoDetail) }, */
  {
    path: 'profile',
    loadComponent: () =>
      import('./componentes/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'miproyecto',
    loadComponent: () => import('./componentes/miproyecto/miproyecto').then((m) => m.Miproyecto),
  },
  {
    path: 'formcreateproyect',
    loadComponent: () => import('./views/formcreateproyect/formcreateproyect').then((m) => m.Formcreateproyect)
  },
  {
    path: 'formcreateproyect/:email',
    loadComponent: () => import('./views/formcreateproyect/formcreateproyect').then((m) => m.Formcreateproyect)
  },
  {
    path: 'formcreatecontract',
    loadComponent: () => import('./views/formcreatecontract/formcreatecontract').then((m) => m.Formcreatecontract)
  },
  {
    path: 'formcreatecontract/:project_id',
    loadComponent: () => import('./views/formcreatecontract/formcreatecontract').then((m) => m.Formcreatecontract)
  },

  { path: '**', redirectTo: '' },
];
