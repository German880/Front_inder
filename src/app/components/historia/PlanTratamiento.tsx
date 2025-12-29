import { HistoriaClinicaData } from "../HistoriaClinica";
import { ChevronLeft, Check, X, Printer } from "lucide-react";

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onPrevious: () => void;
  onSave: () => void;
  onCancel: () => void;
  onPrint: () => void;
};

export function PlanTratamiento({
  data,
  updateData,
  onPrevious,
  onSave,
  onCancel,
  onPrint,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Indicaciones médicas */}
      <div>
        <label className="block mb-2">
          Indicaciones médicas <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.indicacionesMedicas}
          onChange={(e) => updateData({ indicacionesMedicas: e.target.value })}
          rows={6}
          placeholder="Medicamentos, terapias, restricciones, cuidados especiales..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Recomendaciones de entrenamiento */}
      <div>
        <label className="block mb-2">
          Recomendaciones de entrenamiento <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.recomendacionesEntrenamiento}
          onChange={(e) => updateData({ recomendacionesEntrenamiento: e.target.value })}
          rows={6}
          placeholder="Intensidad de entrenamiento, ejercicios recomendados, ejercicios contraindicados, precauciones..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Plan de seguimiento */}
      <div>
        <label className="block mb-2">Plan de seguimiento / Citas</label>
        <textarea
          value={data.planSeguimiento}
          onChange={(e) => updateData({ planSeguimiento: e.target.value })}
          rows={5}
          placeholder="Fechas de próximas citas, controles periódicos, reevaluaciones, especialistas a consultar..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Resumen informativo */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <h3 className="text-sm text-green-800 mb-2">
          ✓ Ha completado todos los pasos de la historia clínica
        </h3>
        <p className="text-sm text-green-700">
          Revise la información ingresada y presione "Guardar historia clínica" para finalizar el
          proceso.
        </p>
      </div>

      {/* Botones de acción final */}
      <div className="space-y-3 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPrevious}
            className="flex items-center justify-center gap-2 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>
          <button
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors"
          >
            <Check className="w-5 h-5" />
            Guardar historia clínica
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPrint}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition-colors"
          >
            <Printer className="w-5 h-5" />
            Imprimir / Generar PDF
          </button>
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 bg-red-500 text-white py-3 px-6 rounded-md hover:bg-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
            Cancelar y salir
          </button>
        </div>
      </div>
    </div>
  );
}
