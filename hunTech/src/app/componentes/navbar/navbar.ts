import { Component, inject, OnDestroy, Output, EventEmitter } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/AuthService';
import { User } from '@supabase/supabase-js';
import { filter, Observable, tap } from 'rxjs';
import { Users } from '../../servicios/users';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  @Output() onLogin = new EventEmitter<void>();
  @Output() onRegister = new EventEmitter<void>();
  user$: Observable<User | null>;
  menuActive = false;
  isgests = false;
  private router = inject(Router);
  isOnContratos = false;
  private _subs: any;
  activeFragment?: string | null = null;
  private gests = ['']

  /* ---- MINI LIBRO 3D ---- */
  showBookModal = false;
  bookSpread = 0;
  bookFlipState: 'idle' | 'forward' = 'idle';
  bookAnimating = false;
  bookSpreads = [[-1, 0], [1, 2], [3, 4], [5, 6], [7, -1]];
  bookPages = [
    {
      isCover: true, title: '', body: 'HUNTECH', bg: '#2a1b0e'
    },
    { label: 'HunTech', title: '¿Qué es HunTech?', body: 'Nuestro objetivo es facilitar el contacto con empresas que valoran la innovación, la curiosidad y el potencial de los estudiantes de IT.', bg: '#e8d4b9' },
    { label: 'Para vos', title: 'Tu perfil, tu marca', body: 'Completá tu perfil y destacate ante cientos de reclutadores activos.', bg: '#e8d4b9' },
    { label: 'Empresas', title: 'Talento a un click', body: 'Publicá ofertas y encontrá al desarrollador que tu equipo necesita.', bg: '#e8d4b9' },
    { label: 'Contratos', title: 'Gestión Simple', body: 'Seguí tus procesos de contratación en tiempo real con transparencia total.', bg: '#e8d4b9' },
    { label: 'Comunidad', title: 'Crecé con nosotros', body: 'Accedé a recursos y una comunidad de profesionales de tecnología.', bg: '#e8d4b9' },
    { label: 'Futuro', title: 'Próximos Pasos', body: 'Estamos trabajando en nuevas herramientas de IA para potenciar tu búsqueda laboral.', bg: '#e8d4b9' },
    { isBackCover: true, title: 'HUNTECH', body: '', bg: '#2a1b0e' }
  ];

  bookNext() {
    if (this.bookSpread >= this.bookSpreads.length - 1) return;
    this.bookSpread++;
  }

  bookPrev() {
    if (this.bookSpread <= 0) return;
    this.bookSpread--;
  }

  toggleBookModal() {
    this.showBookModal = !this.showBookModal;
    this.closeMenu();
  }

  closeBookModal() {
    this.showBookModal = false;
  }


  perfil: any = null;
  rolActual: string = '';

  isDropdownDesarrolladorOpen = false;
  isDropdownGerenteOpen = false;
  isModoOscuro = false;

  constructor(
    private authService: AuthService,
    private usersService: Users
  ) {

    this.user$ = this.authService.user$;
    this.gests = environment.gests;
  }

  async ngOnInit(): Promise<void> {
    await this.inicializarDatos();

    this.isOnContratos = this.router.url?.startsWith('/contratos');

    // Inicializar tema
    const savedTheme = localStorage.getItem('theme');
    this.isModoOscuro = savedTheme === 'dark';
    this.updateThemeClass();

    this._subs = this.router.events.subscribe((ev: any) => {
      if (ev instanceof NavigationEnd) {
        this.isOnContratos = ev.urlAfterRedirects?.startsWith('/contratos');
        try {
          const parsed = this.router.parseUrl(ev.urlAfterRedirects || this.router.url);
          this.activeFragment = parsed.fragment ?? null;
        } catch (e) {
          this.activeFragment = null;
        }
      }
    });
  }

  async inicializarDatos() {
    this.usersService.userProfile$.pipe(

      filter(data => !!data),
      tap(data => {

        this.perfil = { ...data };
        this.rolActual = data.rol || '';
      })
    ).subscribe({
      next: (data) => {
        if (this.gests.includes(data.email)) {
          this.isgests = true;

        } else {

        }
      },
      error: (err) => {
        console.error('Error during data initialization:', err);
      }
    })
  }




  ngOnDestroy(): void {
    if (this._subs) { this._subs.unsubscribe?.(); }
  }
  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  closeMenu() {
    this.menuActive = false;
  }

  goBack() {
    window.history.back();
  }

  toggleDropdownDesarrollador() {
    this.isDropdownDesarrolladorOpen = !this.isDropdownDesarrolladorOpen;
  }

  toggleDropdownGerente() {
    this.isDropdownGerenteOpen = !this.isDropdownGerenteOpen;
  }

  navigateToFragment(fragment: string) {
    this.router.navigate(['/contratos'], { fragment }).then(() => {
      this.activeFragment = fragment;
      this.closeMenu();

      setTimeout(() => {
        try {
          const el = document.getElementById(fragment);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } catch (err) {
          console.error('scroll error', err);
        }
      }, 120);
    });
  }

  navigateTo(path: string) {
    this.router.navigate([`/${path}`]);
    this.closeMenu();
  }

  async logout() {
    await this.authService.signOut();
    window.location.href = '/';
  }

  openBook() {
    this.toggleBookModal();
  }

  toggleModoOscuro() {
    this.isModoOscuro = !this.isModoOscuro;
    localStorage.setItem('theme', this.isModoOscuro ? 'dark' : 'light');
    this.updateThemeClass();
  }

  private updateThemeClass() {
    if (this.isModoOscuro) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}