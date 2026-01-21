-- Atlas Real Estate Development - Project Templates Schema
-- Created: 2026-01-21
-- Purpose: Allow org Super Admins to create project templates with predefined
--          folder structures, schedules, budgets, tasks, milestones, and teams

-- ============================================================================
-- PROJECT TEMPLATES (Main template configuration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT, -- e.g., 'residential', 'commercial', 'mixed-use', 'land-development'
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Default project settings
  default_status TEXT DEFAULT 'planning',
  estimated_duration_days INTEGER,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_templates_org ON project_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_templates_type ON project_templates(project_type);
CREATE INDEX IF NOT EXISTS idx_project_templates_active ON project_templates(is_active);

-- Ensure only one default template per organization per project type
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_templates_default
  ON project_templates(organization_id, project_type)
  WHERE is_default = true;

-- ============================================================================
-- PROJECT TEMPLATE FOLDERS (Custom folder structure)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES project_template_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Folder settings
  is_required BOOLEAN DEFAULT true,
  default_permissions TEXT DEFAULT 'team', -- 'team', 'admin-only', 'public'

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_folders_template ON project_template_folders(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_folders_parent ON project_template_folders(parent_folder_id);

-- ============================================================================
-- PROJECT TEMPLATE PHASES (For schedule)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Duration settings (relative to project start or previous phase)
  duration_days INTEGER,
  offset_days INTEGER DEFAULT 0, -- Days after project start or previous phase
  depends_on_phase_id UUID REFERENCES project_template_phases(id) ON DELETE SET NULL,

  -- Display settings
  color TEXT DEFAULT '#3B82F6',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_phases_template ON project_template_phases(template_id);

-- ============================================================================
-- PROJECT TEMPLATE MILESTONES
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_template_phases(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Timing (relative to phase start or project start)
  offset_days INTEGER DEFAULT 0,
  is_critical BOOLEAN DEFAULT false,

  -- Notification settings
  notify_days_before INTEGER DEFAULT 7,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_milestones_template ON project_template_milestones(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_milestones_phase ON project_template_milestones(phase_id);

-- ============================================================================
-- PROJECT TEMPLATE TASKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_template_phases(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES project_template_milestones(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES project_template_tasks(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Task settings
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_hours DECIMAL(10,2),
  duration_days INTEGER,
  offset_days INTEGER DEFAULT 0,

  -- Assignment settings (role-based, actual assignment happens on project creation)
  assigned_role TEXT, -- 'project-manager', 'architect', 'contractor', etc.

  -- Dependencies
  depends_on_task_id UUID REFERENCES project_template_tasks(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_tasks_template ON project_template_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_tasks_phase ON project_template_tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_project_template_tasks_milestone ON project_template_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_project_template_tasks_parent ON project_template_tasks(parent_task_id);

-- ============================================================================
-- PROJECT TEMPLATE BUDGET CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  parent_category_id UUID REFERENCES project_template_budget_categories(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  code TEXT, -- e.g., '01', '01.1', etc.
  sort_order INTEGER DEFAULT 0,

  -- Budget settings
  is_contingency BOOLEAN DEFAULT false,
  default_percentage DECIMAL(5,2), -- For contingency or percentage-based items

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_budget_categories_template ON project_template_budget_categories(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_budget_categories_parent ON project_template_budget_categories(parent_category_id);

-- ============================================================================
-- PROJECT TEMPLATE BUDGET LINE ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  category_id UUID REFERENCES project_template_budget_categories(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,
  code TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Budget settings
  unit TEXT, -- 'SF', 'LF', 'EA', 'LS', etc.
  unit_cost DECIMAL(15,2),
  default_quantity DECIMAL(15,2),

  -- Calculation method
  calculation_type TEXT DEFAULT 'fixed' CHECK (calculation_type IN ('fixed', 'per-sf', 'percentage')),
  percentage_of TEXT, -- Reference to another category/item for percentage calculations

  -- Phase association (when cost is typically incurred)
  phase_id UUID REFERENCES project_template_phases(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_budget_items_template ON project_template_budget_items(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_budget_items_category ON project_template_budget_items(category_id);

-- ============================================================================
-- PROJECT TEMPLATE TEAM ROLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_team_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,

  role_name TEXT NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('internal', 'external', 'consultant')),
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Role settings
  is_required BOOLEAN DEFAULT false,
  permissions TEXT DEFAULT 'member' CHECK (permissions IN ('admin', 'member', 'viewer')),

  -- Default entity (if there's a preferred vendor/contact for this role)
  default_entity_id UUID,
  default_entity_type TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_team_roles_template ON project_template_team_roles(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_team_roles_type ON project_template_team_roles(role_type);

-- ============================================================================
-- PROJECT TEMPLATE CHECKLISTS (Pre-defined checklists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_template_phases(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_checklists_template ON project_template_checklists(template_id);

-- ============================================================================
-- PROJECT TEMPLATE CHECKLIST ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_template_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES project_template_checklists(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Assignment
  assigned_role TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_template_checklist_items_checklist ON project_template_checklist_items(checklist_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_checklist_items ENABLE ROW LEVEL SECURITY;

-- Project Templates: Org members can view, admins can manage
CREATE POLICY "Users can view org project templates"
  ON project_templates FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage project templates"
  ON project_templates FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Template Folders: Based on template access
CREATE POLICY "Users can view template folders"
  ON project_template_folders FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template folders"
  ON project_template_folders FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Phases
CREATE POLICY "Users can view template phases"
  ON project_template_phases FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template phases"
  ON project_template_phases FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Milestones
CREATE POLICY "Users can view template milestones"
  ON project_template_milestones FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template milestones"
  ON project_template_milestones FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Tasks
CREATE POLICY "Users can view template tasks"
  ON project_template_tasks FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template tasks"
  ON project_template_tasks FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Budget Categories
CREATE POLICY "Users can view template budget categories"
  ON project_template_budget_categories FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template budget categories"
  ON project_template_budget_categories FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Budget Items
CREATE POLICY "Users can view template budget items"
  ON project_template_budget_items FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template budget items"
  ON project_template_budget_items FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Team Roles
CREATE POLICY "Users can view template team roles"
  ON project_template_team_roles FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template team roles"
  ON project_template_team_roles FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Checklists
CREATE POLICY "Users can view template checklists"
  ON project_template_checklists FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template checklists"
  ON project_template_checklists FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM project_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Template Checklist Items
CREATE POLICY "Users can view template checklist items"
  ON project_template_checklist_items FOR SELECT
  TO authenticated
  USING (
    checklist_id IN (
      SELECT id FROM project_template_checklists WHERE template_id IN (
        SELECT id FROM project_templates WHERE organization_id IN (
          SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Admins can manage template checklist items"
  ON project_template_checklist_items FOR ALL
  TO authenticated
  USING (
    checklist_id IN (
      SELECT id FROM project_template_checklists WHERE template_id IN (
        SELECT id FROM project_templates WHERE organization_id IN (
          SELECT organization_id FROM organization_members
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  )
  WITH CHECK (
    checklist_id IN (
      SELECT id FROM project_template_checklists WHERE template_id IN (
        SELECT id FROM project_templates WHERE organization_id IN (
          SELECT organization_id FROM organization_members
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_project_templates_updated_at
  BEFORE UPDATE ON project_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTION: Apply template to project
-- ============================================================================
CREATE OR REPLACE FUNCTION apply_project_template(
  p_project_id UUID,
  p_template_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  v_template project_templates%ROWTYPE;
  v_result JSONB := '{}'::jsonb;
  v_phase_mapping JSONB := '{}'::jsonb;
  v_milestone_mapping JSONB := '{}'::jsonb;
  v_task_mapping JSONB := '{}'::jsonb;
  v_folder_mapping JSONB := '{}'::jsonb;
  v_category_mapping JSONB := '{}'::jsonb;
  v_checklist_mapping JSONB := '{}'::jsonb;
BEGIN
  -- Get template
  SELECT * INTO v_template FROM project_templates WHERE id = p_template_id;

  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Template not found: %', p_template_id;
  END IF;

  -- Update project with template reference
  UPDATE projects
  SET
    template_id = p_template_id,
    updated_at = NOW()
  WHERE id = p_project_id;

  -- Note: The actual copying of phases, milestones, tasks, budget items, etc.
  -- should be done by the application layer where we have more control
  -- over the logic and can handle SharePoint folder creation.

  v_result := jsonb_build_object(
    'success', true,
    'template_id', p_template_id,
    'template_name', v_template.name,
    'message', 'Template applied. Use application layer to copy template items.'
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Add template_id column to projects table if not exists
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN template_id UUID REFERENCES project_templates(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_projects_template ON projects(template_id);
  END IF;
END $$;
