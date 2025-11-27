import { useCallback, useEffect, useState } from 'react'
import {
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useUserPreferences } from '../contexts/user-preferences-context'
import { useAuthContext } from '../hooks/use-auth-context'
import {
    AggregatedResult,
    DashboardChart,
    AnalyticsFilters,
    AnalyticsService,
} from '../services/analytics'
import { brandColors, typography } from '../styles/theme'
import { FilterBar } from './analytics/filter-bar'
import { ResultsView } from './analytics/results-view'
import { SegmentationControls } from './analytics/segmentation-controls'

export function HomeScreen() {
    const { session, profile, isGuest } = useAuthContext()
    const { selectedCategories } = useUserPreferences()

    const [filters, setFilters] = useState<AnalyticsFilters>({
        theme: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    })
    const [result, setResult] = useState<DashboardChart[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [modalVisible, setModalVisible] = useState(false);

    const fetchData = useCallback(async () => {
        try {
        setIsLoading(true)
        const data = await AnalyticsService.fetchAggregatedData(filters)
        setResult(data)
    } catch (error) {
        console.error('Error al obtener datos:', error)
        // Mostrar datos de fallback en caso de error
        setResult([{
            id: 'error',
            title: 'Error de Conexión',
            type: 'bar',
            description: 'No se pudieron cargar los datos. Intenta de nuevo.',
            data: []
        }])
    } finally {
        setIsLoading(false)
    }
}, [filters])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true)
        await fetchData()
        setIsRefreshing(false)
    }, [fetchData])

    const handleSearch = (query: string) => {
        setFilters((prev) => ({ ...prev, searchQuery: query }))
    }

    const handleThemeSelect = (theme: string | null) => {
        setFilters((prev) => ({
            ...prev,
            theme: theme ?? undefined,
            questionId: undefined, // Reset question when theme changes
        }))
    }

    const handleQuestionSelect = (questionId: string | null) => {
        setFilters((prev) => ({ ...prev, questionId: questionId ?? undefined }))
    }

    const handleSegmentationChange = (segFilters: {
        sexo?: number
        nse?: number
        calidadVida?: number
        edad?: number
        escolaridad?: number
        municipio?: string
    }) => {
        setFilters((prev) => ({ ...prev, ...segFilters }))
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeTitle}>
                        ¡Hola, {isGuest ? 'Invitado' : profile?.full_name ?? session?.user.email}!
                    </Text>
                    <Text style={styles.welcomeSubtitle}>
                        Explora los datos del Observatorio
                    </Text>
                </View>

                <TouchableOpacity 
                    onPress={() => setModalVisible(true)}
                    accessibilityLabel="Abrir filtros avanzados"
                    accessibilityRole="button"
                >
                    <Ionicons name="options-outline" size={28} color={brandColors.primary} />
                </TouchableOpacity>
            </View>

            <FilterBar
                onSearch={handleSearch}
                onThemeSelect={handleThemeSelect}
                onQuestionSelect={handleQuestionSelect}
                selectedTheme={filters.theme ?? null}
                selectedQuestion={filters.questionId ?? null}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
            >

                <ResultsView
                    result={result}
                    isLoading={isLoading}
                    currentFilters={filters}
                />
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filtros Avanzados</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <SegmentationControls
                                activeFilters={{
                                    sexo: filters.sexo,
                                    nse: filters.nse,
                                    calidadVida: filters.calidadVida,
                                    edad: filters.edad,
                                    escolaridad: filters.escolaridad,
                                    municipio: filters.municipio,
                                }}
                                onFilterChange={handleSegmentationChange}
                            />
                        </ScrollView>

                        <TouchableOpacity 
                            style={styles.applyButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.applyButtonText}>Ver Resultados</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.background,
    },
    header: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: brandColors.surface,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Fondo oscuro semitransparente
        justifyContent: 'flex-end', // El modal sale desde abajo
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%', // Ocupa el 80% de la pantalla
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: brandColors.text,
    },
    applyButton: {
        backgroundColor: brandColors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20, // Espacio para el iPhone home indicator
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    welcomeTitle: {
        fontFamily: typography.heading,
        fontSize: 20,
        color: brandColors.primary,
    },
    welcomeSubtitle: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
        marginTop: 4,
    },
    scrollContent: {
        paddingBottom: 40,
    },
})