import { useState } from 'react'
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { BarChart } from 'react-native-chart-kit'
import { brandColors, typography } from '../../styles/theme'
import { MAX_LABEL_LENGTH, CATEGORY_COLORS } from '../../constants/chart-config'

/**
 * Generic data structure for bar chart data points.
 * Each datum represents a category with a label and percentage value.
 */
export type BarDatum = {
    label: string
    value: number // Percentage value (0-100)
    /** Original numeric value from survey (for accessibility) */
    numericValue?: number
    /** Full label text (for legend when label is truncated) */
    fullLabel?: string
}

/**
 * Configuration for bar chart series (for future stacked/grouped charts).
 * This allows multiple data series to be rendered on the same chart.
 */
export type BarChartSeries = {
    data: BarDatum[]
    color?: string
    name?: string // For legend
}

/**
 * Props for the DiscreteBarChart component.
 * Designed to be flexible and support future enhancements like
 * stacked bars, multiple series, and custom styling.
 */
export type DiscreteBarChartProps = {
    /** Primary data series to display */
    data: BarDatum[]
    /** Optional title for the chart */
    title?: string
    /** Optional subtitle (e.g., sample size info) */
    subtitle?: string
    /** Chart height in pixels (default: 220) */
    height?: number
    /** Y-axis label suffix (default: '%') */
    yAxisSuffix?: string
    /** Custom bar color (default: brand accent color) */
    barColor?: string
    /** Show values on top of bars (default: true) */
    showValuesOnTopOfBars?: boolean
    /** Label rotation angle in degrees (default: 0) */
    labelRotation?: number
    /** Use color-coded bars with legend for long labels (default: auto-detect) */
    useColorLegend?: boolean
    /**
     * Future support: Additional series for grouped/stacked charts.
     * Currently not rendered, but API is in place.
     */
    additionalSeries?: BarChartSeries[]
}

/**
 * DiscreteBarChart - A reusable bar chart component for discrete scale questions.
 *
 * This component renders a vertical bar chart suitable for displaying
 * survey response distributions (e.g., 1-5 scale questions with NS/NC).
 *
 * Features:
 * - Displays percentage values on Y-axis (0-100%)
 * - Shows category labels on X-axis
 * - Provides tap tooltip for detailed value view (via category buttons)
 * - Configurable styling and layout
 * - Designed for future extension with grouped/stacked bars
 *
 * @example
 * ```tsx
 * const data: BarDatum[] = [
 *   { label: '1', value: 5.9 },
 *   { label: '2', value: 15.6 },
 *   { label: '3', value: 25.0 },
 *   { label: '4', value: 30.2 },
 *   { label: '5', value: 23.3 },
 * ];
 *
 * <DiscreteBarChart
 *   data={data}
 *   title="Distribución de respuestas"
 *   subtitle="N = 512"
 * />
 * ```
 */
export function DiscreteBarChart({
    data,
    title,
    subtitle,
    height = 220,
    yAxisSuffix = '%',
    barColor,
    showValuesOnTopOfBars = true,
    labelRotation = 0,
    useColorLegend,
}: DiscreteBarChartProps) {
    const screenWidth = Dimensions.get('window').width
    const chartWidth = screenWidth - 64 // Padding adjustment

    // Track selected category for tooltip display
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    // Determine if we should use color-coded legend (auto-detect based on label length)
    const hasLongLabels = data.some(item => 
        (item.fullLabel || item.label).length > MAX_LABEL_LENGTH
    )
    const shouldUseColorLegend = useColorLegend ?? hasLongLabels

    // Prepare labels for display - use numeric value if using legend
    const displayLabels = shouldUseColorLegend
        ? data.map((item, index) => {
            // Show numeric value if available, otherwise just show index
            const numLabel = item.numericValue !== undefined ? String(item.numericValue) : String(index + 1)
            return numLabel
        })
        : data.map((item) => item.label)

    const values = data.map((item) => item.value)

    // Chart data structure for react-native-chart-kit
    const chartData = {
        labels: displayLabels,
        datasets: [
            {
                data: values,
            },
        ],
    }

    // Get color for legend items (used for visual identification)
    const getLegendColor = (index: number): string => {
        return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    }

    // Determine bar color - use provided color or brand accent
    // Note: react-native-chart-kit uses a single color for all bars
    const effectiveBarColor = barColor || brandColors.accent

    /**
     * Parse a hex color string to RGB values.
     * Supports both 6-character (#RRGGBB) and 3-character (#RGB) hex formats.
     * Returns a fallback color if parsing fails.
     */
    const parseHexColor = (hex: string): { r: number; g: number; b: number } => {
        const fallback = { r: 218, g: 54, b: 77 } // brandColors.accent fallback
        const cleanHex = hex.replace('#', '')
        
        if (cleanHex.length === 6) {
            const r = parseInt(cleanHex.substring(0, 2), 16)
            const g = parseInt(cleanHex.substring(2, 4), 16)
            const b = parseInt(cleanHex.substring(4, 6), 16)
            if (isNaN(r) || isNaN(g) || isNaN(b)) return fallback
            return { r, g, b }
        } else if (cleanHex.length === 3) {
            // Handle short hex format (#RGB -> #RRGGBB)
            const r = parseInt(cleanHex[0] + cleanHex[0], 16)
            const g = parseInt(cleanHex[1] + cleanHex[1], 16)
            const b = parseInt(cleanHex[2] + cleanHex[2], 16)
            if (isNaN(r) || isNaN(g) || isNaN(b)) return fallback
            return { r, g, b }
        }
        return fallback
    }

    const chartConfig = {
        backgroundGradientFrom: brandColors.surface,
        backgroundGradientTo: brandColors.surface,
        color: (opacity = 1) => {
            const { r, g, b } = parseHexColor(effectiveBarColor)
            return `rgba(${r}, ${g}, ${b}, ${opacity})`
        },
        labelColor: () => brandColors.text,
        strokeWidth: 2,
        barPercentage: 0.7,
        decimalPlaces: 1,
        propsForLabels: {
            fontFamily: typography.regular,
            fontSize: 11,
        },
        propsForBackgroundLines: {
            strokeDasharray: '4',
            stroke: '#E0E4EA',
            strokeWidth: 1,
        },
    }

    /**
     * Handle category tap to show tooltip with detailed information.
     */
    const handleCategoryTap = (index: number) => {
        setSelectedIndex(selectedIndex === index ? null : index)
    }

    return (
        <View style={styles.container}>
            {/* Optional title */}
            {title && <Text style={styles.title}>{title}</Text>}

            {/* Optional subtitle */}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            {/* Bar Chart */}
            <View style={styles.chartContainer}>
                <BarChart
                    data={chartData}
                    width={chartWidth}
                    height={height}
                    yAxisLabel=""
                    yAxisSuffix={yAxisSuffix}
                    chartConfig={chartConfig}
                    verticalLabelRotation={labelRotation}
                    fromZero
                    showValuesOnTopOfBars={showValuesOnTopOfBars}
                    style={styles.chart}
                />
            </View>

            {/* Color Legend for long labels */}
            {shouldUseColorLegend && (
                <View style={styles.legendContainer}>
                    <Text style={styles.legendTitle}>Leyenda:</Text>
                    {data.map((item, index) => {
                        const color = getLegendColor(index)
                        const fullLabel = item.fullLabel || item.label
                        const numLabel = item.numericValue !== undefined ? String(item.numericValue) : String(index + 1)
                        return (
                            <TouchableOpacity
                                key={`legend-${index}`}
                                style={[
                                    styles.legendItem,
                                    selectedIndex === index && styles.legendItemSelected,
                                ]}
                                onPress={() => handleCategoryTap(index)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.legendColorBox, { backgroundColor: color }]}>
                                    <Text style={styles.legendColorText}>{numLabel}</Text>
                                </View>
                                <Text 
                                    style={[
                                        styles.legendLabel,
                                        selectedIndex === index && styles.legendLabelSelected,
                                    ]}
                                    numberOfLines={3}
                                >
                                    {fullLabel}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            )}

            {/* Interactive Category Buttons (Tooltip trigger) - only when not using legend */}
            {!shouldUseColorLegend && (
                <View style={styles.categoryContainer}>
                    <Text style={styles.categoryHint}>
                        Toca una categoría para ver el detalle:
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryScrollContent}
                    >
                        {data.map((item, index) => (
                            <TouchableOpacity
                                key={item.label}
                                style={[
                                    styles.categoryButton,
                                    selectedIndex === index &&
                                        styles.categoryButtonSelected,
                                ]}
                                onPress={() => handleCategoryTap(index)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.categoryLabel,
                                        selectedIndex === index &&
                                            styles.categoryLabelSelected,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Tooltip display (when a category is selected) */}
            {selectedIndex !== null && (
                <View style={[
                    styles.tooltipContainer,
                    shouldUseColorLegend && { borderLeftColor: getLegendColor(selectedIndex) }
                ]}>
                    <View style={styles.tooltipContent}>
                        <Text style={styles.tooltipLabel}>
                            Categoría: {data[selectedIndex].fullLabel || data[selectedIndex].label}
                        </Text>
                        <Text style={[
                            styles.tooltipValue,
                            shouldUseColorLegend && { color: getLegendColor(selectedIndex) }
                        ]}>
                            {data[selectedIndex].value.toFixed(1)}%
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.tooltipCloseButton}
                        onPress={() => setSelectedIndex(null)}
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
    legendContainer: {
        marginTop: 16,
        backgroundColor: brandColors.surface,
        borderRadius: 12,
        padding: 16,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    legendTitle: {
        fontFamily: typography.emphasis,
        fontSize: 14,
        color: brandColors.primary,
        marginBottom: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: 'transparent',
    },
    legendItemSelected: {
        backgroundColor: '#F5F7FA',
    },
    legendColorBox: {
        width: 32,
        height: 32,
        borderRadius: 6,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    legendColorText: {
        fontFamily: typography.emphasis,
        fontSize: 12,
        color: brandColors.surface,
    },
    legendLabel: {
        flex: 1,
        fontFamily: typography.regular,
        fontSize: 13,
        color: brandColors.text,
        lineHeight: 18,
    },
    legendLabelSelected: {
        fontFamily: typography.emphasis,
        color: brandColors.primary,
    },
    categoryContainer: {
        marginTop: 16,
        alignItems: 'center',
        width: '100%',
    },
    categoryHint: {
        fontFamily: typography.regular,
        fontSize: 11,
        color: brandColors.muted,
        marginBottom: 8,
    },
    categoryScrollContent: {
        paddingHorizontal: 8,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F7FA',
        borderWidth: 1,
        borderColor: '#E0E4EA',
        marginRight: 8,
    },
    categoryButtonSelected: {
        backgroundColor: brandColors.primary,
        borderColor: brandColors.primary,
    },
    categoryLabel: {
        fontFamily: typography.regular,
        fontSize: 13,
        color: brandColors.text,
    },
    categoryLabelSelected: {
        fontFamily: typography.emphasis,
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
        borderLeftColor: brandColors.accent,
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
        color: brandColors.accent,
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
