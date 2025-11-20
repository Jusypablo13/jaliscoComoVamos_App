import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { ReactNode } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { AppNavigator } from './components/app-navigator'
import AuthProvider from './components/auth-provider'
import { CategorySelectionScreen } from './components/category-selection-screen'
import { LoginScreen } from './components/login'
import { SplashScreenController } from './components/splash-screen-controller'
import {
  UserPreferencesProvider,
  useUserPreferences,
} from './contexts/user-preferences-context'
import { useAuthContext } from './hooks/use-auth-context'
import { brandColors } from './styles/theme'

function ScreenContainer({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>
}

function AppContent() {
  const { isLoading, isLoggedIn } = useAuthContext()
  const { hasSelectedCategories, isLoadingPreferences } = useUserPreferences()

  if (isLoading || isLoadingPreferences) {
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

  if (!hasSelectedCategories) {
    return <CategorySelectionScreen />
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <UserPreferencesProvider>
        <SafeAreaProvider>
          <SplashScreenController />
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <AppContent />
            <StatusBar style="dark" />
          </SafeAreaView>
        </SafeAreaProvider>
      </UserPreferencesProvider>
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