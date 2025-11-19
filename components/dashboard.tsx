"use client"

import { useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import JDTrackerForm from "@/components/forms/jd-tracker-form"
import TalentSortingForms from "@/components/forms/talent-sorting-forms"
import CreateJobAdsForm from "@/components/forms/create-job-ads-form"

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeNav, setActiveNav] = useState("jd-tracker")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const renderContent = () => {
    switch (activeNav) {
      case "jd-tracker":
        return <JDTrackerForm />
      case "talent-sorting":
        return <TalentSortingForms />
      case "create-job-ads":
        return <CreateJobAdsForm />
      default:
        return <JDTrackerForm />
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header onLogout={onLogout} onMobileMenuOpen={() => setMobileMenuOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeNav={activeNav}
          onNavigate={setActiveNav}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-auto bg-background">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
