import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Users } from '../../servicios/users';
import { Observable } from 'rxjs';
import { User } from '@supabase/supabase-js';
import { AuthService } from '../../servicios/AuthService';


@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})

export class Home {

  /*   private _usersService = inject(Users);
    user: any;
    rol:any; */

  user$: Observable<User | null>;
  loading = false;
  activeTab: 'desarrolladores' | 'empresas' = 'desarrolladores';
  openFaq: number | null = null;

  perks = [
    { icon: 'attach_money', iconClass: 'g', title: '100% gratuito', desc: 'Publicar ofertas básicas no tiene costo.' },
    { icon: 'verified_user', iconClass: 'b', title: 'Perfiles verificados', desc: 'Todos los candidatos son alumnos del IFTS N°11.' },
    { icon: 'bolt', iconClass: 'a', title: 'Respuesta rápida', desc: 'Recibís postulaciones en horas.' },
    { icon: 'school', iconClass: 'p', title: 'Formación técnica sólida', desc: 'Perfiles formados en desarrollo y análisis de sistemas.' },
    { icon: 'dashboard', iconClass: 't', title: 'Panel de gestión', desc: 'Administrá tus ofertas y postulantes fácilmente.' },
    { icon: 'favorite', iconClass: 'r', title: 'Impacto social', desc: 'Contribuís al desarrollo de jóvenes talentos.' },
  ];

  currentIndex = 0;

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextSlide(): void {
    if (this.currentIndex < this.perks.length - 1) {
      this.currentIndex++;
    }
  }

  goToSlide(i: number): void {
    this.currentIndex = i;
  }

  /*    ngOnInit(): void {
       this.loadUser();
    } */

  constructor(private authService: AuthService) {
    // Assign the observable from the service
    this.user$ = this.authService.user$;
  }

  setActiveTab(tab: 'desarrolladores' | 'empresas'): void {
    this.activeTab = tab;
    this.openFaq = null;
  }

  scrollToTab(tab: 'desarrolladores' | 'empresas'): void {
    this.setActiveTab(tab);
    setTimeout(() => {
      const element = document.querySelector('.tabs-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  toggleFaq(index: number): void {
    this.openFaq = this.openFaq === index ? null : index;
  }

  irAlSitioOficial(): void {
    window.open('https://www.ifts11.edu.ar', '_blank');
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