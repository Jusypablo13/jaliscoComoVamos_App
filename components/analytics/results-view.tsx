import { StyleSheet, Text, View } from 'react-native'
import { AggregatedResult } from '../../services/analytics'
import { brandColors, typography } from '../../styles/theme'

type ResultsViewProps = {
    result: AggregatedResult | null
    isLoading: boolean
}

export function ResultsView({ result, isLoading }: ResultsViewProps) {
    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Calculando estadísticas...</Text>
            </View>
        )
    }

    if (!result) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>
                    Selecciona una pregunta para ver los resultados.
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reporte Global</Text>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Promedio</Text>
                    <Text style={styles.statValue}>{result.average.toFixed(2)}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Muestra (N)</Text>
                    <Text style={styles.statValue}>{result.sampleSize}</Text>
                </View>
            </View>

            <Text style={styles.chartTitle}>Distribución de respuestas</Text>
            <View style={styles.chartContainer}>
                {result.breakdown.map((item, index) => {
                    const percentage = (item.value / result.sampleSize) * 100
                    return (
                        <View key={index} style={styles.barRow}>
                            <Text style={styles.barLabel}>{item.label}</Text>
                            <View style={styles.barTrack}>
                                <View
                                    style={[styles.barFill, { width: `${percentage}%` }]}
                                />
                            </View>
                            <Text style={styles.barValue}>{Math.round(percentage)}%</Text>
                        </View>
                    )
                })}
            </View>

            <View style={styles.notesContainer}>
                <Text style={styles.noteTitle}>Notas Metodológicas:</Text>
                <Text style={styles.noteText}>
                    • Los datos representan una muestra de la encuesta 'encuestalol'.
                </Text>
                <Text style={styles.noteText}>
                    • N = {result.sampleSize} encuestados que respondieron esta pregunta.
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    loadingText: {
        textAlign: 'center',
        color: brandColors.muted,
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: brandColors.muted,
        marginTop: 40,
        fontFamily: typography.regular,
    },
    title: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: brandColors.primary,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    statCard: {
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
    statLabel: {
        fontFamily: typography.regular,
        fontSize: 12,
        color: brandColors.muted,
        marginBottom: 4,
    },
    statValue: {
        fontFamily: typography.heading,
        fontSize: 24,
        color: brandColors.primary,
    },
    chartTitle: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: brandColors.text,
        marginBottom: 12,
    },
    chartContainer: {
        backgroundColor: brandColors.surface,
        padding: 16,
        borderRadius: 12,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    barLabel: {
        width: 40,
        fontSize: 12,
        color: brandColors.text,
        fontFamily: typography.regular,
    },
    barTrack: {
        flex: 1,
        height: 8,
        backgroundColor: '#F0F2F5',
        borderRadius: 4,
        marginHorizontal: 8,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: brandColors.accent,
        borderRadius: 4,
    },
    barValue: {
        width: 30,
        fontSize: 12,
        color: brandColors.muted,
        textAlign: 'right',
    },
    notesContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
    },
    noteTitle: {
        fontFamily: typography.emphasis,
        fontSize: 12,
        color: brandColors.text,
        marginBottom: 4,
    },
    noteText: {
        fontFamily: typography.regular,
        fontSize: 11,
        color: brandColors.muted,
        lineHeight: 16,
    },
})
