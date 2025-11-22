import { useCallback, useEffect, useState } from 'react'
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { useUserPreferences } from '../contexts/user-preferences-context'
import { useAuthContext } from '../hooks/use-auth-context'
import {
    AggregatedResult,
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
    const [result, setResult] = useState<AggregatedResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)

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
            </ScrollView>
        </View>
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
})