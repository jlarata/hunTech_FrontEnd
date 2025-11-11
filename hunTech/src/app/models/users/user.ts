export class User {
    id?: string;
    email?: string;
    descripcion?: string;
    nombre?: string;
    name?: string;
}

export interface userExistsByEmailResponse {
    message: string;
    data: {
        existe: number;      // 0 | 1
        tabla: string | null;
    };
}

