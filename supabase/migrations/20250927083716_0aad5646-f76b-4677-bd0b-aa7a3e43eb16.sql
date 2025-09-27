-- Create missing profile for the existing user
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'dc1ca8a1-e834-4208-bfda-517f2bc62041',
  'didit@assist.id',
  'Didit',
  'admin'
)
ON CONFLICT (id) DO NOTHING;