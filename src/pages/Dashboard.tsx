
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import { MetricCard } from '@/components/Dashboard/MetricCard';
import { RecentActivity } from '@/components/Dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, startOfYesterday, endOfYesterday } from 'date-fns';

const TopCities = () => {
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopCities = async () => {
      try {
        const { data: prospekData } = await supabase
          .from('prospek')
          .select(`
            kota, 
            status_leads_id,
            status_leads (status_leads)
          `);

        if (prospekData) {
          const cityStats = prospekData.reduce((acc: any, item) => {
            if (!acc[item.kota]) {
              acc[item.kota] = { prospek: 0, leads: 0 };
            }
            acc[item.kota].prospek++;
            
            if (item.status_leads?.status_leads?.toLowerCase().includes('leads')) {
              acc[item.kota].leads++;
            }
            return acc;
          }, {});

          const sortedCities = Object.entries(cityStats)
            .map(([city, stats]: [string, any]) => ({ city, ...stats }))
            .sort((a, b) => b.leads - a.leads)
            .slice(0, 5);

          setCities(sortedCities);
        }
      } catch (error) {
        console.error('Error fetching city data:', error);
      }
    };

    fetchTopCities();
  }, []);

  return (
    <div className="space-y-2">
      {cities.map((city, index) => (
        <div key={city.city} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{index + 1}</span>
            <span className="font-medium">{city.city}</span>
          </div>
          <div className="text-right">
            <div className="font-medium">{city.leads} leads</div>
            <div className="text-sm text-muted-foreground">dari {city.prospek} prospek</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    prospekToday: 0,
    prospekYesterday: 0,
    leadsToday: 0,
    leadsYesterday: 0,
    prospekThisMonth: 0,
    prospekLastMonth: 0,
    leadsThisMonth: 0,
    leadsLastMonth: 0
  });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const today = startOfDay(now);
      const yesterday = startOfYesterday();
      const thisMonthStart = startOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // Get leads status IDs
      const { data: statusData } = await supabase
        .from('status_leads')
        .select('id, status_leads');

      const leadsStatusIds = statusData
        ?.filter(status => status.status_leads.toLowerCase().includes('leads'))
        ?.map(status => status.id) || [];

      // Fetch metrics data
      const [
        { data: prospekTodayData },
        { data: prospekYesterdayData },
        { data: prospekThisMonthData },
        { data: prospekLastMonthData }
      ] = await Promise.all([
        supabase.from('prospek').select('status_leads_id').gte('tanggal_prospek', format(today, 'yyyy-MM-dd')),
        supabase.from('prospek').select('status_leads_id').eq('tanggal_prospek', format(yesterday, 'yyyy-MM-dd')),
        supabase.from('prospek').select('status_leads_id').gte('tanggal_prospek', format(thisMonthStart, 'yyyy-MM-dd')),
        supabase.from('prospek').select('status_leads_id').gte('tanggal_prospek', format(lastMonthStart, 'yyyy-MM-dd')).lte('tanggal_prospek', format(lastMonthEnd, 'yyyy-MM-dd'))
      ]);

      // Calculate metrics
      const prospekToday = prospekTodayData?.length || 0;
      const leadsToday = prospekTodayData?.filter(p => leadsStatusIds.includes(p.status_leads_id)).length || 0;
      const prospekYesterday = prospekYesterdayData?.length || 0;
      const leadsYesterday = prospekYesterdayData?.filter(p => leadsStatusIds.includes(p.status_leads_id)).length || 0;
      const prospekThisMonth = prospekThisMonthData?.length || 0;
      const leadsThisMonth = prospekThisMonthData?.filter(p => leadsStatusIds.includes(p.status_leads_id)).length || 0;
      const prospekLastMonth = prospekLastMonthData?.length || 0;
      const leadsLastMonth = prospekLastMonthData?.filter(p => leadsStatusIds.includes(p.status_leads_id)).length || 0;

      setMetrics({
        prospekToday,
        prospekYesterday,
        leadsToday,
        leadsYesterday,
        prospekThisMonth,
        prospekLastMonth,
        leadsThisMonth,
        leadsLastMonth
      });

      // Fetch 7-day trend data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(now, 6 - i);
        return {
          date: format(date, 'yyyy-MM-dd'),
          day: format(date, 'E')
        };
      });

      const trendPromises = last7Days.map(async ({ date, day }) => {
        const { data } = await supabase
          .from('prospek')
          .select('status_leads_id')
          .eq('tanggal_prospek', date);

        const prospek = data?.length || 0;
        const leads = data?.filter(p => leadsStatusIds.includes(p.status_leads_id)).length || 0;

        return { day, prospek, leads };
      });

      const trendResults = await Promise.all(trendPromises);
      setTrendData(trendResults);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview statistik leads dan performa tim sales Anda
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Prospek Hari Ini"
          value={metrics.prospekToday.toString()}
          icon={Users}
          description="Prospek masuk hari ini"
          trend={{ 
            value: calculatePercentageChange(metrics.prospekToday, metrics.prospekYesterday), 
            label: 'dari kemarin' 
          }}
        />
        <MetricCard
          title="Leads Hari Ini"
          value={metrics.leadsToday.toString()}
          icon={Target}
          description="Leads masuk hari ini"
          trend={{ 
            value: calculatePercentageChange(metrics.leadsToday, metrics.leadsYesterday), 
            label: 'dari kemarin' 
          }}
        />
        <MetricCard
          title="Prospek Bulan Ini"
          value={metrics.prospekThisMonth.toString()}
          icon={BarChart3}
          description="Total prospek bulan ini"
          trend={{ 
            value: calculatePercentageChange(metrics.prospekThisMonth, metrics.prospekLastMonth), 
            label: 'dari bulan lalu' 
          }}
        />
        <MetricCard
          title="Leads Bulan Ini"
          value={metrics.leadsThisMonth.toString()}
          icon={TrendingUp}
          description="Total leads bulan ini"
          trend={{ 
            value: calculatePercentageChange(metrics.leadsThisMonth, metrics.leadsLastMonth), 
            label: 'dari bulan lalu' 
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-1">
        {/* Line Chart - Trend 7 Days */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Prospek & Leads (7 Hari Terakhir)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="prospek" stroke="#8884d8" name="Prospek" strokeWidth={2} />
                <Line type="monotone" dataKey="leads" stroke="#82ca9d" name="Leads" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Cities</CardTitle>
            </CardHeader>
            <CardContent>
              <TopCities />
            </CardContent>
          </Card>
        </div>
        
        <RecentActivity />
      </div>
    </div>
  );
}
