import * as Sharing from 'expo-sharing'
import { useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import ViewShot, { captureRef } from 'react-native-view-shot'
import { AggregatedResult } from '../../services/analytics'
import { brandColors, typography } from '../../styles/theme'
import { AnalyticsChart } from './analytics-chart'
import { DataTable } from './data-table'

type ResultsViewProps = {
    result: AggregatedResult | null
    isLoading: boolean
    currentFilters?: any // To generate the share link
}

export function ResultsView({
    result,
    isLoading,
    currentFilters,
}: ResultsViewProps) {
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')
    const viewShotRef = useRef<View>(null)
    const [isSharing, setIsSharing] = useState(false)

    const handleShareImage = async () => {
        try {
            setIsSharing(true)
            const uri = await captureRef(viewShotRef, {
                format: 'png',
                quality: 0.8,
                result: 'tmpfile',
            })

            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert('Error', 'Sharing is not available on this device')
                return
            }

            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Compartir gráfico',
                UTI: 'public.png',
            })
        } catch (error) {
            console.error('Error sharing image:', error)
            Alert.alert('Error', 'No se pudo compartir la imagen')
        } finally {
            setIsSharing(false)
        }
    }

    const handleShareLink = async () => {
        try {
            // Construct a deep link or web URL with parameters
            // For now, we'll simulate a deep link structure
            const params = new URLSearchParams(currentFilters).toString()
            const url = `jalisco-como-vamos://analytics?${params}`

            await Share.share({
                message: `Mira esta consulta en Jalisco Cómo Vamos: ${url}`,
                url: url, // iOS supports this field
                title: 'Consulta Jalisco Cómo Vamos',
            })
        } catch (error) {
            console.error('Error sharing link:', error)
        }
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={brandColors.primary} />
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
            <View style={styles.headerRow}>
                <Text style={styles.title}>Reporte Global</Text>
                <View style={styles.toolbar}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
                    >
                        <Text style={styles.iconButtonText}>
                            {viewMode === 'chart' ? 'Ver Tabla' : 'Ver Gráfico'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

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

            <ViewShot
                ref={viewShotRef}
                options={{ format: 'png', quality: 0.9 }}
                style={{ backgroundColor: brandColors.background }}
            >
                <Text style={styles.chartTitle}>Distribución de respuestas</Text>
                <View style={styles.contentContainer}>
                    {viewMode === 'chart' ? (
                        <AnalyticsChart result={result} />
                    ) : (
                        <DataTable result={result} />
                    )}
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
            </ViewShot>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleShareImage}
                    disabled={isSharing}
                >
                    <Text style={styles.actionButtonText}>
                        {isSharing ? 'Generando...' : 'Descargar Gráfico'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={handleShareLink}
                >
                    <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                        Compartir Consulta
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    toolbar: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F0F2F5',
        borderRadius: 16,
    },
    iconButtonText: {
        fontSize: 12,
        color: brandColors.primary,
        fontFamily: typography.emphasis,
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
    contentContainer: {
        backgroundColor: brandColors.surface,
        padding: 16,
        borderRadius: 12,
        minHeight: 250,
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
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    actionButton: {
        flex: 1,
        backgroundColor: brandColors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontFamily: typography.emphasis,
        fontSize: 14,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: brandColors.primary,
    },
    secondaryButtonText: {
        color: brandColors.primary,
    },
})
