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

  // Variables de Estado
  perfil: any = null;
  rolActual: string = '';
  isEditing: boolean = false;
  loading: boolean = false;
  
  // --- VARIABLE PARA EL ARCHIVO CV ---
  archivoSeleccionado: File | null = null;

  // --- VARIABLES PARA HABILIDADES ---
  mostrandoFormulario: boolean = false;
  nuevaHabilidad = {
    nombre: '',
    nivel: 'principiante'
  };

  // CONTROL DE NAVEGACIÓN
  seccionActiva: string = 'info'; 

  ngOnInit() {
    this.usersService.userProfile$.subscribe(data => {
      if (data) {
        this.perfil = { ...data };
        this.rolActual = data.rol || '';
        if (!this.perfil.habilidades) {
          this.perfil.habilidades = [];
        }
        console.log("Rol detectado en Perfil:", this.rolActual);
      }
    });
  }

  // --- MÉTODOS PARA EL ARCHIVO ---
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      console.log("Currículum listo para subir:", file.name);
    }
  }

  borrarArchivo() {
    this.archivoSeleccionado = null;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    console.log("Archivo quitado");
  }

  // --- HABILIDADES ---
  eliminarHabilidad(indice: number) {
    this.perfil.habilidades.splice(indice, 1);
    console.log("Habilidad eliminada. Lista actual:", this.perfil.habilidades);
  }

  guardarHabilidad() {
    if (this.nuevaHabilidad.nombre.trim() !== '') {
      this.perfil.habilidades.push({ ...this.nuevaHabilidad });
      this.nuevaHabilidad = { nombre: '', nivel: 'principiante' };
      this.mostrandoFormulario = false;
      console.log("Habilidad añadida temporalmente:", this.perfil.habilidades);
    }
  }

  // --- NAVEGACIÓN Y EDICIÓN ---
  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    this.isEditing = false; 
    this.mostrandoFormulario = false; 
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.mostrandoFormulario = true;
    } else {
      this.mostrandoFormulario = false;
    }
  }
// ---  IDIOMAS ---
mostrandoFormIdioma: boolean = false;
nuevoIdioma = {
  nombre: '',
  nivel: 'A1 - Principiante'
};

guardarIdioma() {
  if (this.nuevoIdioma.nombre.trim() !== '') {
    
    if (!this.perfil.idiomas) {
      this.perfil.idiomas = [];
    }
    this.perfil.idiomas.push({ ...this.nuevoIdioma });
    
    // Resetear formulario
    this.nuevoIdioma = { nombre: '', nivel: 'A1 - Principiante' };
    this.mostrandoFormIdioma = false;
    console.log("Idioma añadido:", this.perfil.idiomas);
  }
}

eliminarIdioma(indice: number) {
  this.perfil.idiomas.splice(indice, 1);
}
  async handleUpdate() {
    if (!this.rolActual) return alert("Error: No se detectó el rol del usuario");

    try {
      this.loading = true;
      const email = this.perfil.email; 
      await lastValueFrom(this.usersService.updateUserByRole(this.rolActual, email, this.perfil));

      this.isEditing = false;
      this.mostrandoFormulario = false;
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


