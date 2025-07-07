
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'select';
  options?: { value: string; label: string }[];
  maxLength?: number;
  required?: boolean;
}

interface MasterDataFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tableName: string;
  title: string;
  fields: FormField[];
  editData?: any;
}

const MasterDataForm: React.FC<MasterDataFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tableName,
  title,
  fields,
  editData
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      const initialData: Record<string, string> = {};
      fields.forEach(field => {
        initialData[field.key] = '';
      });
      setFormData(initialData);
    }
  }, [editData, fields, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (editData) {
        result = await supabase
          .from(tableName as any)
          .update(formData)
          .eq('id', editData.id);
      } else {
        result = await supabase
          .from(tableName as any)
          .insert([formData]);
      }

      if (result.error) {
        console.error('Error saving data:', result.error);
        toast({
          title: "Error",
          description: "Gagal menyimpan data",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Berhasil",
          description: `Data berhasil ${editData ? 'diperbarui' : 'ditambahkan'}`
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? `Edit ${title}` : `Tambah ${title}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === 'select' ? (
                <Select
                  value={formData[field.key] || ''}
                  onValueChange={(value) => handleInputChange(field.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Pilih ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  maxLength={field.maxLength}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MasterDataForm;
