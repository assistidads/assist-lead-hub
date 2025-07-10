
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus, Search, Eye, RotateCw } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Prospek } from '@/types/database';
import { ProspekDetailDialog } from './ProspekDetailDialog';

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
  const { user, profile } = useAuth();
  const [data, setData] = useState<Prospek[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSumber, setFilterSumber] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [masterData, setMasterData] = useState({
    statusLeads: [] as any[],
    sumberLeads: [] as any[],
    tipeFaskes: [] as any[],
    layananAssist: [] as any[],
    profiles: [] as any[],
  });
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProspek, setSelectedProspek] = useState<Prospek | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const itemsPerPage = 25;

  // Test database connection
  const testConnection = async () => {
    try {
      console.log('=== TESTING DATABASE CONNECTION ===');
      const { data: testData, error: testError } = await supabase
        .from('prospek')
        .select('count(*)', { count: 'exact', head: true });
      
      console.log('Database test result:', { testData, testError });
      
      if (testError) {
        console.error('Database connection error:', testError);
        toast.error(`Database connection error: ${testError.message}`);
        return false;
      }
      
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error('Database test failed:', error);
      return false;
    }
  };

  // Fetch master data
  const fetchMasterData = async () => {
    try {
      console.log('=== FETCHING MASTER DATA ===');
      
      const results = await Promise.allSettled([
        supabase.from('status_leads').select('*').order('status_leads'),
        supabase.from('sumber_leads').select('*').order('sumber_leads'),
        supabase.from('tipe_faskes').select('*').order('tipe_faskes'),
        supabase.from('layanan_assist').select('*').order('layanan'),
        supabase.from('profiles').select('id, full_name, role').order('full_name')
      ]);

      const newMasterData = {
        statusLeads: results[0].status === 'fulfilled' ? results[0].value.data || [] : [],
        sumberLeads: results[1].status === 'fulfilled' ? results[1].value.data || [] : [],
        tipeFaskes: results[2].status === 'fulfilled' ? results[2].value.data || [] : [],
        layananAssist: results[3].status === 'fulfilled' ? results[3].value.data || [] : [],
        profiles: results[4].status === 'fulfilled' ? results[4].value.data || [] : [],
      };

      console.log('Master data loaded:', {
        statusLeads: newMasterData.statusLeads.length,
        sumberLeads: newMasterData.sumberLeads.length,
        tipeFaskes: newMasterData.tipeFaskes.length,
        layananAssist: newMasterData.layananAssist.length,
        profiles: newMasterData.profiles.length,
      });

      setMasterData(newMasterData);
      
      // Check for failed requests
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const tables = ['status_leads', 'sumber_leads', 'tipe_faskes', 'layanan_assist', 'profiles'];
          console.error(`Failed to fetch ${tables[index]}:`, result.reason);
        }
      });

    } catch (error) {
      console.error('Error fetching master data:', error);
      toast.error('Gagal mengambil data master');
    }
  };

  const fetchData = async (page: number = 1) => {
    console.log('=== FETCH DATA START ===');
    console.log('Auth state:', { user: !!user, profile: !!profile, userId: user?.id, userRole: profile?.role });
    
    if (!user) {
      console.log('No user found, cannot fetch data');
      setDebugInfo({ error: 'No user logged in' });
      return;
    }

    setLoading(true);
    setDebugInfo({ loading: true, user: !!user, profile: !!profile });

    try {
      // Test connection first
      const connectionOk = await testConnection();
      if (!connectionOk) {
        setDebugInfo({ error: 'Database connection failed' });
        return;
      }

      console.log('Building query...');
      
      let query = supabase
        .from('prospek')
        .select('*', { count: 'exact' });

      console.log('Base query created');

      // Apply role-based filtering
      if (profile?.role !== 'admin') {
        console.log('Applying user filter for non-admin user:', user.id);
        query = query.eq('created_by', user.id);
      } else {
        console.log('Admin user - no user filtering applied');
      }

      // Apply search filter
      if (searchTerm.trim()) {
        console.log('Applying search filter:', searchTerm);
        query = query.or(`nama_prospek.ilike.%${searchTerm}%,nama_faskes.ilike.%${searchTerm}%,no_whatsapp.ilike.%${searchTerm}%`);
      }

      // Apply status filter
      if (filterStatus) {
        console.log('Applying status filter:', filterStatus);
        query = query.eq('status_leads_id', filterStatus);
      }

      // Apply sumber filter
      if (filterSumber) {
        console.log('Applying sumber filter:', filterSumber);
        query = query.eq('sumber_leads_id', filterSumber);
      }

      // Apply pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      console.log('Applying pagination:', { from, to, page, itemsPerPage });
      
      query = query
        .range(from, to)
        .order('created_at', { ascending: false });

      console.log('Executing final query...');
      const { data: prospekData, error, count } = await query;

      console.log('Query executed. Results:', { 
        dataLength: prospekData?.length || 0, 
        count, 
        error: error?.message || 'none'
      });

      if (error) {
        console.error('Database query error:', error);
        toast.error(`Database error: ${error.message}`);
        setDebugInfo({ 
          error: `Database error: ${error.message}`,
          query: 'Failed to execute query'
        });
        return;
      }

      console.log('Setting data state...');
      setData(prospekData || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

      setDebugInfo({
        success: true,
        dataCount: prospekData?.length || 0,
        totalCount: count || 0,
        currentPage: page,
        userRole: profile?.role,
        userId: user.id,
        hasFilters: {
          search: !!searchTerm,
          status: !!filterStatus,
          sumber: !!filterSumber
        }
      });

      console.log('Data fetch completed successfully');

    } catch (error: any) {
      console.error('Unexpected error in fetchData:', error);
      toast.error(`Unexpected error: ${error.message}`);
      setDebugInfo({ 
        error: `Unexpected error: ${error.message}`,
        stack: error.stack
      });
    } finally {
      setLoading(false);
      console.log('=== FETCH DATA END ===');
    }
  };

  // Initial data load
  useEffect(() => {
    console.log('=== INITIAL LOAD EFFECT ===');
    console.log('Dependencies:', { user: !!user, profile: !!profile });
    
    if (user && profile) {
      console.log('Loading initial data...');
      fetchMasterData();
      fetchData(1);
    } else {
      console.log('Waiting for user/profile...');
      setDebugInfo({ waiting: 'user or profile not ready' });
    }
  }, [user, profile]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && user && profile) {
      console.log('Refresh triggered:', refreshTrigger);
      fetchData(currentPage);
    }
  }, [refreshTrigger, currentPage, user, profile]);

  // Handle filter changes
  useEffect(() => {
    if (user && profile) {
      console.log('Filters changed, resetting to page 1');
      setCurrentPage(1);
      fetchData(1);
    }
  }, [searchTerm, filterStatus, filterSumber, user, profile]);

  // Helper functions for displaying data
  const getStatusBadge = (statusId: string) => {
    const status = masterData.statusLeads.find(s => s.id === statusId);
    if (!status) return <Badge variant="secondary">-</Badge>;
    
    const variant = status.status_leads.toLowerCase().includes('leads') ? 'default' : 
                   status.status_leads.toLowerCase().includes('prospek') ? 'secondary' : 'outline';
    
    return <Badge variant={variant}>{status.status_leads}</Badge>;
  };

  const getSumberLeads = (sumberId: string) => {
    const sumber = masterData.sumberLeads.find(s => s.id === sumberId);
    return sumber ? sumber.sumber_leads : '-';
  };

  const getTipeFaskes = (tipeId: string) => {
    const tipe = masterData.tipeFaskes.find(t => t.id === tipeId);
    return tipe ? tipe.tipe_faskes : '-';
  };

  const getLayananAssist = (layananId: string) => {
    const layanan = masterData.layananAssist.find(l => l.id === layananId);
    return layanan ? layanan.layanan : '-';
  };

  const getPicName = (picId: string) => {
    const pic = masterData.profiles.find(p => p.id === picId);
    return pic ? pic.full_name : '-';
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data prospek ini?')) {
      try {
        const { error } = await supabase
          .from('prospek')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('Data prospek berhasil dihapus');
        fetchData(currentPage);
      } catch (error: any) {
        console.error('Error deleting prospek:', error);
        toast.error(`Gagal menghapus data prospek: ${error.message}`);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page);
  };

  const handleViewDetail = (prospek: Prospek) => {
    setSelectedProspek(prospek);
    setDetailDialogOpen(true);
  };

  // Memoize pagination buttons to avoid re-renders
  const paginationButtons = useMemo(() => {
    const buttons = [];
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
          disabled={loading}
        >
          {i}
        </Button>
      );
    }

    return buttons;
  }, [currentPage, totalPages, loading]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>Data Prospek ({totalCount})</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onOpenForm} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Prospek
            </Button>
            <Button 
              onClick={() => fetchData(currentPage)} 
              size="sm" 
              variant="outline"
              disabled={loading}
            >
              <RotateCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama prospek, faskes, atau nomor WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value === "all" ? "" : value)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {masterData.statusLeads.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.status_leads}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSumber} onValueChange={(value) => setFilterSumber(value === "all" ? "" : value)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter Sumber" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sumber</SelectItem>
              {masterData.sumberLeads.map((sumber) => (
                <SelectItem key={sumber.id} value={sumber.id}>
                  {sumber.sumber_leads}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Enhanced Debug Info */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <p><strong>🔍 Debug Info:</strong></p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p><strong>Auth:</strong> {user ? '✅ Logged in' : '❌ Not logged in'}</p>
              <p><strong>Profile:</strong> {profile ? `✅ ${profile.full_name} (${profile.role})` : '❌ No profile'}</p>
              <p><strong>Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}</p>
            </div>
            <div>
              <p><strong>Data Count:</strong> {data.length}</p>
              <p><strong>Total Count:</strong> {totalCount}</p>
              <p><strong>Current Page:</strong> {currentPage}</p>
              <p><strong>Master Data:</strong> {Object.values(masterData).every(arr => arr.length > 0) ? '✅ OK' : '❌ Missing'}</p>
            </div>
          </div>
          {debugInfo.error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
              <p className="text-red-700"><strong>Error:</strong> {debugInfo.error}</p>
            </div>
          )}
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-600">Show detailed debug info</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Memuat data...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Prospek</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Status Leads</TableHead>
                    <TableHead>Tanggal Perubahan Status</TableHead>
                    <TableHead>Nama Faskes</TableHead>
                    <TableHead>Tipe Faskes</TableHead>
                    <TableHead>Kota</TableHead>
                    <TableHead>Provinsi</TableHead>
                    <TableHead>Sumber Leads</TableHead>
                    <TableHead>Layanan Assist</TableHead>
                    <TableHead>PIC</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-8">
                        {!user ? (
                          <div className="text-red-600">❌ Anda perlu login untuk melihat data</div>
                        ) : !profile ? (
                          <div className="text-yellow-600">⚠️ Profile tidak ditemukan</div>
                        ) : debugInfo.error ? (
                          <div className="text-red-600">❌ {debugInfo.error}</div>
                        ) : (
                          <div className="text-gray-500">📝 Tidak ada data prospek ditemukan</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((prospek) => (
                      <TableRow key={prospek.id}>
                        <TableCell>
                          {format(new Date(prospek.tanggal_prospek), 'dd/MM/yyyy', { locale: id })}
                        </TableCell>
                        <TableCell className="font-medium">{prospek.nama_prospek}</TableCell>
                        <TableCell>{prospek.no_whatsapp}</TableCell>
                        <TableCell>{getStatusBadge(prospek.status_leads_id || '')}</TableCell>
                        <TableCell>
                          {prospek.tanggal_perubahan_status_leads 
                            ? format(new Date(prospek.tanggal_perubahan_status_leads), 'dd/MM/yyyy HH:mm', { locale: id })
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{prospek.nama_faskes}</TableCell>
                        <TableCell>{getTipeFaskes(prospek.tipe_faskes_id || '')}</TableCell>
                        <TableCell>{prospek.kota}</TableCell>
                        <TableCell>{prospek.provinsi_nama}</TableCell>
                        <TableCell>{getSumberLeads(prospek.sumber_leads_id || '')}</TableCell>
                        <TableCell>{getLayananAssist(prospek.layanan_assist_id || '')}</TableCell>
                        <TableCell>{getPicName(prospek.pic_leads_id || '')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(prospek)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(prospek)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onUpdateStatus(prospek)}
                            >
                              <RotateCw className="w-4 h-4" />
                            </Button>
                            {(profile?.role === 'admin' || prospek.created_by === user?.id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(prospek.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || loading}
                >
                  Pertama
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Sebelumnya
                </Button>
                
                {paginationButtons}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Selanjutnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || loading}
                >
                  Terakhir
                </Button>
              </div>
            )}
          </>
        )}
        
        <ProspekDetailDialog
          prospek={selectedProspek}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          masterData={masterData}
        />
      </CardContent>
    </Card>
  );
};
