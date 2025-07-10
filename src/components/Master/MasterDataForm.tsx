
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Field {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select';
  required?: boolean;
  maxLength?: number;
  options?: { value: string; label: string }[];
}

interface MasterDataFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tableName: string;
  title: string;
  fields: Field[];
  editData?: any;
}

const MasterDataForm: React.FC<MasterDataFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tableName,
  title,
  fields,
  editData,
}) => {
  const [loading, setLoading] = useState(false);

  // Create dynamic schema based on fields
  const createSchema = () => {
    const schemaFields: any = {};
    
    fields.forEach(field => {
      let fieldSchema;
      
      switch (field.type) {
        case 'email':
          fieldSchema = z.string();
          if (field.required) {
            fieldSchema = fieldSchema.email('Email tidak valid').min(1, `${field.label} harus diisi`);
          } else {
            fieldSchema = fieldSchema.email('Email tidak valid').optional().or(z.literal(''));
          }
          break;
        case 'password':
          fieldSchema = z.string();
          if (field.required && !editData) {
            fieldSchema = fieldSchema.min(6, 'Password minimal 6 karakter');
          } else {
            fieldSchema = fieldSchema.optional().or(z.literal(''));
          }
          break;
        default:
          fieldSchema = z.string();
          if (field.required) {
            fieldSchema = fieldSchema.min(1, `${field.label} harus diisi`);
            if (field.maxLength) {
              fieldSchema = fieldSchema.max(field.maxLength, `${field.label} maksimal ${field.maxLength} karakter`);
            }
          } else {
            fieldSchema = fieldSchema.optional().or(z.literal(''));
          }
      }
      
      schemaFields[field.key] = fieldSchema;
    });
    
    return z.object(schemaFields);
  };

  const form = useForm({
    resolver: zodResolver(createSchema()),
    defaultValues: fields.reduce((acc, field) => {
      acc[field.key] = '';
      return acc;
    }, {} as any),
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Set form values for edit mode
        const formValues: any = {};
        fields.forEach(field => {
          formValues[field.key] = editData[field.key] || '';
        });
        form.reset(formValues);
      } else {
        // Reset form for add mode
        const defaultValues: any = {};
        fields.forEach(field => {
          defaultValues[field.key] = '';
        });
        form.reset(defaultValues);
      }
    }
  }, [isOpen, editData, form, fields]);

  const onSubmit = async (values: any) => {
    setLoading(true);
    console.log(`Submitting ${tableName} form with values:`, values);
    
    try {
      // Handle special cases for profiles table
      if (tableName === 'profiles') {
        if (editData) {
          // Update existing profile
          const updateData: any = {
            full_name: values.full_name,
            email: values.email,
            role: values.role,
          };
          
          const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', editData.id)
            .select();
          
          console.log('Profile update result:', { data, error });
          if (error) throw error;
          
          // Update password if provided
          if (values.password) {
            const { error: passwordError } = await supabase.auth.admin.updateUserById(
              editData.id,
              { password: values.password }
            );
            if (passwordError) {
              console.warn('Password update failed:', passwordError);
              toast.error('Profil diperbarui tapi password gagal diubah');
            }
          }
          
          toast.success(`Data ${title} berhasil diperbarui!`);
        } else {
          // Create new profile with auth user
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: values.email,
            password: values.password,
            user_metadata: {
              full_name: values.full_name,
              role: values.role,
            }
          });
          
          console.log('Auth user creation result:', { data: authData, error: authError });
          if (authError) throw authError;
          
          toast.success(`Data ${title} berhasil ditambahkan!`);
        }
      } else {
        // Handle other tables normally
        if (editData) {
          const { data, error } = await supabase
            .from(tableName)
            .update(values)
            .eq('id', editData.id)
            .select();
          
          console.log(`${tableName} update result:`, { data, error });
          if (error) throw error;
          toast.success(`Data ${title} berhasil diperbarui!`);
        } else {
          const { data, error } = await supabase
            .from(tableName)
            .insert([values])
            .select();
          
          console.log(`${tableName} insert result:`, { data, error });
          if (error) throw error;
          toast.success(`Data ${title} berhasil ditambahkan!`);
        }
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Error saving ${tableName}:`, error);
      toast.error(`Gagal menyimpan data ${title}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editData ? `Edit ${title}` : `Tambah ${title} Baru`}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
            {fields.map((field) => (
              <FormField
                key={field.key}
                control={form.control}
                name={field.key}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      {field.type === 'select' ? (
                        <Select onValueChange={formField.onChange} value={formField.value}>
                          <SelectTrigger>
                            <SelectValue placeholder={`Pilih ${field.label.toLowerCase()}`} />
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
                          type={field.type}
                          placeholder={field.label}
                          maxLength={field.maxLength}
                          autoComplete="off"
                          {...formField}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : (editData ? 'Perbarui' : 'Simpan')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MasterDataForm;
