import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map,switchMap,of, tap, take,BehaviorSubject,filter } from 'rxjs';

import { User } from '../models/users/user';
import { userExistsByEmailResponse } from '../models/users/user';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class Users {
  ///lo estaba probando habia errores no pude probar si funciono el ultimo cambio

  authService = inject(Auth);
  //emailMock = "pepito@gmail.com" //este user esxiste y es un gerente
  //emailMock = "juanca@gmail.com"

  //tal vez es util
  /* private _isGerente = new BehaviorSubject<boolean>(false);
  isGerente$ = this._isGerente.asObservable();*/

  private _isExistUser = new BehaviorSubject<boolean>(false);
  isExistUser$ = this._isExistUser.asObservable();

  private _user = new BehaviorSubject<User| null>(null);
  user$ = this._user.asObservable();

  private _selectedRole = new BehaviorSubject<string | null>(null);
  selectedRole$ = this._selectedRole.asObservable();

  private _email = new BehaviorSubject<string | null>(null);
  email$ = this._email.asObservable();

  // roles como lo necesitamos para el back
  availableRoles: string[] = ['gerente', 'desarrollador'/*, 'institucion'*/];

  // mapa para mostrar roles para el user
  roleLabels: { [key: string]: string } = {
    gerente: 'Gerente',
    desarrollador: 'Desarrollador',
    //institucion: 'Institución'
  };
  //poner la ruta de la lambda cuando ande
  //private _usersUrl = `https://66ll3g4lt5.execute-api.us-east-1.amazonaws.com/api/`
  private _usersUrl = `http://127.0.0.1:3000/api/`
  
  constructor(private _httpClient: HttpClient) {
    this.checkUserExistence();
  }

  //switchmap en vez de map xq estamos usando varios observable, se suscribe al ultimo
  //map para transformar valores en un mismo stream/flujo?
  checkUserExistence(): void {
    this.authService.userData$.pipe(
      filter(userData => !!userData?.email),   // <-- no avanzar hasta tener email
      switchMap(userData => {
        const email = userData?.email;
        if (!email) {
          console.warn('No hay email disponible desde cognito');
          this._isExistUser.next(false);
          this._selectedRole.next(null);
          this._email.next(null);

          return of(null);//crea un observable con valor null/salimos del flujo
        }
        this._user.next(userData as User); //guardamos todo el userdata
        this._email.next(email);//guardamos email obtenido de cognito
        return this.getUserExistByEmail(email);//si hay email buscamos en db
      })
    ).subscribe(result => {
      if (result) {
        this._isExistUser.next(result.existe === 1);
        this._selectedRole.next(result.tabla);
        
      }
    });
  }


  // metodoo para actualizar el rol seleccionado
  setSelectedRole(role: string): void {
    console.log('Rol seleccionado:', role);
    this._selectedRole.next(role);
  }

  getUserExistByEmail(email: string): Observable<userExistsByEmailResponse> { 
    const body = { email: email }; // crear el objeto JSON para enviar como body

    return this._httpClient.post<any>(this._usersUrl + 'existusuariobyemail', body).pipe(
      tap(response => console.log('Respuesta completa (getUserExistByEmail):', response)),
      map(response => response.data as userExistsByEmailResponse), 
      tap(data => console.log('Data mapeada (getUserExistByEmail):', data)),
      take(1)
    );
  }

  //segun rol elegido crea user en tabla correspondiente
  createUserByRole(email: string, role: string): Observable<any> {
    ///agregar campos que provienen de userdata cognito nombre(nada mas por ahora)
    const url = `${this._usersUrl}${role}`;
    const body = { email, role }; 
    
    return this._httpClient.post<any>(url, body).pipe(
      tap(res => console.log('resultado de crear usuario:', res)),
      take(1)
    );
  }

  //ejecuta el post a la db para crear el user con el rol seleccionado
  saveUserWithSelectedRole(): void {
    const email = this._email.getValue(); // esto debe venir userdata.email
    const role = this._selectedRole.getValue();

    if (!role) {
      console.error('Faltan datos: no hay rol seleccionado');
      return;
    }

    if (!email) {
      console.warn('Email aún no disponible, reintentando...');
      this.checkUserExistence(); // reintentar obtener desde cognito
      return;
    }

    this.createUserByRole(email, role).subscribe({
      next: res => {
        console.log('Usuario creado!:', res);
        this._isExistUser.next(true);
      },
      error: err => {
        console.error('Error al crear usuario:', err);
      }
    });
  }

  //segun rol elegido crea user en tabla correspondiente
  editUser(user: any, role: string): Observable<any> {
    ///agregar campos que van a ser actualizados en la db
    const url = `${this._usersUrl}${role}`;
    const body = { user}; 
    
    return this._httpClient.put<any>(url, body).pipe(
      tap(res => console.log('resultado de editar usuario:', res)),
      take(1)
    );
  }

  //ok y voy a necesitar un get user 
  // que me traiga los datos actualizados de la db
  getUserFromDB(): Observable<any> {return of(null);}

}
