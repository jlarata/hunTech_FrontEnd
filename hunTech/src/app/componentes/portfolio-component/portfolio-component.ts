import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Portfolio, PortfolioService } from '../../servicios/portfolioService';
import { AlertService } from '../../servicios/alertService';

@Component({
  selector: 'app-portfolio-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolio-component.html',
  styleUrl: './portfolio-component.css',
})
export class PortfolioComponent implements OnInit{
  @Input() emailDesarrollador: string = '';

  portfolio: Portfolio | null = null;
  mostrarFormulario = false;
  cargando = false;
  guardando = false;
  formData: any = {};

  constructor(
    private portfolioService: PortfolioService,
    private alertService: AlertService
  ) {}

  async ngOnInit() {
    if (!this.emailDesarrollador) return;
    await this.cargarPortfolio();
  }

  async cargarPortfolio() {
    this.cargando = true;
    try {
      const res = await this.portfolioService.getPortfolioByEmail(this.emailDesarrollador).toPromise();
      if (res?.data && (res.data.id || res.data.titulo1)) {
        this.portfolio = res.data;
      } else {
        this.portfolio = null;
      }
    } catch (error) {
      this.portfolio = null;
    } finally {
      this.cargando = false;
    }
  }

  editarPortfolio() {
    this.formData = {
      titulo1: this.portfolio?.titulo1 || '',
      descripcion1: this.portfolio?.descripcion1 || '',
      repositorio1: this.portfolio?.repositorio1 || '',
      titulo2: this.portfolio?.titulo2 || '',
      descripcion2: this.portfolio?.descripcion2 || '',
      repositorio2: this.portfolio?.repositorio2 || '',
      titulo3: this.portfolio?.titulo3 || '',
      descripcion3: this.portfolio?.descripcion3 || '',
      repositorio3: this.portfolio?.repositorio3 || '',
      // imagenes se enviarán vacías (el servicio las inicializa como [])
    };
    this.mostrarFormulario = true;
  }

  async guardarPortfolio() {
    if (!this.formData.titulo1?.trim()) {
      this.alertService.warning('El primer proyecto debe tener un título');
      return;
    }

    this.guardando = true;
    try {
      // Los campos imagenes no se incluyen en formData, pero el servicio agregará arrays vacíos
      await this.portfolioService.createPortfolio(this.emailDesarrollador, this.formData).toPromise();
      this.alertService.success('Portfolio guardado correctamente');
      await this.cargarPortfolio();
      this.mostrarFormulario = false;
    } catch (error: any) {
      this.alertService.error(error?.error?.error || 'Error al guardar el portfolio');
    } finally {
      this.guardando = false;
    }
  }

  cancelarEdicion() {
    this.mostrarFormulario = false;
    this.formData = {};
  }

}
