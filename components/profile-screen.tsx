import { User } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useAuthContext } from '../hooks/use-auth-context'
import { supabase } from '../lib/supabase'
import { brandColors, typography } from '../styles/theme'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from './navigation/NavigationTypes'


export function ProfileScreen() {
    const { session, profile, isGuest, logout } = useAuthContext()
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
    const [userInfo, setUserInfo] = useState<User | null>(null)
    const [isFetchingUserInfo, setIsFetchingUserInfo] = useState(false)

    // Auto-fetch user info on mount if logged in
    useEffect(() => {
        if (!isGuest && session) {
            fetchUserInfo()
        }
    }, [session, isGuest])

    const fetchUserInfo = async () => {
        setIsFetchingUserInfo(true)
        try {
            const { data, error } = await supabase.auth.getUser()
            if (!error && data.user) {
                setUserInfo(data.user)
            }
        } catch (error) {
            console.error('Error fetching user info:', error)
        } finally {
            setIsFetchingUserInfo(false)
        }
    }

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text)
        Alert.alert('Copiado', 'ID de usuario copiado al portapapeles')
    }
    return (
        <ScrollView>
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Información del usuario</Text>
                <Text style={styles.cardSubtitle}>
                    Recupera desde Supabase los datos asociados a tu sesión actual.
                </Text>

    const handleLogout = async () => {
        if (isGuest) {
            navigation.navigate('Login')
        } else {
            await logout()
        }
    }

    // Derived data
    const userName = isGuest
        ? 'Sin registrar'
        : profile?.full_name || userInfo?.user_metadata?.full_name || userInfo?.user_metadata?.name || 'Usuario'

    const userEmail = isGuest
        ? 'Sin correo registrado'
        : userInfo?.email || session?.user.email || 'Sin correo'

    const userId = isGuest ? 'Invitado' : userInfo?.id || session?.user.id || '...'

    const createdAt = userInfo?.created_at
        ? new Date(userInfo.created_at).toLocaleString('es-MX', {
            day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
        })
        : '...'

    const lastSignIn = userInfo?.last_sign_in_at
        ? new Date(userInfo.last_sign_in_at).toLocaleString('es-MX', {
            day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
        })
        : '...'

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Avatar Section */}
            <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={60} color="#A0AEC0" />
                </View>
                <Text style={styles.userName}>{userName}</Text>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nombre</Text>
                    <Text style={styles.infoValue}>{userName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Correo</Text>
                    <Text style={styles.infoValue}>{userEmail}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>ID de usuario</Text>
                    <View style={styles.idValueContainer}>
                        <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                            {userId.substring(0, 8)}...{userId.substring(userId.length - 6)}
                        </Text>
                        {!isGuest && (
                            <TouchableOpacity onPress={() => copyToClipboard(userId)} style={styles.copyButton}>
                                <Ionicons name="copy-outline" size={16} color={brandColors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Fecha de creación</Text>
                    <Text style={styles.infoValue}>{createdAt}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Último acceso</Text>
                    <Text style={styles.infoValue}>{lastSignIn}</Text>
                </View>
            </View>

            {/* Social Media Section */}
            <Text style={styles.sectionTitle}>Síguenos en redes</Text>
            <View style={styles.socialGrid}>
                <TouchableOpacity
                    style={styles.socialCard}
                    onPress={() => Linking.openURL('https://www.facebook.com/jaliscomovamos')}
                    accessibilityLabel="Visitar Facebook"
                    accessibilityRole="link"
                >
                    <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                    <Text style={styles.socialText}>@Facebook</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.socialCard}
                    onPress={() => Linking.openURL('https://x.com/jaliscomovamos')}
                    accessibilityLabel="Visitar X"
                    accessibilityRole="link"
                >
                    <Text style={styles.xLogo}>𝕏</Text>
                    <Text style={styles.socialText}>X</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.socialCard}
                    onPress={() => Linking.openURL('https://www.instagram.com/jaliscomovamos/')}
                    accessibilityLabel="Visitar Instagram"
                    accessibilityRole="link"
                >
                    <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                    <Text style={styles.socialText}>@Instagram</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.socialCard}
                    onPress={() => Linking.openURL('https://www.youtube.com/channel/UCn1zLVu1oCAcXzlhMEMgE2w')}
                    accessibilityLabel="Visitar YouTube"
                    accessibilityRole="link"
                >
                    <Ionicons name="logo-youtube" size={24} color="#FF0000" />
                    <Text style={styles.socialText}>YouTube</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.socialCard, styles.fullWidthCard]}
                    onPress={() => Linking.openURL('https://jaliscocomovamos.org/')}
                    accessibilityLabel="Visitar sitio web"
                    accessibilityRole="link"
                >
                    <Ionicons name="globe-outline" size={24} color={brandColors.primary} />
                    <Text style={styles.socialText}>@jaliscocomovamos.org</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                accessibilityLabel={isGuest ? "Ir al inicio de sesión" : "Cerrar sesión"}
                accessibilityRole="button"
            >
                <Text style={styles.logoutButtonText}>
                    {isGuest ? 'Iniciar sesión' : 'Cerrar sesión'}
                </Text>
            </TouchableOpacity>
            {!isGuest && (
                <View style={styles.signOutContainer}>
                    <SignOutButton />
                </View>
            )}
        </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC', // Light gray background
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 40,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 16,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    userName: {
        fontFamily: typography.heading,
        fontSize: 24,
        color: '#2D3748',
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 32,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F7FAFC',
    },
    infoLabel: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: brandColors.primary,
        flex: 1,
    },
    infoValue: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: '#4A5568',
        textAlign: 'right',
        flex: 2,
    },
    idValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 2,
    },
    copyButton: {
        marginLeft: 8,
        padding: 4,
    },
    sectionTitle: {
        fontFamily: typography.regular,
        fontSize: 16,
        color: '#A0AEC0',
        marginBottom: 16,
        textAlign: 'center',
    },
    socialGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 32,
    },
    socialCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        width: '48%', // Approx half width
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    fullWidthCard: {
        width: '100%',
    },
    socialText: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: '#2D3748',
        marginLeft: 12,
        flex: 1,
    },
    xLogo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
        width: 24,
        textAlign: 'center',
    },
    logoutButton: {
        backgroundColor: '#E53E3E', // Red
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#E53E3E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutButtonText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: 'white',
    },
})
