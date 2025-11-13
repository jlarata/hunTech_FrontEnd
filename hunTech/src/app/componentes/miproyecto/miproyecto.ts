import { Component, inject } from '@angular/core';
import { Users } from '../../servicios/users';
import { ProyectoService } from '../../servicios/miproyecto';
import { Proyecto } from '../../models/proyectos';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-miproyecto',
  imports: [RouterModule],
  templateUrl: './miproyecto.html',
  styleUrl: './miproyecto.css',
})
export class Miproyecto {

  constructor(private _apiService : ProyectoService) {}
  private _usersService = inject(Users);
  user: any;
  proyecto?: Proyecto;

  async ngOnInit(): Promise<void> {
    await this.loadUser()
    this.mostrarProyecto(this.user.email)

  }


  mostrarProyecto(email:string) {
  this._apiService.getProyectoPorEmail(email).subscribe({
    next: (res) => {
      console.log(`${res.count} ${res.message}`)
      this.proyecto = res.data[0];
    },
    error: (error: string) => {
      console.log('desde el componente error '+error)
    }
  });
}
  async loadUser(): Promise<void> {
  
    // user$ ya tiene el objeto que guardamos enCognito y data de la db si hay
    this._usersService.user$.subscribe({
      next: (data) => {
        this.user = data; //data de cognito  y DB
      },
      error: (err) => console.error('Error al obtener usuario', err),
    });
  }
}