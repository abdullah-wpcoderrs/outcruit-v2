import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon DB
  }
});

// Set per-session claims for RLS policies
export async function setSessionClaims(client: any, userId?: string, role?: string) {
  if (userId) {
    await client.query("select set_config('request.jwt.claim.sub', $1, true)", [String(userId)])
  }
  if (role) {
    await client.query("select set_config('request.jwt.claim.role', $1, true)", [String(role)])
  }
}

// Helper to run a function with a client that has claims set
export async function withClient<T>(userId: string | undefined, role: string | undefined, fn: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await setSessionClaims(client, userId, role)
    return await fn(client)
  } finally {
    client.release()
  }
}
