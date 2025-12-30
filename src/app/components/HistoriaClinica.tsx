/**
 * HISTORIA CLÍNICA - ACTUALIZADO PARA INDERDB
 * 
 * CAMBIOS:
 * 1. Usa respuesta_grupos en lugar de respuesta_formulario directo
 * 2. Flujo: Crear respuesta_grupo → Guardar formulario_respuestas
 * 3. Cada paso crea un nuevo grupo de respuestas
 */

'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalogos } from '../contexts/CatalogosContext';
import {
  historiaClinicaService,
  respuestaGruposService,
  formularioRespuestasService,
  Deportista,
} from '../services/apiClient';

// ============================================================================
// TIPOS
// ============================================================================

interface PasoHistoria {
  numero: number;
  titulo: string;
  descripcion: string;
  datos: Record<string, any>;
  completado: boolean;
  grupoId?: string;
}

interface HistoriaClinicaProps {
  deportista: Deportista;
  onBack?: () => void;
  onSuccess?: (historiaId: string) => void;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export const HistoriaClinica: React.FC<HistoriaClinicaProps> = ({
  deportista,
  onBack,
  onSuccess,
}) => {
  const { catalogos, isLoading: catalogosLoading } = useCatalogos();
  const [pasoActual, setPasoActual] = useState(1);
  const [historiaId, setHistoriaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [pasos, setPasos] = useState<PasoHistoria[]>([
    {
      numero: 1,
      titulo: 'Motivo de Consulta',
      descripcion: 'Completa el tipo de cita y el motivo de la consulta',
      datos: {
        tipo_cita_id: '',
        motivo_consulta: '',
        enfermedad_actual: '',
      },
      completado: false,
    },
    {
      numero: 2,
      titulo: 'Antecedentes Médicos',
      descripcion: 'Registra los antecedentes personales y familiares',
      datos: {
        antecedentes_personales: '',
        antecedentes_familiares: '',
        tiene_alergias: false,
        alergias: '',
        cirugias_previas: false,
        detalle_cirugias: '',
      },
      completado: false,
    },
    {
      numero: 3,
      titulo: 'Lesiones Deportivas',
      descripcion: 'Historial de lesiones deportivas',
      datos: {
        tiene_lesiones: false,
        descripcion_lesiones: '',
        fecha_ultima_lesion: '',
        medicacion_actual: '',
      },
      completado: false,
    },
    {
      numero: 4,
      titulo: 'Signos Vitales',
      descripcion: 'Registra los signos vitales del deportista',
      datos: {
        estatura: '',
        peso: '',
        frecuencia_cardiaca: '',
        presion_arterial: '',
        frecuencia_respiratoria: '',
        temperatura: '',
        saturacion_oxigeno: '',
      },
      completado: false,
    },
    {
      numero: 5,
      titulo: 'Exploración Física',
      descripcion: 'Resultados de la exploración física',
      datos: {
        sistema_cardiovascular: '',
        sistema_respiratorio: '',
        sistema_digestivo: '',
        sistema_neurologico: '',
        sistema_musculoesqueletico: '',
      },
      completado: false,
    },
    {
      numero: 6,
      titulo: 'Diagnóstico',
      descripcion: 'Diagnóstico clínico del deportista',
      datos: {
        diagnosticos: '',
        plan_tratamiento: '',
        recomendaciones_entrenamiento: '',
      },
      completado: false,
    },
    {
      numero: 7,
      titulo: 'Resumen y Seguimiento',
      descripcion: 'Resumen final y plan de seguimiento',
      datos: {
        plan_seguimiento: '',
        observaciones: '',
        fecha_proximo_control: '',
      },
      completado: false,
    },
  ]);

  // Inicializar historia al montar
  useEffect(() => {
    const inicializarHistoria = async () => {
      try {
        setIsLoading(true);
        const estadoAbierta = catalogos.estados.find(
          (e) => e.nombre.toLowerCase() === 'abierta'
        );

        const nuevaHistoria = await historiaClinicaService.create({
          deportista_id: deportista.id,
          fecha_apertura: new Date().toISOString().split('T')[0],
          estado_id: estadoAbierta?.id || '',
        });

        setHistoriaId(nuevaHistoria.id || '');
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error al crear historia';
        setErrorMessage(msg);
        console.error('Error inicializando historia:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!catalogosLoading && catalogos.estados.length > 0) {
      inicializarHistoria();
    }
  }, [deportista.id, catalogosLoading, catalogos.estados]);

  // Manejar cambio en un campo del paso actual
  const handleCampoChange = (numeroPaso: number, campo: string, valor: any) => {
    setPasos(
      pasos.map((paso) =>
        paso.numero === numeroPaso
          ? {
              ...paso,
              datos: {
                ...paso.datos,
                [campo]: valor,
              },
            }
          : paso
      )
    );
  };

  // Guardar paso actual
  const guardarPaso = async (numeroPaso: number) => {
    if (!historiaId) {
      setErrorMessage('Historia clínica no inicializada');
      return;
    }

    try {
      setIsLoading(true);
      const paso = pasos.find((p) => p.numero === numeroPaso);
      if (!paso) return;

      // 1. Crear grupo de respuestas
      const grupo = await respuestaGruposService.create({
        historia_clinica_id: historiaId,
        formulario_id: '', // Campo requerido
      });

      // ✅ VALIDAR que grupo.id existe antes de usarlo
      if (!grupo.id) {
        throw new Error('No se pudo crear el grupo de respuestas');
      }

      // 2. Guardar respuestas del paso (ahora grupo.id es garantizado string)
      await guardarRespuestas(grupo.id, paso.datos);

      // 3. Marcar paso como completado
      setPasos(
        pasos.map((p) =>
          p.numero === numeroPaso
            ? { ...p, completado: true, grupoId: grupo.id }
            : p
        )
      );

      setSuccessMessage(`✅ Paso ${numeroPaso} guardado correctamente`);
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al guardar paso';
      setErrorMessage(msg);
      console.error('Error guardando paso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar respuestas del paso actual
  const guardarRespuestas = async (grupoId: string, data: Record<string, any>) => {
    try {
      // Formatear respuestas según el schema del backend
      const respuestasFormato = Object.entries(data).map(([campo, valor]) => ({
        campo,
        valor: String(valor),
      }));

      // Enviar al backend
      await formularioRespuestasService.crearMultiples({
        grupo_id: grupoId,
        respuestas: respuestasFormato,
      });

      toast.success('Respuestas guardadas correctamente');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al guardar respuestas';
      toast.error(msg);
      console.error('Error guardando respuestas:', error);
      throw error;
    }
  };

  // Ir al siguiente paso
  const irAlSiguiente = async () => {
    if (pasoActual < 7) {
      await guardarPaso(pasoActual);
      setPasoActual(pasoActual + 1);
    }
  };

  // Volver al paso anterior
  const irAlAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  // Completar historia
  const completarHistoria = async () => {
    try {
      setIsLoading(true);
      await guardarPaso(pasoActual);

      setSuccessMessage('✅ Historia clínica completada exitosamente');
      toast.success('Historia clínica completada');

      setTimeout(() => {
        if (onSuccess && historiaId) {
          onSuccess(historiaId);
        }
      }, 1500);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al completar historia';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const pasoActualData = pasos.find((p) => p.numero === pasoActual);
  if (!pasoActualData) return null;

  if (catalogosLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-4">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Historia Clínica (Paso {pasoActual} de 7)
        </h1>
        <p className="text-gray-600 mt-1">
          {deportista.nombres} {deportista.apellidos}
        </p>
        <p className="text-gray-600 mt-2">{pasoActualData.descripcion}</p>
      </div>

      {/* Mensajes */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Indicador de progreso */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {pasos.map((paso) => (
            <button
              key={paso.numero}
              onClick={() => setPasoActual(paso.numero)}
              disabled={isLoading}
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition ${
                paso.numero === pasoActual
                  ? 'bg-blue-600 text-white'
                  : paso.completado
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-700'
              } disabled:opacity-50`}
            >
              {paso.completado ? '✓' : paso.numero}
            </button>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(pasoActual / 7) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Formulario del paso actual */}
      <form className="space-y-6 mb-8">
        <div className="border-l-4 border-blue-600 pl-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {pasoActualData.titulo}
          </h2>

          {/* PASO 1: Motivo de Consulta */}
          {pasoActual === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cita
                </label>
                <select
                  value={pasoActualData.datos.tipo_cita_id}
                  onChange={(e) => handleCampoChange(1, 'tipo_cita_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona un tipo...</option>
                  {catalogos.tiposCita?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de Consulta
                </label>
                <textarea
                  value={pasoActualData.datos.motivo_consulta}
                  onChange={(e) => handleCampoChange(1, 'motivo_consulta', e.target.value)}
                  placeholder="Describe el motivo de la consulta..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enfermedad Actual
                </label>
                <textarea
                  value={pasoActualData.datos.enfermedad_actual}
                  onChange={(e) => handleCampoChange(1, 'enfermedad_actual', e.target.value)}
                  placeholder="Describe los síntomas actuales..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* PASO 2: Antecedentes */}
          {pasoActual === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antecedentes Personales
                </label>
                <textarea
                  value={pasoActualData.datos.antecedentes_personales}
                  onChange={(e) => handleCampoChange(2, 'antecedentes_personales', e.target.value)}
                  placeholder="Enfermedades, cirugías, medicamentos..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antecedentes Familiares
                </label>
                <textarea
                  value={pasoActualData.datos.antecedentes_familiares}
                  onChange={(e) => handleCampoChange(2, 'antecedentes_familiares', e.target.value)}
                  placeholder="Enfermedades hereditarias..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="tiene_alergias"
                  checked={pasoActualData.datos.tiene_alergias}
                  onChange={(e) => handleCampoChange(2, 'tiene_alergias', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="tiene_alergias" className="text-sm font-medium">
                  ¿Tiene alergias?
                </label>
              </div>

              {pasoActualData.datos.tiene_alergias && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe las Alergias
                  </label>
                  <input
                    type="text"
                    value={pasoActualData.datos.alergias}
                    onChange={(e) => handleCampoChange(2, 'alergias', e.target.value)}
                    placeholder="Ej: Penicilina, cacahuates..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="cirugias_previas"
                  checked={pasoActualData.datos.cirugias_previas}
                  onChange={(e) => handleCampoChange(2, 'cirugias_previas', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="cirugias_previas" className="text-sm font-medium">
                  ¿Cirugías previas?
                </label>
              </div>

              {pasoActualData.datos.cirugias_previas && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detalle de Cirugías
                  </label>
                  <textarea
                    value={pasoActualData.datos.detalle_cirugias}
                    onChange={(e) => handleCampoChange(2, 'detalle_cirugias', e.target.value)}
                    placeholder="Describe las cirugías..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {/* PASO 3: Lesiones */}
          {pasoActual === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="tiene_lesiones"
                  checked={pasoActualData.datos.tiene_lesiones}
                  onChange={(e) => handleCampoChange(3, 'tiene_lesiones', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="tiene_lesiones" className="text-sm font-medium">
                  ¿Tiene lesiones deportivas?
                </label>
              </div>

              {pasoActualData.datos.tiene_lesiones && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción de Lesiones
                    </label>
                    <textarea
                      value={pasoActualData.datos.descripcion_lesiones}
                      onChange={(e) =>
                        handleCampoChange(3, 'descripcion_lesiones', e.target.value)
                      }
                      placeholder="Describe las lesiones..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de la Última Lesión
                    </label>
                    <input
                      type="date"
                      value={pasoActualData.datos.fecha_ultima_lesion}
                      onChange={(e) =>
                        handleCampoChange(3, 'fecha_ultima_lesion', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicación Actual
                </label>
                <textarea
                  value={pasoActualData.datos.medicacion_actual}
                  onChange={(e) => handleCampoChange(3, 'medicacion_actual', e.target.value)}
                  placeholder="Medicamentos que está tomando..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* PASO 4: Signos Vitales */}
          {pasoActual === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estatura (cm)
                </label>
                <input
                  type="number"
                  value={pasoActualData.datos.estatura}
                  onChange={(e) => handleCampoChange(4, 'estatura', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  value={pasoActualData.datos.peso}
                  onChange={(e) => handleCampoChange(4, 'peso', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia Cardíaca (bpm)
                </label>
                <input
                  type="number"
                  value={pasoActualData.datos.frecuencia_cardiaca}
                  onChange={(e) => handleCampoChange(4, 'frecuencia_cardiaca', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presión Arterial (mmHg)
                </label>
                <input
                  type="text"
                  value={pasoActualData.datos.presion_arterial}
                  onChange={(e) => handleCampoChange(4, 'presion_arterial', e.target.value)}
                  placeholder="120/80"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia Respiratoria (rpm)
                </label>
                <input
                  type="number"
                  value={pasoActualData.datos.frecuencia_respiratoria}
                  onChange={(e) =>
                    handleCampoChange(4, 'frecuencia_respiratoria', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  value={pasoActualData.datos.temperatura}
                  onChange={(e) => handleCampoChange(4, 'temperatura', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saturación O₂ (%)
                </label>
                <input
                  type="number"
                  value={pasoActualData.datos.saturacion_oxigeno}
                  onChange={(e) => handleCampoChange(4, 'saturacion_oxigeno', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* PASO 5: Exploración */}
          {pasoActual === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sistema Cardiovascular
                </label>
                <textarea
                  value={pasoActualData.datos.sistema_cardiovascular}
                  onChange={(e) => handleCampoChange(5, 'sistema_cardiovascular', e.target.value)}
                  placeholder="Resultados de la exploración cardiovascular..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sistema Respiratorio
                </label>
                <textarea
                  value={pasoActualData.datos.sistema_respiratorio}
                  onChange={(e) => handleCampoChange(5, 'sistema_respiratorio', e.target.value)}
                  placeholder="Resultados de la exploración respiratoria..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sistema Neurológico
                </label>
                <textarea
                  value={pasoActualData.datos.sistema_neurologico}
                  onChange={(e) => handleCampoChange(5, 'sistema_neurologico', e.target.value)}
                  placeholder="Resultados de la exploración neurológica..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sistema Musculoesquelético
                </label>
                <textarea
                  value={pasoActualData.datos.sistema_musculoesqueletico}
                  onChange={(e) =>
                    handleCampoChange(5, 'sistema_musculoesqueletico', e.target.value)
                  }
                  placeholder="Resultados de la exploración musculoesquelética..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* PASO 6: Diagnóstico */}
          {pasoActual === 6 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnósticos
                </label>
                <textarea
                  value={pasoActualData.datos.diagnosticos}
                  onChange={(e) => handleCampoChange(6, 'diagnosticos', e.target.value)}
                  placeholder="Diagnósticos clínicos..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan de Tratamiento
                </label>
                <textarea
                  value={pasoActualData.datos.plan_tratamiento}
                  onChange={(e) => handleCampoChange(6, 'plan_tratamiento', e.target.value)}
                  placeholder="Medicamentos, terapias, etc..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recomendaciones de Entrenamiento
                </label>
                <textarea
                  value={pasoActualData.datos.recomendaciones_entrenamiento}
                  onChange={(e) =>
                    handleCampoChange(6, 'recomendaciones_entrenamiento', e.target.value)
                  }
                  placeholder="Restricciones, adaptaciones, etc..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* PASO 7: Resumen */}
          {pasoActual === 7 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan de Seguimiento
                </label>
                <textarea
                  value={pasoActualData.datos.plan_seguimiento}
                  onChange={(e) => handleCampoChange(7, 'plan_seguimiento', e.target.value)}
                  placeholder="Próximos controles, evaluaciones..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Próximo Control
                </label>
                <input
                  type="date"
                  value={pasoActualData.datos.fecha_proximo_control}
                  onChange={(e) =>
                    handleCampoChange(7, 'fecha_proximo_control', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Generales
                </label>
                <textarea
                  value={pasoActualData.datos.observaciones}
                  onChange={(e) => handleCampoChange(7, 'observaciones', e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Botones de navegación */}
      <div className="flex gap-4 justify-between">
        <button
          onClick={irAlAnterior}
          disabled={pasoActual === 1 || isLoading}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
        >
          Salir
        </button>

        {pasoActual < 7 ? (
          <button
            onClick={irAlSiguiente}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center gap-2"
          >
            {isLoading ? 'Guardando...' : 'Siguiente'}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={completarHistoria}
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-green-400"
          >
            {isLoading ? 'Completando...' : '✓ Completar Historia'}
          </button>
        )}
      </div>
    </div>
  );
};

export default HistoriaClinica;
