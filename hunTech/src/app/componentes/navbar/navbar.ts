import { Component, inject, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../servicios/auth';
import { Users } from '../../servicios/users';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  private _usersService = inject(Users);
  user: any;
  rol: any;
  menuActive = false;

  authService = inject(Auth);
  private router = inject(Router);
  isOnContratos = false;
  private _subs: any;
  activeFragment?: string | null = null;

  ngOnInit(): void {
    this.loadUser();
    // detect when route is /contratos to show the embedded index
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

  private loadUser(): void {
    // user$ ya tiene el objeto que guardamos enCognito y data de la db si hay
    this._usersService.user$.subscribe({
      next: (data) => {
        this.user = data; //data de cognito  y DB
      },
      error: (err) => console.error('Error al obtener usuario', err),
    });

    this._usersService.selectedRole$.subscribe({
      next: (data) => {
        this.user.rol = data; //data de cognito  y DB
      },
      error: (err) => console.error('Error al obtener el rol', err),
    });

  }
}
