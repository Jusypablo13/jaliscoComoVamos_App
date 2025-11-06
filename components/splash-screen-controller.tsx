import * as SplashScreen from 'expo-splash-screen'
import { useAuthContext } from '../hooks/use-auth-context'
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already prevented, ignore
})
export function SplashScreenController() {
  const { isLoading } = useAuthContext()
  if (!isLoading) {
    SplashScreen.hideAsync().catch(() => {
      // Already hidden
    })
  }
  return null
}