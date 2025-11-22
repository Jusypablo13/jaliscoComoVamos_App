import { useEffect, useState } from 'react'
import {
    LayoutAnimation,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { brandColors, typography } from '../../styles/theme'

type SegmentationControlsProps = {
    onFilterChange: (filters: Filters) => void
    activeFilters: Filters
}

type CalidadVida = number | undefined

type Filters = {
    sexo?: number
    nse?: number
    calidadVida?: CalidadVida
    edad?: number | undefined
    escolaridad?: number | undefined
    municipio?: string | undefined
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

    const updateFilter = <K extends keyof Filters>(
        key: K,
        val: Filters[K]
    ) => {
        onFilterChange({ ...activeFilters, [key]: val })
    }
    const MUNICIPIOS = [
        { id: 1, nombre: 'El Salto' },
        { id: 2, nombre: 'Guadalajara' },
        { id: 3, nombre: 'San Pedro Tlaquepaque' },
        { id: 4, nombre: 'Tlajomulco de Zúñiga' },
        { id: 5, nombre: 'Tonalá' },
        { id: 6, nombre: 'Zapopan' },
    ]

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
                                    activeFilters.calidadVida === undefined && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('calidadVida', undefined)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.calidadVida === undefined && styles.optionTextSelected,
                                    ]}
                                >
                                    Todos
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.calidadVida === 3 && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('calidadVida', 3)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.calidadVida === 3 && styles.optionTextSelected,
                                    ]}
                                >
                                    Buena
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.calidadVida === 2 && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('calidadVida', 2)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.calidadVida === 2 && styles.optionTextSelected,
                                    ]}
                                >
                                    Regular
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.calidadVida === 1 && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('calidadVida', 1)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.calidadVida === 1 && styles.optionTextSelected,
                                    ]}
                                >
                                    Mala
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Edad Filter*/}
                    <View style={styles.filterGroup}>
                        <Text style={styles.label}>Edad</Text>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.edad === undefined && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('edad', undefined)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.edad === undefined && styles.optionTextSelected,
                                    ]}
                                >
                                    Todos
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.edad === 1 && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('edad', 1)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.edad === 1 && styles.optionTextSelected,
                                    ]}
                                >
                                    18-29
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.edad === 2 && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('edad', 2)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.edad === 2 && styles.optionTextSelected,
                                    ]}
                                >
                                    30-44
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.edad === 3 && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('edad', 3)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.edad === 3 && styles.optionTextSelected,
                                    ]}
                                >
                                    45-59
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.edad === 4 && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('edad', 4)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.edad === 4 && styles.optionTextSelected,
                                    ]}
                                >
                                    60+
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Escolaridad Filter*/}
                    <View style={styles.filterGroup}>
                        <Text style={styles.label}>Escolaridad</Text>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.escolaridad === undefined && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('escolaridad', undefined)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.escolaridad === undefined && styles.optionTextSelected,
                                    ]}
                                >
                                    Todos
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.escolaridad === 1 && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('escolaridad', 1)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.escolaridad === 1 && styles.optionTextSelected,
                                    ]}
                                >
                                    Sec&lt;
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.escolaridad === 2 && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('escolaridad', 2)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.escolaridad === 2 && styles.optionTextSelected,
                                    ]}
                                >
                                    Prep
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.escolaridad === 3 && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('escolaridad', 3)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.escolaridad === 3 && styles.optionTextSelected,
                                    ]}
                                >
                                    Univ+
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Municipio Filter*/}

                    <View style={styles.filterGroup}>
                        <Text style={styles.label}>Municipio</Text>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.municipio === undefined && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('municipio', undefined)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.municipio === undefined && styles.optionTextSelected,
                                    ]}
                                >
                                    Todos
                                </Text>
                            </TouchableOpacity>
                            {MUNICIPIOS.map((municipio) => (
                                <TouchableOpacity
                                    key={municipio.id}
                                    style={[
                                        styles.option,
                                        activeFilters.municipio === municipio.nombre && styles.optionSelected,
                                    ]}
                                    onPress={() => updateFilter('municipio', municipio.nombre)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            activeFilters.municipio === municipio.nombre && styles.optionTextSelected,
                                        ]}
                                    >
                                        {municipio.nombre}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                </View>
            )
            }
        </View >
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
