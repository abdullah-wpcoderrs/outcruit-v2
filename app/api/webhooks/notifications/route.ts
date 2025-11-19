import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Webhook endpoint for n8n notifications
// Inserts notification into Supabase, Realtime handles client updates
export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    // Validate required fields
    if (!payload.type || !payload.message) {
      return NextResponse.json({ 
        error: 'Missing required fields: type and message' 
      }, { status: 400 })
    }

    const client = supabaseAdmin
    if (!client) {
      return NextResponse.json({ 
        error: 'Service role key not configured' 
      }, { status: 500 })
    }

    // Get user by email (from recruiterEmail or default to first user)
    let userId: string | null = null
    
    if (payload.recruiterEmail) {
      const { data: user } = await client
        .from('users')
        .select('id')
        .eq('email', payload.recruiterEmail)
        .single()
      
      userId = user?.id || null
    }
    
    // If no user found by email, get the first user (fallback)
    if (!userId) {
      const { data: firstUser } = await client
        .from('users')
        .select('id')
        .limit(1)
        .single()
      
      userId = firstUser?.id || null
    }

    if (!userId) {
      return NextResponse.json({ 
        error: 'No user found to assign notification' 
      }, { status: 404 })
    }

    // Insert notification into Supabase
    // Realtime will automatically notify subscribed clients
    const { data, error } = await client
      .from('notifications')
      .insert({
        user_id: userId,
        type: payload.type,
        message: payload.message,
        job_name: payload.jobName,
        recruiter_name: payload.recruiterName,
        recruiter_email: payload.recruiterEmail,
        status: payload.status || 'success',
        metadata: payload.metadata || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to insert notification:', error)
      return NextResponse.json({ 
        error: 'Failed to save notification',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notification saved, Realtime will notify clients',
      id: data.id,
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
