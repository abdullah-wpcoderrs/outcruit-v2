"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { useSearchParams } from "next/navigation"
import CreateJobAdsForm from "@/components/forms/create-job-ads-form"
import JDTrackerForm from "@/components/forms/jd-tracker-form"
import TalentSortingForms from "@/components/forms/talent-sorting-forms"
import { Suspense } from "react"

function DashboardContent() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'job-ads';

    return (
        <div className="container mx-auto py-6 space-y-8 p-4 sm:p-6 max-w-4xl">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

                <Tabs defaultValue={defaultTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="job-ads">Create Job Ads</TabsTrigger>
                        <TabsTrigger value="talent-sorting">Talent Sorting</TabsTrigger>
                        <TabsTrigger value="jd-tracker">JD Tracker</TabsTrigger>
                        <TabsTrigger value="candidate-communication">Candidate Communication</TabsTrigger>
                    </TabsList>

                    <TabsContent value="job-ads" className="flex justify-center">
                        <div className="w-full max-w-[570px]">
                            <CreateJobAdsForm />
                        </div>
                    </TabsContent>

                    <TabsContent value="talent-sorting" className="flex justify-center">
                        <div className="w-full max-w-[570px]">
                            <TalentSortingForms />
                        </div>
                    </TabsContent>

                    <TabsContent value="jd-tracker" className="flex justify-center">
                        <div className="w-full max-w-[570px]">
                            <JDTrackerForm />
                        </div>
                    </TabsContent>

                    <TabsContent value="candidate-communication" className="flex justify-center">
                        <Card className="w-full max-w-[570px]">
                            <CardHeader>
                                <CardTitle>Candidate Communication</CardTitle>
                                <CardDescription>
                                    Manage candidates, schedule interviews, and send emails.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-8">
                                <div className="flex flex-col space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Access the full candidate management suite to schedule interviews and communicate with applicants.
                                    </p>
                                    <Button className="w-full" asChild>
                                        <a href="/candidates">Go to Candidate Management</a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

            export default function DashboardPage() {
    return (
            <AuthenticatedLayout>
                <Suspense fallback={<div className="container mx-auto py-6 p-4 sm:p-6 max-w-4xl">Loading dashboard...</div>}>
                    <DashboardContent />
                </Suspense>
            </AuthenticatedLayout>
            )
}
