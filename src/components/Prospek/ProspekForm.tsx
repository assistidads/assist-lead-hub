import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';

import { toast } from 'sonner';

const formSchema = z.object({
  tanggal_prospek: z.string(),
  nama_prospek: z.string().min(2, {
    message: 'Nama Prospek harus lebih dari 2 karakter.',
  }),
  no_whatsapp: z.string().min(10, {
    message: 'Nomor WhatsApp harus lebih dari 10 karakter.',
  }),
  status_leads: z.enum(['prospek', 'leads', 'bukan_leads', 'dihubungi']).default('prospek'),
  nama_faskes: z.string().min(2, {
    message: 'Nama Faskes harus lebih dari 2 karakter.',
  }),
  tipe_faskes: z.string(),
  kota: z.string(),
  provinsi_nama: z.string(),
  sumber_leads_id: z.string(),
  kode_ads_id: z.string().optional(),
  layanan_assist_id: z.string(),
  alasan_bukan_leads_id: z.string().optional(),
  pic_leads_id: z.string(),
});

interface ProspekFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  sumberLeadsOptions: { value: string; label: string }[];
  kodeAdsOptions: { value: string; label: string }[];
  layananAssistOptions: { value: string; label: string }[];
  alasanBukanLeadsOptions: { value: string; label: string }[];
  picLeadsOptions: { value: string; label: string }[];
}

export const ProspekForm: React.FC<ProspekFormProps> = ({
  onSubmit,
  sumberLeadsOptions,
  kodeAdsOptions,
  layananAssistOptions,
  alasanBukanLeadsOptions,
  picLeadsOptions,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tanggal_prospek: new Date().toISOString().split('T')[0],
      nama_prospek: '',
      no_whatsapp: '',
      status_leads: 'prospek',
      nama_faskes: '',
      tipe_faskes: '',
      kota: '',
      provinsi_nama: '',
      sumber_leads_id: '',
      kode_ads_id: '',
      layanan_assist_id: '',
      alasan_bukan_leads_id: '',
      pic_leads_id: '',
    },
  });

  

  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // Call the onSubmit prop to handle the form submission logic
      onSubmit(values);

      // Reset the form after successful submission
      form.reset();
      toast.success('Prospek berhasil ditambahkan!');
    } catch (error: any) {
      console.error('Error adding prospek:', error);
      toast.error(`Gagal menambahkan prospek: ${error.message || 'Terjadi kesalahan.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Prospek Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
              name="nama_prospek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Prospek</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Prospek" {...field} />
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
                    <Input placeholder="Nomor WhatsApp" {...field} />
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
                        <SelectValue placeholder="Pilih status" />
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
            <FormField
              control={form.control}
              name="nama_faskes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Faskes</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Faskes" {...field} />
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
                  <FormControl>
                    <Input placeholder="Tipe Faskes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kota</FormLabel>
                  <FormControl>
                    <Input placeholder="Kota" {...field} />
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
                    <Input placeholder="Provinsi" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih sumber leads" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sumberLeadsOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="kode_ads_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Ads</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kode ads" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {kodeAdsOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
                        <SelectValue placeholder="Pilih layanan assist" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {layananAssistOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
                      {alasanBukanLeadsOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="pic_leads_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIC Leads</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih PIC" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {picLeadsOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Menambahkan...' : 'Tambah Prospek'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
