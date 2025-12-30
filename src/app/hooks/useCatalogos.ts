import { useState, useEffect } from 'react';
import { catalogosService, CatalogoItem } from '../services/apiClient';

// ============================================================================
// TIPOS
// ============================================================================

export interface CatalogosContexto {
  tiposDocumento: CatalogoItem[];
  sexos: CatalogoItem[];
  estados: CatalogoItem[];
  tiposCita: CatalogoItem[];
  estadosCita: CatalogoItem[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// HOOK: useCatalogos
// ============================================================================

/**
 * Hook para cargar todos los catálogos al iniciar la aplicación
 * 
 * Uso:
 * const { tiposDocumento, sexos, estados, loading } = useCatalogos();
 * 
 * if (loading) return <Loading />;
 * 
 * <Select name="tipo_documento_id" options={tiposDocumento} />
 * <Select name="sexo_id" options={sexos} />
 * <Select name="estado_id" options={estados} />
 */
export function useCatalogos(): CatalogosContexto {
  const [tiposDocumento, setTiposDocumento] = useState<CatalogoItem[]>([]);
  const [sexos, setSexos] = useState<CatalogoItem[]>([]);
  const [estados, setEstados] = useState<CatalogoItem[]>([]);
  const [tiposCita, setTiposCita] = useState<CatalogoItem[]>([]);
  const [estadosCita, setEstadosCita] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        setLoading(true);
        const catalogos = await catalogosService.getAllCatalogos();
        
        setTiposDocumento(catalogos.tiposDocumento || []);
        setSexos(catalogos.sexos || []);
        setEstados(catalogos.estados || []);
        setTiposCita(catalogos.tiposCita || []);
        setEstadosCita(catalogos.estadosCita || []);
        setError(null);
      } catch (err) {
        console.error('Error cargando catálogos:', err);
        setError('Error al cargar los catálogos');
      } finally {
        setLoading(false);
      }
    };

    cargarCatalogos();
  }, []);

  return {
    tiposDocumento,
    sexos,
    estados,
    tiposCita,
    estadosCita,
    loading,
    error,
  };
}

export default useCatalogos;