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
  private apiUrl = environment.apiUrl;
  //private apiUrl = 'http://127.0.0.1:3000/api/';
  private bucketUrl = environment.bucketUrl;

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
    // Asegurar que cada array de imágenes tenga exactamente 3 elementos (strings vacíos si faltan)
    const data = {
      ...portfolioData,
      imagenes1: this.normalizeImagesArray(portfolioData.imagenes1),
      imagenes2: this.normalizeImagesArray(portfolioData.imagenes2),
      imagenes3: this.normalizeImagesArray(portfolioData.imagenes3)
    };
    return this.http.post(`${this.apiUrl}createportfolio/${email}`, data);
  }

  private normalizeImagesArray(images: string[] = []): string[] {
    const arr = images ? [...images] : [];
    while (arr.length < 3) arr.push('');
    return arr.slice(0, 3);
  }

  //  imagen a S3 y devolver URL pública
  async uploadImage(file: File): Promise<string> {
    const key = `portfolios/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const uploadUrl = `${this.bucketUrl}/${key}`;
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    });
    
    if (!response.ok) {
      throw new Error(`Error al subir imagen: ${response.statusText}`);
    }
    return uploadUrl; // URL pública de la imagen
  }

  
}