import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client with auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Server-side Supabase client with service role (bypasses RLS)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Types
export interface SupabaseNotification {
  id: string
  user_id: string
  type: 'jd-tracker' | 'talent-sorting' | 'job-ads' | 'system'
  message: string
  job_name?: string
  recruiter_name?: string
  recruiter_email?: string
  status?: 'success' | 'error' | 'processing'
  metadata?: Record<string, any>
  read_at: string | null
  created_at: string
}

export interface NotificationInsert {
  user_id: string
  type: string
  message: string
  job_name?: string
  recruiter_name?: string
  recruiter_email?: string
  status?: string
  metadata?: Record<string, any>
}
