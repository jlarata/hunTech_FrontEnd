import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

export interface Portfolio {
  id: number;
  titulo1?: string;
  titulo2?: string;
  titulo3?: string;
  descripcion1?: string;
  descripcion2?: string;
  descripcion3?: string;
  repositorio1?: string;
  repositorio2?: string;
  repositorio3?: string;
  imagenes1?: string[];   // hasta 3 URLs
  imagenes2?: string[];
  imagenes3?: string[];
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  //private apiUrl = environment.apiUrl;
  private apiUrl = 'http://127.0.0.1:3000/api/';

  constructor(private http: HttpClient) {}

  getPortfolioByEmail(email: string): Observable<{ message: string; data: Portfolio }> {
    return this.http.get<{ message: string; data: Portfolio }>(`${this.apiUrl}portfolio/${email}`);
  }

  async existsPortfolio(email: string): Promise<boolean> {
    try {
      const res = await lastValueFrom(this.getPortfolioByEmail(email));
      return res.data && (res.data.id != null || res.data.titulo1 != null);
    } catch {
      return false;
    }
  }

  // Crear/actualizar portfolio 
  createPortfolio(email: string, portfolioData: any): Observable<any> {
    // aseguro q los arrays de imágenes se envien vacios si no los paso
    const data = {
      ...portfolioData,
      imagenes1: portfolioData.imagenes1 || ['', '', ''],
      imagenes2: portfolioData.imagenes2 || ['', '', ''],
      imagenes3: portfolioData.imagenes3 || ['', '', '']
    };
    return this.http.post(`${this.apiUrl}createportfolio/${email}`, data);
  }
  
}