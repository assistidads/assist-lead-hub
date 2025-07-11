-- Add last_edited_by to ads_budget table
ALTER TABLE public.ads_budget 
ADD COLUMN last_edited_by UUID REFERENCES public.profiles(id);

-- Create trigger to automatically update last_edited_by when budget_spent changes
CREATE OR REPLACE FUNCTION public.update_ads_budget_last_edited()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if budget_spent actually changed
    IF OLD.budget_spent IS DISTINCT FROM NEW.budget_spent THEN
        NEW.last_edited_by = auth.uid();
        NEW.updated_at = now();
        
        -- Insert into history table
        INSERT INTO public.ads_budget_history (ads_budget_id, amount, description)
        VALUES (NEW.id, NEW.budget_spent, 'Budget spent updated');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER trigger_update_ads_budget_last_edited
    BEFORE UPDATE ON public.ads_budget
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ads_budget_last_edited();

-- Add user_id to ads_budget_history for tracking who made the change
ALTER TABLE public.ads_budget_history 
ADD COLUMN user_id UUID REFERENCES public.profiles(id) DEFAULT auth.uid();