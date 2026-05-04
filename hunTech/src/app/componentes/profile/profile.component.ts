import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Users } from './../../servicios/users';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ProyectoService } from '../../servicios/miproyecto';

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
  private projectService = inject(ProyectoService)


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
  isSidebarOpen: boolean = false;

  ngOnInit() {
    this.usersService.userProfile$.subscribe(data => {
      if (data) {
        this.perfil = {
          ...data,
          //habilidades: data.habilidades || [],
          //idiomas: data.idiomas || [],
          /* empresa_nombre: data.empresa_nombre || '', esto sale de otro servicio, proyecto */
          /* web_empresa: data.web_empresa || '', */
          /* descripcion_empresa: data.descripcion_empresa || '', */
          /* ubicacion_empresa: data.ubicacion_empresa || '', */
          telefono: data.telefono,
          posicion:data.puesto_actual,
          habilidades: (data.habilidades || []).map((h: any) => ({
            nombre: h.nombre_habilidad,   // back → front
            nivel: h.nivel_habilidad
          })),
          idiomas: (data.idiomas || []).map((i: any) => ({
            nombre: i.nombre_idioma,
            nivel: i.nivel_idioma
          })),

        };
        this.rolActual = data.rol || '';

        this.projectService.getProyectoPorEmail(data.email).subscribe({
          next: (res) => {
            //console.log(`${res.count} ${res.message}`)
            //console.log(res.data[0])
            this.perfil.proyecto = res.data[0];
          },
          error: (error: string) => {
            console.log('desde el componente perfil error ' + error)
          }
        });
      }
    });
  }

  // --- MÉTODOS PARA ARCHIVOS ---

  // Para el Currículum 
  onCVSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoCV = file;
    }
  }

  // Para el Portfolio 
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  // Función de borrar 
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

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  soloNumeros(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  async handleUpdate() {
    if (!this.rolActual) return alert("Error: No se detectó el rol del usuario");
    

    if (this.rolActual == 'desarrollador') {
      //como en db posicion es puesto_actual lo voy a renombrar antes de enviar
      //las tablas y habilidades idioma son nombre_habilidad, nivel_habilidad, nombre_idioma, nivel_idiona
      const userDevPayload = {
        ...this.perfil,
        puesto_actual: this.perfil.posicion,
        //  HABILIDADES → formato back
        habilidades: (this.perfil.habilidades || [])
        .filter((h: any) => h && h.nombre) // saca null/undefined/vacío
        .map((h: any) => ({
          nombre_habilidad: String(h.nombre || '').trim(),
          nivel_habilidad: h.nivel || 'principiante'
        })),
        //  IDIOMAS → formato back
        idiomas: (this.perfil.idiomas || [])
        .filter((i:any) => i && i.nombre)
        .map((i: any) => ({
          nombre_idioma: String(i.nombre || '').trim(),
          nivel_idioma: i.nivel || 'A1 - Principiante'
        }))

      };

      //console.log('PAYLOAD QUE SALE', JSON.stringify(userDevPayload, null, 2));

      try {
        this.loading = true;
        const email = this.perfil.email;
        await lastValueFrom(this.usersService.updateUserByRole(this.rolActual, email, userDevPayload));
        this.isEditing = false;
        alert('Perfil actualizado con éxito');
      } catch (error) {
        console.error('Error en PUT:', error);
        alert('Hubo un error al guardar los cambios');
      } finally {
        this.loading = false;
      }
    }

    if (this.rolActual == 'gerente') {
      try {
        this.loading = true;
        const email = this.perfil.email;
        await lastValueFrom(this.projectService.editProyecto(this.perfil.proyecto)) && lastValueFrom(this.usersService.updateUserByRole(this.rolActual, email, this.perfil));
        this.isEditing = false;
        alert('Perfil actualizado con éxito');
      } catch (error) {
        console.error('Error en PUT:', error);
        alert('Hubo un error al guardar los cambios');
      } finally {
        this.loading = false;
      }
    }


  }


  get isProfileEmpty(): boolean {
    if (!this.perfil) return true;
    return !this.perfil.nombre || this.perfil.nombre === '';
  }
}