"use client"

import { useEffect, useState } from "react"
import LoginPage from "@/components/login-page"
import Dashboard from "@/components/dashboard"
import { supabase } from "@/lib/supabase"

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setIsLoggedIn(true)
        setUserId(session.user.id)
      }
      
      setIsLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true)
        setUserId(session.user.id)
      } else {
        setIsLoggedIn(false)
        setUserId(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUserId(null)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return isLoggedIn && userId ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <LoginPage
      onLogin={(id) => {
        setIsLoggedIn(true)
        setUserId(id)
      }}
    />
  )
}
