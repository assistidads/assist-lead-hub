
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';

export default function Prospek() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Prospek</h2>
          <p className="text-muted-foreground">
            Kelola data prospek dan leads Anda
          </p>
        </div>
        <Button>
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

      {/* Placeholder for Prospek Table */}
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        <p className="text-lg">Tabel Data Prospek akan ditampilkan di sini</p>
        <p className="text-sm mt-2">Fitur CRUD, filtering, dan pagination akan diimplementasi selanjutnya</p>
      </div>
    </div>
  );
}
