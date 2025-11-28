import { supabase } from '../lib/supabase'
import { Database } from '../types/supabase'
import { SCALE_MAX_THRESHOLD, MAX_RANGE_GROUPS, YES_NO_VALUES } from '../constants/chart-config'

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

/**
 * Helper function to get additional columns needed for client-side filtering.
 * Returns an array of column names that need to be selected.
 */
function getAdditionalColumnsForFilters(filters?: QuestionDistributionFilters): string[] {
    const columns: string[] = []
    if (filters?.escolaridadGroupId !== undefined) {
        columns.push('Q_76')
    }
    if (filters?.calidadVidaGroupId !== undefined) {
        columns.push('Q_2')
    }
    return columns
}

/**
 * Helper function to apply client-side filters for grouped values.
 * Filters data by education level and/or quality of life groups.
 */
function applyClientSideFilters(
    data: Record<string, unknown>[],
    filters?: QuestionDistributionFilters
): Record<string, unknown>[] {
    let filteredData = data

    // Filter by education group if provided
    if (filters?.escolaridadGroupId !== undefined) {
        const educationGroup = Object.values(EDUCATION_GROUPS).find(
            g => g.id === filters.escolaridadGroupId
        )
        if (educationGroup) {
            filteredData = filteredData.filter((row) => {
                const escolaridad = getColumnValue(row, 'Q_76')
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
                const calidadVida = getColumnValue(row, 'Q_2')
                return typeof calidadVida === 'number' && qualityGroup.values.includes(calidadVida)
            })
        }
    }

    return filteredData
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
 * Category label from the categoria_respuesta table.
 * Maps numeric values to categorical text labels for closed category questions.
 */
export type CategoryLabel = {
    numerico: number
    valor_categorico: string
}

/**
 * Range group for numeric questions with high escala_max.
 * Used to group continuous values into discrete ranges.
 */
export type RangeGroup = {
    min: number
    max: number
    label: string
}

/**
 * Yes/No distribution data structure.
 * Used for questions where is_yes_or_no = true.
 */
export type YesNoDistribution = {
    yesCount: number
    noCount: number
    yesPercentage: number
    noPercentage: number
    nValid: number
    n: number
}

/**
 * Generates dynamic range groups for numeric questions with high escala_max.
 * Creates up to MAX_RANGE_GROUPS equal-sized ranges.
 * 
 * @param escalaMax - Maximum value of the scale
 * @param minValue - Optional minimum value (default: 0)
 * @returns Array of RangeGroup objects
 */
export function generateRangeGroups(escalaMax: number, minValue: number = 0): RangeGroup[] {
    const range = escalaMax - minValue
    const groupSize = Math.ceil(range / MAX_RANGE_GROUPS)
    const groups: RangeGroup[] = []

    for (let i = 0; i < MAX_RANGE_GROUPS; i++) {
        const min = minValue + (i * groupSize)
        const max = Math.min(minValue + ((i + 1) * groupSize) - 1, escalaMax)
        
        if (min <= escalaMax) {
            groups.push({
                min,
                max,
                label: min === max ? `${min}` : `${min}-${max}`,
            })
        }
    }

    return groups
}

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

/**
 * Transforms QuestionDistribution data to BarDatum[] format using category labels.
 * Used for closed category questions where numeric values map to text labels.
 * 
 * @param distribution - The QuestionDistribution data from Supabase
 * @param categoryLabels - Map of numeric values to text labels
 * @param options - Optional configuration for the transformation
 * @returns Array of BarDatum objects for the chart
 */
export function distributionToBarDataWithLabels(
    distribution: QuestionDistribution,
    categoryLabels: CategoryLabel[],
    options?: {
        includeNsNc?: boolean
        nsNcLabel?: string
    }
): BarDatum[] {
    const { includeNsNc = false, nsNcLabel = 'NS/NC' } = options || {}

    // Create a map for quick lookup
    const labelMap = new Map<number, string>()
    categoryLabels.forEach(cat => labelMap.set(cat.numerico, cat.valor_categorico))

    return distribution.distribution
        .filter((item) => includeNsNc || !item.isNsNc)
        .map((item) => ({
            label: item.isNsNc 
                ? nsNcLabel 
                : labelMap.get(item.value) || String(item.value),
            value: item.percentage,
        }))
}

/**
 * Transforms QuestionDistribution data to BarDatum[] format using range groups.
 * Used for numeric questions with high escala_max where values should be grouped.
 * 
 * @param distribution - The QuestionDistribution data from Supabase
 * @param rangeGroups - Array of range groups to bucket values into
 * @returns Array of BarDatum objects for the chart
 */
export function distributionToBarDataWithRanges(
    distribution: QuestionDistribution,
    rangeGroups: RangeGroup[]
): BarDatum[] {
    // Initialize counts for each range
    const rangeCounts: { [label: string]: number } = {}
    rangeGroups.forEach(group => {
        rangeCounts[group.label] = 0
    })

    // Count valid responses (excluding NS/NC)
    let totalValidCount = 0
    distribution.distribution
        .filter(item => !item.isNsNc)
        .forEach(item => {
            const group = rangeGroups.find(g => item.value >= g.min && item.value <= g.max)
            if (group) {
                rangeCounts[group.label] += item.count
                totalValidCount += item.count
            }
        })

    // Convert to percentages
    return rangeGroups.map(group => ({
        label: group.label,
        value: totalValidCount > 0 
            ? parseFloat(((rangeCounts[group.label] / totalValidCount) * 100).toFixed(1))
            : 0,
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
            const additionalColumns = getAdditionalColumnsForFilters(filters)
            const columnsToSelect = [column, ...additionalColumns]
            
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
                return null;
            }

            // Apply client-side filters for grouped values
            const filteredData = applyClientSideFilters(
                data as Record<string, unknown>[],
                filters
            )

            if (filteredData.length === 0) {
                return null;
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
            const additionalColumns = getAdditionalColumnsForFilters(filters)
            const columnsToSelect = [column, 'Q_74', ...additionalColumns]
            
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
            const filteredData = applyClientSideFilters(
                data as Record<string, unknown>[],
                filters
            )

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

    /**
     * Fetches category labels for a closed category question from categoria_respuesta table.
     * 
     * @param preguntaId - The pregunta_id (e.g., "Q_4") to fetch labels for
     * @returns Array of CategoryLabel objects, or null if none found
     */
    async fetchCategoryLabels(preguntaId: string): Promise<CategoryLabel[] | null> {
        try {
            const { data, error } = await supabase
                .from('categoria_respuesta')
                .select('numerico, valor_categorico')
                .eq('pregunta_id', preguntaId)
                .order('numerico', { ascending: true });

            if (error) {
                console.error('Error fetching category labels:', error);
                return null;
            }

            if (!data || data.length === 0) {
                return null;
            }

            return data as CategoryLabel[];
        } catch (error) {
            console.error('Analytics Service Error (fetchCategoryLabels):', error);
            return null;
        }
    },

    /**
     * Calculates Yes/No distribution for a question marked as is_yes_or_no = true.
     * In the survey, 1 = Yes, 2 = No, 0 = NS/NC (excluded from percentage calculation).
     * 
     * @param distribution - The QuestionDistribution data
     * @returns YesNoDistribution object with counts and percentages
     */
    calculateYesNoDistribution(distribution: QuestionDistribution): YesNoDistribution {
        let yesCount = 0;
        let noCount = 0;
        let nValid = 0;
        let n = distribution.n;

        distribution.distribution.forEach(item => {
            if (item.value === YES_NO_VALUES.YES) {
                yesCount = item.count;
                nValid += item.count;
            } else if (item.value === YES_NO_VALUES.NO) {
                noCount = item.count;
                nValid += item.count;
            }
            // Value 0 (NS/NC) is excluded from valid count
        });

        const yesPercentage = nValid > 0 
            ? parseFloat(((yesCount / nValid) * 100).toFixed(1))
            : 0;
        const noPercentage = nValid > 0 
            ? parseFloat(((noCount / nValid) * 100).toFixed(1))
            : 0;

        return {
            yesCount,
            noCount,
            yesPercentage,
            noPercentage,
            nValid,
            n,
        };
    },

    /**
     * Determines the appropriate chart type for a question based on its metadata.
     * 
     * @param isYesOrNo - Whether the question is a yes/no type
     * @param isClosedCategory - Whether the question has closed category responses
     * @param escalaMax - Maximum scale value for numeric questions
     * @returns Chart type: 'pie', 'bar', or 'ranged-bar'
     */
    getChartType(
        isYesOrNo?: boolean | null,
        isClosedCategory?: boolean | null,
        escalaMax?: number | null
    ): 'pie' | 'bar' | 'ranged-bar' {
        // Yes/No questions use pie chart
        if (isYesOrNo === true) {
            return 'pie';
        }

        // Closed category questions use bar chart with custom labels
        if (isClosedCategory === true) {
            return 'bar';
        }

        // Numeric questions with high escala_max use ranged bar chart
        if (escalaMax && escalaMax > SCALE_MAX_THRESHOLD) {
            return 'ranged-bar';
        }

        // Default to standard bar chart
        return 'bar';
    },
}
