import { supabase } from '../lib/supabase'
import { Database } from '../types/supabase'

type EncuestaRow = Database['public']['Tables']['encuestalol']['Row']

export type AnalyticsFilters = {
    theme?: string
    questionId?: string
    searchQuery?: string
    sexo?: number
    nse?: number
    calidadVida?: number
    edad?: number // Exact match for now, or could be range
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

export const AnalyticsService = {
    async fetchAggregatedData(
        filters: AnalyticsFilters
    ): Promise<AggregatedResult | null> {
        try {
            let query = supabase.from('encuestalol').select('*')

            // Apply filters
            // Apply filters
            if (filters.sexo) {
                query = query.eq('SEXO', filters.sexo)
            }
            if (filters.nse) {
                query = query.eq('NSE2024', filters.nse)
            }
            if (filters.calidadVida) {
                query = query.eq('CALIDAD_VIDA', filters.calidadVida)
            }
            if (filters.edad) {
                // Assuming exact age for now, or we could add logic for ranges
                query = query.eq('EDAD', filters.edad)
            }
            if (filters.escolaridad) {
                query = query.eq('ESC', filters.escolaridad)
            }
            if (filters.municipio) {
                query = query.eq('MUNICIPIO', filters.municipio)
            }

            // We fetch all matching rows to aggregate client-side
            // In a real large-scale app, this should be a Postgres function (RPC)
            // console.log('Fetching analytics data with filters:', filters)
            const { data, error } = await query

            if (error) {
                console.error('Error fetching analytics data:', error)
                throw error
            }

            // console.log('Fetched data count:', data?.length)
            if (data && data.length > 0) {
                // console.log('Sample row:', data[0])
            }

            if (!data || data.length === 0) {
                return null
            }

            // If a specific question is selected, aggregate that
            if (filters.questionId) {
                return this.aggregateQuestion(data, filters.questionId)
            }

            // If no question selected, we can't easily aggregate "everything" into one number
            // So we might return null or a default aggregation.
            // For this prototype, let's aggregate the first available numeric question if none selected,
            // or just return null to prompt user to select a question.
            return null
        } catch (error) {
            console.error('Analytics Service Error:', error)
            return null
        }
    },

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
    },
}
