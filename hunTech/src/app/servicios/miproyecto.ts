import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Users } from './users';
import { Proyecto, ProyectoResponse } from '../models/proyectos';

@Injectable({
  providedIn: 'root',
})
export class ProyectoService {
  //private _proyectosUrl = `http://127.0.0.1:3000/api/`
  private _proyectosUrl = `https://tit7bcbkql.execute-api.us-east-1.amazonaws.com/api/`

  private _usersService = inject(Users);
  user: any;
  rol: any;

  constructor(private _httpClient: HttpClient) { }

  ngOnInit(): void {
    this.loadUser();
  }

  /* este no debería ser usado 
  getProyectos(): Observable<ProyectoResponse> {
    const res = this._httpClient.get<ProyectoResponse>(this._proyectosUrl + 'proyectos');
    return res
  } */

  getProyectoPorEmail(email:string): Observable<ProyectoResponse> {
    console.log('buscando proyecto de ',email)
    const res = this._httpClient.get<ProyectoResponse>(this._proyectosUrl + 'proyecto/' + email);
    return res
  }

  postProyecto(proyecto: Proyecto): Observable<ProyectoResponse> {
    const req = proyecto;
    const res = this._httpClient.post<ProyectoResponse>(this._proyectosUrl + 'proyecto', req)
    return res
  }

  editProyecto(proyecto: Proyecto): Observable<ProyectoResponse> {
    const req = proyecto;
    const res = this._httpClient.put<ProyectoResponse>(this._proyectosUrl+'proyecto/'+proyecto.email_gerente, proyecto)
    return res
  }

  private loadUser(): void {
    // user$ ya tiene el objeto que guardamos enCognito y data de la db si hay
    this._usersService.user$.subscribe({
      next: (data) => {
        this.user = data; //data de cognito  y DB
      },
      error: (err) => console.error('Error al obtener usuario', err),
    });

    this._usersService.selectedRole$.subscribe({
      next: (data) => {
        this.user.rol = data; //data de cognito  y DB
      },
      error: (err) => console.error('Error al obtener el rol', err),
    });

  }

}