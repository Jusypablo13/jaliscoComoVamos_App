import { useState } from 'react'
import {
    LayoutAnimation,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { brandColors, typography } from '../../styles/theme'

type SegmentationControlsProps = {
    onFilterChange: (filters: {
        sexo?: number
        nse?: number
        calidadVida?: number
        edad?: number
        escolaridad?: number
        municipio?: number
    }) => void
    activeFilters: {
        sexo?: number
        nse?: number
        calidadVida?: number
        edad?: number
        escolaridad?: number
        municipio?: number
    }
}

export function SegmentationControls({
    onFilterChange,
    activeFilters,
}: SegmentationControlsProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setIsExpanded(!isExpanded)
    }

    const updateFilter = (key: keyof SegmentationControlsProps['activeFilters'], val: number | undefined) => {
        onFilterChange({ ...activeFilters, [key]: val })
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.header} onPress={toggleExpand}>
                <Text style={styles.title}>Filtros de cruce (Segmentación)</Text>
                <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.controls}>
                    {/* Sexo Filter */}
                    <View style={styles.filterGroup}>
                        <Text style={styles.label}>Sexo</Text>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.sexo === undefined && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('sexo', undefined)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.sexo === undefined &&
                                        styles.optionTextSelected,
                                    ]}
                                >
                                    Todos
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.sexo === 1 && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('sexo', 1)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.sexo === 1 && styles.optionTextSelected,
                                    ]}
                                >
                                    Hombre
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.sexo === 2 && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('sexo', 2)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.sexo === 2 && styles.optionTextSelected,
                                    ]}
                                >
                                    Mujer
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Calidad de Vida Filter*/}
                    <View style={styles.filterGroup}>
                        <Text style={styles.label}>Calidad de Vida</Text>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.nse === undefined && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('nse', undefined)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.nse === undefined &&
                                        styles.optionTextSelected,
                                    ]}
                                >
                                    Todos
                                </Text>
                            </TouchableOpacity>
                            {[1, 2, 3, 4].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.option,
                                        activeFilters.nse === level && styles.optionSelected,
                                    ]}
                                    onPress={() => updateFilter('nse', level)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            activeFilters.nse === level && styles.optionTextSelected,
                                        ]}
                                    >
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    {/* NSE Filter */}
                    <View style={styles.filterGroup}>
                        <Text style={styles.label}>Nivel Socioeconómico (NSE)</Text>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.nse === undefined && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('nse', undefined)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.nse === undefined &&
                                        styles.optionTextSelected,
                                    ]}
                                >
                                    Todos
                                </Text>
                            </TouchableOpacity>
                            {[1, 2, 3, 4].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.option,
                                        activeFilters.nse === level && styles.optionSelected,
                                    ]}
                                    onPress={() => updateFilter('nse', level)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            activeFilters.nse === level && styles.optionTextSelected,
                                        ]}
                                    >
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: brandColors.surface,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: brandColors.primary,
    },
    expandIcon: {
        fontSize: 12,
        color: brandColors.muted,
    },
    controls: {
        marginTop: 16,
    },
    filterGroup: {
        marginBottom: 16,
    },
    label: {
        fontFamily: typography.regular,
        fontSize: 12,
        color: brandColors.muted,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    option: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F5F7FA',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    optionSelected: {
        backgroundColor: brandColors.highlight,
        borderColor: brandColors.highlight,
    },
    optionText: {
        fontFamily: typography.regular,
        fontSize: 12,
        color: brandColors.text,
    },
    optionTextSelected: {
        color: brandColors.primary,
        fontFamily: typography.emphasis,
    },
})
