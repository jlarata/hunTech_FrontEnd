import { Component,inject } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, FormControl, FormArray } from '@angular/forms';

import { Users} from './../../servicios/users';
import { Desarrollador } from './../../models/users/desarrollador';
import { Gerente } from './../../models/users/gerente';
import { InstitucionEducativa } from './../../models/users/institucion-educativa';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  private _usersService = inject(Users);
  private fb = inject(FormBuilder);

  user: any;
  rol:any;

  profileEditForm = this.fb.group({
    nombre:"",
    descripcion: "",
    skills: this.fb.array<string>([])
  });

  enEdicion = false; // mostrar formulario o tarjeta

  ngOnInit(): void {
    this.constructAndLoadUserByRole();
  }

  activarEdicion(): void {
    this.enEdicion = true;
    // rellenamos el form con los datos ingresados
    this.profileEditForm.patchValue({
      descripcion: this.user.descripcion || ''
    });
  }

  guardarCambiosEdicion(): void {
  if (this.profileEditForm.invalid) return;

    const formValue = this.profileEditForm.value;

    // solo actualizamos si el usuario escribió algo nuevo
    if (formValue.nombre?.trim() && formValue.nombre !== this.user.nombre) {
      this.user.nombre = formValue.nombre;
    }

    // actualizamos si es distinto de vacio 
    if (formValue.descripcion?.trim() != ""){
      this.user.descripcion = formValue.descripcion;
    }
    

    // solo actualizamos skills si es desarrollador
    if (this.user instanceof Desarrollador && formValue.skills) {
      this.user.skills = (formValue.skills as string[]).filter(s => s.trim() !== '');
    }

    this.enEdicion = false;
  }

  get skillsControls(): FormControl[] {
    return (this.profileEditForm.get('skills') as FormArray).controls as FormControl[];
  }

  agregarSkill(): void {
    const skillsArray = this.profileEditForm.get('skills') as FormArray;
    skillsArray.push(this.fb.control('')); // input vacío
  }

  private constructAndLoadUserByRole(): void {
    this.loadUser();
    this.loadRolUser();
    this.constructUserByRole();//esto al final
  }

  private constructUserByRole(): void {
    if (this.user && this.rol) {
      try {
        const userByRole = this.buildUserByRole(this.rol, this.user);
        this.user = userByRole;
      } catch (error) {
        console.error('Error al construir usuario por rol:', error);
      }
    }
  }

  private loadUser(): void {
    // user$ ya tiene el objeto que guardamos enCognito
    this._usersService.user$.subscribe({
      next: (data) => {
        this.user = data;   //data de cognito        
      },
      error: (err) => console.error('Error al obtener usuario', err)
    });
  }

  private loadRolUser(): void {
    // selectedRole$ ya tiene el rol que obtenemos de la db
    this._usersService.selectedRole$.subscribe({
      next: (data) => {
        this.rol = data;   //data de la db       
      },
      error: (err) => console.error('Error al obtener rol de usuario', err)
    });
  }

  private buildUserByRole(role: string, userData: any): Gerente | Desarrollador | InstitucionEducativa {
    const nombre = userData.name;
    const email = userData.email;

    switch (role) {
      case 'gerente':
        let gerente = new Gerente();
        gerente.nombre = nombre;
        gerente.email = email;
        gerente.descripcion = userData.descripcion || "";
        return gerente;
      case 'desarrollador':
        let skills: string[] =  ['Angular', 'TypeScript']; //valor por defecto
        let desarrollador = new Desarrollador();
        desarrollador.nombre = nombre;
        desarrollador.email = email;
        desarrollador.descripcion = userData.descripcion || "";
        //skill po esta definida en cognito , si en la db pero actualmente no estoy obteniendo ese dato
        desarrollador.skills = skills;
        return desarrollador;
      case 'institucion':
        let institucion =  new InstitucionEducativa();
        institucion.nombre = nombre;
        institucion.email = email;
        institucion.descripcion = userData.descripcion || "";
        return institucion;
      default:
        throw new Error('Rol no reconocido');
    }
  }

  //funcion auxiliar para ver de que tipo es ell user que creo, 
  // para verificar mi metodo buildUserByRole//buenoo y ahora para mostrar en el html
  //rol principal
  getTipoUsuario(): string {
    if (this.user instanceof Desarrollador) return 'Desarrollador';
    if (this.user instanceof Gerente)       return 'Gerente';
    if (this.user instanceof InstitucionEducativa) return 'Institución Educativa';
    return 'Desconocido';
  }

  //ok al momento de llegar a la pantalla de perfil ,
  //  el user ya debio  elegir rol y lo envianos a la db





}


  

