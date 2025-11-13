import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { Users } from '../../servicios/users';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private _usersService = inject(Users);
  user: any;
  rol: any;
  menuActive = false;

  authService = inject(Auth);

  ngOnInit(): void {
    this.loadUser();
    console.log(this.user)
  }
  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  closeMenu() {
    this.menuActive = false;
  }

  private loadUser(): void {
    // user$ ya tiene el objeto que guardamos enCognito y data de la db si hay
    this._usersService.user$.subscribe({
      next: (data) => {
        this.user = data; //data de cognito  y DB
      },
      error: (err) => console.error('Error al obtener usuario', err),
    });

    this._usersService.selectedRole$.subscribe({
      next: (data) => {
        this.user.rol = data; //data de cognito  y DB
      },
      error: (err) => console.error('Error al obtener el rol', err),
    });

  }
}
