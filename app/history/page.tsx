"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobAdCard } from "@/components/dashboard/job-ad-card"
import { TalentListCard } from "@/components/dashboard/talent-list-card"
import { TrackerTable } from "@/components/history/tracker-table"
import { TalentSortingTable } from "@/components/history/talent-sorting-table"
import { CsvPreview } from "@/components/history/csv-preview"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"

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
    const [preview, setPreview] = useState<{ fileId: string; title: string } | null>(null)
    const [talentView, setTalentView] = useState<'documents' | 'table'>('table')
    const [deletingAds, setDeletingAds] = useState<Set<string>>(new Set())
    const [deletingTalent, setDeletingTalent] = useState<Set<string>>(new Set())

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

    const openPreview = (fileId: string, title: string) => {
        setPreview({ fileId, title })
    }

    const closePreview = () => {
        setPreview(null)
    }

    const openNewTab = (fileId: string) => {
        window.open(`/api/files/${fileId}?preview=1`, '_blank', 'noopener,noreferrer')
    }

    const downloadFile = async (fileId: string, title: string) => {
        try {
            const res = await fetch(`/api/files/${fileId}?download=1`)
            if (!res.ok) return
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const dispo = res.headers.get('Content-Disposition') || ''
            const match = dispo.match(/filename="(.+?)"/)
            a.download = match?.[1] || `${title}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        } catch (e) {}
    }

    const deleteJobAd = async (id: string) => {
        setDeletingAds(prev => new Set(prev).add(id))
        setJobAds(prev => prev.filter(ad => ad.id !== id))
        try {
            const res = await fetch(`/api/job-ads/${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const adsRes = await fetch('/api/job-ads')
                if (adsRes.ok) setJobAds(await adsRes.json())
            }
        } catch (e) {
            const adsRes = await fetch('/api/job-ads')
            if (adsRes.ok) setJobAds(await adsRes.json())
        } finally {
            setDeletingAds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }

    const deleteTalentList = async (id: string) => {
        setDeletingTalent(prev => new Set(prev).add(id))
        setTalentLists(prev => prev.filter(t => t.id !== id))
        try {
            const res = await fetch(`/api/talent-lists/${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const listsRes = await fetch('/api/talent-lists')
                if (listsRes.ok) setTalentLists(await listsRes.json())
            }
        } catch (e) {
            const listsRes = await fetch('/api/talent-lists')
            if (listsRes.ok) setTalentLists(await listsRes.json())
        } finally {
            setDeletingTalent(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
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
                                        id={ad.id}
                                        jobTitle={ad.job_title}
                                        fileId={ad.file_id}
                                        createdAt={ad.created_at}
                                        onOpen={openPreview}
                                        onOpenNewTab={openNewTab}
                                        onDownload={downloadFile}
                                        onDelete={deleteJobAd}
                                        isDeleting={deletingAds.has(ad.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="talent-sorting" className="space-y-4">
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-muted-foreground">View</span>
                            <div className="flex rounded-md border">
                                <button className={`px-3 py-1 text-xs ${talentView === 'documents' ? 'bg-accent text-accent-foreground' : ''}`} onClick={() => setTalentView('documents')}>Documents</button>
                                <button className={`px-3 py-1 text-xs ${talentView === 'table' ? 'bg-accent text-accent-foreground' : ''}`} onClick={() => setTalentView('table')}>Table</button>
                            </div>
                        </div>
                        {talentLists.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                                No talent lists sorted yet.
                            </div>
                        ) : talentView === 'documents' ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {talentLists.map((list) => (
                                    <TalentListCard
                                        key={list.id}
                                        id={list.id}
                                        jobTitle={list.job_title}
                                        fileId={list.file_id}
                                        candidateCount={list.candidate_count}
                                        createdAt={list.created_at}
                                        onOpen={openPreview}
                                        onOpenNewTab={openNewTab}
                                        onDownload={downloadFile}
                                        onDelete={deleteTalentList}
                                        isDeleting={deletingTalent.has(list.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <TalentSortingTable />
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
                {preview && (
                    <div className="fixed inset-0 z-50">
                        <div className="absolute inset-0 bg-black/50" onClick={closePreview} />
                        <div className="absolute right-0 top-0 h-full w-full max-w-5xl bg-background shadow-xl flex flex-col">
                            <div className="p-4 border-b flex items-center justify-between">
                                <div className="font-semibold text-base line-clamp-1">{preview.title}</div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => openNewTab(preview.fileId)}>Open in new tab</Button>
                                    <Button variant="outline" onClick={() => downloadFile(preview.fileId, preview.title)}>Download</Button>
                                    <Button variant="ghost" size="icon" onClick={closePreview}>×</Button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <CsvPreview fileId={preview.fileId} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    )
}
