
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'cs_support';
  created_at: string;
  updated_at: string;
}

export interface Prospek {
  id: string;
  tanggal_prospek: string;
  nama_prospek: string;
  no_whatsapp: string;
  status_leads: 'prospek' | 'leads' | 'bukan_leads' | 'dihubungi';
  nama_faskes: string;
  tipe_faskes: string;
  kota: string;
  provinsi_nama: string;
  sumber_leads_id: string;
  kode_ads_id?: string;
  layanan_assist_id: string;
  alasan_bukan_leads_id?: string;
  pic_leads_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SumberLeads {
  id: string;
  nama: string;
  created_at: string;
  updated_at: string;
}

export interface KodeAds {
  id: string;
  kode: string;
  created_at: string;
  updated_at: string;
}

export interface LayananAssist {
  id: string;
  nama: string;
  created_at: string;
  updated_at: string;
}

export interface AlasanBukanLeads {
  id: string;
  alasan: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  total_prospek: number;
  total_leads: number;
  total_bukan_leads: number;
  conversion_rate: number;
}
