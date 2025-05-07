-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created_notification_settings ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_notification_settings();

-- Create the user notification settings table
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own notification settings
CREATE POLICY "Users can manage their own notification settings"
ON public.user_notification_settings
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a trigger to automatically create notification settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_notification_settings (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_notification_settings
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_notification_settings(); 