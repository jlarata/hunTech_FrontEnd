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
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  user$: Observable<User | null>;
  userEmail: string | null = null;
  private authSub?: Subscription;
  selectedRole: string = ''; // Almacena la opción del select
  usuarioRol: string = ''; // almacenaremos aquí la opción que llega de la bbdd

  login_email = '';
  login_password = '';
  signup_email = '';
  signup_password = '';
  loading = false;
  confirmationSent = false;

  title = 'hunTech';
  // La variable loading la usa el template para renderizar algunos botones o no, de manera diferente, esta otra variable cargandoData la usa para
  // renderizar el spinner mientras se carga la data (i.e. la página espera hasta saber quien sos exactamente antes de mostrarte algo que no debería
  // como el selector de rol)
  cargandoData = false;


  constructor(
    /* private _loaderService: LoadingService, */
    protected usersService: Users,
    private router: Router,
    private authService: AuthService
  ) {
    // Asigna el observable del servicio
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
    this.cargandoData = true;
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
          //esto es inmediato y para manejar la visualización (o no) del formulario de selección de rol
          this.usuarioRol = usuarioExistente.data.tabla

          // debug --> console.log("Usuario hallado en BBDD: ", this.usuarioRol)

          // Ahora bien, en caso de que el usuario exista en por lo menos una tabla, lo busca en esa tabla correspondiente y trae la data
          const usuarioHalladoEnBBDD = await this.getUser(email, usuarioExistente.data.tabla)
          // Y guarda todo el objeto (nombre, rol, id, etc) en el BehaviorSubject
          // para que pueda ser leído por los componentes
          this.usersService.setUserProfile({
            ...usuarioHalladoEnBBDD,
            email: email,                    // <--- Vital para el PUT
            rol: usuarioExistente.data.tabla // <--- Vital para el renderizado del HTML
          })
        } else {
          this.usuarioRol = ''; // fuerza que sea vacio para que se vea el formulario
          console.log("Usuario no hallado, mostrando selector de rol")
        }
      }
    });
    this.cargandoData = false;
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
      return res.data
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }


  async handleLogin(event: Event) {
    event.preventDefault();
    this.loading = true;
    this.cargandoData = true;

    try {
      //Primero loguea
      const { data, error } = await this.authService.signIn(this.login_email, this.login_password);
      if (error) throw error;

      if (data.user?.email) {
        //Con el mail del usuario ya logueado, revisa si existe algún usuario con ese mail en las 3 tablas de usuarios
        //si existe, retorna {existe: 1, tabla: la-tabla-en-la-que-hallarlo }
        const usuarioExistente = await this.checkUserExists(data.user.email)

        if (usuarioExistente.data.existe == 1) {
          //esto es inmediato y para manejar la visualización (o no) del formulario de selección de rol
          this.usuarioRol = usuarioExistente.data.tabla;

          //Ahora bien, en caso de que el usuario exista en una tabla, lo busca en la tabla correspondiente
          //debug --> console.log("Usuario hallado en tabla: ", hallado.data.tabla)
          const usuarioHalladoEnBBDD = await this.getUser(data.user.email, usuarioExistente.data.tabla)

          // Y guarda todo el objeto (nombre, rol, id, etc) en el BehaviorSubject
          // para que pueda ser leído por los componentes
          this.usersService.setUserProfile({
            ...usuarioHalladoEnBBDD,
            email: data.user.email, // <--- Vital para el PUT, Usamos el mail de Supabase
            rol: usuarioExistente.data.tabla // <--- Vital para el renderizado del HTML
            /* rol: usuarioExistente.data.tabla */
          })

        } else {
          this.usuarioRol = '';
        }
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      this.loading = false;
    }
    this.cargandoData = false;
  }

  // Handler de creación de user para auth
  async handleSignUp(event: Event) {
    event.preventDefault();
    this.loading = true;
    this.cargandoData = true;

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
    this.cargandoData = false;
  }

  // Handler de creación de user de tabla (dev, gerente, etc.)
  async handleCreateUser() {
    this.cargandoData = true;
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
    this.cargandoData = false;
  }
}


