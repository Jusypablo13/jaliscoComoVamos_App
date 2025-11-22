import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { BarChart } from 'react-native-chart-kit'
import { AggregatedResult } from '../../services/analytics'
import { brandColors, typography } from '../../styles/theme'

type AnalyticsChartProps = {
    result: AggregatedResult
}

export function AnalyticsChart({ result }: AnalyticsChartProps) {
    const screenWidth = Dimensions.get('window').width
    const chartWidth = screenWidth - 64 // Padding adjustment

    // Prepare data for the chart
    const labels = result.breakdown.map((item) => item.label)
    const data = result.breakdown.map((item) => item.value)

    // If too many labels, we might want to truncate or rotate them
    // For now, we'll just let the chart handle it, but maybe shorten them if needed

    const chartData = {
        labels,
        datasets: [
            {
                data,
            },
        ],
    }

    const chartConfig = {
        backgroundGradientFrom: brandColors.surface,
        backgroundGradientTo: brandColors.surface,
        color: (opacity = 1) => `rgba(227, 0, 79, ${opacity})`, // brandColors.primary (assuming it's a pink/red)
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        decimalPlaces: 0,
        propsForLabels: {
            fontFamily: typography.regular,
            fontSize: 10,
        },
    }

    return (
        <View style={styles.container}>
            <BarChart
                data={chartData}
                width={chartWidth}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={chartConfig}
                verticalLabelRotation={30}
                fromZero
                showValuesOnTopOfBars
                style={styles.chart}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
    },
    chart: {
        borderRadius: 16,
    },
})
