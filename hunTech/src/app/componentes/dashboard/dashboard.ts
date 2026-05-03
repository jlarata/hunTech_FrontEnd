import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '@supabase/supabase-js';
import { filter, Observable, switchMap, tap } from 'rxjs';
import { AuthService } from '../../servicios/AuthService';
import { Users } from '../../servicios/users';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard {
  user$: Observable<User | null>;
  perfil: any = null;
  rolActual: string = '';
  private gests = ['']
  auth = false;

  constructor(
    private authService: AuthService,
    private usersService: Users
  ) {
    this.gests = environment.gests;
    this.user$ = this.authService.user$;
  }

  async ngOnInit(): Promise<void> {
    await this.inicializarDatos();

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
          this.auth = true;
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

}
