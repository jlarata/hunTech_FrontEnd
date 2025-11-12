import { Injectable, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client'; 
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class Auth {
  //otra forma de inyectar una clase o servicio
  private oidcSecurityService = inject(OidcSecurityService);//esto injecta la libreria con todos sus metodos

  // estado autenticación en app- _isAtuthenticaded solo puede ser asignada por auth
  //observable que tomara valor true o false segun si el user esta logeado o no
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated.asObservable();

  // datos del usuario _userdata solo puede ser asignada por auth
  private _userData = new BehaviorSubject<any>(null);
  userData$ = this._userData.asObservable();

  constructor() {
    //invocar a checkAuth() al instanciarservicio
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated, userData }) => {
      //console.log('chequeando autenticacion:', isAuthenticated, userData);
      this._isAuthenticated.next(isAuthenticated);
      this._userData.next(userData);
    });
  }


  login() {
    this.oidcSecurityService.authorize();
  }


  logout() {
    const domain = 'https://us-east-1wggreinfw.auth.us-east-1.amazoncognito.com/logout';
    const logoutRedirect = window.location.origin;
    const idClient= 'j43do4joohlecc0dpm6af9in1'
    const logoutUrl = `${domain}?client_id=${idClient}&logout_uri=${encodeURIComponent(logoutRedirect)}`;
    //solo con esto no alcanza para deslogear
    window.sessionStorage.clear();
    window.localStorage.clear();
    window.location.href = logoutUrl;
  }

}
