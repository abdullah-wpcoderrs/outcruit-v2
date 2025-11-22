"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Loader2, MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface CandidateTableProps {
    jobTrackerId?: string
    talentListId?: string
    overrideCandidates?: any[]
    jobName?: string
}

export function CandidateTable({ jobTrackerId, talentListId, overrideCandidates, jobName }: CandidateTableProps) {
    const [candidates, setCandidates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [total, setTotal] = useState(0)
    const [confirmSendOpen, setConfirmSendOpen] = useState(false)
    const [sending, setSending] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editCandidate, setEditCandidate] = useState<any | null>(null)
    const [viewOpen, setViewOpen] = useState(false)
    const [viewCandidate, setViewCandidate] = useState<any | null>(null)

    useEffect(() => {
        fetchCandidates()
    }, [jobTrackerId, talentListId, statusFilter, overrideCandidates, page, pageSize, searchQuery])

    useEffect(() => {
        const handler = () => fetchCandidates()
        window.addEventListener('schedule:completed', handler)
        return () => window.removeEventListener('schedule:completed', handler)
    }, [])

    const fetchCandidates = async () => {
        setLoading(true)
        try {
            if (overrideCandidates && Array.isArray(overrideCandidates) && overrideCandidates.length) {
                const mapped = overrideCandidates.map((c: any) => ({
                    ...c,
                    status: c.status || "Shortlisted",
                }))
                setCandidates(mapped)
                setTotal(mapped.length)
                return
            }

            if (talentListId) {
                const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
                if (searchQuery) qs.append('q', searchQuery)
                if (statusFilter !== 'all') qs.append('status', statusFilter)
                const response = await fetch(`/api/talent-lists/${talentListId}/candidates?${qs.toString()}`)
                const data = await response.json()
                const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : [])
                if (response.ok && Array.isArray(list)) {
                    const mapped = list.map((c: any) => ({
                        ...c,
                        status: c.status || "Shortlisted",
                    }))
                    setCandidates(mapped)
                    setTotal(typeof data?.total === 'number' ? data.total : mapped.length)
                }
                return
            }

            if (jobTrackerId) {
                const params = new URLSearchParams({ job_tracker_id: jobTrackerId })
                if (statusFilter !== "all") params.append("status", statusFilter)
                const response = await fetch(`/api/candidates?${params.toString()}`)
                const data = await response.json()
                if (response.ok && Array.isArray(data)) {
                    setCandidates(data)
                    setTotal(data.length)
                }
                return
            }
        } catch (error) {
            console.error("Failed to fetch candidates", error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Unscheduled": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            case "Scheduled": return "bg-blue-100 text-blue-800 hover:bg-blue-100"
            case "Shortlisted": return "bg-green-100 text-green-800 hover:bg-green-100"
            case "PROCEEDING": return "bg-purple-100 text-purple-800 hover:bg-purple-100"
            case "Dropped": return "bg-red-100 text-red-800 hover:bg-red-100"
            case "Notified-Rejected - CLOSED": return "bg-gray-100 text-gray-800 hover:bg-gray-100"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    const toggleSelectAll = () => {
        const filtered = candidates
        if (selectedIds.length === filtered.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filtered.map(c => c.id))
        }
    }

    const toggleRow = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const applyBulkStatus = async (status: string) => {
        if (!talentListId || selectedIds.length === 0) return
        await fetch(`/api/talent-lists/${talentListId}/candidates`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: selectedIds, updates: { status } })
        })
        setSelectedIds([])
        fetchCandidates()
    }

    const changeStatus = async (id: string, status: string) => {
        if (!talentListId) return
        // Optimistic update
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c))
        try {
            const res = await fetch(`/api/talent-lists/${talentListId}/candidates`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, updates: { status } })
            })
            if (!res.ok) throw new Error('Failed to update status')
        } catch (e) {
            // Re-fetch on failure to restore server truth
            fetchCandidates()
        }
    }

    const scheduledCount = candidates.filter(c => c.status === 'Scheduled').length
    const maxPage = Math.max(1, Math.ceil(total / pageSize))

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <Input
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Unscheduled">Unscheduled</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="PROCEEDING">Proceeding</SelectItem>
                        <SelectItem value="Dropped">Dropped</SelectItem>
                        <SelectItem value="Notified-Rejected - CLOSED">Rejected (Closed)</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex items-center gap-2 ml-auto">
                    {scheduledCount > 0 && (
                        <Button onClick={() => setConfirmSendOpen(true)} variant="outline">Send Interview Schedule Mail</Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox checked={selectedIds.length === candidates.length && candidates.length > 0} onCheckedChange={toggleSelectAll} />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Interview Date</TableHead>
                            <TableHead>Time Slot</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : candidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No candidates found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            candidates.map((candidate) => (
                                <TableRow key={candidate.id}>
                                    <TableCell>
                                        <Checkbox checked={selectedIds.includes(candidate.id)} onCheckedChange={() => toggleRow(candidate.id)} />
                                    </TableCell>
                                    <TableCell className="font-medium">{candidate.name}</TableCell>
                                    <TableCell>{candidate.email}</TableCell>
                                    <TableCell>
                                        <Select value={candidate.status} onValueChange={(v) => changeStatus(candidate.id, v)}>
                                            <SelectTrigger className={`w-[180px] ${getStatusColor(candidate.status)}`}>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Unscheduled">Unscheduled</SelectItem>
                                                <SelectItem value="Scheduled">Scheduled</SelectItem>
                                                <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                                                <SelectItem value="PROCEEDING">Proceeding</SelectItem>
                                                <SelectItem value="Dropped">Dropped</SelectItem>
                                                <SelectItem value="Notified-Rejected - CLOSED">Rejected (Closed)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {candidate.interview_date ? format(new Date(candidate.interview_date), 'MMM dd, yyyy') : '-'}
                                    </TableCell>
                                    <TableCell>{candidate.interview_time_slot || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {candidate.application_sheet_id && (
                                                <Button variant="outline" size="sm" onClick={() => { setViewCandidate(candidate); setViewOpen(true) }}>View Details</Button>
                                            )}
                                            <Button variant="outline" size="sm" onClick={() => { setEditCandidate(candidate); setEditOpen(true) }}>Edit</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                    <Select onValueChange={(v) => applyBulkStatus(v)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Bulk change status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Unscheduled">Unscheduled</SelectItem>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="PROCEEDING">Proceeding</SelectItem>
                            <SelectItem value="Dropped">Dropped</SelectItem>
                            <SelectItem value="Notified-Rejected - CLOSED">Rejected (Closed)</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">Selected: {selectedIds.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Total: {total}</span>
                    <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
                    <span className="text-sm">Page {page} / {maxPage}</span>
                    <Button variant="outline" disabled={page >= maxPage} onClick={() => setPage(p => Math.min(maxPage, p + 1))}>Next</Button>
                    <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(1) }}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder={String(pageSize)} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Dialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send interview schedule emails</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 text-sm">
                        <p>Send emails to all candidates with status "Scheduled".</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmSendOpen(false)} disabled={sending}>Cancel</Button>
                        <Button onClick={async () => {
                            setSending(true)
                            try {
                                const res = await fetch('/api/candidates/communicate', {
                                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ talentListId: talentListId || '', jobName: jobName || '', emailType: 'interview_schedule' })
                                })
                                const data = await res.json()
                                if (!res.ok) throw new Error(data.error || 'Failed')
                                toast.success(`Emails sent: ${data.successCount}, failed: ${data.failCount}`)
                                setConfirmSendOpen(false)
                            } catch (e) {
                                toast.error(e instanceof Error ? e.message : 'Error')
                            } finally {
                                setSending(false)
                            }
                        }} disabled={sending}>
                            {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editCandidate ? editCandidate.name : 'Candidate'}</DialogTitle>
                    </DialogHeader>
                    {editCandidate && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input value={editCandidate.name || ''} onChange={(e) => setEditCandidate({ ...editCandidate, name: e.target.value })} />
                            <Input value={editCandidate.email || ''} onChange={(e) => setEditCandidate({ ...editCandidate, email: e.target.value })} />
                            <Input value={editCandidate.phone_number || ''} onChange={(e) => setEditCandidate({ ...editCandidate, phone_number: e.target.value })} />
                            <Input value={editCandidate.role_applying_for || ''} onChange={(e) => setEditCandidate({ ...editCandidate, role_applying_for: e.target.value })} />
                            <Input value={editCandidate.gender || ''} onChange={(e) => setEditCandidate({ ...editCandidate, gender: e.target.value })} />
                            <Input value={editCandidate.residential_address || ''} onChange={(e) => setEditCandidate({ ...editCandidate, residential_address: e.target.value })} />
                            <Input value={editCandidate.academic_qualification || ''} onChange={(e) => setEditCandidate({ ...editCandidate, academic_qualification: e.target.value })} />
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Close</Button>
                        <Button onClick={async () => {
                            if (!talentListId || !editCandidate) return
                            await fetch(`/api/talent-lists/${talentListId}/candidates`, {
                                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: editCandidate.id, updates: {
                                    name: editCandidate.name,
                                    email: editCandidate.email,
                                    phone_number: editCandidate.phone_number,
                                    role_applying_for: editCandidate.role_applying_for,
                                    gender: editCandidate.gender,
                                    residential_address: editCandidate.residential_address,
                                    academic_qualification: editCandidate.academic_qualification
                                } })
                            })
                            setEditOpen(false)
                            setEditCandidate(null)
                            fetchCandidates()
                        }}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>{viewCandidate ? viewCandidate.name : 'Candidate Details'}</DialogTitle>
                    </DialogHeader>
                    {viewCandidate && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Email</div>
                                    <div>{viewCandidate.email || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Phone</div>
                                    <div>{viewCandidate.phone_number || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Gender</div>
                                    <div>{viewCandidate.gender || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Qualification</div>
                                    <div>{viewCandidate.academic_qualification || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Address</div>
                                    <div>{viewCandidate.residential_address || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Role</div>
                                    <div>{viewCandidate.role_applying_for || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Row No</div>
                                    <div>{viewCandidate.row_no ?? '-'}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Sheet ID</div>
                                    <div className="truncate" title={viewCandidate.application_sheet_id || ''}>{viewCandidate.application_sheet_id || '-'}</div>
                                </div>
                            </div>
                            {viewCandidate.application_sheet_id && (
                                <div className="pt-2">
                                    <a className="text-sm text-accent hover:underline" href={`https://docs.google.com/spreadsheets/d/${viewCandidate.application_sheet_id}`} target="_blank" rel="noreferrer">
                                        Open Google Sheet
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
