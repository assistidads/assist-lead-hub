
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

      // Special handling for profiles table
      if (table === 'profiles') {
        if (!editData && formData.password) {
          // Create new user with Supabase auth
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: formData.email,
            password: formData.password,
            email_confirm: true,
            user_metadata: {
              full_name: formData.full_name,
              role: formData.role
            }
          });

          if (authError) throw authError;

          toast.success(`${title} berhasil ditambahkan!`);
          onSuccess();
          onOpenChange(false);
          return;
        }
      }

      // Prepare data for insertion/update
      const dataToSubmit = { ...formData };
      if (table === 'profiles') {
        delete dataToSubmit.password; // Remove password from profile updates
      }

      if (editData) {
        // Use any type to bypass TypeScript checking for dynamic table names
        const { data, error } = await (supabase as any)
          .from(table)
          .update(dataToSubmit)
          .eq('id', editData.id)
          .select();
        
        console.log(`Update ${table} result:`, { data, error });
        if (error) throw error;
        toast.success(`${title} berhasil diperbarui!`);
      } else {
        // Use any type to bypass TypeScript checking for dynamic table names
        const { data, error } = await (supabase as any)
          .from(table)
          .insert(dataToSubmit)
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
              {field.key === 'role' && table === 'profiles' ? (
                <Select 
                  value={formData[field.key] || ''} 
                  onValueChange={(value) => handleInputChange(field.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cs_support">CS Support</SelectItem>
                  </SelectContent>
                </Select>
              ) : field.key === 'password' ? (
                <Input
                  id={field.key}
                  type="password"
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={editData ? 'Kosongkan jika tidak ingin mengubah password' : 'Masukkan password'}
                  required={!editData && field.required}
                />
              ) : (
                <Input
                  id={field.key}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={`Masukkan ${field.label.toLowerCase()}`}
                  required={field.required}
                />
              )}
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
