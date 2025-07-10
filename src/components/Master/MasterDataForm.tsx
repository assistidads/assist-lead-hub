
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MasterDataFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: string;
  title: string;
  fields: { key: string; label: string; required: boolean }[];
  editData?: any;
  onSuccess: () => void;
}

type TableNames = 'sumber_leads' | 'kode_ads' | 'layanan_assist' | 'status_leads' | 'alasan_bukan_leads' | 'tipe_faskes' | 'profiles';

export const MasterDataForm: React.FC<MasterDataFormProps> = ({
  open,
  onOpenChange,
  table,
  title,
  fields,
  editData,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editData) {
        const data: Record<string, string> = {};
        fields.forEach(field => {
          data[field.key] = editData[field.key] || '';
        });
        setFormData(data);
      } else {
        const data: Record<string, string> = {};
        fields.forEach(field => {
          data[field.key] = '';
        });
        setFormData(data);
      }
    }
  }, [open, editData, fields]);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log(`Submitting ${table} form:`, formData);

      // Validate required fields
      for (const field of fields) {
        if (field.required && !formData[field.key]?.trim()) {
          toast.error(`${field.label} harus diisi`);
          return;
        }
      }

      // Prepare data for insertion/update
      const dataToSubmit = { ...formData };

      if (editData) {
        const { data, error } = await supabase
          .from(table as TableNames)
          .update(dataToSubmit)
          .eq('id', editData.id)
          .select();
        
        console.log(`Update ${table} result:`, { data, error });
        if (error) throw error;
        toast.success(`${title} berhasil diperbarui!`);
      } else {
        const { data, error } = await supabase
          .from(table as TableNames)
          .insert([dataToSubmit])
          .select();
        
        console.log(`Insert ${table} result:`, { data, error });
        if (error) throw error;
        toast.success(`${title} berhasil ditambahkan!`);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(`Error saving ${table}:`, error);
      toast.error(`Gagal menyimpan ${title}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editData ? `Edit ${title}` : `Tambah ${title} Baru`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id={field.key}
                value={formData[field.key] || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                placeholder={`Masukkan ${field.label.toLowerCase()}`}
                required={field.required}
              />
            </div>
          ))}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : (editData ? 'Perbarui' : 'Simpan')} {title}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
