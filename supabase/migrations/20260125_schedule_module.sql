-- Schedule Module: schedule_templates, project_schedules, schedule_phases, schedule_tasks
-- Rule-based templated scheduling with dependency management

-- Schedule Templates (Admin module)
CREATE TABLE IF NOT EXISTS schedule_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL,
  region TEXT,

  -- Template structure (phases and tasks as JSON)
  phases JSONB NOT NULL DEFAULT '[]',

  total_duration_days INTEGER,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Schedules (one per project)
CREATE TABLE IF NOT EXISTS project_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  template_id UUID REFERENCES schedule_templates(id),

  -- Project dates
  project_start_date DATE,
  projected_end_date DATE,
  actual_end_date DATE,

  -- Status
  status TEXT DEFAULT 'draft', -- draft, active, completed, on_hold

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule Phases
CREATE TABLE IF NOT EXISTS schedule_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES project_schedules(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Calculated dates
  start_date DATE,
  end_date DATE,

  -- Progress
  percent_complete DECIMAL(5,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule Tasks
CREATE TABLE IF NOT EXISTS schedule_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES project_schedules(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES schedule_phases(id) ON DELETE CASCADE,

  -- Task info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,

  -- Duration
  duration_days INTEGER NOT NULL DEFAULT 1,
  duration_type TEXT DEFAULT 'calculated', -- fixed, calculated

  -- Dependency
  predecessor_id UUID REFERENCES schedule_tasks(id),
  predecessor_type TEXT, -- FS, SS, FF, SF
  lag_days INTEGER DEFAULT 0,

  -- Dates
  scheduled_start DATE,
  scheduled_end DATE,
  actual_start DATE,
  actual_end DATE,

  -- Date override
  fixed_date DATE,
  is_date_fixed BOOLEAN DEFAULT false,

  -- Status
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed, delayed, blocked
  percent_complete DECIMAL(5,2) DEFAULT 0,
  is_milestone BOOLEAN DEFAULT false,
  is_critical_path BOOLEAN DEFAULT false,

  -- Assignments
  assigned_to UUID,
  assigned_to_name TEXT,
  assigned_contractor_id UUID,

  -- Tracking
  notes TEXT,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schedule_templates_type ON schedule_templates(project_type);
CREATE INDEX IF NOT EXISTS idx_project_schedules_project ON project_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_schedule_phases_schedule ON schedule_phases(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_schedule ON schedule_tasks(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_phase ON schedule_tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_predecessor ON schedule_tasks(predecessor_id);

-- Function to recalculate schedule dates based on dependencies
CREATE OR REPLACE FUNCTION recalculate_schedule_dates(p_schedule_id UUID)
RETURNS VOID AS $$
DECLARE
  v_task RECORD;
  v_predecessor_end DATE;
  v_predecessor_start DATE;
  v_start_date DATE;
  v_project_start DATE;
BEGIN
  SELECT project_start_date INTO v_project_start
  FROM project_schedules WHERE id = p_schedule_id;

  IF v_project_start IS NULL THEN
    v_project_start := CURRENT_DATE;
  END IF;

  -- Process tasks without predecessors first, then with predecessors
  FOR v_task IN (
    SELECT * FROM schedule_tasks
    WHERE schedule_id = p_schedule_id
    ORDER BY
      CASE WHEN predecessor_id IS NULL THEN 0 ELSE 1 END,
      sort_order
  ) LOOP
    IF v_task.is_date_fixed AND v_task.fixed_date IS NOT NULL THEN
      v_start_date := v_task.fixed_date;
    ELSIF v_task.predecessor_id IS NOT NULL THEN
      SELECT scheduled_end, scheduled_start
      INTO v_predecessor_end, v_predecessor_start
      FROM schedule_tasks WHERE id = v_task.predecessor_id;

      IF v_predecessor_end IS NULL THEN
        v_start_date := v_project_start;
      ELSE
        CASE v_task.predecessor_type
          WHEN 'FS' THEN
            v_start_date := v_predecessor_end + v_task.lag_days;
          WHEN 'SS' THEN
            v_start_date := v_predecessor_start + v_task.lag_days;
          WHEN 'FF' THEN
            v_start_date := v_predecessor_end + v_task.lag_days - v_task.duration_days;
          WHEN 'SF' THEN
            v_start_date := v_predecessor_start + v_task.lag_days - v_task.duration_days;
          ELSE
            v_start_date := v_predecessor_end + v_task.lag_days;
        END CASE;
      END IF;
    ELSE
      v_start_date := v_project_start;
    END IF;

    UPDATE schedule_tasks
    SET scheduled_start = v_start_date,
        scheduled_end = v_start_date + duration_days
    WHERE id = v_task.id;
  END LOOP;

  -- Update projected end date
  UPDATE project_schedules
  SET projected_end_date = (
    SELECT MAX(scheduled_end) FROM schedule_tasks WHERE schedule_id = p_schedule_id
  ),
  updated_at = NOW()
  WHERE id = p_schedule_id;

  -- Update phase dates
  UPDATE schedule_phases sp
  SET start_date = sub.min_start,
      end_date = sub.max_end
  FROM (
    SELECT phase_id, MIN(scheduled_start) AS min_start, MAX(scheduled_end) AS max_end
    FROM schedule_tasks
    WHERE schedule_id = p_schedule_id
    GROUP BY phase_id
  ) sub
  WHERE sp.id = sub.phase_id;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedule_templates_select" ON schedule_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_templates_insert" ON schedule_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_templates_update" ON schedule_templates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_templates_delete" ON schedule_templates FOR DELETE TO authenticated USING (true);

CREATE POLICY "project_schedules_select" ON project_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "project_schedules_insert" ON project_schedules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "project_schedules_update" ON project_schedules FOR UPDATE TO authenticated USING (true);
CREATE POLICY "project_schedules_delete" ON project_schedules FOR DELETE TO authenticated USING (true);

CREATE POLICY "schedule_phases_select" ON schedule_phases FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_phases_insert" ON schedule_phases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_phases_update" ON schedule_phases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_phases_delete" ON schedule_phases FOR DELETE TO authenticated USING (true);

CREATE POLICY "schedule_tasks_select" ON schedule_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_tasks_insert" ON schedule_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schedule_tasks_update" ON schedule_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "schedule_tasks_delete" ON schedule_tasks FOR DELETE TO authenticated USING (true);
