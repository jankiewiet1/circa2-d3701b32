
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { UserWithProfile, UserPreferences } from '@/types';

export const useProfileSettings = (user: UserWithProfile | null) => {
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Fetch user preferences
        const { data: preferencesData, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        if (preferencesError) throw preferencesError;

        setProfile(profileData);
        setPreferences(preferencesData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  const updateProfile = async (updatedProfile: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...updatedProfile }));
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const updatePreferences = async (updatedPreferences: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      // First check if a preferences record exists
      const { data: existingPreferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existingPreferences) {
        // Update existing record
        result = await supabase
          .from('user_preferences')
          .update(updatedPreferences)
          .eq('user_id', user.id);
      } else {
        // Insert new record
        result = await supabase
          .from('user_preferences')
          .insert({ 
            user_id: user.id, 
            ...updatedPreferences 
          });
      }

      const { error } = result;
      if (error) throw error;

      setPreferences(prev => ({ ...prev, ...updatedPreferences } as UserPreferences));
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  return {
    profile,
    preferences,
    loading,
    updateProfile,
    updatePreferences
  };
};
