
-- Tabela subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  kiwify_transaction_id text UNIQUE,
  status text NOT NULL DEFAULT 'active',
  plan_type text DEFAULT 'premium',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Tabela kiwify_events (log de eventos)
CREATE TABLE public.kiwify_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  error_log text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_kiwify_events_event_id ON public.kiwify_events(event_id);
CREATE INDEX idx_kiwify_events_processed ON public.kiwify_events(processed);

ALTER TABLE public.kiwify_events ENABLE ROW LEVEL SECURITY;

-- Nenhum usuário comum acessa kiwify_events (apenas service_role)
-- Não criamos policies permissivas = bloqueio total para anon/authenticated
