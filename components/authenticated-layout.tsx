"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

interface AuthenticatedLayoutProps {
    children: React.ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Determine active nav based on pathname
    const activeNav = pathname.includes("/history") ? "history" :
        pathname.includes("/profile") ? "profile" :
            pathname.includes("/settings") ? "settings" : "dashboard"

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/')
            router.refresh()
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    const handleNavigate = (nav: string) => {
        router.push(`/${nav}`)
        setMobileMenuOpen(false)
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            <Header onLogout={handleLogout} onMobileMenuOpen={() => setMobileMenuOpen(true)} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    activeNav={activeNav}
                    onNavigate={handleNavigate}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    isMobileOpen={mobileMenuOpen}
                    onMobileClose={() => setMobileMenuOpen(false)}
                    onLogout={handleLogout}
                />
                <main className="flex-1 overflow-auto bg-background">
                    {children}
                </main>
            </div>
        </div>
    )
}
