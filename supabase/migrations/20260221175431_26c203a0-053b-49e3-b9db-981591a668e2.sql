
-- 1. Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2. user_settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  meta_mensal DOUBLE PRECISION NOT NULL DEFAULT 0,
  dias_trabalho_mes INTEGER NOT NULL DEFAULT 22,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  valor_fipe DOUBLE PRECISION NOT NULL DEFAULT 0,
  ipva_vencimento DATE,
  manutencao_mensal_est DOUBLE PRECISION,
  seguro_mensal_est DOUBLE PRECISION,
  financiamento_mensal DOUBLE PRECISION,
  incluir_ipva BOOLEAN NOT NULL DEFAULT true,
  incluir_manutencao BOOLEAN NOT NULL DEFAULT true,
  incluir_seguro BOOLEAN NOT NULL DEFAULT true,
  incluir_financiamento BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vehicle"
ON public.vehicles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicle"
ON public.vehicles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicle"
ON public.vehicles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicle"
ON public.vehicles FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
