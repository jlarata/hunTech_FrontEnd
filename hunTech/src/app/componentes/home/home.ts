import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Users } from '../../servicios/users';
import { Observable } from 'rxjs';
import { User } from '@supabase/supabase-js';
import { AuthService } from '../../servicios/AuthService';


@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})

export class Home {

  /*   private _usersService = inject(Users);
    user: any;
    rol:any; */

  user$: Observable<User | null>;
  loading = false;

  /*    ngOnInit(): void {
       this.loadUser();
    } */

  constructor(private authService: AuthService) {
    // Assign the observable from the service
    this.user$ = this.authService.user$;
  }


  /* private loadUser(): void {
    // user$ ya tiene el objeto que guardamos enCognito y data de la db si hay
    this._usersService.user$.subscribe({
      next: (data) => {
        this.user = data;   //data de cognito  y DB      
      },
      error: (err) => console.error('Error al obtener usuario', err)
    });
  } */
}
