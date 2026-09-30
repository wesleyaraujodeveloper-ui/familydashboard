-- Adiciona coluna de imagem em todas as tabelas de conteúdo (Etapa 10)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS image_url TEXT;
-- Para lists_items ou lists, vamos colocar no header da list por enquanto
ALTER TABLE public.lists ADD COLUMN IF NOT EXISTS image_url TEXT;
