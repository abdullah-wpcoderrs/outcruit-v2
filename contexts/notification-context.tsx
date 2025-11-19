"use client"

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { resumeAudioContext } from '@/lib/notification-sound'

const NotificationContext = createContext<null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Request browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }

    // Resume audio context on user interaction (required by browsers)
    const handleUserInteraction = () => {
      resumeAudioContext()
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [])

  return (
    <NotificationContext.Provider value={null}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = () => useContext(NotificationContext)
