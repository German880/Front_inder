import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { User, Phone, Trophy } from "lucide-react";
import { toast } from "sonner";
import { deportistasService } from "../services/apiClient";
import { useCatalogos } from "../hooks/useCatalogos";

// ============================================================================
// TIPOS
// ============================================================================

type FormData = {
  nombreCompleto: string;
  fechaNacimiento: string;
  genero: string;
  otroGenero?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nacionalidad: string;
  departamento?: string;
  ciudad?: string;
  estrato?: string;
  etnia?: string;
  telefono: string;
  correoElectronico: string;
  direccion: string;
  disciplina: string;
};

// Lista de países de América Latina y otros países importantes
const PAISES = [
  "Colombia",
  "Argentina",
  "Bolivia",
  "Brasil",
  "Chile",
  "Costa Rica",
  "Cuba",
  "Ecuador",
  "El Salvador",
  "Guatemala",
  "Honduras",
  "México",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Perú",
  "República Dominicana",
  "Uruguay",
  "Venezuela",
  "España",
  "Estados Unidos",
  "Otro"
];

// Departamentos de Colombia
const DEPARTAMENTOS = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada"
];

// Ciudades principales por departamento (muestra simplificada - se puede expandir)
const CIUDADES_POR_DEPARTAMENTO: Record<string, string[]> = {
  "Huila": ["Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre", "Aipe", "Algeciras", "Baraya", "Gigante", "Hobo", "Isnos", "Palermo", "Rivera", "Saladoblanco", "San Agustín", "Tarqui", "Tello", "Teruel", "Tesalia", "Timaná", "Villavieja", "Yaguará"],
  "Bogotá D.C.": ["Bogotá"],
  "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Turbo", "Rionegro", "Sabaneta"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Buga", "Jamundí"],
  "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Puerto Colombia"],
  "Cundinamarca": ["Soacha", "Facatativá", "Zipaquirá", "Chía", "Fusagasugá", "Girardot", "Madrid"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja"],
  "Bolívar": ["Cartagena", "Magangué", "Turbaco", "Arjona"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario"],
  "Tolima": ["Ibagué", "Espinal", "Melgar", "Honda", "Líbano"],
  "Caldas": ["Manizales", "Villamaría", "Chinchiná", "La Dorada"],
  "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia"],
  "Quindío": ["Armenia", "Calarcá", "Montenegro", "La Tebaida"],
  "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada"],
  "Nariño": ["Pasto", "Ipiales", "Tumaco", "Túquerres"],
  "Magdalena": ["Santa Marta", "Ciénaga", "Fundación", "El Banco"],
  "Cesar": ["Valledupar", "Aguachica", "Bosconia", "Chimichagua"],
  "Córdoba": ["Montería", "Cereté", "Lorica", "Sahagún"],
  "Sucre": ["Sincelejo", "Corozal", "Sampués"],
  "Meta": ["Villavicencio", "Acacías", "Granada", "Puerto López"],
  "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia"],
  "Caquetá": ["Florencia", "San Vicente del Caguán"],
  "Casanare": ["Yopal", "Aguazul", "Villanueva"],
  "Arauca": ["Arauca", "Tame"],
  "Putumayo": ["Mocoa", "Puerto Asís"],
  "San Andrés y Providencia": ["San Andrés"],
  "Amazonas": ["Leticia"],
  "Guainía": ["Inírida"],
  "Guaviare": ["San José del Guaviare"],
  "Vaupés": ["Mitú"],
  "Vichada": ["Puerto Carreño"],
  "Chocó": ["Quibdó", "Istmina"]
};

const ETNIAS = [
  "Mestizo",
  "Indígena",
  "Afrodescendiente",
  "Raizal",
  "Palenquero",
  "ROM (Gitano)",
  "Blanco",
  "Otro",
  "Prefiero no decirlo"
];
export function RegistroDeportista() {
  const [edad, setEdad] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { tiposDocumento, sexos, estados } = useCatalogos();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      genero: "",
      tipoDocumento: "",
      nacionalidad: "",
      disciplina: "",
      departamento: "",
      ciudad: "",
      estrato: "",
      etnia: "",
    },
  });

  const fechaNacimiento = watch("fechaNacimiento");
  const nacionalidad = watch("nacionalidad");
  const departamento = watch("departamento");
  const genero = watch("genero");

  // Calcular edad automáticamente
  useEffect(() => {
    if (fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edadCalculada--;
      }
      
      setEdad(edadCalculada >= 0 ? edadCalculada : null);
    } else {
      setEdad(null);
    }
  }, [fechaNacimiento]);

  const onSubmit = async (data: FormData) => {
    console.log("Datos del formulario:", data);
    console.log("Edad calculada:", edad);
    
    try {
      setIsLoading(true);
      
      // Buscar IDs en catálogos
      const tipoDocId = tiposDocumento.find(
        (c) => c.valor.toLowerCase() === data.tipoDocumento.toLowerCase()
      )?.id;
      const sexoId = sexos.find(
        (c) => c.valor.toLowerCase() === data.genero.toLowerCase()
      )?.id;
      const estadoId = estados.find(
        (c) => c.valor.toLowerCase() === "activo"
      )?.id;
      
      if (!tipoDocId || !sexoId || !estadoId) {
        toast.error("Error: No se encontraron los catálogos necesarios");
        setIsLoading(false);
        return;
      }
      
      // Separar nombre completo en nombres y apellidos
      const partes = data.nombreCompleto.trim().split(" ");
      const nombres = partes.slice(0, -1).join(" ") || partes[0];
      const apellidos = partes[partes.length - 1] || "";
      
      // Preparar datos para el backend
      const datosAEnviar = {
        tipo_documento_id: tipoDocId,
        numero_documento: data.numeroDocumento,
        nombres: nombres,
        apellidos: apellidos,
        fecha_nacimiento: data.fechaNacimiento,
        sexo_id: sexoId,
        telefono: data.telefono,
        email: data.correoElectronico,
        direccion: data.direccion,
        estado_id: estadoId,
      };
      
      console.log("Datos a enviar al servidor:", datosAEnviar);
      
      // Enviar al backend
      const response = await deportistasService.create(datosAEnviar);
      console.log("Respuesta del servidor:", response);
      
      toast.success("Deportista registrado correctamente");
      reset();
      setEdad(null);
    } catch (error: any) {
      console.error("Error al registrar deportista:", error);
      const mensajeError = error.response?.data?.detail || error.message || "Error desconocido";
      toast.error(`Error al registrar: ${mensajeError}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm("¿Está seguro que desea cancelar? Se perderán los datos ingresados.")) {
      reset();
      setEdad(null);
    }
  };

  const esColombia = nacionalidad === "Colombia";
  const ciudadesDisponibles = departamento ? CIUDADES_POR_DEPARTAMENTO[departamento] || [] : [];

  return (
    <div className="max-w-4xl mx-auto p-6 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-center mb-8 text-blue-600 text-3xl font-bold">Registro de Datos Personales</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* DATOS PERSONALES */}
          <div className="space-y-5">
            <h2 className="flex items-center gap-2 pb-2 border-b-2 border-blue-500">
              <User className="w-5 h-5 text-blue-600" />
              Datos Personales
            </h2>

            {/* Nombre completo */}
            <div>
              <label className="block mb-2">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84F3B] ${
                  errors.nombreCompleto ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ingrese el nombre completo"
                {...register("nombreCompleto", {
                  required: "El nombre completo es obligatorio",
                })}
              />
              {errors.nombreCompleto && (
                <p className="text-red-500 mt-1">{errors.nombreCompleto.message}</p>
              )}
            </div>

            {/* Fecha de nacimiento y edad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">
                  Fecha de nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fechaNacimiento ? "border-red-500" : "border-gray-300"
                  }`}
                  max={new Date().toISOString().split("T")[0]}
                  {...register("fechaNacimiento", {
                    required: "La fecha de nacimiento es obligatoria",
                  })}
                />
                {errors.fechaNacimiento && (
                  <p className="text-red-500 mt-1">{errors.fechaNacimiento.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">Edad</label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {edad !== null ? `${edad} años` : "-"}
                </div>
              </div>
            </div>

            {/* Género */}
            <div>
              <label className="block mb-2">
                Género <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.genero ? "border-red-500" : "border-gray-300"
                }`}
                {...register("genero", {
                  required: "El género es obligatorio",
                })}
              >
                <option value="">Seleccione...</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
              {errors.genero && (
                <p className="text-red-500 mt-1">{errors.genero.message}</p>
              )}
            </div>

            {/* Campo condicional: Especificar otro género */}
            {genero === "otro" && (
              <div>
                <label className="block mb-2">
                  Especificar género <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.otroGenero ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese su género"
                  {...register("otroGenero", {
                    required: genero === "otro" ? "Por favor especifique su género" : false,
                  })}
                />
                {errors.otroGenero && (
                  <p className="text-red-500 mt-1">{errors.otroGenero.message}</p>
                )}
              </div>
            )}

            {/* Documento de identidad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2">
                  Tipo de documento <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84F3B] ${
                    errors.tipoDocumento ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("tipoDocumento", {
                    required: "El tipo de documento es obligatorio",
                  })}
                >
                  <option value="">Seleccione...</option>
                  <option value="cedula_ciudadania">Cédula de Ciudadanía</option>
                  <option value="cedula_extranjeria">Cédula de Extranjería</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="nit">NIT</option>
                  <option value="tarjeta_identidad">Tarjeta de Identidad</option>
                  <option value="pep">Permiso Especial de Permanencia</option>
                </select>
                {errors.tipoDocumento && (
                  <p className="text-red-500 mt-1">{errors.tipoDocumento.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2">
                  Número de documento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.numeroDocumento ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese el número de documento"
                  {...register("numeroDocumento", {
                    required: "El número de documento es obligatorio",
                    pattern: {
                      value: /^[A-Z0-9]+$/i,
                      message: "Formato de documento inválido",
                    },
                  })}
                />
                {errors.numeroDocumento && (
                  <p className="text-red-500 mt-1">{errors.numeroDocumento.message}</p>
                )}
              </div>
            </div>

            {/* Nacionalidad */}
            <div>
              <label className="block mb-2">
                Nacionalidad <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nacionalidad ? "border-red-500" : "border-gray-300"
                }`}
                {...register("nacionalidad", {
                  required: "La nacionalidad es obligatoria",
                })}
              >
                <option value="">Seleccione...</option>
                {PAISES.map((pais) => (
                  <option key={pais} value={pais}>
                    {pais}
                  </option>
                ))}
              </select>
              {errors.nacionalidad && (
                <p className="text-red-500 mt-1">{errors.nacionalidad.message}</p>
              )}
            </div>

            {/* Campos condicionales para Colombia */}
            {esColombia && (
              <>
                {/* Departamento */}
                <div>
                  <label className="block mb-2">
                    Departamento <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.departamento ? "border-red-500" : "border-gray-300"
                    }`}
                    {...register("departamento", {
                      required: esColombia ? "El departamento es obligatorio" : false,
                    })}
                  >
                    <option value="">Seleccione...</option>
                    {DEPARTAMENTOS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.departamento && (
                    <p className="text-red-500 mt-1">{errors.departamento.message}</p>
                  )}
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block mb-2">
                    Ciudad/Municipio <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.ciudad ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={!departamento}
                    {...register("ciudad", {
                      required: esColombia ? "La ciudad es obligatoria" : false,
                    })}
                  >
                    <option value="">
                      {departamento ? "Seleccione..." : "Primero seleccione un departamento"}
                    </option>
                    {ciudadesDisponibles.map((ciudad) => (
                      <option key={ciudad} value={ciudad}>
                        {ciudad}
                      </option>
                    ))}
                  </select>
                  {errors.ciudad && (
                    <p className="text-red-500 mt-1">{errors.ciudad.message}</p>
                  )}
                </div>

                {/* Estrato y Etnia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">
                      Estrato socioeconómico <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.estrato ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("estrato", {
                        required: esColombia ? "El estrato es obligatorio" : false,
                      })}
                    >
                      <option value="">Seleccione...</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                    {errors.estrato && (
                      <p className="text-red-500 mt-1">{errors.estrato.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2">
                      Etnia <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.etnia ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("etnia", {
                        required: esColombia ? "La etnia es obligatoria" : false,
                      })}
                    >
                      <option value="">Seleccione...</option>
                      {ETNIAS.map((etnia) => (
                        <option key={etnia} value={etnia}>
                          {etnia}
                        </option>
                      ))}
                    </select>
                    {errors.etnia && (
                      <p className="text-red-500 mt-1">{errors.etnia.message}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* CONTACTO */}
          <div className="space-y-5">
            <h2 className="flex items-center gap-2 pb-2 border-b-2 border-[#B8C91A]">
              <Phone className="w-5 h-5 text-[#93A115]" />
              Contacto
            </h2>

            {/* Teléfono */}
            <div>
              <label className="block mb-2">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.telefono ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="+XX XXX XXX XXXX"
                {...register("telefono", {
                  required: "El teléfono es obligatorio",
                  pattern: {
                    value: /^[+]?[\d\s-()]+$/,
                    message: "Formato de teléfono inválido",
                  },
                })}
              />
              {errors.telefono && (
                <p className="text-red-500 mt-1">{errors.telefono.message}</p>
              )}
            </div>

            {/* Correo electrónico */}
            <div>
              <label className="block mb-2">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84F3B] ${
                  errors.correoElectronico ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="ejemplo@correo.com"
                {...register("correoElectronico", {
                  required: "El correo electrónico es obligatorio",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Formato de correo electrónico inválido",
                  },
                })}
              />
              {errors.correoElectronico && (
                <p className="text-red-500 mt-1">{errors.correoElectronico.message}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block mb-2">
                Dirección de residencia <span className="text-red-500">*</span>
              </label>
              <textarea
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.direccion ? "border-red-500" : "border-gray-300"
                }`}
                rows={3}
                placeholder="Ingrese la dirección completa"
                {...register("direccion", {
                  required: "La dirección es obligatoria",
                })}
              />
              {errors.direccion && (
                <p className="text-red-500 mt-1">{errors.direccion.message}</p>
              )}
            </div>
          </div>

          {/* INFORMACIÓN DEPORTIVA */}
          <div className="space-y-5">
            <h2 className="flex items-center gap-2 pb-2 border-b-2 border-[#B23600]">
              <Trophy className="w-5 h-5 text-[#B23600]" />
              Información Deportiva
            </h2>

            {/* Disciplina */}
            <div>
              <label className="block mb-2">
                Disciplina deportiva <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84F3B] ${
                  errors.disciplina ? "border-red-500" : "border-gray-300"
                }`}
                {...register("disciplina", {
                  required: "La disciplina deportiva es obligatoria",
                })}
              >
                <option value="">Seleccione...</option>
                <option value="pesas">Pesas</option>
                <option value="natacion">Natación</option>
                <option value="subacuatica">Subacuática</option>
                <option value="lucha">Lucha</option>
              </select>
              {errors.disciplina && (
                <p className="text-red-500 mt-1">{errors.disciplina.message}</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Guardando..." : "Guardar y continuar"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}