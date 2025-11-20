"use client"

import { useState } from "react"
import { LogOut, User, Menu, Bell } from "lucide-react"
import NotificationPanel from "@/components/notification-panel"
import { useNotifications } from "@/hooks/use-notifications"
import { useAuthUser } from "@/hooks/use-auth-user"

interface HeaderProps {
  onLogout: () => void
  onMobileMenuOpen?: () => void
}

export default function Header({ onLogout, onMobileMenuOpen }: HeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState(false)
  const notificationHook = useNotifications()
  const { unreadCount } = notificationHook
  const { user } = useAuthUser()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-primary shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-lg sm:text-xl font-bold text-primary-foreground">
              Outcruit<span className="text-accent text-2xl leading-none">.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={onMobileMenuOpen}
              className="sm:hidden flex items-center justify-center rounded-lg p-2 hover:bg-primary-foreground/10 transition-colors"
            >
              <Menu className="h-5 w-5 text-primary-foreground" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationOpen(true)}
              className="relative flex items-center justify-center rounded-lg p-2 hover:bg-primary-foreground/10 transition-colors"
            >
              <Bell className="h-5 w-5 text-primary-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                <User className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-primary-foreground">
                Hello, {user?.email || 'Recruiter'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="hidden sm:flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <LogOut className="h-4 w-4 text-white" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <NotificationPanel
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        notificationHook={notificationHook}
      />
    </>
  )
}
