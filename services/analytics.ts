import { supabase } from '../lib/supabase'
import { Database } from '../types/supabase'

type EncuestaRow = Database['public']['Tables']['encuestalol']['Row']

export interface DashboardChart {
  id: string
  title: string
  type: 'pie' | 'bar' | 'line'
  data: Array<{
    label: string
    value: number
    percentage?: number // Para gráficos de pie
    color?: string
  }>
  description?: string
  totalSamples?: number
}

export type AnalyticsFilters = {
    theme?: string
    questionId?: string
    searchQuery?: string
    sexo?: number
    nse?: number
    calidadVida?: number
    edad?: number 
    escolaridad?: number
    municipio?: string
}

export type AggregatedResult = {
    questionId: string
    average: number
    total: number
    sampleSize: number // N
    breakdown: { label: string; value: number }[]
}

// Configuración interna para saber qué preguntar según el tema
type ThemeConfig = {
    column: string
    title: string
    type: 'pie' | 'bar' | 'line'
    logic: 'DISTRIBUTION' | 'AVERAGE' | 'BINARY' // Distribución (1,2,3...), Promedio (1-5), o Si/No
    labels?: Record<string | number, string> // Para traducir "1" a "Sí"
}

const DASHBOARD_MAP: Record<string, ThemeConfig[]> = {
    'bienestar': [
        { 
            column: 'Q_2', 
            title: 'Calidad de Vida por Municipio', 
            type: 'bar', 
            logic: 'AVERAGE' 
        },
        { 
            column: 'Q_3', 
            title: 'Nivel de Felicidad', 
            type: 'bar', 
            logic: 'AVERAGE' 
        }
    ],
    'economía': [
        { 
            column: 'Q_87', 
            title: 'Distribución de Autos por Hogar', 
            type: 'pie', 
            logic: 'DISTRIBUTION',
            labels: { 
                0: 'Sin auto', 
                1: '1 auto', 
                2: '2 autos', 
                3: '3+ autos' 
            }
        },
        {
            column: 'Q_86',
            title: 'Nivel Socioeconómico',
            type: 'bar',
            logic: 'DISTRIBUTION',
            labels: { 1: '0-5', 2: '6-10', 3: '11-15', 4: '16-20', 5: '21+' }
        }
    ],
    'Conectividad': [
        { 
            column: 'Q_88', 
            title: 'Acceso a Internet', 
            type: 'pie', 
            logic: 'BINARY',
            labels: { 1: 'Con Internet', 2: 'Sin Internet' }
        }
    ],
}


export const AnalyticsService = {
    async fetchAggregatedData(
        filters: AnalyticsFilters
    ): Promise<DashboardChart[] | null> {
        try {
            console.log('Obteniendo datos con filtros:', filters)
            let configs: ThemeConfig[] = []

            if (filters.theme) {
                configs = DASHBOARD_MAP[filters.theme] || []
            } else {
                configs = Object.values(DASHBOARD_MAP).flat()
            }

            if (configs.length === 0) return []

            // Query base 
            const uniqueColumns = [...new Set(configs.map(c => c.column))]

            const columnsToFetch = uniqueColumns.join(',')
            let query = supabase.from('encuestalol').select(columnsToFetch)

            if (filters.sexo) query = query.eq('Q_74', filters.sexo) 
            if (filters.municipio) query = query.eq('Q_94', filters.municipio)

            // 4. Ejecutar la consulta
            const { data, error } = await query

            if (error) {
                console.error('Error fetching analytics data:', error)
                throw error
            }

            if (!data || data.length === 0) return []

            const charts: DashboardChart[] = configs.map(config => {
                return this.processChart(data, config)
            })

            return charts

        } catch (error) {
            console.error('Analytics Service Error:', error)
            return null
        }
    },

    processChart(data: any[], config: ThemeConfig): DashboardChart {
        const validData = data.filter(row => row[config.column] !== null)
        const totalSamples = validData.length
            let chartData: { label: string; value: number }[] = []
            let description = `Basado en ${totalSamples} respuestas válidas`


            if (totalSamples === 0) {
            return {
                id: config.column,
                title: config.title,
                type: config.type,
                data: [],
                description: 'No hay datos disponibles para esta pregunta',
                totalSamples: 0
            }
        }

            if (config.logic === 'AVERAGE') {
                // ✅ Lógica para promedios por municipio o categoría
                const municipioStats: Record<string, { sum: number; count: number }> = {}

                validData.forEach(row => {
                const municipio = this.getMunicipioName(row['Q_94'])
                const value = Number(row[config.column])
                
                if (!municipioStats[municipio]) {
                    municipioStats[municipio] = { sum: 0, count: 0 }
                }
                municipioStats[municipio].sum += value
                municipioStats[municipio].count += 1
            })
            
            chartData = Object.entries(municipioStats).map(([municipio, stats]) => ({
                label: municipio,
                value: parseFloat((stats.sum / stats.count).toFixed(2))
            }))
            description = `Promedio por municipio (escala 1-5). ${description}`

        } 
        else {
            // Lógica para Distribución (Ej. Cuántos tienen Autos, Internet)
            const distribution: Record<string, number> = {}
            
            validData.forEach(row => {
                const rawValue = row[config.column]
                // Si tenemos una etiqueta amigable (ej. 1 -> "Sí"), la usamos
                const label = config.labels?.[rawValue] || String(rawValue)
                distribution[label] = (distribution[label] || 0) + 1
            })
            const total = Object.values(distribution).reduce((a, b) => a + b, 0)


            chartData = Object.entries(distribution).map(([label, value]) => ({
                label,
                value,
                percentage: parseFloat(((value / total) * 100).toFixed(1))
            }))
            description = `Distribución de respuestas. ${description}`

        }

        return {
            id: config.column,
            title: config.title,
            type: config.type,
            data: chartData,
            description,
            totalSamples
        }
    },

    getMunicipioName(id: any): string {
        const municipios: Record<string, string> = {
            '1': 'Guadalajara',
            '2': 'Zapopan', 
            '3': 'Tlaquepaque',
            '4': 'Tonalá',
            '5': 'El Salto',
            '6': 'Tlajomulco'
        }
        return municipios[String(id)] || `Municipio ${id}`
    }
/*
    aggregateQuestion(data: EncuestaRow[], questionId: string): AggregatedResult {
        const validData = data.filter((row) => {
            const val = (row as any)[questionId]
            return typeof val === 'number' && !isNaN(val)
        })

        const sampleSize = validData.length
        const total = validData.reduce(
            (sum, row) => sum + ((row as any)[questionId] as number),
            0
        )
        const average = sampleSize > 0 ? total / sampleSize : 0

        // Simple breakdown (e.g., distribution of values 1-5 or similar)
        // This assumes the question is a scale or categorical numeric
        const distribution: Record<string, number> = {}
        validData.forEach((row) => {
            const val = (row as any)[questionId]
            distribution[val] = (distribution[val] || 0) + 1
        })

        const breakdown = Object.entries(distribution).map(([label, value]) => ({
            label,
            value,
        }))

        return {
            questionId,
            average,
            total,
            sampleSize,
            breakdown,
        }
    },*/
}
