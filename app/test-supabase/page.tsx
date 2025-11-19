"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<any>({
    envVars: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
      keyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    },
    connection: 'testing...',
    notifications: [],
    error: null
  })

  useEffect(() => {
    async function testConnection() {
      try {
        // Test 1: Check if Supabase client is initialized
        if (!supabase) {
          setStatus(prev => ({ ...prev, connection: 'Supabase client not initialized' }))
          return
        }

        // Test 2: Try to fetch notifications
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .limit(5)

        if (error) {
          setStatus(prev => ({ 
            ...prev, 
            connection: 'Failed to connect',
            error: error.message 
          }))
          return
        }

        setStatus(prev => ({
          ...prev,
          connection: 'Connected successfully!',
          notifications: data || [],
          error: null
        }))
      } catch (err: any) {
        setStatus(prev => ({
          ...prev,
          connection: 'Exception occurred',
          error: err.message
        }))
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Environment Variables</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(status.envVars, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Connection Status</h2>
          <p className={status.connection.includes('success') ? 'text-green-600' : 'text-red-600'}>
            {status.connection}
          </p>
        </div>

        {status.error && (
          <div className="border border-red-500 p-4 rounded bg-red-50">
            <h2 className="font-semibold mb-2 text-red-700">Error</h2>
            <pre className="text-sm text-red-600">{status.error}</pre>
          </div>
        )}

        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Notifications ({status.notifications.length})</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(status.notifications, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded bg-blue-50">
          <h2 className="font-semibold mb-2">Test API Endpoint</h2>
          <p className="text-sm mb-2">Click the button to test the API route:</p>
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/notifications')
                const data = await res.json()
                alert(`API Response:\n${JSON.stringify(data, null, 2)}`)
              } catch (err: any) {
                alert(`API Error: ${err.message}`)
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test /api/notifications
          </button>
        </div>
      </div>
    </div>
  )
}
