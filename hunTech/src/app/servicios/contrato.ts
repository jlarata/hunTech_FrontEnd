import { Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ContratoResponse } from '../models/contrato';

@Injectable({
  providedIn: 'root'
})
export class ContratoService {

  //private _contratosUrl = `https://66ll3g4lt5.execute-api.us-east-1.amazonaws.com/api/`
  private _contratosUrl = `http://127.0.0.1:3000/api/`

  constructor(private _httpClient: HttpClient) { }

  getContratos(): Observable<ContratoResponse> {
    const res = this._httpClient.get<ContratoResponse>(this._contratosUrl + 'contratos');
    return res
  }
  //trae los contratos esta_ocupado = false para los devs
  getContratosLibres(): Observable<ContratoResponse> {
    const res = this._httpClient.get<ContratoResponse>(this._contratosUrl + 'contratoslibres');
    return res
  }
}