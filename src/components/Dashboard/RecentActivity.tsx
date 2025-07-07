
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: string;
  type: 'prospek_baru' | 'leads_converted' | 'followup';
  message: string;
  time: string;
  status?: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'prospek_baru',
    message: 'Prospek baru dari Meta Ads - RS Siloam Jakarta',
    time: '5 menit yang lalu',
    status: 'prospek'
  },
  {
    id: '2',
    type: 'leads_converted',
    message: 'Prospek converted menjadi leads - Klinik Sehat Bandung',
    time: '15 menit yang lalu',
    status: 'leads'
  },
  {
    id: '3',
    type: 'followup',
    message: 'Follow up dilakukan ke RS Mitra Surabaya',
    time: '1 jam yang lalu',
    status: 'dihubungi'
  },
];

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
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
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
