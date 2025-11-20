"use client"

import { Bell, Check, CheckCheck, RefreshCw, Trash2, X } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  notificationHook?: ReturnType<typeof useNotifications>
}

export default function NotificationPanel({ isOpen, onClose, notificationHook }: NotificationPanelProps) {
  const hookData = notificationHook || useNotifications()
  const { notifications, unreadCount, isLoading, isRefreshing, markAsRead, markAllAsRead, deleteNotification, clearAll, refreshNotifications } = hookData

  if (!isOpen) return null

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'jd-tracker':
        return '📄'
      case 'talent-sorting':
        return '👥'
      case 'job-ads':
        return '⚡'
      default:
        return '🔔'
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-screen w-full sm:w-96 bg-background border-l border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-primary">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-foreground" />
            <h2 className="text-lg font-semibold text-primary-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-primary-foreground/10 transition-colors"
          >
            <X className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
          <button
            onClick={refreshNotifications}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh notifications"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {notifications.length > 0 && (
            <>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-error transition-colors ml-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-3" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll be notified when your jobs are processed
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const isUnread = !notification.read_at
                return (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors hover:bg-muted/50 ${isUnread ? 'bg-green-50/50 dark:bg-green-950/20' : ''
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed">
                          {notification.message}
                        </p>
                        {notification.job_name && (
                          <p className="text-xs text-muted-foreground mt-1 font-medium">
                            Job: {notification.job_name}
                          </p>
                        )}
                        {notification.recruiter_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            From: {notification.recruiter_name}
                            {notification.recruiter_email && (
                              <span className="text-muted-foreground/70"> ({notification.recruiter_email})</span>
                            )}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isUnread && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4 text-muted-foreground" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 rounded-lg hover:bg-error/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-error" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
