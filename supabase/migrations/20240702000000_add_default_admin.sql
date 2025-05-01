-- This is for development purposes only
-- In production, you would want to set this manually through the Supabase dashboard

-- Update a specific user as admin
-- Replace 'admin_email@example.com' with the actual email of the user you want to make an admin
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'admin_email@example.com'
);

-- Alternatively, you can use a user ID directly
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id = 'user-uuid-here'; 