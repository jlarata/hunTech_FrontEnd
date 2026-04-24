import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContratoCard } from '../../models/cards/contrato-card';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contrato } from '../../models/contrato';
import { RouterModule } from '@angular/router';
import { ContratoDetail } from '../contrato-detail/contrato-detail';
import { ContratoService } from '../../servicios/contrato';
import { Users } from '../../servicios/users';
import { LoadingService } from '../../servicios/loading-service';

@Component({
  selector: 'app-contratos',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ContratoDetail],
  templateUrl: './contratos.html',
  styleUrl: './contratos.css'
})

export class Contratos {

  usuarioLogueado: any;
  perfil: any = null;
  rolActual: string = '';
  loading: boolean = false;

  todosLosContratos: Contrato[] = [];
  contratosCards: ContratoCard[] = [];
  contratosDisponibles: Contrato[] = [];
  contratosDisponiblesCopia: Contrato[] = [];//para recuperar despues de filtrar
  contratosAsignados: Contrato[] = [];
  contratosPendientes: Contrato[] = [];
  verContratosNoPostulados: boolean = false;

  mostrandoContratoDetail = false;
  contratoAMostrarDetail: Contrato | undefined;

  busqueda: string = '';
  filtroModalidad: string = '';
  filtroSeniority: string = '';
  drawerAbierto: boolean = false;

  pendingFragment?: string | undefined;

  constructor(
    private _apiService: ContratoService,
    private viewportScroller: ViewportScroller,
    private _usersService: Users,
    private _loaderService: LoadingService,
    private route: ActivatedRoute,

    private usersService: Users
  ) { }




  ngOnInit() {
    // Suscripción para tener la data siempre actualizada
    this.usersService.userProfile$.subscribe(data => {
      if (data) {
        this.perfil = { ...data }; 
        this.rolActual = data.rol || '';

        //console.log("Rol detectado en Perfil:", this.rolActual);
      }
    });
    this.mostrarTodosLosContratos();
  }

  mostrarTodosLosContratos() {
    this._loaderService.showLoader()

    //esto va a guardar el observable  al que nos vamos a suscribir
    let data;
    if (this.rolActual === 'desarrollador') {
      data = this._apiService.getContratosLibres();
    } else {
      data = this._apiService.getContratosByEmailGerente(this.perfil.email);

    }

    data.subscribe({
      next: (res) => {
        this.todosLosContratos = res.data;
        this.createCards(this.todosLosContratos)
       
        if (this.pendingFragment) {
         
          setTimeout(() => this.scrollToSection(this.pendingFragment!), 50);
          this.pendingFragment = undefined;
        }
      },
      error: (error: string) => {
        console.log('desde el componente contratos error ' + error)
      },
      complete: () => {
        this._loaderService.hideLoader();
      }
    });

  }

  filtrarContratos(): void {
    const term = this.busqueda.toLowerCase().trim();
    let filtrados = [...this.todosLosContratos];

    if (term) {
      filtrados = filtrados.filter(c =>
        c.titulo?.toLowerCase().includes(term)
      );
    }

    if (this.filtroModalidad) {
      filtrados = filtrados.filter(c =>
        c.modalidad?.toLowerCase() === this.filtroModalidad.toLowerCase()
      );
    }

    if (this.filtroSeniority) {
      filtrados = filtrados.filter(c =>
        c.seniority_deseado?.includes(this.filtroSeniority)
      );
    }

    this.createCards(filtrados);
  }

  limpiarFiltros(): void {
    this.filtroModalidad = '';
    this.filtroSeniority = '';
    this.filtrarContratos();
  }

  toggleContratosDisponiblesNoPostulados(): void {
    this.verContratosNoPostulados = !this.verContratosNoPostulados;

    if (this.verContratosNoPostulados) {
      
      this.contratosDisponibles = this.contratosDisponiblesCopia.filter(
        c => !c.postulaciones?.includes(this.perfil.email)
      );

    } else {
   
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

        if (this.rolActual === 'desarrollador' && c.pasante_email !== this.perfil.email) {
          /*         if (this.rolActual === 'desarrollador' && c.pasante_email !== this.usuario.email) { */
          continue;
        }
        /* viejo método if (this.usuario?.rol === 'desarrollador' && c.pasante_email !== this.usuario.email) {
          continue;
        } */
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

      /* const userEmail = this.usuario?.email; */
      const userEmail = this.perfil.email;
      if (userEmail && postulacionesArr.includes(userEmail)) {
        this.contratosPendientes.push(c);
      } else {
        this.contratosDisponibles.push(c);
      }
    }

    // copia para filtros
    this.contratosDisponiblesCopia = [...this.contratosDisponibles];

    // Auto-seleccionar el primer contrato disponible por defecto
    if (!this.mostrandoContratoDetail) {
      const primerContrato = this.contratosDisponibles[0] || this.contratosPendientes[0] || this.contratosAsignados[0];
      if (primerContrato) {
        this.contratoAMostrarDetail = primerContrato;
        this.mostrandoContratoDetail = true;
      }
    }
  }

  toggleMuestraContratoDetail = (): void => {
    this.mostrandoContratoDetail = !this.mostrandoContratoDetail
  }

  setContratoAMostrar = (contrato: Contrato) => {
    this.contratoAMostrarDetail = contrato;
    this.mostrandoContratoDetail = true;
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

  // scroll a una sección por id 
  scrollToSection(sectionId: string): void {
    try {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        
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



