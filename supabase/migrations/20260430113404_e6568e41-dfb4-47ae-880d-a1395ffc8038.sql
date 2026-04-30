
ALTER TABLE public.letters
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_letters_category ON public.letters(category);
CREATE INDEX IF NOT EXISTS idx_letters_public_created ON public.letters(is_public, created_at DESC);
