import Link from 'next/link';
import { FileText, Calendar, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useRef } from 'react';

interface JobAdCardProps {
    id: string;
    jobTitle: string;
    fileId: string;
    createdAt: string;
    onOpen: (fileId: string, jobTitle: string) => void;
    onOpenNewTab: (fileId: string) => void;
    onDownload: (fileId: string, jobTitle: string) => void;
    onDelete: (id: string) => void;
    isDeleting?: boolean;
}

export function JobAdCard({ id, jobTitle, fileId, createdAt, onOpen, onOpenNewTab, onDownload, onDelete, isDeleting }: JobAdCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [title, setTitle] = useState(jobTitle);
    const [renameOpen, setRenameOpen] = useState(false);
    const [renameValue, setRenameValue] = useState(jobTitle);
    const [renameLoading, setRenameLoading] = useState(false);
    const [renameError, setRenameError] = useState('');
    const menuRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const t = e.target as Node;
            if (menuOpen && menuRef.current && !menuRef.current.contains(t) && buttonRef.current && !buttonRef.current.contains(t)) {
                setMenuOpen(false);
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (menuOpen && e.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [menuOpen]);
    return (
        <Card className="flex flex-col h-full relative">
            <CardHeader className="flex-row gap-4 items-center space-y-0 pb-2">
                <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900/20">
                    <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 flex items-center">
                    <CardTitle className="text-base font-medium line-clamp-1" title={title}>
                        {title}
                    </CardTitle>
                </div>
                <div className="relative" ref={menuRef}>
                    <Button ref={buttonRef} variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} aria-label="Actions" disabled={!!isDeleting}>
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-40 rounded-md border bg-card shadow">
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground" onClick={() => { setMenuOpen(false); onDownload(fileId, jobTitle); }}>Download</button>
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground" onClick={() => { setMenuOpen(false); onDelete(id); }}>Delete</button>
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground" onClick={() => { setMenuOpen(false); onOpenNewTab(fileId); }}>Open in new tab</button>
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground" onClick={() => { setMenuOpen(false); setRenameValue(title); setRenameError(''); setRenameOpen(true); }}>Rename</button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant="outline" onClick={() => onOpen(fileId, jobTitle)} disabled={!!isDeleting}>Open</Button>
            </CardFooter>
            {isDeleting && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                        Deleting...
                    </div>
                </div>
            )}

            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} placeholder="Enter new name" />
                        {!!renameError && <div className="text-sm text-destructive">{renameError}</div>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameOpen(false)} disabled={renameLoading}>Cancel</Button>
                        <Button onClick={async () => {
                            const next = renameValue.trim();
                            if (!next) { setRenameError('Name is required'); return; }
                            setRenameLoading(true);
                            setRenameError('');
                            try {
                                const res1 = await fetch(`/api/job-ads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobTitle: next }) });
                                if (!res1.ok) throw new Error('Failed to rename job ad');
                                const res2 = await fetch(`/api/files/${fileId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: next }) });
                                if (!res2.ok) throw new Error('Failed to rename file');
                                setTitle(next);
                                setRenameOpen(false);
                            } catch (e) {
                                console.error(e);
                                setRenameError('Rename failed');
                            } finally {
                                setRenameLoading(false);
                            }
                        }} disabled={renameLoading}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
