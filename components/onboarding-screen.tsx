import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useAuthContext } from '../hooks/use-auth-context'
import { brandColors, typography } from '../styles/theme'

export function OnboardingScreen() {
    const { loginAsGuest } = useAuthContext()

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={require('../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>
                    Observatorio Jalisco Cómo Vamos
                </Text>
                <Text style={styles.subtitle}>
                    Explora los datos, indicadores y encuestas sobre la calidad de vida en Jalisco.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={loginAsGuest}
                >
                    <Text style={styles.buttonLabel}>Continuar como invitado</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.background,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        backgroundColor: brandColors.surface,
        padding: 32,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
    },
    logo: {
        width: 180,
        height: 90,
        marginBottom: 24,
    },
    title: {
        fontFamily: typography.heading,
        fontSize: 24,
        color: brandColors.primary,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontFamily: typography.regular,
        fontSize: 16,
        color: brandColors.text,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    button: {
        width: '100%',
        backgroundColor: brandColors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonLabel: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: brandColors.surface,
    },
})
