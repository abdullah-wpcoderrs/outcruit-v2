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
        const buffer = file.data; // This should be a Buffer

        // Create a response with the file data
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': file.mime_type,
                'Content-Disposition': `inline; filename="${file.filename}"`,
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
