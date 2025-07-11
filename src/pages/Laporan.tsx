
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Users, Building2, UserCheck, MapPin } from "lucide-react";
import { Loader2 } from "lucide-react";

interface ReportData {
  sumberLeads: Array<{ sumber_leads: string; count: number; percentage: number }>;
  kodeAds: Array<{ kode: string; count: number; percentage: number }>;
  layanan: Array<{ layanan: string; count: number; percentage: number }>;
  tipeFaskes: Array<{ tipe_faskes: string; count: number; percentage: number }>;
  performaCS: Array<{ cs_name: string; total_prospek: number; total_leads: number; conversion_rate: number }>;
  kotaKabupaten: Array<{ kota: string; count: number; percentage: number }>;
}

export default function Laporan() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    sumberLeads: [],
    kodeAds: [],
    layanan: [],
    tipeFaskes: [],
    performaCS: [],
    kotaKabupaten: []
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch Sumber Leads data
      const { data: sumberLeadsData } = await supabase
        .from('prospek')
        .select(`
          sumber_leads:sumber_leads_id(sumber_leads)
        `)
        .not('sumber_leads_id', 'is', null);

      // Fetch Kode Ads data
      const { data: kodeAdsData } = await supabase
        .from('prospek')
        .select(`
          kode_ads:kode_ads_id(kode)
        `)
        .not('kode_ads_id', 'is', null);

      // Fetch Layanan data
      const { data: layananData } = await supabase
        .from('prospek')
        .select(`
          layanan:layanan_assist_id(layanan)
        `)
        .not('layanan_assist_id', 'is', null);

      // Fetch Tipe Faskes data
      const { data: tipeFaskesData } = await supabase
        .from('prospek')
        .select(`
          tipe_faskes:tipe_faskes_id(tipe_faskes)
        `)
        .not('tipe_faskes_id', 'is', null);

      // Fetch CS Performance data
      const { data: performaCSData } = await supabase
        .from('prospek')
        .select(`
          created_by,
          status_leads:status_leads_id(status_leads),
          profiles!inner(full_name)
        `);

      // Fetch Kota/Kabupaten data
      const { data: kotaData } = await supabase
        .from('prospek')
        .select('kota');

      // Process Sumber Leads
      const sumberLeadsCount = sumberLeadsData?.reduce((acc: any, item: any) => {
        const sumber = item.sumber_leads?.sumber_leads || 'Unknown';
        acc[sumber] = (acc[sumber] || 0) + 1;
        return acc;
      }, {}) || {};

      const totalSumberLeads = Object.values(sumberLeadsCount).reduce((a: any, b: any) => a + b, 0) as number;
      const sumberLeads = Object.entries(sumberLeadsCount).map(([sumber_leads, count]: [string, any]) => ({
        sumber_leads,
        count,
        percentage: totalSumberLeads > 0 ? (count / totalSumberLeads) * 100 : 0
      }));

      // Process Kode Ads
      const kodeAdsCount = kodeAdsData?.reduce((acc: any, item: any) => {
        const kode = item.kode_ads?.kode || 'Unknown';
        acc[kode] = (acc[kode] || 0) + 1;
        return acc;
      }, {}) || {};

      const totalKodeAds = Object.values(kodeAdsCount).reduce((a: any, b: any) => a + b, 0) as number;
      const kodeAds = Object.entries(kodeAdsCount).map(([kode, count]: [string, any]) => ({
        kode,
        count,
        percentage: totalKodeAds > 0 ? (count / totalKodeAds) * 100 : 0
      }));

      // Process Layanan
      const layananCount = layananData?.reduce((acc: any, item: any) => {
        const layanan = item.layanan?.layanan || 'Unknown';
        acc[layanan] = (acc[layanan] || 0) + 1;
        return acc;
      }, {}) || {};

      const totalLayanan = Object.values(layananCount).reduce((a: any, b: any) => a + b, 0) as number;
      const layanan = Object.entries(layananCount).map(([layanan, count]: [string, any]) => ({
        layanan,
        count,
        percentage: totalLayanan > 0 ? (count / totalLayanan) * 100 : 0
      }));

      // Process Tipe Faskes
      const tipeFaskesCount = tipeFaskesData?.reduce((acc: any, item: any) => {
        const tipe = item.tipe_faskes?.tipe_faskes || 'Unknown';
        acc[tipe] = (acc[tipe] || 0) + 1;
        return acc;
      }, {}) || {};

      const totalTipeFaskes = Object.values(tipeFaskesCount).reduce((a: any, b: any) => a + b, 0) as number;
      const tipeFaskes = Object.entries(tipeFaskesCount).map(([tipe_faskes, count]: [string, any]) => ({
        tipe_faskes,
        count,
        percentage: totalTipeFaskes > 0 ? (count / totalTipeFaskes) * 100 : 0
      }));

      // Process CS Performance
      const csPerformance = performaCSData?.reduce((acc: any, item: any) => {
        const csName = item.profiles?.full_name || 'Unknown';
        const isLead = item.status_leads?.status_leads?.toLowerCase().includes('leads');
        
        if (!acc[csName]) {
          acc[csName] = { total_prospek: 0, total_leads: 0 };
        }
        
        acc[csName].total_prospek += 1;
        if (isLead) {
          acc[csName].total_leads += 1;
        }
        
        return acc;
      }, {}) || {};

      const performaCS = Object.entries(csPerformance).map(([cs_name, data]: [string, any]) => ({
        cs_name,
        total_prospek: data.total_prospek,
        total_leads: data.total_leads,
        conversion_rate: data.total_prospek > 0 ? (data.total_leads / data.total_prospek) * 100 : 0
      }));

      // Process Kota/Kabupaten
      const kotaCount = kotaData?.reduce((acc: any, item: any) => {
        const kota = item.kota || 'Unknown';
        acc[kota] = (acc[kota] || 0) + 1;
        return acc;
      }, {}) || {};

      const totalKota = Object.values(kotaCount).reduce((a: any, b: any) => a + b, 0) as number;
      const kotaKabupaten = Object.entries(kotaCount).map(([kota, count]: [string, any]) => ({
        kota,
        count,
        percentage: totalKota > 0 ? (count / totalKota) * 100 : 0
      }));

      setReportData({
        sumberLeads,
        kodeAds,
        layanan,
        tipeFaskes,
        performaCS,
        kotaKabupaten
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Laporan & Analytics</h2>
        <p className="text-muted-foreground">
          Analisis performa leads dan tim sales
        </p>
      </div>

      <Tabs defaultValue="sumber-leads" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="sumber-leads">Sumber Leads</TabsTrigger>
          <TabsTrigger value="kode-ads">Kode Ads</TabsTrigger>
          <TabsTrigger value="layanan">Layanan</TabsTrigger>
          <TabsTrigger value="tipe-faskes">Tipe Faskes</TabsTrigger>
          <TabsTrigger value="performa-cs">Performa CS</TabsTrigger>
          <TabsTrigger value="kota-kabupaten">Kota/Kabupaten</TabsTrigger>
        </TabsList>

        <TabsContent value="sumber-leads">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Laporan Sumber Leads
              </CardTitle>
              <CardDescription>
                Distribusi prospek berdasarkan sumber leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sumber Leads</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Persentase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.sumberLeads.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.sumber_leads}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kode-ads">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Laporan Kode Ads
              </CardTitle>
              <CardDescription>
                Distribusi prospek berdasarkan kode ads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Ads</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Persentase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.kodeAds.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.kode}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layanan">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Laporan Layanan
              </CardTitle>
              <CardDescription>
                Distribusi prospek berdasarkan layanan assist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Persentase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.layanan.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.layanan}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipe-faskes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Laporan Tipe Faskes
              </CardTitle>
              <CardDescription>
                Distribusi prospek berdasarkan tipe fasilitas kesehatan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipe Faskes</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Persentase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.tipeFaskes.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.tipe_faskes}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performa-cs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Laporan Performa CS
              </CardTitle>
              <CardDescription>
                Performa tim customer service dalam mengonversi prospek menjadi leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama CS</TableHead>
                    <TableHead>Total Prospek</TableHead>
                    <TableHead>Total Leads</TableHead>
                    <TableHead>Conversion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.performaCS.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.cs_name}</TableCell>
                      <TableCell>{item.total_prospek}</TableCell>
                      <TableCell>{item.total_leads}</TableCell>
                      <TableCell>
                        <Badge variant={item.conversion_rate >= 50 ? "default" : "secondary"}>
                          {item.conversion_rate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kota-kabupaten">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Laporan Kota/Kabupaten
              </CardTitle>
              <CardDescription>
                Distribusi prospek berdasarkan kota/kabupaten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kota/Kabupaten</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Persentase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.kotaKabupaten.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.kota}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
