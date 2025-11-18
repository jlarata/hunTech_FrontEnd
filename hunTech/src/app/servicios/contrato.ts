import { Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Contrato, ContratoResponse } from '../models/contrato';

@Injectable({
  providedIn: 'root'
})
export class ContratoService {

  //private _contratosUrl = `https://66ll3g4lt5.execute-api.us-east-1.amazonaws.com/api/`
  //private _contratosUrl = `http://127.0.0.1:3000/api/`
  private _contratosUrl = `https://tit7bcbkql.execute-api.us-east-1.amazonaws.com/api/`

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

  //trae los contratos por email gerente
  getContratosByEmailGerente(emailGerente:string): Observable<ContratoResponse> {
    const res = this._httpClient.get<ContratoResponse>(`${this._contratosUrl}contratos/${emailGerente}`);
    return res
  }
  postContrato(contrato: Contrato): Observable<ContratoResponse> {
    console.log('intento crear contrato ',contrato)  
    const req = contrato;
      const res = this._httpClient.post<ContratoResponse>(this._contratosUrl + 'contrato', req)
      return res
    }

  postularseAContrato(id:string, email:string): Observable<ContratoResponse> {
    //console.log('intentando update de contrato id ',id.toString(), 'sumando la postulación de ',email )
    const res = this._httpClient.put<ContratoResponse>(this._contratosUrl + 'contrato/' + id, {"postulaciones" : email});
    return res
  }

  asignarPostulante(idContrato: string, email: string): Observable<ContratoResponse> {
  const body = { email: email };
  return this._httpClient.put<ContratoResponse>(
    `${this._contratosUrl}contrato/asignar/${idContrato}`,
    body
  );
}

}