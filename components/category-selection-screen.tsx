import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { useUserPreferences } from '../contexts/user-preferences-context'
import { supabase } from '../lib/supabase'
import { brandColors, typography } from '../styles/theme'
import { CATEGORIES_DATA } from '../constants/categories-data'

export function CategorySelectionScreen() {
    const { selectedCategories, toggleCategory, savePreferences } =
        useUserPreferences()
    const [categories, setCategories] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [error, setError] = useState<string | null>(null)
    const [isSeeding, setIsSeeding] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        setError(null)
        try {
            const { data, error: supabaseError } = await supabase
                .from('categoria_pregunta')
                .select('nombre_categoria')

            if (supabaseError) {
                console.error('Error fetching categories:', supabaseError)
                setError('Error al cargar categorías: ' + supabaseError.message)
                return
            }

            if (data) {
                const uniqueCategories = Array.from(
                    new Set(data.map((item: { nombre_categoria: string }) => item.nombre_categoria))
                ).sort()
                setCategories(uniqueCategories)
            }
        } catch (err) {
            console.error('Error processing categories:', err)
            setError('Ocurrió un error inesperado.')
        } finally {
            setIsLoading(false)
        }
    }

    const seedCategories = async () => {
        setIsSeeding(true)
        setError(null)
        try {
            // Remove 'idx' from the data as it's not in the database schema
            const dataToInsert = CATEGORIES_DATA.map(({ idx, ...rest }) => rest)

            const { error } = await supabase
                .from('categoria_pregunta')
                .insert(dataToInsert as any)

            if (error) {
                console.error('Error seeding categories:', error)
                setError('Error al insertar datos: ' + error.message)
            } else {
                await fetchCategories()
            }
        } catch (err) {
            console.error('Error seeding categories:', err)
            setError('Error inesperado al insertar datos.')
        } finally {
            setIsSeeding(false)
        }
    }

    const handleContinue = async () => {
        await savePreferences()
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Elige tus intereses</Text>
                <Text style={styles.subtitle}>
                    Selecciona las categorías que más te importan para personalizar tu
                    experiencia.
                </Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={brandColors.primary} />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchCategories} style={styles.retryButton}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : categories.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No se encontraron categorías.</Text>
                    <TouchableOpacity
                        onPress={seedCategories}
                        style={[styles.button, { marginTop: 20, backgroundColor: brandColors.accent }]}
                        disabled={isSeeding}
                    >
                        {isSeeding ? (
                            <ActivityIndicator color={brandColors.surface} />
                        ) : (
                            <Text style={styles.buttonText}>Cargar datos de prueba</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categories.map((category) => {
                        const isSelected = selectedCategories.includes(category)
                        return (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.categoryChip,
                                    isSelected && styles.categoryChipSelected,
                                ]}
                                onPress={() => toggleCategory(category)}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        isSelected && styles.categoryTextSelected,
                                    ]}
                                >
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            )}

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        selectedCategories.length === 0 && styles.buttonDisabled,
                    ]}
                    onPress={handleContinue}
                    disabled={selectedCategories.length === 0}
                >
                    <Text style={styles.buttonText}>Continuar</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.background,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    title: {
        fontFamily: typography.heading,
        fontSize: 28,
        color: brandColors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: typography.regular,
        fontSize: 16,
        color: brandColors.text,
        lineHeight: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    scrollView: {
        flex: 1,
    },
    categoriesContainer: {
        paddingHorizontal: 24,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: 100,
    },
    errorText: {
        fontFamily: typography.regular,
        fontSize: 16,
        color: brandColors.accent,
        textAlign: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontFamily: typography.regular,
        fontSize: 16,
        color: brandColors.text,
        textAlign: 'center',
    },
    retryButton: {
        padding: 12,
    },
    retryText: {
        fontFamily: typography.emphasis,
        color: brandColors.primary,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: '#F0F2F5',
        borderWidth: 1,
        borderColor: '#E0E4EA',
    },
    categoryChipSelected: {
        backgroundColor: brandColors.primary,
        borderColor: brandColors.primary,
    },
    categoryText: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
    },
    categoryTextSelected: {
        color: brandColors.surface,
        fontFamily: typography.emphasis,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: brandColors.background,
        borderTopWidth: 1,
        borderTopColor: '#E0E4EA',
    },
    button: {
        backgroundColor: brandColors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: brandColors.surface,
    },
})
