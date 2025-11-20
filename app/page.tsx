"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoginPage from "@/components/login-page"

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setIsLoggedIn(true)
            setUserId(data.user.id)
            router.push('/dashboard')
          }
        }
      } catch (error) {
        console.error('Session check failed', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])

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

  return (
    <LoginPage
      onLogin={(id) => {
        setIsLoggedIn(true)
        setUserId(id)
        router.push('/dashboard')
      }}
    />
  )
}
