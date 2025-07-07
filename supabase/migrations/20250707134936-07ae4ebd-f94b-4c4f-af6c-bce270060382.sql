
-- Update tabel profiles untuk menambah role advertiser
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE text,
ALTER COLUMN role SET DEFAULT 'cs_support';

-- Update constraint untuk role baru
COMMENT ON COLUMN public.profiles.role IS 'Role dapat berupa admin, cs_support, atau advertiser';

-- Buat tabel untuk master data
CREATE TABLE public.layanan_assist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layanan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.kode_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT kode_ads_kode_length CHECK (length(kode) <= 4)
);

CREATE TABLE public.sumber_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sumber_leads TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.tipe_faskes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipe_faskes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.status_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_leads TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.alasan_bukan_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bukan_leads TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Buat tabel prospek dengan foreign keys yang benar
CREATE TABLE public.prospek (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal_prospek DATE NOT NULL,
  nama_prospek TEXT NOT NULL,
  no_whatsapp TEXT NOT NULL,
  status_leads_id UUID REFERENCES public.status_leads(id),
  nama_faskes TEXT NOT NULL,
  tipe_faskes_id UUID REFERENCES public.tipe_faskes(id),
  kota TEXT NOT NULL,
  provinsi_nama TEXT NOT NULL,
  sumber_leads_id UUID REFERENCES public.sumber_leads(id),
  kode_ads_id UUID REFERENCES public.kode_ads(id),
  layanan_assist_id UUID REFERENCES public.layanan_assist(id),
  alasan_bukan_leads_id UUID REFERENCES public.alasan_bukan_leads(id),
  pic_leads_id UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS untuk semua tabel master
ALTER TABLE public.layanan_assist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kode_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sumber_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipe_faskes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alasan_bukan_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospek ENABLE ROW LEVEL SECURITY;

-- Policies untuk admin bisa akses semua master data
CREATE POLICY "Admin can manage layanan_assist" ON public.layanan_assist FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can manage kode_ads" ON public.kode_ads FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can manage sumber_leads" ON public.sumber_leads FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can manage tipe_faskes" ON public.tipe_faskes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can manage status_leads" ON public.status_leads FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can manage alasan_bukan_leads" ON public.alasan_bukan_leads FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies untuk prospek - user bisa akses data mereka sendiri, admin bisa akses semua
CREATE POLICY "Users can manage own prospek" ON public.prospek FOR ALL TO authenticated USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert data default untuk status leads
INSERT INTO public.status_leads (status_leads) VALUES 
('prospek'),
('leads'),
('bukan_leads'),
('dihubungi');
