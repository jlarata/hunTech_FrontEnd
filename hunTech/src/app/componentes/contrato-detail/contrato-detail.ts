import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Contrato } from '../../models/contrato';
import { CommonModule } from '@angular/common';
import { ContratoService } from '../../servicios/contrato';
import { Users } from '../../servicios/users';

@Component({
  selector: 'app-contrato-detail',
  imports: [CommonModule],
  templateUrl: './contrato-detail.html',
  styleUrl: './contrato-detail.css'
})
export class ContratoDetail {

  @Input() contrato?:Contrato;
  @Input() from: string = '';

  constructor(
    private route: ActivatedRoute,
    private _apiService:ContratoService,
    private _usersService:Users
  ) { }

  

}