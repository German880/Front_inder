/**
 * API Client centralizado
 * Gestiona: autenticación, errores, interceptores, base URL
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ============================================================================
// TIPOS DE ERROR
// ============================================================================

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: any,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// INTERCEPTOR: Request (agregar token JWT)
// ============================================================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// INTERCEPTOR: Response (manejar errores globales)
// ============================================================================

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Redirigir a login (esto se hace en tu router)
      window.dispatchEvent(new Event('unauthorized'));
    }

    const apiError = new ApiError(
      error.response?.status || 500,
      error.response?.data || null,
      error.message || 'Error en la solicitud'
    );

    return Promise.reject(apiError);
  }
);

// ============================================================================
// SERVICIO: DEPORTISTAS
// ============================================================================

export interface Deportista {
  id: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  genero: 'masculino' | 'femenino' | 'otro';
  numeroDocumento: string;
  tipoDocumento: 'cedula' | 'pasaporte' | 'otro';
  email: string;
  telefonoContacto: string;
  alturaCm: number;
  pesoKg: number;
  tipoSangre: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeportistaDTO {
  nombreCompleto: string;
  fechaNacimiento: string;
  genero: 'masculino' | 'femenino' | 'otro';
  otroGenero?: string;
  numeroDocumento: string;
  tipoDocumento: 'cedula' | 'pasaporte' | 'otro';
  email: string;
  telefonoContacto: string;
  alturaCm: number;
  pesoKg: number;
  tipoSangre: string;
  observaciones?: string;
}

export const deportistasService = {
  /**
   * Obtener todos los deportistas
   * GET /deportistas
   */
  getAll: async (): Promise<Deportista[]> => {
    const { data } = await api.get<Deportista[]>('/deportistas');
    return data;
  },

  /**
   * Obtener un deportista por ID
   * GET /deportistas/{id}
   */
  getById: async (id: string): Promise<Deportista> => {
    const { data } = await api.get<Deportista>(`/deportistas/${id}`);
    return data;
  },

  /**
   * Crear un nuevo deportista
   * POST /deportistas
   */
  create: async (deportista: CreateDeportistaDTO): Promise<Deportista> => {
    const { data } = await api.post<Deportista>('/deportistas', deportista);
    return data;
  },

  /**
   * Actualizar un deportista
   * PUT /deportistas/{id}
   */
  update: async (id: string, deportista: Partial<CreateDeportistaDTO>): Promise<Deportista> => {
    const { data } = await api.put<Deportista>(`/deportistas/${id}`, deportista);
    return data;
  },

  /**
   * Eliminar un deportista
   * DELETE /deportistas/{id}
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/deportistas/${id}`);
  },

  /**
   * Buscar deportistas
   * GET /deportistas/search?q=query
   */
  search: async (query: string): Promise<Deportista[]> => {
    const { data } = await api.get<Deportista[]>('/deportistas/search', {
      params: { q: query },
    });
    return data;
  },
};

// ============================================================================
// SERVICIO: HISTORIA CLÍNICA
// ============================================================================

export interface AntecedentePersonal {
  codigo: string;
  nombre: string;
  observacion?: string;
}

export interface AntecedenteFamiliar {
  codigo: string;
  nombre: string;
  familiar: string;
  observacion?: string;
}

export interface HistoriaClinica {
  id: string;
  deportistaId: string;
  
  // Antecedentes
  antecedentesPersonales: AntecedentePersonal[];
  antecedentesFamiliares: AntecedenteFamiliar[];
  vacunas: string[];
  alergias: AntecedentePersonal[];
  
  // Examen físico
  presionArterial: string;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
  temperatura: number;
  
  // Diagnóstico
  diagnosticos: Array<{ codigo: string; nombre: string }>;
  
  // Plan de tratamiento
  planTratamiento: string;
  observaciones?: string;
  
  createdAt: string;
  updatedAt: string;
}

export const historiaClinicaService = {
  /**
   * Obtener historia clínica de un deportista
   * GET /deportistas/{id}/historia-clinica
   */
  getByDeportista: async (deportistaId: string): Promise<HistoriaClinica> => {
    const { data } = await api.get<HistoriaClinica>(
      `/deportistas/${deportistaId}/historia-clinica`
    );
    return data;
  },

  /**
   * Crear o actualizar historia clínica
   * POST/PUT /deportistas/{id}/historia-clinica
   */
  save: async (
    deportistaId: string,
    historiaClinica: Partial<HistoriaClinica>
  ): Promise<HistoriaClinica> => {
    const { data } = await api.post<HistoriaClinica>(
      `/deportistas/${deportistaId}/historia-clinica`,
      historiaClinica
    );
    return data;
  },
};

// ============================================================================
// SERVICIO: AUTENTICACIÓN (EJEMPLO)
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    rol: 'medico' | 'admin' | 'entrenador';
  };
}

export const authService = {
  /**
   * Login
   * POST /auth/login
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Guardar token
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  /**
   * Verificar si está autenticado
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// ============================================================================
// MANEJO CENTRALIZADO DE ERRORES
// ============================================================================

/**
 * Función auxiliar para formatear errores de API
 * @param error Error de axios
 * @returns Mensaje de error formateado
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Error de la API con detalles
    if (error.data?.detail) {
      return error.data.detail;
    }
    if (error.data?.message) {
      return error.data.message;
    }
    return `Error ${error.status}: ${error.message}`;
  }

  if (axios.isAxiosError(error)) {
    // Error de axios
    return error.message || 'Error en la solicitud';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}

/**
 * Función para mostrar notificaciones de error
 * @param error Error a mostrar
 */
export function showErrorNotification(error: unknown): void {
  const message = getErrorMessage(error);
  
  // Aquí integrar con tu sistema de notificaciones (toast, snackbar, etc)
  console.error('Error:', message);
  
  // Ejemplo con Sonner:
  // toast.error(message);
}

/**
 * Retry logic para solicitudes fallidas
 * @param fn Función a ejecutar
 * @param retries Número de intentos
 * @param delay Delay entre intentos en ms
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
}

export default api;
