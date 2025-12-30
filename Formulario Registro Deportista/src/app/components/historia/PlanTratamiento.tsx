import { useState } from "react";
import { HistoriaClinicaData } from "../HistoriaClinica";
import { ChevronLeft, Check, X, Printer, UserPlus, Trash2, AlertCircle, Calendar, FileText } from "lucide-react";

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onPrevious: () => void;
  onSave: () => void;
  onCancel: () => void;
  onPrint: () => void;
};

const especialistasDisponibles = [
  { value: "Psicólogo", label: "Psicólogo/a Deportivo", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { value: "Fisiatra", label: "Médico Fisiatra", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { value: "Nutricionista", label: "Nutricionista Deportivo", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "Fisioterapeuta", label: "Fisioterapeuta", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { value: "Cardiólogo", label: "Cardiólogo", color: "bg-red-100 text-red-700 border-red-300" },
  { value: "Ortopedista", label: "Médico Ortopedista", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
];

export function PlanTratamiento({
  data,
  updateData,
  onPrevious,
  onSave,
  onCancel,
  onPrint,
}: Props) {
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState("");
  const [motivoRemision, setMotivoRemision] = useState("");
  const [prioridadRemision, setPrioridadRemision] = useState<"Normal" | "Urgente">("Normal");

  const handleAgregarRemision = () => {
    if (!especialistaSeleccionado) {
      alert("Por favor seleccione un especialista");
      return;
    }
    if (!motivoRemision.trim()) {
      alert("Por favor indique el motivo de la remisión");
      return;
    }

    const nuevaRemision = {
      especialista: especialistaSeleccionado,
      motivo: motivoRemision.trim(),
      prioridad: prioridadRemision,
      fechaRemision: new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
    };

    updateData({
      remisionesEspecialistas: [...data.remisionesEspecialistas, nuevaRemision],
    });

    // Limpiar campos
    setEspecialistaSeleccionado("");
    setMotivoRemision("");
    setPrioridadRemision("Normal");
  };

  const handleEliminarRemision = (index: number) => {
    const updated = data.remisionesEspecialistas.filter((_, i) => i !== index);
    updateData({ remisionesEspecialistas: updated });
  };

  const getEspecialistaColor = (especialista: string) => {
    const found = especialistasDisponibles.find((e) => e.value === especialista);
    return found?.color || "bg-gray-100 text-gray-700 border-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Indicaciones médicas */}
      <div>
        <label className="block mb-2 font-medium text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#C84F3B]" />
          Indicaciones médicas <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.indicacionesMedicas}
          onChange={(e) => updateData({ indicacionesMedicas: e.target.value })}
          rows={6}
          placeholder="Medicamentos, terapias, restricciones, cuidados especiales..."
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84F3B] resize-none"
        />
      </div>

      {/* Recomendaciones de entrenamiento */}
      <div>
        <label className="block mb-2 font-medium text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#1F4788]" />
          Recomendaciones <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.recomendacionesEntrenamiento}
          onChange={(e) => updateData({ recomendacionesEntrenamiento: e.target.value })}
          rows={6}
          placeholder="Intensidad de entrenamiento, ejercicios recomendados, ejercicios contraindicados, precauciones..."
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F4788] resize-none"
        />
      </div>

      {/* Plan de seguimiento */}
      <div>
        <label className="block mb-2 font-medium text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#B8C91A]" />
          Plan de seguimiento / Citas
        </label>
        <textarea
          value={data.planSeguimiento}
          onChange={(e) => updateData({ planSeguimiento: e.target.value })}
          rows={5}
          placeholder="Fechas de próximas citas, controles periódicos, reevaluaciones..."
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8C91A] resize-none"
        />
      </div>

      {/* Remisiones a especialistas */}
      <div className="bg-gradient-to-r from-[#C84F3B]/10 to-[#1F4788]/10 p-5 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#C84F3B]" />
          Interconsultas con Especialistas
        </h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Funcionalidad con backend:</strong> Las interconsultas registradas se enviarán automáticamente a la secretaria para agendar la cita y al especialista seleccionado para que esté informado. 
              El especialista podrá enviar recordatorios si la cita no se agenda.
            </span>
          </p>
        </div>

        <div className="space-y-4 bg-white p-4 rounded-md border border-gray-200">
          {/* Selector de especialista */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Especialista <span className="text-red-500">*</span>
            </label>
            <select
              value={especialistaSeleccionado}
              onChange={(e) => setEspecialistaSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F4788]"
            >
              <option value="">Seleccione un especialista...</option>
              {especialistasDisponibles.map((esp) => (
                <option key={esp.value} value={esp.value}>
                  {esp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Motivo de remisión */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Motivo de la interconsulta <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivoRemision}
              onChange={(e) => setMotivoRemision(e.target.value)}
              rows={3}
              placeholder="Describa el motivo de la interconsulta al especialista..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F4788] resize-none"
            />
          </div>


          {/* Botón agregar remisión */}
          <button
            type="button"
            onClick={handleAgregarRemision}
            className="w-full flex items-center justify-center gap-2 bg-[#C84F3B] text-white py-2 px-4 rounded-md hover:bg-[#B23600] transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Agregar Interconsulta
          </button>
        </div>
      </div>

      {/* Lista de remisiones registradas */}
      {data.remisionesEspecialistas.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Interconsultas Registradas</h3>
          <div className="space-y-3">
            {data.remisionesEspecialistas.map((remision, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${getEspecialistaColor(remision.especialista)} flex items-start justify-between`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold text-gray-800">
                      {remision.especialista}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      Fecha: {new Date(remision.fechaRemision).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 bg-white/50 p-2 rounded">
                    <span className="font-medium">Motivo:</span> {remision.motivo}
                  </p>
                  <p className="text-xs text-gray-600 mt-2 italic">
                    📧 Notificación automática pendiente: Secretaria + {remision.especialista}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminarRemision(index)}
                  className="ml-3 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar remisión"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.remisionesEspecialistas.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
          <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 italic">
            No se han registrado interconsultas a especialistas
          </p>
        </div>
      )}
      {/* Remisiones a especialistas */}
      <div className="bg-gradient-to-r from-[#C84F3B]/10 to-[#1F4788]/10 p-5 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#C84F3B]" />
          Remisiones a Especialistas
        </h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Funcionalidad con backend:</strong> Las remisiones registradas se enviarán automáticamente a la secretaria para agendar la cita y al especialista seleccionado para que esté informado. 
              El especialista podrá enviar recordatorios si la cita no se agenda.
            </span>
          </p>
        </div>

        <div className="space-y-4 bg-white p-4 rounded-md border border-gray-200">
          {/* Selector de especialista */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Especialista <span className="text-red-500">*</span>
            </label>
            <select
              value={especialistaSeleccionado}
              onChange={(e) => setEspecialistaSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F4788]"
            >
              <option value="">Seleccione un especialista...</option>
              {especialistasDisponibles.map((esp) => (
                <option key={esp.value} value={esp.value}>
                  {esp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Motivo de remisión */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Motivo de la remisión <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivoRemision}
              onChange={(e) => setMotivoRemision(e.target.value)}
              rows={3}
              placeholder="Describa el motivo de la remisión al especialista..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F4788] resize-none"
            />
          </div>


          {/* Botón agregar remisión */}
          <button
            type="button"
            onClick={handleAgregarRemision}
            className="w-full flex items-center justify-center gap-2 bg-[#C84F3B] text-white py-2 px-4 rounded-md hover:bg-[#B23600] transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Agregar Remisión
          </button>
        </div>
      </div>

      {/* Lista de remisiones registradas */}
      {data.remisionesEspecialistas.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Remisiones Registradas</h3>
          <div className="space-y-3">
            {data.remisionesEspecialistas.map((remision, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${getEspecialistaColor(remision.especialista)} flex items-start justify-between`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold text-gray-800">
                      {remision.especialista}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      Fecha: {new Date(remision.fechaRemision).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 bg-white/50 p-2 rounded">
                    <span className="font-medium">Motivo:</span> {remision.motivo}
                  </p>
                  <p className="text-xs text-gray-600 mt-2 italic">
                    📧 Notificación automática pendiente: Secretaria + {remision.especialista}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminarRemision(index)}
                  className="ml-3 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar remisión"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.remisionesEspecialistas.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
          <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 italic">
            No se han registrado remisiones a especialistas
          </p>
        </div>
      )}
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
            className="flex-1 flex items-center justify-center gap-2 bg-[#1F4788] text-white py-3 px-6 rounded-md hover:bg-[#1a3a6b] transition-colors"
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
