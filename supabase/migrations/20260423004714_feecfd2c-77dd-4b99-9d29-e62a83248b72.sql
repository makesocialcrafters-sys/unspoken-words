-- Letters table
CREATE TABLE public.letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient TEXT,
  content TEXT NOT NULL,
  ai_response TEXT,
  mood_tags TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own letters
CREATE POLICY "Users can view their own letters"
ON public.letters FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone authenticated can view public letters"
ON public.letters FOR SELECT
TO authenticated
USING (is_public = true);

CREATE POLICY "Users can insert their own letters"
ON public.letters FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own letters"
ON public.letters FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own letters"
ON public.letters FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_letters_public_created ON public.letters (is_public, created_at DESC);
CREATE INDEX idx_letters_user ON public.letters (user_id, created_at DESC);
CREATE INDEX idx_letters_recipient ON public.letters (recipient);

CREATE TRIGGER update_letters_updated_at
BEFORE UPDATE ON public.letters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  letter_id UUID NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, letter_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see likes on public letters (so we can show counts), and own likes
CREATE POLICY "Authenticated can view likes"
ON public.likes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can like (insert their own)"
ON public.likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike (delete their own)"
ON public.likes FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_likes_letter ON public.likes (letter_id);
CREATE INDEX idx_likes_user ON public.likes (user_id);

-- View for like counts per letter (public letters only)
CREATE OR REPLACE VIEW public.letter_like_counts
WITH (security_invoker = true)
AS
SELECT
  l.id AS letter_id,
  COUNT(lk.id)::int AS like_count
FROM public.letters l
LEFT JOIN public.likes lk ON lk.letter_id = l.id
WHERE l.is_public = true
GROUP BY l.id;