import { useState, useEffect, useCallback } from 'react'

export interface Notification {
    id: string
    type: string
    message: string
    job_name?: string
    recruiter_name?: string
    recruiter_email?: string
    created_at: string
    read_at?: string
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        }
    }, [])

    const refreshNotifications = async () => {
        setIsRefreshing(true)
        await fetchNotifications()
        setIsRefreshing(false)
    }

    useEffect(() => {
        fetchNotifications().finally(() => setIsLoading(false))
    }, [fetchNotifications])

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/mark-read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/mark-all-read', { method: 'POST' })
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    const deleteNotification = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
            setNotifications(prev => prev.filter(n => n.id !== id))
        } catch (error) {
            console.error('Failed to delete notification:', error)
        }
    }

    const clearAll = async () => {
        try {
            await fetch('/api/notifications/clear-all', { method: 'DELETE' })
            setNotifications([])
        } catch (error) {
            console.error('Failed to clear notifications:', error)
        }
    }

    const unreadCount = notifications.filter(n => !n.read_at).length

    return {
        notifications,
        unreadCount,
        isLoading,
        isRefreshing,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
    }
}
