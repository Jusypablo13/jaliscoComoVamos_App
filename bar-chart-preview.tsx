import { ScrollView, StyleSheet, Text, View } from 'react-native'
import {
    BarDatum,
    DiscreteBarChart,
} from './components/analytics/discrete-bar-chart'
import { brandColors, typography } from './styles/theme'

/**
 * Mock data representing a discrete scale question (1-5) with NS/NC.
 * This simulates survey responses for a quality of life question.
 */
const mockDiscreteScaleData: BarDatum[] = [
    { label: '1', value: 5.9 },
    { label: '2', value: 15.6 },
    { label: '3', value: 25.0 },
    { label: '4', value: 30.2 },
    { label: '5', value: 23.3 },
]

/**
 * Mock data including NS/NC (No sabe/No contesta) category.
 */
const mockDataWithNsNc: BarDatum[] = [
    { label: '1', value: 5.5 },
    { label: '2', value: 14.8 },
    { label: '3', value: 24.0 },
    { label: '4', value: 29.5 },
    { label: '5', value: 22.7 },
    { label: 'NS/NC', value: 3.5 },
]

/**
 * Mock data with custom labels for categorical questions.
 */
const mockCategoricalData: BarDatum[] = [
    { label: 'Muy malo', value: 8.2 },
    { label: 'Malo', value: 12.5 },
    { label: 'Regular', value: 28.3 },
    { label: 'Bueno', value: 32.8 },
    { label: 'Muy bueno', value: 18.2 },
]

/**
 * Mock data for satisfaction question.
 */
const mockSatisfactionData: BarDatum[] = [
    { label: 'Nada', value: 4.2 },
    { label: 'Poco', value: 18.5 },
    { label: 'Algo', value: 32.1 },
    { label: 'Mucho', value: 45.2 },
]

/**
 * BarChartPreview - A preview screen demonstrating the DiscreteBarChart component.
 *
 * This screen shows multiple examples of the chart component with different
 * configurations and mock data sets to verify the component works correctly.
 *
 * Use this screen to:
 * - Test the bar chart with various data configurations
 * - Verify tooltip functionality
 * - Experiment with different styling options
 *
 * Note: This uses mock data only and does not connect to Supabase.
 */
export function BarChartPreview() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    Vista previa: Gráfica de Barras
                </Text>
                <Text style={styles.headerSubtitle}>
                    Componente reutilizable para preguntas con escala discreta
                </Text>
            </View>

            {/* Example 1: Basic discrete scale (1-5) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    1. Escala discreta básica (1-5)
                </Text>
                <Text style={styles.sectionDescription}>
                    Pregunta: ¿Cómo calificaría su calidad de vida?
                </Text>
                <DiscreteBarChart
                    data={mockDiscreteScaleData}
                    title="Distribución de respuestas"
                    subtitle="N = 512 • Muestra ZMG 2024"
                />
            </View>

            {/* Example 2: With NS/NC category */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    2. Con categoría NS/NC
                </Text>
                <Text style={styles.sectionDescription}>
                    Incluye respuestas &quot;No sabe/No contesta&quot;
                </Text>
                <DiscreteBarChart
                    data={mockDataWithNsNc}
                    title="Calidad de servicios públicos"
                    subtitle="N = 480 • Incluye NS/NC"
                    barColor={brandColors.primary}
                />
            </View>

            {/* Example 3: Custom labels */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    3. Etiquetas personalizadas
                </Text>
                <Text style={styles.sectionDescription}>
                    Soporte para etiquetas de texto en lugar de números
                </Text>
                <DiscreteBarChart
                    data={mockCategoricalData}
                    title="Evaluación del transporte público"
                    subtitle="N = 623 • Guadalajara"
                    labelRotation={15}
                />
            </View>

            {/* Example 4: Different styling */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    4. Configuración personalizada
                </Text>
                <Text style={styles.sectionDescription}>
                    Altura, colores y opciones modificables
                </Text>
                <DiscreteBarChart
                    data={mockSatisfactionData}
                    title="Satisfacción con seguridad"
                    subtitle="N = 398 • Zapopan"
                    height={180}
                    barColor="#4CAF50"
                    showValuesOnTopOfBars={true}
                    labelRotation={0}
                />
            </View>

            {/* API Documentation */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Documentación de Props</Text>
                <View style={styles.docContainer}>
                    <Text style={styles.docItem}>
                        <Text style={styles.docProp}>data</Text>: BarDatum[] -
                        Array de datos con label y value
                    </Text>
                    <Text style={styles.docItem}>
                        <Text style={styles.docProp}>title</Text>: string -
                        Título opcional
                    </Text>
                    <Text style={styles.docItem}>
                        <Text style={styles.docProp}>subtitle</Text>: string -
                        Subtítulo opcional (ej. tamaño de muestra)
                    </Text>
                    <Text style={styles.docItem}>
                        <Text style={styles.docProp}>height</Text>: number -
                        Altura del gráfico (default: 220)
                    </Text>
                    <Text style={styles.docItem}>
                        <Text style={styles.docProp}>barColor</Text>: string -
                        Color de las barras
                    </Text>
                    <Text style={styles.docItem}>
                        <Text style={styles.docProp}>labelRotation</Text>:
                        number - Rotación de etiquetas en grados
                    </Text>
                    <Text style={styles.docItem}>
                        <Text style={styles.docProp}>additionalSeries</Text>:
                        BarChartSeries[] - Para futuras gráficas agrupadas
                    </Text>
                </View>
            </View>

            {/* Bottom padding */}
            <View style={styles.bottomPadding} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.background,
    },
    header: {
        padding: 16,
        backgroundColor: brandColors.primary,
    },
    headerTitle: {
        fontFamily: typography.heading,
        fontSize: 20,
        color: brandColors.surface,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    section: {
        padding: 16,
        backgroundColor: brandColors.surface,
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 12,
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
        marginBottom: 4,
    },
    sectionDescription: {
        fontFamily: typography.regular,
        fontSize: 13,
        color: brandColors.muted,
        marginBottom: 16,
    },
    docContainer: {
        backgroundColor: '#F5F7FA',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    docItem: {
        fontFamily: typography.regular,
        fontSize: 12,
        color: brandColors.text,
        marginBottom: 8,
        lineHeight: 18,
    },
    docProp: {
        fontFamily: typography.emphasis,
        color: brandColors.primary,
    },
    bottomPadding: {
        height: 32,
    },
})
