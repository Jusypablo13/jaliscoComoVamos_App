import { useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from './navigation/NavigationTypes'
import {
    AnalyticsService,
    QuestionDistribution,
    GroupedQuestionDistribution,
    QuestionDistributionItem,
    distributionToBarData,
} from '../services/analytics'
import { brandColors, typography } from '../styles/theme'
import { DiscreteBarChart } from './analytics/discrete-bar-chart'

type QuestionDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'QuestionDetail'>

// Municipality options with their IDs matching Q_94 values
const MUNICIPIOS = [
    { id: undefined, nombre: 'Todos los municipios (ZMG)' },
    { id: 1, nombre: 'El Salto' },
    { id: 2, nombre: 'Guadalajara' },
    { id: 3, nombre: 'San Pedro Tlaquepaque' },
    { id: 4, nombre: 'Tlajomulco de Zúñiga' },
    { id: 5, nombre: 'Tonalá' },
    { id: 6, nombre: 'Zapopan' },
]

// Sexo options with their IDs matching Q_74 values
const SEXOS = [
    { id: undefined, nombre: 'Todos' },
    { id: 1, nombre: 'Hombre' },
    { id: 2, nombre: 'Mujer' },
]

export function QuestionDetailScreen({ route }: QuestionDetailScreenProps) {
    const { questionId, column, questionText } = route.params

    const [distribution, setDistribution] = useState<QuestionDistribution | null>(null)
    const [groupedDistribution, setGroupedDistribution] = useState<GroupedQuestionDistribution | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false) // For overlay loading on filter change
    const [error, setError] = useState<string | null>(null)
    const [selectedMunicipioId, setSelectedMunicipioId] = useState<number | undefined>(undefined)
    const [selectedSexoId, setSelectedSexoId] = useState<number | undefined>(undefined)
    const [showGroupedBySexo, setShowGroupedBySexo] = useState(false)
    const [showTable, setShowTable] = useState(false)

    // Animation values for smooth transitions
    const fadeAnim = useRef(new Animated.Value(1)).current
    const overlayOpacity = useRef(new Animated.Value(0)).current

    // Track if this is the initial load
    const isInitialLoad = useRef(true)

    useEffect(() => {
        fetchDistribution()
    }, [questionId, column, selectedMunicipioId, selectedSexoId, showGroupedBySexo]);

    // Compute grouped table rows data for the cross-table view
    const groupedTableRows = useMemo(() => {
        if (!groupedDistribution) return []
        
        // Collect all unique response values across all groups
        const allValues = new Set<number>()
        groupedDistribution.groups.forEach(group => {
            group.distribution.forEach(item => allValues.add(item.value))
        })
        
        // Sort values ascending
        const sortedValues = Array.from(allValues).sort((a, b) => a - b)
        
        // Build row data with isNsNc determined by checking all groups
        return sortedValues.map(value => {
            // Check if this value is NS/NC by looking at all groups
            const isNsNc = groupedDistribution.groups.some(group => {
                const item = group.distribution.find(d => d.value === value)
                return item?.isNsNc ?? false
            })
            
            // Get item data for each group
            const groupItems: { sexo: string; item: QuestionDistributionItem | undefined }[] = 
                groupedDistribution.groups.map(group => ({
                    sexo: group.key.sexo,
                    item: group.distribution.find(d => d.value === value),
                }))
            
            return { value, isNsNc, groupItems }
        })
    }, [groupedDistribution]);

    // Compute bar chart data from distribution
    // Options are static so only distribution needs to be in dependency array
    const barChartData = useMemo(() => {
        if (!distribution) return []
        return distributionToBarData(distribution, { includeNsNc: false })
    }, [distribution])


    // Animation helper for chart transitions
    const animateChartTransition = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0.6,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start()
    }

    const fetchDistribution = async () => {
        // Determine if this is initial load or a filter change
        const hasExistingData = distribution !== null || groupedDistribution !== null
        
        if (isInitialLoad.current || !hasExistingData) {
            // Initial load - show full loading screen
            setIsLoading(true)
            isInitialLoad.current = false
        } else {
            // Filter change - show overlay on existing chart
            setIsRefreshing(true)
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start()
        }
        
        setError(null)
        try {
            if (showGroupedBySexo) {
                // Fetch grouped distribution by sexo
                const data = await AnalyticsService.fetchQuestionDistributionGroupedBySexo(
                    questionId, 
                    column, 
                    selectedMunicipioId
                )
                if (data) {
                    // Animate chart transition
                    if (hasExistingData) {
                        animateChartTransition()
                    }
                    setGroupedDistribution(data)
                    setDistribution(null)
                } else {
                    setError('No se encontraron datos para esta pregunta.')
                }
            } else {
                // Fetch simple distribution with optional sexo filter
                const data = await AnalyticsService.fetchQuestionDistribution(
                    questionId, 
                    column, 
                    selectedMunicipioId, 
                    selectedSexoId
                )
                if (data) {
                    // Animate chart transition
                    if (hasExistingData) {
                        animateChartTransition()
                    }
                    setDistribution(data)
                    setGroupedDistribution(null)
                } else {
                    setError('No se encontraron datos para esta pregunta.')
                }
            }
        } catch (err) {
            console.error('Error fetching distribution:', err)
            setError('Error al cargar los datos.')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
            // Hide overlay
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start()
        }
    }

    const getSelectedMunicipioName = () => {
        const municipio = MUNICIPIOS.find(m => m.id === selectedMunicipioId)
        return municipio?.nombre || MUNICIPIOS[0].nombre
    }

    const getSelectedSexoName = () => {
        const sexo = SEXOS.find(s => s.id === selectedSexoId)
        return sexo?.nombre || SEXOS[0].nombre
    }

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={brandColors.primary} />
                <Text style={styles.loadingText}>Calculando estadísticas...</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchDistribution}>
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (!distribution && !groupedDistribution) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No hay datos disponibles.</Text>
            </View>
        )
    }

    // Calculate the sum of percentages for simple distribution (should be ~100% for valid responses)
    const percentageSum = distribution 
        ? distribution.distribution
            .filter(item => !item.isNsNc)
            .reduce((sum, item) => sum + item.percentage, 0)
        : 0

    return (
        <ScrollView style={styles.container}>
            {/* Question Header */}
            <View style={styles.header}>
                <Text style={styles.columnLabel}>{column}</Text>
                {questionText && (
                    <Text style={styles.questionText}>{questionText}</Text>
                )}
            </View>

            {/* Municipality Filter */}
            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Municipio</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    <View style={styles.filterOptions}>
                        {MUNICIPIOS.map((municipio) => (
                            <TouchableOpacity
                                key={municipio.id ?? 'all'}
                                style={[
                                    styles.filterOption,
                                    selectedMunicipioId === municipio.id && styles.filterOptionSelected,
                                ]}
                                onPress={() => setSelectedMunicipioId(municipio.id)}
                            >
                                <Text
                                    style={[
                                        styles.filterOptionText,
                                        selectedMunicipioId === municipio.id && styles.filterOptionTextSelected,
                                    ]}
                                >
                                    {municipio.nombre}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Sexo Filter */}
            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Sexo</Text>
                <View style={styles.sexoFilterRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                        <View style={styles.filterOptions}>
                            {SEXOS.map((sexo) => (
                                <TouchableOpacity
                                    key={sexo.id ?? 'all'}
                                    style={[
                                        styles.filterOption,
                                        !showGroupedBySexo && selectedSexoId === sexo.id && styles.filterOptionSelected,
                                        showGroupedBySexo && styles.filterOptionDisabled,
                                    ]}
                                    onPress={() => {
                                        if (!showGroupedBySexo) {
                                            setSelectedSexoId(sexo.id)
                                        }
                                    }}
                                    disabled={showGroupedBySexo}
                                >
                                    <Text
                                        style={[
                                            styles.filterOptionText,
                                            !showGroupedBySexo && selectedSexoId === sexo.id && styles.filterOptionTextSelected,
                                            showGroupedBySexo && styles.filterOptionTextDisabled,
                                        ]}
                                    >
                                        {sexo.nombre}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                    {/* Toggle for grouped view */}
                    <TouchableOpacity
                        style={[
                            styles.groupToggle,
                            showGroupedBySexo && styles.groupToggleActive,
                        ]}
                        onPress={() => {
                            setShowGroupedBySexo(!showGroupedBySexo)
                            if (!showGroupedBySexo) {
                                // Reset individual sexo filter when enabling grouped view
                                setSelectedSexoId(undefined)
                            }
                        }}
                    >
                        <Text
                            style={[
                                styles.groupToggleText,
                                showGroupedBySexo && styles.groupToggleTextActive,
                            ]}
                        >
                            Tabla cruzada
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Active Filters Label */}
            <View style={styles.activeMunicipioContainer}>
                <Text style={styles.activeMunicipioLabel}>
                    {'Municipio: '}
                    <Text style={styles.activeMunicipioValue}>{getSelectedMunicipioName()}</Text>
                    {!showGroupedBySexo && ' | Sexo: '}
                    {!showGroupedBySexo && (
                        <Text style={styles.activeMunicipioValue}>{getSelectedSexoName()}</Text>
                    )}
                    {showGroupedBySexo && ' | '}
                    {showGroupedBySexo && (
                        <Text style={styles.activeMunicipioValue}>Agrupado por Sexo</Text>
                    )}
                </Text>
            </View>

            {/* Simple Distribution View */}
            {distribution && !showGroupedBySexo && (
                <>
                    {/* Sample Size Info */}
                    <View style={styles.sampleInfo}>
                        <View style={styles.sampleCard}>
                            <Text style={styles.sampleLabel}>Muestra Total (N)</Text>
                            <Text style={styles.sampleValue}>{distribution.n}</Text>
                        </View>
                        <View style={styles.sampleCard}>
                            <Text style={styles.sampleLabel}>Respuestas Válidas</Text>
                            <Text style={styles.sampleValue}>{distribution.nValid}</Text>
                        </View>
                    </View>

                    {/* Bar Chart with Loading Overlay */}
                    {barChartData.length > 0 && (
                        <View style={styles.chartSection}>
                            <Animated.View style={{ opacity: fadeAnim }}>
                                <DiscreteBarChart
                                    data={barChartData}
                                    title="Distribución de Respuestas"
                                    subtitle={`N válido = ${distribution.nValid}`}
                                />
                            </Animated.View>
                            {/* Loading Overlay */}
                            {isRefreshing && (
                                <Animated.View 
                                    style={[
                                        styles.chartOverlay,
                                        { opacity: overlayOpacity }
                                    ]}
                                >
                                    <ActivityIndicator size="large" color={brandColors.primary} />
                                    <Text style={styles.overlayText}>Actualizando...</Text>
                                </Animated.View>
                            )}
                        </View>
                    )}

                    {/* Toggle Button for Table View */}
                    <TouchableOpacity
                        style={styles.tableToggleButton}
                        onPress={() => setShowTable(!showTable)}
                    >
                        <Text style={styles.tableToggleText}>
                            {showTable ? 'Ocultar tabla de datos' : 'Ver resultados en tabla'}
                        </Text>
                    </TouchableOpacity>

                    {/* Distribution Table (Hidden by default) */}
                    {showTable && (
                        <View style={styles.tableContainer}>
                            <Text style={styles.sectionTitle}>Distribución de Respuestas</Text>
                            
                            {/* Table Header */}
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, styles.valueColumn]}>Valor</Text>
                                <Text style={[styles.tableHeaderCell, styles.countColumn]}>Conteo</Text>
                                <Text style={[styles.tableHeaderCell, styles.percentColumn]}>Porcentaje</Text>
                            </View>

                            {/* Table Rows */}
                            {distribution.distribution.map((item, index) => (
                                <View 
                                    key={item.value} 
                                    style={[
                                        styles.tableRow,
                                        index % 2 === 0 && styles.tableRowEven,
                                        item.isNsNc && styles.tableRowNsNc,
                                    ]}
                                >
                                    <Text style={[styles.tableCell, styles.valueColumn]}>
                                        {item.value}
                                        {item.isNsNc && <Text style={styles.nsNcLabel}> (NS/NC)</Text>}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.countColumn]}>{item.count}</Text>
                                    <Text style={[styles.tableCell, styles.percentColumn]}>
                                        {item.isNsNc ? '—' : `${item.percentage}%`}
                                    </Text>
                                </View>
                            ))}

                            {/* Table Footer */}
                            <View style={styles.tableFooter}>
                                <Text style={[styles.tableFooterCell, styles.valueColumn]}>Total</Text>
                                <Text style={[styles.tableFooterCell, styles.countColumn]}>{distribution.n}</Text>
                                <Text style={[styles.tableFooterCell, styles.percentColumn]}>
                                    {percentageSum.toFixed(1)}%
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Methodological Note */}
                    <View style={styles.noteContainer}>
                        <Text style={styles.noteTitle}>Notas Metodológicas:</Text>
                        <Text style={styles.noteText}>
                            • Los porcentajes se calculan excluyendo las respuestas NS/NC (No sabe/No contesta).
                        </Text>
                        <Text style={styles.noteText}>
                            • N = {distribution.n} encuestados respondieron esta pregunta.
                        </Text>
                        <Text style={styles.noteText}>
                            • N válido = {distribution.nValid} respuestas usadas para el cálculo de porcentajes.
                        </Text>
                    </View>
                </>
            )}

            {/* Grouped Distribution View (Cross Table by Sexo) */}
            {groupedDistribution && showGroupedBySexo && (
                <>
                    {/* Sample Size Info for Grouped Data */}
                    <View style={styles.sampleInfo}>
                        {groupedDistribution.groups.map((group) => (
                            <View key={group.key.sexo} style={styles.sampleCard}>
                                <Text style={styles.sampleLabel}>{group.key.sexo} (N)</Text>
                                <Text style={styles.sampleValue}>{group.n}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Grouped Distribution Table */}
                    <View style={styles.tableContainer}>
                        <Text style={styles.sectionTitle}>Distribución por Sexo</Text>
                        
                        {/* Table Header with dynamic columns for each sexo */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, styles.valueColumn]}>Valor</Text>
                            {groupedDistribution.groups.map((group) => (
                                <Text 
                                    key={group.key.sexo} 
                                    style={[styles.tableHeaderCell, styles.groupColumn]}
                                >
                                    {group.key.sexo}
                                </Text>
                            ))}
                        </View>

                        {/* Table Rows from memoized data */}
                        {groupedTableRows.map((row, index) => (
                            <View 
                                key={row.value} 
                                style={[
                                    styles.tableRow,
                                    index % 2 === 0 && styles.tableRowEven,
                                    row.isNsNc && styles.tableRowNsNc,
                                ]}
                            >
                                <Text style={[styles.tableCell, styles.valueColumn]}>
                                    {row.value}
                                    {row.isNsNc && <Text style={styles.nsNcLabel}> (NS/NC)</Text>}
                                </Text>
                                {row.groupItems.map((groupItem) => (
                                    <Text 
                                        key={`${groupItem.sexo}-${row.value}`}
                                        style={[styles.tableCell, styles.groupColumn]}
                                    >
                                        {groupItem.item 
                                            ? (row.isNsNc 
                                                ? `${groupItem.item.count}` 
                                                : `${groupItem.item.count} (${groupItem.item.percentage}%)`)
                                            : '0'}
                                    </Text>
                                ))}
                            </View>
                        ))}

                        {/* Table Footer with totals */}
                        <View style={styles.tableFooter}>
                            <Text style={[styles.tableFooterCell, styles.valueColumn]}>Total (N)</Text>
                            {groupedDistribution.groups.map((group) => (
                                <Text 
                                    key={`total-${group.key.sexo}`}
                                    style={[styles.tableFooterCell, styles.groupColumn]}
                                >
                                    {group.n}
                                </Text>
                            ))}
                        </View>
                    </View>

                    {/* Methodological Note */}
                    <View style={styles.noteContainer}>
                        <Text style={styles.noteTitle}>Notas Metodológicas:</Text>
                        <Text style={styles.noteText}>
                            • Los porcentajes se calculan por grupo excluyendo las respuestas NS/NC (No sabe/No contesta).
                        </Text>
                        <Text style={styles.noteText}>
                            • N total = {groupedDistribution.groups.reduce((sum, g) => sum + g.n, 0)} encuestados respondieron esta pregunta.
                        </Text>
                        {groupedDistribution.groups.map((group) => (
                            <Text key={`note-${group.key.sexo}`} style={styles.noteText}>
                                • N {group.key.sexo} = {group.n} (N válido = {group.nValid})
                            </Text>
                        ))}
                    </View>
                </>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: brandColors.background,
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.muted,
    },
    errorText: {
        fontFamily: typography.regular,
        fontSize: 16,
        color: brandColors.accent,
        textAlign: 'center',
    },
    emptyText: {
        fontFamily: typography.regular,
        fontSize: 16,
        color: brandColors.muted,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: brandColors.primary,
        borderRadius: 8,
    },
    retryButtonText: {
        fontFamily: typography.emphasis,
        fontSize: 14,
        color: brandColors.surface,
    },
    chartSection: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        position: 'relative',
    },
    chartOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    overlayText: {
        marginTop: 12,
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.muted,
    },
    tableToggleButton: {
        marginHorizontal: 16,
        marginBottom: 16,
        paddingVertical: 12,
        backgroundColor: brandColors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: brandColors.primary,
        alignItems: 'center',
    },
    tableToggleText: {
        fontFamily: typography.emphasis,
        fontSize: 14,
        color: brandColors.primary,
    },
    header: {
        padding: 16,
        backgroundColor: brandColors.surface,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E4EA',
    },
    columnLabel: {
        fontFamily: typography.emphasis,
        fontSize: 14,
        color: brandColors.muted,
        marginBottom: 4,
    },
    questionText: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: brandColors.primary,
        lineHeight: 24,
    },
    sampleInfo: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
    },
    sampleCard: {
        flex: 1,
        backgroundColor: brandColors.surface,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sampleLabel: {
        fontFamily: typography.regular,
        fontSize: 12,
        color: brandColors.muted,
        marginBottom: 4,
    },
    sampleValue: {
        fontFamily: typography.heading,
        fontSize: 24,
        color: brandColors.primary,
    },
    tableContainer: {
        margin: 16,
        backgroundColor: brandColors.surface,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: brandColors.primary,
        padding: 16,
        paddingBottom: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F5F7FA',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E4EA',
    },
    tableHeaderCell: {
        fontFamily: typography.emphasis,
        fontSize: 12,
        color: brandColors.primary,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    tableRowEven: {
        backgroundColor: '#FAFAFA',
    },
    tableRowNsNc: {
        backgroundColor: '#FFF8E1',
    },
    tableCell: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
    },
    nsNcLabel: {
        fontFamily: typography.regular,
        fontSize: 12,
        color: brandColors.muted,
    },
    tableFooter: {
        flexDirection: 'row',
        backgroundColor: '#F5F7FA',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    tableFooterCell: {
        fontFamily: typography.emphasis,
        fontSize: 14,
        color: brandColors.primary,
    },
    valueColumn: {
        flex: 2,
    },
    countColumn: {
        flex: 1,
        textAlign: 'right',
    },
    percentColumn: {
        flex: 1,
        textAlign: 'right',
    },
    noteContainer: {
        margin: 16,
        marginTop: 0,
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
    },
    noteTitle: {
        fontFamily: typography.emphasis,
        fontSize: 12,
        color: brandColors.text,
        marginBottom: 8,
    },
    noteText: {
        fontFamily: typography.regular,
        fontSize: 11,
        color: brandColors.muted,
        lineHeight: 18,
    },
    filterContainer: {
        padding: 16,
        backgroundColor: brandColors.surface,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E4EA',
    },
    filterLabel: {
        fontFamily: typography.emphasis,
        fontSize: 12,
        color: brandColors.muted,
        marginBottom: 8,
    },
    filterScroll: {
        flexGrow: 0,
    },
    filterOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    filterOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F7FA',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterOptionSelected: {
        backgroundColor: brandColors.primary,
        borderColor: brandColors.primary,
    },
    filterOptionText: {
        fontFamily: typography.regular,
        fontSize: 13,
        color: brandColors.text,
    },
    filterOptionTextSelected: {
        color: brandColors.surface,
        fontFamily: typography.emphasis,
    },
    activeMunicipioContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: brandColors.highlight,
    },
    activeMunicipioLabel: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
    },
    activeMunicipioValue: {
        fontFamily: typography.emphasis,
        color: brandColors.primary,
    },
    sexoFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    groupToggle: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F7FA',
        borderWidth: 1,
        borderColor: brandColors.muted,
    },
    groupToggleActive: {
        backgroundColor: brandColors.highlight,
        borderColor: brandColors.highlight,
    },
    groupToggleText: {
        fontFamily: typography.regular,
        fontSize: 12,
        color: brandColors.muted,
    },
    groupToggleTextActive: {
        fontFamily: typography.emphasis,
        color: brandColors.primary,
    },
    filterOptionDisabled: {
        backgroundColor: '#E8E8E8',
        borderColor: '#E8E8E8',
    },
    filterOptionTextDisabled: {
        color: '#A0A0A0',
    },
    groupColumn: {
        flex: 1,
        textAlign: 'center',
    },
})
