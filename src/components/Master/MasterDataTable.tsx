
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { toast } from 'sonner';

interface MasterDataTableProps {
  table: string;
  title: string;
  onAdd: () => void;
  onEdit: (item: any) => void;
  refreshTrigger: number;
}

type TableNames = 'sumber_leads' | 'kode_ads' | 'layanan_assist' | 'status_leads' | 'alasan_bukan_leads' | 'tipe_faskes';

export const MasterDataTable: React.FC<MasterDataTableProps> = ({
  table,
  title,
  onAdd,
  onEdit,
  refreshTrigger,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    fetchData();
  }, [table, refreshTrigger]);

  const fetchData = async () => {
    console.log(`Fetching data for table: ${table}`);
    setLoading(true);
    
    try {
      const { data: result, error } = await supabase
        .from(table as TableNames)
        .select('*')
        .order('created_at', { ascending: false });

      console.log(`${table} fetch result:`, { result, error });

      if (error) {
        console.error(`Error fetching ${table}:`, error);
        toast.error(`Gagal mengambil data ${title}: ${error.message}`);
      } else {
        console.log(`Successfully fetched ${result?.length || 0} records for ${table}`);
        setData(result || []);
      }
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      toast.error(`Terjadi kesalahan saat mengambil data ${title}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data ini?`)) return;
    
    try {
      const { error } = await supabase
        .from(table as TableNames)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`Data ${title} berhasil dihapus`);
      fetchData();
    } catch (error: any) {
      console.error(`Error deleting ${table}:`, error);
      toast.error(`Gagal menghapus data: ${error.message}`);
    }
  };

  const getDisplayValue = (item: any) => {
    const keys = Object.keys(item).filter(key => !['id', 'created_at', 'updated_at'].includes(key));
    return keys.map(key => item[key]).join(' - ');
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{title}</CardTitle>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah {title}
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {getDisplayValue(item)}
                    </TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Tidak ada data {title.toLowerCase()}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
