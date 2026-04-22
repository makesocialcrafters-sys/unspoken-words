
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_in_feed_default boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_weekly_reminder boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_letter_heart boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_product_updates boolean NOT NULL DEFAULT false;
