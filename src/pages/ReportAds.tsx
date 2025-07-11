import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Loader2, Plus, Eye, TrendingUp, TrendingDown, Edit, DollarSign, Users, Target, Calculator, BarChart, Wallet, CreditCard, PiggyBank } from 'lucide-react';

interface AdsData {
  kode_ads_id: string;
  kode: string;
  budget: number;
  budget_spent: number;
  prospek_count: number;
  leads_count: number;
}

interface BudgetHistory {
  id: string;
  amount: number;
  description: string;
  created_at: string;
}

interface ReportMetrics {
  current: {
    total_prospek: number;
    total_leads: number;
    total_budget_spent: number;
    total_budget: number;
    sisa_budget: number;
    cost_per_leads: number;
  };
  previous: {
    total_prospek: number;
    total_leads: number;
    total_budget_spent: number;
    total_budget: number;
    sisa_budget: number;
    cost_per_leads: number;
  };
}

const ReportAds: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<AdsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKodeAds, setSelectedKodeAds] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAds, setSelectedAds] = useState<AdsData | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetDescription, setBudgetDescription] = useState('');
  const [budgetHistory, setBudgetHistory] = useState<BudgetHistory[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics>({
    current: { total_prospek: 0, total_leads: 0, total_budget_spent: 0, total_budget: 0, sisa_budget: 0, cost_per_leads: 0 },
    previous: { total_prospek: 0, total_leads: 0, total_budget_spent: 0, total_budget: 0, sisa_budget: 0, cost_per_leads: 0 }
  });
  const [updateSpentDialogOpen, setUpdateSpentDialogOpen] = useState(false);
  const [spentAmount, setSpentAmount] = useState('');
  const [includePpn, setIncludePpn] = useState(false);
  const [addKodeAdsDialogOpen, setAddKodeAdsDialogOpen] = useState(false);
  const [newKodeAds, setNewKodeAds] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const [year, month] = selectedMonth.split('-');
      const startDate = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
      const endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));
      const prevStartDate = startOfMonth(subMonths(startDate, 1));
      const prevEndDate = endOfMonth(subMonths(startDate, 1));

      // Fetch all data in parallel for better performance
      const [kodeAdsResult, prospekResult, prevProspekResult, statusResult] = await Promise.all([
        supabase
          .from('kode_ads')
          .select(`
            id,
            kode,
            ads_budget (
              budget,
              budget_spent
            )
          `),
        supabase
          .from('prospek')
          .select('kode_ads_id, status_leads_id')
          .gte('tanggal_prospek', format(startDate, 'yyyy-MM-dd'))
          .lte('tanggal_prospek', format(endDate, 'yyyy-MM-dd')),
        supabase
          .from('prospek')
          .select('kode_ads_id, status_leads_id')
          .gte('tanggal_prospek', format(prevStartDate, 'yyyy-MM-dd'))
          .lte('tanggal_prospek', format(prevEndDate, 'yyyy-MM-dd')),
        supabase
          .from('status_leads')
          .select('id, status_leads')
      ]);

      // Check for errors
      if (kodeAdsResult.error) throw kodeAdsResult.error;
      if (prospekResult.error) throw prospekResult.error;
      if (prevProspekResult.error) throw prevProspekResult.error;
      if (statusResult.error) throw statusResult.error;

      const { data: kodeAdsData } = kodeAdsResult;
      const { data: prospekData } = prospekResult;
      const { data: prevProspekData } = prevProspekResult;
      const { data: statusData } = statusResult;

      const leadsStatusIds = statusData
        ?.filter(status => status.status_leads.toLowerCase().includes('leads'))
        .map(status => status.id) || [];

      // Process current period data
      const currentAdsData: AdsData[] = kodeAdsData?.map(ads => {
        const prospekForAds = prospekData?.filter(p => p.kode_ads_id === ads.id) || [];
        const leadsForAds = prospekForAds.filter(p => leadsStatusIds.includes(p.status_leads_id || ''));
        
        return {
          kode_ads_id: ads.id,
          kode: ads.kode,
          budget: ads.ads_budget?.[0]?.budget || 0,
          budget_spent: ads.ads_budget?.[0]?.budget_spent || 0,
          prospek_count: prospekForAds.length,
          leads_count: leadsForAds.length,
        };
      }).filter(ads => ads.prospek_count > 0) || [];

      // Process previous period data for comparison
      const prevAdsData = kodeAdsData?.map(ads => {
        const prospekForAds = prevProspekData?.filter(p => p.kode_ads_id === ads.id) || [];
        const leadsForAds = prospekForAds.filter(p => leadsStatusIds.includes(p.status_leads_id || ''));
        
        return {
          prospek_count: prospekForAds.length,
          leads_count: leadsForAds.length,
          budget_spent: ads.ads_budget?.[0]?.budget_spent || 0,
        };
      }) || [];

      // Calculate metrics
      const currentMetrics = {
        total_prospek: currentAdsData.reduce((sum, ads) => sum + ads.prospek_count, 0),
        total_leads: currentAdsData.reduce((sum, ads) => sum + ads.leads_count, 0),
        total_budget_spent: currentAdsData.reduce((sum, ads) => sum + ads.budget_spent, 0),
        total_budget: currentAdsData.reduce((sum, ads) => sum + ads.budget, 0),
        sisa_budget: 0,
        cost_per_leads: 0,
      };

      const previousMetrics = {
        total_prospek: prevAdsData.reduce((sum, ads) => sum + ads.prospek_count, 0),
        total_leads: prevAdsData.reduce((sum, ads) => sum + ads.leads_count, 0),
        total_budget_spent: prevAdsData.reduce((sum, ads) => sum + ads.budget_spent, 0),
        total_budget: kodeAdsData?.reduce((sum, ads) => sum + (ads.ads_budget?.[0]?.budget || 0), 0) || 0,
        sisa_budget: 0,
        cost_per_leads: 0,
      };

      currentMetrics.sisa_budget = currentMetrics.total_budget - currentMetrics.total_budget_spent;
      previousMetrics.sisa_budget = previousMetrics.total_budget - previousMetrics.total_budget_spent;

      currentMetrics.cost_per_leads = currentMetrics.total_leads > 0 
        ? currentMetrics.total_budget_spent / currentMetrics.total_leads 
        : 0;

      previousMetrics.cost_per_leads = previousMetrics.total_leads > 0 
        ? previousMetrics.total_budget_spent / previousMetrics.total_leads 
        : 0;

      setMetrics({ current: currentMetrics, previous: previousMetrics });
      setData(currentAdsData);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data report ads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, selectedMonth, toast]);

  const fetchBudgetHistory = async (adsId: string) => {
    try {
      const { data: budgetData, error: budgetError } = await supabase
        .from('ads_budget')
        .select('id')
        .eq('kode_ads_id', adsId)
        .single();

      if (budgetError || !budgetData) return;

      const { data: historyData, error: historyError } = await supabase
        .from('ads_budget_history')
        .select('*')
        .eq('ads_budget_id', budgetData.id)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      setBudgetHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching budget history:', error);
    }
  };

  const handleAddBudget = async () => {
    if (!selectedAds || !budgetAmount) {
      toast({
        title: 'Error',
        description: 'Harap isi jumlah budget',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get or create ads_budget record
      let { data: budgetData, error: budgetError } = await supabase
        .from('ads_budget')
        .select('id, budget')
        .eq('kode_ads_id', selectedAds.kode_ads_id)
        .single();

      if (budgetError && budgetError.code !== 'PGRST116') {
        throw budgetError;
      }

      const amount = parseFloat(budgetAmount);

      if (!budgetData) {
        // Create new budget record
        const { data: newBudget, error: createError } = await supabase
          .from('ads_budget')
          .insert({
            kode_ads_id: selectedAds.kode_ads_id,
            budget: amount,
            budget_spent: 0,
          })
          .select('id')
          .single();

        if (createError) throw createError;
        budgetData = { id: newBudget.id, budget: amount };
      } else {
        // Update existing budget
        const newBudget = budgetData.budget + amount;
        const { error: updateError } = await supabase
          .from('ads_budget')
          .update({ budget: newBudget })
          .eq('id', budgetData.id);

        if (updateError) throw updateError;
      }

      // Add to budget history
      const { error: historyError } = await supabase
        .from('ads_budget_history')
        .insert({
          ads_budget_id: budgetData.id,
          amount: amount,
          description: budgetDescription || 'Penambahan budget',
        });

      if (historyError) throw historyError;

      toast({
        title: 'Sukses',
        description: 'Budget berhasil ditambahkan',
      });

      setBudgetDialogOpen(false);
      setBudgetAmount('');
      setBudgetDescription('');
      fetchData();
    } catch (error: any) {
      console.error('Error adding budget:', error);
      toast({
        title: 'Error',
        description: 'Penyimpanan data gagal',
        variant: 'destructive',
      });
    }
  };

  // Use useMemo to memoize expensive calculations
  const filteredData = useMemo(() => {
    if (selectedKodeAds === 'all') {
      return data;
    }
    return data.filter(item => item.kode_ads_id === selectedKodeAds);
  }, [selectedKodeAds, data]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openBudgetDialog = (ads: AdsData) => {
    setSelectedAds(ads);
    setBudgetDialogOpen(true);
  };

  const openDetailDialog = (ads: AdsData) => {
    setSelectedAds(ads);
    fetchBudgetHistory(ads.kode_ads_id);
    setDetailDialogOpen(true);
  };

  const openUpdateSpentDialog = (ads: AdsData) => {
    setSelectedAds(ads);
    setUpdateSpentDialogOpen(true);
  };

  const formatRupiahInput = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return new Intl.NumberFormat('id-ID').format(parseInt(number) || 0);
  };

  const parseRupiahInput = (value: string) => {
    return value.replace(/[^\d]/g, '');
  };

  const handleUpdateSpent = async () => {
    if (!selectedAds || !spentAmount) {
      toast({
        title: 'Error',
        description: 'Harap isi jumlah budget spent',
        variant: 'destructive',
      });
      return;
    }

    try {
      let { data: budgetData, error: budgetError } = await supabase
        .from('ads_budget')
        .select('id, budget_spent')
        .eq('kode_ads_id', selectedAds.kode_ads_id)
        .single();

      if (budgetError && budgetError.code !== 'PGRST116') {
        throw budgetError;
      }

      let baseAmount = parseFloat(parseRupiahInput(spentAmount));
      if (includePpn) {
        baseAmount = baseAmount * 1.11;
      }

      if (!budgetData) {
        // Create new budget record if it doesn't exist
        const { data: newBudget, error: createError } = await supabase
          .from('ads_budget')
          .insert({
            kode_ads_id: selectedAds.kode_ads_id,
            budget: 0,
            budget_spent: baseAmount,
          })
          .select('id')
          .single();

        if (createError) throw createError;
      } else {
        // Update existing budget spent
        const { error: updateError } = await supabase
          .from('ads_budget')
          .update({ budget_spent: baseAmount })
          .eq('id', budgetData.id);

        if (updateError) throw updateError;
      }

      toast({
        title: 'Sukses',
        description: `Budget spent berhasil diupdate${includePpn ? ' (termasuk PPN 11%)' : ''}`,
      });

      setUpdateSpentDialogOpen(false);
      setSpentAmount('');
      setIncludePpn(false);
      fetchData();
    } catch (error: any) {
      console.error('Error updating budget spent:', error);
      toast({
        title: 'Error',
        description: 'Penyimpanan data gagal',
        variant: 'destructive',
      });
    }
  };

  const handleAddKodeAds = async () => {
    if (!newKodeAds.trim()) {
      toast({
        title: 'Error',
        description: 'Harap isi kode ads',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('kode_ads')
        .insert({ kode: newKodeAds.trim() });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      toast({
        title: 'Sukses',
        description: 'Kode ads berhasil ditambahkan',
      });

      setAddKodeAdsDialogOpen(false);
      setNewKodeAds('');
      fetchData();
    } catch (error: any) {
      console.error('Error adding kode ads:', error);
      toast({
        title: 'Error',
        description: 'Penyimpanan data gagal',
        variant: 'destructive',
      });
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Report Ads</h1>
        
        <div className="flex gap-4 items-center">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = subMonths(new Date(), i);
                const value = format(date, 'yyyy-MM');
                const label = format(date, 'MMMM yyyy');
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Prospek</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.current.total_prospek.toLocaleString()}</div>
            <div className="flex items-center text-sm">
              {calculatePercentageChange(metrics.current.total_prospek, metrics.previous.total_prospek) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={calculatePercentageChange(metrics.current.total_prospek, metrics.previous.total_prospek) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(calculatePercentageChange(metrics.current.total_prospek, metrics.previous.total_prospek)).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Leads</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.current.total_leads.toLocaleString()}</div>
            <div className="flex items-center text-sm">
              {calculatePercentageChange(metrics.current.total_leads, metrics.previous.total_leads) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={calculatePercentageChange(metrics.current.total_leads, metrics.previous.total_leads) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(calculatePercentageChange(metrics.current.total_leads, metrics.previous.total_leads)).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Per Leads</CardTitle>
            <Calculator className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.current.cost_per_leads)}</div>
            <div className="flex items-center text-sm">
              {calculatePercentageChange(metrics.current.cost_per_leads, metrics.previous.cost_per_leads) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              )}
              <span className={calculatePercentageChange(metrics.current.cost_per_leads, metrics.previous.cost_per_leads) >= 0 ? 'text-red-600' : 'text-green-600'}>
                {Math.abs(calculatePercentageChange(metrics.current.cost_per_leads, metrics.previous.cost_per_leads)).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR Leads</CardTitle>
            <BarChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((metrics.current.total_leads / metrics.current.total_prospek) * 100 || 0).toFixed(2)}%</div>
            <div className="flex items-center text-sm">
              {calculatePercentageChange(
                (metrics.current.total_leads / metrics.current.total_prospek) * 100 || 0,
                (metrics.previous.total_leads / metrics.previous.total_prospek) * 100 || 0
              ) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={calculatePercentageChange(
                (metrics.current.total_leads / metrics.current.total_prospek) * 100 || 0,
                (metrics.previous.total_leads / metrics.previous.total_prospek) * 100 || 0
              ) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(calculatePercentageChange(
                  (metrics.current.total_leads / metrics.current.total_prospek) * 100 || 0,
                  (metrics.previous.total_leads / metrics.previous.total_prospek) * 100 || 0
                )).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Row 2 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.current.total_budget)}</div>
            <div className="flex items-center text-sm">
              {calculatePercentageChange(metrics.current.total_budget, metrics.previous.total_budget) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={calculatePercentageChange(metrics.current.total_budget, metrics.previous.total_budget) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(calculatePercentageChange(metrics.current.total_budget, metrics.previous.total_budget)).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.current.total_budget_spent)}</div>
            <div className="flex items-center text-sm">
              {calculatePercentageChange(metrics.current.total_budget_spent, metrics.previous.total_budget_spent) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              )}
              <span className={calculatePercentageChange(metrics.current.total_budget_spent, metrics.previous.total_budget_spent) >= 0 ? 'text-red-600' : 'text-green-600'}>
                {Math.abs(calculatePercentageChange(metrics.current.total_budget_spent, metrics.previous.total_budget_spent)).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sisa Budget</CardTitle>
            <PiggyBank className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.current.sisa_budget)}</div>
            <div className="flex items-center text-sm">
              {calculatePercentageChange(metrics.current.sisa_budget, metrics.previous.sisa_budget) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={calculatePercentageChange(metrics.current.sisa_budget, metrics.previous.sisa_budget) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(calculatePercentageChange(metrics.current.sisa_budget, metrics.previous.sisa_budget)).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Label htmlFor="filter-kode">Filter Kode Ads:</Label>
            <Select value={selectedKodeAds} onValueChange={setSelectedKodeAds}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Pilih Kode Ads" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kode Ads</SelectItem>
                {data.map((item) => (
                  <SelectItem key={item.kode_ads_id} value={item.kode_ads_id}>
                    {item.kode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Add Kode Ads Dialog */}
      <Dialog open={addKodeAdsDialogOpen} onOpenChange={setAddKodeAdsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kode Ads</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="kode-ads">Kode Ads</Label>
              <Input
                id="kode-ads"
                value={newKodeAds}
                onChange={(e) => setNewKodeAds(e.target.value)}
                placeholder="Masukkan kode ads"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddKodeAdsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddKodeAds}>
                Tambah Kode Ads
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Data Report Ads</CardTitle>
          <Button onClick={() => setAddKodeAdsDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Data
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Ads</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Budget Spent</TableHead>
                <TableHead>Sisa Budget</TableHead>
                <TableHead>Prospek</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Cost Per Leads</TableHead>
                <TableHead>CTR Leads</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Tidak ada data untuk periode yang dipilih
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => {
                  const sisaBudget = item.budget - item.budget_spent;
                  const costPerLeads = item.leads_count > 0 ? item.budget_spent / item.leads_count : 0;
                  const ctrLeads = item.prospek_count > 0 ? (item.leads_count / item.prospek_count) * 100 : 0;

                  return (
                    <TableRow key={item.kode_ads_id}>
                      <TableCell className="font-medium">{item.kode}</TableCell>
                      <TableCell>{formatCurrency(item.budget)}</TableCell>
                      <TableCell>{formatCurrency(item.budget_spent)}</TableCell>
                      <TableCell>{formatCurrency(sisaBudget)}</TableCell>
                      <TableCell>{item.prospek_count}</TableCell>
                      <TableCell>{item.leads_count}</TableCell>
                      <TableCell>{formatCurrency(costPerLeads)}</TableCell>
                      <TableCell>{ctrLeads.toFixed(2)}%</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            className="h-8 w-8 bg-green-600 hover:bg-green-700"
                            onClick={() => openBudgetDialog(item)}
                            title="Tambah Budget"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-blue-600 text-blue-600 hover:bg-blue-50"
                            onClick={() => openDetailDialog(item)}
                            title="Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            className="h-8 w-8 bg-orange-600 hover:bg-orange-700"
                            onClick={() => openUpdateSpentDialog(item)}
                            title="Update Spent"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Budget Dialog */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Budget - {selectedAds?.kode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="budget-amount">Jumlah Budget</Label>
              <Input
                id="budget-amount"
                type="text"
                value={budgetAmount ? formatRupiahInput(budgetAmount) : ''}
                onChange={(e) => setBudgetAmount(parseRupiahInput(e.target.value))}
                placeholder="Masukkan jumlah budget"
              />
            </div>
            <div>
              <Label htmlFor="budget-description">Deskripsi (Opsional)</Label>
              <Input
                id="budget-description"
                value={budgetDescription}
                onChange={(e) => setBudgetDescription(e.target.value)}
                placeholder="Deskripsi penambahan budget"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBudgetDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddBudget}>
                Tambah Budget
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Budget - {selectedAds?.kode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Budget</Label>
                <div className="text-lg font-semibold">{formatCurrency(selectedAds?.budget || 0)}</div>
              </div>
              <div>
                <Label>Budget Spent</Label>
                <div className="text-lg font-semibold">{formatCurrency(selectedAds?.budget_spent || 0)}</div>
              </div>
              <div>
                <Label>Sisa Budget</Label>
                <div className="text-lg font-semibold">{formatCurrency((selectedAds?.budget || 0) - (selectedAds?.budget_spent || 0))}</div>
              </div>
              <div>
                <Label>Prospek</Label>
                <div className="text-lg font-semibold">{selectedAds?.prospek_count || 0}</div>
              </div>
              <div>
                <Label>Leads</Label>
                <div className="text-lg font-semibold">{selectedAds?.leads_count || 0}</div>
              </div>
              <div>
                <Label>Cost Per Leads</Label>
                <div className="text-lg font-semibold">{formatCurrency((selectedAds?.leads_count || 0) > 0 ? (selectedAds?.budget_spent || 0) / selectedAds.leads_count : 0)}</div>
              </div>
              <div>
                <Label>CTR Leads</Label>
                <div className="text-lg font-semibold">{((selectedAds?.prospek_count || 0) > 0 ? ((selectedAds?.leads_count || 0) / selectedAds.prospek_count) * 100 : 0).toFixed(2)}%</div>
              </div>
            </div>
            
            <div>
              <Label className="text-base font-semibold">History Penambahan Budget</Label>
              <div className="mt-2 max-h-64 overflow-y-auto">
                {budgetHistory.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Belum ada history penambahan budget
                  </div>
                ) : (
                  <div className="space-y-2">
                    {budgetHistory.map((history) => (
                      <div key={history.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium">{formatCurrency(history.amount)}</div>
                          <div className="text-sm text-muted-foreground">{history.description}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(history.created_at), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Spent Dialog */}
      <Dialog open={updateSpentDialogOpen} onOpenChange={setUpdateSpentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Budget Spent - {selectedAds?.kode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="spent-amount">Jumlah Budget Spent</Label>
              <Input
                id="spent-amount"
                type="text"
                value={spentAmount ? formatRupiahInput(spentAmount) : ''}
                onChange={(e) => setSpentAmount(parseRupiahInput(e.target.value))}
                placeholder="Masukkan jumlah budget spent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-ppn"
                checked={includePpn}
                onCheckedChange={(checked) => setIncludePpn(checked === true)}
              />
              <Label htmlFor="include-ppn">Termasuk PPN 11%</Label>
            </div>
            {includePpn && spentAmount && (
              <div className="text-sm text-muted-foreground">
                Total dengan PPN: {formatCurrency(parseFloat(parseRupiahInput(spentAmount)) * 1.11)}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUpdateSpentDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdateSpent}>
                Update Spent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportAds;