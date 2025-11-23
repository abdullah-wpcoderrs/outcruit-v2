"use client"

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search, Download, Plus, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

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

interface TrackerTableProps {
    data: TrackerItem[];
    onUpdate: (id: string, updates: Partial<TrackerItem>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onBulkAction: (action: string, ids: string[], data?: any) => Promise<void>;
    onRefresh: () => void;
}

type SortColumn = 'row_no' | 'brief_name' | 'status' | 'recruiter_email' | 'role_name';
type SortDirection = 'asc' | 'desc';

const truncateText = (text: string, maxLength: number) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export function TrackerTable({ data, onUpdate, onDelete, onBulkAction, onRefresh }: TrackerTableProps) {
    const router = useRouter();

    // State management
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Sorting
    const [sortColumn, setSortColumn] = useState<SortColumn>('row_no');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filter and search data
    const filteredData = useMemo(() => {
        let filtered = [...data];

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => item.status === statusFilter);
        }

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.brief_name?.toLowerCase().includes(query) ||
                item.recruiter_email?.toLowerCase().includes(query) ||
                item.role_name?.toLowerCase().includes(query) ||
                item.application_sheet_id?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [data, searchQuery, statusFilter]);

    // Sort data
    const sortedData = useMemo(() => {
        const sorted = [...filteredData];

        sorted.sort((a, b) => {
            let aVal: any = a[sortColumn];
            let bVal: any = b[sortColumn];

            // Handle null/undefined
            if (!aVal) aVal = '';
            if (!bVal) bVal = '';

            // Sort numbers
            if (sortColumn === 'row_no') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            // Sort strings
            const comparison = aVal.toString().localeCompare(bVal.toString());
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }, [filteredData, sortColumn, sortDirection]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startItem = sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, sortedData.length);

    // Handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(paginatedData.map(item => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
        );
    };

    const handleStatusChange = async (id: string, newStatus: 'Active' | 'Not Active') => {
        try {
            await onUpdate(id, { status: newStatus });
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleApplyBulkAction = async () => {
        if (!bulkAction || selectedIds.length === 0) return;

        setIsProcessing(true);
        try {
            switch (bulkAction) {
                case 'delete':
                    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} item(s)?`)) {
                        await onBulkAction('delete', selectedIds);
                        setSelectedIds([]);
                        onRefresh();
                    }
                    break;
                case 'set_active':
                    await onBulkAction('update_status', selectedIds, { status: 'Active' });
                    setSelectedIds([]);
                    onRefresh();
                    break;
                case 'set_not_active':
                    await onBulkAction('update_status', selectedIds, { status: 'Not Active' });
                    setSelectedIds([]);
                    onRefresh();
                    break;
            }
            setBulkAction('');
        } catch (error) {
            console.error('Bulk action failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedIds([]);
    };

    const handlePageSizeChange = (size: string) => {
        setPageSize(Number(size));
        setCurrentPage(1);
        setSelectedIds([]);
    };

    const handleCreateNew = () => {
        router.push('/dashboard?tab=jd-tracker');
    };

    const handleExportCSV = () => {
        // Prepare CSV data
        const headers = ['Row No', 'Brief Name', 'Status', 'Recruiter Email', 'Role Name', 'Application Sheet ID', 'Created At', 'Updated At'];
        const csvData = sortedData.map(item => [
            item.row_no || '',
            item.brief_name || '',
            item.status || '',
            item.recruiter_email || '',
            item.role_name || '',
            item.application_sheet_id || '',
            new Date(item.created_at).toLocaleString(),
            new Date(item.updated_at).toLocaleString()
        ]);

        // Create CSV string
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const today = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `tracker-export-${today}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openGoogleSheet = (sheetId: string) => {
        window.open(`https://docs.google.com/spreadsheets/d/${sheetId}`, '_blank');
    };

    const getSortIcon = (column: SortColumn) => {
        if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
        return sortDirection === 'asc'
            ? <ArrowUp className="h-4 w-4 ml-1" />
            : <ArrowDown className="h-4 w-4 ml-1" />;
    };

    // Reset to page 1 when search or filter changes
    useMemo(() => {
        setCurrentPage(1);
        setSelectedIds([]);
    }, [searchQuery, statusFilter]);

    return (
        <div className="space-y-4">
            {/* Toolbar - Mobile Responsive */}
            <div className="flex flex-col gap-3 md:gap-4">
                {/* Row 1: Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search trackers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Not Active">Not Active</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Row 2: Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-between">
                    <div className="flex gap-2">
                        <Button
                            onClick={handleCreateNew}
                            className="flex-1 sm:flex-none"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="sm:inline">Create New</span>
                        </Button>
                        <Button
                            onClick={handleExportCSV}
                            variant="outline"
                            className="flex-1 sm:flex-none"
                            disabled={sortedData.length === 0}
                        >
                            <Download className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Export CSV</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-card rounded-lg border shadow-sm">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Bulk Actions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="set_active">Set Active</SelectItem>
                        <SelectItem value="set_not_active">Set Not Active</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    onClick={handleApplyBulkAction}
                    disabled={selectedIds.length === 0 || !bulkAction || isProcessing}
                    variant="secondary"
                    className="w-full sm:w-auto"
                >
                    {isProcessing ? 'Processing...' : 'Apply'}
                </Button>

                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {selectedIds.length} item(s) selected
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedIds([])}
                        >
                            Clear
                        </Button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card shadow-sm overflow-x-auto px-[5px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort('row_no')}>
                                <div className="flex items-center">
                                    Row No
                                    {getSortIcon('row_no')}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer min-w-[200px]" onClick={() => handleSort('brief_name')}>
                                <div className="flex items-center">
                                    Brief Name
                                    {getSortIcon('brief_name')}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer min-w-[130px]" onClick={() => handleSort('status')}>
                                <div className="flex items-center">
                                    Status
                                    {getSortIcon('status')}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer min-w-[180px] hidden md:table-cell" onClick={() => handleSort('recruiter_email')}>
                                <div className="flex items-center">
                                    Recruiter Email
                                    {getSortIcon('recruiter_email')}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer min-w-[150px] hidden lg:table-cell" onClick={() => handleSort('role_name')}>
                                <div className="flex items-center">
                                    Role Name
                                    {getSortIcon('role_name')}
                                </div>
                            </TableHead>
                            <TableHead className="min-w-[120px]">Sheet</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    {searchQuery || statusFilter !== 'all'
                                        ? 'No trackers match your search criteria.'
                                        : 'No tracker data found.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(item.id)}
                                            onCheckedChange={() => handleSelectRow(item.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.row_no || '-'}</TableCell>
                                    <TableCell className="font-medium">
                                        <span title={item.brief_name}>
                                            {truncateText(item.brief_name, 40)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={item.status}
                                            onValueChange={(value) => handleStatusChange(item.id, value as 'Active' | 'Not Active')}
                                        >
                                            <SelectTrigger className="w-[130px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">
                                                    <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                                                </SelectItem>
                                                <SelectItem value="Not Active">
                                                    <Badge variant="secondary">Not Active</Badge>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <span title={item.recruiter_email}>
                                            {truncateText(item.recruiter_email, 30)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <span title={item.role_name}>
                                            {truncateText(item.role_name, 35)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openGoogleSheet(item.application_sheet_id)}
                                            className="flex items-center gap-2"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            <span className="hidden sm:inline">Open</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    Showing {startItem}-{endItem} of {sortedData.length} items
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 order-1 sm:order-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Previous</span>
                        </Button>

                        {/* Page numbers - hidden on mobile */}
                        <div className="hidden md:flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(pageNum)}
                                        className="w-9 h-9"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>

                        {/* Current page indicator - visible on mobile */}
                        <div className="md:hidden text-sm text-muted-foreground px-2">
                            Page {currentPage} of {totalPages}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <span className="hidden sm:inline mr-1">Next</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
