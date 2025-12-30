/**
 * API CLIENT ACTUALIZADO PARA INDERDB
 * 
 * CAMBIOS PRINCIPALES:
 * 1. Nuevos servicios para catálogos (tipos_documento, sexos, estados)
 * 2. Servicios actualizados que usan catalogo_items
 * 3. Respuestas con respuesta_grupos (no respuesta_formulario directo)
 * 4. JOINs a catalogo_items para obtener labels
 */

import axios, { AxiosInstance } from 'axios';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

console.log(`🚀 API Client inicializado con URL: ${API_BASE_URL}`);

// ============================================================================
// TIPOS DE RESPUESTA
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// TIPOS PARA INDERDB (11 TABLAS)
// ============================================================================

// NIVEL 1: CATÁLOGOS
export interface Catalogo {
  id: string; // UUID
  nombre: string;
  descripcion?: string;
}

export interface CatalogoItem {
  id: string; // UUID
  catalogo_id: string; // FK
  codigo?: string;
  nombre: string;
  activo: boolean;
}

// NIVEL 2: ENTIDADES PRINCIPALES
export interface Deportista {
  id: string;
  // Información básica
  tipo_documento_id: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  
  // Información adicional
  fecha_nacimiento?: string;
  edad?: number;
  sexo_id?: string;
  
  // Contacto
  email?: string;
  telefono?: string;
  direccion?: string;
  
  // Deportivo
  tipo_deporte?: string;
  deporte_id?: string;
  categoria?: string;
  
  // Estado
  estado_id: string;
  
  // Metadata
  foto?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Propiedades calculadas/relacionadas (opcionales)
  tipoDocumento?: string;
  numeroDocumento?: string;
  tipoDeporte?: string;
}

export type DeportistaCreate = Omit<Deportista, 'id' | 'created_at' | 'updated_at' | 'foto' | 'tipoDocumento' | 'numeroDocumento' | 'tipoDeporte' | 'edad'>;

export interface Formulario {
  id?: string; // UUID
  nombre: string;
  modulo: string;
  activo: boolean;
  campos?: FormularioCampo[];
}

export interface FormularioCampo {
  id?: string; // UUID
  formulario_id: string; // FK
  etiqueta: string;
  tipo_campo: string; // text, number, date, select, textarea
  requerido: boolean;
  orden?: number;
  catalogo_id?: string; // FK (opcional, para campos select)
  catalogo?: Catalogo;
}

// NIVEL 3: DOCUMENTOS
export interface HistoriaClinica {
  id?: string; // UUID
  deportista_id: string; // FK
  fecha_apertura: string; // ISO date
  estado_id: string; // FK → catalogo_items
  created_at?: string;
  // Relaciones
  deportista?: Deportista;
  estado?: CatalogoItem;
  grupos?: RespuestaGrupo[];
  respuestas?: FormularioRespuesta[];
  archivos?: ArchivoCinico[];
}

export interface Cita {
  id?: string; // UUID
  deportista_id: string; // FK
  fecha: string; // ISO date
  hora: string; // HH:MM:SS
  tipo_cita_id: string; // FK → catalogo_items
  estado_cita_id: string; // FK → catalogo_items
  observaciones?: string;
  created_at?: string;
  // Relaciones
  deportista?: Deportista;
  tipo_cita?: CatalogoItem;
  estado_cita?: CatalogoItem;
}

// NIVEL 4: RESPUESTAS
export interface RespuestaGrupo {
  id?: string; // UUID
  historia_clinica_id: string; // FK
  formulario_id: string; // FK
  created_at?: string;
  // Relaciones
  formulario?: Formulario;
  respuestas?: FormularioRespuesta[];
}

export interface FormularioRespuesta {
  id?: string; // UUID
  formulario_id: string; // FK
  historia_clinica_id: string; // FK
  campo_id: string; // FK
  valor?: string;
  created_at?: string;
  grupo_id?: string; // FK
  // Relaciones
  campo?: FormularioCampo;
}

export interface ArchivoCinico {
  id?: string; // UUID
  historia_clinica_id: string; // FK
  formulario_id?: string; // FK (opcional)
  grupo_id?: string; // FK (opcional)
  nombre_archivo?: string;
  ruta_archivo: string;
  tipo_archivo?: string;
  created_at?: string;
}

export interface PlantillaClinica {
  id?: string; // UUID
  sistema: string;
  contenido: string;
  activo: boolean;
}

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Error:', error.response?.status, error.response?.data?.error);
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// SERVICIOS: CATÁLOGOS ← NUEVO
// ============================================================================

export const catalogosService = {
  /**
   * Obtener todos los catálogos
   * GET /api/v1/catalogos
   */
  async getAll() {
    const response = await api.get<Catalogo[]>('/catalogos');
    return response.data;
  },

  /**
   * Obtener catálogo por nombre
   * GET /api/v1/catalogos/:nombre
   * 
   * Ejemplo:
   * getCatalogo('tipos_documento')
   * getCatalogo('sexos')
   * getCatalogo('estados')
   * getCatalogo('tipos_cita')
   * getCatalogo('estados_cita')
   */
  async getCatalogo(nombre: string) {
    const response = await api.get<Catalogo>(`/catalogos/${nombre}`);
    return response.data;
  },

  /**
   * Obtener items de un catálogo
   * GET /api/v1/catalogos/:nombre/items
   * 
   * Devuelve todos los CatalogoItems del catálogo
   */
  async getItems(nombreCatalogo: string) {
    const response = await api.get<CatalogoItem[]>(
      `/catalogos/${nombreCatalogo}/items`
    );
    return response.data;
  },

  /**
   * Obtener tipos de documento
   * GET /api/v1/catalogos/tipo_documento/items
   */
  async getTiposDocumento() {
    return this.getItems('tipo_documento');
  },

  /**
   * Obtener sexos
   * GET /api/v1/catalogos/sexo/items
   */
  async getSexos() {
    return this.getItems('sexo');
  },

  /**
   * Obtener estados de deportista
   * GET /api/v1/catalogos/estado_deportista/items
   */
  async getEstadosDeportista() {
    return this.getItems('estado_deportista');
  },

  /**
   * Obtener tipos de cita
   * GET /api/v1/catalogos/tipo_cita/items
   */
  async getTiposCita() {
    return this.getItems('tipo_cita');
  },

  /**
   * Obtener estados de cita
   * GET /api/v1/catalogos/estado_cita/items
   */
  async getEstadosCita() {
    return this.getItems('estado_cita');
  },

  /**
   * Obtener todos los catálogos en una sola llamada
   * Útil para inicializar la aplicación
   */
  async getAllCatalogos() {
    return Promise.all([
      this.getTiposDocumento(),
      this.getSexos(),
      this.getEstadosDeportista(),
      this.getTiposCita(),
      this.getEstadosCita(),
    ]).then(([tiposDoc, sexos, estados, tiposCita, estadosCita]) => ({
      tiposDocumento: tiposDoc,
      sexos,
      estados,
      tiposCita,
      estadosCita,
    }));
  },
};

// ============================================================================
// SERVICIOS: DEPORTISTAS (ACTUALIZADO)
// ============================================================================

export const deportistasService = {
  /**
   * Obtener todos los deportistas con JOINs a catálogos
   * GET /api/v1/deportistas
   */
  async getAll(page: number = 1, page_size: number = 10) {
    const response = await api.get<PaginatedResponse<Deportista>>(
      '/deportistas',
      {
        params: { page, page_size },
      }
    );
    return response.data;
  },

  /**
   * Obtener deportista por ID con todas las relaciones
   * GET /api/v1/deportistas/:id
   */
  async getById(id: string) {
    const response = await api.get<Deportista>(`/deportistas/${id}`);
    return response.data;
  },

  /**
   * Buscar deportistas por nombre, apellido o documento
   * GET /api/v1/deportistas/search?q=...
   */
  async search(query: string) {
    const response = await api.get<Deportista[]>('/deportistas/search', {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Crear nuevo deportista
   * POST /api/v1/deportistas
   * 
   * El body debe incluir:
   * {
   *   tipo_documento_id: "uuid-cc",  // FK → catalogo_items
   *   numero_documento: "1234567890",
   *   nombres: "Juan",
   *   apellidos: "Pérez",
   *   fecha_nacimiento: "1990-01-15",
   *   sexo_id: "uuid-masculino",      // FK → catalogo_items
   *   telefono?: "3001234567",
   *   email?: "juan@example.com",
   *   direccion?: "Calle 123",
   *   estado_id: "uuid-activo"        // FK → catalogo_items
   * }
   */
  async create(data: DeportistaCreate) {
    const response = await api.post<Deportista>('/deportistas', data);
    return response.data;
  },

  /**
   * Actualizar deportista
   * PUT /api/v1/deportistas/:id
   */
  async update(id: string, data: Partial<Deportista>) {
    const response = await api.put<Deportista>(`/deportistas/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar deportista
   * DELETE /api/v1/deportistas/:id
   */
  async delete(id: string) {
    await api.delete(`/deportistas/${id}`);
  },
};

// ============================================================================
// SERVICIOS: HISTORIAS CLÍNICAS (ACTUALIZADO)
// ============================================================================

export const historiaClinicaService = {
  /**
   * Obtener todas las historias
   * GET /api/v1/historias_clinicas
   */
  async getAll(page: number = 1, page_size: number = 10) {
    const response = await api.get<PaginatedResponse<HistoriaClinica>>(
      '/historias_clinicas',
      {
        params: { page, page_size },
      }
    );
    return response.data;
  },

  /**
   * Obtener historia por ID con todas las relaciones
   * GET /api/v1/historias_clinicas/:id
   */
  async getById(id: string) {
    const response = await api.get<HistoriaClinica>(`/historias_clinicas/${id}`);
    return response.data;
  },

  /**
   * Obtener historias de un deportista
   * GET /api/v1/deportistas/:deportista_id/historias_clinicas
   */
  async getByDeportistaId(deportistaId: string) {
    const response = await api.get<HistoriaClinica[]>(
      `/deportistas/${deportistaId}/historias_clinicas`
    );
    return response.data;
  },

  /**
   * Crear nueva historia clínica
   * POST /api/v1/historias_clinicas
   * 
   * {
   *   deportista_id: "uuid-123",
   *   fecha_apertura: "2025-01-29",
   *   estado_id: "uuid-abierta"      // FK → catalogo_items
   * }
   */
  async create(data: HistoriaClinica) {
    const response = await api.post<HistoriaClinica>(
      '/historias_clinicas',
      data
    );
    return response.data;
  },

  /**
   * Actualizar historia clínica
   * PUT /api/v1/historias_clinicas/:id
   */
  async update(id: string, data: Partial<HistoriaClinica>) {
    const response = await api.put<HistoriaClinica>(
      `/historias_clinicas/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Eliminar historia clínica
   * DELETE /api/v1/historias_clinicas/:id
   */
  async delete(id: string) {
    await api.delete(`/historias_clinicas/${id}`);
  },

  /**
   * Crear historia clínica completa con todos los 7 pasos
   * POST /api/v1/historias_clinicas/completa
   */
  async crearCompleta(data: any) {
    const response = await api.post<any>(
      '/historias_clinicas/completa',
      data
    );
    return response.data;
  },

  /**
   * Obtener historia clínica completa con todos los datos
   * GET /api/v1/historias_clinicas/{historia_id}/datos-completos
   */
  async obtenerCompleta(historiaId: string) {
    const response = await api.get<any>(
      `/historias_clinicas/${historiaId}/datos-completos`
    );
    return response.data;
  },
};

// ============================================================================
// SERVICIOS: RESPUESTA GRUPOS ← ACTUALIZADO (ANTES respuesta_formulario)
// ============================================================================

export const respuestaGruposService = {
  /**
   * Crear grupo de respuestas
   * POST /api/v1/respuesta_grupos
   * 
   * {
   *   historia_clinica_id: "uuid-historia",
   *   formulario_id: "uuid-formulario"
   * }
   */
  async create(data: RespuestaGrupo) {
    const response = await api.post<RespuestaGrupo>(
      '/respuesta_grupos',
      data
    );
    return response.data;
  },

  /**
   * Obtener grupos de respuestas de una historia
   * GET /api/v1/historias_clinicas/:id/respuesta_grupos
   */
  async getByHistoriaId(historiaId: string) {
    const response = await api.get<RespuestaGrupo[]>(
      `/historias_clinicas/${historiaId}/respuesta_grupos`
    );
    return response.data;
  },
};

// ============================================================================
// SERVICIOS: FORMULARIO RESPUESTAS ← ACTUALIZADO
// ============================================================================

export const formularioRespuestasService = {
  /**
   * Guardar respuesta de un campo
   * POST /api/v1/formulario_respuestas
   * 
   * {
   *   formulario_id: "uuid-formulario",
   *   historia_clinica_id: "uuid-historia",
   *   campo_id: "uuid-campo",
   *   valor: "el valor respondido",
   *   grupo_id: "uuid-grupo"
   * }
   */
  async create(data: FormularioRespuesta) {
    const response = await api.post<FormularioRespuesta>(
      '/formulario_respuestas',
      data
    );
    return response.data;
  },

  /**
   * Crear múltiples respuestas en un batch
   * POST /api/v1/formulario_respuestas/batch
   * 
   * Permite guardar varias respuestas de un grupo en una sola llamada
   * 
   * {
   *   grupo_id: "uuid-grupo",
   *   respuestas: [
   *     { campo: "motivo_consulta", valor: "Dolor en rodilla" },
   *     { campo: "fecha_lesion", valor: "2025-01-20" }
   *   ]
   * }
   */
  async crearMultiples(data: {
    grupo_id: string;
    respuestas: Array<{ campo: string; valor: string }>;
  }) {
    const response = await api.post<FormularioRespuesta[]>(
      '/formulario_respuestas/batch',
      data
    );
    return response.data;
  },

  /**
   * Guardar múltiples respuestas con estructura completa
   * POST /api/v1/formulario_respuestas/bulk
   * 
   * Para cuando necesitas enviar la estructura completa de FormularioRespuesta
   */
  async createBulk(respuestas: FormularioRespuesta[]) {
    const response = await api.post<FormularioRespuesta[]>(
      '/formulario_respuestas/bulk',
      { respuestas }
    );
    return response.data;
  },

  /**
   * Obtener respuestas de una historia clínica
   * GET /api/v1/historias_clinicas/:id/formulario_respuestas
   */
  async getByHistoriaId(historiaId: string) {
    const response = await api.get<FormularioRespuesta[]>(
      `/historias_clinicas/${historiaId}/formulario_respuestas`
    );
    return response.data;
  },

  /**
   * Obtener respuestas de un grupo específico
   * GET /api/v1/respuesta_grupos/:id/respuestas
   * 
   * Devuelve todas las FormularioRespuesta asociadas a un grupo
   */
  async getByGrupoId(grupoId: string) {
    const response = await api.get<FormularioRespuesta[]>(
      `/respuesta_grupos/${grupoId}/respuestas`
    );
    return response.data;
  },

  /**
   * Actualizar una respuesta existente
   * PUT /api/v1/formulario_respuestas/:id
   */
  async update(id: string, data: Partial<FormularioRespuesta>) {
    const response = await api.put<FormularioRespuesta>(
      `/formulario_respuestas/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Eliminar una respuesta
   * DELETE /api/v1/formulario_respuestas/:id
   */
  async delete(id: string) {
    await api.delete(`/formulario_respuestas/${id}`);
  },
};

// ============================================================================
// SERVICIOS: CITAS (ACTUALIZADO)
// ============================================================================

export const citasService = {
  /**
   * Obtener deportistas que tienen citas agendadas para hoy
   * GET /api/v1/citas/deportistas-con-citas-hoy
   */
  async getDeportistasConCitasHoy() {
    const response = await api.get<Deportista[]>(
      '/citas/deportistas-con-citas-hoy'
    );
    return response.data;
  },

  /**
   * Obtener todas las citas
   * GET /api/v1/citas
   */
  async getAll(page: number = 1, page_size: number = 10) {
    const response = await api.get<PaginatedResponse<Cita>>('/citas', {
      params: { page, page_size },
    });
    return response.data;
  },

  /**
   * Obtener cita por ID
   * GET /api/v1/citas/:id
   */
  async getById(id: string) {
    const response = await api.get<Cita>(`/citas/${id}`);
    return response.data;
  },

  /**
   * Obtener citas de un deportista
   * GET /api/v1/deportistas/:id/citas
   */
  async getByDeportistaId(deportistaId: string) {
    const response = await api.get<Cita[]>(
      `/deportistas/${deportistaId}/citas`
    );
    return response.data;
  },

  /**
   * Obtener próximas citas
   * GET /api/v1/deportistas/:id/citas/proximas
   */
  async getProximas(deportistaId: string) {
    const response = await api.get<Cita[]>(
      `/deportistas/${deportistaId}/citas/proximas`
    );
    return response.data;
  },

  /**
   * Crear cita
   * POST /api/v1/citas
   * 
   * {
   *   deportista_id: "uuid-123",
   *   fecha: "2025-02-01",
   *   hora: "10:30:00",
   *   tipo_cita_id: "uuid-evaluacion",    // FK → catalogo_items
   *   estado_cita_id: "uuid-pendiente",   // FK → catalogo_items
   *   observaciones?: "Traer documentos"
   * }
   */
  async create(data: Cita) {
    const response = await api.post<Cita>('/citas', data);
    return response.data;
  },

  /**
   * Actualizar cita
   * PUT /api/v1/citas/:id
   */
  async update(id: string, data: Partial<Cita>) {
    const response = await api.put<Cita>(`/citas/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar cita
   * DELETE /api/v1/citas/:id
   */
  async delete(id: string) {
    await api.delete(`/citas/${id}`);
  },
};

// ============================================================================
// SERVICIOS: ARCHIVOS CLÍNICOS
// ============================================================================

export const archivosService = {
  /**
   * Obtener archivos de una historia
   * GET /api/v1/historias_clinicas/:id/archivos_clinicos
   */
  async getByHistoriaId(historiaId: string) {
    const response = await api.get<ArchivoCinico[]>(
      `/historias_clinicas/${historiaId}/archivos_clinicos`
    );
    return response.data;
  },

  /**
   * Subir archivo
   * POST /api/v1/archivos_clinicos
   */
  async upload(data: {
    historia_clinica_id: string;
    formulario_id?: string;
    grupo_id?: string;
    archivo: File;
  }) {
    const formData = new FormData();
    formData.append('historia_clinica_id', data.historia_clinica_id);
    if (data.formulario_id) {
      formData.append('formulario_id', data.formulario_id);
    }
    if (data.grupo_id) {
      formData.append('grupo_id', data.grupo_id);
    }
    formData.append('archivo', data.archivo);

    const response = await api.post<ArchivoCinico>(
      '/archivos_clinicos',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Descargar archivo
   * GET /api/v1/archivos_clinicos/:id/descargar
   */
  async descargar(id: string) {
    const response = await api.get(`/archivos_clinicos/${id}/descargar`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Eliminar archivo
   * DELETE /api/v1/archivos_clinicos/:id
   */
  async delete(id: string) {
    await api.delete(`/archivos_clinicos/${id}`);
  },
};

// ============================================================================
// SERVICIOS: FORMULARIOS
// ============================================================================

export const formulariosService = {
  /**
   * Obtener todos los formularios
   * GET /api/v1/formularios
   */
  async getAll() {
    const response = await api.get<Formulario[]>('/formularios');
    return response.data;
  },

  /**
   * Obtener formulario con sus campos
   * GET /api/v1/formularios/:id
   */
  async getById(id: string) {
    const response = await api.get<Formulario>(`/formularios/${id}`);
    return response.data;
  },

  /**
   * Obtener formularios de un módulo
   * GET /api/v1/formularios?modulo=historia_clinica
   */
  async getByModulo(modulo: string) {
    const response = await api.get<Formulario[]>('/formularios', {
      params: { modulo },
    });
    return response.data;
  },
};

// ============================================================================
// SERVICIOS: PLANTILLAS
// ============================================================================

export const plantillasService = {
  /**
   * Obtener plantilla por sistema
   * GET /api/v1/plantillas_clinicas/:sistema
   */
  async getBySystem(sistema: string) {
    const response = await api.get<PlantillaClinica>(
      `/plantillas_clinicas/${sistema}`
    );
    return response.data;
  },

  /**
   * Obtener todas las plantillas
   * GET /api/v1/plantillas_clinicas
   */
  async getAll() {
    const response = await api.get<PlantillaClinica[]>(
      '/plantillas_clinicas'
    );
    return response.data;
  },
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch {
    return false;
  }
}

// ============================================================================
// DOCUMENTOS SERVICE
// ============================================================================

export const documentosService = {
  /**
   * Descargar historia clínica en PDF
   * GET /api/v1/documentos/{historia_id}/historia-clinica-pdf
   */
  async descargarHistoriaClinicaPdf(historiaId: string) {
    try {
      const response = await api.get(
        `/documentos/${historiaId}/historia-clinica-pdf`,
        {
          responseType: 'blob'
        }
      );
      
      // Crear un blob URL y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `historia_clinica_${historiaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error descargando PDF:', error);
      throw error;
    }
  },
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  api,
  catalogosService,
  deportistasService,
  historiaClinicaService,
  respuestaGruposService,
  formularioRespuestasService,
  citasService,
  archivosService,
  formulariosService,
  plantillasService,
  documentosService,
  healthCheck,
};