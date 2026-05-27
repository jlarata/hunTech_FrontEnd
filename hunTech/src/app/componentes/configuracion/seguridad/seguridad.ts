import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SecurityOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-config-seguridad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seguridad.html',
  styleUrls: ['./seguridad.css'],
})
export class Seguridad {
  securityOptions: SecurityOption[] = [
    {
      id: 'devices',
      label: 'Ver dispositivos conectados',
      icon: 'devices',
      description: 'Revisa y gestiona los dispositivos conectados a tu cuenta.',
    },
    {
      id: 'change-password',
      label: 'Cambiar Contraseña',
      icon: 'lock',
      description: 'Actualiza tu contraseña para mantener tu cuenta segura.',
    },
  ];

  onOptionClick(optionId: string): void {
    console.log('Opción seleccionada:', optionId);
  }
}
