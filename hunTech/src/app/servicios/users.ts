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

  private _isExistUser = new BehaviorSubject<boolean>(false);
  isExistUser$ = this._isExistUser.asObservable();

  private _user = new BehaviorSubject<any| null>(null);
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
    institucion: 'Institución'
  };
  //poner la ruta de la lambda cuando ande
  //private _usersUrl = `https://66ll3g4lt5.execute-api.us-east-1.amazonaws.com/api/`
  private _usersUrl = `http://127.0.0.1:3000/api/`
  
  constructor(private _httpClient: HttpClient) {
    this.checkUserExistence();
  }

  setUser(user: any): void { this._user.next(user); }

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
        this._user.next(userData as User); //guardamos todo el userdata como user 
        this._email.next(email);//guardamos email obtenido de cognito
        //si hay email buscamos en db si esta registrado y en que tabla
        //este metodo solo devuelve eso 1 o 0 y tabla o null
        return this.getUserExistByEmail(email);
      })
      
    ).subscribe(result => {

      if (result?.data?.existe === 1) {
        const { tabla } = result.data; 
        this._isExistUser.next(true);
        this._selectedRole.next(tabla);
        this.cargarUserDesdeDb();

      }
    });
  }

  // metodoo para actualizar el rol seleccionado
  setSelectedRole(role: string): void {
    console.log('Rol seleccionado:', role);
    this._selectedRole.next(role);
  }

  getUserExistByEmail(email: string): Observable<userExistsByEmailResponse> {

    return this._httpClient.get<userExistsByEmailResponse>(`${this._usersUrl}user/${email}`)
  }

  //segun rol elegido crea user en tabla correspondiente
  createUserByRole(email: string, role: string): Observable<any> {
    ///agregar campos que provienen de userdata cognito nombre(nada mas por ahora)
    const url = `${this._usersUrl}${role}`;
    const body = { email, nombre: this._user.getValue()?.name ?? ''}; 
    console.log(body)
    console.log(url)
    return this._httpClient.post<any>(url, body);
    
  }

  //ejecuta el post a la db para crear el user con el rol seleccionado
  //esto esta en appp component
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
        console.log(email, role)
      },
      error: err => {
        console.error('Error al crear usuario:', err);
      }
    });
  }

  //segun rol elegido edita user en tabla correspondiente
  editUser(payload: any, role: string): Observable<any> {
    ///agregar solo campos que van a ser actualizados en la db
    let email = this._email.getValue()!;
    const url = `${this._usersUrl}usuario/${email}`;
    payload.rol = role; //agrego rol al payload
    return this._httpClient.put(url, payload);
  }

  //ok y voy a necesitar un get user 
  // que me traiga los datos actualizados de la db
  getUserByEmail(email: string, role: string): Observable<any> {
    const url = `${this._usersUrl}user/${email}/${role}`;
    return this._httpClient.get<any>(url);
  }

  private cargarUserDesdeDb(): void {
    const email = this._email.getValue();
    const role  = this._selectedRole.getValue();
    if (!email || !role) return;

    this.getUserByEmail(email, role).subscribe({
      next: res => {
        const db = res.data;          // {nombre, descripcion, skills(cadena strin separada por coma
        const skillsArray = typeof db.skills === 'string'
          ? db.skills.split(',').map((s: string) => s.trim())
          : db.skills ?? [];
    
        const cognito = this._user.getValue() ?? {}; // lo de cognito o vacio

        // mezclar: cognito con db
        const final = {
          ...cognito,//traeme todo lo de cognito
          //y voy viendo cual no es null para construir mi user
          nombre: db.nombre ?? cognito.nombre,
          descripcion: db.descripcion?? cognito.descripcion,
          skills: skillsArray|| [],
          rol: role
        };

        console.log(final.skills);
        
        this._user.next(final);       // el user resultante
      },
      error: () => {}                 // si no dejamos a cognito
    });
  }


}
