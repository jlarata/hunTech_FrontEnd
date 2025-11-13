import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Proyecto } from '../../models/proyectos';
import { Users } from '../../servicios/users';
import { ProyectoService } from '../../servicios/miproyecto';
import { Router } from '@angular/router';


@Component({
  selector: 'app-formcreateproyect',
  imports: [FormsModule, CommonModule],
  templateUrl: './formcreateproyect.html',
  styleUrl: './formcreateproyect.css',
})
export class Formcreateproyect {

  constructor(
    private _apiService: ProyectoService,
    private router: Router
  ) { }

  private _usersService = inject(Users);

  proyecto: Proyecto = {
    nombre: '',
    description: '',
    info_link: '',
    buscando_devs: true,//siempre arranca true
    email_gerente: ''
  }

  ngOnInit(): void {
    this.loadUser();
  }
  formularioEnviado = false;

  enviar(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const dataParaEnviar = {
      ...this.proyecto,
    };

    this._apiService.postProyecto(this.proyecto).subscribe({
      next: (res) => {
        console.log(res.message)
        this.router.navigate(['/miproyecto']);

      },
      error: (error: string) => {
        console.log(error)
      }
    });

    /* .subscribe({
      next: (res:any) => {
      console.log(res)
        //console.log(res.message)
    },
    error: (error: string) => {
      console.log(error)
    }
  }) */;


    //this.formularioEnviado = true;
    //form.resetForm()
    //this.formularioEnviado = false;

  }



  private loadUser(): void {
    // user$ ya tiene el objeto que guardamos enCognito y data de la db si hay
    this._usersService.user$.subscribe({
      next: (data) => {
        this.proyecto.email_gerente = data.email;   //data de cognito  y DB      
      },
      error: (err) => console.error('Error al obtener usuario', err)
    });
  }

}