import { Component,inject } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, FormControl, FormArray } from '@angular/forms';

import { Users} from './../../servicios/users';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  user: any;
  rol:any;
  emailUrl: string | null = null;

  profileEditForm = this.fb.group({
    nombre:"",
    descripcion: "",
    skills: this.fb.array<string>([])
  });

  enEdicion = false; // mostrar formulario o tarjeta

  ngOnInit(): void {
    //this.loadUserAcount();
    // viene email por URL
    this.emailUrl = this.route.snapshot.paramMap.get('email');

    if (this.emailUrl) {
      // VER PERFIL DE ORIGEN MAIL DE POSTULACIONES → siempre dev(por ahora)
      this.loadUserDev(this.emailUrl, 'desarrollador');
      console.log("loaduserDev email: ", this.emailUrl );
    
    } else {
      // PERFIL PROPIO → usamos el rol que ya tenemos guardado
      this.loadUserAcount();
    }
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

      
    this._usersService.editUser(payload, this.user.rol).subscribe({
      next: (response) => {
        //actualizamos los datos en el servicio para que esten sincronizados
        this.loadUserAcount();//actualiza observable user
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

  private loadUserAcount(): void {
    // user$ ya tiene el objeto que guardamos enCognito y data de la db si hay
    this._usersService.user$.subscribe({
      next: (data) => {
        this.user = data;   //data de cognito  y DB      
      },
      error: (err) => console.error('Error al obtener usuario', err)
    });
  }

  loadUserDev(email?: string, rol?:string): void {

    if (!email) return;

    this._usersService.getUserByEmail(email, rol!).subscribe({
      next: (response) => {
        this.user = response.data;

        //normalizar skills a array
        const skillsArray = typeof this.user.skills === 'string'
          ? this.user.skills.split(',').map((s: string) => s.trim())
          : this.user.skills ?? [];
        
        this.user.skills = skillsArray;
        this.user.rol = rol;
        console.log("loaduserDev: ", this.user );
      },
      error: (err) => console.error('Error al obtener usuario dev', err)
    });
  }

  volverContratos():void {
    this.router.navigate(['/contratos']);
  }

}
