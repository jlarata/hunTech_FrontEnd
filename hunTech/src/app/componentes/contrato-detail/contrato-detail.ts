import { Component, EventEmitter, Input, model, Output } from '@angular/core';
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

  @Input() contrato?:Contrato;
  //@Output() contratoChange = new EventEmitter<Contrato>;

  @Input() email:string | undefined;
  @Input() rol:string | undefined;
  
  

  constructor(
    private route: ActivatedRoute,
    private _apiService:ContratoService,
    private router:Router
  ) { }

  ngOnInit(): void {
  
  }

  postularse(contrato: Contrato, email: string) {    
    
    let postulacion = this._apiService.postularseAContrato(contrato.id!.toString(), email)

    //postulacion.subscribe({
     /* next: (res) => {
        //this.contratoChange.emit(this.contrato)
        //comento esto por que no veo que este haciendoo nada
        //this.ngOnInit()
        //this.contratoUpdated=res.data[0];
        this.contrato=res.data;


      },
      error: (error: string) => {
        console.log(error)
      }
    });*/
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

}