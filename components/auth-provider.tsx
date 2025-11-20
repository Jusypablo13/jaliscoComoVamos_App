import type { Session } from '@supabase/supabase-js'
import { PropsWithChildren, useEffect, useState } from 'react'

import { AuthContext } from '../hooks/use-auth-context'
import { supabase } from '../lib/supabase'

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isGuest, setIsGuest] = useState<boolean>(false)

  useEffect(() => {
    let isActive = true

    const fetchSession = async () => {
      setIsLoading(true)

      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error fetching session:', error)
      }

      if (isActive) {
        setSession(data.session ?? null)
        setIsLoading(false)
      }
    }

    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) {
        return
      }

      setSession(nextSession)
      // If we have a session, we are not a guest
      if (nextSession) {
        setIsGuest(false)
      }
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let isActive = true

    const fetchProfile = async () => {
      if (!session) {
        setProfile(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!isActive) {
        return
      }

      if (error) {
        console.warn('No profile found for session user:', error.message)
        setProfile(null)
      } else {
        setProfile(data)
      }

      setIsLoading(false)
    }

    fetchProfile()

    return () => {
      isActive = false
    }
  }, [session])

  const logout = async () => {
    await supabase.auth.signOut()
    setIsGuest(false)
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        isLoggedIn: !!session || isGuest,
        isGuest,
        loginAsGuest: () => setIsGuest(true),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
