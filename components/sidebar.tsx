"use client"

import { ChevronLeft, ChevronRight, LayoutDashboard, History, User, Settings, X, LogOut } from "lucide-react"

interface SidebarProps {
  activeNav: string
  onNavigate: (nav: string) => void
  isOpen: boolean
  onToggle: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
  onLogout?: () => void
}

export default function Sidebar({
  activeNav,
  onNavigate,
  isOpen,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
  onLogout,
}: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "history", label: "History", icon: History },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleNavClick = (id: string) => {
    onNavigate(id)
    onMobileClose?.()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden sm:flex flex-col border-r border-border bg-primary transition-all duration-300 overflow-hidden ${isOpen ? "w-56" : "w-16"
          }`}
      >
        {/* Toggle Button */}
        <div className={`flex items-center border-b border-primary-foreground/10 p-4 ${isOpen ? "justify-between" : "justify-center"
          }`}>
          {isOpen && (
            <span className="text-sm font-semibold text-primary-foreground whitespace-nowrap transition-opacity duration-300">
              Menu
            </span>
          )}
          <button onClick={onToggle} className="rounded-lg p-1 hover:bg-primary-foreground/10 transition-colors">
            {isOpen ? (
              <ChevronLeft className="h-5 w-5 text-primary-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-primary-foreground" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.id

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center rounded-lg py-3 text-sm font-medium transition-all ${isOpen ? "justify-start gap-3 px-4" : "justify-center px-2"
                  } ${isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-primary-foreground hover:bg-primary-foreground/10"
                  }`}
              >
                <Icon className="flex-shrink-0 h-5 w-5 transition-all" />
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${isOpen ? "opacity-100 w-auto ml-0" : "opacity-0 w-0 ml-0 overflow-hidden"
                    }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && <div className="fixed inset-0 z-30 bg-black/50 sm:hidden" onClick={onMobileClose} />}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 w-56 border-r border-border bg-primary transition-transform duration-300 sm:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex-shrink-0 flex items-center justify-between border-b border-primary-foreground/10 p-4">
            <span className="text-sm font-semibold text-primary-foreground">Menu</span>
            <button
              onClick={onMobileClose}
              className="rounded-lg p-1 hover:bg-primary-foreground/10 transition-colors"
            >
              <X className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>

          {/* Navigation Links - Scrollable */}
          <nav className="flex-1 overflow-y-auto space-y-2 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeNav === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-start gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-primary-foreground hover:bg-primary-foreground/10"
                    }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Logout Button - Fixed at bottom */}
          {onLogout && (
            <div className="flex-shrink-0 border-t border-primary-foreground/10 p-4">
              <button
                onClick={() => {
                  onLogout()
                  onMobileClose?.()
                }}
                className="w-full flex items-center justify-start gap-3 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
