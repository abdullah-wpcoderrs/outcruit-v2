"use client"

import { AlertCircle, X } from "lucide-react"

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export default function ErrorModal({ isOpen, onClose, message }: ErrorModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-4 sm:p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-error mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground">Error</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors flex-shrink-0">
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
