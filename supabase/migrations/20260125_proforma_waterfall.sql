-- ============================================
-- WATERFALL & RETURNS TABLES
-- ============================================

-- Waterfall structures (can be saved as templates or per-proforma)
CREATE TABLE IF NOT EXISTS proforma_waterfall_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Can belong to template OR proforma
  template_id UUID REFERENCES proforma_templates(id) ON DELETE CASCADE,
  proforma_id UUID REFERENCES proformas(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- Structure Type
  structure_type TEXT NOT NULL DEFAULT 'american',
  -- american: Distributions at each tier as earned
  -- european: Return of capital first, then promote
  -- hybrid: Custom combination

  -- Capital Structure
  capital_structure JSONB NOT NULL DEFAULT '{}',
  /*
  {
    "total_equity": 1000000,
    "lp_equity": 900000,
    "lp_equity_percent": 90,
    "gp_equity": 100000,
    "gp_equity_percent": 10,
    "gp_co_invest_required": true,
    "gp_co_invest_percent": 10
  }
  */

  -- Preferred Return
  preferred_return JSONB NOT NULL DEFAULT '{}',
  /*
  {
    "enabled": true,
    "rate": 0.08, // 8% annual
    "type": "cumulative", // cumulative, non_cumulative, compounding
    "compounding_frequency": "annual", // annual, quarterly, monthly
    "accrues_during_construction": true,
    "payment_frequency": "at_exit", // monthly, quarterly, annual, at_exit
    "lp_pref_rate": 0.08,
    "gp_pref_rate": 0.08, // Can be different or same as LP
    "catch_up_enabled": true,
    "catch_up_percent": 1.0, // 100% to GP until caught up
    "catch_up_target": 0.20 // GP catches up to 20% of profits
  }
  */

  -- Promote Tiers (IRR or Multiple based hurdles)
  promote_tiers JSONB NOT NULL DEFAULT '[]',
  /*
  [
    {
      "id": "uuid",
      "tier_number": 1,
      "name": "Tier 1 - Base",
      "hurdle_type": "irr", // irr, equity_multiple, or both
      "irr_hurdle": null, // No IRR hurdle for first tier
      "multiple_hurdle": null,
      "lp_share": 0.90,
      "gp_share": 0.10, // GP promote starts at co-invest level
      "description": "Base split up to preferred return"
    },
    {
      "id": "uuid",
      "tier_number": 2,
      "name": "Tier 2 - First Promote",
      "hurdle_type": "irr",
      "irr_hurdle": 0.12, // 12% IRR
      "multiple_hurdle": 1.5, // 1.5x multiple (can use both)
      "lp_share": 0.80,
      "gp_share": 0.20,
      "description": "After 12% IRR or 1.5x multiple"
    },
    {
      "id": "uuid",
      "tier_number": 3,
      "name": "Tier 3 - Second Promote",
      "hurdle_type": "irr",
      "irr_hurdle": 0.18, // 18% IRR
      "multiple_hurdle": 2.0,
      "lp_share": 0.70,
      "gp_share": 0.30,
      "description": "After 18% IRR or 2.0x multiple"
    },
    {
      "id": "uuid",
      "tier_number": 4,
      "name": "Tier 4 - Final Promote",
      "hurdle_type": "irr",
      "irr_hurdle": 0.25, // 25% IRR
      "multiple_hurdle": 2.5,
      "lp_share": 0.60,
      "gp_share": 0.40,
      "description": "After 25% IRR or 2.5x multiple"
    }
  ]
  */

  -- Clawback & True-Up Provisions
  clawback_provisions JSONB DEFAULT '{}',
  /*
  {
    "gp_clawback_enabled": true,
    "lp_clawback_enabled": false,
    "true_up_frequency": "at_exit", // annual, at_exit
    "escrow_percent": 0.10 // 10% of GP promote held in escrow
  }
  */

  -- Management Fees (affects returns)
  management_fees JSONB DEFAULT '{}',
  /*
  {
    "acquisition_fee_percent": 0.01,
    "asset_management_fee_percent": 0.02, // Annual on equity
    "disposition_fee_percent": 0.01,
    "construction_management_fee_percent": 0.05, // On hard costs
    "fees_paid_from": "operating_cash_flow" // operating_cash_flow, capital
  }
  */

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT check_single_parent CHECK (
    (template_id IS NOT NULL AND proforma_id IS NULL) OR
    (template_id IS NULL AND proforma_id IS NOT NULL)
  )
);

-- Return metrics configuration
CREATE TABLE IF NOT EXISTS proforma_return_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES proforma_templates(id) ON DELETE CASCADE,
  proforma_id UUID REFERENCES proformas(id) ON DELETE CASCADE,

  -- Metric Definition
  metric_key TEXT NOT NULL, -- Unique identifier
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- project, lp, gp, deal

  -- Calculation
  formula TEXT, -- For custom metrics

  -- Display
  display_format TEXT DEFAULT 'percent', -- percent, multiple, currency, number
  decimal_places INTEGER DEFAULT 2,
  show_in_summary BOOLEAN DEFAULT true,
  show_in_waterfall BOOLEAN DEFAULT true,

  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT check_single_parent_metrics CHECK (
    (template_id IS NOT NULL AND proforma_id IS NULL) OR
    (template_id IS NULL AND proforma_id IS NOT NULL)
  )
);

-- Calculated waterfall results (cached)
CREATE TABLE IF NOT EXISTS proforma_waterfall_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proforma_id UUID REFERENCES proformas(id) ON DELETE CASCADE,
  scenario TEXT DEFAULT 'base', -- base, upside, downside

  -- Input Summary
  inputs JSONB NOT NULL DEFAULT '{}',
  /*
  {
    "total_equity_invested": 1000000,
    "lp_equity_invested": 900000,
    "gp_equity_invested": 100000,
    "hold_period_years": 3.5,
    "total_distributions": 1800000,
    "cash_flows": [...] // Monthly cash flows for IRR calc
  }
  */

  -- Tier-by-Tier Results
  tier_results JSONB NOT NULL DEFAULT '[]',
  /*
  [
    {
      "tier_number": 0,
      "tier_name": "Return of Capital",
      "lp_distribution": 900000,
      "gp_distribution": 100000,
      "total_distribution": 1000000,
      "cumulative_lp": 900000,
      "cumulative_gp": 100000,
      "lp_irr_at_tier": 0,
      "lp_multiple_at_tier": 1.0
    },
    {
      "tier_number": 1,
      "tier_name": "Preferred Return",
      "lp_distribution": 216000, // 8% x 3 years x 900k
      "gp_distribution": 24000,
      "total_distribution": 240000,
      "cumulative_lp": 1116000,
      "cumulative_gp": 124000,
      "lp_irr_at_tier": 0.08,
      "lp_multiple_at_tier": 1.24
    },
    // ... more tiers
  ]
  */

  -- Final Results
  final_results JSONB NOT NULL DEFAULT '{}',
  /*
  {
    "lp": {
      "total_invested": 900000,
      "total_distributed": 1440000,
      "profit": 540000,
      "irr": 0.156,
      "equity_multiple": 1.60,
      "cash_on_cash_avg": 0.12,
      "peak_equity": 900000,
      "distribution_yield": 0.48
    },
    "gp": {
      "total_invested": 100000,
      "total_distributed": 360000,
      "profit": 260000,
      "irr": 0.312,
      "equity_multiple": 3.60,
      "promote_earned": 200000,
      "management_fees_earned": 60000
    },
    "project": {
      "total_cost": 5000000,
      "total_equity": 1000000,
      "total_debt": 4000000,
      "gross_revenue": 6500000,
      "net_revenue": 6200000,
      "gross_profit": 1200000,
      "net_profit": 800000,
      "project_irr": 0.234,
      "unlevered_irr": 0.145,
      "equity_multiple": 1.80,
      "yield_on_cost": 0.064,
      "development_spread": 0.015,
      "return_on_cost": 0.16,
      "return_on_equity": 0.80
    }
  }
  */

  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(proforma_id, scenario)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_waterfall_template ON proforma_waterfall_structures(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waterfall_proforma ON proforma_waterfall_structures(proforma_id) WHERE proforma_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_return_metrics_template ON proforma_return_metrics(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_return_metrics_proforma ON proforma_return_metrics(proforma_id) WHERE proforma_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waterfall_results_proforma ON proforma_waterfall_results(proforma_id);

-- RLS Policies
ALTER TABLE proforma_waterfall_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE proforma_return_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE proforma_waterfall_results ENABLE ROW LEVEL SECURITY;

-- Policies for waterfall structures
CREATE POLICY "Users can view waterfall structures for their proformas"
  ON proforma_waterfall_structures FOR SELECT
  USING (
    proforma_id IN (
      SELECT p.id FROM proformas p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
    OR template_id IN (
      SELECT id FROM proforma_templates WHERE is_public = true
    )
  );

CREATE POLICY "Users can manage waterfall structures for their proformas"
  ON proforma_waterfall_structures FOR ALL
  USING (
    proforma_id IN (
      SELECT p.id FROM proformas p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Policies for return metrics
CREATE POLICY "Users can view return metrics for their proformas"
  ON proforma_return_metrics FOR SELECT
  USING (
    proforma_id IN (
      SELECT p.id FROM proformas p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
    OR template_id IN (
      SELECT id FROM proforma_templates WHERE is_public = true
    )
  );

CREATE POLICY "Users can manage return metrics for their proformas"
  ON proforma_return_metrics FOR ALL
  USING (
    proforma_id IN (
      SELECT p.id FROM proformas p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Policies for waterfall results
CREATE POLICY "Users can view waterfall results for their proformas"
  ON proforma_waterfall_results FOR SELECT
  USING (
    proforma_id IN (
      SELECT p.id FROM proformas p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage waterfall results for their proformas"
  ON proforma_waterfall_results FOR ALL
  USING (
    proforma_id IN (
      SELECT p.id FROM proformas p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );
