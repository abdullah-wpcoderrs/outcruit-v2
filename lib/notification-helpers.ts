// Helper functions for notification management

import { type Notification } from './notification-storage'

/**
 * Format notification message based on type and status
 */
export function formatNotificationMessage(
  type: string,
  status: 'success' | 'error' | 'processing',
  jobName?: string
): string {
  switch (type) {
    case 'jd-tracker':
      if (status === 'success') {
        return `Your JD "${jobName}" has been processed successfully! You can now view the results.`
      }
      if (status === 'error') {
        return `There was an error processing JD "${jobName}". Please try again.`
      }
      return `Processing JD "${jobName}"...`

    case 'talent-sorting':
      if (status === 'success') {
        return `Talent sorting for "${jobName}" is complete! Check your results.`
      }
      if (status === 'error') {
        return `Error sorting talents for "${jobName}". Please try again.`
      }
      return `Sorting talents for "${jobName}"...`

    case 'job-ads':
      if (status === 'success') {
        return `Job ad for "${jobName}" has been created successfully!`
      }
      if (status === 'error') {
        return `Failed to create job ad for "${jobName}". Please try again.`
      }
      return `Creating job ad for "${jobName}"...`

    default:
      return 'New notification received'
  }
}

/**
 * Get notification icon emoji based on type
 */
export function getNotificationIcon(type: string): string {
  switch (type) {
    case 'jd-tracker':
      return '📄'
    case 'talent-sorting':
      return '👥'
    case 'job-ads':
      return '⚡'
    case 'system':
      return '🔔'
    default:
      return '📬'
  }
}

/**
 * Filter notifications by type
 */
export function filterNotificationsByType(
  notifications: Notification[],
  type: string
): Notification[] {
  return notifications.filter(n => n.type === type)
}

/**
 * Get notifications from last N days
 */
export function getRecentNotifications(
  notifications: Notification[],
  days: number = 7
): Notification[] {
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000)
  return notifications.filter(n => n.timestamp >= cutoffTime)
}

/**
 * Group notifications by date
 */
export function groupNotificationsByDate(
  notifications: Notification[]
): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {}
  
  notifications.forEach(notification => {
    const date = new Date(notification.timestamp).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(notification)
  })
  
  return groups
}

/**
 * Check if notification is recent (within last hour)
 */
export function isRecentNotification(notification: Notification): boolean {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  return notification.timestamp >= oneHourAgo
}

/**
 * Export notifications as JSON
 */
export function exportNotifications(notifications: Notification[]): string {
  return JSON.stringify(notifications, null, 2)
}

/**
 * Import notifications from JSON
 */
export function importNotifications(jsonString: string): Notification[] | null {
  try {
    const parsed = JSON.parse(jsonString)
    if (Array.isArray(parsed)) {
      return parsed as Notification[]
    }
    return null
  } catch {
    return null
  }
}
