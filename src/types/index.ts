export type Rol = 'admin' | 'encargado' | 'postulante';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  username: string;
  rol: Rol;
  activo?: boolean;
  expiresAt?: string | null;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
  expiresAt?: string | null;
}

export interface Proceso {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: string;
}

export interface Etapa {
  id: number;
  procesoId: number;
  orden: number;
  nombre: string;
  tipo: 'cv' | 'entrevista' | 'tecnica' | 'otro';
  descripcion: string | null;
}

export interface Entrevista {
  id: number;
  etapaId: number;
  fechaHora: string;
  descripcion: string | null;
}

export interface DatosCV {
  universidad: string | null;
  profesion: string | null;
  fechaTitulo: string | null;
  extraidoPor?: string;
}

export interface Postulacion {
  id: number;
  procesoId: number;
  estado: string;
  etapaActual: {
    id: number;
    nombre: string;
    tipo: string;
    orden: number;
  } | null;
  proceso: { nombre: string };
  postulante?: {
    nombre: string;
    apellido: string;
    dni: string | null;
    username: string;
  };
  datosCV: DatosCV | null;
  entrevistas?: Entrevista[];
  createdAt: string;
}