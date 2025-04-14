
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface Activity {
  id: string;
  description: string;
  created_at: string;
  user: {
    profiles: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  } | null;
}

export function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          *,
          user:user_id (
            profiles (
              first_name,
              last_name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setActivities(data);
      }
    };

    fetchActivities();
  }, []);

  return (
    <ScrollArea className="h-[200px] rounded-md border p-4">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-4 text-sm">
            <time className="text-muted-foreground w-32">
              {format(new Date(activity.created_at), 'MMM d, HH:mm')}
            </time>
            <span>
              {activity.user?.profiles?.first_name} {activity.user?.profiles?.last_name}{' '}
              {activity.description}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
