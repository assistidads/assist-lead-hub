
import { useAuth } from '@/contexts/AuthContext';

export default function Master() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="text-center p-8">
        <p className="text-lg font-medium">Akses Ditolak</p>
        <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Master</h2>
        <p className="text-muted-foreground">
          Kelola master data sistem
        </p>
      </div>

      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        <p className="text-lg">Data Master akan ditampilkan di sini</p>
        <p className="text-sm mt-2">CRUD untuk sumber leads, kode ads, layanan assist, dll.</p>
      </div>
    </div>
  );
}
