import { useState } from "react";
import { HistoriaClinicaData } from "../HistoriaClinica";
import { ChevronLeft, ChevronRight, FileText, ClipboardList, Stethoscope, Plus, Trash2, AlertCircle, Search } from "lucide-react";
import { buscarEnfermedadPorCodigo, buscarCodigosPorNombre } from "./cie11Database";

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function Diagnostico({ data, updateData, onNext, onPrevious }: Props) {
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaObservacion, setNuevaObservacion] = useState("");
  const [errorCodigo, setErrorCodigo] = useState("");
  const [sugerencias, setSugerencias] = useState<Array<{ codigo: string; nombre: string }>>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Buscar automáticamente por código CIE-11
  const handleCodigoChange = (codigo: string) => {
    const codigoUpper = codigo.toUpperCase();
    setNuevoCodigo(codigoUpper);
    setErrorCodigo("");

    if (codigoUpper.trim()) {
      const enfermedad = buscarEnfermedadPorCodigo(codigoUpper);
      if (enfermedad) {
        setNuevoNombre(enfermedad);
        setErrorCodigo("");
      } else {
        setErrorCodigo("Código CIE-11 no encontrado");
        setNuevoNombre("");
      }
    } else {
      setNuevoNombre("");
    }
  };

  // Buscar automáticamente por nombre de enfermedad
  const handleNombreChange = (nombre: string) => {
    setNuevoNombre(nombre);
    setErrorCodigo("");

    if (nombre.trim() && nombre.length >= 3) {
      const resultados = buscarCodigosPorNombre(nombre);
      if (resultados.length > 0) {
        setSugerencias(resultados);
        setMostrarSugerencias(true);
      } else {
        // Permitir escribir diagnóstico personalizado
        setNuevoCodigo("");
        setSugerencias([]);
        setMostrarSugerencias(false);
      }
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
    }
  };

  // Seleccionar una sugerencia
  const seleccionarSugerencia = (codigo: string, nombre: string) => {
    setNuevoCodigo(codigo);
    setNuevoNombre(nombre);
    setMostrarSugerencias(false);
    setSugerencias([]);
    setErrorCodigo("");
  };

  const handleAgregarDiagnostico = () => {
    if (!nuevoNombre.trim()) {
      alert("Por favor ingrese o seleccione un diagnóstico");
      return;
    }

    const nuevoDiagnostico = {
      codigoCIE11: nuevoCodigo,
      nombreEnfermedad: nuevoNombre.trim(),
      observaciones: nuevaObservacion.trim(),
    };

    updateData({
      diagnosticosClinicos: [...data.diagnosticosClinicos, nuevoDiagnostico],
    });

    // Limpiar campos
    setNuevoCodigo("");
    setNuevoNombre("");
    setNuevaObservacion("");
    setErrorCodigo("");
    setSugerencias([]);
    setMostrarSugerencias(false);
  };

  const handleEliminarDiagnostico = (index: number) => {
    const updated = data.diagnosticosClinicos.filter((_, i) => i !== index);
    updateData({ diagnosticosClinicos: updated });
  };

  const handleNext = () => {
    if (data.diagnosticosClinicos.length === 0) {
      alert("Por favor agregue al menos un diagnóstico clínico");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Información adicional */}
      <div className="bg-gradient-to-r from-[#C84F3B]/10 to-[#1F4788]/10 p-4 rounded-lg border-l-4 border-[#C84F3B]">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Recomendaciones para el diagnóstico:</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Sea claro y específico en sus observaciones</li>
          <li>Incluya códigos diagnósticos CIE-11 para estandarización</li>
          <li>Mencione limitaciones o contraindicaciones para la práctica deportiva</li>
          <li>Indique nivel de urgencia si requiere atención especializada</li>
        </ul>
      </div>

      {/* Análisis Objetivo */}
      <div>
        <label className="block mb-2 font-medium text-gray-800 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#1F4788]" />
          Análisis Objetivo
        </label>
        <textarea
          value={data.analisisObjetivo}
          onChange={(e) => updateData({ analisisObjetivo: e.target.value })}
          rows={5}
          placeholder="Resumen de hallazgos objetivos encontrados durante la evaluación física, signos vitales, pruebas complementarias..."
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F4788] resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Describa los hallazgos objetivos y medibles encontrados durante la evaluación.
        </p>
      </div>

      {/* Impresión Diagnóstica */}
      <div>
        <label className="block mb-2 font-medium text-gray-800 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-[#B8C91A]" />
          Impresión Diagnóstica
        </label>
        <textarea
          value={data.impresionDiagnostica}
          onChange={(e) => updateData({ impresionDiagnostica: e.target.value })}
          rows={4}
          placeholder="Interpretación clínica inicial basada en los hallazgos, hipótesis diagnóstica preliminar..."
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8C91A] resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Escriba su impresión diagnóstica preliminar basada en la evaluación realizada.
        </p>
      </div>

      {/* Diagnóstico Clínico con CIE-11 */}
      <div className="bg-gradient-to-r from-[#C84F3B]/10 to-[#1F4788]/10 p-5 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#C84F3B]" />
          Diagnóstico Clínico (CIE-11) <span className="text-red-500">*</span>
        </h3>

        <div className="space-y-4 bg-white p-4 rounded-md border border-gray-200">
          {/* Código CIE-11 */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Código CIE-11
            </label>
            <div className="relative">
              <input
                type="text"
                value={nuevoCodigo}
                onChange={(e) => handleCodigoChange(e.target.value)}
                placeholder="Ej: FA51, 8B60, DA0Z..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
                  errorCodigo ? "border-red-300" : "border-gray-300"
                }`}
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            {errorCodigo && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errorCodigo}</span>
              </p>
            )}
            {nuevoCodigo && nuevoNombre && !errorCodigo && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  <span className="font-semibold">✓ Enfermedad encontrada:</span> {nuevoNombre}
                </p>
              </div>
            )}
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium">O buscar por nombre</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Búsqueda por nombre */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Nombre de la enfermedad / diagnóstico
            </label>
            <div className="relative">
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => handleNombreChange(e.target.value)}
                onBlur={() => {
                  // Retraso para permitir clic en sugerencias
                  setTimeout(() => setMostrarSugerencias(false), 200);
                }}
                onFocus={() => {
                  if (sugerencias.length > 0) {
                    setMostrarSugerencias(true);
                  }
                }}
                placeholder="Ej: Esguince de tobillo, Tendinitis, Fractura..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            {/* Lista de sugerencias */}
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {sugerencias.map((sugerencia) => (
                  <button
                    type="button"
                    key={sugerencia.codigo}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    onClick={() => seleccionarSugerencia(sugerencia.codigo, sugerencia.nombre)}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-800 font-medium">{sugerencia.nombre}</div>
                        <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
                          CIE-11: {sugerencia.codigo}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Escriba al menos 3 caracteres para buscar. También puede escribir un diagnóstico personalizado.
            </p>
          </div>

          {/* Observaciones adicionales */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Observaciones adicionales / Especificaciones
            </label>
            <textarea
              value={nuevaObservacion}
              onChange={(e) => setNuevaObservacion(e.target.value)}
              rows={3}
              placeholder="Detalles adicionales, severidad, afectación deportiva, pronóstico..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Botón agregar */}
          <button
            type="button"
            onClick={handleAgregarDiagnostico}
            className="w-full flex items-center justify-center gap-2 bg-[#C84F3B] text-white py-2 px-4 rounded-md hover:bg-[#B23600] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Diagnóstico
          </button>
        </div>
      </div>

      {/* Lista de diagnósticos registrados */}
      {data.diagnosticosClinicos.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Diagnósticos Clínicos Registrados</h3>
          <div className="space-y-3">
            {data.diagnosticosClinicos.map((diagnostico, index) => (
              <div
                key={index}
                className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start justify-between"
              >
                <div className="flex items-start gap-3 flex-1">
                  <Stethoscope className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    {diagnostico.codigoCIE11 && (
                      <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 inline-block mb-2">
                        CIE-11: {diagnostico.codigoCIE11}
                      </span>
                    )}
                    <p className="font-medium text-gray-800">
                      {diagnostico.nombreEnfermedad}
                    </p>
                    {diagnostico.observaciones && (
                      <p className="text-sm text-gray-600 mt-2 bg-white/50 p-2 rounded">
                        <span className="font-medium">Observaciones:</span> {diagnostico.observaciones}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminarDiagnostico(index)}
                  className="ml-3 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.diagnosticosClinicos.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 italic">
            No se han registrado diagnósticos clínicos
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Agregue al menos un diagnóstico para continuar
          </p>
        </div>
      )}

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
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 bg-[#C84F3B] text-white py-3 px-6 rounded-md hover:bg-[#B23600] transition-colors"
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
