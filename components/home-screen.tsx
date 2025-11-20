import { useCallback, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { useAuthContext } from '../hooks/use-auth-context'
import { supabase } from '../lib/supabase'
import { brandColors, typography } from '../styles/theme'

type Registro = {
    id: string
    titulo: string
    descripcion: string
    created_at: string
    autor_id: string
}

const DATA_TABLE_NAME = 'observatorio_registros'

export function HomeScreen() {
    const { session, profile } = useAuthContext()
    const [registros, setRegistros] = useState<Registro[]>([])
    const [titulo, setTitulo] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [lastError, setLastError] = useState<string | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchRegistros = useCallback(async () => {
        setLastError(null)
        setIsLoading(true)
        const { data, error } = await supabase
            .from(DATA_TABLE_NAME)
            .select('id, titulo, descripcion, created_at, autor_id')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching registros:', error)
            setLastError(
                'No pudimos cargar la información. Verifica que la tabla observatorio_registros exista en Supabase.'
            )
            setRegistros([])
        } else if (data) {
            setRegistros(data)
        }
        setIsLoading(false)
    }, [])

    useEffect(() => {
        if (session) {
            fetchRegistros()
        }
    }, [session, fetchRegistros])

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true)
        await fetchRegistros()
        setIsRefreshing(false)
    }, [fetchRegistros])

    const handleSubmit = async () => {
        if (!titulo.trim() || !descripcion.trim() || !session) {
            Alert.alert('Completa los campos para guardar un registro.')
            return
        }

        setIsSubmitting(true)

        const payload = {
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            autor_id: session.user.id,
        }

        const { data, error } = await supabase
            .from(DATA_TABLE_NAME)
            .insert(payload)
            .select()
            .single()

        if (error) {
            console.error('Error saving registro:', error)
            Alert.alert(
                'No se pudo guardar',
                'Verifica que tu usuario tenga permisos de inserción y que la tabla exista.'
            )
        } else if (data) {
            setRegistros((prev) => [data, ...prev])
            setTitulo('')
            setDescripcion('')
            Alert.alert('Registro guardado', 'Tu información se guardó correctamente.')
        }
        setIsSubmitting(false)
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.welcomeTitle}>¡Hola, {profile?.full_name ?? session?.user.email}!</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Este panel se conecta con Supabase. Aquí puedes revisar y agregar registros que
                        quedan respaldados en la nube del Observatorio.
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Nuevo registro</Text>
                <Text style={styles.cardSubtitle}>
                    Captura hallazgos, ideas o cualquier seguimiento que quieras compartir con el equipo.
                </Text>

                <Text style={styles.label}>Título</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Indicador de movilidad"
                    value={titulo}
                    onChangeText={setTitulo}
                    placeholderTextColor={brandColors.muted}
                />

                <Text style={styles.label}>Descripción</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe el hallazgo o la pregunta al observatorio…"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholderTextColor={brandColors.muted}
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity
                    style={[styles.button, isSubmitting && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={brandColors.surface} />
                    ) : (
                        <Text style={styles.buttonLabel}>Guardar en Supabase</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Registros recientes</Text>
                {isLoading ? (
                    <ActivityIndicator color={brandColors.primary} />
                ) : lastError ? (
                    <Text style={styles.errorText}>{lastError}</Text>
                ) : registros.length === 0 ? (
                    <Text style={styles.emptyText}>
                        Aún no hay registros. ¡Comienza agregando el primero!
                    </Text>
                ) : (
                    registros.map((registro) => (
                        <View key={registro.id} style={styles.registroCard}>
                            <Text style={styles.registroTitulo}>{registro.titulo}</Text>
                            <Text style={styles.registroDescripcion}>
                                {registro.descripcion}
                            </Text>
                            <Text style={styles.registroMeta}>
                                {new Date(registro.created_at).toLocaleString('es-MX')}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: brandColors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
        gap: 16,
    },
    welcomeTitle: {
        fontFamily: typography.heading,
        fontSize: 20,
        color: brandColors.primary,
    },
    welcomeSubtitle: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
        marginTop: 8,
    },
    card: {
        backgroundColor: brandColors.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#00000022',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    cardTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: brandColors.primary,
        marginBottom: 8,
    },
    cardSubtitle: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
        marginBottom: 20,
    },
    label: {
        fontFamily: typography.emphasis,
        fontSize: 14,
        color: brandColors.primary,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: brandColors.muted,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontFamily: typography.regular,
        fontSize: 16,
        color: brandColors.text,
        backgroundColor: '#FDFDFE',
        marginBottom: 14,
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: brandColors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonLabel: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: brandColors.surface,
    },
    errorText: {
        fontFamily: typography.regular,
        color: brandColors.accent,
    },
    emptyText: {
        fontFamily: typography.regular,
        color: brandColors.text,
    },
    registroCard: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E0E4EA',
        paddingVertical: 12,
    },
    registroTitulo: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: brandColors.primary,
    },
    registroDescripcion: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
        marginTop: 6,
    },
    registroMeta: {
        fontFamily: typography.emphasis,
        fontSize: 12,
        color: brandColors.muted,
        marginTop: 6,
    },
})
