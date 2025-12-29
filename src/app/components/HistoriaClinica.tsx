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
import { useForm } from 'react-hook-form';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useHistoriaClinica, useCatalogos, useFormularios } from '../../app/hooks/customHooks';
import { RespuestaGrupo, FormularioRespuesta } from '../../app/services/apiClient';
import {
  InputField,
  SelectField,
  TextAreaField,
  FormButton,
} from '../components/form-fields';

// ============================================================================
// TIPOS
// ============================================================================

interface PasoHistoria {
  numero: number;
  titulo: string;
  descripcion: string;
  formularioId: string;
  datos: Record<string, any>;
  completado: boolean;
  grupo?: RespuestaGrupo;
}

interface HistoriaClinicaProps {
  deportistaId: string;
  onSuccess?: (historiaId: string) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export const HistoriaClinica: React.FC<HistoriaClinicaProps> = ({
  deportistaId,
  onSuccess,
  onError,
}) => {
  const [pasoActual, setPasoActual] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [historiaId, setHistoriaId] = useState<string | null>(null);

  const { tiposCita, estadosCita } = useCatalogos();
  const { historia, crearHistoria, crearGrupo, guardarRespuestas } =
    useHistoriaClinica();
  const { formularios } = useFormularios('historia_clinica');

  // Estados de cada paso
  const [pasos, setPasos] = useState<PasoHistoria[]>([
    {
      numero: 1,
      titulo: 'Motivo de Consulta',
      descripcion: 'Completa el tipo de cita y el motivo de la consulta',
      formularioId: '',
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
      formularioId: '',
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
      formularioId: '',
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
      formularioId: '',
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
      formularioId: '',
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
      formularioId: '',
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
      formularioId: '',
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
        const nueva = await crearHistoria({
          deportista_id: deportistaId,
          fecha_apertura: new Date().toISOString().split('T')[0],
          estado_id: 'uuid-abierta', // Debe obtenerse de catálogo
        });
        setHistoriaId(nueva.id || '');
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error al crear historia';
        setErrorMessage(msg);
        if (onError) onError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    inicializarHistoria();
  }, [deportistaId, crearHistoria, onError]);

  // Manejar cambio en un campo del paso actual
  const handleCampoChange = (
    numeroPaso: number,
    nombreCampo: string,
    valor: any
  ) => {
    setPasos(
      pasos.map((paso) =>
        paso.numero === numeroPaso
          ? {
              ...paso,
              datos: {
                ...paso.datos,
                [nombreCampo]: valor,
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
      const grupo = await crearGrupo({
        historia_clinica_id: historiaId,
        formulario_id: paso.formularioId || `formulario-paso-${numeroPaso}`,
      });

      // 2. Guardar respuestas individuales
      const respuestas: FormularioRespuesta[] = Object.entries(
        paso.datos
      ).map(([campo, valor]) => ({
        formulario_id: paso.formularioId || `formulario-paso-${numeroPaso}`,
        historia_clinica_id: historiaId,
        campo_id: `campo-${campo}`,
        valor: String(valor),
        grupo_id: grupo.id,
      }));

      await guardarRespuestas(respuestas);

      // 3. Marcar paso como completado
      setPasos(
        pasos.map((p) =>
          p.numero === numeroPaso
            ? { ...p, completado: true, grupo }
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

  // Ir al siguiente paso
  const irAlSiguiente = async () => {
    if (pasoActual < 7) {
      await guardarPaso(pasoActual);
      setPasoActual(pasoActual + 1);
    }
  };

  // Completar historia
  const completarHistoria = async () => {
    try {
      setIsLoading(true);
      await guardarPaso(pasoActual);

      setSuccessMessage('✅ Historia clínica completada exitosamente');
      if (onSuccess && historiaId) {
        onSuccess(historiaId);
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al completar';
      setErrorMessage(msg);
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const pasoActualData = pasos.find((p) => p.numero === pasoActual);
  if (!pasoActualData) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Historia Clínica (Paso {pasoActual} de 7)
        </h1>
        <p className="text-gray-600 mt-2">
          {pasoActualData.descripcion}
        </p>
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
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition ${
                paso.numero === pasoActual
                  ? 'bg-blue-600 text-white'
                  : paso.completado
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
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
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleCampoChange(1, 'tipo_cita_id', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona un tipo...</option>
                  {tiposCita.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <TextAreaField
                label="Motivo de Consulta"
                placeholder="Describe el motivo de la consulta..."
                value={pasoActualData.datos.motivo_consulta}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(1, 'motivo_consulta', e.target.value)
                }
              />

              <TextAreaField
                label="Enfermedad Actual"
                placeholder="Describe los síntomas actuales..."
                value={pasoActualData.datos.enfermedad_actual}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(1, 'enfermedad_actual', e.target.value)
                }
              />
            </div>
          )}

          {/* PASO 2: Antecedentes */}
          {pasoActual === 2 && (
            <div className="space-y-4">
              <TextAreaField
                label="Antecedentes Personales"
                placeholder="Enfermedades, cirugías, medicamentos..."
                value={pasoActualData.datos.antecedentes_personales}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(2, 'antecedentes_personales', e.target.value)
                }
              />

              <TextAreaField
                label="Antecedentes Familiares"
                placeholder="Enfermedades hereditarias..."
                value={pasoActualData.datos.antecedentes_familiares}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(2, 'antecedentes_familiares', e.target.value)
                }
              />

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={pasoActualData.datos.tiene_alergias}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleCampoChange(2, 'tiene_alergias', e.target.checked)
                  }
                />
                <label>¿Tiene alergias?</label>
              </div>

              {pasoActualData.datos.tiene_alergias && (
                <InputField
                  label="Alergias"
                  placeholder="Describe las alergias..."
                  value={pasoActualData.datos.alergias}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleCampoChange(2, 'alergias', e.target.value)
                  }
                />
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={pasoActualData.datos.cirugias_previas}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleCampoChange(2, 'cirugias_previas', e.target.checked)
                  }
                />
                <label>¿Cirugías previas?</label>
              </div>

              {pasoActualData.datos.cirugias_previas && (
                <TextAreaField
                  label="Detalle de Cirugías"
                  placeholder="Describe las cirugías..."
                  value={pasoActualData.datos.detalle_cirugias}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleCampoChange(2, 'detalle_cirugias', e.target.value)
                  }
                />
              )}
            </div>
          )}

          {/* PASO 3: Lesiones */}
          {pasoActual === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={pasoActualData.datos.tiene_lesiones}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleCampoChange(3, 'tiene_lesiones', e.target.checked)
                  }
                />
                <label>¿Tiene lesiones deportivas?</label>
              </div>

              {pasoActualData.datos.tiene_lesiones && (
                <>
                  <TextAreaField
                    label="Descripción de Lesiones"
                    placeholder="Describe las lesiones..."
                    value={pasoActualData.datos.descripcion_lesiones}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleCampoChange(3, 'descripcion_lesiones', e.target.value)
                    }
                  />

                  <InputField
                    type="date"
                    label="Fecha de la Última Lesión"
                    value={pasoActualData.datos.fecha_ultima_lesion}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleCampoChange(3, 'fecha_ultima_lesion', e.target.value)
                    }
                  />
                </>
              )}

              <TextAreaField
                label="Medicación Actual"
                placeholder="Medicamentos que está tomando..."
                value={pasoActualData.datos.medicacion_actual}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(3, 'medicacion_actual', e.target.value)
                }
              />
            </div>
          )}

          {/* PASO 4: Signos Vitales */}
          {pasoActual === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                type="number"
                label="Estatura (cm)"
                value={pasoActualData.datos.estatura}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCampoChange(4, 'estatura', e.target.value)
                }
              />
              <InputField
                type="number"
                label="Peso (kg)"
                value={pasoActualData.datos.peso}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCampoChange(4, 'peso', e.target.value)}
              />
              <InputField
                type="number"
                label="Frecuencia Cardíaca (bpm)"
                value={pasoActualData.datos.frecuencia_cardiaca}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCampoChange(4, 'frecuencia_cardiaca', e.target.value)
                }
              />
              <InputField
                type="text"
                label="Presión Arterial (mmHg)"
                placeholder="120/80"
                value={pasoActualData.datos.presion_arterial}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCampoChange(4, 'presion_arterial', e.target.value)
                }
              />
              <InputField
                type="number"
                label="Frecuencia Respiratoria (rpm)"
                value={pasoActualData.datos.frecuencia_respiratoria}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCampoChange(4, 'frecuencia_respiratoria', e.target.value)
                }
              />
              <InputField
                type="number"
                label="Temperatura (°C)"
                value={pasoActualData.datos.temperatura}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCampoChange(4, 'temperatura', e.target.value)
                }
              />
              <InputField
                type="number"
                label="Saturación O2 (%)"
                value={pasoActualData.datos.saturacion_oxigeno}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCampoChange(4, 'saturacion_oxigeno', e.target.value)
                }
              />
            </div>
          )}

          {/* PASO 5: Exploración */}
          {pasoActual === 5 && (
            <div className="space-y-4">
              <TextAreaField
                label="Sistema Cardiovascular"
                placeholder="Resultados de la exploración cardiovascular..."
                value={pasoActualData.datos.sistema_cardiovascular}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(5, 'sistema_cardiovascular', e.target.value)
                }
              />
              <TextAreaField
                label="Sistema Respiratorio"
                placeholder="Resultados de la exploración respiratoria..."
                value={pasoActualData.datos.sistema_respiratorio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(5, 'sistema_respiratorio', e.target.value)
                }
              />
              <TextAreaField
                label="Sistema Neurológico"
                placeholder="Resultados de la exploración neurológica..."
                value={pasoActualData.datos.sistema_neurologico}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(5, 'sistema_neurologico', e.target.value)
                }
              />
              <TextAreaField
                label="Sistema Musculoesquelético"
                placeholder="Resultados de la exploración musculoesquelética..."
                value={pasoActualData.datos.sistema_musculoesqueletico}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(5, 'sistema_musculoesqueletico', e.target.value)
                }
              />
            </div>
          )}

          {/* PASO 6: Diagnóstico */}
          {pasoActual === 6 && (
            <div className="space-y-4">
              <TextAreaField
                label="Diagnósticos"
                placeholder="Diagnósticos clínicos..."
                value={pasoActualData.datos.diagnosticos}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(6, 'diagnosticos', e.target.value)
                }
              />
              <TextAreaField
                label="Plan de Tratamiento"
                placeholder="Medicamentos, terapias, etc..."
                value={pasoActualData.datos.plan_tratamiento}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(6, 'plan_tratamiento', e.target.value)
                }
              />
              <TextAreaField
                label="Recomendaciones de Entrenamiento"
                placeholder="Restricciones, adaptaciones, etc..."
                value={pasoActualData.datos.recomendaciones_entrenamiento}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(
                    6,
                    'recomendaciones_entrenamiento',
                    e.target.value
                  )
                }
              />
            </div>
          )}

          {/* PASO 7: Resumen */}
          {pasoActual === 7 && (
            <div className="space-y-4">
              <TextAreaField
                label="Plan de Seguimiento"
                placeholder="Próximos controles, evaluaciones..."
                value={pasoActualData.datos.plan_seguimiento}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(7, 'plan_seguimiento', e.target.value)
                }
              />
              <InputField
                type="date"
                label="Fecha del Próximo Control"
                value={pasoActualData.datos.fecha_proximo_control}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCampoChange(7, 'fecha_proximo_control', e.target.value)
                }
              />
              <TextAreaField
                label="Observaciones Generales"
                placeholder="Notas adicionales..."
                value={pasoActualData.datos.observaciones}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCampoChange(7, 'observaciones', e.target.value)
                }
              />
            </div>
          )}
        </div>
      </form>

      {/* Botones de navegación */}
      <div className="flex gap-4 justify-between">
        <button
          onClick={() => setPasoActual(Math.max(1, pasoActual - 1))}
          disabled={pasoActual === 1 || isLoading}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
        >
          ← Anterior
        </button>

        {pasoActual < 7 ? (
          <FormButton onClick={irAlSiguiente} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Siguiente →'}
          </FormButton>
        ) : (
          <FormButton onClick={completarHistoria} disabled={isLoading}>
            {isLoading ? 'Completando...' : '✓ Completar Historia'}
          </FormButton>
        )}
      </div>
    </div>
  );
};

export default HistoriaClinica;
