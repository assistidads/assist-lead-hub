
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Activity {
  id: string;
  type: 'prospek_baru' | 'leads_converted' | 'followup';
  message: string;
  time: string;
  status?: string;
}


const getStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    prospek: 'outline',
    leads: 'default',
    bukan_leads: 'destructive',
    dihubungi: 'secondary',
  };
  
  return (
    <Badge variant={variants[status] || 'outline'}>
      {status}
    </Badge>
  );
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const { data: prospekData } = await supabase
          .from('prospek')
          .select(`
            id,
            nama_faskes,
            created_at,
            status_leads_id,
            status_leads (status_leads)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (prospekData) {
          const recentActivities = prospekData.map((prospek: any) => ({
            id: prospek.id,
            type: 'prospek_baru' as const,
            message: `Prospek baru - ${prospek.nama_faskes}`,
            time: format(new Date(prospek.created_at), 'dd/MM/yyyy HH:mm'),
            status: prospek.status_leads?.status_leads || 'prospek'
          }));

          setActivities(recentActivities);
        }
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    };

    fetchRecentActivities();
  }, []);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-none">
                  {activity.message}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.time}
                </p>
              </div>
              {activity.status && getStatusBadge(activity.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
