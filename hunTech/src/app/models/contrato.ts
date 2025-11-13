export class Contrato {
    id?: number;
    tipo?: string;
    titulo?: string;
    descripcion?: string;
    tiene_postulaciones?: boolean;
    postulaciones?: string[];
    esta_ocupado?: boolean;
    pasante_email?: string;
    proyecto_id?: string;
    start_date?: string;
    end_date?: string;
}

export class ContratoResponse {
    message?: string;
    count?: number;
    data: Contrato[] = [];
}