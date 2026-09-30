-- 1. Permite que quem CRIOU o grupo possa se adicionar na tabela group_members
CREATE POLICY "Group creators can insert members" 
  ON group_members FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM groups WHERE id = group_id AND created_by = auth.uid())
  );
  
-- 2. Permite que Admins do grupo possam convidar/adicionar novos membros no futuro
CREATE POLICY "Admins can insert members" 
  ON group_members FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.profile_id = auth.uid() AND gm.role = 'admin')
  );

-- 3. Permite que quem CRIOU o grupo possa criar os primeiros espaços (Mural, Meu Dia)
CREATE POLICY "Group creators can insert spaces" 
  ON spaces FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM groups WHERE id = group_id AND created_by = auth.uid())
  );
