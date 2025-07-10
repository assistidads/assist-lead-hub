
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Edit, Trash2, Plus, Search, CalendarIcon, RefreshCcw, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ProspekDetailDialog } from './ProspekDetailDialog';
import type { Prospek } from '@/types/database';

interface ProspekTableNewProps {
  onEdit: (prospek: Prospek) => void;
  onDelete: (id: string) => void;
  onOpenForm: () => void;
  onUpdateStatus: (prospek: Prospek) => void;
  refreshTrigger: number;
}

export const ProspekTableNew: React.FC<ProspekTableNewProps> = ({
  onEdit,
  onDelete,
  onOpenForm,
  onUpdateStatus,
  refreshTrigger,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailProspek, setSelectedDetailProspek] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    sumber_leads: [] as string[],
    kode_ads: [] as string[],
    layanan_assist: [] as string[],
    status_leads: [] as string[],
    date_range: '',
    custom_start_date: null as Date | null,
    custom_end_date: null as Date | null,
  });
  
  const [masterData, setMasterData] = useState({
    sumberLeads: [] as any[],
    kodeAds: [] as any[],
    layananAssist: [] as any[],
    statusLeads: [] as any[],
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
  });

  const { user, profile } = useAuth();

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (user && profile) {
      console.log('User and profile loaded, fetching data...', { user: user.id, role: profile.role });
      fetchData();
    } else {
      console.log('User or profile not loaded yet:', { user: !!user, profile: !!profile });
    }
  }, [pagination.page, pagination.pageSize, searchQuery, filters, refreshTrigger, user, profile]);

  const fetchMasterData = async () => {
    try {
      console.log('Fetching master data for table filters...');
      
      const [sumberRes, kodeRes, layananRes, statusRes] = await Promise.all([
        supabase.from('sumber_leads').select('*').order('sumber_leads'),
        supabase.from('kode_ads').select('*').order('kode'),
        supabase.from('layanan_assist').select('*').order('layanan'),
        supabase.from('status_leads').select('*').order('status_leads')
      ]);

      console.log('Master data for filters:', {
        sumberLeads: sumberRes,
        kodeAds: kodeRes,
        layananAssist: layananRes,
        statusLeads: statusRes
      });

      // Check for errors
      if (sumberRes.error) console.error('Sumber leads error:', sumberRes.error);
      if (kodeRes.error) console.error('Kode ads error:', kodeRes.error);
      if (layananRes.error) console.error('Layanan assist error:', layananRes.error);
      if (statusRes.error) console.error('Status leads error:', statusRes.error);

      setMasterData({
        sumberLeads: sumberRes.data || [],
        kodeAds: kodeRes.data || [],
        layananAssist: layananRes.data || [],
        statusLeads: statusRes.data || [],
      });
    } catch (error) {
      console.error('Error fetching master data for filters:', error);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (filters.date_range) {
      case 'today':
        return { start: startOfDay, end: endOfDay };
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return { 
          start: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
          end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
        };
      case 'this_week': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return { 
          start: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate()),
          end: endOfDay 
        };
      }
      case 'last_week': {
        const startOfLastWeek = new Date(now);
        startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        return { 
          start: new Date(startOfLastWeek.getFullYear(), startOfLastWeek.getMonth(), startOfLastWeek.getDate()),
          end: new Date(endOfLastWeek.getFullYear(), endOfLastWeek.getMonth(), endOfLastWeek.getDate(), 23, 59, 59)
        };
      }
      case 'this_month':
        return { 
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: endOfDay 
        };
      case 'last_month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        return { start: lastMonth, end: endOfLastMonth };
      }
      case 'custom':
        if (filters.custom_start_date && filters.custom_end_date) {
          return { 
            start: filters.custom_start_date, 
            end: new Date(filters.custom_end_date.getFullYear(), filters.custom_end_date.getMonth(), filters.custom_end_date.getDate(), 23, 59, 59)
          };
        }
        return null;
      default:
        return null;
    }
  };

  const fetchData = async () => {
    if (!user || !profile) {
      console.log('No user or profile found, skipping data fetch');
      return;
    }
    
    console.log('Starting to fetch prospek data...');
    setLoading(true);
    
    try {
      let query = supabase
        .from('prospek')
        .select(`
          *,
          sumber_leads:sumber_leads_id(sumber_leads),
          kode_ads:kode_ads_id(kode),
          layanan_assist:layanan_assist_id(layanan),
          alasan_bukan_leads:alasan_bukan_leads_id(bukan_leads),
          status_leads:status_leads_id(status_leads),
          tipe_faskes:tipe_faskes_id(tipe_faskes),
          pic_leads:pic_leads_id(full_name)
        `, { count: 'exact' });

      console.log('User role:', profile?.role);

      // Role-based filtering
      if (profile?.role !== 'admin') {
        query = query.eq('created_by', user.id);
      }

      // Search filter
      if (searchQuery) {
        query = query.or(`nama_prospek.ilike.%${searchQuery}%,no_whatsapp.ilike.%${searchQuery}%,nama_faskes.ilike.%${searchQuery}%`);
      }

      // Multi-select filters
      if (filters.sumber_leads.length > 0) {
        query = query.in('sumber_leads_id', filters.sumber_leads);
      }
      if (filters.kode_ads.length > 0) {
        query = query.in('kode_ads_id', filters.kode_ads);
      }
      if (filters.layanan_assist.length > 0) {
        query = query.in('layanan_assist_id', filters.layanan_assist);
      }
      if (filters.status_leads.length > 0) {
        query = query.in('status_leads_id', filters.status_leads);
      }

      // Date range filter
      const dateRange = getDateRange();
      if (dateRange) {
        query = query
          .gte('tanggal_prospek', format(dateRange.start, 'yyyy-MM-dd'))
          .lte('tanggal_prospek', format(dateRange.end, 'yyyy-MM-dd'));
      }

      // Pagination
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      
      console.log('Executing query with pagination:', { from, to });
      
      const { data: prospekData, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      console.log('Query result:', { data: prospekData, error, count });

      if (error) {
        console.error('Error fetching prospek data:', error);
        toast.error(`Gagal mengambil data prospek: ${error.message}`);
      } else {
        console.log('Successfully fetched prospek data:', prospekData?.length, 'records');
        setData(prospekData || []);
        setPagination(prev => ({ ...prev, total: count || 0 }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus prospek ini?')) return;
    
    try {
      const { error } = await supabase
        .from('prospek')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Prospek berhasil dihapus');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting prospek:', error);
      toast.error(`Gagal menghapus prospek: ${error.message}`);
    }
  };

  const handleShowDetail = (prospek: any) => {
    setSelectedDetailProspek(prospek);
    setIsDetailDialogOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      sumber_leads: [],
      kode_ads: [],
      layanan_assist: [],
      status_leads: [],
      date_range: '',
      custom_start_date: null,
      custom_end_date: null,
    });
    setSearchQuery('');
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  if (!user || !profile) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center">
            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
            <p>Loading user data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Data Prospek</CardTitle>
          <Button onClick={onOpenForm}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Prospek
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari prospek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filter
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Sumber Leads</label>
                <Select
                  value={filters.sumber_leads.length > 0 ? 'selected' : ''}
                  onValueChange={(value) => {
                    if (value && value !== 'selected') {
                      setFilters(prev => ({
                        ...prev,
                        sumber_leads: prev.sumber_leads.includes(value) 
                          ? prev.sumber_leads.filter(id => id !== value)
                          : [...prev.sumber_leads, value]
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sumber leads" />
                  </SelectTrigger>
                  <SelectContent>
                    {masterData.sumberLeads.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.sumber_leads}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Status Leads</label>
                <Select
                  value={filters.status_leads.length > 0 ? 'selected' : ''}
                  onValueChange={(value) => {
                    if (value && value !== 'selected') {
                      setFilters(prev => ({
                        ...prev,
                        status_leads: prev.status_leads.includes(value) 
                          ? prev.status_leads.filter(id => id !== value)
                          : [...prev.status_leads, value]
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status leads" />
                  </SelectTrigger>
                  <SelectContent>
                    {masterData.statusLeads.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.status_leads}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Rentang Waktu</label>
                <Select
                  value={filters.date_range}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, date_range: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih rentang waktu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hari ini</SelectItem>
                    <SelectItem value="yesterday">Kemarin</SelectItem>
                    <SelectItem value="this_week">Minggu ini</SelectItem>
                    <SelectItem value="last_week">Minggu lalu</SelectItem>
                    <SelectItem value="this_month">Bulan ini</SelectItem>
                    <SelectItem value="last_month">Bulan kemarin</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filters.date_range === 'custom' && (
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.custom_start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.custom_start_date ? format(filters.custom_start_date, "dd/MM/yyyy") : "Dari"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.custom_start_date}
                        onSelect={(date) => setFilters(prev => ({ ...prev, custom_start_date: date }))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.custom_end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.custom_end_date ? format(filters.custom_end_date, "dd/MM/yyyy") : "Sampai"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.custom_end_date}
                        onSelect={(date) => setFilters(prev => ({ ...prev, custom_end_date: date }))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Tanggal Prospek</TableHead>
                  <TableHead>Nama Prospek</TableHead>
                  <TableHead>No. WhatsApp</TableHead>
                  <TableHead>Sumber Leads</TableHead>
                  <TableHead>Kode Ads</TableHead>
                  <TableHead>Status Leads</TableHead>
                  <TableHead>Tanggal Perubahan Status</TableHead>
                  <TableHead>Nama Faskes</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>PIC</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length > 0 ? (
                  data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {format(new Date(row.created_at), "dd/MM/yyyy HH:mm", { locale: id })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(row.tanggal_prospek), "dd/MM/yyyy", { locale: id })}
                      </TableCell>
                      <TableCell>{row.nama_prospek}</TableCell>
                      <TableCell>{row.no_whatsapp}</TableCell>
                      <TableCell>{row.sumber_leads?.sumber_leads || '-'}</TableCell>
                      <TableCell>{row.kode_ads?.kode || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {row.status_leads?.status_leads || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.tanggal_perubahan_status_leads 
                          ? format(new Date(row.tanggal_perubahan_status_leads), "dd/MM/yyyy HH:mm", { locale: id })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{row.nama_faskes}</TableCell>
                      <TableCell>{row.kota}, {row.provinsi_nama}</TableCell>
                      <TableCell>{row.pic_leads?.full_name || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowDetail(row)}
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateStatus(row)}
                            title="Update Status"
                          >
                            <RefreshCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(row)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {profile?.role === 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(row.id)}
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                      Tidak ada data prospek
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => setPagination(prev => ({ ...prev, pageSize: parseInt(value), page: 1 }))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {pagination.page} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page <= 1}
                >
                  <span className="sr-only">Go to previous page</span>
                  ←
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                  disabled={pagination.page >= totalPages}
                >
                  <span className="sr-only">Go to next page</span>
                  →
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <ProspekDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        prospek={selectedDetailProspek}
      />
    </>
  );
};
