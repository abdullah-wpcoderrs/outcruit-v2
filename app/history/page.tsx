"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobAdCard } from "@/components/dashboard/job-ad-card"
import { TalentListCard } from "@/components/dashboard/talent-list-card"
import { TrackerTable } from "@/components/history/tracker-table"
import AuthenticatedLayout from "@/components/authenticated-layout"

interface JobAd {
    id: string
    job_title: string
    file_id: string
    created_at: string
}

interface TalentList {
    id: string
    job_title: string
    file_id: string
    candidate_count: number
    created_at: string
}

interface TrackerItem {
    id: string;
    brief_name: string;
    status: 'Active' | 'Not Active';
    recruiter_email: string;
    role_name: string;
    application_sheet_id: string;
    row_no: number;
    created_at: string;
    updated_at: string;
}

export default function HistoryPage() {
    const [jobAds, setJobAds] = useState<JobAd[]>([])
    const [talentLists, setTalentLists] = useState<TalentList[]>([])
    const [trackerData, setTrackerData] = useState<TrackerItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [adsRes, listsRes, trackerRes] = await Promise.all([
                fetch('/api/job-ads'),
                fetch('/api/talent-lists'),
                fetch('/api/history/tracker')
            ])

            if (adsRes.ok) setJobAds(await adsRes.json())
            if (listsRes.ok) setTalentLists(await listsRes.json())
            if (trackerRes.ok) setTrackerData(await trackerRes.json())
        } catch (error) {
            console.error("Failed to fetch history data", error)
        } finally {
            setLoading(false)
        }
    }

    const handleTrackerUpdate = async (id: string, updates: Partial<TrackerItem>) => {
        try {
            const response = await fetch(`/api/history/tracker/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Failed to update tracker');
            }

            await response.json();

            // Refresh data
            const trackerRes = await fetch('/api/history/tracker');
            if (trackerRes.ok) {
                setTrackerData(await trackerRes.json());
            }
        } catch (error) {
            console.error("Failed to update tracker", error);
            throw error;
        }
    }

    const handleTrackerDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/history/tracker/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete tracker');
            }

            // Refresh data
            const trackerRes = await fetch('/api/history/tracker');
            if (trackerRes.ok) {
                setTrackerData(await trackerRes.json());
            }
        } catch (error) {
            console.error("Failed to delete tracker", error);
            throw error;
        }
    }

    const handleBulkAction = async (action: string, ids: string[], data?: any) => {
        try {
            const response = await fetch('/api/history/tracker/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, tracker_ids: ids, data })
            });

            if (!response.ok) {
                throw new Error('Bulk action failed');
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to perform bulk action", error);
            throw error;
        }
    }

    const refreshTrackerData = async () => {
        try {
            const response = await fetch('/api/history/tracker');
            if (response.ok) {
                setTrackerData(await response.json());
            }
        } catch (error) {
            console.error("Failed to refresh tracker data", error);
        }
    }

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="p-8 text-center">Loading history...</div>
            </AuthenticatedLayout>
        )
    }

    return (
        <AuthenticatedLayout>
            <div className="container mx-auto py-6 space-y-8 p-4 sm:p-6 max-w-6xl">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">History</h1>
                    <p className="text-muted-foreground">
                        View your past activities and results.
                    </p>
                </div>

                <Tabs defaultValue="job-ads" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="job-ads">Job Ads</TabsTrigger>
                        <TabsTrigger value="talent-sorting">Talent Sorting</TabsTrigger>
                        <TabsTrigger value="tracker">Tracker</TabsTrigger>
                    </TabsList>

                    <TabsContent value="job-ads" className="space-y-4">
                        {jobAds.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                                No job ads generated yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {jobAds.map((ad) => (
                                    <JobAdCard
                                        key={ad.id}
                                        jobTitle={ad.job_title}
                                        fileId={ad.file_id}
                                        createdAt={ad.created_at}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="talent-sorting" className="space-y-4">
                        {talentLists.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                                No talent lists sorted yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {talentLists.map((list) => (
                                    <TalentListCard
                                        key={list.id}
                                        jobTitle={list.job_title}
                                        fileId={list.file_id}
                                        candidateCount={list.candidate_count}
                                        createdAt={list.created_at}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="tracker" className="space-y-4">
                        <TrackerTable
                            data={trackerData}
                            onUpdate={handleTrackerUpdate}
                            onDelete={handleTrackerDelete}
                            onBulkAction={handleBulkAction}
                            onRefresh={refreshTrackerData}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    )
}
