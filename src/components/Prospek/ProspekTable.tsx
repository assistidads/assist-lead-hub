
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Prospek } from '@/types/database';

interface ProspekTableProps {
  onEdit: (prospek: Prospek) => void;
  onDelete: (id: string) => void;
  onOpenForm: () => void;
  searchQuery?: string;
}

export const ProspekTable: React.FC<ProspekTableProps> = ({ onEdit, onDelete, onOpenForm, searchQuery }) => {
  const [data, setData] = useState<Prospek[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data: prospekData, error } = await supabase
          .from('prospek')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching prospek data:', error);
        } else {
          setData(prospekData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredData = data.filter(row => 
    searchQuery ? row.nama_prospek.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Prospek Data</CardTitle>
        <Button onClick={onOpenForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Prospek
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Tanggal</TableHead>
                <TableHead>Nama Prospek</TableHead>
                <TableHead>No. WhatsApp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Faskes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.tanggal_prospek}</TableCell>
                    <TableCell>{row.nama_prospek}</TableCell>
                    <TableCell>{row.no_whatsapp}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Prospek</Badge>
                    </TableCell>
                    <TableCell>{row.nama_faskes}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(row.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No data</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProspekTable;
