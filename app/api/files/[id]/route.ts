import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT data, mime_type, filename FROM public.files WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const file = result.rows[0];
        const buffer = file.data;

        const url = new URL(request.url);
        const isPreview = url.searchParams.get('preview') === '1';
        const isDownload = url.searchParams.get('download') === '1';

        let contentType = file.mime_type || 'application/octet-stream';
        if (isPreview) {
            if (contentType.includes('csv')) {
                contentType = 'text/plain; charset=utf-8';
            } else if (contentType === 'application/octet-stream') {
                contentType = 'text/plain; charset=utf-8';
            }
        }

        const disposition = isDownload ? 'attachment' : 'inline';

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `${disposition}; filename="${file.filename}"`,
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
