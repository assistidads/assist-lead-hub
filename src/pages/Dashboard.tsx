
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import { MetricCard } from '@/components/Dashboard/MetricCard';
import { RecentActivity } from '@/components/Dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for charts
const leadsBySource = [
  { name: 'Meta Ads', value: 45, leads: 32 },
  { name: 'Google Ads', value: 30, leads: 22 },
  { name: 'Referral', value: 15, leads: 12 },
  { name: 'Organik', value: 10, leads: 6 },
];

const dailyProspek = [
  { day: 'Sen', prospek: 12, leads: 8 },
  { day: 'Sel', prospek: 15, leads: 11 },
  { day: 'Rab', prospek: 8, leads: 5 },
  { day: 'Kam', prospek: 20, leads: 14 },
  { day: 'Jum', prospek: 18, leads: 13 },
  { day: 'Sab', prospek: 10, leads: 7 },
  { day: 'Min', prospek: 6, leads: 4 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
          title="Total Prospek"
          value="1,234"
          icon={Users}
          description="Total prospek bulan ini"
          trend={{ value: 12, label: 'dari bulan lalu' }}
        />
        <MetricCard
          title="Total Leads"
          value="856"
          icon={Target}
          description="Prospek yang valid"
          trend={{ value: 8, label: 'dari bulan lalu' }}
        />
        <MetricCard
          title="Conversion Rate"
          value="69.4%"
          icon={TrendingUp}
          description="Tingkat konversi prospek ke leads"
          trend={{ value: 2.1, label: 'dari bulan lalu' }}
        />
        <MetricCard
          title="Leads Hari Ini"
          value="23"
          icon={BarChart3}
          description="Leads yang masuk hari ini"
          trend={{ value: -5, label: 'dari kemarin' }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart - Daily Prospek */}
        <Card>
          <CardHeader>
            <CardTitle>Prospek Mingguan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyProspek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="prospek" fill="#8884d8" name="Prospek" />
                <Bar dataKey="leads" fill="#82ca9d" name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Leads by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Sumber Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadsBySource}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leadsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
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
