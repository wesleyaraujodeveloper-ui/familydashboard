-- Add due_date column to notices, lists, and ideas to allow scheduling them for specific days.
-- Events already have start_time, and tasks already have due_date.

ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.lists ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
