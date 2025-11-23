"use client"

import type React from "react"

import { useState } from "react"
import FormCard from "@/components/form-card"
import SuccessModal from "@/components/modals/success-modal"
import ErrorModal from "@/components/modals/error-modal"
import { useAuthUser } from "@/hooks/use-auth-user"

export default function TalentSortingForms() {
  const { user } = useAuthUser()
  const [formData, setFormData] = useState({
    jobName: "",
    responseSheetUrl: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [errorModal, setErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields; recruiter name is now derived from profile
    if (!user?.email || !formData.jobName || !formData.responseSheetUrl) {
      setErrorMessage("Please fill in all required fields")
      setErrorModal(true)
      return
    }

    setIsLoading(true)

    try {
      // Read and sanitize the webhook URL from environment variables
      const raw = process.env.NEXT_PUBLIC_TALENT_SORTING_WEBHOOK
      const webhookUrl = (raw ? raw.trim() : "https://example.com/webhook")

      // Validate URL early to catch misconfiguration
      new URL(webhookUrl)

      // Derive recruiter name from user profile; fallback to email local-part if name is missing
      const recruiterNameFromProfile = (user?.name && user.name.trim())
        ? user.name.trim()
        : (user?.email ? user.email.split('@')[0] : 'Recruiter')

      const payload = {
        recruiterName: recruiterNameFromProfile,
        recruiterEmail: user.email,
        jobName: formData.jobName,
        responseSheetUrl: formData.responseSheetUrl,
        userId: user.id,
      }

      const response = await fetch(webhookUrl, {
        method: "POST", // Changed from GET to POST method - GET/HEAD cannot have body
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSuccessModal(true)
        setFormData({ jobName: "", responseSheetUrl: "" })
      } else {
        throw new Error(`Submission failed: ${response.statusText}`)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An error occurred")
      setErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <FormCard title="Talent Sorting">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <p className="text-sm text-muted-foreground mb-6">
            Submit your applicant response sheet to sort and analyze talent pool
          </p>

          {/* Recruiter Name field removed; webhook now uses profile name */}

          {/* Name Of Job */}
          <div>
            <label htmlFor="jobName" className="block text-left text-sm font-medium text-foreground mb-2">
              Name Of Job <span className="text-error">*</span>
            </label>
            <input
              id="jobName"
              type="text"
              placeholder="Enter Job Title"
              value={formData.jobName}
              onChange={(e) => setFormData({ ...formData, jobName: e.target.value })}
              className="w-full rounded-lg border border-border bg-input px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Response Sheet URL */}
          <div>
            <label htmlFor="responseSheetUrl" className="block text-left text-sm font-medium text-foreground mb-2">
              Response Sheet Url <span className="text-error">*</span>
            </label>
            <input
              id="responseSheetUrl"
              type="url"
              placeholder="Google sheet URL (https://...)"
              value={formData.responseSheetUrl}
              onChange={(e) => setFormData({ ...formData, responseSheetUrl: e.target.value })}
              className="w-full rounded-lg border border-border bg-input px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
            )}
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </FormCard>

      <SuccessModal isOpen={successModal} onClose={() => setSuccessModal(false)} />
      <ErrorModal isOpen={errorModal} onClose={() => setErrorModal(false)} message={errorMessage} />
    </>
  )
}
