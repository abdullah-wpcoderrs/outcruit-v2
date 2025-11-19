import type React from "react"

interface FormCardProps {
  title: string
  children: React.ReactNode
}

export default function FormCard({ title, children }: FormCardProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="border border-border bg-card p-4 sm:p-8 shadow-sm rounded-lg">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
        {children}
      </div>
    </div>
  )
}
