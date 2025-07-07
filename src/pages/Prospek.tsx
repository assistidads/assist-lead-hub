import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { ProspekTable } from '@/components/Prospek/ProspekTable';
import { ProspekForm } from '@/components/Prospek/ProspekForm';
import type { Prospek } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export default function Prospek() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProspek, setSelectedProspek] = useState<Prospek | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();

  const handleAddProspek = () => {
    setSelectedProspek(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEditProspek = (prospek: Prospek) => {
    setSelectedProspek(prospek);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteProspek = (id: string) => {
    // Implementasi delete - untuk saat ini hanya menampilkan toast
    console.log('Delete prospek:', id);
    toast({
      title: "Prospek dihapus",
      description: "Data prospek berhasil dihapus",
    });
  };

  const handleFormSubmit = (data: any) => {
    // Implementasi submit form - untuk saat ini hanya menampilkan toast
    console.log('Form submitted:', data);
    toast({
      title: formMode === 'create' ? "Prospek ditambahkan" : "Prospek diperbarui",
      description: `Data prospek berhasil ${formMode === 'create' ? 'ditambahkan' : 'diperbarui'}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Prospek</h2>
          <p className="text-muted-foreground">
            Kelola data prospek dan leads Anda
          </p>
        </div>
        <Button onClick={handleAddProspek}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Prospek
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari prospek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Prospek Table */}
      <ProspekTable
        searchQuery={searchQuery}
        onEdit={handleEditProspek}
        onDelete={handleDeleteProspek}
        onOpenForm={handleAddProspek}
      />
    </div>
  );
}
