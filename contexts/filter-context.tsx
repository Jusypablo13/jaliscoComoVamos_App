import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { QueryFilters } from '../constants/indicators-map';

export interface FilterState {
  activeFilters: QueryFilters;
  pendingFilters: QueryFilters;
  isFilterModalVisible: boolean;
}

export interface CategoryData {
  [key: string]: any[];
}

interface FilterContextType {
  filterState: FilterState;
  setPendingFilters: (filters: QueryFilters) => void;
  applyFilters: (filters: QueryFilters) => void;
  showFilterModal: () => void;
  hideFilterModal: () => void;
  clearFilters: () => void;
  getActiveFilterCount: () => number;
  categoryData: CategoryData;
  refreshCategoryData: (categoryId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filterState, setFilterState] = useState<FilterState>({
    activeFilters: {},
    pendingFilters: {},
    isFilterModalVisible: false,
  });
  
  const [categoryData, setCategoryData] = useState<CategoryData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPendingFilters = useCallback((filters: QueryFilters) => {
    setFilterState(prev => ({
      ...prev,
      pendingFilters: filters,
    }));
  }, []);

  const applyFilters = useCallback((filters: QueryFilters) => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: filters,
      pendingFilters: filters,
      isFilterModalVisible: false,
    }));
  }, []);

  const showFilterModal = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      pendingFilters: prev.activeFilters,
      isFilterModalVisible: true,
    }));
  }, []);

  const hideFilterModal = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      isFilterModalVisible: false,
      pendingFilters: prev.activeFilters,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: {},
      pendingFilters: {},
    }));
  }, []);

  const getActiveFilterCount = useCallback(() => {
    return Object.keys(filterState.activeFilters).length;
  }, [filterState.activeFilters]);

  const refreshCategoryData = useCallback(async (categoryId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implementar la lógica real de fetch de datos de Supabase
      // Por ahora, simulamos datos
      const mockData = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        category: categoryId,
        value: Math.random() * 100,
        municipality: ['guadalajara', 'zapopan', 'tlaquepaque', 'tonala'][Math.floor(Math.random() * 4)],
        age: Math.floor(Math.random() * 60) + 18,
        gender: Math.random() > 0.5 ? 'masculino' : 'femenino',
        educationLevel: ['primaria', 'secundaria', 'preparatoria', 'universidad'][Math.floor(Math.random() * 4)],
      }));

      setCategoryData(prev => ({
        ...prev,
        [categoryId]: mockData
      }));
    } catch (err) {
      setError('Error al cargar datos de la categoría');
      console.error('Error refreshing category data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue: FilterContextType = {
    filterState,
    setPendingFilters,
    applyFilters,
    showFilterModal,
    hideFilterModal,
    clearFilters,
    getActiveFilterCount,
    categoryData,
    refreshCategoryData,
    isLoading,
    error,
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
