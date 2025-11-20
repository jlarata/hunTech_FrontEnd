import { Component, Input } from '@angular/core';
import { ContratoCard } from '../../models/cards/contrato-card';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Contrato } from '../../models/contrato';
import { RouterModule } from '@angular/router';
import { ContratoDetail } from '../contrato-detail/contrato-detail';
import { ContratoService } from '../../servicios/contrato';
import { Users } from '../../servicios/users';
import { LoadingService } from '../../servicios/loading-service';

@Component({
  selector: 'app-contratos',
  imports: [CommonModule, RouterModule, ContratoDetail],
  templateUrl: './contratos.html',
  styleUrl: './contratos.css'
})
export class Contratos {
  constructor(
    private _apiService: ContratoService,
    private viewportScroller: ViewportScroller,
    private _usersService: Users,
    private _loaderService: LoadingService
  ) { }

  usuario: any;
  todosLosContratos: Contrato[] = [];
  contratosCards: ContratoCard[] = [];
  contratosDisponibles: Contrato[] = [];
  contratosAsignados: Contrato[] = [];

  mostrandoContratoDetail = false;
  contratoAMostrarDetail: Contrato | undefined;

  ngOnInit(): void {
    this.mostrarTodosLosContratos();
  }

  mostrarTodosLosContratos() {
    this._loaderService.showLoader()
    this.usuario = this._usersService.getUser();
    
      //esto va a guardar el observable  al que nos vamos a suscribir
      let data;
      if (this.usuario.rol === 'desarrollador' ) {
        data = this._apiService.getContratosLibres();
      } else {
        data = this._apiService.getContratosByEmailGerente(this.usuario.email);
        
      }

      data.subscribe({
        next: (res) => {
          this.todosLosContratos = res.data;
          this.createCards(this.todosLosContratos)
        },
        error: (error: string) => {
          console.log('desde el componente error ' + error)
        },
        complete: () => {
          this._loaderService.hideLoader();
        }
      });
    
  }

  createCards = (contratos: Contrato[]): void => {
    // separar contratos en disponibles (no ocupados) y asignados (esta_ocupado === true)
    this.contratosDisponibles = [];
    this.contratosAsignados = [];
    for (let i = 0; i < contratos.length; i++) {
      const c = contratos[i];
      this.contratosCards[i] = c;
      if (c.esta_ocupado) {

        if (this.usuario.rol === 'desarrollador' &&
          c.pasante_email !== this.usuario.email) {
          continue; // si es dev y NO es esta asignado su email al contrato, no lo agregamos
        }
        this.contratosAsignados.push(c);
        
      } else {
        this.contratosDisponibles.push(c);
      }
    }
  }

  toggleMuestraContratoDetail = (): void => {
    this.mostrandoContratoDetail = !this.mostrandoContratoDetail
  }

  setContratoAMostrar = (contrato: Contrato) => {

    /* si es la primera vez que tocás el botón */
    if (this.contratoAMostrarDetail == undefined) {
      this.contratoAMostrarDetail = contrato;
      this.toggleMuestraContratoDetail();
    } else {
      /* si no es la primera vez, puede ser que */
      /* a) estás clickeando en el mismo contrato que ya se está mostrando */
      if (this.contratoAMostrarDetail.id == contrato.id) {
        this.contratoAMostrarDetail = undefined;
        this.toggleMuestraContratoDetail();
      }
      /* b) caso contrario, solo querés que cambie el contrato que muestra el detalle */
      else {
        this.contratoAMostrarDetail = contrato;
      }
    }
    this.scrollToDetail();
  }

  // recarga la lista cuando un contrato ha sido asignado en el detalle
  onContratoAssigned(contrato: Contrato | null): void {
    // volver a pedir los contratos
    this.mostrarTodosLosContratos();
    // actualizar el detalle mostrado si nos trajeron el contrato actualizado
    if (contrato) {
      this.contratoAMostrarDetail = contrato;
      this.mostrandoContratoDetail = true;
    } else {
      this.contratoAMostrarDetail = undefined;
      this.mostrandoContratoDetail = false;
    }
  }

  /* cuando se abre una tarjeta de detalle de contrato, se scrollea la view */
  scrollToDetail(): void {
    try {
      this.viewportScroller.scrollToPosition([0, 0]);
      //this.viewportScroller.scrollToPosition([0, document.body.scrollHeight]);
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}



