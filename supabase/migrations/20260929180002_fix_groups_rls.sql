-- Permite que o criador do grupo veja os dados do grupo recém-criado 
-- antes de ser adicionado à tabela group_members
CREATE POLICY "Users can view groups they created" 
  ON groups FOR SELECT USING (auth.uid() = created_by);
