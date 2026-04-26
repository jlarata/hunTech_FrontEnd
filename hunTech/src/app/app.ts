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
  selectedRole: string = '';
  usuarioRol: string = '';

  login_email = '';
  login_password = '';
  signup_email = '';
  signup_password = '';
  loading = false;
  confirmationSent = false;
  showLoginModal = false;
  showRegisterModal = false;
  showForgotPasswordModal = false;
  reset_email = '';
  resetSent = false;

  title = 'hunTech';

  cargandoData = false;


  constructor(
    /* private _loaderService: LoadingService, */
    protected usersService: Users,
    private router: Router,
    private authService: AuthService
  ) {

    this.user$ = this.authService.user$;
  }



  get esSoloPerfil(): boolean {
    return this.router.url.startsWith('/profile/');
  }

  async ngOnInit() {
    this.userEmail = this.authService.getCurrentUser()?.email || '';
    await this.inicializarDatos()
  }

  async inicializarDatos() {
    this.cargandoData = true;

    this.authSub = this.authService.userEmail$.pipe(

      distinctUntilChanged(),
      filter(email => email !== null)

    ).subscribe(async email => {
      this.userEmail = email;
      if (email) {
        const usuarioExistente = await this.checkUserExists(email);
        if (usuarioExistente.data.existe == 1) {

          this.usuarioRol = usuarioExistente.data.tabla

          // debug --> console.log("Usuario hallado en BBDD: ", this.usuarioRol)


          const usuarioHalladoEnBBDD = await this.getUser(email, usuarioExistente.data.tabla)

          this.usersService.setUserProfile({
            ...usuarioHalladoEnBBDD,
            email: email,
            rol: usuarioExistente.data.tabla
          })
        } else {
          this.usuarioRol = '';
          console.log("Usuario no hallado, mostrando selector de rol")
        }
      }
      this.cargandoData = false;
    });
  }

  async checkUserExists(email: string) {
    try {
      const res = await lastValueFrom(this.usersService.checkUserExists(email));
      return res
    } catch (error) {
      console.error('Error checkeando existencia de usuario:', error);
      return { data: { existe: 0 } };
    }
  }

  async getUser(email: string, table: string) {

    try {

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

      const { data, error } = await this.authService.signIn(this.login_email, this.login_password);
      if (error) throw error;

      if (data.user?.email) {
        this.closeModals();
        const usuarioExistente = await this.checkUserExists(data.user.email)

        if (usuarioExistente.data.existe == 1) {

          this.usuarioRol = usuarioExistente.data.tabla;


          const usuarioHalladoEnBBDD = await this.getUser(data.user.email, usuarioExistente.data.tabla)


          this.usersService.setUserProfile({
            ...usuarioHalladoEnBBDD,
            email: data.user.email,
            rol: usuarioExistente.data.tabla

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

  async handleSignUp(event: Event) {
    event.preventDefault();
    this.loading = true;
    this.cargandoData = true;

    try {
      const { data, error } = await this.authService.signUp(this.signup_email, this.signup_password);

      if (error) throw error;

      if (data.user && !data.session) {
        this.confirmationSent = true;

      }
    } catch (error: any) {
      alert(error.message || 'Hubo problemas al crear tu cuenta');
    } finally {
      this.loading = false;
    }
    this.cargandoData = false;
  }

  async handleCreateUser() {
    this.cargandoData = true;
    if (!this.selectedRole) return alert('Por favor selecciona un rol');

    try {
      this.loading = true;
      await lastValueFrom(this.usersService.createUserByRole(this.userEmail!, this.selectedRole));

      console.log('Usuario creado con éxito');

      await this.inicializarDatos();

    } catch (error) {
      console.error('Error al crear:', error);
      alert('No se pudo crear el perfil');
    } finally {
      this.loading = false;
    }
    this.cargandoData = false;
  }

  async logout() {
    this.cargandoData = true;
    try {

      await this.authService.signOut();


      this.userEmail = null;
      this.usuarioRol = '';
      this.selectedRole = '';


      await this.router.navigate(['/']);

      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      this.cargandoData = false;
    }
  }

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleLoginModal() {
    this.showLoginModal = !this.showLoginModal;
    this.showRegisterModal = false;
    this.showForgotPasswordModal = false;
  }

  toggleRegisterModal() {
    this.showRegisterModal = !this.showRegisterModal;
    this.showLoginModal = false;
  }

  closeModals() {
    this.showLoginModal = false;
    this.showRegisterModal = false;
    this.showForgotPasswordModal = false;
    this.confirmationSent = false;
    this.resetSent = false;
  }

  toggleForgotPasswordModal() {
    this.showForgotPasswordModal = !this.showForgotPasswordModal;
    this.showLoginModal = false;
    this.showRegisterModal = false;
    this.resetSent = false;
  }

  async handleResetPassword(event: Event) {
    event.preventDefault();
    this.loading = true;
    try {
      const { error } = await this.authService.resetPassword(this.reset_email);
      if (error) throw error;
      this.resetSent = true;
    } catch (error: any) {
      alert(error.message || 'Error al enviar el correo de recuperación');
    } finally {
      this.loading = false;
    }
  }
}



