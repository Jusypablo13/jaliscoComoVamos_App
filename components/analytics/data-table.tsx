import { StyleSheet, Text, View } from 'react-native'
import { AggregatedResult } from '../../services/analytics'
import { brandColors, typography } from '../../styles/theme'

type DataTableProps = {
    result: AggregatedResult
}

export function DataTable({ result }: DataTableProps) {
    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.cell, styles.headerCell, styles.labelCell]}>Respuesta</Text>
                <Text style={[styles.cell, styles.headerCell, styles.valueCell]}>Total</Text>
                <Text style={[styles.cell, styles.headerCell, styles.valueCell]}>%</Text>
            </View>
            {result.breakdown.map((item, index) => {
                const percentage = ((item.value / result.sampleSize) * 100).toFixed(1)
                return (
                    <View key={index} style={[styles.row, index % 2 === 0 && styles.evenRow]}>
                        <Text style={[styles.cell, styles.labelCell]}>{item.label}</Text>
                        <Text style={[styles.cell, styles.valueCell]}>{item.value}</Text>
                        <Text style={[styles.cell, styles.valueCell]}>{percentage}%</Text>
                    </View>
                )
            })}
            <View style={styles.footerRow}>
                <Text style={[styles.cell, styles.footerCell, styles.labelCell]}>Total (N)</Text>
                <Text style={[styles.cell, styles.footerCell, styles.valueCell]}>{result.sampleSize}</Text>
                <Text style={[styles.cell, styles.footerCell, styles.valueCell]}>100%</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        overflow: 'hidden',
        marginVertical: 16,
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    evenRow: {
        backgroundColor: '#FAFAFA',
    },
    footerRow: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    cell: {
        fontFamily: typography.regular,
        fontSize: 12,
        color: brandColors.text,
    },
    headerCell: {
        fontFamily: typography.emphasis,
        color: brandColors.primary,
    },
    footerCell: {
        fontFamily: typography.emphasis,
    },
    labelCell: {
        flex: 2,
    },
    valueCell: {
        flex: 1,
        textAlign: 'right',
    },
})
