import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContratoService } from '../../servicios/contrato';
import { Contrato } from '../../models/contrato';


@Component({
  selector: 'app-formcreatecontract',
  imports: [FormsModule, CommonModule],
  templateUrl: './formcreatecontract.html',
  styleUrl: './formcreatecontract.css',
})
export class Formcreatecontract {

  constructor(
    private _apiService: ContratoService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  espost = false;
  esedit = true;

  contrato: Contrato = {
    tipo: "",
    titulo: "",
    descripcion: "",
    tiene_postulaciones: false,
    //postulaciones: [""],
    esta_ocupado: false,
    pasante_email: "",
    proyecto_id: "",
    start_date: "",
    end_date: ""
  }

  ngOnInit(): void {
    const pid = this.route.snapshot.paramMap.get('project_id')
    this.contrato.proyecto_id = pid!
  }

    // probablemente por project id const email = this.route.snapshot.paramMap.get('email');
    //console.log(email)
    /* if (email) {
      // Llamás al servicio para traer el proyecto y precargarlo
      this._apiService.getProyectoPorEmail(email).subscribe({
        next : (res) => {
          console.log("listo para editar proyecto", this.proyecto)
          this.proyecto = res.data[0]
        }, 
        error: (err) => console.error('Error al cargar proyecto', err)
      });
    } else {
      this.espost = true;
      this.esedit = false;
    } */
    
  enviar(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const dataParaEnviar = {
      ...this.contrato,
    };
    

    this._apiService.postContrato(dataParaEnviar).subscribe({
      next: (res) => {
        console.log(res.message)
        this.router.navigate(['/miproyecto']);
      },
      error: (error:string) => {
        console.log(error)
      }
    });
   
  }

  /* editar(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const dataParaEnviar = {
      ...this.proyecto,
    };

    this._apiService.editProyecto(this.proyecto).subscribe({
      next: (res) => {
        console.log(res.message)
        this.router.navigate(['/miproyecto']);

      },
      error: (error: string) => {
        console.log(error)
      }
    });


    //this.formularioEnviado = true;
    //form.resetForm()
    //this.formularioEnviado = false;

  }
 */

  /* private loadUser(): void {
    // user$ ya tiene el objeto que guardamos enCognito y data de la db si hay
    this._usersService.user$.subscribe({
      next: (data) => {
        this.proyecto.email_gerente = data.email;   //data de cognito  y DB      
      },
      error: (err) => console.error('Error al obtener usuario', err)
    });
  } */

}