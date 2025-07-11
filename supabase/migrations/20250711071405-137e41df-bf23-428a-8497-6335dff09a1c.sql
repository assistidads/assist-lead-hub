-- Create table for ads budget tracking
CREATE TABLE public.ads_budget (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kode_ads_id UUID NOT NULL REFERENCES public.kode_ads(id) ON DELETE CASCADE,
  budget DECIMAL(15,2) NOT NULL DEFAULT 0,
  budget_spent DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for budget history
CREATE TABLE public.ads_budget_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ads_budget_id UUID NOT NULL REFERENCES public.ads_budget(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_budget_history ENABLE ROW LEVEL SECURITY;

-- Create policies for ads_budget
CREATE POLICY "Admin can manage ads_budget" 
ON public.ads_budget 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "CS can view ads_budget" 
ON public.ads_budget 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'cs_support')
));

-- Create policies for ads_budget_history
CREATE POLICY "Admin can manage ads_budget_history" 
ON public.ads_budget_history 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "CS can view ads_budget_history" 
ON public.ads_budget_history 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'cs_support')
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ads_budget_updated_at
  BEFORE UPDATE ON public.ads_budget
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;