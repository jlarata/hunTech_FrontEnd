export class User {
    id?: string;
    email?: string;
    descripcion?: string;
    nombre?: string;
    name?: string;
}

export class userExistsByEmailResponse{
    existe?: number; // 0 o 1
    tabla: string | null = ""; // nombre de  tabla si existe, null si no
} 

