-- Tabela de Auditoria e Log de Atividades (Etapa 12)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL, 
  entity_title TEXT NOT NULL, -- e.g. "Fazer compras"
  action TEXT NOT NULL, -- 'created', 'completed', 'deleted', 'commented'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_group ON public.activities(group_id);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities of their group"
ON public.activities FOR SELECT
USING (
  public.is_group_member(group_id)
);

CREATE POLICY "Users can insert activities in their group"
ON public.activities FOR INSERT
WITH CHECK (
  public.is_group_member(group_id)
);
