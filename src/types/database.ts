
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      prospek: {
        Row: Prospek;
        Insert: Omit<Prospek, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Prospek, 'id' | 'created_at' | 'updated_at'>>;
      };
      sumber_leads: {
        Row: SumberLeads;
        Insert: Omit<SumberLeads, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SumberLeads, 'id' | 'created_at' | 'updated_at'>>;
      };
      kode_ads: {
        Row: KodeAds;
        Insert: Omit<KodeAds, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<KodeAds, 'id' | 'created_at' | 'updated_at'>>;
      };
      layanan_assist: {
        Row: LayananAssist;
        Insert: Omit<LayananAssist, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LayananAssist, 'id' | 'created_at' | 'updated_at'>>;
      };
      alasan_bukan_leads: {
        Row: AlasanBukanLeads;
        Insert: Omit<AlasanBukanLeads, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AlasanBukanLeads, 'id' | 'created_at' | 'updated_at'>>;
      };
      status_leads: {
        Row: StatusLeads;
        Insert: Omit<StatusLeads, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<StatusLeads, 'id' | 'created_at' | 'updated_at'>>;
      };
      tipe_faskes: {
        Row: TipeFaskes;
        Insert: Omit<TipeFaskes, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TipeFaskes, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'cs_support' | 'advertiser';
  created_at: string;
  updated_at: string;
}

export interface Prospek {
  id: string;
  tanggal_prospek: string;
  nama_prospek: string;
  no_whatsapp: string;
  status_leads_id: string;
  nama_faskes: string;
  tipe_faskes_id: string;
  kota: string;
  provinsi_nama: string;
  sumber_leads_id: string;
  kode_ads_id?: string;
  id_ads?: string;
  layanan_assist_id: string;
  alasan_bukan_leads_id?: string;
  keterangan_bukan_leads?: string;
  pic_leads_id: string;
  tanggal_perubahan_status_leads?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SumberLeads {
  id: string;
  sumber_leads: string;
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
  layanan: string;
  created_at: string;
  updated_at: string;
}

export interface AlasanBukanLeads {
  id: string;
  bukan_leads: string;
  created_at: string;
  updated_at: string;
}

export interface StatusLeads {
  id: string;
  status_leads: string;
  created_at: string;
  updated_at: string;
}

export interface TipeFaskes {
  id: string;
  tipe_faskes: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  total_prospek: number;
  total_leads: number;
  total_bukan_leads: number;
  conversion_rate: number;
}
