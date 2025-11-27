// Tipos para el sistema de filtros
export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterRange {
  min: number;
  max: number;
  step?: number;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'range';
  options?: FilterOption[];
  range?: FilterRange;
}

export interface QueryFilters {
  [key: string]: any;
}

// Tipos para categorías
export type CategoryId = 
  | 'calidad_vida' 
  | 'digital' 
  | 'economia' 
  | 'seguridad' 
  | 'salud' 
  | 'educacion';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description?: string;
  questions?: string[];
}

// Configuración de filtros disponibles
export const availableFilters: FilterConfig[] = [
  {
    id: 'municipality',
    label: 'Municipio',
    type: 'select',
    options: [
      { label: 'Guadalajara', value: 'guadalajara' },
      { label: 'Zapopan', value: 'zapopan' },
      { label: 'San Pedro Tlaquepaque', value: 'tlaquepaque' },
      { label: 'Tonalá', value: 'tonala' },
      { label: 'El Salto', value: 'el_salto' },
      { label: 'Tlajomulco de Zúñiga', value: 'tlajomulco' },
    ],
  },
  {
    id: 'ageRange',
    label: 'Rango de Edad',
    type: 'range',
    range: {
      min: 18,
      max: 65,
      step: 1,
    },
  },
  {
    id: 'gender',
    label: 'Género',
    type: 'select',
    options: [
      { label: 'Masculino', value: 'masculino' },
      { label: 'Femenino', value: 'femenino' },
      { label: 'Otro', value: 'otro' },
      { label: 'Prefiero no decir', value: 'no_especifica' },
    ],
  },
  {
    id: 'educationLevel',
    label: 'Nivel Educativo',
    type: 'multiselect',
    options: [
      { label: 'Sin estudios', value: 'sin_estudios' },
      { label: 'Primaria', value: 'primaria' },
      { label: 'Secundaria', value: 'secundaria' },
      { label: 'Preparatoria', value: 'preparatoria' },
      { label: 'Universidad', value: 'universidad' },
      { label: 'Posgrado', value: 'posgrado' },
    ],
  },
  {
    id: 'lifeQuality',
    label: 'Calidad de Vida Percibida',
    type: 'select',
    options: [
      { label: 'Muy mala', value: 1 },
      { label: 'Mala', value: 2 },
      { label: 'Regular', value: 3 },
      { label: 'Buena', value: 4 },
      { label: 'Muy buena', value: 5 },
    ],
  },
  {
    id: 'income',
    label: 'Nivel de Ingresos',
    type: 'select',
    options: [
      { label: 'Menos de $5,000', value: 'bajo' },
      { label: '$5,000 - $15,000', value: 'medio_bajo' },
      { label: '$15,000 - $30,000', value: 'medio' },
      { label: '$30,000 - $50,000', value: 'medio_alto' },
      { label: 'Más de $50,000', value: 'alto' },
    ],
  },
];

// Categorías disponibles
export const categories: Category[] = [
  {
    id: 'calidad_vida',
    name: 'Calidad de Vida',
    icon: '🏠',
    description: 'Indicadores sobre la percepción de calidad de vida en el área metropolitana de Guadalajara',
    questions: [
      'Satisfacción general con la vida',
      'Acceso a servicios públicos',
      'Condiciones de vivienda',
      'Espacio público y recreación'
    ],
  },
  {
    id: 'digital',
    name: 'Brecha Digital',
    icon: '📱',
    description: 'Análisis del acceso y uso de tecnologías digitales en la población',
    questions: [
      'Acceso a internet',
      'Uso de dispositivos móviles',
      'Habilidades digitales',
      'Gobierno digital'
    ],
  },
  {
    id: 'economia',
    name: 'Economía',
    icon: '💰',
    description: 'Indicadores económicos y de empleo en la región',
    questions: [
      'Situación laboral',
      'Ingresos familiares',
      'Acceso a crédito',
      'Emprendimiento'
    ],
  },
  {
    id: 'seguridad',
    name: 'Seguridad',
    icon: '🛡️',
    description: 'Percepción de seguridad y delincuencia en el área metropolitana',
    questions: [
      'Percepción de seguridad',
      'Victimización',
      'Confianza en autoridades',
      'Espacios seguros'
    ],
  },
  {
    id: 'salud',
    name: 'Salud',
    icon: '🏥',
    description: 'Acceso y calidad de servicios de salud',
    questions: [
      'Acceso a servicios médicos',
      'Calidad de atención',
      'Medicina preventiva',
      'Salud mental'
    ],
  },
  {
    id: 'educacion',
    name: 'Educación',
    icon: '📚',
    description: 'Calidad y acceso a servicios educativos',
    questions: [
      'Calidad educativa',
      'Acceso a educación',
      'Infraestructura escolar',
      'Educación digital'
    ],
  },
];

// Función auxiliar para obtener una categoría por ID
export const getCategoryById = (id: CategoryId): Category | undefined => {
  return categories.find(category => category.id === id);
};

// Función auxiliar para obtener un filtro por ID
export const getFilterById = (id: string): FilterConfig | undefined => {
  return availableFilters.find(filter => filter.id === id);
};
