-- E-Sign Tables Migration
-- Creates tables for document signing and contract generation

-- Document Templates (links to DocuSeal templates)
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  docuseal_template_id INTEGER,
  available_for TEXT[] DEFAULT ARRAY['project', 'opportunity'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Signing Requests
CREATE TABLE IF NOT EXISTS document_signing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  template_id TEXT,
  docuseal_submission_id TEXT,
  docuseal_template_id INTEGER,
  document_name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'partially_signed', 'completed', 'cancelled', 'expired', 'declined')),
  prefill_data JSONB DEFAULT '{}',
  notes TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  storage_path TEXT,
  storage_url TEXT,
  linked_document_id UUID,
  docuseal_document_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Signers
CREATE TABLE IF NOT EXISTS document_signers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signing_request_id UUID REFERENCES document_signing_requests(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Signer',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  contact_auto_matched BOOLEAN DEFAULT false,
  docuseal_submitter_id TEXT,
  embed_src TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'signed', 'declined')),
  signed_at TIMESTAMPTZ,
  signing_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Contacts Junction (links documents to contacts)
CREATE TABLE IF NOT EXISTS document_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL,
  document_id UUID NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_type, document_id, contact_id)
);

-- Generated Contracts (for contract generation workflow)
CREATE TABLE IF NOT EXISTS generated_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  template_id TEXT,
  document_name TEXT NOT NULL,
  content TEXT,
  prefill_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'archived')),
  signing_request_id UUID REFERENCES document_signing_requests(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_signing_requests_entity ON document_signing_requests(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_signing_requests_status ON document_signing_requests(status);
CREATE INDEX IF NOT EXISTS idx_signers_request ON document_signers(signing_request_id);
CREATE INDEX IF NOT EXISTS idx_signers_contact ON document_signers(contact_id);
CREATE INDEX IF NOT EXISTS idx_document_contacts_contact ON document_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_generated_contracts_entity ON generated_contracts(entity_type, entity_id);

-- Enable RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signers ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (idempotent - safe to re-run)

-- document_templates
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_templates' AND policyname='Templates are viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Templates are viewable by authenticated users" ON public.document_templates';
  END IF;
  EXECUTE 'CREATE POLICY "Templates are viewable by authenticated users" ON public.document_templates FOR SELECT TO authenticated USING (true)';
END$$;

-- document_signing_requests
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_signing_requests' AND policyname='Signing requests viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Signing requests viewable by authenticated users" ON public.document_signing_requests';
  END IF;
  EXECUTE 'CREATE POLICY "Signing requests viewable by authenticated users" ON public.document_signing_requests FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_signing_requests' AND policyname='Authenticated users can create signing requests') THEN
    EXECUTE 'DROP POLICY "Authenticated users can create signing requests" ON public.document_signing_requests';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can create signing requests" ON public.document_signing_requests FOR INSERT TO authenticated WITH CHECK (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_signing_requests' AND policyname='Authenticated users can update signing requests') THEN
    EXECUTE 'DROP POLICY "Authenticated users can update signing requests" ON public.document_signing_requests';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can update signing requests" ON public.document_signing_requests FOR UPDATE TO authenticated USING (true)';
END$$;

-- document_signers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_signers' AND policyname='Signers viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Signers viewable by authenticated users" ON public.document_signers';
  END IF;
  EXECUTE 'CREATE POLICY "Signers viewable by authenticated users" ON public.document_signers FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_signers' AND policyname='Authenticated users can manage signers') THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage signers" ON public.document_signers';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can manage signers" ON public.document_signers FOR ALL TO authenticated USING (true)';
END$$;

-- document_contacts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_contacts' AND policyname='Document contacts viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Document contacts viewable by authenticated users" ON public.document_contacts';
  END IF;
  EXECUTE 'CREATE POLICY "Document contacts viewable by authenticated users" ON public.document_contacts FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_contacts' AND policyname='Authenticated users can manage document contacts') THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage document contacts" ON public.document_contacts';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can manage document contacts" ON public.document_contacts FOR ALL TO authenticated USING (true)';
END$$;

-- generated_contracts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='generated_contracts' AND policyname='Generated contracts viewable by authenticated users') THEN
    EXECUTE 'DROP POLICY "Generated contracts viewable by authenticated users" ON public.generated_contracts';
  END IF;
  EXECUTE 'CREATE POLICY "Generated contracts viewable by authenticated users" ON public.generated_contracts FOR SELECT TO authenticated USING (true)';
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='generated_contracts' AND policyname='Authenticated users can manage generated contracts') THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage generated contracts" ON public.generated_contracts';
  END IF;
  EXECUTE 'CREATE POLICY "Authenticated users can manage generated contracts" ON public.generated_contracts FOR ALL TO authenticated USING (true)';
END$$;

-- Insert default templates
INSERT INTO document_templates (id, name, description, category, available_for)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'Purchase Agreement', 'Standard real estate purchase agreement', 'purchase', ARRAY['project', 'opportunity']),
  ('00000000-0000-0000-0000-000000000102', 'Assignment of Contract', 'Contract assignment for wholesale deals', 'assignment', ARRAY['opportunity']),
  ('00000000-0000-0000-0000-000000000103', 'Letter of Intent (LOI)', 'Non-binding letter of intent', 'pre-contract', ARRAY['opportunity']),
  ('00000000-0000-0000-0000-000000000104', 'Due Diligence Extension', 'Request for DD period extension', 'amendment', ARRAY['project', 'opportunity']),
  ('00000000-0000-0000-0000-000000000105', 'Earnest Money Release', 'Release of earnest money deposit', 'closing', ARRAY['project', 'opportunity'])
ON CONFLICT (id) DO NOTHING;
