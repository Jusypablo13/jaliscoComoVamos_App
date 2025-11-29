import { useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from './navigation/NavigationTypes'
import {
    AnalyticsService,
    Question,
    QuestionDistribution,
    GroupedQuestionDistribution,
    QuestionDistributionItem,
    QuestionDistributionFilters,
    distributionToBarData,
    distributionToBarDataWithLabels,
    distributionToBarDataWithRanges,
    generateRangeGroups,
    CategoryLabel,
    YesNoDistribution,
    AGE_RANGES,
    EDUCATION_GROUPS,
    QUALITY_OF_LIFE_GROUPS,
} from '../services/analytics'
import { SCALE_MAX_THRESHOLD } from '../constants/chart-config'
import { brandColors, typography } from '../styles/theme'
import { DiscreteBarChart } from './analytics/discrete-bar-chart'
import { YesNoPieChart } from './analytics/yes-no-pie-chart'

// Dropdown filter option type
type FilterOption<T> = {
    id: T
    nombre: string
}

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

// Age range options
const EDADES = [
    { id: undefined, nombre: 'Todos' },
    ...Object.values(AGE_RANGES).map(range => ({ id: range.id, nombre: range.label })),
]

// Education level options
const ESCOLARIDADES = [
    { id: undefined, nombre: 'Todos' },
    ...Object.values(EDUCATION_GROUPS).map(group => ({ id: group.id, nombre: group.label })),
]

// Quality of life options
const CALIDADES_VIDA = [
    { id: undefined, nombre: 'Todos' },
    ...Object.values(QUALITY_OF_LIFE_GROUPS).map(group => ({ id: group.id, nombre: group.label })),
]

export function QuestionDetailScreen({ route, navigation }: QuestionDetailScreenProps) {
    const { questionId, column, questionText, questionDescription, isYesOrNo, isClosedCategory, escalaMax, theme } = route.params

    const [questions, setQuestions] = useState<Question[]>([])

    // Fetch questions for navigation
    useEffect(() => {
        if (theme) {
            AnalyticsService.fetchQuestionsForTheme(theme).then(setQuestions)
        }
    }, [theme])

    const currentQuestionIndex = useMemo(() => {
        return questions.findIndex(q => q.pregunta_id === column)
    }, [questions, column])

    const hasNext = currentQuestionIndex !== -1 && currentQuestionIndex < questions.length - 1
    const hasPrev = currentQuestionIndex !== -1 && currentQuestionIndex > 0

    const handleNext = () => {
        if (hasNext) {
            const nextQuestion = questions[currentQuestionIndex + 1]
            navigation.setParams({
                questionId: nextQuestion.id || 0,
                column: nextQuestion.pregunta_id,
                questionText: nextQuestion.texto_pregunta || undefined,
                questionDescription: nextQuestion.descripcion || undefined,
                isYesOrNo: nextQuestion.is_yes_or_no,
                isClosedCategory: nextQuestion.is_closed_category,
                escalaMax: nextQuestion.escala_max,
                theme
            })
        }
    }

    const handlePrev = () => {
        if (hasPrev) {
            const prevQuestion = questions[currentQuestionIndex - 1]
            navigation.setParams({
                questionId: prevQuestion.id || 0,
                column: prevQuestion.pregunta_id,
                questionText: prevQuestion.texto_pregunta || undefined,
                questionDescription: prevQuestion.descripcion || undefined,
                isYesOrNo: prevQuestion.is_yes_or_no,
                isClosedCategory: prevQuestion.is_closed_category,
                escalaMax: prevQuestion.escala_max,
                theme
            })
        }
    }

    const [distribution, setDistribution] = useState<QuestionDistribution | null>(null)
    const [groupedDistribution, setGroupedDistribution] = useState<GroupedQuestionDistribution | null>(null)
    const [categoryLabels, setCategoryLabels] = useState<CategoryLabel[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false) // For overlay loading on filter change
    const [error, setError] = useState<string | null>(null)
    const [selectedMunicipioId, setSelectedMunicipioId] = useState<number | undefined>(undefined)
    const [selectedSexoId, setSelectedSexoId] = useState<number | undefined>(undefined)
    const [selectedEdadRangeId, setSelectedEdadRangeId] = useState<number | undefined>(undefined)
    const [selectedEscolaridadGroupId, setSelectedEscolaridadGroupId] = useState<number | undefined>(undefined)
    const [selectedCalidadVidaGroupId, setSelectedCalidadVidaGroupId] = useState<number | undefined>(undefined)
    const [showGroupedBySexo, setShowGroupedBySexo] = useState(false)
    const [showTable, setShowTable] = useState(false)

    // Dropdown modal state
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    // Determine chart type based on question metadata
    const chartType = useMemo(() =>
        AnalyticsService.getChartType(isYesOrNo, isClosedCategory, escalaMax),
        [isYesOrNo, isClosedCategory, escalaMax]
    )

    // Fetch category labels for closed category questions
    useEffect(() => {
        if (isClosedCategory === true) {
            AnalyticsService.fetchCategoryLabels(column)
                .then(labels => {
                    setCategoryLabels(labels)
                })
                .catch(error => {
                    console.error('Error fetching category labels:', error)
                    setCategoryLabels(null)
                })
        } else {
            // Clear stale category labels when question type changes
            setCategoryLabels(null)
        }
    }, [column, isClosedCategory])

    // Animation values for smooth transitions
    const fadeAnim = useRef(new Animated.Value(1)).current
    const overlayOpacity = useRef(new Animated.Value(0)).current

    // Track if this is the initial load
    const isInitialLoad = useRef(true)

    // Memoize filters object to avoid recreating on every render
    const filters = useMemo<QuestionDistributionFilters>(() => ({
        municipioId: selectedMunicipioId,
        sexoId: selectedSexoId,
        edadRangeId: selectedEdadRangeId,
        escolaridadGroupId: selectedEscolaridadGroupId,
        calidadVidaGroupId: selectedCalidadVidaGroupId,
    }), [selectedMunicipioId, selectedSexoId, selectedEdadRangeId, selectedEscolaridadGroupId, selectedCalidadVidaGroupId])

    useEffect(() => {
        fetchDistribution()
    }, [questionId, column, filters, showGroupedBySexo]);

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
    // Uses appropriate transformation based on chart type
    const barChartData = useMemo(() => {
        if (!distribution) return []

        // For closed category questions, use category labels if available
        if (chartType === 'bar' && isClosedCategory === true && categoryLabels && categoryLabels.length > 0) {
            return distributionToBarDataWithLabels(distribution, categoryLabels, { includeNsNc: false })
        }

        // For numeric questions with high escala_max, use range grouping
        if (chartType === 'ranged-bar' && escalaMax) {
            const rangeGroups = generateRangeGroups(escalaMax)
            return distributionToBarDataWithRanges(distribution, rangeGroups)
        }

        // Default: standard bar data transformation
        return distributionToBarData(distribution, { includeNsNc: false })
    }, [distribution, chartType, isClosedCategory, categoryLabels, escalaMax])

    // Compute yes/no distribution for pie chart
    const yesNoDistribution = useMemo<YesNoDistribution | null>(() => {
        if (!distribution || chartType !== 'pie') return null
        return AnalyticsService.calculateYesNoDistribution(distribution)
    }, [distribution, chartType])

    // Helper to get category label for a numeric value
    const getCategoryLabel = (numericValue: number): string | null => {
        if (!categoryLabels || categoryLabels.length === 0) return null
        const label = categoryLabels.find(cat => cat.numerico === numericValue)
        return label?.valor_categorico || null
    }

    // Check if we have category labels to show
    const hasCategoryLabels = isClosedCategory === true && categoryLabels && categoryLabels.length > 0


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
                    filters
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
                // Fetch simple distribution with optional filters
                const data = await AnalyticsService.fetchQuestionDistribution(
                    questionId,
                    column,
                    filters
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

    const getSelectedEdadName = () => {
        const edad = EDADES.find(e => e.id === selectedEdadRangeId)
        return edad?.nombre || EDADES[0].nombre
    }

    const getSelectedEscolaridadName = () => {
        const escolaridad = ESCOLARIDADES.find(e => e.id === selectedEscolaridadGroupId)
        return escolaridad?.nombre || ESCOLARIDADES[0].nombre
    }

    const getSelectedCalidadVidaName = () => {
        const calidadVida = CALIDADES_VIDA.find(c => c.id === selectedCalidadVidaGroupId)
        return calidadVida?.nombre || CALIDADES_VIDA[0].nombre
    }

    // Get a summary of active filters for display
    const getActiveFiltersText = () => {
        const parts: string[] = []
        if (selectedMunicipioId !== undefined) {
            parts.push(`Municipio: ${getSelectedMunicipioName()}`)
        }
        if (!showGroupedBySexo && selectedSexoId !== undefined) {
            parts.push(`Sexo: ${getSelectedSexoName()}`)
        }
        if (selectedEdadRangeId !== undefined) {
            parts.push(`Edad: ${getSelectedEdadName()}`)
        }
        if (selectedEscolaridadGroupId !== undefined) {
            parts.push(`Escolaridad: ${getSelectedEscolaridadName()}`)
        }
        if (selectedCalidadVidaGroupId !== undefined) {
            parts.push(`Calidad de vida: ${getSelectedCalidadVidaName()}`)
        }
        if (showGroupedBySexo) {
            parts.push('Agrupado por Sexo')
        }
        return parts.length > 0 ? parts.join(' | ') : 'Sin filtros activos'
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

    // Render a dropdown selector button
    const renderDropdownButton = (
        label: string,
        selectedValue: string,
        dropdownKey: string,
        isDisabled: boolean = false
    ) => (
        <TouchableOpacity
            style={[
                styles.dropdownButton,
                isDisabled && styles.dropdownButtonDisabled,
            ]}
            onPress={() => !isDisabled && setActiveDropdown(dropdownKey)}
            disabled={isDisabled}
        >
            <Text style={[styles.dropdownButtonLabel, isDisabled && styles.dropdownButtonLabelDisabled]}>{label}</Text>
            <View style={styles.dropdownButtonValueRow}>
                <Text 
                    style={[styles.dropdownButtonValue, isDisabled && styles.dropdownButtonValueDisabled]} 
                    numberOfLines={1}
                >
                    {selectedValue}
                </Text>
                <Ionicons 
                    name="chevron-down" 
                    size={16} 
                    color={isDisabled ? '#A0A0A0' : brandColors.primary} 
                />
            </View>
        </TouchableOpacity>
    )

    // Render the dropdown modal
    const renderDropdownModal = <T extends number | undefined>(
        dropdownKey: string,
        title: string,
        options: FilterOption<T>[],
        selectedId: T,
        onSelect: (id: T) => void
    ) => (
        <Modal
            visible={activeDropdown === dropdownKey}
            transparent
            animationType="fade"
            onRequestClose={() => setActiveDropdown(null)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setActiveDropdown(null)}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                            <Ionicons name="close" size={24} color={brandColors.muted} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => String(item.id ?? 'all')}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.modalOption,
                                    selectedId === item.id && styles.modalOptionSelected,
                                ]}
                                onPress={() => {
                                    onSelect(item.id)
                                    setActiveDropdown(null)
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalOptionText,
                                        selectedId === item.id && styles.modalOptionTextSelected,
                                    ]}
                                >
                                    {item.nombre}
                                </Text>
                                {selectedId === item.id && (
                                    <Ionicons name="checkmark" size={20} color={brandColors.primary} />
                                )}
                            </TouchableOpacity>
                        )}
                        style={styles.modalList}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    )

    return (
        <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
            {/* Sticky Header: Question Title, Description, and Filters */}
            <View style={styles.stickyHeader}>
                {/* Question Header */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity
                            onPress={handlePrev}
                            disabled={!hasPrev}
                            style={styles.navButton}
                        >
                            <Ionicons name="chevron-back" size={24} color={hasPrev ? brandColors.primary : brandColors.muted} />
                        </TouchableOpacity>

                        <Text style={styles.columnLabel}>{column}</Text>

                        <TouchableOpacity
                            onPress={handleNext}
                            disabled={!hasNext}
                            style={styles.navButton}
                        >
                            <Ionicons name="chevron-forward" size={24} color={hasNext ? brandColors.primary : brandColors.muted} />
                        </TouchableOpacity>
                    </View>
                    {questionText && (
                        <Text style={styles.questionText}>{questionText}</Text>
                    )}
                    {questionDescription && (
                        <Text style={styles.questionDescription}>{questionDescription}</Text>
                    )}
                </View>

                {/* Compact Filter Dropdowns */}
                <View style={styles.filtersContainer}>
                    <View style={styles.filtersRow}>
                        {renderDropdownButton(
                            'Municipio',
                            getSelectedMunicipioName(),
                            'municipio'
                        )}
                        {renderDropdownButton(
                            'Sexo',
                            showGroupedBySexo ? 'Tabla cruzada' : getSelectedSexoName(),
                            'sexo',
                            showGroupedBySexo
                        )}
                        {renderDropdownButton(
                            'Edad',
                            getSelectedEdadName(),
                            'edad'
                        )}
                    </View>
                    <View style={styles.filtersRow}>
                        {renderDropdownButton(
                            'Escolaridad',
                            getSelectedEscolaridadName(),
                            'escolaridad'
                        )}
                        {renderDropdownButton(
                            'Calidad de vida',
                            getSelectedCalidadVidaName(),
                            'calidadVida'
                        )}
                        {/* Toggle for grouped view */}
                        <TouchableOpacity
                            style={[
                                styles.groupToggleCompact,
                                showGroupedBySexo && styles.groupToggleCompactActive,
                            ]}
                            onPress={() => {
                                setShowGroupedBySexo(!showGroupedBySexo)
                                if (!showGroupedBySexo) {
                                    // Reset individual sexo filter when enabling grouped view
                                    setSelectedSexoId(undefined)
                                }
                            }}
                        >
                            <Ionicons 
                                name="git-compare-outline" 
                                size={16} 
                                color={showGroupedBySexo ? brandColors.primary : brandColors.muted} 
                            />
                            <Text
                                style={[
                                    styles.groupToggleCompactText,
                                    showGroupedBySexo && styles.groupToggleCompactTextActive,
                                ]}
                            >
                                Cruzada
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Dropdown Modals */}
            {renderDropdownModal(
                'municipio',
                'Seleccionar Municipio',
                MUNICIPIOS,
                selectedMunicipioId,
                setSelectedMunicipioId
            )}
            {renderDropdownModal(
                'sexo',
                'Seleccionar Sexo',
                SEXOS,
                selectedSexoId,
                setSelectedSexoId
            )}
            {renderDropdownModal(
                'edad',
                'Seleccionar Edad',
                EDADES,
                selectedEdadRangeId,
                setSelectedEdadRangeId
            )}
            {renderDropdownModal(
                'escolaridad',
                'Seleccionar Escolaridad',
                ESCOLARIDADES,
                selectedEscolaridadGroupId,
                setSelectedEscolaridadGroupId
            )}
            {renderDropdownModal(
                'calidadVida',
                'Seleccionar Calidad de Vida',
                CALIDADES_VIDA,
                selectedCalidadVidaGroupId,
                setSelectedCalidadVidaGroupId
            )}

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

                    {/* Chart Section with Loading Overlay */}
                    {chartType === 'pie' && yesNoDistribution ? (
                        <View style={styles.chartSection}>
                            <Animated.View style={{ opacity: fadeAnim }}>
                                <YesNoPieChart
                                    yesPercentage={yesNoDistribution.yesPercentage}
                                    noPercentage={yesNoDistribution.noPercentage}
                                    yesCount={yesNoDistribution.yesCount}
                                    noCount={yesNoDistribution.noCount}
                                    title="Distribución de Respuestas"
                                    subtitle={`N válido = ${yesNoDistribution.nValid}`}
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
                    ) : barChartData.length > 0 && (
                        <View style={styles.chartSection}>
                            <Animated.View style={{ opacity: fadeAnim }}>
                                <DiscreteBarChart
                                    data={barChartData}
                                    title={chartType === 'ranged-bar' ? "Distribución por Rangos" : "Distribución de Respuestas"}
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
                                <Text style={[styles.tableHeaderCell, hasCategoryLabels ? styles.valueColumnWithLabel : styles.valueColumn]}>Valor</Text>
                                {hasCategoryLabels && (
                                    <Text style={[styles.tableHeaderCell, styles.labelColumn]}>Etiqueta</Text>
                                )}
                                <Text style={[styles.tableHeaderCell, styles.countColumn]}>Conteo</Text>
                                <Text style={[styles.tableHeaderCell, styles.percentColumn]}>Porcentaje</Text>
                            </View>

                            {/* Table Rows */}
                            {distribution.distribution.map((item, index) => {
                                const categoryLabel = getCategoryLabel(item.value)
                                return (
                                    <View
                                        key={item.value}
                                        style={[
                                            styles.tableRow,
                                            index % 2 === 0 && styles.tableRowEven,
                                            item.isNsNc && styles.tableRowNsNc,
                                        ]}
                                    >
                                        <Text style={[styles.tableCell, hasCategoryLabels ? styles.valueColumnWithLabel : styles.valueColumn]}>
                                            {item.value}
                                            {item.isNsNc && <Text style={styles.nsNcLabel}> (NS/NC)</Text>}
                                        </Text>
                                        {hasCategoryLabels && (
                                            <Text style={[styles.tableCell, styles.labelColumn]} numberOfLines={2}>
                                                {categoryLabel || '—'}
                                            </Text>
                                        )}
                                        <Text style={[styles.tableCell, styles.countColumn]}>{item.count}</Text>
                                        <Text style={[styles.tableCell, styles.percentColumn]}>
                                            {item.isNsNc ? '—' : `${item.percentage}%`}
                                        </Text>
                                    </View>
                                )
                            })}

                            {/* Table Footer */}
                            <View style={styles.tableFooter}>
                                <Text style={[styles.tableFooterCell, hasCategoryLabels ? styles.valueColumnWithLabel : styles.valueColumn]}>Total</Text>
                                {hasCategoryLabels && (
                                    <Text style={[styles.tableFooterCell, styles.labelColumn]}></Text>
                                )}
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
                            <Text style={[styles.tableHeaderCell, hasCategoryLabels ? styles.valueColumnWithLabel : styles.valueColumn]}>Valor</Text>
                            {hasCategoryLabels && (
                                <Text style={[styles.tableHeaderCell, styles.labelColumn]}>Etiqueta</Text>
                            )}
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
                        {groupedTableRows.map((row, index) => {
                            const categoryLabel = getCategoryLabel(row.value)
                            return (
                                <View
                                    key={row.value}
                                    style={[
                                        styles.tableRow,
                                        index % 2 === 0 && styles.tableRowEven,
                                        row.isNsNc && styles.tableRowNsNc,
                                    ]}
                                >
                                    <Text style={[styles.tableCell, hasCategoryLabels ? styles.valueColumnWithLabel : styles.valueColumn]}>
                                        {row.value}
                                        {row.isNsNc && <Text style={styles.nsNcLabel}> (NS/NC)</Text>}
                                    </Text>
                                    {hasCategoryLabels && (
                                        <Text style={[styles.tableCell, styles.labelColumn]} numberOfLines={2}>
                                            {categoryLabel || '—'}
                                        </Text>
                                    )}
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
                            )
                        })}

                        {/* Table Footer with totals */}
                        <View style={styles.tableFooter}>
                            <Text style={[styles.tableFooterCell, hasCategoryLabels ? styles.valueColumnWithLabel : styles.valueColumn]}>Total (N)</Text>
                            {hasCategoryLabels && (
                                <Text style={[styles.tableFooterCell, styles.labelColumn]}></Text>
                            )}
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
    questionDescription: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.muted,
        lineHeight: 20,
        marginTop: 8,
    },
    stickyHeader: {
        backgroundColor: brandColors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    filtersContainer: {
        padding: 12,
        paddingTop: 8,
        backgroundColor: brandColors.surface,
        borderTopWidth: 1,
        borderTopColor: '#E0E4EA',
    },
    filtersRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    dropdownButton: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E0E4EA',
    },
    dropdownButtonDisabled: {
        backgroundColor: '#E8E8E8',
        borderColor: '#E8E8E8',
    },
    dropdownButtonLabel: {
        fontFamily: typography.regular,
        fontSize: 10,
        color: brandColors.muted,
        marginBottom: 2,
    },
    dropdownButtonLabelDisabled: {
        color: '#A0A0A0',
    },
    dropdownButtonValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownButtonValue: {
        fontFamily: typography.emphasis,
        fontSize: 13,
        color: brandColors.text,
        flex: 1,
    },
    dropdownButtonValueDisabled: {
        color: '#A0A0A0',
    },
    groupToggleCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: '#F5F7FA',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#E0E4EA',
        minWidth: 80,
    },
    groupToggleCompactActive: {
        backgroundColor: brandColors.highlight,
        borderColor: brandColors.highlight,
    },
    groupToggleCompactText: {
        fontFamily: typography.regular,
        fontSize: 11,
        color: brandColors.muted,
    },
    groupToggleCompactTextActive: {
        fontFamily: typography.emphasis,
        color: brandColors.primary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: brandColors.surface,
        borderRadius: 16,
        width: '100%',
        maxHeight: '70%',
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E4EA',
    },
    modalTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: brandColors.primary,
    },
    modalList: {
        maxHeight: 300,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalOptionSelected: {
        backgroundColor: '#EEF2FF',
    },
    modalOptionText: {
        fontFamily: typography.regular,
        fontSize: 16,
        color: brandColors.text,
        flex: 1,
    },
    modalOptionTextSelected: {
        fontFamily: typography.emphasis,
        color: brandColors.primary,
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
    valueColumnWithLabel: {
        flex: 1,
    },
    labelColumn: {
        flex: 3,
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
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    navButton: {
        padding: 4,
    },
})
