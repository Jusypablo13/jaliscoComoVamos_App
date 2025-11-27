import * as Sharing from 'expo-sharing'
import { useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { BarChart, PieChart } from 'react-native-chart-kit' 
import ViewShot, { captureRef } from 'react-native-view-shot'
import { DashboardChart } from '../../services/analytics'
import { brandColors, typography } from '../../styles/theme'
// import { AnalyticsChart } from './analytics-chart'
// import { DataTable } from './data-table'

type ResultsViewProps = {
    result: DashboardChart[] | null
    isLoading: boolean
    currentFilters?: any // To generate the share link
}

// Colores para las gráficas de Pastel
const PIE_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
]

const formatNumber = (value: any): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 'N/A'
  }

  const num = Number(value)
  
  // Si es un número entero, no usar decimales
  if (num % 1 === 0) {
    return num.toString()
  }
  
  // Si tiene decimales, usar máximo 2 decimales
  return num.toFixed(2)
}

// Función auxiliar para formatear porcentajes
const formatPercentage = (value: any): string => {
  const formatted = formatNumber(value)
  return formatted === 'N/A' ? 'N/A' : `${formatted}%`
}

export function ResultsView({
    result,
    isLoading,
    currentFilters,
}: ResultsViewProps) {

    // const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')
    const viewShotRef = useRef<View>(null)
    const [isSharing, setIsSharing] = useState(false)

    const handleShareImage = async () => {
        try {
            setIsSharing(true)

            if (!viewShotRef.current) {
                Alert.alert('Error', 'No se pudo capturar la imagen')
                return
            }

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
            const params = new URLSearchParams(currentFilters).toString()
            const message = `Consulta los datos de Jalisco Cómo Vamos${params ? ` con estos filtros: ${params}` : ''}`

            const url = `jalisco-como-vamos://analytics?${params}`

            await Share.share({
                message: `Mira esta consulta en Jalisco Cómo Vamos: ${url}`,
                url: url, // iOS supports this field
                title: 'Consulta Jalisco Cómo Vamos',
            })
        } catch (error) {
            console.error('Error sharing link:', error)
            Alert.alert('Error', 'No se pudo compartir el enlace')

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

    if (!result || result.length === 0) {
        return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay datos disponibles</Text>
            <Text style={styles.emptySubtext}>
            Intenta ajustar los filtros para ver resultados de la encuesta
            </Text>
        </View>
        )
    }

    // Configuración visual común para ChartKit
    const chartConfig = {
      backgroundColor: "#ffffff",
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      decimalPlaces: 1,
      color: (opacity = 1) => `rgba(0, 82, 204, ${opacity})`, // Usa tu brandColor primary aquí
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: { borderRadius: 16 },
      propsForDots: { r: "6", strokeWidth: "2", stroke: "#ffa726" }
    }

      return (
        <ViewShot ref={viewShotRef} style={styles.container}>
            {/* Botones de compartir */}
            <View style={styles.shareContainer}>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShareImage}
                    disabled={isSharing}
                >
                    <Text style={styles.shareButtonText}>
                        {isSharing ? 'Compartiendo...' : 'Compartir Imagen'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShareLink}
                >
                    <Text style={styles.shareButtonText}>Compartir Enlace</Text>
                </TouchableOpacity>
            </View>

            {/* Gráficos */}
            {result.map((chart) => (
                <View key={chart.id} style={styles.chartContainer}>
                <Text style={styles.chartTitle}>{chart.title}</Text>
                {chart.description && (
                    <Text style={styles.chartDescription}>{chart.description}</Text>
                )}
            
                {chart.data && chart.data.length > 0 ? (
                    chart.data.map((item, index) => (
                    <View key={`${chart.id}-${index}`} style={styles.dataItem}>
                        <Text style={styles.dataLabel}>{item.label || 'Sin etiqueta'}</Text>
                        <Text style={styles.dataValue}>
                        {chart.type === 'pie' && item.percentage !== undefined 
                            ? formatPercentage(item.percentage)
                            : formatNumber(item.value)
                        }
                        </Text>
                    </View>
                    ))
                ) : (
                    <Text style={styles.noDataText}>No hay datos para mostrar</Text>
                )}
            </View>
        ))}
        </ViewShot>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontFamily: typography.regular,
    fontSize: 16,
    color: brandColors.text,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontFamily: typography.emphasis,
    fontSize: 18,
    color: brandColors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: typography.regular,
    fontSize: 14,
    color: brandColors.muted,
    textAlign: 'center',
    marginTop: 8,
  },
  shareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  shareButton: {
    backgroundColor: brandColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontFamily: typography.emphasis,
    fontSize: 14,
  },
  chartContainer: {
    backgroundColor: brandColors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  chartTitle: {
    fontFamily: typography.heading,
    fontSize: 16,
    color: brandColors.text,
    marginBottom: 8,
  },
  chartDescription: {
    fontFamily: typography.regular,
    fontSize: 12,
    color: brandColors.muted,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dataLabel: {
    fontFamily: typography.regular,
    fontSize: 14,
    color: brandColors.text,
    flex: 1,
  },
  dataValue: {
    fontFamily: typography.emphasis,
    fontSize: 14,
    color: brandColors.primary,
    minWidth: 60,
    textAlign: 'right',
  },
  noDataText: {
    fontFamily: typography.regular,
    fontSize: 14,
    color: brandColors.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})