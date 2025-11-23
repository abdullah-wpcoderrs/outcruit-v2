"use client"

// Client-side wrapper for login page. It refreshes the Router and
// navigates to the dashboard after a successful login.
import { useRouter } from "next/navigation"
import LoginPage from "@/components/login-page"

export default function LoginWrapper() {
  // Initialize router to perform client-side navigation
  const router = useRouter()

  return (
    <LoginPage
      onLogin={(id) => {
        // After login, refresh any server components relying on cookies
        router.refresh()
        // Navigate user to the dashboard immediately
        router.push('/dashboard')
      }}
    />
  )
}