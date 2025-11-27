import { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useAuthContext } from '../hooks/use-auth-context'
import { supabase } from '../lib/supabase'
import { brandColors, typography } from '../styles/theme'
type Props = {
  onAuthSuccess?: () => void
}
export function LoginScreen({ onAuthSuccess }: Props) {
  const { loginAsGuest } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [fullName, setFullName] = useState('')
  const resetFeedback = () => {
    setFeedback(null)
    setHasError(false)
  }
  const toggleMode = () => {
    resetFeedback()
    setIsSignUpMode((prev) => !prev)
  }
  const handleSubmit = async () => {
    resetFeedback()
    if (!email.trim() || !password.trim()) {
      setFeedback('Por favor ingresa correo y contraseña.')
      setHasError(true)
      return
    }
    if (isSignUpMode && !fullName.trim()) {
      setFeedback('Ingresa tu nombre para crear la cuenta.')
      setHasError(true)
      return
    }
    setIsSubmitting(true)
    try {
      if (isSignUpMode) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        })
        if (error) {
          throw error
        }
        if (data.user) {
          const { error: profileError } = await supabase
            .from('auth.profiles')
            .upsert(
              {
                id: data.user.id,
                full_name: fullName.trim(),
                email: email.trim().toLowerCase(),
              },
              { onConflict: 'id' }
            )
          if (profileError) {
            console.warn('No se pudo guardar el perfil:', profileError.message)
          }
        }
        setFeedback(
          'Cuenta creada. Revisa tu bandeja de entrada para confirmar el correo.'
        )
        setHasError(false)
        setIsSignUpMode(false)
        setFullName('')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })
        if (error) {
          throw error
        }
        setFeedback('¡Bienvenido de vuelta!')
        setHasError(false)
        if (data.session) {
          onAuthSuccess?.()
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setHasError(true)
      setFeedback(
        error?.message ??
        'No pudimos procesar tu solicitud. Intenta de nuevo más tarde.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          Observatorio Jalisco Cómo Vamos
        </Text>
        <Text style={styles.subtitle}>
          {isSignUpMode
            ? 'Crea tu cuenta para comenzar a colaborar.'
            : 'Inicia sesión para continuar.'}
        </Text>
        {isSignUpMode && (
          <View style={styles.field}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              placeholder="María López"
              placeholderTextColor={brandColors.muted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
        )}
        <View style={styles.field}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="nombre@jalisco.org"
            placeholderTextColor={brandColors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={brandColors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>
        {!!feedback && (
          <Text style={[styles.feedback, hasError && styles.feedbackError]}>
            {feedback}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={brandColors.surface} />
          ) : (
            <Text style={styles.buttonLabel}>
              {isSignUpMode ? 'Crear cuenta' : 'Entrar'}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleMode} disabled={isSubmitting}>
          <Text style={styles.switchMode}>
            {isSignUpMode
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿Aún no tienes cuenta? Regístrate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={loginAsGuest}
          disabled={isSubmitting}
          style={styles.guestButton}
        >
          <Text style={styles.guestButtonText}>Continuar como invitado</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
export default LoginScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: brandColors.surface,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#00000033',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 22,
    color: brandColors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.regular,
    fontSize: 15,
    color: brandColors.text,
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
  },
  field: {
    width: '100%',
    marginBottom: 18,
  },
  label: {
    fontFamily: typography.heading,
    fontSize: 14,
    color: brandColors.primary,
    marginBottom: 6,
  },
  input: {
    fontFamily: typography.regular,
    borderWidth: 1,
    borderColor: brandColors.muted,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: brandColors.text,
    backgroundColor: '#FDFDFE',
  },
  feedback: {
    fontFamily: typography.regular,
    fontSize: 14,
    color: brandColors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackError: {
    color: brandColors.accent,
  },
  button: {
    width: '100%',
    backgroundColor: brandColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLabel: {
    fontFamily: typography.heading,
    fontSize: 16,
    color: brandColors.surface,
  },
  switchMode: {
    fontFamily: typography.regular,
    fontSize: 14,
    color: brandColors.accent,
    textDecorationLine: 'underline',
  },
  guestButton: {
    marginTop: 24,
    padding: 12,
  },
  guestButtonText: {
    fontFamily: typography.emphasis,
    fontSize: 14,
    color: brandColors.text,
  },
})