import { User } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { useAuthContext } from '../hooks/use-auth-context'
import { supabase } from '../lib/supabase'
import { brandColors, typography } from '../styles/theme'
import SignOutButton from './sign-out-button'

export function ProfileScreen() {
    const { session, profile, isGuest, logout } = useAuthContext()
    const [userInfo, setUserInfo] = useState<User | null>(null)
    const [isFetchingUserInfo, setIsFetchingUserInfo] = useState(false)
    const [userInfoError, setUserInfoError] = useState<string | null>(null)

    useEffect(() => {
        setUserInfo(null)
        setUserInfoError(null)
    }, [session])

    const handleFetchUserInfo = useCallback(async () => {
        if (isGuest) return

        if (!session) {
            setUserInfoError('No encontramos una sesión activa.')
            return
        }

        setIsFetchingUserInfo(true)
        setUserInfoError(null)

        try {
            const { data, error } = await supabase.auth.getUser()
            if (error) {
                throw error
            }
            setUserInfo(data.user ?? null)
            if (!data.user) {
                setUserInfoError('No pudimos obtener los datos del usuario.')
            }
        } catch (error) {
            console.error('Error fetching user info:', error)
            setUserInfo(null)
            setUserInfoError(
                'No pudimos recuperar tus datos. Inténtalo de nuevo en unos segundos.',
            )
        } finally {
            setIsFetchingUserInfo(false)
        }
    }, [session])

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Información del usuario</Text>
                <Text style={styles.cardSubtitle}>
                    Recupera desde Supabase los datos asociados a tu sesión actual.
                </Text>

                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.userInfoButton,
                        isFetchingUserInfo && styles.buttonDisabled,
                    ]}
                    onPress={handleFetchUserInfo}
                    disabled={isFetchingUserInfo}
                >
                    {isFetchingUserInfo ? (
                        <ActivityIndicator color={brandColors.surface} />
                    ) : (
                        <Text style={styles.buttonLabel}>Mostrar mis datos</Text>
                    )}
                </TouchableOpacity>

                {userInfoError && <Text style={styles.errorText}>{userInfoError}</Text>}

                {userInfo && (
                    <View style={styles.userInfoBox}>
                        {[
                            {
                                label: 'Nombre',
                                value:
                                    profile?.full_name ||
                                    (userInfo.user_metadata &&
                                        (userInfo.user_metadata.full_name ||
                                            userInfo.user_metadata.name)) ||
                                    'Sin registrar',
                            },
                            {
                                label: 'Correo',
                                value: userInfo.email ?? session?.user.email ?? 'Sin correo',
                            },
                            {
                                label: 'ID de usuario',
                                value: userInfo.id,
                            },
                            {
                                label: 'Fecha de creación',
                                value: userInfo.created_at
                                    ? new Date(userInfo.created_at).toLocaleString('es-MX')
                                    : 'Sin registro',
                            },
                            {
                                label: 'Último acceso',
                                value: userInfo.last_sign_in_at
                                    ? new Date(userInfo.last_sign_in_at).toLocaleString('es-MX')
                                    : 'Sin registro',
                            },
                        ].map((item) => (
                            <View key={item.label} style={styles.userInfoRow}>
                                <Text style={styles.userInfoLabel}>{item.label}</Text>
                                <Text style={styles.userInfoValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {isGuest && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Modo Invitado</Text>
                    <Text style={styles.cardSubtitle}>
                        Estás navegando como invitado. Para acceder a todas las funciones y
                        guardar tu progreso, inicia sesión.
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        // Signing out clears the guest session, triggering the auth flow again
                        onPress={logout}
                    >
                        <Text style={styles.buttonLabel}>Ir al Login</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!isGuest && (
                <View style={styles.signOutContainer}>
                    <SignOutButton />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: brandColors.background,
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
    userInfoButton: {
        marginTop: 8,
        marginBottom: 12,
    },
    errorText: {
        fontFamily: typography.regular,
        color: brandColors.accent,
    },
    userInfoBox: {
        borderWidth: 1,
        borderColor: '#E0E4EA',
        borderRadius: 14,
        padding: 16,
        backgroundColor: '#F8FAFF',
    },
    userInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    userInfoLabel: {
        fontFamily: typography.emphasis,
        fontSize: 14,
        color: brandColors.primary,
    },
    userInfoValue: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
        textAlign: 'right',
        flexShrink: 1,
    },
    signOutContainer: {
        marginTop: 'auto',
    },
})
