
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { Prospek } from '@/types/database';
import { mockProspekData, mockMasterData } from '@/lib/supabase';

interface ProspekTableProps {
  searchQuery: string;
  onEdit: (prospek: Prospek) => void;
  onDelete: (id: string) => void;
}

export function ProspekTable({ searchQuery, onEdit, onDelete }: ProspekTableProps) {
  const [prospekData] = useState(mockProspekData);

  const filteredData = prospekData.filter(prospek =>
    prospek.nama_prospek.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prospek.no_whatsapp.includes(searchQuery) ||
    prospek.nama_faskes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'leads':
        return 'default';
      case 'prospek':
        return 'secondary';
      case 'bukan_leads':
        return 'destructive';
      case 'dihubungi':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'leads':
        return 'Leads';
      case 'prospek':
        return 'Prospek';
      case 'bukan_leads':
        return 'Bukan Leads';
      case 'dihubungi':
        return 'Dihubungi';
      default:
        return status;
    }
  };

  const getSumberLeadsName = (id: string) => {
    return mockMasterData.sumberLeads.find(s => s.id === id)?.nama || 'Unknown';
  };

  const getLayananAssistName = (id: string) => {
    return mockMasterData.layananAssist.find(l => l.id === id)?.nama || 'Unknown';
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nama Prospek</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Nama Faskes</TableHead>
            <TableHead>Tipe Faskes</TableHead>
            <TableHead>Kota</TableHead>
            <TableHead>Sumber</TableHead>
            <TableHead>Layanan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((prospek) => (
            <TableRow key={prospek.id}>
              <TableCell>{new Date(prospek.tanggal_prospek).toLocaleDateString('id-ID')}</TableCell>
              <TableCell className="font-medium">{prospek.nama_prospek}</TableCell>
              <TableCell>{prospek.no_whatsapp}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(prospek.status_leads)}>
                  {getStatusLabel(prospek.status_leads)}
                </Badge>
              </TableCell>
              <TableCell>{prospek.nama_faskes}</TableCell>
              <TableCell>{prospek.tipe_faskes}</TableCell>
              <TableCell>{prospek.kota}</TableCell>
              <TableCell>{getSumberLeadsName(prospek.sumber_leads_id)}</TableCell>
              <TableCell>{getLayananAssistName(prospek.layanan_assist_id)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(prospek)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDelete(prospek.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {filteredData.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <p>Tidak ada data prospek yang ditemukan</p>
        </div>
      )}
    </div>
  );
}
