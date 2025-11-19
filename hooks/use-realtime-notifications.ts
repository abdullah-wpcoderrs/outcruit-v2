// Custom hook for Supabase Realtime notifications
// Following Senior SWE best practices
import { useEffect, useState, useCallback } from 'react'
import { supabase, type SupabaseNotification } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import { playNotificationSound } from '@/lib/notification-sound'

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<SupabaseNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getCurrentUser()
  }, [])

  // Fetch initial notifications
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!userId) return
    
    try {
      if (!silent) setIsLoading(true)

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      
      // Calculate unread count
      const unread = (data || []).filter(n => !n.read_at).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Manual refresh
  const refreshNotifications = useCallback(async () => {
    setIsRefreshing(true)
    await fetchNotifications(true)
    setIsRefreshing(false)
  }, [fetchNotifications])

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Revert on error
      await fetchNotifications(true)
    }
  }, [userId, fetchNotifications])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id)
    if (unreadIds.length === 0) return

    // Optimistic update
    const timestamp = new Date().toISOString()
    setNotifications(prev =>
      prev.map(n => !n.read_at ? { ...n, read_at: timestamp } : n)
    )
    setUnreadCount(0)

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: timestamp })
        .in('id', unreadIds)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking all as read:', error)
      await fetchNotifications(true)
    }
  }, [notifications, userId, fetchNotifications])

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    // Optimistic update
    const wasUnread = notifications.find(n => n.id === id && !n.read_at)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting notification:', error)
      await fetchNotifications(true)
    }
  }, [notifications, userId, fetchNotifications])

  // Clear all notifications
  const clearAll = useCallback(async () => {
    const notificationIds = notifications.map(n => n.id)
    if (notificationIds.length === 0) return

    // Optimistic update
    setNotifications([])
    setUnreadCount(0)

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error clearing notifications:', error)
      await fetchNotifications(true)
    }
  }, [notifications, userId, fetchNotifications])

  // Setup Realtime subscription
  useEffect(() => {
    if (!userId) return

    // Initial fetch
    fetchNotifications()

    // Setup Realtime subscription
    const channel: RealtimeChannel = supabase
      .channel(`notifications-for-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as SupabaseNotification
          
          // Add to state
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
          
          // Play sound and show browser notification
          playNotificationSound()
          showBrowserNotification(newNotification)
        }
      )
      .subscribe()

    // Cleanup on unmount (CRITICAL)
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refreshNotifications,
  }
}

// Show browser notification
function showBrowserNotification(notification: SupabaseNotification) {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return
  
  if (Notification.permission === 'granted') {
    try {
      new Notification('Outcruit', {
        body: notification.message,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: notification.id,
        silent: false,
      })
    } catch {
      // Silent fail
    }
  } else if (Notification.permission === 'default') {
    Notification.requestPermission()
  }
}
