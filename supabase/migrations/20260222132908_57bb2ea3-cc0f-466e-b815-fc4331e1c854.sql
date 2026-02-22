
CREATE TABLE public.shift_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  total_active_seconds integer NOT NULL DEFAULT 0,
  meta_acumulada double precision NOT NULL DEFAULT 0,
  paused_at timestamptz,
  is_paused boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shift_sessions_user_id ON public.shift_sessions(user_id);
CREATE INDEX idx_shift_sessions_end_time ON public.shift_sessions(end_time);

ALTER TABLE public.shift_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shifts"
  ON public.shift_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shifts"
  ON public.shift_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shifts"
  ON public.shift_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shifts"
  ON public.shift_sessions FOR DELETE
  USING (auth.uid() = user_id);
