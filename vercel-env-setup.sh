#!/bin/bash
# Run these commands to add environment variables to Vercel

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# When prompted, paste: https://hiilrtwkheqxecchojkj.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# When prompted, paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpaWxydHdraGVxeGVjY2hvamtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDI4NjMsImV4cCI6MjA3NzIxODg2M30.f3KknfCGYllmb1Go1kdFmka1xcfz7_zCNhOZohpfot4

# Then redeploy
vercel --prod
