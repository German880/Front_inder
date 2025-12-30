/**
 * HISTORIA CLÍNICA - ACTUALIZADO PARA INDERDB
 * 
 * Componente principal que gestiona los 7 pasos de la historia clínica
 * con indicador de progreso visual y validación en cada paso
 */

'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { Deportista, historiaClinicaService } from '../services/apiClient';
import { ProgressIndicator } from './historia/ProgressIndicator';
import { Evaluacion } from './historia/Evaluacion';
import { AntecedentesMedicos } from './historia/AntecedentesMedicos';
import { RevisionSistemas } from './historia/RevisionSistemas';
import { ExploracionFisica } from './historia/ExploracionFisica';
import { PruebasComplementarias } from './historia/PruebasComplementarias';
import { Diagnostico } from './historia/Diagnostico';
import { PlanTratamiento } from './historia/PlanTratamiento';

// ============================================================================
// TIPOS
// ============================================================================

export type HistoriaClinicaData = {
  // Paso 1: Evaluación
  tipoCita: string;
  motivoConsulta: string;
  enfermedadActual: string;
  
  // Paso 2: Antecedentes Médicos
  antecedentesPersonales: Array<{ codigoCIE11: string; nombreEnfermedad: string; observaciones: string }>;
  antecedentesFamiliares: Array<{ codigoCIE11: string; nombreEnfermedad: string; familiar: string; observaciones: string }>;
  lesionesDeportivas: boolean;
  descripcionLesiones: string;
  fechaUltimaLesion: string;
  cirugiasPrevias: boolean;
  detalleCirugias: string;
  tieneAlergias: boolean;
  alergias: string;
  tomaMedicacion: boolean;
  medicacionActual: string;
  vacunas: string[];
  
  // Paso 3: Revisión por Sistemas
  revisionSistemas: {
    cardiovascular: { estado: "normal" | "anormal" | ""; observaciones: string };
    respiratorio: { estado: "normal" | "anormal" | ""; observaciones: string };
    digestivo: { estado: "normal" | "anormal" | ""; observaciones: string };
    neurologico: { estado: "normal" | "anormal" | ""; observaciones: string };
    musculoesqueletico: { estado: "normal" | "anormal" | ""; observaciones: string };
    genitourinario: { estado: "normal" | "anormal" | ""; observaciones: string };
    endocrino: { estado: "normal" | "anormal" | ""; observaciones: string };
    pielFaneras: { estado: "normal" | "anormal" | ""; observaciones: string };
  };
  
  // Paso 4: Exploración Física
  estatura: string;
  peso: string;
  frecuenciaCardiaca: string;
  presionArterial: string;
  frecuenciaRespiratoria: string;
  temperatura: string;
  saturacionOxigeno: string;
  exploracionSistemas: {
    cardiovascular: { estado: "normal" | "anormal" | ""; observaciones: string };
    respiratorio: { estado: "normal" | "anormal" | ""; observaciones: string };
    digestivo: { estado: "normal" | "anormal" | ""; observaciones: string };
    neurologico: { estado: "normal" | "anormal" | ""; observaciones: string };
    musculoesqueletico: { estado: "normal" | "anormal" | ""; observaciones: string };
    genitourinario: { estado: "normal" | "anormal" | ""; observaciones: string };
    endocrino: { estado: "normal" | "anormal" | ""; observaciones: string };
    pielFaneras: { estado: "normal" | "anormal" | ""; observaciones: string };
  };
  
  // Paso 5: Pruebas Complementarias
  ayudasDiagnosticas: Array<{ categoria: string; nombrePrueba: string; codigoCUPS: string; resultado: string; archivosAdjuntos: File[] }>;
  
  // Paso 6: Diagnóstico
  analisisObjetivo: string;
  impresionDiagnostica: string;
  diagnosticosClinicos: Array<{ codigoCIE11: string; nombreEnfermedad: string; observaciones: string }>;
  
  // Paso 7: Plan de Tratamiento
  indicacionesMedicas: string;
  recomendacionesEntrenamiento: string;
  planSeguimiento: string;
  remisionesEspecialistas: Array<{ especialista: string; motivo: string; prioridad: "Normal" | "Urgente"; fechaRemision: string }>;
};

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
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<HistoriaClinicaData>({
    tipoCita: "",
    motivoConsulta: "",
    enfermedadActual: "",
    antecedentesPersonales: [],
    antecedentesFamiliares: [],
    lesionesDeportivas: false,
    descripcionLesiones: "",
    fechaUltimaLesion: "",
    cirugiasPrevias: false,
    detalleCirugias: "",
    tieneAlergias: false,
    alergias: "",
    tomaMedicacion: false,
    medicacionActual: "",
    vacunas: [],
    revisionSistemas: {
      cardiovascular: { estado: "", observaciones: "" },
      respiratorio: { estado: "", observaciones: "" },
      digestivo: { estado: "", observaciones: "" },
      neurologico: { estado: "", observaciones: "" },
      musculoesqueletico: { estado: "", observaciones: "" },
      genitourinario: { estado: "", observaciones: "" },
      endocrino: { estado: "", observaciones: "" },
      pielFaneras: { estado: "", observaciones: "" },
    },
    estatura: "",
    peso: "",
    frecuenciaCardiaca: "70",
    presionArterial: "120/80",
    frecuenciaRespiratoria: "16",
    temperatura: "36.5",
    saturacionOxigeno: "98",
    exploracionSistemas: {
      cardiovascular: { estado: "", observaciones: "" },
      respiratorio: { estado: "", observaciones: "" },
      digestivo: { estado: "", observaciones: "" },
      neurologico: { estado: "", observaciones: "" },
      musculoesqueletico: { estado: "", observaciones: "" },
      genitourinario: { estado: "", observaciones: "" },
      endocrino: { estado: "", observaciones: "" },
      pielFaneras: { estado: "", observaciones: "" },
    },
    ayudasDiagnosticas: [],
    analisisObjetivo: "",
    impresionDiagnostica: "",
    diagnosticosClinicos: [],
    indicacionesMedicas: "",
    recomendacionesEntrenamiento: "",
    planSeguimiento: "",
    remisionesEspecialistas: [],
  });

  const totalSteps = 7;

  const updateFormData = (data: Partial<HistoriaClinicaData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCancel = () => {
    if (confirm("¿Está seguro que desea cancelar? Se perderán todos los datos ingresados.")) {
      onBack?.();
    }
  };

  const handleSubmit = async () => {
    if (!confirm("¿Está seguro que desea guardar la historia clínica?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Enviar datos al backend
      const response = await historiaClinicaService.crearCompleta({
        deportista_id: deportista.id,
        ...formData
      });
      
      toast.success("Historia clínica guardada correctamente");
      onSuccess?.(response.id);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al guardar la historia clínica: ${errorMsg}`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Historia Clínica Deportiva</h1>
            <p className="text-gray-600 mt-1">
              {deportista.nombres} {deportista.apellidos} • Doc: {deportista.numero_documento}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Contenido del paso actual */}
        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          {currentStep === 1 && (
            <Evaluacion 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext}
              onCancel={handleCancel}
            />
          )}
          {currentStep === 2 && (
            <AntecedentesMedicos 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          {currentStep === 3 && (
            <RevisionSistemas 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          {currentStep === 4 && (
            <ExploracionFisica 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          {currentStep === 5 && (
            <PruebasComplementarias 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          {currentStep === 6 && (
            <Diagnostico 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          {currentStep === 7 && (
            <PlanTratamiento 
              data={formData} 
              updateData={updateFormData} 
              onSave={handleSubmit}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
              onPrint={() => window.print()}
            />
          )}
        </div>

        {/* Botones de navegación */}
        <div className="flex gap-4 justify-between">
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Anterior
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Cancelar
            </button>
            {currentStep < totalSteps && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Siguiente
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            {currentStep === totalSteps && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Historia'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoriaClinica;
