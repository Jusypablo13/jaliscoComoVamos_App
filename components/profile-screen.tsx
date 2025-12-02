import { User } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthContext } from '../hooks/use-auth-context'
import { supabase } from '../lib/supabase'
import { brandColors, typography } from '../styles/theme'
import SignOutButton from './sign-out-button'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from './navigation/NavigationTypes'

export function ProfileScreen() {
    const { session, profile, isGuest, logout } = useAuthContext()
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
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
                    accessibilityLabel="Mostrar mis datos"
                    accessibilityRole="button"
                    accessibilityState={{ busy: isFetchingUserInfo }}
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
                        onPress={() => navigation.navigate('Login')}
                        accessibilityLabel="Ir al inicio de sesión"
                        accessibilityRole="button"
                    >
                        <Text style={styles.buttonLabel}>Ir al Login</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Social Media Buttons */}
            <View style={styles.socialSection}>
                <Text style={styles.socialTitle}>Síguenos en redes</Text>
                <View style={styles.socialButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
                        onPress={() => Linking.openURL('https://www.facebook.com/jaliscomovamos')}
                        accessibilityLabel="Visitar Facebook de Jalisco Cómo Vamos"
                        accessibilityRole="link"
                    >
                        <View style={styles.socialIconContainer}>
                            <Ionicons name="logo-facebook" size={20} color="white" />
                        </View>
                        <Text style={styles.socialButtonText}>@jaliscomovamos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialButton, { backgroundColor: '#000000' }]}
                        onPress={() => Linking.openURL('https://x.com/jaliscomovamos')}
                        accessibilityLabel="Visitar X de Jalisco Cómo Vamos"
                        accessibilityRole="link"
                    >
                        <View style={styles.socialIconContainer}>
                            {/* Custom X Logo using Text since Ionicons might not have it yet */}
                            <Text style={styles.xLogo}>𝕏</Text>
                        </View>
                        <Text style={styles.socialButtonText}>@jaliscomovamos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
                        onPress={() => Linking.openURL('https://www.instagram.com/jaliscomovamos/')}
                        accessibilityLabel="Visitar Instagram de Jalisco Cómo Vamos"
                        accessibilityRole="link"
                    >
                        <View style={styles.socialIconContainer}>
                            <Ionicons name="logo-instagram" size={20} color="white" />
                        </View>
                        <Text style={styles.socialButtonText}>@jaliscomovamos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialButton, { backgroundColor: '#FF0000' }]}
                        onPress={() => Linking.openURL('https://www.youtube.com/channel/UCn1zLVu1oCAcXzlhMEMgE2w')}
                        accessibilityLabel="Visitar YouTube de Jalisco Cómo Vamos"
                        accessibilityRole="link"
                    >
                        <View style={styles.socialIconContainer}>
                            <Ionicons name="logo-youtube" size={20} color="white" />
                        </View>
                        <Text style={styles.socialButtonText}>Jalisco Cómo Vamos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialButton, { backgroundColor: brandColors.primary }]}
                        onPress={() => Linking.openURL('https://jaliscocomovamos.org/')}
                        accessibilityLabel="Visitar sitio web de Jalisco Cómo Vamos"
                        accessibilityRole="link"
                    >
                        <View style={styles.socialIconContainer}>
                            <Ionicons name="globe-outline" size={20} color="white" />
                        </View>
                        <Text style={styles.socialButtonText}>jaliscocomovamos.org</Text>
                    </TouchableOpacity>
                </View>
            </View>

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
        marginTop: 20,
        marginBottom: 40,
    },
    socialSection: {
        marginTop: 'auto',
        marginBottom: 20,
        alignItems: 'center',
    },
    socialTitle: {
        fontFamily: typography.emphasis,
        fontSize: 14,
        color: brandColors.muted,
        marginBottom: 12,
    },
    socialButtonsContainer: {
        flexDirection: 'column',
        gap: 12,
        width: '100%',
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    socialIconContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    socialButtonText: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: 'white',
    },
    xLogo: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
})
