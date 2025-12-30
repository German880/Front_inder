import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isWithinInterval, startOfDay, endOfDay, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, X, Calendar as CalendarIcon, User, Clock, Stethoscope } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/calendar.css";

// Configurar react-big-calendar con date-fns
const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type TipoCita = "primera_cita" | "control" | "novedad";
type Especialista = "medico" | "fisio" | "nutricionista";

type Cita = {
  id: string;
  deportistaId: string;
  deportistaNombre: string;
  tipoCita: TipoCita;
  fecha: Date;
  especialista: Especialista;
  observaciones?: string;
};

// Mock data de deportistas (igual que en SelectDeportista)
const MOCK_DEPORTISTAS = [
  { id: "1", nombre: "Juan Carlos Pérez González" },
  { id: "2", nombre: "María Fernanda López Ramírez" },
  { id: "3", nombre: "Andrés Felipe Rojas Castro" },
  { id: "4", nombre: "Laura Valentina Gómez Torres" },
  { id: "5", nombre: "Carlos Alberto Méndez Silva" },
];

// Mock data de citas - Ejemplos realistas para la agenda médica deportiva
const hoy = new Date();
const getProximaFecha = (diasAdelante: number, hora: number, minutos: number = 0) => {
  const fecha = new Date(hoy);
  fecha.setDate(fecha.getDate() + diasAdelante);
  fecha.setHours(hora, minutos, 0, 0);
  return fecha;
};

const MOCK_CITAS: Cita[] = [
  // Citas de hoy
  {
    id: "1",
    deportistaId: "1",
    deportistaNombre: "Juan Carlos Pérez González",
    tipoCita: "primera_cita",
    fecha: getProximaFecha(0, 8, 0),
    especialista: "medico",
    observaciones: "Evaluación inicial para competencia nacional",
  },
  {
    id: "2",
    deportistaId: "3",
    deportistaNombre: "Andrés Felipe Rojas Castro",
    tipoCita: "control",
    fecha: getProximaFecha(0, 10, 30),
    especialista: "fisio",
    observaciones: "Seguimiento lesión hombro derecho",
  },
  {
    id: "3",
    deportistaId: "5",
    deportistaNombre: "Carlos Alberto Méndez Silva",
    tipoCita: "novedad",
    fecha: getProximaFecha(0, 14, 0),
    especialista: "medico",
    observaciones: "Dolor lumbar después de entrenamiento",
  },
  
  // Citas mañana
  {
    id: "4",
    deportistaId: "2",
    deportistaNombre: "María Fernanda López Ramírez",
    tipoCita: "control",
    fecha: getProximaFecha(1, 9, 0),
    especialista: "nutricionista",
    observaciones: "Ajuste plan nutricional pre-competencia",
  },
  {
    id: "5",
    deportistaId: "4",
    deportistaNombre: "Laura Valentina Gómez Torres",
    tipoCita: "primera_cita",
    fecha: getProximaFecha(1, 11, 0),
    especialista: "medico",
  },
  {
    id: "6",
    deportistaId: "1",
    deportistaNombre: "Juan Carlos Pérez González",
    tipoCita: "control",
    fecha: getProximaFecha(1, 15, 30),
    especialista: "fisio",
    observaciones: "Terapia post-entrenamiento",
  },
  
  // Citas en 2 días
  {
    id: "7",
    deportistaId: "3",
    deportistaNombre: "Andrés Felipe Rojas Castro",
    tipoCita: "control",
    fecha: getProximaFecha(2, 8, 30),
    especialista: "medico",
    observaciones: "Revisión exámenes de laboratorio",
  },
  {
    id: "8",
    deportistaId: "5",
    deportistaNombre: "Carlos Alberto Méndez Silva",
    tipoCita: "control",
    fecha: getProximaFecha(2, 13, 0),
    especialista: "nutricionista",
  },
  
  // Citas en 3 días
  {
    id: "9",
    deportistaId: "2",
    deportistaNombre: "María Fernanda López Ramírez",
    tipoCita: "novedad",
    fecha: getProximaFecha(3, 10, 0),
    especialista: "fisio",
    observaciones: "Molestia en rodilla izquierda",
  },
  {
    id: "10",
    deportistaId: "4",
    deportistaNombre: "Laura Valentina Gómez Torres",
    tipoCita: "control",
    fecha: getProximaFecha(3, 16, 0),
    especialista: "medico",
    observaciones: "Seguimiento signos vitales",
  },
  
  // Citas en 4 días
  {
    id: "11",
    deportistaId: "1",
    deportistaNombre: "Juan Carlos Pérez González",
    tipoCita: "control",
    fecha: getProximaFecha(4, 9, 30),
    especialista: "nutricionista",
    observaciones: "Evaluación composición corporal",
  },
  {
    id: "12",
    deportistaId: "3",
    deportistaNombre: "Andrés Felipe Rojas Castro",
    tipoCita: "control",
    fecha: getProximaFecha(4, 14, 30),
    especialista: "fisio",
  },
  
  // Citas en 5 días
  {
    id: "13",
    deportistaId: "5",
    deportistaNombre: "Carlos Alberto Méndez Silva",
    tipoCita: "control",
    fecha: getProximaFecha(5, 11, 0),
    especialista: "medico",
    observaciones: "Control evolución tratamiento",
  },
  
  // Citas próxima semana
  {
    id: "14",
    deportistaId: "2",
    deportistaNombre: "María Fernanda López Ramírez",
    tipoCita: "control",
    fecha: getProximaFecha(7, 10, 0),
    especialista: "medico",
    observaciones: "Evaluación pre-competencia regional",
  },
  {
    id: "15",
    deportistaId: "4",
    deportistaNombre: "Laura Valentina Gómez Torres",
    tipoCita: "control",
    fecha: getProximaFecha(8, 15, 0),
    especialista: "nutricionista",
  },
  {
    id: "16",
    deportistaId: "1",
    deportistaNombre: "Juan Carlos Pérez González",
    tipoCita: "novedad",
    fecha: getProximaFecha(9, 9, 0),
    especialista: "medico",
    observaciones: "Revisión urgente - dolor muscular intenso",
  },
];

const tiposCita = {
  primera_cita: "Primera Cita",
  control: "Control",
  novedad: "Novedad",
};

const especialistas = {
  medico: "Médico",
  fisio: "Fisioterapeuta",
  nutricionista: "Nutricionista",
};

export function GestionCitas() {
  const [citas, setCitas] = useState<Cita[]>(MOCK_CITAS);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({
    deportistaId: "",
    tipoCita: "primera_cita" as TipoCita,
    fecha: "",
    hora: "",
    especialista: "medico" as Especialista,
    observaciones: "",
  });

  const handleAbrirModal = () => {
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setFormData({
      deportistaId: "",
      tipoCita: "primera_cita",
      fecha: "",
      hora: "",
      especialista: "medico",
      observaciones: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.deportistaId || !formData.fecha || !formData.hora) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    const deportista = MOCK_DEPORTISTAS.find((d) => d.id === formData.deportistaId);
    if (!deportista) return;

    const [horas, minutos] = formData.hora.split(":").map(Number);
    const fechaCita = new Date(formData.fecha);
    fechaCita.setHours(horas, minutos);

    const nuevaCita: Cita = {
      id: Date.now().toString(),
      deportistaId: formData.deportistaId,
      deportistaNombre: deportista.nombre,
      tipoCita: formData.tipoCita,
      fecha: fechaCita,
      especialista: formData.especialista,
      observaciones: formData.observaciones,
    };

    setCitas([...citas, nuevaCita]);
    handleCerrarModal();
    alert("Cita agendada correctamente");
  };

  // Obtener citas de la semana actual
  const hoy = new Date();
  const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
  const finSemana = addDays(inicioSemana, 6);

  const citasSemanaActual = citas.filter((cita) =>
    isWithinInterval(cita.fecha, {
      start: startOfDay(inicioSemana),
      end: endOfDay(finSemana),
    })
  );

  // Convertir citas para react-big-calendar
  const eventos = citas.map((cita) => ({
    id: cita.id,
    title: `${cita.deportistaNombre} - ${especialistas[cita.especialista]}`,
    start: cita.fecha,
    end: new Date(cita.fecha.getTime() + 60 * 60 * 1000), // 1 hora de duración
    resource: cita,
  }));

  const eventStyleGetter = (event: any) => {
    const cita = event.resource as Cita;
    let backgroundColor = "#1F4788"; // azul por defecto
    
    if (cita.tipoCita === "primera_cita") backgroundColor = "#C84F3B";
    if (cita.tipoCita === "control") backgroundColor = "#1F4788";
    if (cita.tipoCita === "novedad") backgroundColor = "#B8C91A";

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-blue-600">Gestión de Citas</h1>
          <p className="text-gray-600 mt-1">Agenda y consulta las citas médicas de los deportistas</p>
        </div>
        <button
          onClick={handleAbrirModal}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-[#B33F30] transition-colors flex items-center gap-2"
          style={{ backgroundColor: "#C84F3B" }}
        >
          <Plus className="w-5 h-5" />
          Agendar Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="mb-4 text-gray-800">Calendario de Citas</h2>
          <div style={{ height: "600px" }}>
            <Calendar
              localizer={localizer}
              events={eventos}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              messages={{
                next: "Siguiente",
                previous: "Anterior",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
                date: "Fecha",
                time: "Hora",
                event: "Evento",
                noEventsInRange: "No hay citas en este rango",
                showMore: (total) => `+ Ver más (${total})`,
              }}
              culture="es"
              eventPropGetter={eventStyleGetter}
            />
          </div>
        </div>

        {/* Lista de citas de la semana */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="mb-4 text-gray-800">Citas de esta semana</h2>
          
          {citasSemanaActual.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay citas agendadas</p>
              <p className="text-sm">para esta semana</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {citasSemanaActual
                .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
                .map((cita) => (
                  <div
                    key={cita.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {cita.deportistaNombre}
                        </span>
                      </div>
                      <span
                        className="px-2 py-1 text-xs rounded-full text-white"
                        style={{
                          backgroundColor:
                            cita.tipoCita === "primera_cita"
                              ? "#C84F3B"
                              : cita.tipoCita === "control"
                              ? "#1F4788"
                              : "#B8C91A",
                        }}
                      >
                        {tiposCita[cita.tipoCita]}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(cita.fecha, "EEEE d 'de' MMMM", { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{format(cita.fecha, "HH:mm")} hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        <span>{especialistas[cita.especialista]}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para agendar cita */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-gray-900">Agendar Nueva Cita</h2>
              <button
                onClick={handleCerrarModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Seleccionar deportista */}
              <div>
                <label htmlFor="deportista" className="block mb-2 text-gray-700">
                  Deportista <span className="text-red-500">*</span>
                </label>
                <select
                  id="deportista"
                  value={formData.deportistaId}
                  onChange={(e) =>
                    setFormData({ ...formData, deportistaId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar deportista...</option>
                  {MOCK_DEPORTISTAS.map((deportista) => (
                    <option key={deportista.id} value={deportista.id}>
                      {deportista.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de cita */}
              <div>
                <label htmlFor="tipoCita" className="block mb-2 text-gray-700">
                  Tipo de Cita <span className="text-red-500">*</span>
                </label>
                <select
                  id="tipoCita"
                  value={formData.tipoCita}
                  onChange={(e) =>
                    setFormData({ ...formData, tipoCita: e.target.value as TipoCita })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {Object.entries(tiposCita).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label htmlFor="fecha" className="block mb-2 text-gray-700">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="fecha"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Hora */}
              <div>
                <label htmlFor="hora" className="block mb-2 text-gray-700">
                  Hora <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="hora"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Especialista */}
              <div>
                <label htmlFor="especialista" className="block mb-2 text-gray-700">
                  Especialista <span className="text-red-500">*</span>
                </label>
                <select
                  id="especialista"
                  value={formData.especialista}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      especialista: e.target.value as Especialista,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {Object.entries(especialistas).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observaciones */}
              <div>
                <label htmlFor="observaciones" className="block mb-2 text-gray-700">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Notas adicionales sobre la cita..."
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCerrarModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#B33F30] transition-colors"
                  style={{ backgroundColor: "#C84F3B" }}
                >
                  Agendar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}