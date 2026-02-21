
-- Add subscription columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plano text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS status_assinatura text,
  ADD COLUMN IF NOT EXISTS data_expiracao timestamptz;

-- Update the trigger function to set plan based on email
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email = 'brennomoraisdev@gmail.com' THEN
    INSERT INTO public.profiles (user_id, name, email, plano, status_assinatura, data_expiracao)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', ''),
      NEW.email,
      'premium',
      'active',
      NULL
    );
  ELSE
    INSERT INTO public.profiles (user_id, name, email, plano, status_assinatura, data_expiracao)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', ''),
      NEW.email,
      'premium',
      'trial',
      now() + interval '3 days'
    );
  END IF;
  RETURN NEW;
END;
$function$;
