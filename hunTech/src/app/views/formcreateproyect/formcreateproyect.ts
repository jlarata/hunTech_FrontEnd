import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Proyecto } from '../../models/proyectos';


@Component({
  selector: 'app-formcreateproyect',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './formcreateproyect.html',
  styleUrl: './formcreateproyect.css',
})
export class Formcreateproyect {
  proyecto: Proyecto = {
    nombre: '',
    description: '',
    info_link: '',
    buscando_devs: true,//siempre arranca true
    email_gerente: '', // hay que llamar al servicio de usuarios y pedirle el email usando la sesión
                    //es lo mismo que hacemos en varios otros componentes, como en contratos o perfil.
                    // ese es el email que tiene que ir en el form
  }


/* PARA QUE ESTO ANDE ADEMÁS DE LLAMAR AL SERVICIO DE PROYECTOS Y CREAR UNO NUEVO, LUEGO DE ESO HAY UQE 
PEGARLE UNA REFRESCADA A LA APP PARA QUE VUELVA A PROYECTOS. */

  formularioEnviado = false;

  enviar(form: NgForm) {
    if (form.invalid) {
      return;
    }

    console.log('Formulario enviado: ', form.value)

    this.formularioEnviado = true;


    //ESTO NATURALMENTE NO VA, HAY QUE CAMBIARLO POR UNA LLAMADA AL SERVICIO DE PROYECTOS
    // Y EN EL SERVICIO HAY QUE LLAMAR AL BACKEND Y PEGARLE AL CREATEPROYECT QUE YA FUNCIONA PERFECTO. 
    // SIGAN EL POSTMAN
    setTimeout(()=> {
      form.resetForm()
      this.formularioEnviado = false;
      console.log('Formulario reseteado.', form.value)

    }, 1500)
  }

}