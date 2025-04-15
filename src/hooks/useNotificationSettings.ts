
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface NotificationSettings {
  receive_newsletter: boolean;
  receive_upload_alerts: boolean;
  receive_deadline_notifications: boolean;
}

export const useNotificationSettings = (userId: string | undefined) => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchSettings();
  }, [userId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('user_notification_settings')
        .update(newSettings)
        .eq('user_id', userId);

      if (error) throw error;
      
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    }
  };

  return { settings, loading, updateSettings };
};
