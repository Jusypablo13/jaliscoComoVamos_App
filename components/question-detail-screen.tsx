import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from './navigation/NavigationTypes'
import {
    AnalyticsService,
    QuestionDistribution,
} from '../services/analytics'
import { brandColors, typography } from '../styles/theme'

type QuestionDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'QuestionDetail'>

export function QuestionDetailScreen({ route }: QuestionDetailScreenProps) {
    const { questionId, column, questionText } = route.params

    const [distribution, setDistribution] = useState<QuestionDistribution | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchDistribution()
    }, [questionId, column])

    const fetchDistribution = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await AnalyticsService.fetchQuestionDistribution(questionId, column)
            if (data) {
                setDistribution(data)
            } else {
                setError('No se encontraron datos para esta pregunta.')
            }
        } catch (err) {
            console.error('Error fetching distribution:', err)
            setError('Error al cargar los datos.')
        } finally {
            setIsLoading(false)
        }
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
            </View>
        )
    }

    if (!distribution) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No hay datos disponibles.</Text>
            </View>
        )
    }

    // Calculate the sum of percentages (should be ~100% for valid responses)
    const percentageSum = distribution.distribution
        .filter(item => !item.isNsNc)
        .reduce((sum, item) => sum + item.percentage, 0)

    return (
        <ScrollView style={styles.container}>
            {/* Question Header */}
            <View style={styles.header}>
                <Text style={styles.columnLabel}>{column}</Text>
                {questionText && (
                    <Text style={styles.questionText}>{questionText}</Text>
                )}
            </View>

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

            {/* Distribution Table */}
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
})
