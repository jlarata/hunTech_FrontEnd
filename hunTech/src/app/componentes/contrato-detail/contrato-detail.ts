import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Contrato } from '../../models/contrato';
import { CommonModule } from '@angular/common';
import { ContratoService } from '../../servicios/contrato';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contrato-detail',
  imports: [CommonModule],
  templateUrl: './contrato-detail.html',
  styleUrl: './contrato-detail.css'
})
export class ContratoDetail {

  @Input() contrato?: Contrato;
  //@Output() contratoChange = new EventEmitter<Contrato>;

  @Output() contratoAssigned = new EventEmitter<Contrato | null>();

  @Input() email: string | undefined;
  @Input() rol: string | undefined;

  modalVisible = false;
  emailSeleccionado: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private _apiService: ContratoService,
    private router: Router
  ) { }

  abrirModal(email: string) {
    this.emailSeleccionado = email;
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.emailSeleccionado = null;
  }

  ngOnInit(): void {
  
  }

  asignarPostulante() {
    if (!this.emailSeleccionado || !this.contrato?.id) return;
console.log("Email que envío:", this.emailSeleccionado);

    this._apiService.asignarPostulante(
      this.contrato.id.toString(),
      this.emailSeleccionado
    )
      .subscribe({
        next: (res) => {
          this.contrato = res.data[0];
          // emitir evento para que el componente padre (lista) pueda refrescar
          this.contratoAssigned.emit(this.contrato ?? null);
          this.cerrarModal();
        },
        error: (e) => console.log(e)
      });
  }

  postularse(contrato: Contrato, email: string) {

    let postulacion = this._apiService.postularseAContrato(contrato.id!.toString(), email);

    postulacion.subscribe({
      next: () => {
          // una vez que la postulacion OK
          //console.log("contrato: ", contrato);
          
          let updateContrato:Contrato = {
            id: contrato.id,
            tiene_postulaciones: true
          };

          //console.log("Contrato to update: ", updateContrato);
          //actualizar el contrato para setear tiene_postulaciones = true
          this._apiService.updateContrato(updateContrato)
          .subscribe({
            next: res => (this.contrato = res.data),
            error: err => console.error('Error al actualizar contrato:', err)
          });
        },
        error: (err) => console.error("Error al postular: ", err)
    });

  }

  get postulacionesNormalizadas(): string[] {
    const raw = this.contrato?.postulaciones as unknown as string;

    if (!raw) return [];

    return raw
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  verPerfilPostulante():void {
    this.router.navigate(['/profile', this.emailSeleccionado]);
  }

}