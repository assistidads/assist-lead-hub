
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Prospek } from '@/types/database';
import { mockMasterData } from '@/lib/supabase';

const prospekSchema = z.object({
  tanggal_prospek: z.string().min(1, 'Tanggal prospek wajib diisi'),
  nama_prospek: z.string().min(1, 'Nama prospek wajib diisi'),
  no_whatsapp: z.string().min(10, 'Nomor WhatsApp tidak valid'),
  status_leads: z.enum(['prospek', 'leads', 'bukan_leads', 'dihubungi']),
  nama_faskes: z.string().min(1, 'Nama faskes wajib diisi'),
  tipe_faskes: z.string().min(1, 'Tipe faskes wajib diisi'),
  kota: z.string().min(1, 'Kota wajib diisi'),
  provinsi_nama: z.string().min(1, 'Provinsi wajib diisi'),
  sumber_leads_id: z.string().min(1, 'Sumber leads wajib dipilih'),
  layanan_assist_id: z.string().min(1, 'Layanan assist wajib dipilih'),
  alasan_bukan_leads_id: z.string().optional(),
});

type ProspekFormData = z.infer<typeof prospekSchema>;

interface ProspekFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProspekFormData) => void;
  prospek?: Prospek | null;
  mode: 'create' | 'edit';
}

export function ProspekForm({ isOpen, onClose, onSubmit, prospek, mode }: ProspekFormProps) {
  const form = useForm<ProspekFormData>({
    resolver: zodResolver(prospekSchema),
    defaultValues: {
      tanggal_prospek: prospek?.tanggal_prospek || new Date().toISOString().split('T')[0],
      nama_prospek: prospek?.nama_prospek || '',
      no_whatsapp: prospek?.no_whatsapp || '',
      status_leads: prospek?.status_leads || 'prospek',
      nama_faskes: prospek?.nama_faskes || '',
      tipe_faskes: prospek?.tipe_faskes || '',
      kota: prospek?.kota || '',
      provinsi_nama: prospek?.provinsi_nama || '',
      sumber_leads_id: prospek?.sumber_leads_id || '',
      layanan_assist_id: prospek?.layanan_assist_id || '',
      alasan_bukan_leads_id: prospek?.alasan_bukan_leads_id || '',
    },
  });

  const statusLeads = form.watch('status_leads');

  const handleSubmit = (data: ProspekFormData) => {
    onSubmit(data);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tambah Prospek Baru' : 'Edit Prospek'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Isi form di bawah untuk menambah prospek baru'
              : 'Edit informasi prospek'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tanggal_prospek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Prospek</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status_leads"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Leads</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status leads" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="prospek">Prospek</SelectItem>
                        <SelectItem value="leads">Leads</SelectItem>
                        <SelectItem value="bukan_leads">Bukan Leads</SelectItem>
                        <SelectItem value="dihubungi">Dihubungi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nama_prospek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Prospek</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama prospek" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="no_whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="081234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nama_faskes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Faskes</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama fasilitas kesehatan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipe_faskes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Faskes</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe faskes" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Rumah Sakit">Rumah Sakit</SelectItem>
                        <SelectItem value="Klinik">Klinik</SelectItem>
                        <SelectItem value="Puskesmas">Puskesmas</SelectItem>
                        <SelectItem value="Praktik Dokter">Praktik Dokter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kota</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama kota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="provinsi_nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provinsi</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama provinsi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sumber_leads_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sumber Leads</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sumber leads" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockMasterData.sumberLeads.map((sumber) => (
                          <SelectItem key={sumber.id} value={sumber.id}>
                            {sumber.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="layanan_assist_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Layanan Assist</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih layanan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockMasterData.layananAssist.map((layanan) => (
                          <SelectItem key={layanan.id} value={layanan.id}>
                            {layanan.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {statusLeads === 'bukan_leads' && (
              <FormField
                control={form.control}
                name="alasan_bukan_leads_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alasan Bukan Leads</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih alasan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockMasterData.alasanBukanLeads.map((alasan) => (
                          <SelectItem key={alasan.id} value={alasan.id}>
                            {alasan.alasan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit">
                {mode === 'create' ? 'Tambah' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
