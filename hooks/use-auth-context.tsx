import { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export type AuthData = {
  session?: Session | null
  profile?: any | null
  isLoading: boolean
  isLoggedIn: boolean
  isGuest: boolean
  loginAsGuest: () => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthData>({
  session: undefined,
  profile: undefined,
  isLoading: true,
  isLoggedIn: false,
  isGuest: false,
  loginAsGuest: () => { },
  logout: async () => { },
})

export const useAuthContext = () => useContext(AuthContext)