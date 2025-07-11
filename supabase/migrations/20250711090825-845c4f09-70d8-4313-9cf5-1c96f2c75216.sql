-- Update RLS policies for kode_ads to allow CS users to view and admins to manage
DROP POLICY IF EXISTS "Admin can manage kode_ads" ON public.kode_ads;

-- Allow CS users to view kode_ads
CREATE POLICY "CS can view kode_ads" 
ON public.kode_ads 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'cs_support')
));

-- Allow admin users to manage kode_ads
CREATE POLICY "Admin can manage kode_ads" 
ON public.kode_ads 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));