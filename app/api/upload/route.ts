import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name;
        const mimeType = file.type;

        const client = await pool.connect();
        try {
            const result = await client.query(
                'INSERT INTO public.files (data, mime_type, filename) VALUES ($1, $2, $3) RETURNING id',
                [buffer, mimeType, filename]
            );
            const fileId = result.rows[0].id;

            // Construct the public URL (assuming the app is hosted or localhost)
            // In production, you might want to use a proper domain env var
            const protocol = request.headers.get('x-forwarded-proto') || 'http';
            const host = request.headers.get('host');
            const fileUrl = `${protocol}://${host}/api/files/${fileId}`;

            return NextResponse.json({ url: fileUrl, id: fileId });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
