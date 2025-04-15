
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface UserPreferences {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  date_format?: string;
  preferred_currency?: string;
}

export const useUserPreferences = (userId: string | undefined) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned" which is OK
      
      // If no preferences exist yet, set default values
      if (!data) {
        setPreferences({
          user_id: userId,
          theme: 'system',
          language: 'en',
          timezone: 'Europe/Amsterdam',
          date_format: 'YYYY-MM-DD',
          preferred_currency: 'EUR'
        });
      } else {
        setPreferences(data as UserPreferences);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!userId) return;
    
    try {
      // Check if preferences exist for this user
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      let result;
      
      if (existingPrefs) {
        // Update existing preferences
        result = await supabase
          .from('user_preferences')
          .update(newPreferences)
          .eq('user_id', userId);
      } else {
        // Insert new preferences
        result = await supabase
          .from('user_preferences')
          .insert({
            ...newPreferences,
            user_id: userId
          });
      }
      
      const { error } = result;
      if (error) throw error;
      
      // Update local state
      setPreferences(prev => prev ? { ...prev, ...newPreferences } as UserPreferences : null);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      toast.error('Failed to update preferences');
      throw error; // Re-throw to allow handling in the component
    }
  };

  return {
    preferences,
    loading,
    updatePreferences
  };
};
