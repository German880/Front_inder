/**
 * Custom Hooks - Lógica reutilizable
 * Centralizan: estado, side effects, lógica de negocio
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  deportistasService, 
  historiaClinicaService, 
  Deportista, 
  CreateDeportistaDTO,
  HistoriaClinica,
  ApiError,
  getErrorMessage,
} from '../services/apiClient';

// ============================================================================
// TIPOS COMUNES
// ============================================================================

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// HOOK: useAsync (GENÉRICO)
// ============================================================================

/**
 * Hook genérico para manejar operaciones asincrónicas
 * @param asyncFunction Función async a ejecutar
 * @param immediate Si ejecutar inmediatamente
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): UseAsyncState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await asyncFunction();
      setState({ data: response, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: getErrorMessage(error),
      });
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    refetch: execute,
  };
}

// ============================================================================
// HOOK: useDeportistas
// ============================================================================

interface UseDeportistasReturn {
  deportistas: Deportista[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createDeportista: (data: CreateDeportistaDTO) => Promise<Deportista>;
  updateDeportista: (id: string, data: Partial<CreateDeportistaDTO>) => Promise<Deportista>;
  deleteDeportista: (id: string) => Promise<void>;
  searchDeportistas: (query: string) => Promise<void>;
}

export function useDeportistas(): UseDeportistasReturn {
  const [deportistas, setDeportistas] = useState<Deportista[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los deportistas
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deportistasService.getAll();
      setDeportistas(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear deportista
  const createDeportista = useCallback(async (data: CreateDeportistaDTO) => {
    setError(null);
    try {
      const newDeportista = await deportistasService.create(data);
      setDeportistas((prev) => [...prev, newDeportista]);
      return newDeportista;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  }, []);

  // Actualizar deportista
  const updateDeportista = useCallback(
    async (id: string, data: Partial<CreateDeportistaDTO>) => {
      setError(null);
      try {
        const updated = await deportistasService.update(id, data);
        setDeportistas((prev) =>
          prev.map((d) => (d.id === id ? updated : d))
        );
        return updated;
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      }
    },
    []
  );

  // Eliminar deportista
  const deleteDeportista = useCallback(async (id: string) => {
    setError(null);
    try {
      await deportistasService.delete(id);
      setDeportistas((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  }, []);

  // Buscar deportistas
  const searchDeportistas = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await deportistasService.search(query);
      setDeportistas(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    deportistas,
    loading,
    error,
    refetch,
    createDeportista,
    updateDeportista,
    deleteDeportista,
    searchDeportistas,
  };
}

// ============================================================================
// HOOK: useHistoriaClinica
// ============================================================================

interface UseHistoriaClinicaReturn {
  historiaClinica: HistoriaClinica | null;
  loading: boolean;
  error: string | null;
  saveHistoriaClinica: (data: Partial<HistoriaClinica>) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useHistoriaClinica(deportistaId: string | null): UseHistoriaClinicaReturn {
  const [historiaClinica, setHistoriaClinica] = useState<HistoriaClinica | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!deportistaId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await historiaClinicaService.getByDeportista(deportistaId);
      setHistoriaClinica(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [deportistaId]);

  const saveHistoriaClinica = useCallback(
    async (data: Partial<HistoriaClinica>) => {
      if (!deportistaId) throw new Error('Deportista ID es requerido');

      setError(null);
      try {
        const updated = await historiaClinicaService.save(deportistaId, data);
        setHistoriaClinica(updated);
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      }
    },
    [deportistaId]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    historiaClinica,
    loading,
    error,
    saveHistoriaClinica,
    refetch,
  };
}

// ============================================================================
// HOOK: usePagination
// ============================================================================

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

export function usePagination(
  totalItems: number,
  initialPageSize: number = 10
): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);

  const goToPage = useCallback((page: number) => {
    const maxPage = Math.max(1, totalPages);
    setCurrentPage(Math.min(Math.max(1, page), maxPage));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    pageSize,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}

// ============================================================================
// HOOK: useDebounce
// ============================================================================

/**
 * Hook para debounce de valores
 * @param value Valor a debounce
 * @param delay Delay en ms
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// HOOK: useLocalStorage
// ============================================================================

/**
 * Hook para sincronizar estado con localStorage
 * @param key Clave de localStorage
 * @param initialValue Valor inicial
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// ============================================================================
// HOOK: useFormState (para formularios complejos)
// ============================================================================

interface UseFormStateReturn<T> {
  formData: T;
  errors: Record<string, string>;
  setFormData: (data: Partial<T>) => void;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearErrors: () => void;
  resetFormData: () => void;
}

export function useFormState<T extends Record<string, any>>(
  initialData: T
): UseFormStateReturn<T> {
  const [formData, setFormDataState] = useState<T>(initialData);
  const [errors, setErrorsState] = useState<Record<string, string>>({});

  const setFormData = useCallback((data: Partial<T>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setErrorsState((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrorsState((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  const resetFormData = useCallback(() => {
    setFormDataState(initialData);
    setErrorsState({});
  }, [initialData]);

  return {
    formData,
    errors,
    setFormData,
    setError,
    clearError,
    clearErrors,
    resetFormData,
  };
}

// ============================================================================
// HOOK: useIsMounted
// ============================================================================

/**
 * Hook para verificar si el componente está montado
 * Útil para evitar memory leaks en operaciones async
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

// ============================================================================
// HOOK: usePrevious
// ============================================================================

/**
 * Hook para obtener el valor anterior de una prop
 * @param value Valor actual
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

import * as React from 'react';
