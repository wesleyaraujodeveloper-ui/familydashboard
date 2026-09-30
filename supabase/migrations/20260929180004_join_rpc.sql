-- Função Segura para um usuário entrar em um grupo usando o ID do Grupo (Convite)
-- Usamos SECURITY DEFINER para que a função consiga inserir o membro 
-- mesmo que as regras normais de RLS (que exigem ser admin) tentem bloquear.
CREATE OR REPLACE FUNCTION public.join_group_by_id(p_group_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- 1. Verifica se o grupo realmente existe
  SELECT EXISTS(SELECT 1 FROM groups WHERE id = p_group_id) INTO v_exists;
  
  IF NOT v_exists THEN
    RAISE EXCEPTION 'Código de convite inválido ou grupo não encontrado.';
  END IF;

  -- 2. Insere o usuário atual como 'member' na tabela group_members
  -- ON CONFLICT DO NOTHING evita erro se ele já for membro
  INSERT INTO group_members (group_id, profile_id, role)
  VALUES (p_group_id, auth.uid(), 'member')
  ON CONFLICT (group_id, profile_id) DO NOTHING;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
