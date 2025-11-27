import { supabase } from '../lib/supabase'
import { Database } from '../types/supabase'

type EncuestaRow = Database['public']['Tables']['encuestalol']['Row']

/**
 * Helper function to safely access a dynamic column value from a row.
 * Since survey columns are accessed dynamically by column name, we need
 * to use indexed access which TypeScript cannot type-check at compile time.
 * 
 * @param row - The row object from Supabase query
 * @param column - The column name to access
 * @returns The value at the column, or undefined if not present
 */
function getColumnValue(row: Record<string, unknown>, column: string): unknown {
    return row[column]
}

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

/**
 * NS/NC (No sabe/No contesta) special values that should be excluded from percentage calculations.
 * These are standard codes used in survey methodology:
 * - 99: Common code for "No sabe" (Don't know)
 * - 98: Common code for "No contesta" (No answer/Refused)
 * - -1: Alternative code for missing/invalid response
 * - 0: Alternative code for no response in some survey designs
 * 
 * Note: These values are specific to the survey design of Jalisco Cómo Vamos.
 * Modify this array if the survey methodology changes.
 */
const NS_NC_VALUES = [99, 98, -1, 0]

/**
 * Sexo (gender) values used in the Q_74 column.
 * These are used for filtering and grouping by gender.
 */
const SEXO_VALUES = {
    HOMBRE: 1,
    MUJER: 2,
} as const

const SEXO_LABELS: { [key: number]: string } = {
    [SEXO_VALUES.HOMBRE]: 'Hombre',
    [SEXO_VALUES.MUJER]: 'Mujer',
}

const SEXO_IDS = [SEXO_VALUES.HOMBRE, SEXO_VALUES.MUJER] as const

/**
 * Age range definitions for filtering.
 * The database column Q_75 contains the exact age of the respondent.
 * We group ages into ranges for easier analysis.
 */
export const AGE_RANGES = {
    '18-29': { id: 1, label: '18-29', min: 18, max: 29 },
    '30-44': { id: 2, label: '30-44', min: 30, max: 44 },
    '45-59': { id: 3, label: '45-59', min: 45, max: 59 },
    '60+': { id: 4, label: '60+', min: 60, max: 120 },
} as const

export type AgeRangeKey = keyof typeof AGE_RANGES

/**
 * Education level groupings for filtering.
 * The database column Q_76 contains values 1-17 representing specific education levels.
 * We group these into broader categories for analysis.
 * 
 * Mapping from Q_76 values to groups:
 * - Sec< (Secondary or less): 1-4, 17 (Primaria incompleta/completa, Secundaria incompleta/completa, Sin estudios)
 * - Prep (Preparatoria/Technical): 5-10 (Carrera comercial, Carrera técnica, Preparatoria)
 * - Univ+ (University or higher): 11-16 (Licenciatura, Maestría, Doctorado)
 */
export const EDUCATION_GROUPS: { [key: string]: { id: number; label: string; values: number[] } } = {
    'Sec<': { id: 1, label: 'Sec<', values: [1, 2, 3, 4, 17] },
    'Prep': { id: 2, label: 'Prep', values: [5, 6, 7, 8, 9, 10] },
    'Univ+': { id: 3, label: 'Univ+', values: [11, 12, 13, 14, 15, 16] },
}

export type EducationGroupKey = keyof typeof EDUCATION_GROUPS

/**
 * Quality of life groupings for filtering.
 * The database column Q_2 contains values 1-5 representing quality of life ratings.
 * We group these into three categories.
 * 
 * Mapping from Q_2 values to groups:
 * - Baja (Low): 1-2
 * - Media (Medium): 3
 * - Alta (High): 4-5
 */
export const QUALITY_OF_LIFE_GROUPS: { [key: string]: { id: number; label: string; values: number[] } } = {
    'Baja': { id: 1, label: '1-2 (Baja)', values: [1, 2] },
    'Media': { id: 2, label: '3 (Media)', values: [3] },
    'Alta': { id: 3, label: '4-5 (Alta)', values: [4, 5] },
}

export type QualityOfLifeGroupKey = keyof typeof QUALITY_OF_LIFE_GROUPS

/**
 * Extended filter options for question distribution queries.
 * Supports filtering by multiple demographic dimensions.
 */
export type QuestionDistributionFilters = {
    municipioId?: number           // Q_94: Municipality ID (1-6)
    sexoId?: number                // Q_74: Gender (1=Hombre, 2=Mujer)
    edadRangeId?: number           // Age range ID (1-4) mapped to Q_75 ranges
    escolaridadGroupId?: number    // Education group ID (1-3) mapped to Q_76 values
    calidadVidaGroupId?: number    // Quality of life group ID (1-3) mapped to Q_2 values
}

export type QuestionDistributionItem = {
    value: number
    count: number
    percentage: number
    isNsNc: boolean // Flag to indicate if this is NS/NC
}

export type QuestionDistribution = {
    questionId: number
    column: string
    n: number // Total sample size (all responses including NS/NC)
    nValid: number // Sample size for percentage calculation (excluding NS/NC)
    distribution: QuestionDistributionItem[]
}

export type SexoGroupKey = {
    sexo: string // "Hombre" or "Mujer"
}

export type GroupedDistributionItem = {
    key: SexoGroupKey
    n: number
    nValid: number
    distribution: QuestionDistributionItem[]
}

export type GroupedQuestionDistribution = {
    questionId: number
    column: string
    groupBy: string[] // e.g., ["sexo"]
    groups: GroupedDistributionItem[]
}

// Import BarDatum type from discrete-bar-chart to avoid duplication
import type { BarDatum } from '../components/analytics/discrete-bar-chart'
// Re-export for convenience
export type { BarDatum }

/**
 * Adapter function that transforms QuestionDistribution data to BarDatum[] format
 * for use with the DiscreteBarChart component.
 * 
 * This is a pure function that can be easily tested without UI.
 * 
 * @param distribution - The QuestionDistribution data from Supabase
 * @param options - Optional configuration for the transformation
 * @param options.includeNsNc - Whether to include NS/NC responses (default: false)
 * @param options.nsNcLabel - Label to use for NS/NC responses (default: 'NS/NC')
 * @returns Array of BarDatum objects for the chart
 */
export function distributionToBarData(
    distribution: QuestionDistribution,
    options?: {
        includeNsNc?: boolean
        nsNcLabel?: string
    }
): BarDatum[] {
    const { includeNsNc = false, nsNcLabel = 'NS/NC' } = options || {}

    return distribution.distribution
        .filter((item) => includeNsNc || !item.isNsNc)
        .map((item) => ({
            label: item.isNsNc ? nsNcLabel : String(item.value),
            value: item.percentage,
        }))
}

export const AnalyticsService = {
    async fetchAggregatedData(
        filters: AnalyticsFilters
    ): Promise<AggregatedResult | null> {
        try {
            let query = supabase.from('encuestalol').select('*').limit(3000);

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
            const val = getColumnValue(row as Record<string, unknown>, questionId)
            return typeof val === 'number' && !isNaN(val)
        })

        const sampleSize = validData.length
        const total = validData.reduce(
            (sum, row) => {
                const val = getColumnValue(row as Record<string, unknown>, questionId)
                return sum + (typeof val === 'number' ? val : 0)
            },
            0
        )
        const average = sampleSize > 0 ? total / sampleSize : 0

        // Simple breakdown (e.g., distribution of values 1-5 or similar)
        // This assumes the question is a scale or categorical numeric
        const distribution: Record<string, number> = {}
        validData.forEach((row) => {
            const val = getColumnValue(row as Record<string, unknown>, questionId)
            if (typeof val === 'number') {
                distribution[val] = (distribution[val] || 0) + 1
            }
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

    /**
     * Fetches the distribution of responses for a single question.
     * Supports filtering by multiple demographic dimensions.
     * This function:
     * 1. Queries Supabase for all responses to the specified question column
     * 2. Applies server-side filters where possible (municipality, sexo, age range)
     * 3. Applies client-side filters for grouped values (education, quality of life)
     * 4. Calculates distribution counts for each response value
     * 5. Calculates percentages excluding NS/NC responses
     * 
     * @param questionId - The numeric ID of the question (e.g., 31)
     * @param column - The column name in the encuesta table (e.g., "Q_31")
     * @param filters - Optional filters object with demographic filter options
     * @returns QuestionDistribution object with counts and percentages
     */
    async fetchQuestionDistribution(
        questionId: number,
        column: string,
        filters?: QuestionDistributionFilters
    ): Promise<QuestionDistribution | null> {
        try {
            // Determine which columns we need to select for filtering
            const columnsToSelect = [column]
            
            // Add columns needed for client-side filtering
            if (filters?.escolaridadGroupId !== undefined) {
                columnsToSelect.push('Q_76')
            }
            if (filters?.calidadVidaGroupId !== undefined) {
                columnsToSelect.push('Q_2')
            }
            
            // Fetch the columns we need from encuestalol
            let query = supabase
                .from('encuestalol')
                .select(columnsToSelect.join(', '))
                .limit(3000);

            // Apply municipality filter if provided (Q_94 is the municipality column)
            if (filters?.municipioId !== undefined) {
                query = query.eq('Q_94', filters.municipioId);
            }

            // Apply sexo filter if provided (Q_74 is the sexo column: 1=Hombre, 2=Mujer)
            if (filters?.sexoId !== undefined) {
                query = query.eq('Q_74', filters.sexoId);
            }

            // Apply age range filter if provided (Q_75 is the age column)
            if (filters?.edadRangeId !== undefined) {
                const ageRange = Object.values(AGE_RANGES).find(r => r.id === filters.edadRangeId)
                if (ageRange) {
                    query = query.gte('Q_75', ageRange.min).lte('Q_75', ageRange.max);
                }
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching question distribution:', error)
                throw error
            }

            if (!data || data.length === 0) {
                return null
            }

            // Apply client-side filters for grouped values
            let filteredData = data

            // Filter by education group if provided
            if (filters?.escolaridadGroupId !== undefined) {
                const educationGroup = Object.values(EDUCATION_GROUPS).find(
                    g => g.id === filters.escolaridadGroupId
                )
                if (educationGroup) {
                    filteredData = filteredData.filter((row) => {
                        const escolaridad = getColumnValue(row as Record<string, unknown>, 'Q_76')
                        return typeof escolaridad === 'number' && educationGroup.values.includes(escolaridad)
                    })
                }
            }

            // Filter by quality of life group if provided
            if (filters?.calidadVidaGroupId !== undefined) {
                const qualityGroup = Object.values(QUALITY_OF_LIFE_GROUPS).find(
                    g => g.id === filters.calidadVidaGroupId
                )
                if (qualityGroup) {
                    filteredData = filteredData.filter((row) => {
                        const calidadVida = getColumnValue(row as Record<string, unknown>, 'Q_2')
                        return typeof calidadVida === 'number' && qualityGroup.values.includes(calidadVida)
                    })
                }
            }

            if (filteredData.length === 0) {
                return null
            }

            // Count occurrences of each response value
            const valueCounts: Record<number, number> = {}
            let totalResponses = 0

            filteredData.forEach((row) => {
                const val = getColumnValue(row as Record<string, unknown>, column)
                if (typeof val === 'number' && !isNaN(val)) {
                    valueCounts[val] = (valueCounts[val] || 0) + 1
                    totalResponses++
                }
            })

            // Calculate valid responses (excluding NS/NC) for percentage calculation
            let validResponses = 0
            Object.entries(valueCounts).forEach(([value, count]) => {
                const numValue = parseInt(value, 10)
                if (!NS_NC_VALUES.includes(numValue)) {
                    validResponses += count
                }
            })

            // Build distribution array with percentages
            const distribution: QuestionDistributionItem[] = Object.entries(valueCounts)
                .map(([value, count]) => {
                    const numValue = parseInt(value, 10)
                    const isNsNc = NS_NC_VALUES.includes(numValue)
                    // Calculate percentage based on valid responses (excluding NS/NC)
                    const percentage = validResponses > 0 && !isNsNc
                        ? parseFloat(((count / validResponses) * 100).toFixed(1))
                        : 0
                    return {
                        value: numValue,
                        count,
                        percentage,
                        isNsNc,
                    }
                })
                .sort((a, b) => a.value - b.value) // Sort by value ascending

            return {
                questionId,
                column,
                n: totalResponses,
                nValid: validResponses,
                distribution,
            }
        } catch (error) {
            console.error('Analytics Service Error (fetchQuestionDistribution):', error)
            return null
        }
    },

    /**
     * Fetches the distribution of responses for a single question, grouped by sexo.
     * Returns separate distribution data for Hombre and Mujer.
     * Supports filtering by multiple demographic dimensions.
     * 
     * @param questionId - The numeric ID of the question (e.g., 31)
     * @param column - The column name in the encuesta table (e.g., "Q_31")
     * @param filters - Optional filters object with demographic filter options (sexoId is ignored since we're grouping by sexo)
     * @returns GroupedQuestionDistribution object with distribution data per sexo group
     */
    async fetchQuestionDistributionGroupedBySexo(
        questionId: number,
        column: string,
        filters?: QuestionDistributionFilters
    ): Promise<GroupedQuestionDistribution | null> {
        try {
            // Determine which columns we need to select for filtering
            const columnsToSelect = [column, 'Q_74']
            
            // Add columns needed for client-side filtering
            if (filters?.escolaridadGroupId !== undefined) {
                columnsToSelect.push('Q_76')
            }
            if (filters?.calidadVidaGroupId !== undefined) {
                columnsToSelect.push('Q_2')
            }
            
            // Fetch the columns we need from encuestalol
            let query = supabase
                .from('encuestalol')
                .select(columnsToSelect.join(', '))
                .limit(3000);

            // Apply municipality filter if provided (Q_94 is the municipality column)
            if (filters?.municipioId !== undefined) {
                query = query.eq('Q_94', filters.municipioId);
            }

            // Apply age range filter if provided (Q_75 is the age column)
            if (filters?.edadRangeId !== undefined) {
                const ageRange = Object.values(AGE_RANGES).find(r => r.id === filters.edadRangeId)
                if (ageRange) {
                    query = query.gte('Q_75', ageRange.min).lte('Q_75', ageRange.max);
                }
            }

            // Filter to valid sexo values (using SEXO_VALUES constants)
            query = query.gte('Q_74', SEXO_VALUES.HOMBRE).lte('Q_74', SEXO_VALUES.MUJER);

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching grouped question distribution:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                return null;
            }

            // Apply client-side filters for grouped values
            let filteredData = data

            // Filter by education group if provided
            if (filters?.escolaridadGroupId !== undefined) {
                const educationGroup = Object.values(EDUCATION_GROUPS).find(
                    g => g.id === filters.escolaridadGroupId
                )
                if (educationGroup) {
                    filteredData = filteredData.filter((row) => {
                        const escolaridad = getColumnValue(row as Record<string, unknown>, 'Q_76')
                        return typeof escolaridad === 'number' && educationGroup.values.includes(escolaridad)
                    })
                }
            }

            // Filter by quality of life group if provided
            if (filters?.calidadVidaGroupId !== undefined) {
                const qualityGroup = Object.values(QUALITY_OF_LIFE_GROUPS).find(
                    g => g.id === filters.calidadVidaGroupId
                )
                if (qualityGroup) {
                    filteredData = filteredData.filter((row) => {
                        const calidadVida = getColumnValue(row as Record<string, unknown>, 'Q_2')
                        return typeof calidadVida === 'number' && qualityGroup.values.includes(calidadVida)
                    })
                }
            }

            if (filteredData.length === 0) {
                return null;
            }

            // Group data by sexo
            const sexoGroups: { [key: number]: Record<string, unknown>[] } = {
                [SEXO_VALUES.HOMBRE]: [],
                [SEXO_VALUES.MUJER]: [],
            };

            filteredData.forEach((row) => {
                const sexoVal = getColumnValue(row as Record<string, unknown>, 'Q_74');
                if (typeof sexoVal === 'number' && SEXO_IDS.includes(sexoVal as typeof SEXO_IDS[number])) {
                    sexoGroups[sexoVal].push(row as Record<string, unknown>);
                }
            });

            // Calculate distribution for each group
            const calculateGroupDistribution = (
                rows: Record<string, unknown>[]
            ): { n: number; nValid: number; distribution: QuestionDistributionItem[] } => {
                const valueCounts: Record<number, number> = {};
                let totalResponses = 0;

                rows.forEach((row) => {
                    const val = getColumnValue(row, column);
                    if (typeof val === 'number' && !isNaN(val)) {
                        valueCounts[val] = (valueCounts[val] || 0) + 1;
                        totalResponses++;
                    }
                });

                // Calculate valid responses (excluding NS/NC) for percentage calculation
                let validResponses = 0;
                Object.entries(valueCounts).forEach(([value, count]) => {
                    const numValue = parseInt(value, 10);
                    if (!NS_NC_VALUES.includes(numValue)) {
                        validResponses += count;
                    }
                });

                // Build distribution array with percentages
                const distribution: QuestionDistributionItem[] = Object.entries(valueCounts)
                    .map(([value, count]) => {
                        const numValue = parseInt(value, 10);
                        const isNsNc = NS_NC_VALUES.includes(numValue);
                        const percentage = validResponses > 0 && !isNsNc
                            ? parseFloat(((count / validResponses) * 100).toFixed(1))
                            : 0;
                        return {
                            value: numValue,
                            count,
                            percentage,
                            isNsNc,
                        };
                    })
                    .sort((a, b) => a.value - b.value);

                return {
                    n: totalResponses,
                    nValid: validResponses,
                    distribution,
                };
            };

            const groups: GroupedDistributionItem[] = SEXO_IDS.map((sexoId) => {
                const groupData = calculateGroupDistribution(sexoGroups[sexoId]);
                return {
                    key: { sexo: SEXO_LABELS[sexoId] },
                    n: groupData.n,
                    nValid: groupData.nValid,
                    distribution: groupData.distribution,
                };
            });

            return {
                questionId,
                column,
                groupBy: ['sexo'],
                groups,
            };
        } catch (error) {
            console.error('Analytics Service Error (fetchQuestionDistributionGroupedBySexo):', error);
            return null;
        }
    },
}
