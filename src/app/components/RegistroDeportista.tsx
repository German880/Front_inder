import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { User, Phone, Mail, MapPin, Trophy, AlertCircle } from 'lucide-react';
import {
  InputText,
  InputDate,
  Select,
  TextArea,
  ReadOnlyField,
  Button,
  SectionHeader,
  FormSection,
} from '../components/form-fields';

// ============================================================================
// TIPOS
// ============================================================================

interface RegistroDeportistaFormData {
  // Datos personales
  nombreCompleto: string;
  fechaNacimiento: string;
  edad?: number;
  genero: 'masculino' | 'femenino' | 'otro';
  otroGenero?: string;
  numeroDocumento: string;
  tipoDocumento: 'cedula' | 'pasaporte' | 'otro';
  pais: string;
  departamento?: string;
  ciudad?: string;
  etnia: string;
  estratoSocioeconomico: string;
  
  // Datos de contacto
  email: string;
  telefonoContacto: string;
  direccionResidencia: string;
  
  // Datos deportivos
  disciplinaDeportiva: string;
  
  // Datos médicos
  alturaCm?: number;
  pesoKg?: number;
  tipoSangre?: string;
  
  // Observaciones
  observaciones?: string;
}

interface RegistroDeportistaProps {
  onSubmit?: (data: RegistroDeportistaFormData) => Promise<void>;
  initialData?: Partial<RegistroDeportistaFormData>;
  isLoading?: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const OPCIONES_GENERO = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

const OPCIONES_TIPO_DOCUMENTO = [
  { value: 'cedula', label: 'Cédula de Identidad' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'otro', label: 'Otro' },
];

const OPCIONES_PAISES = [
  { value: 'colombia', label: 'Colombia' },
  { value: 'argentina', label: 'Argentina' },
  { value: 'brasil', label: 'Brasil' },
  { value: 'chile', label: 'Chile' },
  { value: 'ecuador', label: 'Ecuador' },
  { value: 'peru', label: 'Perú' },
  { value: 'venezuela', label: 'Venezuela' },
  { value: 'otro', label: 'Otro' },
];

const OPCIONES_ETNIA = [
  { value: 'indigena', label: 'Indígena' },
  { value: 'afrodescendiente', label: 'Afrodescendiente' },
  { value: 'palenquero', label: 'Palenquero' },
  { value: 'raizal', label: 'Raizal' },
  { value: 'rom', label: 'Rom' },
  { value: 'blanco', label: 'Blanco' },
  { value: 'mestizo', label: 'Mestizo' },
  { value: 'mulato', label: 'Mulato' },
  { value: 'otro', label: 'Otro' },
];

const OPCIONES_ESTRATO = [
  { value: '1', label: 'Estrato 1' },
  { value: '2', label: 'Estrato 2' },
  { value: '3', label: 'Estrato 3' },
  { value: '4', label: 'Estrato 4' },
  { value: '5', label: 'Estrato 5' },
  { value: '6', label: 'Estrato 6' },
];

const DEPARTAMENTOS_COLOMBIA = [
  { value: 'amazonas', label: 'Amazonas' },
  { value: 'antioquia', label: 'Antioquia' },
  { value: 'arauca', label: 'Arauca' },
  { value: 'atlantico', label: 'Atlántico' },
  { value: 'bolivar', label: 'Bolívar' },
  { value: 'boyaca', label: 'Boyacá' },
  { value: 'caldas', label: 'Caldas' },
  { value: 'caqueta', label: 'Caquetá' },
  { value: 'casanare', label: 'Casanare' },
  { value: 'cauca', label: 'Cauca' },
  { value: 'cesar', label: 'Cesar' },
  { value: 'choco', label: 'Chocó' },
  { value: 'cordoba', label: 'Córdoba' },
  { value: 'cundinamarca', label: 'Cundinamarca' },
  { value: 'guainia', label: 'Guainía' },
  { value: 'guaviare', label: 'Guaviare' },
  { value: 'huila', label: 'Huila' },
  { value: 'la_guajira', label: 'La Guajira' },
  { value: 'magdalena', label: 'Magdalena' },
  { value: 'meta', label: 'Meta' },
  { value: 'narino', label: 'Nariño' },
  { value: 'norte_santander', label: 'Norte de Santander' },
  { value: 'putumayo', label: 'Putumayo' },
  { value: 'quindio', label: 'Quindío' },
  { value: 'risaralda', label: 'Risaralda' },
  { value: 'san_andres', label: 'San Andrés y Providencia' },
  { value: 'santander', label: 'Santander' },
  { value: 'sucre', label: 'Sucre' },
  { value: 'tolima', label: 'Tolima' },
  { value: 'valle_cauca', label: 'Valle del Cauca' },
  { value: 'vaupes', label: 'Vaupés' },
  { value: 'vichada', label: 'Vichada' },
];

// Ciudades por departamento
const CIUDADES_COLOMBIA: Record<string, Array<{ value: string; label: string }>> = {
  huila: [
    { value: 'neiva', label: 'Neiva' },
    { value: 'pitalito', label: 'Pitalito' },
    { value: 'la_plata', label: 'La Plata' },
    { value: 'garzon', label: 'Garzón' },
    { value: 'isnos', label: 'Isnos' },
    { value: 'aipe', label: 'Aipe' },
    { value: 'altamira', label: 'Altamira' },
    { value: 'baraya', label: 'Baraya' },
    { value: 'campoalegre', label: 'Campoalegre' },
    { value: 'elias', label: 'Elías' },
    { value: 'embalse', label: 'Embalse' },
    { value: 'gigante', label: 'Gigante' },
    { value: 'guadalupe', label: 'Guadalupe' },
    { value: 'hobo', label: 'Hobo' },
    { value: 'iquira', label: 'Iquira' },
    { value: 'colombia', label: 'Colombia' },
    { value: 'nátaga', label: 'Nátaga' },
    { value: 'palermo', label: 'Palermo' },
    { value: 'paicol', label: 'Paicol' },
    { value: 'santa_maria', label: 'Santa María' },
    { value: 'tarqui', label: 'Tarqui' },
    { value: 'teruel', label: 'Teruel' },
    { value: 'tesalia', label: 'Tesalia' },
    { value: 'timaná', label: 'Timaná' },
    { value: 'villavieja', label: 'Villavieja' },
    { value: 'yaguara', label: 'Yaguará' },
  ],
  antioquia: [
    { value: 'medellin', label: 'Medellín' },
    { value: 'abejorral', label: 'Abejorral' },
    { value: 'amaga', label: 'Amaga' },
    { value: 'amalfi', label: 'Amalfi' },
  ],
  // ... Agrega más departamentos según sea necesario
};

const OPCIONES_DISCIPLINA = [
  { value: 'futbol', label: 'Fútbol' },
  { value: 'voleibol', label: 'Voleibol' },
  { value: 'atletismo', label: 'Atletismo' },
  { value: 'natacion', label: 'Natación' },
  { value: 'otro', label: 'Otro' },
];

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

const calcularEdad = (fechaNacimiento: string): number => {
  if (!fechaNacimiento) return 0;
  
  const hoy = new Date();
  const fecha = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = fecha.getMonth();
  
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fecha.getDate())) {
    edad--;
  }
  
  return edad;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const RegistroDeportista: React.FC<RegistroDeportistaProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const {
    register,
    formState: { errors },
    watch,
    handleSubmit,
    reset,
  } = useForm<RegistroDeportistaFormData>({
    defaultValues: initialData,
    mode: 'onChange',
  });

  const genero = watch('genero');
  const fechaNacimiento = watch('fechaNacimiento');
  const pais = watch('pais');
  const departamento = watch('departamento');

  // Calcular edad automáticamente
  const edad = useMemo(() => {
    return fechaNacimiento ? calcularEdad(fechaNacimiento) : 0;
  }, [fechaNacimiento]);

  // Obtener ciudades disponibles según departamento
  const ciudadesDisponibles = useMemo(() => {
    if (pais === 'colombia' && departamento) {
      return CIUDADES_COLOMBIA[departamento] || [];
    }
    return [];
  }, [pais, departamento]);

  // ========================================================================
  // MANEJADOR DE SUBMIT
  // ========================================================================

  const handleFormSubmit = async (data: RegistroDeportistaFormData) => {
    // Agregar edad calculada
    const dataConEdad = {
      ...data,
      edad,
    };

    if (onSubmit) {
      try {
        await onSubmit(dataConEdad);
      } catch (error) {
        console.error('Error al guardar:', error);
      }
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold text-blue-600 mb-8">
        Registro de Datos Personales
      </h1>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* ================================================================
            SECCIÓN 1: DATOS PERSONALES
            ================================================================ */}
        <FormSection>
          <SectionHeader
            title="Datos Personales"
            icon={<User className="w-5 h-5" />}
          />

          <div className="space-y-5">
            {/* Nombre completo */}
            <InputText
              label="Nombre completo"
              required
              placeholder="Ingrese el nombre completo"
              registration={register('nombreCompleto', {
                required: 'El nombre completo es obligatorio',
                minLength: {
                  value: 3,
                  message: 'El nombre debe tener al menos 3 caracteres',
                },
              })}
              error={errors.nombreCompleto}
            />

            {/* Fecha de nacimiento, Edad y Género */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputDate
                label="Fecha de nacimiento"
                required
                registration={register('fechaNacimiento', {
                  required: 'La fecha de nacimiento es obligatoria',
                })}
                maxDate={new Date()}
                error={errors.fechaNacimiento}
              />

              <ReadOnlyField
                label="Edad"
                value={edad > 0 ? `${edad} años` : '-'}
              />

              <Select
                label="Género"
                required
                options={OPCIONES_GENERO}
                registration={register('genero', {
                  required: 'El género es obligatorio',
                })}
                error={errors.genero}
              />
            </div>

            {/* Especificar otro género (condicional) */}
            {genero === 'otro' && (
              <InputText
                label="Especificar Género"
                required
                placeholder="Ej: No binario"
                registration={register('otroGenero', {
                  required: genero === 'otro' ? 'Por favor especifique su género' : false,
                })}
                error={errors.otroGenero}
              />
            )}

            {/* Tipo y número de documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de documento"
                required
                options={OPCIONES_TIPO_DOCUMENTO}
                registration={register('tipoDocumento', {
                  required: 'El tipo de documento es obligatorio',
                })}
                error={errors.tipoDocumento}
              />

              <InputText
                label="Número de documento"
                required
                placeholder="Ingrese el número de documento"
                registration={register('numeroDocumento', {
                  required: 'El número de documento es obligatorio',
                  pattern: {
                    value: /^[0-9]{6,20}$/,
                    message: 'El número de documento debe tener entre 6 y 20 dígitos',
                  },
                })}
                error={errors.numeroDocumento}
              />
            </div>

            {/* País */}
            <Select
              label="País"
              required
              options={OPCIONES_PAISES}
              registration={register('pais', {
                required: 'El país es obligatorio',
              })}
              error={errors.pais}
            />

            {/* Departamento y Ciudad (solo si es Colombia) */}
            {pais === 'colombia' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Departamento"
                  required
                  options={DEPARTAMENTOS_COLOMBIA}
                  registration={register('departamento', {
                    required: 'El departamento es obligatorio para Colombia',
                  })}
                  error={errors.departamento}
                />

                <Select
                  label="Ciudad"
                  required
                  options={ciudadesDisponibles}
                  disabled={!departamento || ciudadesDisponibles.length === 0}
                  registration={register('ciudad', {
                    required: departamento ? 'La ciudad es obligatoria' : false,
                  })}
                  error={errors.ciudad}
                />
              </div>
            )}

            {/* Etnia y Estrato socioeconómico */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Etnia"
                required
                options={OPCIONES_ETNIA}
                registration={register('etnia', {
                  required: 'La etnia es obligatoria',
                })}
                error={errors.etnia}
              />

              <Select
                label="Estrato Socioeconómico"
                required
                options={OPCIONES_ESTRATO}
                registration={register('estratoSocioeconomico', {
                  required: 'El estrato socioeconómico es obligatorio',
                })}
                error={errors.estratoSocioeconomico}
              />
            </div>
          </div>
        </FormSection>

        {/* ================================================================
            SECCIÓN 2: CONTACTO
            ================================================================ */}
        <FormSection>
          <SectionHeader
            title="Contacto"
            icon={<Phone className="w-5 h-5" />}
          />

          <div className="space-y-5">
            <InputText
              label="Teléfono"
              required
              type="tel"
              placeholder="+XX XXX XXX XXXX"
              registration={register('telefonoContacto', {
                required: 'El teléfono es obligatorio',
                pattern: {
                  value: /^[\d\s\-\+\(\)]{10,20}$/,
                  message: 'Ingrese un teléfono válido',
                },
              })}
              error={errors.telefonoContacto}
            />

            <InputText
              label="Correo electrónico"
              required
              type="email"
              placeholder="ejemplo@correo.com"
              registration={register('email', {
                required: 'El correo es obligatorio',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Ingrese un correo válido',
                },
              })}
              error={errors.email}
            />

            <TextArea
              label="Dirección de residencia"
              required
              placeholder="Ingrese la dirección completa"
              registration={register('direccionResidencia', {
                required: 'La dirección es obligatoria',
              })}
              error={errors.direccionResidencia}
            />
          </div>
        </FormSection>

        {/* ================================================================
            SECCIÓN 3: INFORMACIÓN DEPORTIVA
            ================================================================ */}
        <FormSection>
          <SectionHeader
            title="Información Deportiva"
            icon={<Trophy className="w-5 h-5" />}
          />

          <div className="space-y-5">
            <Select
              label="Disciplina deportiva"
              required
              options={OPCIONES_DISCIPLINA}
              registration={register('disciplinaDeportiva', {
                required: 'La disciplina deportiva es obligatoria',
              })}
              error={errors.disciplinaDeportiva}
            />
          </div>
        </FormSection>

        {/* ================================================================
            BOTONES DE ACCIÓN
            ================================================================ */}
        <div className="flex gap-4 justify-center pt-6 border-t">
          <Button
            variant="primary"
            type="submit"
            loading={isLoading}
            className="flex-1 md:flex-none"
          >
            Guardar y continuar
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => reset()}
            className="flex-1 md:flex-none"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegistroDeportista;
