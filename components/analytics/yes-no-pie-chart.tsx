import { useState } from 'react'
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { PieChart } from 'react-native-chart-kit'
import { brandColors, typography } from '../../styles/theme'
import { YES_NO_LABELS } from '../../constants/chart-config'

/**
 * Data structure for a single pie slice.
 */
export type PieSlice = {
    name: string
    value: number // Percentage value (0-100)
    count: number // Raw count
    color: string
    legendFontColor?: string
    legendFontSize?: number
}

/**
 * Props for the YesNoPieChart component.
 */
export type YesNoPieChartProps = {
    /** Percentage of "Sí" (Yes) responses */
    yesPercentage: number
    /** Percentage of "No" responses */
    noPercentage: number
    /** Raw count of "Sí" responses */
    yesCount: number
    /** Raw count of "No" responses */
    noCount: number
    /** Optional title for the chart */
    title?: string
    /** Optional subtitle (e.g., sample size info) */
    subtitle?: string
    /** Chart height in pixels (default: 220) */
    height?: number
}

/**
 * YesNoPieChart - A pie chart component for yes/no questions.
 *
 * This component renders a pie chart suitable for displaying
 * binary response distributions (Yes/No questions).
 *
 * Features:
 * - Displays percentage values for each slice
 * - Shows legend with labels
 * - Interactive slice selection with detailed info
 * - Designed for Spanish-language display (Sí/No)
 *
 * @example
 * ```tsx
 * <YesNoPieChart
 *   yesPercentage={65.2}
 *   noPercentage={34.8}
 *   yesCount={326}
 *   noCount={174}
 *   title="¿Está satisfecho con el servicio?"
 *   subtitle="N = 500"
 * />
 * ```
 */
export function YesNoPieChart({
    yesPercentage,
    noPercentage,
    yesCount,
    noCount,
    title,
    subtitle,
    height = 220,
}: YesNoPieChartProps) {
    const screenWidth = Dimensions.get('window').width
    const chartWidth = screenWidth - 64 // Padding adjustment

    // Track selected slice for tooltip display
    const [selectedSlice, setSelectedSlice] = useState<'yes' | 'no' | null>(null)

    // Prepare data for the pie chart
    const pieData: PieSlice[] = [
        {
            name: YES_NO_LABELS.YES,
            value: yesPercentage,
            count: yesCount,
            color: brandColors.primary, // Blue for "Sí"
            legendFontColor: brandColors.text,
            legendFontSize: 14,
        },
        {
            name: YES_NO_LABELS.NO,
            value: noPercentage,
            count: noCount,
            color: brandColors.accent, // Red for "No"
            legendFontColor: brandColors.text,
            legendFontSize: 14,
        },
    ]

    // Filter out slices with no counts to avoid rendering issues
    // Use count > 0 instead of value > 0 to handle cases where small percentages round to 0
    const filteredData = pieData.filter(slice => slice.count > 0)

    const chartConfig = {
        backgroundGradientFrom: brandColors.surface,
        backgroundGradientTo: brandColors.surface,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    }

    /**
     * Handle slice tap to show tooltip with detailed information.
     */
    const handleSliceTap = (slice: 'yes' | 'no') => {
        setSelectedSlice(selectedSlice === slice ? null : slice)
    }

    const selectedData = selectedSlice === 'yes' 
        ? pieData[0] 
        : selectedSlice === 'no' 
            ? pieData[1] 
            : null

    return (
        <View style={styles.container}>
            {/* Optional title */}
            {title && <Text style={styles.title}>{title}</Text>}

            {/* Optional subtitle */}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            {/* Pie Chart */}
            <View style={styles.chartContainer}>
                {filteredData.length > 0 ? (
                    <PieChart
                        data={filteredData.map(slice => ({
                            name: `${slice.name} (${slice.value.toFixed(1)}%)`,
                            population: slice.value,
                            color: slice.color,
                            legendFontColor: slice.legendFontColor,
                            legendFontSize: slice.legendFontSize,
                        }))}
                        width={chartWidth}
                        height={height}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        center={[0, 0]}
                        absolute={false}
                        style={styles.chart}
                    />
                ) : (
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>Sin datos disponibles</Text>
                    </View>
                )}
            </View>

            {/* Interactive Buttons */}
            <View style={styles.buttonContainer}>
                <Text style={styles.buttonHint}>
                    Toca una opción para ver el detalle:
                </Text>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            { borderColor: brandColors.primary },
                            selectedSlice === 'yes' && styles.optionButtonSelectedYes,
                        ]}
                        onPress={() => handleSliceTap('yes')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.optionLabel,
                                { color: brandColors.primary },
                                selectedSlice === 'yes' && styles.optionLabelSelected,
                            ]}
                        >
                            {YES_NO_LABELS.YES}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            { borderColor: brandColors.accent },
                            selectedSlice === 'no' && styles.optionButtonSelectedNo,
                        ]}
                        onPress={() => handleSliceTap('no')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.optionLabel,
                                { color: brandColors.accent },
                                selectedSlice === 'no' && styles.optionLabelSelected,
                            ]}
                        >
                            {YES_NO_LABELS.NO}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tooltip display (when a slice is selected) */}
            {selectedData && (
                <View style={[
                    styles.tooltipContainer,
                    { borderLeftColor: selectedSlice === 'yes' ? brandColors.primary : brandColors.accent }
                ]}>
                    <View style={styles.tooltipContent}>
                        <Text style={styles.tooltipLabel}>
                            Respuesta: {selectedData.name}
                        </Text>
                        <Text style={[
                            styles.tooltipValue,
                            { color: selectedSlice === 'yes' ? brandColors.primary : brandColors.accent }
                        ]}>
                            {selectedData.value.toFixed(1)}%
                        </Text>
                        <Text style={styles.tooltipCount}>
                            ({selectedData.count} respuestas)
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.tooltipCloseButton}
                        onPress={() => setSelectedSlice(null)}
                    >
                        <Text style={styles.tooltipCloseText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
    },
    title: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: brandColors.primary,
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: typography.regular,
        fontSize: 12,
        color: brandColors.muted,
        marginBottom: 12,
        textAlign: 'center',
    },
    chartContainer: {
        backgroundColor: brandColors.surface,
        borderRadius: 16,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    chart: {
        borderRadius: 16,
    },
    noDataContainer: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.muted,
    },
    buttonContainer: {
        marginTop: 16,
        alignItems: 'center',
        width: '100%',
    },
    buttonHint: {
        fontFamily: typography.regular,
        fontSize: 11,
        color: brandColors.muted,
        marginBottom: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    optionButton: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F5F7FA',
        borderWidth: 2,
    },
    optionButtonSelectedYes: {
        backgroundColor: brandColors.primary,
    },
    optionButtonSelectedNo: {
        backgroundColor: brandColors.accent,
    },
    optionLabel: {
        fontFamily: typography.emphasis,
        fontSize: 14,
    },
    optionLabelSelected: {
        color: brandColors.surface,
    },
    tooltipContainer: {
        marginTop: 12,
        backgroundColor: brandColors.surface,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
    },
    tooltipContent: {
        flex: 1,
    },
    tooltipLabel: {
        fontFamily: typography.regular,
        fontSize: 13,
        color: brandColors.muted,
        marginBottom: 2,
    },
    tooltipValue: {
        fontFamily: typography.heading,
        fontSize: 24,
    },
    tooltipCount: {
        fontFamily: typography.regular,
        fontSize: 12,
        color: brandColors.muted,
        marginTop: 2,
    },
    tooltipCloseButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
    },
    tooltipCloseText: {
        fontFamily: typography.regular,
        fontSize: 12,
        color: brandColors.muted,
    },
})
