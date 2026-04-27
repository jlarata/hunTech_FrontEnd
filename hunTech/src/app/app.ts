import { Component, ViewEncapsulation } from '@angular/core';
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
  styleUrls: ['./app.css'],
  encapsulation: ViewEncapsulation.None
})
export class App {
  isModoOscuro: boolean = false;
  private canvas?: HTMLCanvasElement;

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

  /* ---- MINI LIBRO 3D ---- */
  bookSpread = 0;
  bookFlipState: 'idle' | 'forward' = 'idle';
  bookAnimating = false;
  bookSpreads = [[0, 1], [2, 3]];
  bookPages = [
    { label: 'HunTech', title: '¿Qué es HunTech?', body: 'Nuestro objetivo es facilitar el contacto con empresas que valoran la innovación, la curiosidad y el potencial de los estudiantes de IT.', bg: '#f5f3ff' },
    { label: 'Para vos', title: 'Tu perfil, tu marca', body: 'Completá tu perfil y destacate ante cientos de reclutadores activos.', bg: '#eff6ff' },
    { label: 'Empresas', title: 'Talento a un click', body: 'Publicá ofertas y encontrá al desarrollador que tu equipo necesita.', bg: '#f0fdf4' },
    { label: 'Comunidad', title: 'Crecé con nosotros', body: 'Accedé a recursos y una comunidad de profesionales de tecnología.', bg: '#fff7ed' }
  ];
  bookNext() {
    if (this.bookSpread >= this.bookSpreads.length - 1 || this.bookAnimating) return;
    this.bookAnimating = true;
    this.bookFlipState = 'forward';
    setTimeout(() => {
      this.bookSpread++;
      this.bookFlipState = 'idle';
      setTimeout(() => { this.bookAnimating = false; }, 50);
    }, 650);
  }
  bookPrev() {
    if (this.bookSpread <= 0 || this.bookAnimating) return;
    this.bookAnimating = true;
    this.bookSpread--;
    setTimeout(() => { this.bookAnimating = false; }, 100);
  }


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
    this.checkInitialTheme();
    await this.inicializarDatos()
  }

  checkInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isModoOscuro = true;
      document.body.classList.add('dark-theme');
    }
  }

  toggleModoOscuro() {
    this.isModoOscuro = !this.isModoOscuro;
    if (this.isModoOscuro) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
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



