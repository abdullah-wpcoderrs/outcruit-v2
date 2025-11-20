import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
import { ExternalLink } from "lucide-react";
import { useState } from "react";

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

const truncateText = (text: string, maxLength: number) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export function TrackerTable({ data, onUpdate, onDelete, onBulkAction, onRefresh }: TrackerTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(data.map(item => item.id));
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

    const openGoogleSheet = (sheetId: string) => {
        window.open(`https://docs.google.com/spreadsheets/d/${sheetId}`, '_blank');
    };

    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-[200px]">
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
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedIds.length === data.length && data.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[60px]">S/N</TableHead>
                            <TableHead>Brief Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Recruiter Email</TableHead>
                            <TableHead>Role Name</TableHead>
                            <TableHead>Application Sheet</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No tracker data found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => (
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
                                    <TableCell>
                                        <span title={item.recruiter_email}>
                                            {truncateText(item.recruiter_email, 30)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
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
                                            Open
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
