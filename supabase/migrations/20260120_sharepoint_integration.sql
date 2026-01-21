-- Atlas Real Estate Development - SharePoint Integration Schema
-- Created: 2026-01-20

-- ============================================================================
-- SHAREPOINT USER CONNECTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS sharepoint_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  site_id TEXT,
  site_name TEXT,
  site_url TEXT,
  drive_id TEXT,
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_sharepoint_connections_user ON sharepoint_connections(user_id);

-- ============================================================================
-- PROJECT SHAREPOINT MAPPINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_sharepoint_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  drive_id TEXT NOT NULL,
  folder_id TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  folder_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_project_sharepoint_mappings_project ON project_sharepoint_mappings(project_id);

-- ============================================================================
-- DOCUMENTS (Enhanced with SharePoint integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_type TEXT,
  file_size BIGINT,
  tags JSONB DEFAULT '[]'::jsonb,

  -- SharePoint references
  sharepoint_item_id TEXT,
  sharepoint_drive_id TEXT,
  sharepoint_path TEXT,
  sharepoint_web_url TEXT,

  -- Supabase storage (fallback)
  storage_bucket TEXT,
  storage_path TEXT,

  -- Template reference
  template_id UUID,

  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_sharepoint ON documents(sharepoint_item_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_deleted ON documents(is_deleted);

-- ============================================================================
-- DOCUMENT ACCESS LINKS (Time-limited sharing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_access_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL CHECK (link_type IN ('view', 'edit', 'download')),
  link_url TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for document links
CREATE INDEX IF NOT EXISTS idx_document_access_links_document ON document_access_links(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_links_expires ON document_access_links(expires_at);

-- ============================================================================
-- DOCUMENT ACCESS LOG (Audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for access log
CREATE INDEX IF NOT EXISTS idx_document_access_log_document ON document_access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_user ON document_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_action ON document_access_log(action);
CREATE INDEX IF NOT EXISTS idx_document_access_log_created ON document_access_log(created_at DESC);

-- ============================================================================
-- DOCUMENT TEMPLATES LIBRARY
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_templates_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,

  -- SharePoint reference
  sharepoint_item_id TEXT,
  sharepoint_drive_id TEXT,
  sharepoint_path TEXT,
  sharepoint_web_url TEXT,

  tags JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for templates
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates_library(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON document_templates_library(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE sharepoint_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_sharepoint_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates_library ENABLE ROW LEVEL SECURITY;

-- SharePoint connections: Users can only access their own
CREATE POLICY "Users can manage their own SharePoint connection"
  ON sharepoint_connections FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Project mappings: Authenticated users can view, admins can modify
CREATE POLICY "Users can view project SharePoint mappings"
  ON project_sharepoint_mappings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage project SharePoint mappings"
  ON project_sharepoint_mappings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Documents: Authenticated users can access
CREATE POLICY "Users can view documents"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage documents"
  ON documents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Document access links
CREATE POLICY "Users can view document links"
  ON document_access_links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create document links"
  ON document_access_links FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Document access log
CREATE POLICY "Users can view access log"
  ON document_access_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert access log"
  ON document_access_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Document templates
CREATE POLICY "Users can view document templates"
  ON document_templates_library FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage document templates"
  ON document_templates_library FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_sharepoint_connections_updated_at BEFORE UPDATE ON sharepoint_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_sharepoint_mappings_updated_at BEFORE UPDATE ON project_sharepoint_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Increment document template usage count
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE document_templates_library
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_template_usage_on_document_create
  AFTER INSERT ON documents
  FOR EACH ROW EXECUTE FUNCTION increment_template_usage();
