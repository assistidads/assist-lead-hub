
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Plus, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Column {
  key: string;
  label: string;
}

interface MasterDataTableProps {
  tableName: string;
  title: string;
  columns: Column[];
  onAdd: () => void;
  onEdit: (data: any) => void;
  refreshTrigger: number;
}

const MasterDataTable: React.FC<MasterDataTableProps> = ({
  tableName,
  title,
  columns,
  onAdd,
  onEdit,
  refreshTrigger,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [tableName, refreshTrigger, user]);

  const fetchData = async () => {
    console.log(`Fetching data for table: ${tableName}`);
    setLoading(true);
    
    try {
      const { data: tableData, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      console.log(`Data for ${tableName}:`, { data: tableData, error });

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        toast.error(`Gagal mengambil data ${title}: ${error.message}`);
        setData([]);
      } else {
        console.log(`Successfully fetched ${tableName} data:`, tableData?.length, 'records');
        setData(tableData || []);
      }
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      toast.error(`Terjadi kesalahan saat mengambil data ${title}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data ${title} ini?`)) return;
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`Data ${title} berhasil dihapus`);
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error(`Error deleting ${tableName}:`, error);
      toast.error(`Gagal menghapus data ${title}: ${error.message}`);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <p>Silakan login untuk melihat data master</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
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
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                data.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {row[column.key] || '-'}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(row)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8">
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

export default MasterDataTable;
