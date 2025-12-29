import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  citasService,
  Cita,
  Deportista,
} from '../../app/services/apiClient';
import { useCitas, useCatalogos } from '../../app/hooks/customHooks';
import {
  InputField,
  SelectField,
  TextAreaField,
  FormButton,
  FormAlert,
  FormGrid,
  FormSection,
} from '../components/form-fields';

// ============================================================================
// TIPOS
// ============================================================================

interface CitasManagerProps {
  deportista: Deportista;
  onSuccess?: (cita: Cita) => void;
}

interface FormCita {
  fecha: string;
  hora: string;
  tipo_cita_id: string; // FK a catalogo_items
  estado_cita_id: string; // FK a catalogo_items
  observaciones?: string;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export const CitasManager: React.FC<CitasManagerProps> = ({
  deportista,
  onSuccess,
}) => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Hooks
  const { tiposCita, estadosCita, loading: catalogsLoading } = useCatalogos();
  const {
    citas,
    proximasCitas,
    fetchCitas,
    fetchProximasCitas,
    crearCita,
    actualizarCita,
  } = useCitas(deportista.id);

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormCita>({
    defaultValues: {
      fecha: '',
      hora: '',
      tipo_cita_id: '',
      estado_cita_id: '',
      observaciones: '',
    },
  });

  // Cargar citas al montar
  useEffect(() => {
    if (deportista.id) {
      fetchCitas(deportista.id);
      fetchProximasCitas(deportista.id);
    }
  }, [deportista.id, fetchCitas, fetchProximasCitas]);

  // Establecer estado "Pendiente" por defecto
  useEffect(() => {
    if (estadosCita && estadosCita.length > 0) {
      const estadoPendiente = estadosCita.find(
        (e) => e.nombre.toLowerCase() === 'pendiente'
      );
      if (estadoPendiente) {
        setValue('estado_cita_id', estadoPendiente.id);
      }
    }
  }, [estadosCita, setValue]);

  // Manejar crear cita
  const onSubmitCita = async (data: FormCita) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (view === 'create') {
        const nuevaCita = await crearCita({
          deportista_id: deportista.id || '',
          fecha: data.fecha,
          hora: data.hora,
          tipo_cita_id: data.tipo_cita_id,
          estado_cita_id: data.estado_cita_id,
          observaciones: data.observaciones,
        });

        setSuccessMessage('✅ Cita creada exitosamente');
        reset();
        setView('list');
        fetchCitas(deportista.id || '');
        fetchProximasCitas(deportista.id || '');

        if (onSuccess) {
          onSuccess(nuevaCita);
        }
      } else if (view === 'edit' && selectedCita?.id) {
        const citaActualizada = await actualizarCita(selectedCita.id, {
          fecha: data.fecha,
          hora: data.hora,
          tipo_cita_id: data.tipo_cita_id,
          estado_cita_id: data.estado_cita_id,
          observaciones: data.observaciones,
        });

        setSuccessMessage('✅ Cita actualizada exitosamente');
        reset();
        setView('list');
        setSelectedCita(null);
        fetchCitas(deportista.id || '');
        fetchProximasCitas(deportista.id || '');
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al guardar cita';
      setErrorMessage(msg);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar editar cita
  const handleEditCita = (cita: Cita) => {
    setSelectedCita(cita);
    setValue('fecha', cita.fecha);
    setValue('hora', cita.hora);
    setValue('tipo_cita_id', cita.tipo_cita_id);
    setValue('estado_cita_id', cita.estado_cita_id);
    setValue('observaciones', cita.observaciones || '');
    setView('edit');
  };

  // Manejar cancelar cita
  const handleCancelarCita = async (citaId: string) => {
    try {
      setIsLoading(true);
      const estadoCancelada = estadosCita.find(
        (e) => e.nombre.toLowerCase() === 'cancelada'
      );

      if (!estadoCancelada) {
        throw new Error('Estado "Cancelada" no encontrado');
      }

      await actualizarCita(citaId, {
        estado_cita_id: estadoCancelada.id,
      });

      setSuccessMessage('✅ Cita cancelada');
      fetchCitas(deportista.id || '');
      fetchProximasCitas(deportista.id || '');

      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al cancelar';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear hora
  const formatHora = (hora: string) => {
    if (!hora) return '-';
    const [h, m] = hora.split(':');
    return `${h}:${m}`;
  };

  // Formatear fecha
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Color según estado
  const getEstadoColor = (estadoNombre?: string) => {
    if (!estadoNombre) return 'bg-gray-100 text-gray-700';
    const lower = estadoNombre.toLowerCase();
    if (lower === 'pendiente') return 'bg-yellow-100 text-yellow-700';
    if (lower === 'confirmada') return 'bg-green-100 text-green-700';
    if (lower === 'cancelada') return 'bg-red-100 text-red-700';
    if (lower === 'realizada') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (catalogsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-4">Cargando...</span>
      </div>
    );
  }

  // Actualizar la lógica de toggle expandedId
  const handleToggleExpanded = (citaId: string | undefined) => {
    if (!citaId) return;
    setExpandedId(expandedId === citaId ? null : citaId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Gestión de Citas
        </h1>
        <p className="text-gray-600 mt-2">
          {deportista.nombres} {deportista.apellidos}
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

      {/* Botones de navegación */}
      {view === 'list' && (
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setView('create')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Cita
          </button>
        </div>
      )}

      {/* VIEW: LISTAR CITAS */}
      {view === 'list' && (
        <div className="space-y-6">
          {/* Próximas citas */}
          {proximasCitas.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                📅 Próximas Citas ({proximasCitas.length})
              </h2>
              <div className="space-y-2">
                {proximasCitas.map((cita) => (
                  <div
                    key={cita.id}
                    className="bg-white p-4 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {formatFecha(cita.fecha)} a las {formatHora(cita.hora)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {cita.tipo_cita?.nombre || 'Cita'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(
                        cita.estado_cita?.nombre
                      )}`}
                    >
                      {cita.estado_cita?.nombre || 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Todas las citas */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Todas las Citas ({citas.length})
            </h2>

            {citas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay citas registradas
              </p>
            ) : (
              <div className="space-y-3">
                {citas.map((cita) => (
                  <div
                    key={cita.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Fila principal */}
                    <div
                      onClick={() => handleToggleExpanded(cita.id)}
                      className="p-4 bg-white hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {formatFecha(cita.fecha)} {formatHora(cita.hora)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {cita.tipo_cita?.nombre || 'Cita'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(
                            cita.estado_cita?.nombre
                          )}`}
                        >
                          {cita.estado_cita?.nombre}
                        </span>

                        <button className="p-2 hover:bg-gray-200 rounded-lg">
                          {expandedId === cita.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Fila expandida */}
                    {expandedId === cita.id && (
                      <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-4">
                        {cita.observaciones && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Observaciones:
                            </p>
                            <p className="text-gray-800">
                              {cita.observaciones}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {cita.estado_cita?.nombre?.toLowerCase() !==
                            'cancelada' && (
                            <>
                              <button
                                onClick={() => handleEditCita(cita)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                              >
                                <Edit2 className="w-4 h-4" />
                                Editar
                              </button>

                              <button
                                onClick={() => {
                                  if (cita.id) {
                                    handleCancelarCita(cita.id);
                                  }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                              >
                                <X className="w-4 h-4" />
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: CREAR/EDITAR CITA */}
      {(view === 'create' || view === 'edit') && (
        <div>
          <button
            onClick={() => {
              setView('list');
              setSelectedCita(null);
              reset();
            }}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            ← Volver
          </button>

          <FormSection
            title={view === 'create' ? 'Nueva Cita' : 'Editar Cita'}
          >
            <form onSubmit={handleSubmit(onSubmitCita)} className="space-y-6">
              <FormGrid columns={2}>
                <InputField
                  type="date"
                  label="Fecha"
                  {...register('fecha', {
                    required: 'Este campo es requerido',
                  })}
                  error={errors.fecha?.message}
                />

                <InputField
                  type="time"
                  label="Hora"
                  {...register('hora', {
                    required: 'Este campo es requerido',
                  })}
                  error={errors.hora?.message}
                />
              </FormGrid>

              <FormGrid columns={2}>
                <SelectField
                  label="Tipo de Cita"
                  {...register('tipo_cita_id', {
                    required: 'Este campo es requerido',
                  })}
                  error={errors.tipo_cita_id?.message}
                >
                  <option value="">Selecciona un tipo...</option>
                  {tiposCita.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Estado"
                  {...register('estado_cita_id', {
                    required: 'Este campo es requerido',
                  })}
                  error={errors.estado_cita_id?.message}
                >
                  <option value="">Selecciona un estado...</option>
                  {estadosCita.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </SelectField>
              </FormGrid>

              <TextAreaField
                label="Observaciones (Opcional)"
                placeholder="Notas sobre la cita..."
                rows={4}
                {...register('observaciones')}
              />

              <div className="flex gap-4 pt-4">
                <FormButton type="submit" disabled={isLoading}>
                  {isLoading
                    ? 'Guardando...'
                    : view === 'create'
                    ? 'Crear Cita'
                    : 'Guardar Cambios'}
                </FormButton>

                <button
                  type="button"
                  onClick={() => {
                    setView('list');
                    setSelectedCita(null);
                    reset();
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </FormSection>
        </div>
      )}
    </div>
  );
};

export default CitasManager;
