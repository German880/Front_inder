import { useState } from "react";
import { Search, User, ArrowLeft, FileText, Calendar } from "lucide-react";

type Deportista = {
  id: string;
  foto: string | null;
  nombreCompleto: string;
  numeroDocumento: string;
  tipoDocumento: string;
  edad: number;
  tipoDeporte: string;
  horaCita?: string; // Agregar hora de cita
};

// Mock data de deportistas registrados CON CITA HOY
const MOCK_DEPORTISTAS: Deportista[] = [
  {
    id: "1",
    foto: null,
    nombreCompleto: "Juan Carlos Pérez González",
    numeroDocumento: "1075234567",
    tipoDocumento: "Cédula de Ciudadanía",
    edad: 24,
    tipoDeporte: "Pesas",
    horaCita: "08:00 AM",
  },
  {
    id: "2",
    foto: null,
    nombreCompleto: "María Fernanda López Ramírez",
    numeroDocumento: "1075345678",
    tipoDocumento: "Cédula de Ciudadanía",
    edad: 19,
    tipoDeporte: "Natación",
    horaCita: "09:30 AM",
  },
  {
    id: "3",
    foto: null,
    nombreCompleto: "Andrés Felipe Rojas Castro",
    numeroDocumento: "1075456789",
    tipoDocumento: "Cédula de Ciudadanía",
    edad: 22,
    tipoDeporte: "Lucha",
    horaCita: "10:00 AM",
  },
  {
    id: "4",
    foto: null,
    nombreCompleto: "Laura Valentina Gómez Torres",
    numeroDocumento: "1075567890",
    tipoDocumento: "Cédula de Ciudadanía",
    edad: 20,
    tipoDeporte: "Subacuática",
    horaCita: "11:30 AM",
  },
  {
    id: "5",
    foto: null,
    nombreCompleto: "Carlos Alberto Méndez Silva",
    numeroDocumento: "1075678901",
    tipoDocumento: "Cédula de Ciudadanía",
    edad: 28,
    tipoDeporte: "Pesas",
    horaCita: "02:00 PM",
  },
];

type SelectDeportistaProps = {
  onSelectDeportista: (deportista: Deportista) => void;
  onBack: () => void;
};

export function SelectDeportista({ onSelectDeportista, onBack }: SelectDeportistaProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener la fecha de hoy en formato legible
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const fechaHoy = today.toLocaleDateString('es-CO', dateOptions);

  const filteredDeportistas = MOCK_DEPORTISTAS.filter((deportista) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      deportista.nombreCompleto.toLowerCase().includes(searchLower) ||
      deportista.numeroDocumento.includes(searchTerm) ||
      deportista.tipoDeporte.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-6 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-blue-600">Seleccionar Deportista</h1>
            <p className="text-gray-600 mt-1">
              Selecciona un deportista para iniciar su historia clínica
            </p>
          </div>
        </div>

        {/* Banner fecha del día */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-[#C84F3B]/10 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-800">Citas de hoy</p>
              <p className="text-xs text-gray-600 capitalize">{fechaHoy}</p>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento o deporte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Lista de deportistas */}
        {filteredDeportistas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron deportistas</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-blue-600 hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDeportistas.map((deportista) => (
              <div
                key={deportista.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => onSelectDeportista(deportista)}
              >
                <div className="flex items-center gap-4">
                  {/* Foto */}
                  <div className="flex-shrink-0">
                    {deportista.foto ? (
                      <img
                        src={deportista.foto}
                        alt={deportista.nombreCompleto}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {deportista.nombreCompleto}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 mt-2 text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Doc:</span>
                        <span>{deportista.numeroDocumento}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Edad:</span>
                        <span>{deportista.edad} años</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Deporte:</span>
                        <span>{deportista.tipoDeporte}</span>
                      </div>
                      {deportista.horaCita && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Cita:</span>
                          <span>{deportista.horaCita}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <div className="flex-shrink-0">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDeportista(deportista);
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Iniciar Historia</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer con información */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-center">
            Total de deportistas: <span className="font-semibold text-gray-900">{filteredDeportistas.length}</span>
            {searchTerm && ` (filtrados de ${MOCK_DEPORTISTAS.length})`}
          </p>
        </div>
      </div>
    </div>
  );
}