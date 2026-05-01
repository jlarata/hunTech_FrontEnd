import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type TipoUsuarioWL = 'desarrollador' | 'gerente' | 'institucion_educativa';
export type EstadoWL = 'activo' | 'revocado' | 'usado';

export interface WhitelistEmail {
  id: string | number;
  email: string;
  tipo_usuario: TipoUsuarioWL;
  estado: EstadoWL;
  observaciones?: string | null;
  cargado_por?: string | null;
  lote_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWhitelistEmailDto {
  email: string;
  tipo_usuario: TipoUsuarioWL;
  observaciones?: string;
  cargado_por?: string;
}

export interface CreateWhitelistEmailResponse {
  message: string;
  warning?: string;
  data: WhitelistEmail;
}

export interface ListWhitelistEmailQuery {
  estado?: EstadoWL;
  tipo_usuario?: TipoUsuarioWL;
  q?: string;
  lote_id?: string;
  page?: number;
  page_size?: number;
}

export interface ListWhitelistEmailResponse {
  data: WhitelistEmail[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
  };
}

export interface UploadWhitelistEmailResponse {
  message: string;
  success: { count: number; emails: string[]; detalle?: any };
  warnings: { count: number; emails: string[]; detalle?: any };
  errores: { count: number; detalle: Array<{ fila?: number; email?: string; motivo: string }> };
}

@Injectable({ providedIn: 'root' })
export class WhitelistEmailService {
  private readonly baseUrl = 'https://backend-huntech.vercel.app/api/whitelist-email';

  constructor(private http: HttpClient) {}

  /** Alta individual (upsert) de un email. */
  create(dto: CreateWhitelistEmailDto): Observable<CreateWhitelistEmailResponse> {
    return this.http.post<CreateWhitelistEmailResponse>(this.baseUrl, dto);
  }

  /** Carga masiva por CSV. */
  uploadCsv(file: File): Observable<UploadWhitelistEmailResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadWhitelistEmailResponse>(`${this.baseUrl}/upload`, formData);
  }

  /** Listado con filtros y paginación. */
  list(query: ListWhitelistEmailQuery = {}): Observable<ListWhitelistEmailResponse> {
    let params = new HttpParams();
    if (query.estado) params = params.set('estado', query.estado);
    if (query.tipo_usuario) params = params.set('tipo_usuario', query.tipo_usuario);
    if (query.q) params = params.set('q', query.q);
    if (query.lote_id) params = params.set('lote_id', query.lote_id);
    if (query.page != null) params = params.set('page', String(query.page));
    if (query.page_size != null) params = params.set('page_size', String(query.page_size));

    return this.http.get<ListWhitelistEmailResponse>(this.baseUrl, { params });
  }
}
