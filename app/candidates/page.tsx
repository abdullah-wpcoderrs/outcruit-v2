"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CandidateTable } from "@/components/candidate-table"
import { ScheduleInterviewForm } from "@/components/schedule-interview-form"
import { SendEmailForm } from "@/components/send-email-form"

export default function CandidatesPage() {
    const searchParams = useSearchParams()
    const [talentLists, setTalentLists] = useState<{ id: string, name: string }[]>([])
    const [selectedTalentListId, setSelectedTalentListId] = useState<string>("")
    const [selectedJobName, setSelectedJobName] = useState<string>("")

    const handleJobChange = (id: string) => {
        setSelectedTalentListId(id)
        const t = talentLists.find(t => t.id === id)
        setSelectedJobName(t?.name || "")
    }

    useEffect(() => {
        const run = async () => {
            try {
                const res = await fetch('/api/talent-lists')
                const data = await res.json()
                if (Array.isArray(data)) {
                    const mapped = data.map((d: any) => ({ id: d.id, name: d.job_title || d.file_name || 'Untitled' }))
                    setTalentLists(mapped)
                }
            } catch {}
        }
        run()
    }, [])

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
                        <Select value={selectedTalentListId} onValueChange={handleJobChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Job" />
                            </SelectTrigger>
                            <SelectContent>
                                {talentLists.map((list) => (
                                    <SelectItem key={list.id} value={list.id}>
                                        {list.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {selectedTalentListId ? (
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
                                    <CandidateTable talentListId={selectedTalentListId} jobName={selectedJobName} />
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
                                        talentListId={selectedTalentListId}
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
                                        talentListId={selectedTalentListId}
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
