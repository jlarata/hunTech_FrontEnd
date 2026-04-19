import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormControl, FormArray, FormsModule } from '@angular/forms';
import { Users } from './../../servicios/users';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  private fb = inject(FormBuilder);
  usuarioLogueado: any;
  perfil: any = null;
  rolActual: string = '';
  isEditing: boolean = false;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: Users
  ) { }

  ngOnInit() {
    // Suscripción para tener la data siempre actualizada
    this.usersService.userProfile$.subscribe(data => {
      if (data) {
        this.perfil = { ...data }; // Copia para editar sin afectar el estado global antes de tiempo
        // Determina el rol (esto lo saca de la tabla que devolvió la API en app.ts)
        this.rolActual = data.rol || '';

        console.log("Rol detectado en Perfil:", this.rolActual);
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  async handleUpdate() {
    if (!this.rolActual) return alert("Error: No se detectó el rol del usuario");

    try {
      this.loading = true;

      // El email lo saca del objeto perfil que ya está cargado
      const email = this.perfil.email;
      // Llama al servicio pasando los 3 parámetros: rol, email y el objeto de datos
      // Envia el objeto perfil completo (que además tiene el email, un poco de redundancia)
      await lastValueFrom(this.usersService.updateUserByRole(this.rolActual, email, this.perfil));

      this.isEditing = false;
      alert('Perfil actualizado');
    } catch (error) {
      console.error('Error en PUT:', error);
      alert('Hubo un error al guardar los cambios');
    } finally {
      this.loading = false;
    }
  }

  // Helper para saber si el perfil está vacío
  get isProfileEmpty(): boolean {
    if (!this.perfil) return true;
    return !this.perfil.nombre || this.perfil.nombre === '';
  }
}


