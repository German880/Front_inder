/**
 * REGISTRO DEPORTISTA - ACTUALIZADO PARA INDERDB
 * 
 * CAMBIOS:
 * 1. Usa useCatalogos() para cargar tipos_documento, sexos, estados
 * 2. Los selects usan catalogo_items (UUIDs) en lugar de valores hardcodeados
 * 3. Envía tipo_documento_id, sexo_id, estado_id como UUIDs al backend
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { deportistasService, Deportista } from '../../app/services/apiClient';
import { useCatalogos } from '../../app/hooks/customHooks';
import {
  InputField,
  SelectField,
  TextAreaField,
  FormButton,
} from '../components/form-fields';
// ============================================================================
// TIPOS
// ============================================================================

interface RegistroDeportistaForm {
  tipo_documento_id: string; // UUID de catalogo_items
  numero_documento: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo_id: string; // UUID de catalogo_items
  telefono?: string;
  email?: string;
  direccion?: string;
  estado_id: string; // UUID de catalogo_items (por defecto "activo")
}

interface RegistroDeportistaProps {
  onSuccess?: (deportista: Deportista) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export const RegistroDeportista: React.FC<RegistroDeportistaProps> = ({
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Cargar catálogos
  const { tiposDocumento, sexos, estados, loading: catalogsLoading } =
    useCatalogos();

  // Inicializar formulario
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RegistroDeportistaForm>({
    defaultValues: {
      tipo_documento_id: '',
      numero_documento: '',
      nombres: '',
      apellidos: '',
      fecha_nacimiento: '',
      sexo_id: '',
      telefono: '',
      email: '',
      direccion: '',
      estado_id: '', // Se establecerá en "activo" por defecto
    },
    mode: 'onChange',
  });

  // Establecer estado "activo" por defecto cuando carguen los estados
  React.useEffect(() => {
    if (estados && estados.length > 0) {
      const estadoActivo = estados.find(
        (e) => e.nombre.toLowerCase() === 'activo'
      );
      if (estadoActivo) {
        setValue('estado_id', estadoActivo.id);
      }
    }
  }, [estados, setValue]);

  // Manejar submit
  const onSubmit = async (data: RegistroDeportistaForm) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Validar que los UUIDs estén seleccionados
      if (!data.tipo_documento_id) {
        throw new Error('Por favor selecciona un tipo de documento');
      }
      if (!data.sexo_id) {
        throw new Error('Por favor selecciona un sexo');
      }
      if (!data.estado_id) {
        throw new Error('Por favor selecciona un estado');
      }

      // Crear deportista
      const nuevoDeportista = await deportistasService.create(data);

      setSuccessMessage(
        `✅ Deportista ${nuevoDeportista.nombres} ${nuevoDeportista.apellidos} registrado exitosamente`
      );

      // Reset formulario
      reset();
      setValue('estado_id', estados.find((e) => e.nombre === 'Activo')?.id || '');

      // Callback
      if (onSuccess) {
        onSuccess(nuevoDeportista);
      }

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al registrar deportista';
      setErrorMessage(errorMsg);
      console.error('Error registrando deportista:', error);

      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mientras cargan catálogos
  if (catalogsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-4">Cargando catálogos...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Registro de Deportista
        </h1>
        <p className="text-gray-600 mt-2">
          Completa el formulario para registrar un nuevo deportista
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

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SECCIÓN 1: Identificación */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Información de Identificación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Documento */}
            <SelectField
              label="Tipo de Documento"
              {...register('tipo_documento_id', {
                required: 'Este campo es requerido',
              })}
              error={errors.tipo_documento_id?.message}
            >
              <option value="">Selecciona un tipo...</option>
              {tiposDocumento.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </SelectField>

            {/* Número de Documento */}
            <InputField
              type="text"
              label="Número de Documento"
              placeholder="1234567890"
              {...register('numero_documento', {
                required: 'Este campo es requerido',
                minLength: {
                  value: 6,
                  message: 'Mínimo 6 caracteres',
                },
              })}
              error={errors.numero_documento?.message}
            />
          </div>
        </div>

        {/* SECCIÓN 2: Datos Personales */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Datos Personales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombres */}
            <InputField
              type="text"
              label="Nombres"
              placeholder="Juan"
              {...register('nombres', {
                required: 'Este campo es requerido',
                minLength: {
                  value: 2,
                  message: 'Mínimo 2 caracteres',
                },
              })}
              error={errors.nombres?.message}
            />

            {/* Apellidos */}
            <InputField
              type="text"
              label="Apellidos"
              placeholder="Pérez García"
              {...register('apellidos', {
                required: 'Este campo es requerido',
                minLength: {
                  value: 2,
                  message: 'Mínimo 2 caracteres',
                },
              })}
              error={errors.apellidos?.message}
            />

            {/* Fecha de Nacimiento */}
            <InputField
              type="date"
              label="Fecha de Nacimiento"
              {...register('fecha_nacimiento', {
                required: 'Este campo es requerido',
              })}
              error={errors.fecha_nacimiento?.message}
            />

            {/* Sexo - AHORA DESDE CATALOGO_ITEMS */}
            <SelectField
              label="Sexo"
              {...register('sexo_id', {
                required: 'Este campo es requerido',
              })}
              error={errors.sexo_id?.message}
            >
              <option value="">Selecciona un sexo...</option>
              {sexos.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        {/* SECCIÓN 3: Contacto */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Información de Contacto
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Teléfono */}
            <InputField
              type="tel"
              label="Teléfono (Opcional)"
              placeholder="3001234567"
              {...register('telefono', {
                pattern: {
                  value: /^[0-9\s\-\+\(\)]*$/,
                  message: 'Formato de teléfono inválido',
                },
              })}
              error={errors.telefono?.message}
            />

            {/* Email */}
            <InputField
              type="email"
              label="Email (Opcional)"
              placeholder="juan@example.com"
              {...register('email', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email inválido',
                },
              })}
              error={errors.email?.message}
            />
          </div>

          {/* Dirección */}
          <div className="mt-4">
            <TextAreaField
              label="Dirección (Opcional)"
              placeholder="Calle 123, Apartado 456, Medellín, Antioquia"
              rows={3}
              {...register('direccion')}
            />
          </div>
        </div>

        {/* SECCIÓN 4: Estado - AHORA DESDE CATALOGO_ITEMS */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Estado</h2>

          <SelectField
            label="Estado del Deportista"
            {...register('estado_id', {
              required: 'Este campo es requerido',
            })}
            error={errors.estado_id?.message}
          >
            <option value="">Selecciona un estado...</option>
            {estados.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </SelectField>

          <p className="text-sm text-gray-600 mt-2">
            Por defecto se selecciona "Activo"
          </p>
        </div>

        {/* Botones */}
        <div className="border-t pt-6 flex gap-4">
          <FormButton type="submit" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrar Deportista'}
          </FormButton>
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* Nota sobre datos requeridos */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Los campos marcados con * son requeridos. Todos
          los valores de Tipo de Documento, Sexo y Estado se obtienen de los
          catálogos maestros.
        </p>
      </div>
    </div>
  );
};

export default RegistroDeportista;
