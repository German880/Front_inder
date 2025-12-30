import { useState, useEffect } from 'react';
import { deportistasService, Deportista } from '../services/apiClient';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';

export function ListadoDeportistas() {
  const [deportistas, setDeportistas] = useState<Deportista[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    cargarDeportistas();
  }, [page]);

  const cargarDeportistas = async () => {
    try {
      setIsLoading(true);
      const response = await deportistasService.getAll(page, 10);
      
      // Manejo de respuesta con paginación
      if (Array.isArray(response)) {
        setDeportistas(response);
      } else if (response.items) {
        setDeportistas(response.items);
        setTotalPages(response.total_pages || 1);
      }
    } catch (error) {
      toast.error('Error cargando deportistas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await deportistasService.delete(id);
      toast.success('Deportista eliminado correctamente');
      cargarDeportistas();
    } catch (error) {
      toast.error('Error al eliminar deportista');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deportistasFiltrados = deportistas.filter((depo) => {
    const query = searchQuery.toLowerCase();
    return (
      depo.nombres.toLowerCase().includes(query) ||
      depo.apellidos.toLowerCase().includes(query) ||
      depo.numero_documento.includes(query) ||
      depo.email?.toLowerCase().includes(query) ||
      depo.telefono?.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Deportistas</h1>
            <p className="text-gray-600">Gestiona el registro de todos los deportistas</p>
          </div>
          <button
            onClick={() => window.location.href = '/registro'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nuevo Deportista
          </button>
        </div>

        {/* BÚSQUEDA */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento, email o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Cargando deportistas...</span>
            </div>
          ) : deportistasFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No hay deportistas que coincidan con tu búsqueda</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Documento</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teléfono</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {deportistasFiltrados.map((depo, idx) => (
                    <tr 
                      key={depo.id} 
                      className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{depo.numero_documento}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {depo.nombres} {depo.apellidos}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{depo.telefono || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{depo.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          'bg-blue-100 text-blue-800'
                        }`}>
                          N/A
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => window.location.href = `/deportista/${depo.id}`}
                            className="text-blue-600 hover:bg-blue-100 p-2 rounded transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => window.location.href = `/deportista/${depo.id}/editar`}
                            className="text-green-600 hover:bg-green-100 p-2 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEliminar(depo.id, `${depo.nombres} ${depo.apellidos}`)}
                            className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-gray-600">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}