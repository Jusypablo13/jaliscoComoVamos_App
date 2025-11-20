import { useEffect, useState } from 'react'
import {
    LayoutAnimation,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { brandColors, typography } from '../../styles/theme'
import { getMunicipios } from '../../types/supabase'

type SegmentationControlsProps = {
    onFilterChange: (filters: Filters) => void
    activeFilters: Filters
}

type CalidadVida = 'buena' | 'regular' | 'mala' | number | undefined

type Filters = {
    sexo?: number
    nse?: number
    calidadVida?: CalidadVida
    edad?: string | undefined
    escolaridad?: string | undefined
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
    const [municipios, setMunicipios] = useState<Array<{ id: number; nombre: string }>>([])

    useEffect(() => {
        const fetchMunicipios = async () => {
            const municipios = await getMunicipios()
            setMunicipios(municipios)
        }
        fetchMunicipios()
    }, [])

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
                                    activeFilters.calidadVida === 'buena' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('calidadVida', 'buena')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.calidadVida === 'buena' && styles.optionTextSelected,
                                    ]}
                                >
                                    Buena
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.calidadVida === 'regular' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('calidadVida', 'regular')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.calidadVida === 'regular' && styles.optionTextSelected,
                                    ]}
                                >
                                    Regular
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.calidadVida === 'mala' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('calidadVida', 'mala')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.calidadVida === 'mala' && styles.optionTextSelected,
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
                                    activeFilters.edad === '18-24' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('edad', '18-24')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.edad === '18-24' && styles.optionTextSelected,
                                    ]}
                                >
                                    18-24
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.edad === '25-34' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('edad', '25-34')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.edad === '25-34' && styles.optionTextSelected,
                                    ]}
                                >
                                    25-34
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.edad === '35-44' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('edad', '35-44')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.edad === '35-44' && styles.optionTextSelected,
                                    ]}
                                >
                                    35-44
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.edad === '45-54' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('edad', '45-54')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.edad === '45-54' && styles.optionTextSelected,
                                    ]}
                                >
                                    45-54
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.edad === '55+' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('edad', '55+')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.edad === '55+' && styles.optionTextSelected,
                                    ]}
                                >
                                    55+
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
                                    activeFilters.escolaridad === 'primaria' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('escolaridad', 'primaria')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.escolaridad === 'primaria' && styles.optionTextSelected,
                                    ]}
                                >
                                    Primaria
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.escolaridad === 'secundaria' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('escolaridad', 'secundaria')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.escolaridad === 'secundaria' && styles.optionTextSelected,
                                    ]}
                                >
                                    Secundaria
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.escolaridad === 'preparatoria' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('escolaridad', 'preparatoria')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.escolaridad === 'preparatoria' && styles.optionTextSelected,
                                    ]}
                                >
                                    Preparatoria
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.escolaridad === 'universidad' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('escolaridad', 'universidad')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.escolaridad === 'universidad' && styles.optionTextSelected,
                                    ]}
                                >
                                    Universidad
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    activeFilters.escolaridad === 'posgrado' && styles.optionSelected,
                                ]}
                                onPress={() => updateFilter('escolaridad', 'posgrado')}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        activeFilters.escolaridad === 'posgrado' && styles.optionTextSelected,
                                    ]}
                                >
                                    Posgrado
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
                            {municipios.map((municipio) => (
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
                                        activeFilters.calidadVida === undefined &&
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
                                        activeFilters.calidadVida === level && styles.optionSelected,
                                    ]}
                                    onPress={() => updateFilter('calidadVida', level)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            activeFilters.calidadVida === level && styles.optionTextSelected,
                                        ]}
                                    >
                                        {level}
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
