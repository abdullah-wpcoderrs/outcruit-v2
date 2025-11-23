import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { pool, withClient } from '@/lib/db'

function requireAdmin(payload: any) {
  return payload && payload.role === 'admin'
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!requireAdmin(payload)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await withClient(payload.userId, payload.role, async (client) => {
      const queries = await Promise.all([
        client.query('SELECT COUNT(*) AS count FROM public.users'),
        client.query('SELECT COUNT(*) AS count FROM public.notifications'),
        client.query('SELECT COUNT(*) AS count FROM public.job_ads'),
        client.query('SELECT COUNT(*) AS count FROM public.talent_lists'),
        client.query('SELECT COUNT(*) AS count FROM public.job_trackers'),
        client.query('SELECT COUNT(*) AS count FROM public.candidates'),
        client.query('SELECT COUNT(*) AS count FROM public.email_communications'),
        client.query('SELECT COUNT(*) AS count FROM public.interview_batches')
      ])

      const stats = {
        users: Number(queries[0].rows[0].count || 0),
        notifications: Number(queries[1].rows[0].count || 0),
        job_ads: Number(queries[2].rows[0].count || 0),
        talent_lists: Number(queries[3].rows[0].count || 0),
        job_trackers: Number(queries[4].rows[0].count || 0),
        candidates: Number(queries[5].rows[0].count || 0),
        email_communications: Number(queries[6].rows[0].count || 0),
        interview_batches: Number(queries[7].rows[0].count || 0),
      }

      const [usersRes, notificationsRes, jobAdsRes, talentListsRes, jobTrackersRes] = await Promise.all([
        client.query('SELECT id, email, name, role, created_at FROM public.users ORDER BY created_at DESC LIMIT 50'),
        client.query(`
          SELECT n.*, u.name as user_name, u.email as user_email 
          FROM public.notifications n 
          LEFT JOIN public.users u ON n.user_id = u.id 
          ORDER BY n.created_at DESC LIMIT 50
        `),
        client.query(`
          SELECT j.*, u.name as user_name, u.email as user_email 
          FROM public.job_ads j 
          LEFT JOIN public.users u ON j.user_id = u.id 
          ORDER BY j.created_at DESC LIMIT 50
        `),
        client.query(`
          SELECT t.*, u.name as user_name, u.email as user_email 
          FROM public.talent_lists t 
          LEFT JOIN public.users u ON t.user_id = u.id 
          ORDER BY t.created_at DESC LIMIT 50
        `),
        client.query(`
          SELECT jt.*, u.name as user_name, u.email as user_email 
          FROM public.job_trackers jt 
          LEFT JOIN public.users u ON jt.user_id = u.id 
          ORDER BY jt.created_at DESC LIMIT 50
        `)
      ])

      return { stats, latest: { users: usersRes, notifications: notificationsRes, job_ads: jobAdsRes, talent_lists: talentListsRes, job_trackers: jobTrackersRes } }
    })

    return NextResponse.json({
      stats: result.stats,
      latest: {
        users: result.latest.users.rows,
        notifications: result.latest.notifications.rows,
        job_ads: result.latest.job_ads.rows,
        talent_lists: result.latest.talent_lists.rows,
        job_trackers: result.latest.job_trackers.rows,
      }
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}