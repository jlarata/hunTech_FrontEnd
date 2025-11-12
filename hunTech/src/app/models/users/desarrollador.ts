import { User } from "./user";

export class Desarrollador extends User {
    //nombre: string;
    apellido?: string;
    fecha_nacimiento?: string;
    rol?: string; //validar con select en form.
    skills?: string[] //validar igualmenmte con un select?
    created_at?: string //he aprendido que es útil a veces tomar nota de la fecha de creación de registros.
}
