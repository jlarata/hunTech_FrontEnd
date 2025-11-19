import { Component, Input } from '@angular/core';
import { ContratoCard } from '../../models/cards/contrato-card';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Contrato } from '../../models/contrato';
import { RouterModule } from '@angular/router';
import { ContratoDetail } from '../contrato-detail/contrato-detail';
import { ContratoService } from '../../servicios/contrato';
import { Users } from '../../servicios/users';

@Component({
  selector: 'app-contratos',
  imports: [CommonModule, RouterModule, ContratoDetail],
  templateUrl: './contratos.html',
  styleUrl: './contratos.css'
})
export class Contratos {
  @Input() from: string = '';
  constructor(
    private _apiService: ContratoService,
    private viewportScroller: ViewportScroller,
    private _usersService: Users) { }

  usuario: any;
  todosLosContratos: Contrato[] = [];
  contratosCards: ContratoCard[] = [];

  mostrandoContratoDetail = false;
  contratoAMostrarDetail: Contrato | undefined;

  ngOnInit(): void {
    this.mostrarTodosLosContratos();
  }

  mostrarTodosLosContratos() {
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
        }
      });
    
  }

  createCards = (contratos: Contrato[]): void => {
    for (let i: number = 0; i < contratos.length; i++) {
      this.contratosCards[i] = contratos[i]
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



