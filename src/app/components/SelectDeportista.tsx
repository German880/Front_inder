
import React, { useState, useCallback, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { deportistasService, Deportista } from '../../app/services/apiClient';

// ============================================================================
// TIPOS
// ============================================================================

interface SelectDeportistaProps {
  onSelect: (deportista: Deportista) => void;
  onError?: (error: string) => void;
}

interface DeportistaConLabels extends Deportista {
  // Labels cargados desde catalogo_items
  tipo_documento_nombre?: string;
  sexo_nombre?: string;
  estado_nombre?: string;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export const SelectDeportista: React.FC<SelectDeportistaProps> = ({
  onSelect,
  onError,
}) => {
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [deportistas, setDeportistas] = useState<DeportistaConLabels[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Buscar deportistas
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setDeportistas([]);
      setHasSearched(false);
      setErrorMessage('');
      return;
    }

    try {
      setIsLoading(true);
      setHasSearched(true);
      setErrorMessage('');

      // Buscar deportistas (backend retorna con JOINs a catálogos)
      const results = await deportistasService.search(query);

      // Mapear para incluir labels legibles
      const deportistasConLabels: DeportistaConLabels[] = results.map(
        (deportista) => ({
          ...deportista,
          // Obtener nombres de relaciones si están cargadas
          tipo_documento_nombre: deportista.tipo_documento?.nombre,
          sexo_nombre: deportista.sexo?.nombre,
          estado_nombre: deportista.estado?.nombre,
        })
      );

      setDeportistas(deportistasConLabels);

      if (deportistasConLabels.length === 0) {
        setErrorMessage('No se encontraron deportistas');
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Error al buscar deportistas';
      setErrorMessage(msg);
      console.error('Error searching deportistas:', error);

      if (onError) {
        onError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Debounce en la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300); // 300ms de espera después de dejar de escribir

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Manejar selección
  const handleSelectDeportista = (deportista: DeportistaConLabels) => {
    setSelectedId(deportista.id || null);
    onSelect(deportista);
  };

  // Alternar detalles expandidos
  const toggleExpanded = (id: string | undefined) => {
    if (!id) return;
    setExpandedId(expandedId === id ? null : id);
  };

  // Calcular edad
  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Buscar Deportista
        </h1>
        <p className="text-gray-600 mt-2">
          Busca por nombre, apellido o número de documento
        </p>
      </div>

      {/* Campo de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Ej: Juan, Pérez, 1234567890..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          />
          {isLoading && (
            <div className="absolute right-4 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Mensajes */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Resultados */}
      {hasSearched && deportistas.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Se encontraron <strong>{deportistas.length}</strong> deportista(s)
          </p>

          {/* Tabla responsiva */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Documento
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Tipo Doc.
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Edad
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Sexo
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {deportistas.map((deportista) => (
                  <React.Fragment key={deportista.id}>
                    {/* Fila principal */}
                    <tr
                      className={`border-b border-gray-200 hover:bg-blue-50 transition cursor-pointer ${
                        selectedId === deportista.id
                          ? 'bg-blue-100'
                          : 'bg-white'
                      }`}
                      onClick={() => handleSelectDeportista(deportista)}
                    >
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {deportista.nombres} {deportista.apellidos}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {deportista.numero_documento}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {/* AQUÍ SE MUESTRA EL LABEL DEL CATÁLOGO */}
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {deportista.tipo_documento_nombre || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {calcularEdad(deportista.fecha_nacimiento)} años
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {/* AQUÍ SE MUESTRA EL LABEL DEL CATÁLOGO */}
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {deportista.sexo_nombre || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {/* AQUÍ SE MUESTRA EL LABEL DEL CATÁLOGO */}
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            deportista.estado_nombre === 'Activo'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {deportista.estado_nombre || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(deportista.id);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition"
                        >
                          {expandedId === deportista.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Fila expandida con detalles */}
                    {expandedId === deportista.id && (
                      <tr className="bg-gray-50 border-b-2 border-gray-300">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Información personal */}
                            <div>
                              <h3 className="font-bold text-gray-800 mb-3">
                                Información Personal
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-600">
                                    Fecha de Nacimiento:
                                  </span>
                                  <p className="text-gray-800 font-medium">
                                    {new Date(
                                      deportista.fecha_nacimiento
                                    ).toLocaleDateString('es-CO', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Tipo de Documento:
                                  </span>
                                  <p className="text-gray-800 font-medium">
                                    {deportista.tipo_documento_nombre}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Sexo:</span>
                                  <p className="text-gray-800 font-medium">
                                    {deportista.sexo_nombre}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Estado:</span>
                                  <p className="text-gray-800 font-medium">
                                    {deportista.estado_nombre}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Información de contacto */}
                            <div>
                              <h3 className="font-bold text-gray-800 mb-3">
                                Contacto
                              </h3>
                              <div className="space-y-2 text-sm">
                                {deportista.telefono && (
                                  <div>
                                    <span className="text-gray-600">
                                      Teléfono:
                                    </span>
                                    <p className="text-gray-800 font-medium">
                                      {deportista.telefono}
                                    </p>
                                  </div>
                                )}
                                {deportista.email && (
                                  <div>
                                    <span className="text-gray-600">Email:</span>
                                    <p className="text-gray-800 font-medium break-all">
                                      {deportista.email}
                                    </p>
                                  </div>
                                )}
                                {deportista.direccion && (
                                  <div>
                                    <span className="text-gray-600">
                                      Dirección:
                                    </span>
                                    <p className="text-gray-800 font-medium">
                                      {deportista.direccion}
                                    </p>
                                  </div>
                                )}
                                {!deportista.telefono &&
                                  !deportista.email &&
                                  !deportista.direccion && (
                                    <p className="text-gray-500 italic">
                                      Sin información de contacto
                                    </p>
                                  )}
                              </div>
                            </div>
                          </div>

                          {/* Botón para seleccionar */}
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() =>
                                handleSelectDeportista(deportista)
                              }
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                            >
                              ✓ Seleccionar este deportista
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(deportista.id);
                              }}
                              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                            >
                              Cerrar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : hasSearched && deportistas.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600 mb-2">No se encontraron resultados</p>
          <p className="text-sm text-gray-500">
            Intenta con otro nombre, apellido o número de documento
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Escribe para buscar un deportista
          </p>
        </div>
      )}

      {/* Información de uso */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Información:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            ✓ Los datos se obtienen en tiempo real desde la base de datos
          </li>
          <li>
            ✓ Los nombres de tipo de documento, sexo y estado vienen de
            catálogos
          </li>
          <li>✓ Haz clic en una fila para seleccionar un deportista</li>
          <li>✓ Haz clic en el icono de expansión para ver más detalles</li>
        </ul>
      </div>
    </div>
  );
};

export default SelectDeportista;
