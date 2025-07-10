
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Prospek } from '@/types/database';

const formSchema = z.object({
  status_leads_id: z.string().min(1, 'Status leads harus dipilih.'),
  alasan_bukan_leads_id: z.string().optional(),
  keterangan_bukan_leads: z.string().optional(),
});

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospek: Prospek | null;
  onSuccess: () => void;
}

export const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({
  open,
  onOpenChange,
  prospek,
  onSuccess,
}) => {
  const [statusLeads, setStatusLeads] = useState<any[]>([]);
  const [alasanBukanLeads, setAlasanBukanLeads] = useState<any[]>([]);
  const [showBukanLeadsFields, setShowBukanLeadsFields] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status_leads_id: '',
      alasan_bukan_leads_id: '',
      keterangan_bukan_leads: '',
    },
  });

  useEffect(() => {
    if (open) {
      fetchMasterData();
      if (prospek) {
        form.reset({
          status_leads_id: prospek.status_leads_id || '',
          alasan_bukan_leads_id: prospek.alasan_bukan_leads_id || '',
          keterangan_bukan_leads: prospek.keterangan_bukan_leads || '',
        });
      }
    }
  }, [open, prospek, form]);

  const fetchMasterData = async () => {
    try {
      const [statusRes, alasanRes] = await Promise.all([
        supabase.from('status_leads').select('*').order('status_leads'),
        supabase.from('alasan_bukan_leads').select('*').order('bukan_leads')
      ]);

      setStatusLeads(statusRes.data || []);
      setAlasanBukanLeads(alasanRes.data || []);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const handleStatusChange = (value: string) => {
    form.setValue('status_leads_id', value);
    
    const selectedStatus = statusLeads.find(s => s.id === value);
    const isBukanLeads = selectedStatus?.status_leads.toLowerCase().includes('bukan leads');
    setShowBukanLeadsFields(isBukanLeads);
    
    if (!isBukanLeads) {
      form.setValue('alasan_bukan_leads_id', '');
      form.setValue('keterangan_bukan_leads', '');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!prospek) return;

    try {
      const updateData = {
        status_leads_id: values.status_leads_id,
        alasan_bukan_leads_id: values.alasan_bukan_leads_id || null,
        keterangan_bukan_leads: values.keterangan_bukan_leads || null,
      };

      const { error } = await supabase
        .from('prospek')
        .update(updateData)
        .eq('id', prospek.id);
      
      if (error) throw error;
      
      toast.success('Status prospek berhasil diperbarui!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(`Gagal memperbarui status: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Status Prospek</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status_leads_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Leads</FormLabel>
                  <Select onValueChange={handleStatusChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status leads" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusLeads.map((item) => (
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih alasan bukan leads" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {alasanBukanLeads.map((item) => (
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
                        <Input placeholder="Keterangan bukan leads" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit">
                Update Status
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
