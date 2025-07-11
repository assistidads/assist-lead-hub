import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Users, Building2, UserCheck, MapPin, Loader2, PieChart, BarChart3 } from "lucide-react";
import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar } from "recharts";
import { ReportFilter } from '@/components/ReportFilter';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface BaseReportItem {
  prospek: number;
  leads: number;
  ctr_leads: number;
  count: number;
  percentage: number;
}

interface SumberLeadsItem extends BaseReportItem {
  sumber_leads: string;
  breakdown?: SumberLeadsItem[];
}

interface KodeAdsItem extends BaseReportItem {
  kode: string;
  breakdown?: { id_ads: string; prospek: number; leads: number; ctr_leads: number }[];
}

interface LayananItem extends BaseReportItem {
  layanan: string;
}

interface TipeFaskesItem extends BaseReportItem {
  tipe_faskes: string;
}

interface PerformaCSItem {
  cs_name: string;
  total_prospek: number;
  total_leads: number;
  conversion_rate: number;
}

interface KotaKabupatenItem extends BaseReportItem {
  kota: string;
}

interface ReportData {
  sumberLeads: SumberLeadsItem[];
  kodeAds: KodeAdsItem[];
  layanan: LayananItem[];
  tipeFaskes: TipeFaskesItem[];
  performaCS: PerformaCSItem[];
  kotaKabupaten: KotaKabupatenItem[];
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
  const [activeFilters, setActiveFilters] = useState<any>({});

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);

      // Build query with date filters
      let query = supabase
        .from('prospek')
        .select(`
          sumber_leads:sumber_leads_id(sumber_leads),
          kode_ads:kode_ads_id(kode),
          layanan:layanan_assist_id(layanan),
          tipe_faskes:tipe_faskes_id(tipe_faskes),
          created_by,
          status_leads_id,
          profiles!prospek_created_by_fkey(full_name),
          kota,
          id_ads,
          tanggal_prospek
        `);

      // Apply date filters
      if (activeFilters.periode) {
        const today = new Date();
        
        switch (activeFilters.periode) {
          case 'today':
            query = query.eq('tanggal_prospek', format(today, 'yyyy-MM-dd'));
            break;
          case 'yesterday':
            const yesterday = subDays(today, 1);
            query = query.eq('tanggal_prospek', format(yesterday, 'yyyy-MM-dd'));
            break;
          case 'this-week':
            const startWeek = startOfWeek(today);
            query = query.gte('tanggal_prospek', format(startWeek, 'yyyy-MM-dd'));
            break;
          case 'last-week':
            const lastWeekStart = startOfWeek(subWeeks(today, 1));
            const lastWeekEnd = endOfWeek(subWeeks(today, 1));
            query = query
              .gte('tanggal_prospek', format(lastWeekStart, 'yyyy-MM-dd'))
              .lte('tanggal_prospek', format(lastWeekEnd, 'yyyy-MM-dd'));
            break;
          case 'this-month':
            const startMonth = startOfMonth(today);
            query = query.gte('tanggal_prospek', format(startMonth, 'yyyy-MM-dd'));
            break;
          case 'last-month':
            const lastMonthStart = startOfMonth(subMonths(today, 1));
            const lastMonthEnd = endOfMonth(subMonths(today, 1));
            query = query
              .gte('tanggal_prospek', format(lastMonthStart, 'yyyy-MM-dd'))
              .lte('tanggal_prospek', format(lastMonthEnd, 'yyyy-MM-dd'));
            break;
          case 'custom':
            if (activeFilters.customDateFrom) {
              query = query.gte('tanggal_prospek', format(activeFilters.customDateFrom, 'yyyy-MM-dd'));
            }
            if (activeFilters.customDateTo) {
              query = query.lte('tanggal_prospek', format(activeFilters.customDateTo, 'yyyy-MM-dd'));
            }
            break;
        }
      }

      // Fetch all data in parallel to improve performance
      const [
        { data: prospekData },
        { data: statusLeadsData }
      ] = await Promise.all([
        query,
        supabase
          .from('status_leads')
          .select('id, status_leads')
      ]);

      if (!prospekData || !statusLeadsData) return;

      const leadsStatusIds = statusLeadsData
        .filter(status => status.status_leads.toLowerCase().includes('leads'))
        .map(status => status.id);

      // Process Sumber Leads with additional metrics and group organik
      const sumberLeadsMap = new Map<string, { prospek: number; leads: number }>();
      const organikBreakdown = new Map<string, { prospek: number; leads: number }>();
      
      prospekData.forEach(item => {
        const sumber = item.sumber_leads?.sumber_leads || 'Unknown';
        const isLead = leadsStatusIds.includes(item.status_leads_id || '');
        
        // Group non-Ads sources as Organik
        const displaySumber = sumber.toLowerCase().includes('ads') ? sumber : 'Organik';
        
        if (!sumber.toLowerCase().includes('ads')) {
          // Track organik breakdown
          if (!organikBreakdown.has(sumber)) {
            organikBreakdown.set(sumber, { prospek: 0, leads: 0 });
          }
          const organikData = organikBreakdown.get(sumber)!;
          organikData.prospek += 1;
          if (isLead) organikData.leads += 1;
        }
        
        if (!sumberLeadsMap.has(displaySumber)) {
          sumberLeadsMap.set(displaySumber, { prospek: 0, leads: 0 });
        }
        
        const data = sumberLeadsMap.get(displaySumber)!;
        data.prospek += 1;
        if (isLead) data.leads += 1;
      });

      const totalSumberProspek = Array.from(sumberLeadsMap.values()).reduce((sum, item) => sum + item.prospek, 0);
      const sumberLeads: SumberLeadsItem[] = Array.from(sumberLeadsMap.entries()).map(([sumber_leads, data]) => {
        const item: SumberLeadsItem = {
          sumber_leads,
          prospek: data.prospek,
          leads: data.leads,
          ctr_leads: data.prospek > 0 ? (data.leads / data.prospek) * 100 : 0,
          count: data.prospek,
          percentage: totalSumberProspek > 0 ? (data.prospek / totalSumberProspek) * 100 : 0
        };
        
        // Add breakdown for Organik
        if (sumber_leads === 'Organik') {
          item.breakdown = Array.from(organikBreakdown.entries()).map(([source, sourceData]) => ({
            sumber_leads: source,
            prospek: sourceData.prospek,
            leads: sourceData.leads,
            ctr_leads: sourceData.prospek > 0 ? (sourceData.leads / sourceData.prospek) * 100 : 0,
            count: sourceData.prospek,
            percentage: data.prospek > 0 ? (sourceData.prospek / data.prospek) * 100 : 0
          }));
        }
        
        return item;
      });

      // Process Kode Ads with additional metrics and ID breakdown
      const kodeAdsMap = new Map<string, { prospek: number; leads: number; ids: Map<string, { prospek: number; leads: number }> }>();
      
      prospekData.forEach(item => {
        const kode = item.kode_ads?.kode || 'Unknown';
        const idAds = item.id_ads || 'Unknown';
        const isLead = leadsStatusIds.includes(item.status_leads_id || '');
        
        if (!kodeAdsMap.has(kode)) {
          kodeAdsMap.set(kode, { prospek: 0, leads: 0, ids: new Map() });
        }
        
        const data = kodeAdsMap.get(kode)!;
        data.prospek += 1;
        if (isLead) data.leads += 1;
        
        // Track ID breakdown
        if (!data.ids.has(idAds)) {
          data.ids.set(idAds, { prospek: 0, leads: 0 });
        }
        const idData = data.ids.get(idAds)!;
        idData.prospek += 1;
        if (isLead) idData.leads += 1;
      });

      const totalKodeProspek = Array.from(kodeAdsMap.values()).reduce((sum, item) => sum + item.prospek, 0);
      const kodeAds: KodeAdsItem[] = Array.from(kodeAdsMap.entries()).map(([kode, data]) => ({
        kode,
        prospek: data.prospek,
        leads: data.leads,
        ctr_leads: data.prospek > 0 ? (data.leads / data.prospek) * 100 : 0,
        count: data.prospek,
        percentage: totalKodeProspek > 0 ? (data.prospek / totalKodeProspek) * 100 : 0,
        breakdown: Array.from(data.ids.entries()).map(([id_ads, idData]) => ({
          id_ads,
          prospek: idData.prospek,
          leads: idData.leads,
          ctr_leads: idData.prospek > 0 ? (idData.leads / idData.prospek) * 100 : 0
        }))
      }));

      // Process Layanan with additional metrics
      const layananMap = new Map<string, { prospek: number; leads: number }>();
      prospekData.forEach(item => {
        const layanan = item.layanan?.layanan || 'Unknown';
        const isLead = leadsStatusIds.includes(item.status_leads_id || '');
        
        if (!layananMap.has(layanan)) {
          layananMap.set(layanan, { prospek: 0, leads: 0 });
        }
        
        const data = layananMap.get(layanan)!;
        data.prospek += 1;
        if (isLead) data.leads += 1;
      });

      const totalLayananProspek = Array.from(layananMap.values()).reduce((sum, item) => sum + item.prospek, 0);
      const layanan: LayananItem[] = Array.from(layananMap.entries()).map(([layanan, data]) => ({
        layanan,
        prospek: data.prospek,
        leads: data.leads,
        ctr_leads: data.prospek > 0 ? (data.leads / data.prospek) * 100 : 0,
        count: data.prospek,
        percentage: totalLayananProspek > 0 ? (data.prospek / totalLayananProspek) * 100 : 0
      }));

      // Process Tipe Faskes with additional metrics
      const tipeFaskesMap = new Map<string, { prospek: number; leads: number }>();
      prospekData.forEach(item => {
        const tipe = item.tipe_faskes?.tipe_faskes || 'Unknown';
        const isLead = leadsStatusIds.includes(item.status_leads_id || '');
        
        if (!tipeFaskesMap.has(tipe)) {
          tipeFaskesMap.set(tipe, { prospek: 0, leads: 0 });
        }
        
        const data = tipeFaskesMap.get(tipe)!;
        data.prospek += 1;
        if (isLead) data.leads += 1;
      });

      const totalTipeFaskesProspek = Array.from(tipeFaskesMap.values()).reduce((sum, item) => sum + item.prospek, 0);
      const tipeFaskes: TipeFaskesItem[] = Array.from(tipeFaskesMap.entries()).map(([tipe_faskes, data]) => ({
        tipe_faskes,
        prospek: data.prospek,
        leads: data.leads,
        ctr_leads: data.prospek > 0 ? (data.leads / data.prospek) * 100 : 0,
        count: data.prospek,
        percentage: totalTipeFaskesProspek > 0 ? (data.prospek / totalTipeFaskesProspek) * 100 : 0
      }));

      // Process CS Performance
      const csPerformanceMap = new Map<string, { total_prospek: number; total_leads: number }>();
      prospekData.forEach(item => {
        const csName = item.profiles?.full_name || 'Unknown';
        const isLead = leadsStatusIds.includes(item.status_leads_id || '');
        
        if (!csPerformanceMap.has(csName)) {
          csPerformanceMap.set(csName, { total_prospek: 0, total_leads: 0 });
        }
        
        const data = csPerformanceMap.get(csName)!;
        data.total_prospek += 1;
        if (isLead) data.total_leads += 1;
      });

      const performaCS: PerformaCSItem[] = Array.from(csPerformanceMap.entries()).map(([cs_name, data]) => ({
        cs_name,
        total_prospek: data.total_prospek,
        total_leads: data.total_leads,
        conversion_rate: data.total_prospek > 0 ? (data.total_leads / data.total_prospek) * 100 : 0
      }));

      // Process Kota/Kabupaten with additional metrics
      const kotaMap = new Map<string, { prospek: number; leads: number }>();
      prospekData.forEach(item => {
        const kota = item.kota || 'Unknown';
        const isLead = leadsStatusIds.includes(item.status_leads_id || '');
        
        if (!kotaMap.has(kota)) {
          kotaMap.set(kota, { prospek: 0, leads: 0 });
        }
        
        const data = kotaMap.get(kota)!;
        data.prospek += 1;
        if (isLead) data.leads += 1;
      });

      const totalKotaProspek = Array.from(kotaMap.values()).reduce((sum, item) => sum + item.prospek, 0);
      const kotaKabupaten: KotaKabupatenItem[] = Array.from(kotaMap.entries())
        .map(([kota, data]) => ({
          kota,
          prospek: data.prospek,
          leads: data.leads,
          ctr_leads: data.prospek > 0 ? (data.leads / data.prospek) * 100 : 0,
          count: data.prospek,
          percentage: totalKotaProspek > 0 ? (data.prospek / totalKotaProspek) * 100 : 0
        }))
        .sort((a, b) => b.leads - a.leads) // Sort by leads count descending
        .slice(0, 5); // Take top 5

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
  }, [activeFilters]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Memoized chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => ({
    sumberLeadsPie: reportData.sumberLeads.map(item => ({
      name: item.sumber_leads,
      value: item.count
    })),
    tipeFaskesPie: reportData.tipeFaskes.map(item => ({
      name: item.tipe_faskes,
      value: item.count
    })),
    kodeAdsBar: reportData.kodeAds.map(item => ({
      name: item.kode,
      prospek: item.prospek,
      leads: item.leads
    })),
    layananBar: reportData.layanan.map(item => ({
      name: item.layanan,
      prospek: item.prospek,
      leads: item.leads
    })),
    performaCSBar: reportData.performaCS.map(item => ({
      name: item.cs_name,
      prospek: item.total_prospek,
      leads: item.total_leads,
      ctr: item.conversion_rate
    })),
    kotaBar: reportData.kotaKabupaten.map(item => ({
      name: item.kota,
      prospek: item.prospek,
      leads: item.leads
    }))
  }), [reportData]);

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
          <div className="mb-4">
            <ReportFilter onFilterChange={setActiveFilters} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribusi Sumber Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.sumberLeadsPie}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {chartData.sumberLeadsPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sumber Leads</TableHead>
                        <TableHead>Prospek</TableHead>
                        <TableHead>Leads</TableHead>
                        <TableHead>CTR Leads</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.sumberLeads.map((item, index) => (
                        item.sumber_leads === 'Organik' && item.breakdown ? (
                          <React.Fragment key={index}>
                            <TableRow>
                              <TableCell colSpan={5} className="p-0">
                                <Accordion type="single" collapsible>
                                  <AccordionItem value={`organik-${index}`} className="border-0">
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                       <div className="flex w-full items-center justify-between">
                                         <span className="font-medium">{item.sumber_leads}</span>
                                         <div className="flex gap-12 text-sm">
                                           <span className="w-16 text-center">{item.prospek}</span>
                                           <span className="w-16 text-center">{item.leads}</span>
                                           <span className="w-20 text-center">
                                             <Badge variant={item.ctr_leads === 0 ? "destructive" : "default"}>
                                               {item.ctr_leads.toFixed(1)}%
                                             </Badge>
                                           </span>
                                         </div>
                                       </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-3">
                                      <div className="space-y-2">
                                        {item.breakdown.map((subItem, subIndex) => (
                                          <div key={subIndex} className="flex items-center justify-between pl-4 py-2 bg-muted/20 rounded">
                                            <span className="text-sm text-muted-foreground">ID: {subItem.sumber_leads}</span>
                                            <div className="flex gap-8 text-sm">
                                              <span>{subItem.prospek}</span>
                                              <span>{subItem.leads}</span>
                                              <span>
                                                <Badge variant={subItem.ctr_leads === 0 ? "destructive" : "default"} className="text-xs">
                                                  {subItem.ctr_leads.toFixed(1)}%
                                                </Badge>
                                              </span>
                                              <span>
                                                <Badge variant="outline" className="text-xs">{subItem.percentage.toFixed(1)}%</Badge>
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        ) : (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.sumber_leads}</TableCell>
                            <TableCell>{item.prospek}</TableCell>
                            <TableCell>{item.leads}</TableCell>
                            <TableCell>
                              <Badge variant={item.ctr_leads === 0 ? "destructive" : "default"}>
                                {item.ctr_leads.toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kode-ads">
          <div className="mb-4">
            <ReportFilter onFilterChange={setActiveFilters} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Grafik Kode Ads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.kodeAdsBar}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="prospek" fill="#8884d8" name="Prospek" />
                    <Bar dataKey="leads" fill="#82ca9d" name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode</TableHead>
                        <TableHead>Prospek</TableHead>
                        <TableHead>Leads</TableHead>
                        <TableHead>CTR Leads</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.kodeAds.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={5} className="p-0">
                            <Accordion type="single" collapsible>
                              <AccordionItem value={`kode-${index}`} className="border-0">
                                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                   <div className="flex w-full items-center justify-between">
                                     <span className="font-medium">{item.kode}</span>
                                     <div className="flex gap-12 text-sm">
                                       <span className="w-16 text-center">{item.prospek}</span>
                                       <span className="w-16 text-center">{item.leads}</span>
                                       <span className="w-20 text-center">
                                         <Badge variant={item.ctr_leads === 0 ? "destructive" : "default"}>
                                           {item.ctr_leads.toFixed(1)}%
                                         </Badge>
                                       </span>
                                     </div>
                                   </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-3">
                                  <div className="space-y-2">
                                    {item.breakdown?.map((subItem, subIndex) => (
                                      <div key={subIndex} className="flex items-center justify-between pl-4 py-2 bg-muted/20 rounded">
                                        <span className="text-sm text-muted-foreground">ID: {subItem.id_ads}</span>
                                        <div className="flex gap-8 text-sm">
                                          <span>{subItem.prospek}</span>
                                          <span>{subItem.leads}</span>
                                          <span>
                                            <Badge variant={subItem.ctr_leads === 0 ? "destructive" : "default"} className="text-xs">
                                              {subItem.ctr_leads.toFixed(1)}%
                                            </Badge>
                                          </span>
                                          <span className="w-16"></span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="layanan">
          <div className="mb-4">
            <ReportFilter onFilterChange={setActiveFilters} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Grafik Layanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.layananBar}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="prospek" fill="#8884d8" name="Prospek" />
                    <Bar dataKey="leads" fill="#82ca9d" name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
                       <TableHead>Prospek</TableHead>
                       <TableHead>Leads</TableHead>
                       <TableHead>CTR Leads</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.layanan.map((item, index) => (
                      <TableRow key={index}>
                         <TableCell className="font-medium">{item.layanan}</TableCell>
                         <TableCell>{item.prospek}</TableCell>
                         <TableCell>{item.leads}</TableCell>
                         <TableCell>{item.ctr_leads.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tipe-faskes">
          <div className="mb-4">
            <ReportFilter onFilterChange={setActiveFilters} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribusi Tipe Faskes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.tipeFaskesPie}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {chartData.tipeFaskesPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
                       <TableHead>Prospek</TableHead>
                       <TableHead>Leads</TableHead>
                       <TableHead>CTR Leads</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.tipeFaskes.map((item, index) => (
                      <TableRow key={index}>
                         <TableCell className="font-medium">{item.tipe_faskes}</TableCell>
                         <TableCell>{item.prospek}</TableCell>
                         <TableCell>{item.leads}</TableCell>
                         <TableCell>{item.ctr_leads.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performa-cs">
          <div className="mb-4">
            <ReportFilter onFilterChange={setActiveFilters} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Grafik Performa CS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.performaCSBar}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="prospek" fill="#8884d8" name="Total Prospek" />
                    <Bar dataKey="leads" fill="#82ca9d" name="Total Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
          </div>
        </TabsContent>

        <TabsContent value="kota-kabupaten">
          <div className="mb-4">
            <ReportFilter onFilterChange={setActiveFilters} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top 5 Kota/Kabupaten dengan Leads Terbanyak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.kotaBar}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="prospek" fill="#8884d8" name="Prospek" />
                    <Bar dataKey="leads" fill="#82ca9d" name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Laporan Kota/Kabupaten
                </CardTitle>
                <CardDescription>
                  Top 5 kota/kabupaten dengan leads terbanyak
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                       <TableHead>Kota/Kabupaten</TableHead>
                       <TableHead>Prospek</TableHead>
                       <TableHead>Leads</TableHead>
                       <TableHead>CTR Leads</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.kotaKabupaten.map((item, index) => (
                      <TableRow key={index}>
                         <TableCell className="font-medium">{item.kota}</TableCell>
                         <TableCell>{item.prospek}</TableCell>
                         <TableCell>{item.leads}</TableCell>
                         <TableCell>{item.ctr_leads.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}