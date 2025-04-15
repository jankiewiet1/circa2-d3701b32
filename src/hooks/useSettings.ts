
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface Settings {
  id: string;
  user_id: string;
  // Notification settings
  receive_upload_alerts: boolean;
  receive_deadline_notifications: boolean;
  receive_newsletter: boolean;
  // Display settings
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  date_format: string;
  preferred_currency: string;
  // Admin settings
  lock_team_changes: boolean;
  require_reviewer: boolean;
  audit_logging_enabled: boolean;
  default_member_role: string;
}

export const useSettings = (userId: string | undefined) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchSettings();
  }, [userId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          user_id: userId,
          ...newSettings
        })
        .eq('user_id', userId);

      if (error) throw error;
      
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  return { settings, loading, updateSettings };
};
