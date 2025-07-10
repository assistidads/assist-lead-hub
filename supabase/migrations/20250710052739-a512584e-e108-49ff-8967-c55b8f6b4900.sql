
-- Menambahkan kolom yang diperlukan ke tabel prospek
ALTER TABLE public.prospek 
ADD COLUMN IF NOT EXISTS id_ads TEXT,
ADD COLUMN IF NOT EXISTS keterangan_bukan_leads TEXT,
ADD COLUMN IF NOT EXISTS tanggal_perubahan_status_leads TIMESTAMP WITH TIME ZONE;

-- Menambah constraint untuk validasi id_ads (0-30)
ALTER TABLE public.prospek 
ADD CONSTRAINT check_id_ads_range 
CHECK (id_ads IS NULL OR (id_ads ~ '^[0-9]+$' AND id_ads::INTEGER BETWEEN 0 AND 30));

-- Update struktur untuk mendukung foreign key relationships yang sudah ada
-- Pastikan foreign key constraints sudah ada
DO $$ 
BEGIN
    -- Add foreign key constraints if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'prospek_sumber_leads_id_fkey'
    ) THEN
        ALTER TABLE public.prospek 
        ADD CONSTRAINT prospek_sumber_leads_id_fkey 
        FOREIGN KEY (sumber_leads_id) REFERENCES public.sumber_leads(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'prospek_kode_ads_id_fkey'
    ) THEN
        ALTER TABLE public.prospek 
        ADD CONSTRAINT prospek_kode_ads_id_fkey 
        FOREIGN KEY (kode_ads_id) REFERENCES public.kode_ads(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'prospek_layanan_assist_id_fkey'
    ) THEN
        ALTER TABLE public.prospek 
        ADD CONSTRAINT prospek_layanan_assist_id_fkey 
        FOREIGN KEY (layanan_assist_id) REFERENCES public.layanan_assist(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'prospek_alasan_bukan_leads_id_fkey'
    ) THEN
        ALTER TABLE public.prospek 
        ADD CONSTRAINT prospek_alasan_bukan_leads_id_fkey 
        FOREIGN KEY (alasan_bukan_leads_id) REFERENCES public.alasan_bukan_leads(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'prospek_status_leads_id_fkey'
    ) THEN
        ALTER TABLE public.prospek 
        ADD CONSTRAINT prospek_status_leads_id_fkey 
        FOREIGN KEY (status_leads_id) REFERENCES public.status_leads(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'prospek_tipe_faskes_id_fkey'
    ) THEN
        ALTER TABLE public.prospek 
        ADD CONSTRAINT prospek_tipe_faskes_id_fkey 
        FOREIGN KEY (tipe_faskes_id) REFERENCES public.tipe_faskes(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'prospek_pic_leads_id_fkey'
    ) THEN
        ALTER TABLE public.prospek 
        ADD CONSTRAINT prospek_pic_leads_id_fkey 
        FOREIGN KEY (pic_leads_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- Trigger untuk update tanggal_perubahan_status_leads ketika status_leads_id berubah
CREATE OR REPLACE FUNCTION update_status_change_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika status_leads_id berubah, update tanggal_perubahan_status_leads
    IF OLD.status_leads_id IS DISTINCT FROM NEW.status_leads_id THEN
        NEW.tanggal_perubahan_status_leads = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger jika sudah ada, lalu buat ulang
DROP TRIGGER IF EXISTS trigger_update_status_change_date ON public.prospek;
CREATE TRIGGER trigger_update_status_change_date
    BEFORE UPDATE ON public.prospek
    FOR EACH ROW
    EXECUTE FUNCTION update_status_change_date();
