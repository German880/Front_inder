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
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCatalogos } from '../contexts/CatalogosContext';
import { deportistasService } from '../services/apiClient';
import { InputText } from './form-fields/InputText';
import { InputDate } from './form-fields/InputDate';
import { SelectCatalogo } from './form-fields/SelectCatalogo';

// ============================================================================
// TIPOS
// ============================================================================

type DeportistaForm = {
  tipo_documento_id: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo_id: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  estado_id: string;
};

interface RegistroDeportistaProps {
  onSubmit?: (deportista: any) => void;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function RegistroDeportista({ onSubmit }: RegistroDeportistaProps) {
  const { catalogos, isLoading } = useCatalogos();
  const [errors, setErrors] = useState<Partial<DeportistaForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<DeportistaForm>({
    tipo_documento_id: '',
    numero_documento: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    sexo_id: '',
    telefono: '',
    email: '',
    direccion: '',
    estado_id: '',
  });

  const handleChange = (field: keyof DeportistaForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DeportistaForm> = {};

    if (!formData.tipo_documento_id) newErrors.tipo_documento_id = 'Requerido';
    if (!formData.numero_documento) newErrors.numero_documento = 'Requerido';
    if (!formData.nombres) newErrors.nombres = 'Requerido';
    if (!formData.apellidos) newErrors.apellidos = 'Requerido';
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = 'Requerido';
    if (!formData.sexo_id) newErrors.sexo_id = 'Requerido';
    if (!formData.estado_id) newErrors.estado_id = 'Requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessMessage('');

      const nuevoDeportista = await deportistasService.create(formData);

      setSuccessMessage(
        `✅ Deportista ${nuevoDeportista.nombres} ${nuevoDeportista.apellidos} registrado exitosamente`
      );

      // Reset formulario
      setFormData({
        tipo_documento_id: '',
        numero_documento: '',
        nombres: '',
        apellidos: '',
        fecha_nacimiento: '',
        sexo_id: '',
        telefono: '',
        email: '',
        direccion: '',
        estado_id: catalogos.estados.find((e) => e.nombre.toLowerCase() === 'activo')?.id || '',
      });

      toast.success('Deportista registrado correctamente');

      if (onSubmit) {
        onSubmit(nuevoDeportista);
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al registrar deportista';
      toast.error(errorMsg);
      console.error('Error registrando deportista:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-4">Cargando catálogos...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Registro de Deportista</h1>
        <p className="text-gray-600 mt-2">Completa el formulario para registrar un nuevo deportista</p>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Información de Identificación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectCatalogo
            label="Tipo de Documento"
            value={formData.tipo_documento_id}
            onChange={(value) => handleChange('tipo_documento_id', value)}
            options={catalogos.tiposDocumento}
            required
            error={errors.tipo_documento_id}
          />

          <InputText
            label="Número de Documento"
            value={formData.numero_documento}
            onChange={(value) => handleChange('numero_documento', value)}
            placeholder="1234567890"
            required
            error={errors.numero_documento}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Datos Personales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputText
            label="Nombres"
            value={formData.nombres}
            onChange={(value) => handleChange('nombres', value)}
            placeholder="Juan"
            required
            error={errors.nombres}
          />

          <InputText
            label="Apellidos"
            value={formData.apellidos}
            onChange={(value) => handleChange('apellidos', value)}
            placeholder="Pérez García"
            required
            error={errors.apellidos}
          />

          <InputDate
            label="Fecha de Nacimiento"
            value={formData.fecha_nacimiento}
            onChange={(value) => handleChange('fecha_nacimiento', value)}
            required
            error={errors.fecha_nacimiento}
          />

          <SelectCatalogo
            label="Sexo"
            value={formData.sexo_id}
            onChange={(value) => handleChange('sexo_id', value)}
            options={catalogos.sexos}
            required
            error={errors.sexo_id}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Información de Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputText
            label="Teléfono (Opcional)"
            value={formData.telefono || ''}
            onChange={(value) => handleChange('telefono', value)}
            placeholder="3001234567"
          />

          <InputText
            label="Email (Opcional)"
            value={formData.email || ''}
            onChange={(value) => handleChange('email', value)}
            type="email"
            placeholder="juan@example.com"
          />
        </div>

        <div className="mt-4">
          <InputText
            label="Dirección (Opcional)"
            value={formData.direccion || ''}
            onChange={(value) => handleChange('direccion', value)}
            placeholder="Calle 123, Apartado 456, Medellín, Antioquia"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Estado</h2>
        <SelectCatalogo
          label="Estado del Deportista"
          value={formData.estado_id}
          onChange={(value) => handleChange('estado_id', value)}
          options={catalogos.estados}
          required
          error={errors.estado_id}
        />
        <p className="text-sm text-gray-600 mt-2">Por defecto se selecciona "Activo"</p>
      </div>

      <div className="border-t pt-6 flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Deportista'}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default RegistroDeportista;
