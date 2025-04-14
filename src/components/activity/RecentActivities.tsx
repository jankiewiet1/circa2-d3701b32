
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface Activity {
  id: string;
  description: string;
  created_at: string;
  user_id: string;
  user_first_name?: string | null;
  user_last_name?: string | null;
}

export function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      // First, we need to get activities
      const { data: activityData, error: activityError } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError || !activityData) {
        console.error("Error fetching activities:", activityError);
        return;
      }

      // Now for each activity, fetch the user profile information
      const activitiesWithProfiles = await Promise.all(
        activityData.map(async (activity) => {
          // Get the user profile for this activity
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', activity.user_id)
            .single();
          
          return {
            ...activity,
            user_first_name: profileData?.first_name,
            user_last_name: profileData?.last_name,
          };
        })
      );

      setActivities(activitiesWithProfiles);
    };

    fetchActivities();
  }, []);

  return (
    <ScrollArea className="h-[200px] rounded-md border p-4">
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 text-sm">
              <time className="text-muted-foreground w-32">
                {format(new Date(activity.created_at), 'MMM d, HH:mm')}
              </time>
              <span>
                {activity.user_first_name || ''} {activity.user_last_name || ''}{' '}
                {activity.description}
              </span>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No recent activity found
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
