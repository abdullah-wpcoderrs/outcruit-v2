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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Loader2, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CandidateTableProps {
    jobTrackerId: string
}

export function CandidateTable({ jobTrackerId }: CandidateTableProps) {
    const [candidates, setCandidates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchCandidates()
    }, [jobTrackerId, statusFilter])

    const fetchCandidates = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ job_tracker_id: jobTrackerId })
            if (statusFilter !== "all") {
                params.append("status", statusFilter)
            }

            const response = await fetch(`/api/candidates?${params.toString()}`)
            const data = await response.json()

            if (response.ok && Array.isArray(data)) {
                setCandidates(data)
            }
        } catch (error) {
            console.error("Failed to fetch candidates", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCandidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
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
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredCandidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No candidates found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCandidates.map((candidate) => (
                                <TableRow key={candidate.id}>
                                    <TableCell className="font-medium">{candidate.name}</TableCell>
                                    <TableCell>{candidate.email}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(candidate.status)} variant="secondary">
                                            {candidate.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {candidate.interview_date ? format(new Date(candidate.interview_date), 'MMM dd, yyyy') : '-'}
                                    </TableCell>
                                    <TableCell>{candidate.interview_time_slot || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(candidate.email)}>
                                                    Copy Email
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit Candidate</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
