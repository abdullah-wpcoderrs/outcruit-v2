import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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
        if (isDownload) {
            const name: string = file.filename || ''
            if (contentType.includes('csv') || name.toLowerCase().endsWith('.csv')) {
                contentType = 'text/csv; charset=utf-8'
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

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const requestedName: string = String(body.filename || body.name || '').trim();
        if (!requestedName) {
            return NextResponse.json({ error: 'filename is required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            const res = await client.query('SELECT filename FROM public.files WHERE id = $1', [id]);
            if (res.rows.length === 0) {
                return NextResponse.json({ error: 'File not found' }, { status: 404 });
            }
            const current = res.rows[0].filename as string;
            const dot = current.lastIndexOf('.');
            const ext = dot >= 0 ? current.substring(dot) : '';
            const newFilename = requestedName.endsWith(ext) || !ext ? requestedName : `${requestedName}${ext}`;

            await client.query('UPDATE public.files SET filename = $1 WHERE id = $2', [newFilename, id]);
            return NextResponse.json({ success: true, filename: newFilename });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error renaming file:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
