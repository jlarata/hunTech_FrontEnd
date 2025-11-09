import { Injectable } from '@angular/core';
import { Contrato } from '../models/contrato';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContratoService {

  /* private contratosUrl = 'api/contratos'; */
  private contratosUrl = 'api/contratos';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  getContratos(): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(this.contratosUrl)
      .pipe(
        tap(_ => this.log('fetched contratos')),
        catchError(this.handleError<Contrato[]>('getContratos', []))
      )
  }


  private log(message: string) {
    console.log(`Contratos Service: ${message}`)
  }

  /**
* Handle Http operation that failed.
* Let the app continue.
*
* @param operation - name of the operation that failed
* @param result - optional value to return as the observable result
*/
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}