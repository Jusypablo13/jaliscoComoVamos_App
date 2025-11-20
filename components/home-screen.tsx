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

import { Database } from '../types/supabase'

type EncuestaRow = Database['public']['Tables']['encuestalol']['Row']

const DATA_TABLE_NAME = 'encuestalol'

export function HomeScreen() {
    const { session, profile } = useAuthContext()
    const [registros, setRegistros] = useState<EncuestaRow[]>([])
    const [titulo, setTitulo] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [lastError, setLastError] = useState<string | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchRegistros = useCallback(async () => {
        setLastError(null)
        setIsLoading(true)
        // Fetching a subset of columns for display, or all if needed.
        // Since the table structure is different (no 'titulo'/'descripcion'), 
        // we'll just fetch everything or specific columns to show it works.
        const { data, error } = await supabase
            .from(DATA_TABLE_NAME)
            .select('*')
            .limit(20)

        if (error) {
            console.error('Error fetching registros:', error)
            setLastError(
                'No pudimos cargar la información. Verifica que la tabla encuestalol exista en Supabase.'
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

    // Form logic removed as it doesn't match the new table schema
    // You can implement a new form based on the 'encuestalol' columns later.

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
                        Conectado a la tabla 'encuestalol'. Aquí se muestran los últimos registros.
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Registros recientes</Text>
                {isLoading ? (
                    <ActivityIndicator color={brandColors.primary} />
                ) : lastError ? (
                    <Text style={styles.errorText}>{lastError}</Text>
                ) : registros.length === 0 ? (
                    <Text style={styles.emptyText}>
                        Aún no hay registros.
                    </Text>
                ) : (
                    registros.map((registro, index) => (
                        <View key={index} style={styles.registroCard}>
                            <Text style={styles.registroTitulo}>Fecha: {registro.Date}</Text>
                            <Text style={styles.registroDescripcion}>
                                Duración: {registro.Duration} | Q_1: {registro.Q_1}
                            </Text>
                            <Text style={styles.registroMeta}>
                                Factor: {registro.FACTOR}
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
