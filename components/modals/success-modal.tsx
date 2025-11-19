import { useEffect } from "react"
import { CheckCircle, X } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export default function SuccessModal({ isOpen, onClose, message }: SuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const displayMessage = message || "Your data has been submitted successfully."

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-4 sm:p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-accent mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground">Submission Successful</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {displayMessage}
              </p>
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