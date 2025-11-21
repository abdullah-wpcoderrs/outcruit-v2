"use client"

import { useState, useEffect } from "react"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CandidateTable } from "@/components/candidate-table"
import { ScheduleInterviewForm } from "@/components/schedule-interview-form"
import { SendEmailForm } from "@/components/send-email-form"

export default function CandidatesPage() {
    const [jobTrackers, setJobTrackers] = useState<{ id: string, name: string }[]>([])
    const [selectedJobTrackerId, setSelectedJobTrackerId] = useState<string>("")
    const [selectedJobName, setSelectedJobName] = useState<string>("")

    const handleJobChange = (id: string) => {
        setSelectedJobTrackerId(id)
        const t = jobTrackers.find(t => t.id === id)
        setSelectedJobName(t?.name || "")
    }

    return (
        <AuthenticatedLayout>
            <div className="container mx-auto py-6 space-y-8 p-4 sm:p-6 max-w-7xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Candidate Management</h1>
                        <p className="text-muted-foreground">
                            Manage candidates, schedule interviews, and send communications.
                        </p>
                    </div>
                    <div className="w-full sm:w-[300px]">
                        <Select value={selectedJobTrackerId} onValueChange={handleJobChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Job" />
                            </SelectTrigger>
                            <SelectContent>
                                {jobTrackers.map((tracker) => (
                                    <SelectItem key={tracker.id} value={tracker.id}>
                                        {tracker.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {selectedJobTrackerId ? (
                    <Tabs defaultValue="candidates" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="candidates">All Candidates</TabsTrigger>
                            <TabsTrigger value="schedule">Schedule Interviews</TabsTrigger>
                            <TabsTrigger value="communications">Communications</TabsTrigger>
                        </TabsList>

                        <TabsContent value="candidates">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Candidates for {selectedJobName}</CardTitle>
                                    <CardDescription>
                                        View and manage all candidates for this role.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CandidateTable jobTrackerId={selectedJobTrackerId} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="schedule">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Smart Scheduler</CardTitle>
                                    <CardDescription>
                                        Automatically schedule interviews for unscheduled candidates.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScheduleInterviewForm
                                        jobTrackerId={selectedJobTrackerId}
                                        jobName={selectedJobName}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="communications">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Email Communications</CardTitle>
                                    <CardDescription>
                                        Send interview invites, congratulations, or rejection emails.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SendEmailForm
                                        jobTrackerId={selectedJobTrackerId}
                                        jobName={selectedJobName}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
                            <p className="text-muted-foreground mb-4">
                                Please select a job tracker to view candidates.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    )
}
