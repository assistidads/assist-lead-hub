
-- Add policy to allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);
