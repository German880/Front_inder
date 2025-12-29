import { useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import { ProgressIndicator } from "./historia/ProgressIndicator";
import { Evaluacion } from "./historia/Evaluacion";
import { AntecedentesMedicos } from "./historia/AntecedentesMedicos";
import { RevisionSistemas } from "./historia/RevisionSistemas";
import { ExploracionFisica } from "./historia/ExploracionFisica";
import { PruebasComplementarias } from "./historia/PruebasComplementarias";
import { Diagnostico } from "./historia/Diagnostico";
import { PlanTratamiento } from "./historia/PlanTratamiento";

export type HistoriaClinicaData = {
  // Paso 1: Evaluación
  tipoCita: string;
  motivoConsulta: string;
  enfermedadActual: string;
  
  // Paso 2: Antecedentes Médicos
  antecedentesPersonales: Array<{
    codigoCIE11: string;
    nombreEnfermedad: string;
    observaciones: string;
  }>;
  antecedentesFamiliares: Array<{
    codigoCIE11: string;
    nombreEnfermedad: string;
    familiar: string;
    observaciones: string;
  }>;
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
  ayudasDiagnosticas: Array<{
    categoria: string;
    nombrePrueba: string;
    codigoCUPS: string;
    resultado: string;
  }>;
  archivosAdjuntos: FileList | null;
  
  // Paso 7: Diagnstico
  diagnostico: string;
  
  // Paso 8: Plan de Tratamiento
  indicacionesMedicas: string;
  recomendacionesEntrenamiento: string;
  planSeguimiento: string;
};

type Deportista = {
  id: string;
  foto: string | null;
  nombreCompleto: string;
  numeroDocumento: string;
  tipoDocumento: string;
  edad: number;
  tipoDeporte: string;
  nivelCompetencia: string;
};

type HistoriaClinicaProps = {
  deportista: Deportista;
  onBack: () => void;
};

export function HistoriaClinica({ deportista, onBack }: HistoriaClinicaProps) {
  const [currentStep, setCurrentStep] = useState(1);
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
      cardiovascular: { estado: "normal", observaciones: "" },
      respiratorio: { estado: "normal", observaciones: "" },
      digestivo: { estado: "normal", observaciones: "" },
      neurologico: { estado: "normal", observaciones: "" },
      musculoesqueletico: { estado: "normal", observaciones: "" },
      genitourinario: { estado: "normal", observaciones: "" },
      endocrino: { estado: "normal", observaciones: "" },
      pielFaneras: { estado: "normal", observaciones: "" },
    },
    estatura: "",
    peso: "",
    frecuenciaCardiaca: "",
    presionArterial: "",
    frecuenciaRespiratoria: "",
    temperatura: "",
    saturacionOxigeno: "",
    exploracionSistemas: {
      cardiovascular: { estado: "normal", observaciones: "" },
      respiratorio: { estado: "normal", observaciones: "" },
      digestivo: { estado: "normal", observaciones: "" },
      neurologico: { estado: "normal", observaciones: "" },
      musculoesqueletico: { estado: "normal", observaciones: "" },
      genitourinario: { estado: "normal", observaciones: "" },
      endocrino: { estado: "normal", observaciones: "" },
      pielFaneras: { estado: "normal", observaciones: "" },
    },
    ayudasDiagnosticas: [],
    archivosAdjuntos: null,
    diagnostico: "",
    indicacionesMedicas: "",
    recomendacionesEntrenamiento: "",
    planSeguimiento: "",
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
      setCurrentStep(1);
      setFormData({
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
          cardiovascular: { estado: "normal", observaciones: "" },
          respiratorio: { estado: "normal", observaciones: "" },
          digestivo: { estado: "normal", observaciones: "" },
          neurologico: { estado: "normal", observaciones: "" },
          musculoesqueletico: { estado: "normal", observaciones: "" },
          genitourinario: { estado: "normal", observaciones: "" },
          endocrino: { estado: "normal", observaciones: "" },
          pielFaneras: { estado: "normal", observaciones: "" },
        },
        estatura: "",
        peso: "",
        frecuenciaCardiaca: "",
        presionArterial: "",
        frecuenciaRespiratoria: "",
        temperatura: "",
        saturacionOxigeno: "",
        exploracionSistemas: {
          cardiovascular: { estado: "normal", observaciones: "" },
          respiratorio: { estado: "normal", observaciones: "" },
          digestivo: { estado: "normal", observaciones: "" },
          neurologico: { estado: "normal", observaciones: "" },
          musculoesqueletico: { estado: "normal", observaciones: "" },
          genitourinario: { estado: "normal", observaciones: "" },
          endocrino: { estado: "normal", observaciones: "" },
          pielFaneras: { estado: "normal", observaciones: "" },
        },
        ayudasDiagnosticas: [],
        archivosAdjuntos: null,
        diagnostico: "",
        indicacionesMedicas: "",
        recomendacionesEntrenamiento: "",
        planSeguimiento: "",
      });
    }
  };

  const handleSave = () => {
    console.log("Historia clínica guardada:", formData);
    alert("Historia clínica guardada correctamente. Ver consola para detalles.");
  };

  const handlePrint = () => {
    alert("Funcionalidad de impresión/PDF en desarrollo");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Evaluacion
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onCancel={handleCancel}
          />
        );
      case 2:
        return (
          <AntecedentesMedicos
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <RevisionSistemas
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <ExploracionFisica
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <PruebasComplementarias
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <Diagnostico
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 7:
        return (
          <PlanTratamiento
            data={formData}
            updateData={updateFormData}
            onPrevious={handlePrevious}
            onSave={handleSave}
            onCancel={handleCancel}
            onPrint={handlePrint}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header con información del deportista */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver a selección de deportista"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-blue-600">Historia Clínica Deportiva</h1>
          </div>
          
          {/* Información del deportista */}
          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
            {deportista.foto ? (
              <img
                src={deportista.foto}
                alt={deportista.nombreCompleto}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-gray-200">
                <User className="w-7 h-7 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-gray-900">{deportista.nombreCompleto}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-gray-600">
                <span>{deportista.tipoDocumento}: {deportista.numeroDocumento}</span>
                <span>•</span>
                <span>{deportista.edad} años</span>
                <span>•</span>
                <span>{deportista.tipoDeporte}</span>
                <span>•</span>
                <span>{deportista.nivelCompetencia}</span>
              </div>
            </div>
          </div>
        </div>
        
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        {renderStep()}
      </div>
    </div>
  );
}