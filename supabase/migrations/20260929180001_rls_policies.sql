-- ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;

-- FUNCTION: is_group_member
-- Security Definer to bypass infinite recursion and speed up queries
CREATE OR REPLACE FUNCTION public.is_group_member(check_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = check_group_id 
    AND profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Groups Policies
CREATE POLICY "Users can view their groups" 
  ON groups FOR SELECT USING (is_group_member(id));
CREATE POLICY "Users can create groups" 
  ON groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update groups" 
  ON groups FOR UPDATE USING (
    EXISTS (SELECT 1 FROM group_members WHERE group_id = groups.id AND profile_id = auth.uid() AND role = 'admin')
  );

-- 3. Group Members Policies
CREATE POLICY "Users can view members of their groups" 
  ON group_members FOR SELECT USING (is_group_member(group_id));

-- 4. Spaces Policies
CREATE POLICY "Users can view spaces of their groups" 
  ON spaces FOR SELECT USING (is_group_member(group_id));
CREATE POLICY "Group members can create spaces" 
  ON spaces FOR INSERT WITH CHECK (is_group_member(group_id));

-- 5. Tasks Policies
CREATE POLICY "Users can view tasks in their spaces" 
  ON tasks FOR SELECT USING (
    is_group_member((SELECT group_id FROM spaces WHERE id = tasks.space_id))
  );
CREATE POLICY "Users can insert tasks in their spaces" 
  ON tasks FOR INSERT WITH CHECK (
    is_group_member((SELECT group_id FROM spaces WHERE id = tasks.space_id))
  );
CREATE POLICY "Users can update tasks in their spaces" 
  ON tasks FOR UPDATE USING (
    is_group_member((SELECT group_id FROM spaces WHERE id = tasks.space_id))
  );
