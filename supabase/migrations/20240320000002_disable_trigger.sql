-- Disable and drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Make sure RLS is enabled but with simple policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;

-- Create a single permissive policy for now
CREATE POLICY "Allow all operations on profiles"
ON public.profiles
FOR ALL
USING (true)
WITH CHECK (true); 