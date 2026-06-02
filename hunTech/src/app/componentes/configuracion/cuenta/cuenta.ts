import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AccountOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-config-cuenta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuenta.html',
  styleUrls: ['./cuenta.css'],
})
export class Cuenta {
  accountOptions: AccountOption[] = [
    {
      id: 'delete-account',
      label: 'Eliminar cuenta',
      icon: 'delete',
      description: 'Elimina tu cuenta y todos tus datos de forma permanente.',
    },
    {
      id: 'pause-account',
      label: 'Pausar cuenta',
      icon: 'pause_circle',
      description: 'Pausa tu cuenta temporalmente. Podrás reactivarla cuando quieras.',
    },
  ];

  onOptionClick(optionId: string): void {
    console.log('Opción seleccionada:', optionId);
  }
}
