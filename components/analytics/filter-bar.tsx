import { useEffect, useState } from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    TouchableWithoutFeedback,
    TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { AnalyticsService, Question } from '../../services/analytics'
import { brandColors, typography } from '../../styles/theme'

type FilterBarProps = {
    onSearch: (query: string) => void
    onThemeSelect: (theme: string | null) => void
    onQuestionSelect: (question: Question) => void
    selectedTheme: string | null
    selectedQuestion: string | null
}

export function FilterBar({
    onSearch,
    onThemeSelect,
    onQuestionSelect,
    selectedTheme,
    selectedQuestion,
}: FilterBarProps) {
    const [categories, setCategories] = useState<string[]>([])
    const [questions, setQuestions] = useState<Question[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [modalVisible, setModalVisible] = useState(false)

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
        const data = await AnalyticsService.fetchQuestionsForTheme(theme)
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

            {/* Theme Selector - Bottom Sheet Trigger */}
            <View style={styles.section}>
                <Text style={styles.label}>Temática</Text>
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={[
                        styles.dropdownButtonText,
                        !selectedTheme && styles.placeholderText
                    ]}>
                        {selectedTheme || 'Seleccionar temática'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={brandColors.muted} />
                </TouchableOpacity>
            </View>

            {/* Theme Selection Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Seleccionar Temática</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={brandColors.text} />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={styles.modalList}>
                                    <TouchableOpacity
                                        style={styles.modalOption}
                                        onPress={() => {
                                            onThemeSelect(null)
                                            setModalVisible(false)
                                        }}
                                    >
                                        <Text style={[
                                            styles.modalOptionText,
                                            selectedTheme === null && styles.modalOptionTextSelected
                                        ]}>Todas</Text>
                                        {selectedTheme === null && (
                                            <Ionicons name="checkmark" size={20} color={brandColors.primary} />
                                        )}
                                    </TouchableOpacity>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={styles.modalOption}
                                            onPress={() => {
                                                onThemeSelect(cat)
                                                setModalVisible(false)
                                            }}
                                        >
                                            <Text style={[
                                                styles.modalOptionText,
                                                selectedTheme === cat && styles.modalOptionTextSelected
                                            ]}>{cat}</Text>
                                            {selectedTheme === cat && (
                                                <Ionicons name="checkmark" size={20} color={brandColors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Question Selector (Only if theme selected) */}
            {selectedTheme && questions.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.label}>Preguntas</Text>
                    <View style={styles.questionsList}>
                        {questions.map((q) => (
                            <TouchableOpacity
                                key={q.pregunta_id}
                                style={[
                                    styles.questionItem,
                                    selectedQuestion === q.pregunta_id && styles.questionItemSelected,
                                ]}
                                onPress={() => onQuestionSelect(q)}
                            >
                                <Text
                                    style={[
                                        styles.questionText,
                                        selectedQuestion === q.pregunta_id &&
                                        styles.questionTextSelected,
                                    ]}
                                >
                                    {q.texto_pregunta?.trim() || q.pregunta_id}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
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
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E0E4EA',
    },
    dropdownButtonText: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
    },
    placeholderText: {
        color: brandColors.muted,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: brandColors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: brandColors.primary,
    },
    modalList: {
        paddingHorizontal: 20,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F7FA',
    },
    modalOptionText: {
        fontFamily: typography.regular,
        fontSize: 16,
        color: brandColors.text,
    },
    modalOptionTextSelected: {
        fontFamily: typography.emphasis,
        color: brandColors.primary,
    },
    questionsList: {
        flexDirection: 'column',
        gap: 8,
    },
    questionItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    questionItemSelected: {
        backgroundColor: brandColors.primary,
        borderColor: brandColors.primary,
    },
    questionText: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
        lineHeight: 20,
    },
    questionTextSelected: {
        color: brandColors.surface,
        fontFamily: typography.emphasis,
    },
})
