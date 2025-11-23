-- Ensure bcrypt hashing is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set RLS session claims so admin-only INSERT policy passes
-- (this mimics what the app does via set_config)
SELECT set_config('request.jwt.claim.role', 'admin', true);

-- Create the admin user with a bcrypt-hashed password
INSERT INTO public.users (email, password_hash, name, role, organization, phone)
VALUES (
  'example@mail.com',
  crypt('write password here', gen_salt('bf')), -- bcrypt hash via pgcrypto
  'Example User',
  'admin',
  NULL,
  NULL
);

-- Optional: verify it (RLS allows admin to select all users)
SELECT id, email, name, role, created_at
FROM public.users
WHERE email = 'example@mail.com'; --use the email you used to create the admin user
