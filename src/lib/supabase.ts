
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Mock data untuk development - nanti akan diganti dengan koneksi real Supabase
const supabaseUrl = 'https://demo.supabase.co';
const supabaseKey = 'demo-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Mock data untuk development
export const mockProspekData = [
  {
    id: '1',
    tanggal_prospek: '2024-01-15',
    nama_prospek: 'Budi Santoso',
    no_whatsapp: '081234567890',
    status_leads: 'leads' as const,
    nama_faskes: 'RS Mitra Keluarga',
    tipe_faskes: 'Rumah Sakit',
    kota: 'Jakarta',
    provinsi_nama: 'DKI Jakarta',
    sumber_leads_id: '1',
    layanan_assist_id: '1',
    pic_leads_id: '1',
    created_by: '1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    tanggal_prospek: '2024-01-14',
    nama_prospek: 'Siti Nurhaliza',
    no_whatsapp: '081987654321',
    status_leads: 'prospek' as const,
    nama_faskes: 'Klinik Sehat Sentosa',
    tipe_faskes: 'Klinik',
    kota: 'Bandung',
    provinsi_nama: 'Jawa Barat',
    sumber_leads_id: '2',
    layanan_assist_id: '2',
    pic_leads_id: '1',
    created_by: '1',
    created_at: '2024-01-14T14:30:00Z',
    updated_at: '2024-01-14T14:30:00Z',
  },
  {
    id: '3',
    tanggal_prospek: '2024-01-13',
    nama_prospek: 'Ahmad Rahman',
    no_whatsapp: '081555666777',
    status_leads: 'bukan_leads' as const,
    nama_faskes: 'Puskesmas Cilandak',
    tipe_faskes: 'Puskesmas',
    kota: 'Jakarta Selatan',
    provinsi_nama: 'DKI Jakarta',
    sumber_leads_id: '1',
    layanan_assist_id: '1',
    alasan_bukan_leads_id: '1',
    pic_leads_id: '1',
    created_by: '1',
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T09:15:00Z',
  },
];

export const mockMasterData = {
  sumberLeads: [
    { id: '1', nama: 'Meta Ads', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '2', nama: 'Google Ads', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '3', nama: 'Referral', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  ],
  layananAssist: [
    { id: '1', nama: 'Konsultasi Umum', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '2', nama: 'Specialist Referral', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  ],
  alasanBukanLeads: [
    { id: '1', alasan: 'Tidak sesuai target', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '2', alasan: 'Budget tidak mencukupi', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  ],
};
