import { Component, inject, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/AuthService';
import { User } from '@supabase/supabase-js';
import { Observable } from 'rxjs';
import { Users } from '../../servicios/users';

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
  private router = inject(Router);
  isOnContratos = false;
  private _subs: any;
  activeFragment?: string | null = null;


  perfil: any = null;
  rolActual: string = '';

  constructor(
    private authService: AuthService,
    private usersService: Users
  ) {
    // Assign the observable from the service
    this.user$ = this.authService.user$;
  }

  ngOnInit(): void {
    // Suscripción para tener la data siempre actualizada
    this.usersService.userProfile$.subscribe(data => {
      if (data) {
        this.perfil = { ...data }; // Copia para editar sin afectar el estado global antes de tiempo
        // Determina el rol (esto lo saca de la tabla que devolvió la API en app.ts)
        this.rolActual = data.rol || '';
      }
      
    });

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
