// Server Component version of the home page. It checks the authentication
// cookie on the server and redirects before any client-side paint.
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/auth"
import LoginWrapper from "./login-wrapper"

export default async function Page() {
  // Read the auth token from cookies at request time
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  // If we have a token, verify it on the server and redirect to dashboard
  if (token) {
    const payload = await verifyToken(token)
    if (payload) {
      redirect('/dashboard')
    }
  }

  // Not logged in: render the client-side login wrapper immediately
  return <LoginWrapper />
}
