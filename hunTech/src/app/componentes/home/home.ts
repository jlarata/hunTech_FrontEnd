import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Users } from '../../servicios/users';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})

export class Home {

  private _usersService = inject(Users);
  user: any;
  rol:any;

   ngOnInit(): void {
     this.loadUser();
  }


  private loadUser(): void {
    // user$ ya tiene el objeto que guardamos enCognito y data de la db si hay
    this._usersService.user$.subscribe({
      next: (data) => {
        this.user = data;   //data de cognito  y DB      
      },
      error: (err) => console.error('Error al obtener usuario', err)
    });
  }
}
