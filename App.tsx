import { StatusBar } from 'expo-status-bar'
import { ReactNode } from 'react'
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native'
import AuthProvider from './components/auth-provider'
import Dashboard from './components/dashboard'
import { LoginScreen } from './components/login'
import { SplashScreenController } from './components/splash-screen-controller'
import { useAuthContext } from './hooks/use-auth-context'
import { brandColors } from './styles/theme'
function ScreenContainer({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>
}
function AppContent() {
  const { isLoading, isLoggedIn } = useAuthContext()
  if (isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator size="large" color={brandColors.primary} />
      </ScreenContainer>
    )
  }
  if (!isLoggedIn) {
    return (
      <ScreenContainer>
        <LoginScreen />
      </ScreenContainer>
    )
  }
  return (
    <ScreenContainer>
      <Dashboard />
    </ScreenContainer>
  )
}
export default function App() {
  return (
    <AuthProvider>
      <SplashScreenController />
      <SafeAreaView style={styles.safeArea}>
        <AppContent />
        <StatusBar style="dark" />
      </SafeAreaView>
    </AuthProvider>
  )
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: brandColors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: brandColors.background,
  },
})