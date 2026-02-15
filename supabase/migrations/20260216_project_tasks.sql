-- ============================================================================
-- PROJECT TASKS
-- General-purpose task management for projects
-- Used by TasksPage.jsx — supports categories, priorities, checklists, assignments
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Task info
  title TEXT NOT NULL,
  description TEXT,
  task_number TEXT,

  -- Categorization
  category TEXT DEFAULT 'construction' CHECK (
    category IN ('construction', 'sales', 'admin', 'finance', 'legal', 'other')
  ),
  priority TEXT DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  ),
  status TEXT DEFAULT 'todo' CHECK (
    status IN ('todo', 'in-progress', 'completed', 'cancelled', 'blocked')
  ),
  tags TEXT[] DEFAULT '{}',

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_name TEXT,

  -- Dates
  due_date DATE,
  completed_date DATE,
  created_date DATE DEFAULT CURRENT_DATE,

  -- Checklist (stored as JSONB array)
  -- Format: [{ "text": "Call inspector", "done": true }, ...]
  checklist JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON project_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_project_tasks_category ON project_tasks(category);
CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON project_tasks(priority);

-- RLS
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can manage project_tasks" ON project_tasks;
  CREATE POLICY "Authenticated users can manage project_tasks"
    ON project_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

-- Auto-update timestamp
DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate task number
CREATE OR REPLACE FUNCTION generate_task_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(REPLACE(task_number, 'TSK-', '') AS INTEGER)), 0) + 1
  INTO next_num
  FROM project_tasks
  WHERE project_id = NEW.project_id;

  NEW.task_number := 'TSK-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_task_number ON project_tasks;
CREATE TRIGGER set_task_number BEFORE INSERT ON project_tasks
  FOR EACH ROW WHEN (NEW.task_number IS NULL)
  EXECUTE FUNCTION generate_task_number();

GRANT ALL ON project_tasks TO authenticated;
