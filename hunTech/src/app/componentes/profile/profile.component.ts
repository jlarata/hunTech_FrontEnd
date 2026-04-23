import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Users } from './../../servicios/users';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usersService = inject(Users);

  
  perfil: any = null;
  rolActual: string = '';
  isEditing: boolean = false;
  loading: boolean = false;

  // --- VARIABLES PARA ARCHIVOS ---
  archivoCV: File | null = null;            // Para el Currículum
  archivoSeleccionado: File | null = null; // Para el Portfolio

  // --- VARIABLES PARA HABILIDADES ---
  mostrandoFormulario: boolean = false;
  nuevaHabilidad = {
    nombre: '',
    nivel: 'principiante'
  };

  // --- IDIOMAS ---
  mostrandoFormIdioma: boolean = false;
  nuevoIdioma = {
    nombre: '',
    nivel: 'A1 - Principiante'
  };

  // CONTROL DE NAVEGACIÓN
  seccionActiva: string = 'info';

  ngOnInit() {
    this.usersService.userProfile$.subscribe(data => {
      if (data) {
        this.perfil = {
          ...data,
          habilidades: data.habilidades || [],
          idiomas: data.idiomas || [],
          empresa_nombre: data.empresa_nombre || '',
          web_empresa: data.web_empresa || '',
          descripcion_empresa: data.descripcion_empresa || '',
          ubicacion_empresa: data.ubicacion_empresa || ''
        };
        this.rolActual = data.rol || '';
      }
    });
  }

  // --- MÉTODOS PARA ARCHIVOS ---

  // Para el Currículum (Input #fileInputCV)
  onCVSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoCV = file;
    }
  }

  // Para el Portfolio (Input #fileInputPortfolio)
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  // Función de borrar única para ambos
  borrarArchivo(tipo: string) {
    if (tipo === 'cv') {
      this.archivoCV = null;
    } else {
      this.archivoSeleccionado = null;
    }
  }

  // --- HABILIDADES ---
  eliminarHabilidad(indice: number) {
    this.perfil.habilidades.splice(indice, 1);
  }

  guardarHabilidad() {
    if (this.nuevaHabilidad.nombre.trim() !== '') {
      this.perfil.habilidades.push({ ...this.nuevaHabilidad });
      this.nuevaHabilidad = { nombre: '', nivel: 'principiante' };
      this.mostrandoFormulario = false;
    }
  }

  // --- IDIOMAS ---
  guardarIdioma() {
    if (this.nuevoIdioma.nombre.trim() !== '') {
      this.perfil.idiomas.push({ ...this.nuevoIdioma });
      this.nuevoIdioma = { nombre: '', nivel: 'A1 - Principiante' };
      this.mostrandoFormIdioma = false;
    }
  }

  eliminarIdioma(indice: number) {
    this.perfil.idiomas.splice(indice, 1);
  }

  // --- NAVEGACIÓN Y EDICIÓN ---
  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    this.isEditing = false;
    this.mostrandoFormulario = false;
    this.mostrandoFormIdioma = false;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.mostrandoFormulario = false;
      this.mostrandoFormIdioma = false;
    }
  }

  async handleUpdate() {
    if (!this.rolActual) return alert("Error: No se detectó el rol del usuario");

    try {
      this.loading = true;
      const email = this.perfil.email;
      await lastValueFrom(this.usersService.updateUserByRole(this.rolActual, email, this.perfil));
      this.isEditing = false;
      alert('Perfil actualizado con éxito');
    } catch (error) {
      console.error('Error en PUT:', error);
      alert('Hubo un error al guardar los cambios');
    } finally {
      this.loading = false;
    }
  }

  get isProfileEmpty(): boolean {
    if (!this.perfil) return true;
    return !this.perfil.nombre || this.perfil.nombre === '';
  }
}
