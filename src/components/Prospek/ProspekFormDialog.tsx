
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIndonesiaRegions } from '@/hooks/useIndonesiaRegions';
import { toast } from 'sonner';
import type { Prospek } from '@/types/database';

const formSchema = z.object({
  tanggal_prospek: z.date({
    required_error: 'Tanggal prospek harus dipilih.',
  }),
  nama_prospek: z.string().min(2, 'Nama prospek harus diisi minimal 2 karakter.'),
  no_whatsapp: z.string().min(10, 'Nomor WhatsApp harus diisi minimal 10 karakter.'),
  status_leads_id: z.string().min(1, 'Status leads harus dipilih.'),
  nama_faskes: z.string().min(2, 'Nama faskes harus diisi minimal 2 karakter.'),
  tipe_faskes_id: z.string().min(1, 'Tipe faskes harus dipilih.'),
  kota: z.string().min(1, 'Kota harus dipilih.'),
  provinsi_nama: z.string().min(1, 'Provinsi harus dipilih.'),
  sumber_leads_id: z.string().min(1, 'Sumber leads harus dipilih.'),
  kode_ads_id: z.string().optional(),
  id_ads: z.string().optional(),
  layanan_assist_id: z.string().min(1, 'Layanan assist harus dipilih.'),
  alasan_bukan_leads_id: z.string().optional(),
  keterangan_bukan_leads: z.string().optional(),
  pic_leads_id: z.string().optional(),
});

interface ProspekFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospek?: Prospek | null;
  onSuccess: () => void;
}

export const ProspekFormDialog: React.FC<ProspekFormDialogProps> = ({
  open,
  onOpenChange,
  prospek,
  onSuccess,
}) => {
  const { user, profile } = useAuth();
  const { provinces, cities, fetchCitiesByProvince } = useIndonesiaRegions();
  
  const [masterData, setMasterData] = useState({
    sumberLeads: [] as any[],
    kodeAds: [] as any[],
    layananAssist: [] as any[],
    alasanBukanLeads: [] as any[],
    statusLeads: [] as any[],
    tipeFaskes: [] as any[],
    profiles: [] as any[],
  });

  const [selectedSumberLeads, setSelectedSumberLeads] = useState<string>('');
  const [showAdsFields, setShowAdsFields] = useState(false);
  const [selectedStatusLeads, setSelectedStatusLeads] = useState<string>('');
  const [showBukanLeadsFields, setShowBukanLeadsFields] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tanggal_prospek: new Date(),
      nama_prospek: '',
      no_whatsapp: '',
      status_leads_id: '',
      nama_faskes: '',
      tipe_faskes_id: '',
      kota: '',
      provinsi_nama: '',
      sumber_leads_id: '',
      kode_ads_id: '',
      id_ads: '',
      layanan_assist_id: '',
      alasan_bukan_leads_id: '',
      keterangan_bukan_leads: '',
      pic_leads_id: profile?.role === 'admin' ? '' : user?.id || '',
    },
  });

  const fetchMasterData = async () => {
    try {
      console.log('Fetching master data...');
      
      const [
        sumberLeadsRes,
        kodeAdsRes,
        layananAssistRes,
        alasanBukanLeadsRes,
        statusLeadsRes,
        tipeFaskesRes,
        profilesRes
      ] = await Promise.all([
        supabase.from('sumber_leads').select('*').order('sumber_leads'),
        supabase.from('kode_ads').select('*').order('kode'),
        supabase.from('layanan_assist').select('*').order('layanan'),
        supabase.from('alasan_bukan_leads').select('*').order('bukan_leads'),
        supabase.from('status_leads').select('*').order('status_leads'),
        supabase.from('tipe_faskes').select('*').order('tipe_faskes'),
        supabase.from('profiles').select('id, full_name, role').order('full_name')
      ]);

      console.log('Master data responses:', {
        sumberLeads: sumberLeadsRes,
        kodeAds: kodeAdsRes,
        layananAssist: layananAssistRes,
        alasanBukanLeads: alasanBukanLeadsRes,
        statusLeads: statusLeadsRes,
        tipeFaskes: tipeFaskesRes,
        profiles: profilesRes
      });

      if (sumberLeadsRes.error) console.error('Sumber leads error:', sumberLeadsRes.error);
      if (kodeAdsRes.error) console.error('Kode ads error:', kodeAdsRes.error);
      if (layananAssistRes.error) console.error('Layanan assist error:', layananAssistRes.error);
      if (alasanBukanLeadsRes.error) console.error('Alasan bukan leads error:', alasanBukanLeadsRes.error);
      if (statusLeadsRes.error) console.error('Status leads error:', statusLeadsRes.error);
      if (tipeFaskesRes.error) console.error('Tipe faskes error:', tipeFaskesRes.error);
      if (profilesRes.error) console.error('Profiles error:', profilesRes.error);

      const newMasterData = {
        sumberLeads: sumberLeadsRes.data || [],
        kodeAds: kodeAdsRes.data || [],
        layananAssist: layananAssistRes.data || [],
        alasanBukanLeads: alasanBukanLeadsRes.data || [],
        statusLeads: statusLeadsRes.data || [],
        tipeFaskes: tipeFaskesRes.data || [],
        profiles: profilesRes.data || [],
      };
      
      setMasterData(newMasterData);
      return newMasterData;
    } catch (error) {
      console.error('Error fetching master data:', error);
      toast.error('Gagal mengambil data master');
      return masterData;
    }
  };

  useEffect(() => {
    if (open) {
      fetchMasterData().then((masterDataResult) => {
        if (prospek) {
          console.log('Setting form values for edit mode:', prospek);
          
          // Set form values for editing
          const formValues = {
            tanggal_prospek: new Date(prospek.tanggal_prospek),
            nama_prospek: prospek.nama_prospek || '',
            no_whatsapp: prospek.no_whatsapp || '',
            status_leads_id: prospek.status_leads_id || '',
            nama_faskes: prospek.nama_faskes || '',
            tipe_faskes_id: prospek.tipe_faskes_id || '',
            kota: prospek.kota || '',
            provinsi_nama: prospek.provinsi_nama || '',
            sumber_leads_id: prospek.sumber_leads_id || '',
            kode_ads_id: prospek.kode_ads_id || '',
            id_ads: prospek.id_ads || '',
            layanan_assist_id: prospek.layanan_assist_id || '',
            alasan_bukan_leads_id: prospek.alasan_bukan_leads_id || '',
            keterangan_bukan_leads: prospek.keterangan_bukan_leads || '',
            pic_leads_id: prospek.pic_leads_id || '',
          };
          
          // Reset form with new values
          form.reset(formValues);
          
          // Set state variables for conditional fields
          setSelectedSumberLeads(prospek.sumber_leads_id || '');
          setSelectedStatusLeads(prospek.status_leads_id || '');
          
          // Handle conditional field visibility
          if (prospek.sumber_leads_id) {
            const selectedSource = masterDataResult.sumberLeads.find(s => s.id === prospek.sumber_leads_id);
            if (selectedSource) {
              const containsAds = selectedSource.sumber_leads.toLowerCase().includes('ads');
              setShowAdsFields(containsAds);
            }
          }
          
          if (prospek.status_leads_id) {
            const selectedStatus = masterDataResult.statusLeads.find(s => s.id === prospek.status_leads_id);
            if (selectedStatus) {
              const isBukanLeads = selectedStatus.status_leads.toLowerCase().includes('bukan leads');
              setShowBukanLeadsFields(isBukanLeads);
            }
          }
          
          // Load cities for the selected province
          if (prospek.provinsi_nama) {
            const province = provinces.find(p => p.name === prospek.provinsi_nama);
            if (province) {
              fetchCitiesByProvince(province.id);
            }
          }
        } else {
          // Reset form for new entry
          form.reset({
            tanggal_prospek: new Date(),
            nama_prospek: '',
            no_whatsapp: '',
            status_leads_id: '',
            nama_faskes: '',
            tipe_faskes_id: '',
            kota: '',
            provinsi_nama: '',
            sumber_leads_id: '',
            kode_ads_id: '',
            id_ads: '',
            layanan_assist_id: '',
            alasan_bukan_leads_id: '',
            keterangan_bukan_leads: '',
            pic_leads_id: profile?.role === 'admin' ? '' : user?.id || '',
          });
          
          setSelectedSumberLeads('');
          setSelectedStatusLeads('');
          setShowAdsFields(false);
          setShowBukanLeadsFields(false);
        }
      });
    }
  }, [open, prospek, form, profile, user, provinces]);

  const handleSumberLeadsChange = (value: string) => {
    if (!value) return; // Prevent empty string values
    
    setSelectedSumberLeads(value);
    form.setValue('sumber_leads_id', value);
    
    const selectedSource = masterData.sumberLeads.find(s => s.id === value);
    const containsAds = selectedSource?.sumber_leads.toLowerCase().includes('ads');
    setShowAdsFields(containsAds);
    
    if (!containsAds) {
      form.setValue('kode_ads_id', '');
      form.setValue('id_ads', '');
    }
  };

  const handleStatusLeadsChange = (value: string) => {
    if (!value) return; // Prevent empty string values
    
    setSelectedStatusLeads(value);
    form.setValue('status_leads_id', value);
    
    const selectedStatus = masterData.statusLeads.find(s => s.id === value);
    const isBukanLeads = selectedStatus?.status_leads.toLowerCase().includes('bukan leads');
    setShowBukanLeadsFields(isBukanLeads);
    
    if (!isBukanLeads) {
      form.setValue('alasan_bukan_leads_id', '');
      form.setValue('keterangan_bukan_leads', '');
    }
  };

  const handleProvinceChange = (provinceName: string) => {
    if (!provinceName) return; // Prevent empty string values
    
    form.setValue('provinsi_nama', provinceName);
    form.setValue('kota', '');
    
    const province = provinces.find(p => p.name === provinceName);
    if (province) {
      fetchCitiesByProvince(province.id);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      console.log('Submitting form with values:', values);
      
      const prospekData = {
        tanggal_prospek: format(values.tanggal_prospek, 'yyyy-MM-dd'),
        nama_prospek: values.nama_prospek,
        no_whatsapp: values.no_whatsapp,
        status_leads_id: values.status_leads_id,
        nama_faskes: values.nama_faskes,
        tipe_faskes_id: values.tipe_faskes_id,
        kota: values.kota,
        provinsi_nama: values.provinsi_nama,
        sumber_leads_id: values.sumber_leads_id,
        kode_ads_id: values.kode_ads_id || null,
        id_ads: values.id_ads || null,
        layanan_assist_id: values.layanan_assist_id,
        alasan_bukan_leads_id: values.alasan_bukan_leads_id || null,
        keterangan_bukan_leads: values.keterangan_bukan_leads || null,
        pic_leads_id: values.pic_leads_id || user?.id,
        created_by: user?.id,
      };

      console.log('Prepared prospek data:', prospekData);

      if (prospek) {
        const { data, error } = await supabase
          .from('prospek')
          .update(prospekData)
          .eq('id', prospek.id)
          .select();
        
        console.log('Update result:', { data, error });
        if (error) throw error;
        toast.success('Prospek berhasil diperbarui!');
      } else {
        const { data, error } = await supabase
          .from('prospek')
          .insert([prospekData])
          .select();
        
        console.log('Insert result:', { data, error });
        if (error) throw error;
        toast.success('Prospek berhasil ditambahkan!');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving prospek:', error);
      toast.error(`Gagal menyimpan prospek: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {prospek ? 'Edit Prospek' : 'Tambah Prospek Baru'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tanggal_prospek"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Prospek Masuk</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: id })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nama_prospek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Prospek</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Prospek" {...field} autoComplete="off" />
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
                    <FormLabel>No WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="No WhatsApp" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sumber_leads_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sumber Leads</FormLabel>
                    <Select onValueChange={handleSumberLeadsChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sumber leads" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {masterData.sumberLeads.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.sumber_leads}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showAdsFields && (
                <>
                  <FormField
                    control={form.control}
                    name="kode_ads_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Ads</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kode ads" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {masterData.kodeAds.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.kode}
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
                    name="id_ads"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Ads</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih ID ads" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i === 0 ? 'Form' : i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="status_leads_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Leads</FormLabel>
                    <Select onValueChange={handleStatusLeadsChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status leads" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {masterData.statusLeads.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.status_leads}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showBukanLeadsFields && (
                <>
                  <FormField
                    control={form.control}
                    name="alasan_bukan_leads_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bukan Leads</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih alasan bukan leads" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {masterData.alasanBukanLeads.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.bukan_leads}
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
                    name="keterangan_bukan_leads"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keterangan Bukan Leads</FormLabel>
                        <FormControl>
                          <Input placeholder="Keterangan bukan leads" {...field} autoComplete="off" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="layanan_assist_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Layanan Assist</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih layanan assist" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {masterData.layananAssist.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.layanan}
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
                name="nama_faskes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Faskes</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Faskes" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipe_faskes_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Faskes</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe faskes" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {masterData.tipeFaskes.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.tipe_faskes}
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
                name="provinsi_nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provinsi</FormLabel>
                    <Select onValueChange={handleProvinceChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih provinsi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.id} value={province.name}>
                            {province.name}
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
                name="kota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kota/Kabupaten</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kota/kabupaten" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {profile?.role === 'admin' && (
                <FormField
                  control={form.control}
                  name="pic_leads_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIC Leads</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih PIC" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {masterData.profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.full_name} ({profile.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : (prospek ? 'Perbarui' : 'Simpan')} Prospek
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
