"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormCard from "@/components/form-card"
import SuccessModal from "@/components/modals/success-modal"
import ErrorModal from "@/components/modals/error-modal"
import { useAuthUser } from "@/hooks/use-auth-user"

export default function JDTrackerForm() {
  const { user } = useAuthUser()
  const [activeTab, setActiveTab] = useState("outsourcing")
  const [formData, setFormData] = useState({
    jobName: "",
    jdFile: null as File | null,
    additionalLogic: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [errorModal, setErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields; recruiter name is now derived from profile
    if (!formData.jobName || !formData.jdFile || !user?.email) {
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
      // Read and sanitize the webhook URL from environment variables
      const raw = process.env.NEXT_PUBLIC_JD_TRACKER_WEBHOOK
      const webhookUrl = (raw ? raw.trim() : "https://example.com/webhook")

      // Validate URL early to avoid silent fetch failures
      new URL(webhookUrl)
      const recruitmentType = activeTab === "outsourcing" ? "Outsourcing Recruitment" : "One-Off Recruitment"

      // Derive recruiter name from user profile; fallback to email local-part if name is missing
      const recruiterNameFromProfile = (user?.name && user.name.trim())
        ? user.name.trim()
        : (user?.email ? user.email.split('@')[0] : 'Recruiter')

      // Create FormData to send binary file
      const formDataToSend = new FormData()
      formDataToSend.append('jobName', formData.jobName)
      formDataToSend.append('jdFile', formData.jdFile)
      formDataToSend.append('jdFileName', formData.jdFile.name)
      formDataToSend.append('additionalLogic', formData.additionalLogic)
      // Recruiter name now comes from authenticated user's profile
      formDataToSend.append('recruiterName', recruiterNameFromProfile)
      formDataToSend.append('recruiterEmail', user.email)
      formDataToSend.append('recruitment_type', recruitmentType)
      formDataToSend.append('userId', user.id)

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formDataToSend,
      })

      if (response.ok) {
        setSuccessModal(true)
        setFormData({ jobName: "", jdFile: null, additionalLogic: "" })
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
      <FormCard title="Submit and Upload JD">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="outsourcing">
              <span className="hidden sm:inline">Outsourcing Recruitment</span>
              <span className="sm:hidden">Outsourcing</span>
            </TabsTrigger>
            <TabsTrigger value="oneoff" disabled>
              <span className="hidden sm:inline">One-Off Recruitment</span>
              <span className="sm:hidden">Recruitment</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="outsourcing" className="mt-0">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Recruiter Name field removed; webhook now uses profile name */}

              {/* Job Name */}
              <div>
                <label htmlFor="jobName" className="block text-left text-sm font-medium text-foreground mb-2">
                  Name of Job <span className="text-error">*</span>
                </label>
                <input
                  id="jobName"
                  type="text"
                  placeholder="Company Name"
                  value={formData.jobName}
                  onChange={(e) => setFormData({ ...formData, jobName: e.target.value })}
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
                    className="cursor-pointer bg-primary text-white px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap rounded-lg"
                  >
                    Choose File
                  </label>
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">
                    {formData.jdFile?.name || "No file selected"}
                  </span>
                </div>
              </div>

              {/* Additional Logic */}
              <div>
                <label htmlFor="additionalLogic" className="block text-left text-sm font-medium text-foreground mb-2">
                  Additional Logic Requirements
                </label>
                <textarea
                  id="additionalLogic"
                  placeholder="Enter any additional requirements or notes"
                  value={formData.additionalLogic}
                  onChange={(e) => setFormData({ ...formData, additionalLogic: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-input px-3 sm:px-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent px-4 py-3 font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base rounded-lg"
              >
                {isLoading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
                )}
                {isLoading ? "Uploading..." : "Upload JD"}
              </button>
            </form>
          </TabsContent>

          <TabsContent value="oneoff" className="mt-0">
            <div className="rounded-lg border border-border bg-muted p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-muted-foreground">This engine is coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </FormCard>

      <SuccessModal isOpen={successModal} onClose={() => setSuccessModal(false)} />
      <ErrorModal isOpen={errorModal} onClose={() => setErrorModal(false)} message={errorMessage} />
    </>
  )
}
