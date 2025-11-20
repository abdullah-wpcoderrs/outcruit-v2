import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Webhook endpoint for n8n notifications
export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // Validate required fields
    if (!payload.type || !payload.message) {
      return NextResponse.json({
        error: 'Missing required fields: type and message'
      }, { status: 400 })
    }

    // Get user by email (from recruiterEmail or default to first user)
    let userId: string | null = null

    if (payload.recruiterEmail) {
      const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [payload.recruiterEmail])
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id
      }
    }

    // If no user found by email, get the first user (fallback)
    if (!userId) {
      const firstUserResult = await pool.query('SELECT id FROM users LIMIT 1')
      if (firstUserResult.rows.length > 0) {
        userId = firstUserResult.rows[0].id
      }
    }

    if (!userId) {
      return NextResponse.json({
        error: 'No user found to assign notification'
      }, { status: 404 })
    }

    // Insert notification into Neon DB
    const insertResult = await pool.query(
      `INSERT INTO notifications (
        user_id, type, message, job_name, recruiter_name, recruiter_email, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        userId,
        payload.type,
        payload.message,
        payload.jobName,
        payload.recruiterName,
        payload.recruiterEmail,
        payload.status || 'success',
        payload.metadata || {}
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Notification saved',
      id: insertResult.rows[0].id,
      user_id: userId
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
