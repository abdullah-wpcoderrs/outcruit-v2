-- ============================================
-- INSERT ADMIN USER
-- ============================================

-- First, make sure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert admin user with hashed password
INSERT INTO public.users (email, password_hash, created_at, updated_at)
VALUES (
  'abdul@mail.com',
  crypt('abdul@mail.com', gen_salt('bf')),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify the user was inserted
SELECT id, email, created_at FROM public.users WHERE email = 'abdul@mail.com';
