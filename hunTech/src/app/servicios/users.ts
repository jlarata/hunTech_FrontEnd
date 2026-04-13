import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class Users {

  private USERSURL = `https://backend-huntech.vercel.app/api/`
  private _userExists = ''
    

  constructor(private _httpClient: HttpClient) { }

  checkUserExists(email: string): Observable<any> {
    const url = `${this.USERSURL}usuario/${email}`;

    return this._httpClient.get<any>(url).pipe(
      catchError((error) => {
        // Si el servidor responde 404, devolvemos el objeto "no existe" manualmente
        // Esto lo tuve que poner porque configuramos la API para que responda con ERROR 404 si no hay usuarios con el mail.
        if (error.status === 404) {
          return of({
            data: { existe: 0, tabla: null },
            message: "El usuario no existe en la DB"
          });
        }
        // Si es otro error (500, sin internet, etc), lo lanzamos de verdad
        throw error;
      })
    );

    /* const data = this._httpClient.get<any>(url + email);
    return data */
  }


  getAllUsers(): Observable<any> {
    const url = this.USERSURL;
    const desarrolladores = this._httpClient.get<any>(url + "desarrolladores");
    return desarrolladores
  }

  getUsuarioByEmailAndTable(email: string, table: string): Observable<any> {
    const url = this.USERSURL + `usuario/${email}/${table}`
    const res = this._httpClient.get<any>(url);
    return res;
  }


  createUserByRole(email: string, role: string): Observable<any> {
  // role vendrá como 'desarrollador', 'gerente' o 'institucion'
  const url = `${this.USERSURL}${role}`;
  const body = { email: email };
  
  return this._httpClient.post<any>(url, body);
}




}