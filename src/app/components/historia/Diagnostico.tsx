import { HistoriaClinicaData } from "../HistoriaClinica";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function Diagnostico({ data, updateData, onNext, onPrevious }: Props) {
  return (
    <div className="space-y-6">
      {/* Diagnóstico clínico */}
      <div>
        <label className="block mb-2">
          Diagnóstico clínico <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.diagnostico}
          onChange={(e) => updateData({ diagnostico: e.target.value })}
          rows={12}
          placeholder="Escriba el diagnóstico clínico completo del deportista, incluyendo:&#10;&#10;• Estado de salud general&#10;• Condiciones médicas identificadas&#10;• Hallazgos relevantes de la exploración física&#10;• Interpretación de pruebas complementarias&#10;• Factores de riesgo identificados&#10;• Aptitud para la práctica deportiva&#10;• Recomendaciones médicas específicas"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Incluya toda la información médica relevante para el seguimiento del deportista
        </p>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm text-blue-800 mb-2">Recomendaciones para el diagnóstico:</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Sea claro y específico en sus observaciones</li>
          <li>Incluya códigos diagnósticos si aplica (CIE-11)</li>
          <li>Mencione limitaciones o contraindicaciones para la práctica deportiva</li>
          <li>Indique nivel de urgencia si requiere atención especializada</li>
        </ul>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="flex items-center justify-center gap-2 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </button>
        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
