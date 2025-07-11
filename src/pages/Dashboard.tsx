
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import { MetricCard } from '@/components/Dashboard/MetricCard';
import { RecentActivity } from '@/components/Dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for charts
const trendData = [
  { day: 'Sen', prospek: 12, leads: 8 },
  { day: 'Sel', prospek: 15, leads: 11 },
  { day: 'Rab', prospek: 8, leads: 5 },
  { day: 'Kam', prospek: 20, leads: 14 },
  { day: 'Jum', prospek: 18, leads: 13 },
  { day: 'Sab', prospek: 10, leads: 7 },
  { day: 'Min', prospek: 6, leads: 4 },
];

export default function Dashboard() {
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
          value="23"
          icon={Users}
          description="Prospek masuk hari ini"
          trend={{ value: 15, label: 'dari kemarin' }}
        />
        <MetricCard
          title="Leads Hari Ini"
          value="16"
          icon={Target}
          description="Leads masuk hari ini"
          trend={{ value: -5, label: 'dari kemarin' }}
        />
        <MetricCard
          title="Prospek Bulan Ini"
          value="1,234"
          icon={BarChart3}
          description="Total prospek bulan ini"
          trend={{ value: 12, label: 'dari bulan lalu' }}
        />
        <MetricCard
          title="Leads Bulan Ini"
          value="856"
          icon={TrendingUp}
          description="Total leads bulan ini"
          trend={{ value: 8, label: 'dari bulan lalu' }}
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
              <div className="space-y-2">
                {[
                  { city: 'Jakarta', leads: 156, prospek: 220 },
                  { city: 'Surabaya', leads: 89, prospek: 134 },
                  { city: 'Bandung', leads: 67, prospek: 98 },
                  { city: 'Medan', leads: 45, prospek: 76 },
                  { city: 'Semarang', leads: 34, prospek: 52 },
                ].map((city, index) => (
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
            </CardContent>
          </Card>
        </div>
        
        <RecentActivity />
      </div>
    </div>
  );
}
