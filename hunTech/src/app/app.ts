import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './componentes/navbar/navbar';
import { Users } from './servicios/users';
import { distinctUntilChanged, filter, lastValueFrom, Observable, skip, Subscription, take, tap } from 'rxjs';
import { LoadingService } from './servicios/loading-service';
import { Spinner } from "./componentes/spinner/spinner";
import { User } from '@supabase/supabase-js';
import { AuthService } from './servicios/AuthService';
import { FormsModule } from '@angular/forms';
import { Usuario } from './models/users/usuario';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Navbar,
    RouterOutlet,
    RouterModule,
    CommonModule,
    Spinner,
    FormsModule,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  user$: Observable<User | null>;
  userEmail: string | null = null;
  private authSub?: Subscription;
  selectedRole: string = ''; // Almacena la opción del select
  usuarioRol: string = ''; //almacenaremos aquí la opción que llega de la bbdd

  login_email = '';
  login_password = '';
  signup_email = '';
  signup_password = '';
  loading = false;
  confirmationSent = false;

  title = 'hunTech';

  /* isAuth?: boolean | undefined;
  existUser: boolean | undefined;
  */

/*   isDataLoaded: boolean = false;
 */
/*   usuario: Usuario = {
    id: '',
    email: '',
    descripcion: '',
    nombre: '',
    name: '',
    apellido: ''
  }; */
   

  /* user: any;
  authUser?: boolean;
  roleUser?: boolean; */

  constructor(
    /* private _loaderService: LoadingService, */
    protected usersService: Users,
    private router: Router,
    private authService: AuthService
  ) {
    // Assign the observable from the service
    this.user$ = this.authService.user$;

  }




  /* true cuando estoy en /profile/:email */
  get esSoloPerfil(): boolean {
    return this.router.url.startsWith('/profile/');
  }

  async ngOnInit() {
    this.userEmail = this.authService.getCurrentUser()?.email || '';
    await this.inicializarDatos()
  }

  async inicializarDatos() {
    //Suscripto al servicio de authservice: si está logueado, va a buscar el mail de logueo
    this.authSub = this.authService.userEmail$.pipe(
      // el pipe, la función distinctUntilChanged y el filter que sigue son todos para evitar la duplicación de logs de angular.
      distinctUntilChanged(),
      filter(email => email !== null)
      //acá sigue la función:
      //con el mail de logueo va a revisar si hay un usuario con ese mail en las tres tablas de usuarios  
    ).subscribe(async email => {
      this.userEmail = email;
      if (email) {
        const usuarioExistente = await this.checkUserExists(email);
        if (usuarioExistente.data.existe == 1) {
          //En caso de que el usuario exista en por lo menos una tabla, lo busca en esa tabla correspondiente y trae la data
          const usuarioHalladoEnBBDD = await this.getUser(email, usuarioExistente.data.tabla)
          //y modificamos la siguiente variable para decidir el comportamiento del template:
          this.usuarioRol = usuarioExistente.data.tabla
          console.log("Usuario hallado en BBDD: ", usuarioHalladoEnBBDD)
        } else {
          console.log("Usuario no hallado ", usuarioExistente)
        }
      }
    });
  }

  async checkUserExists(email: string) {
    try {
      const res = await lastValueFrom(this.usersService.checkUserExists(email));
      return res
    } catch (error) {
      console.error('Error checkeando existencia de usuario:', error);
      return { data: { existe: 0 } }; // Fallback de seguridad;
    }
  }

  async getUser(email: string, table: string) {

    try {
      // Convertimos el observable en promesa para poder usar await
      const res = await lastValueFrom(this.usersService.getUsuarioByEmailAndTable(email, table));
      return res
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }


  async handleLogin(event: Event) {
    event.preventDefault();
    this.loading = true;

    try {
      //Primero loguea
      const { data, error } = await this.authService.signIn(this.login_email, this.login_password);
      if (error) throw error;

      if (data.user?.email) {
        //Con el mail del usuario ya logueado, revisa si existe algún usuario con ese mail en las 3 tablas de usuarios
        //si existe, retorna {existe: 1, tabla: la-tabla-en-la-que-hallarlo }
        const usuarioExistente = await this.checkUserExists(data.user.email)

        if (usuarioExistente.data.existe == 1) {
          //En caso de que el usuario exista en una tabla, lo busca en la tabla correspondiente
          //debug --> console.log("Usuario hallado en tabla: ", hallado.data.tabla)
          const usuarioHalladoEnBBDD = await this.getUser(data.user.email, usuarioExistente.data.tabla)
          console.log("Usuario hallado en BBDD: ", usuarioHalladoEnBBDD)
        } /* else {
          console.log("Usuario no hallado che ", usuarioExistente)
        } */
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      this.loading = false;
    }
  }

  async handleSignUp(event: Event) {
    event.preventDefault();
    this.loading = true;

    try {
      const { data, error } = await this.authService.signUp(this.signup_email, this.signup_password);

      if (error) throw error;

      // If email confirmation is ON, session will be null, and user might be present
      if (data.user && !data.session) {
        this.confirmationSent = true;
      }
    } catch (error: any) {
      alert(error.message || 'An error occurred during sign up.');
    } finally {
      this.loading = false;
    }
  }

async handleCreateUser() {
    if (!this.selectedRole) return alert('Por favor selecciona un rol');

    try {
      this.loading = true;
      // 1. Llamamos al servicio
      await lastValueFrom(this.usersService.createUserByRole(this.userEmail!, this.selectedRole));
      
      console.log('Usuario creado con éxito');
      
      // 2. RECARGAR: Volvemos a ejecutar la carga inicial
      // Ahora checkUserExists devolverá 1 y se mostrará el template correcto
      await this.inicializarDatos();
      
    } catch (error) {
      console.error('Error al crear:', error);
      alert('No se pudo crear el perfil');
    } finally {
      this.loading = false;
    }
  }/*  */



/*      onRoleChange(event: Event): void {
      const select = event.target as HTMLSelectElement;
      const value = select.value;
      this.usersService.setSelectedRole(value);
    } */
   

  /* private loadData(): void {

    // this.authService.isAuthenticated$.subscribe({
    //  next: (data) => {
    //    this.isAuth = data
    //    this.loadUser();
    //  },
    //  error: (err) => console.error('Error al obtener usuario', err)
    //}) 

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

  } */

  /* private loadUser(): void {
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

  } */

  /* private async endLoading(email: string) {
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
  } */

}


