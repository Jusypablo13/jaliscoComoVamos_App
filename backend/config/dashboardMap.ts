// config/dashboardMap.ts

export const DASHBOARD_CONFIG = {
  // Pestaña "Economía"
  economia: [
    {
      id: 'autos_distribucion',
      title: 'Automóviles por Hogar',
      type: 'PIE', // Gráfica de Pastel
      sqlLogic: 'DISTRIBUTION', // Lógica: contar cuántos tienen 0, 1, 2...
      column: 'Q_87', // Columna de la BD
      labels: { 0: '0 Autos', 1: '1 Auto', 2: '2 Autos', 3: '3+ Autos' } // Mapeo opcional
    },
    {
      id: 'riqueza_focos',
      title: 'Nivel Socioeconómico (Focos)',
      type: 'BAR',
      sqlLogic: 'DISTRIBUTION',
      column: 'Q_86',
      // Según tu PDF: 1=0-5 focos, 2=6-10, etc.
      labels: { 1: '0-5', 2: '6-10', 3: '11-15', 4: '16-20', 5: '21+' }
    }
  ],
  // Pestaña "Bienestar"
  bienestar: [
    {
      id: 'calidad_vida_promedio',
      title: 'Promedio Calidad de Vida (1-5)',
      type: 'BAR',
      sqlLogic: 'AVERAGE_BY_MUNI', // Lógica: Promedio agrupado por municipio
      column: 'Q_2'
    },
    {
      id: 'felicidad_promedio',
      title: 'Promedio Felicidad (1-5)',
      type: 'BAR',
      sqlLogic: 'AVERAGE_BY_MUNI',
      column: 'Q_3'
    }
  ],
  // Pestaña "Conectividad"
  conectividad: [
    {
      id: 'internet_acceso',
      title: 'Acceso a Internet',
      type: 'DONUT',
      sqlLogic: 'BINARY_COUNT', // Lógica: Sí/No
      column: 'Q_88',
      labels: { 1: 'Sí', 2: 'No' }
    }
  ]
};