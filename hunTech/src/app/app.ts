import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; 

import { Navbar } from './componentes/navbar/navbar';
import { Users } from './servicios/users';
import { Auth } from './servicios/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Navbar,
    RouterOutlet, 
    RouterModule, 
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  title = 'hunTech';

  authService = inject(Auth);

  usersService = inject(Users);
  
  onRoleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.usersService.setSelectedRole(value);
  }
}


