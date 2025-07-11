-- Remove the problematic check constraint that's causing errors
ALTER TABLE public.prospek DROP CONSTRAINT IF EXISTS check_id_ads_range;