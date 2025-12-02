import { useCallback, useEffect, useState } from 'react'
import {
    Image,
    Linking,
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
    AnalyticsFilters,
    AnalyticsService,
    Question,
} from '../services/analytics'
import { brandColors, typography } from '../styles/theme'
import { FilterBar } from './analytics/filter-bar'
import { ResultsView } from './analytics/results-view'
import { SegmentationControls } from './analytics/segmentation-controls'
import { HomeScreenProps } from './navigation/NavigationTypes'

export function HomeScreen({ navigation }: HomeScreenProps) {
    const { session, profile, isGuest } = useAuthContext()
    const { selectedCategories } = useUserPreferences()

    const [filters, setFilters] = useState<AnalyticsFilters>({
        theme: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    })
    const [result, setResult] = useState<AggregatedResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [infoModalVisible, setInfoModalVisible] = useState(false)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        const data = await AnalyticsService.fetchAggregatedData(filters)
        setResult(data)
        setIsLoading(false)
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

    const handleQuestionSelect = (question: Question) => {
        // Use the database id when available (preferred), as it's reliable
        // If not available, fall back to parsing the column name (legacy support)
        const numericId = question.id !== undefined ? question.id : 0

        navigation.navigate('QuestionDetail', {
            questionId: numericId,
            column: question.pregunta_id,
            questionText: question.texto_pregunta ?? undefined,
            questionDescription: question.descripcion ?? undefined,
            isYesOrNo: question.is_yes_or_no,
            isClosedCategory: question.is_closed_category,
            escalaMax: question.escala_max,
            theme: filters.theme,
        });
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
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.welcomeTitle}>
                                ¡Hola, {isGuest ? 'Invitado' : profile?.full_name ?? session?.user.email}!
                            </Text>
                            <Text style={styles.welcomeSubtitle}>
                                Explora los datos del Observatorio
                            </Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                onPress={() => setInfoModalVisible(true)}
                                style={styles.infoButton}
                                accessibilityLabel="Información de la encuesta"
                                accessibilityHint="Muestra detalles sobre la encuesta y el aviso de privacidad"
                                accessibilityRole="button"
                            >
                                <Ionicons name="information-circle-outline" size={28} color={brandColors.primary} />
                            </TouchableOpacity>
                            <Image
                                source={require('../assets/logo-observatorio.png')}
                                style={styles.headerLogo}
                                resizeMode="contain"
                                accessibilityLabel="Logo del Observatorio Jalisco Cómo Vamos"
                            />
                        </View>
                    </View>
                </View>

                <FilterBar
                    onSearch={handleSearch}
                    onThemeSelect={handleThemeSelect}
                    onQuestionSelect={handleQuestionSelect}
                    selectedTheme={filters.theme ?? null}
                    selectedQuestion={filters.questionId ?? null}
                />
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

                <ResultsView
                    result={result}
                    isLoading={isLoading}
                    currentFilters={filters}
                />

                {/* Info Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={infoModalVisible}
                    onRequestClose={() => setInfoModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Información de la encuesta</Text>
                                <TouchableOpacity
                                    onPress={() => setInfoModalVisible(false)}
                                    accessibilityLabel="Cerrar modal"
                                    accessibilityRole="button"
                                >
                                    <Ionicons name="close" size={24} color={brandColors.text} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalBody}>
                                <Text style={styles.modalText}>
                                    La Encuesta de Percepción Ciudadana sobre Calidad de Vida es un estudio anual realizado por Jalisco Cómo Vamos, un observatorio ciudadano que analiza las condiciones de vida en el Área Metropolitana de Guadalajara. Su objetivo es conocer cómo perciben las personas su entorno, sus oportunidades y los servicios públicos, para generar información útil que permita tomar mejores decisiones en política pública, iniciativa privada, academia y sociedad civil.
                                </Text>
                                <Text style={styles.modalText}>
                                    La encuesta mide la experiencia cotidiana de las y los habitantes en temas como seguridad, movilidad, medio ambiente, salud, economía familiar, participación ciudadana y satisfacción con la ciudad. Además de capturar percepciones, incluye indicadores de bienestar subjetivo y de confianza, lo que la convierte en una herramienta integral para entender cómo vive y siente la población su calidad de vida.
                                </Text>
                                <Text style={styles.modalText}>
                                    Los datos aquí presentados forman parte de esta encuesta y buscan facilitar la consulta, visualización y análisis interactivo para cualquier persona interesada en entender y mejorar la calidad de vida en nuestra ciudad.
                                </Text>

                                <TouchableOpacity
                                    style={styles.privacyButton}
                                    onPress={() => Linking.openURL('https://drive.google.com/file/d/1aInmjBc_iMpK59llbY1Sr-AarWE15FQz/view?usp=sharing')}
                                    accessibilityLabel="Abrir aviso de privacidad"
                                    accessibilityRole="link"
                                >
                                    <Text style={styles.privacyButtonText}>Aviso de Privacidad</Text>
                                    <Ionicons name="open-outline" size={16} color="white" style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.background,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: brandColors.surface,
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
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
        marginRight: 16,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerLogo: {
        width: 40,
        height: 40,
    },
    infoButton: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: brandColors.surface,
        borderRadius: 20,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: brandColors.primary,
        flex: 1,
    },
    modalBody: {
        padding: 20,
    },
    modalText: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
        lineHeight: 22,
        marginBottom: 16,
        textAlign: 'justify',
    },
    privacyButton: {
        backgroundColor: brandColors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 20,
    },
    privacyButtonText: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: 'white',
        marginRight: 8,
    },
})