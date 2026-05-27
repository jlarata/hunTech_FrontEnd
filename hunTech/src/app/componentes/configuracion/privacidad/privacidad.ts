import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PrivacyOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-config-privacidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacidad.html',
  styleUrls: ['./privacidad.css'],
})
export class Privacidad {
  privacyOptions: PrivacyOption[] = [
    {
      id: 'hide-email',
      label: 'Ocultar Email',
      icon: 'email',
      description: 'Tu dirección de correo no será visible para otros usuarios.',
      enabled: false,
    },
    {
      id: 'allow-cv-download',
      label: 'Permitir que las empresas descarguen mi CV',
      icon: 'download',
      description: 'Las empresas podrán descargar y guardar tu CV.',
      enabled: false,
    },
    {
      id: 'show-ifts-average',
      label: 'Mostrar mi promedio del IFTS',
      icon: 'grade',
      description: 'El promedio académico será visible en tu perfil.',
      enabled: false,
    },
  ];

  toggleOption(optionId: string): void {
    const option = this.privacyOptions.find((opt) => opt.id === optionId);
    if (option) {
      option.enabled = !option.enabled;
    }
  }
}
