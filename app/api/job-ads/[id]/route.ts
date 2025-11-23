import { NextRequest, NextResponse } from 'next/server';
import { withClient } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
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
        const userId = (payload.userId || payload.sub) as string;
        const { id } = await params;

        const result = await withClient(userId, payload.role as string, async (client) => {
            return client.query(
                'DELETE FROM public.job_ads WHERE id = $1 AND user_id = $2 RETURNING *',
                [id, userId]
            );
        })

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting job ad:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
        const userId = (payload.userId || payload.sub) as string;
        const { id } = await params;

        const body = await request.json();
        const jobTitle = typeof body.jobTitle === 'string' ? body.jobTitle.trim() : '';
        if (!jobTitle) {
            return NextResponse.json({ error: 'jobTitle is required' }, { status: 400 });
        }

        const updateRes = await withClient(userId, payload.role as string, async (client) => {
            const current = await client.query('SELECT id FROM public.job_ads WHERE id = $1 AND user_id = $2', [id, userId]);
            if (current.rows.length === 0) {
                return { notFound: true } as any
            }
            await client.query('UPDATE public.job_ads SET job_title = $1 WHERE id = $2', [jobTitle, id]);
            return { notFound: false }
        })
        if ((updateRes as any).notFound) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, jobTitle });
    } catch (error) {
        console.error('Error updating job ad:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}