"use client"

import type React from "react"

import { useState } from "react"
import FormCard from "@/components/form-card"
import SuccessModal from "@/components/modals/success-modal"
import ErrorModal from "@/components/modals/error-modal"
import { useAuthUser } from "@/hooks/use-auth-user"

export default function CreateJobAdsForm() {
  const { user } = useAuthUser()
  const [formData, setFormData] = useState({
    jdName: "",
    jdFile: null as File | null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [errorModal, setErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields; recruiter name is now derived from profile
    if (!formData.jdName || !formData.jdFile || !user?.email) {
      setErrorMessage("Please fill in all required fields")
      setErrorModal(true)
      return
    }

    // Check if file is PDF
    if (formData.jdFile.type !== 'application/pdf') {
      setErrorMessage("Please upload a PDF file only")
      setErrorModal(true)
      return
    }

    setIsLoading(true)

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_CREATE_JOB_ADS_WEBHOOK || "https://example.com/webhook"

      // Derive recruiter name from user profile; fallback to email local-part if name is missing
      const recruiterNameFromProfile = (user?.name && user.name.trim())
        ? user.name.trim()
        : (user?.email ? user.email.split('@')[0] : 'Recruiter')

      // Create FormData to send binary file
      const formDataToSend = new FormData()
      formDataToSend.append('jdName', formData.jdName)
      formDataToSend.append('jdFile', formData.jdFile)
      formDataToSend.append('jdFileName', formData.jdFile.name)
      // Recruiter name now comes from authenticated user's profile
      formDataToSend.append('recruiterName', recruiterNameFromProfile)
      formDataToSend.append('recruiterEmail', user.email)

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formDataToSend,
      })

      if (response.ok) {
        setSuccessModal(true)
        setFormData({ jdName: "", jdFile: null })
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
      <FormCard title="Get your Job Adcopy">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Recruiter Name field removed; webhook now uses profile name */}

          {/* JD Name */}
          <div>
            <label htmlFor="jdName" className="block text-left text-sm font-medium text-foreground mb-2">
              JD Name <span className="text-error">*</span>
            </label>
            <input
              id="jdName"
              type="text"
              placeholder="Enter Job Title"
              value={formData.jdName}
              onChange={(e) => setFormData({ ...formData, jdName: e.target.value })}
              className="w-full rounded-lg border border-border bg-input px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Upload JD */}
          <div>
            <label htmlFor="jdFile" className="block text-left text-sm font-medium text-foreground mb-2">
              Upload JD <span className="text-error">*</span>
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-input px-3 sm:px-4 py-2">
              <input
                id="jdFile"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setFormData({ ...formData, jdFile: e.target.files?.[0] || null })}
                className="hidden"
              />
              <label
                htmlFor="jdFile"
                className="cursor-pointer bg-primary text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Choose File
              </label>
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                {formData.jdFile?.name || "No file selected"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
            )}
            {isLoading ? "Processing..." : "Download your Job Adcopy"}
          </button>
        </form>
      </FormCard>

      <SuccessModal isOpen={successModal} onClose={() => setSuccessModal(false)} message="Your Adcopy is on it's way to your Email @ workforcerecruitment@zonetechpark.com." />
      <ErrorModal isOpen={errorModal} onClose={() => setErrorModal(false)} message={errorMessage} />
    </>
  )
}
