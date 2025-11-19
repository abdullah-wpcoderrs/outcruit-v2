// Hook to get current authenticated user
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email) {
        setUser({
          id: user.id,
          email: user.email
        })
      }
      
      setIsLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUser({
          id: session.user.id,
          email: session.user.email
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading }
}
