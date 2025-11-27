import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    private _loaderService: LoadingService,
    private route: ActivatedRoute
  ) { }

  usuario: any;
  todosLosContratos: Contrato[] = [];
  contratosCards: ContratoCard[] = [];
  contratosDisponibles: Contrato[] = [];
  contratosDisponiblesCopia: Contrato[] = [];//para recuperar despues de filtrar
  contratosAsignados: Contrato[] = [];
  contratosPendientes: Contrato[] = [];
  verContratosNoPostulados: boolean = false;

  mostrandoContratoDetail = false;
  contratoAMostrarDetail: Contrato | undefined;

  ngOnInit(): void {
    // capture fragment (if user navigated with a fragment like #pendientes)
    this.route.fragment.subscribe((f) => {
      this.pendingFragment = f ?? undefined;
    });
    this.mostrarTodosLosContratos();
  }

  pendingFragment?: string | undefined;

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
          // if user navigated with fragment, scroll after rendering
          if (this.pendingFragment) {
            // small delay to allow DOM update
            setTimeout(() => this.scrollToSection(this.pendingFragment!), 50);
            this.pendingFragment = undefined;
          }
        },
        error: (error: string) => {
          console.log('desde el componente error ' + error)
        },
        complete: () => {
          this._loaderService.hideLoader();
        }
      });
    
  }

  toggleContratosDisponiblesNoPostulados(): void {
    this.verContratosNoPostulados = !this.verContratosNoPostulados;

    if (this.verContratosNoPostulados) {
      // mostrar solo los que no tengan mi email en array de postulantes
      this.contratosDisponibles = this.contratosDisponiblesCopia.filter(
        c => !c.postulaciones?.includes(this.usuario.email)
      );
      
    } else {
      // volver a mostrar todos
      this.contratosDisponibles = [...this.contratosDisponiblesCopia];
    }
    
    //this.createCards(contratosFiltrados);
  }

  createCards = (contratos: Contrato[]): void => {
    // separar contratos en disponibles (no ocupados), pendientes (postulaciones del usuario) y asignados
    this.contratosDisponibles = [];
    this.contratosAsignados = [];
    this.contratosPendientes = [];
    for (let i = 0; i < contratos.length; i++) {
      const c = contratos[i];
      this.contratosCards[i] = c;

      // contratos ocupados van a asignados
      if (c.esta_ocupado) {
        // los desarrolladores solo ven asignados que les pertenecen
        if (this.usuario?.rol === 'desarrollador' && c.pasante_email !== this.usuario.email) {
          continue;
        }
        this.contratosAsignados.push(c);
        continue;
      }

      // normalizar postulaciones a array de strings (puede venir como string con comas o como array)
      let postulacionesArr: string[] = [];
      if (typeof (c.postulaciones as any) === 'string') {
        postulacionesArr = ((c.postulaciones as unknown) as string).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      } else if (Array.isArray(c.postulaciones)) {
        postulacionesArr = c.postulaciones as unknown as string[];
      }

      const userEmail = this.usuario?.email;
      if (userEmail && postulacionesArr.includes(userEmail)) {
        this.contratosPendientes.push(c);
      } else {
        this.contratosDisponibles.push(c);
      }
    }

    // copia para filtros
    this.contratosDisponiblesCopia = [...this.contratosDisponibles];
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

  // scroll a una sección por id (uso scrollIntoView para comportamiento smooth)
  scrollToSection(sectionId: string): void {
    try {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // fallback
        this.viewportScroller.scrollToPosition([0, 0]);
      }
    } catch (err) {
      console.error('Error scrolling to section', err);
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



