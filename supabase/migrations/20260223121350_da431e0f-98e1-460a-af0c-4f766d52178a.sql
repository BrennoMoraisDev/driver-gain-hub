
CREATE TABLE public.daily_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  shift_session_id uuid REFERENCES public.shift_sessions(id),
  -- Plataformas
  uber_rides integer DEFAULT 0,
  uber_amount float DEFAULT 0,
  ninety_nine_rides integer DEFAULT 0,
  ninety_nine_amount float DEFAULT 0,
  indrive_rides integer DEFAULT 0,
  indrive_amount float DEFAULT 0,
  private_rides integer DEFAULT 0,
  private_amount float DEFAULT 0,
  -- Totais
  total_faturamento float DEFAULT 0,
  km_total float DEFAULT 0,
  -- Gastos variáveis
  gasto_combustivel float DEFAULT 0,
  gasto_alimentacao float DEFAULT 0,
  gasto_outros float DEFAULT 0,
  total_gastos_variaveis float DEFAULT 0,
  -- Provisões e lucro
  lucro_bruto float DEFAULT 0,
  provisao_ipva_diaria float DEFAULT 0,
  provisao_manutencao_diaria float DEFAULT 0,
  provisao_seguro_diaria float DEFAULT 0,
  custo_financiamento_diario float DEFAULT 0,
  lucro_liquido float DEFAULT 0,
  media_hora_liquida float DEFAULT 0,
  tempo_ativo_segundos integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_records_user_id ON public.daily_records(user_id);
CREATE INDEX idx_daily_records_date ON public.daily_records(date);

ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily records"
  ON public.daily_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily records"
  ON public.daily_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily records"
  ON public.daily_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily records"
  ON public.daily_records FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_records_updated_at
  BEFORE UPDATE ON public.daily_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
