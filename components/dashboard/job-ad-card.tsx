import Link from 'next/link';
import { FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface JobAdCardProps {
    jobTitle: string;
    fileId: string;
    createdAt: string;
}

export function JobAdCard({ jobTitle, fileId, createdAt }: JobAdCardProps) {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex-row gap-4 items-center space-y-0 pb-2">
                <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900/20">
                    <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-base font-medium line-clamp-1" title={jobTitle}>
                    {jobTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full" variant="outline">
                    <Link href={`/api/files/${fileId}`} target="_blank" rel="noopener noreferrer">
                        View PDF
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
