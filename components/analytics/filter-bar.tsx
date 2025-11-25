import { useEffect, useState } from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { brandColors, typography } from '../../styles/theme'

type FilterBarProps = {
    onSearch: (query: string) => void
    onThemeSelect: (theme: string | null) => void
    onQuestionSelect: (questionId: string | null) => void
    selectedTheme: string | null
    selectedQuestion: string | null
}

type Category = {
    nombre_categoria: string
    pregunta_id: string
    // We might need more metadata later
}

export function FilterBar({
    onSearch,
    onThemeSelect,
    onQuestionSelect,
    selectedTheme,
    selectedQuestion,
}: FilterBarProps) {
    const [categories, setCategories] = useState<string[]>([])
    const [questions, setQuestions] = useState<Category[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        if (selectedTheme) {
            fetchQuestionsForTheme(selectedTheme)
        } else {
            setQuestions([])
        }
    }, [selectedTheme])

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('preguntas')
            .select('nombre_categoria')

        if (data) {
            const categoriesData = data as { nombre_categoria: string }[]
            const unique = Array.from(
                new Set(categoriesData.map((d) => d.nombre_categoria))
            ).sort()
            setCategories(unique)
        }
    }

    const fetchQuestionsForTheme = async (theme: string) => {
        const { data } = await supabase
            .from('preguntas')
            .select('*')
            .eq('nombre_categoria', theme)

        if (data) {
            setQuestions(data)
        }
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar tema o pregunta..."
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text)
                        onSearch(text)
                    }}
                    placeholderTextColor={brandColors.muted}
                />
            </View>

            {/* Theme Selector */}
            <View style={styles.section}>
                <Text style={styles.label}>Temática</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[
                            styles.chip,
                            selectedTheme === null && styles.chipSelected,
                        ]}
                        onPress={() => onThemeSelect(null)}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                selectedTheme === null && styles.chipTextSelected,
                            ]}
                        >
                            Todas
                        </Text>
                    </TouchableOpacity>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.chip,
                                selectedTheme === cat && styles.chipSelected,
                            ]}
                            onPress={() => onThemeSelect(cat)}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    selectedTheme === cat && styles.chipTextSelected,
                                ]}
                            >
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Question Selector (Only if theme selected) */}
            {selectedTheme && questions.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.label}>Pregunta</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {questions.map((q) => (
                            <TouchableOpacity
                                key={q.pregunta_id}
                                style={[
                                    styles.chip,
                                    styles.questionChip,
                                    selectedQuestion === q.pregunta_id && styles.chipSelected,
                                ]}
                                onPress={() => onQuestionSelect(q.pregunta_id)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        selectedQuestion === q.pregunta_id &&
                                        styles.chipTextSelected,
                                    ]}
                                >
                                    {q.pregunta_id}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: brandColors.surface,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E4EA',
    },
    searchContainer: {
        marginBottom: 16,
    },
    searchInput: {
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
    },
    section: {
        marginBottom: 12,
    },
    label: {
        fontFamily: typography.emphasis,
        fontSize: 12,
        color: brandColors.muted,
        marginBottom: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F7FA',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    questionChip: {
        backgroundColor: '#EEF2FF',
    },
    chipSelected: {
        backgroundColor: brandColors.primary,
        borderColor: brandColors.primary,
    },
    chipText: {
        fontFamily: typography.regular,
        fontSize: 13,
        color: brandColors.text,
    },
    chipTextSelected: {
        color: brandColors.surface,
        fontFamily: typography.emphasis,
    },
})
