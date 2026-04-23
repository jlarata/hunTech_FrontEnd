import { Component, inject, OnDestroy } from '@angular/core';
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
  user$: Observable<User | null>;
  menuActive = false;
  isgests = false;
  private router = inject(Router);
  isOnContratos = false;
  private _subs: any;
  activeFragment?: string | null = null;
  private gests = ['']


  perfil: any = null;
  rolActual: string = '';

  constructor(
    private authService: AuthService,
    private usersService: Users
  ) {
    // Assign the observable from the service
    this.user$ = this.authService.user$;
    this.gests = environment.gests;
  }

  async ngOnInit(): Promise<void> {
    await this.inicializarDatos();
    // Detect si se está navegando /contratos para mostrar el index embebido
    this.isOnContratos = this.router.url?.startsWith('/contratos');
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
      // 1. Wait for valid profile data
      filter(data => !!data),
      tap(data => {
        // Usa tap para "side effects" como asignar variables
        this.perfil = { ...data };
        this.rolActual = data.rol || '';
      })
    ).subscribe({
      next: (data) => {
        // La data 'pasa' mediante tap al bloque de suscripción:
        if (this.gests.includes(data.email)) {
          this.isgests = true;
          //console.log("Debug: autorizado")
        } else {
          //console.log("Intentando entrar al dashboard sin autorización");
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

  navigateToFragment(fragment: string) {
    // Navigate to /contratos with fragment and attempt to smooth-scroll to target
    this.router.navigate(['/contratos'], { fragment }).then(() => {
      this.activeFragment = fragment;
      this.closeMenu();
      // small delay to let target render if needed
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

  logout() {
    this.authService.signOut();
  }
}
