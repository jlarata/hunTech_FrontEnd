import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Navbar } from './componentes/navbar/navbar';
import { Users } from './servicios/users';
import { Auth } from './servicios/auth';
import { Observable, tap } from 'rxjs';

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

  isAuth?: boolean | undefined;
  existUser: boolean | undefined;
  isDataLoaded: boolean = false;

  ngOnInit(): void {
    this.isDataLoaded = false;
    this.loadData();
  }


  onRoleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.usersService.setSelectedRole(value);
  }

  private loadData(): void {

    this.authService.isAuthenticated$.subscribe({
      next: (data) => {
        this.isAuth = data
      },
      error: (err) => console.error('Error al obtener usuario', err)
    })

    this.usersService.isExistUser$
    .pipe(
      tap((data) => {
        if (data != false) {
        this.isDataLoaded = true
      } }
    )
    )
    .subscribe({
      next: (data) => {
        
        this.existUser = data
      },
      error: (err) => console.error('Error al obtener usuario', err)
    })
  }
}


