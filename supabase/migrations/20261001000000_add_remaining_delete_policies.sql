-- Adicionando políticas de exclusão que estavam faltando para os demais containers

-- Spaces: Membros do grupo podem deletar espaços
CREATE POLICY "Users can delete spaces in their groups" 
  ON spaces FOR DELETE USING (
    public.is_group_member(group_id)
  );

-- Group Members: Membros podem remover outros membros ou sair
CREATE POLICY "Users can delete group_members in their groups" 
  ON group_members FOR DELETE USING (
    public.is_group_member(group_id)
  );

-- Groups: Membros podem deletar grupos inteiros (a cascata fará o resto)
CREATE POLICY "Users can delete groups they belong to" 
  ON groups FOR DELETE USING (
    public.is_group_member(id)
  );

-- List Items: Membros do grupo dono da lista podem deletar itens
CREATE POLICY "Users can delete list_items in their spaces" 
  ON list_items FOR DELETE USING (
    public.is_group_member((SELECT s.group_id FROM spaces s JOIN lists l ON l.space_id = s.id WHERE l.id = list_items.list_id))
  );

-- Comments: O próprio autor pode deletar ou membros do grupo
CREATE POLICY "Users can delete comments in their groups" 
  ON comments FOR DELETE USING (
    profile_id = auth.uid()
  );

-- Task Assignees:
CREATE POLICY "Users can delete task_assignees in their spaces" 
  ON task_assignees FOR DELETE USING (
    public.is_group_member((SELECT s.group_id FROM spaces s JOIN tasks t ON t.space_id = s.id WHERE t.id = task_assignees.task_id))
  );
