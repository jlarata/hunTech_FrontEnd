import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './componentes/navbar/navbar';
import { Users } from './servicios/users';
import { Auth } from './servicios/auth';
import { filter, Observable, skip, take, tap } from 'rxjs';
import { LoadingService } from './servicios/loading-service';
import { Spinner } from "./componentes/spinner/spinner";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Navbar,
    RouterOutlet,
    RouterModule,
    CommonModule,
    Spinner
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  title = 'hunTech';
  authService = inject(Auth);

  isAuth?: boolean | undefined;
  existUser: boolean | undefined;

  isDataLoaded: boolean = false;

  usuario: any;
  usuarioRol?: string;


  user: any;
  authUser?: boolean;
  roleUser?: boolean;

  constructor(
    private _loaderService: LoadingService,
    protected usersService: Users,
  ) { }


  ngOnInit(): void {
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
        this.loadUser();
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

  private loadUser(): void {
    // user$ ya tiene el objeto que guardamos enCognito y data de la db si hay
    this.usersService.user$.subscribe({
      next: async (data) => {
        this.user = data; //data de cognito  y DB
        this.endLoading(this.user.email);
      },
      error: (err) => console.error('Error al obtener usuario', err),
    });

    this.usersService.selectedRole$.subscribe({
      next: (data) => {
        this.user.rol = data; //data de cognito  y DB
      },
      error: (err) => console.error('Error al obtener el rol', err),
    });

  }

  private async endLoading(email: string) {
    //this._loaderService.showLoader()
    this.usersService.simpleGetUserData(email).subscribe({
      next: (res) => {
        this.usuario = res;
        this.usuarioRol = this.user.rol;
        
        //console.log("logeado", this.usuarioRol)
      },
      error: (error: string) => {
        console.log('404' + error)
        this.isDataLoaded = true;
      },
      complete: () => {

      //  this._loaderService.hideLoader()
      }
    });
  }

}


