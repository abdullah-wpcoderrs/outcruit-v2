import Link from 'next/link';
import { FileSpreadsheet, Users, Calendar, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useRef } from 'react';

interface TalentListCardProps {
    id: string;
    jobTitle: string;
    fileId: string;
    candidateCount: number;
    createdAt: string;
    onOpen: (fileId: string, jobTitle: string) => void;
    onOpenNewTab: (fileId: string) => void;
    onDownload: (fileId: string, jobTitle: string) => void;
    onDelete: (id: string) => void;
    isDeleting?: boolean;
}

export function TalentListCard({ id, jobTitle, fileId, candidateCount, createdAt, onOpen, onOpenNewTab, onDownload, onDelete, isDeleting }: TalentListCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
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
                <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
                    <FileSpreadsheet className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 flex items-center">
                    <CardTitle className="text-base font-medium line-clamp-1" title={jobTitle}>
                        {jobTitle}
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
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {candidateCount} Candidates
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
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
        </Card>
    );
}
