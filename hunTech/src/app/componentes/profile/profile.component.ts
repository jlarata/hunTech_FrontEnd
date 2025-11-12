import { Component,inject } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, FormControl, FormArray } from '@angular/forms';

import { Users} from './../../servicios/users';
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
    this.loadUser();
  }

  activarEdicion(): void {
    this.enEdicion = true;
    // rellenamos el form con los datos existentes
    this.profileEditForm.patchValue({
      nombre: this.user.nombre ?? '',
      descripcion: this.user.descripcion ?? '',
      skills: this.user.skills ?? []
    });

    // agregar los skills que ya tenemos en edit para que no se borren  al agregar nuevos
    const skillsArray = this.profileEditForm.get('skills') as FormArray;
    skillsArray.clear();// vaciamos por si quedo algun dato en memoria de edicion anterior no completada
    
    //agregamos un formcontrol por cada skill
    (this.user.skills as string[] ?? []).forEach(skill =>
      skillsArray.push(this.fb.control(skill)) 
    );
  }

  guardarCambiosEdicion(): void {
    if (this.profileEditForm.invalid) return;

    const formValue = this.profileEditForm.value;
    const payload: any = {};//objeto que va llevar lo que se va a actualizar

    // solo actualizamos si el usuario escribió algo nuevo
    if (formValue.nombre?.trim() && formValue.nombre !== this.user.nombre) {
      this.user.nombre = formValue.nombre;
      payload.nombre = this.user.nombre;
    }

    // actualizamos si es distinto de vacio 
    if (formValue.descripcion?.trim() != ""){
      this.user.descripcion = formValue.descripcion;
      payload.descripcion = this.user.descripcion;
    }
    
    // solo actualizamos skills si es desarrollador
    if (this.user.rol == "desarrollador" && formValue.skills) {
      this.user.skills = (formValue.skills as string[]).filter(s => s.trim() !== '');
      payload.skills = this.user.skills;
    }

    //console.log(payload);
      
    this._usersService.editUser(payload, this.user.rol).subscribe({
      next: (response) => {
        console.log('Usuario actualizado:', response);
        const dataActualizada = response.data;
        //actualizamos los datos en el servicio para que esten sincronizados
        this.loadUser();//actualiza observable user
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
      }
    });

    this.enEdicion = false;

  }

  get skillsControls(): FormControl[] {
    return (this.profileEditForm.get('skills') as FormArray).controls as FormControl[];
  }

  agregarSkill(): void {
    const skillsArray = this.profileEditForm.get('skills') as FormArray;
    skillsArray.push(this.fb.control('')); // input vacío
  }

  private loadUser(): void {
    // user$ ya tiene el objeto que guardamos enCognito y data de la db si hay
    this._usersService.user$.subscribe({
      next: (data) => {
        this.user = data;   //data de cognito  y DB      
      },
      error: (err) => console.error('Error al obtener usuario', err)
    });
  }

}


  

