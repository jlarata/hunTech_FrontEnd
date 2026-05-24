import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion {
  menuItems = [
    { label: 'Cuenta', icon: 'person', ruta: 'cuenta' },
    { label: 'Privacidad', icon: 'lock', ruta: 'privacidad' },
    { label: 'Apariencia', icon: 'palette', ruta: 'apariencia' },
    { label: 'Seguridad', icon: 'shield', ruta: 'seguridad' },
  ];
}
