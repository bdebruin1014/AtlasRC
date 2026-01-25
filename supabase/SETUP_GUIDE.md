# Atlas RC - Supabase Setup Guide

This guide will help you set up Supabase for the Atlas Real Estate Development application.

## Quick Setup (5 minutes)

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organization
4. Enter project details:
   - **Name**: Atlas RC (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your location
5. Click **Create new project** and wait for setup (~2 minutes)

### Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under Project API keys)

### Step 3: Configure Environment Variables

1. In your Atlas RC project, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 4: Run Database Migrations

**Option A: Using Supabase CLI (Recommended)**
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project ref from dashboard URL)
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

**Option B: Manual SQL Editor**
1. Go to your Supabase dashboard > **SQL Editor**
2. Run migrations in order (see Migration Order below)
3. Or use the combined script: `supabase/combined_setup.sql`

### Step 5: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see these core tables:
   - `entities`
   - `opportunities`
   - `projects`
   - `contacts`
   - `transactions`
   - Plus many more module-specific tables

---

## Migration Order

Run these migrations in order if doing manual setup:

```
1.  20260120_init_atlas_schema.sql       # Core tables
2.  20260120_extend_schema.sql           # Extended fields
3.  20260120_users_teams_permissions.sql # Auth & permissions
4.  20260120_outlook_integration.sql     # Email integration
5.  20260120_sharepoint_integration.sql  # Document storage
6.  20260121_project_templates.sql       # Project templates
7.  20260122_add_esign_tables.sql        # E-signatures
8.  20260122_add_team_chat.sql           # Team messaging
9.  20260124_enhanced_contacts.sql       # Contact extensions
10. 20260124_project_contacts.sql        # Project contacts
11. 20260124_project_numbers.sql         # Project numbering
12. 20260124_teams_budget_templates.sql  # Budget templates
13. 20260125_budget_module.sql           # Budget tracking
14. 20260125_bids_module.sql             # Bid management
15. 20260125_cashflow_module.sql         # Cash flow
16. 20260125_change_orders_module.sql    # Change orders
17. 20260125_documents_workorders_audit.sql
18. 20260125_draw_requests_module.sql    # Draw requests
19. 20260125_entity_accounting_architecture.sql
20. 20260125_entity_accounting_seed.sql  # Sample data
21. 20260125_expenses_module.sql         # Expenses
22. 20260125_loans_module.sql            # Loan tracking
23. 20260125_notifications.sql           # Notifications
24. 20260125_permits_module.sql          # Permits
25. 20260125_proforma_module.sql         # Pro forma
26. 20260125_proforma_waterfall.sql      # Waterfall calcs
27. 20260125_sales_module.sql            # Sales tracking
28. 20260125_schedule_module.sql         # Scheduling
```

---

## Database Tables Overview

### Core Tables
| Table | Description |
|-------|-------------|
| `entities` | Company structure (Holdings > Operating > Project LLCs) |
| `opportunities` | Wholesale pipeline deals |
| `projects` | Active development projects |
| `contacts` | All contacts (sellers, buyers, vendors, etc.) |
| `transactions` | Financial transactions |

### Module Tables
| Module | Tables |
|--------|--------|
| **Accounting** | `chart_of_accounts`, `journal_entries`, `bank_accounts` |
| **Budget** | `budget_categories`, `budget_line_items` |
| **Bids** | `bid_packages`, `bids`, `bid_items` |
| **Change Orders** | `change_orders`, `change_order_items` |
| **Draw Requests** | `draw_requests`, `draw_request_items` |
| **E-Sign** | `document_templates`, `document_signing_requests`, `document_signers` |
| **Loans** | `loans`, `loan_draws` |
| **Permits** | `permits`, `permit_inspections` |
| **Pro Forma** | `proformas`, `proforma_categories`, `proforma_line_items` |
| **Sales** | `sales_listings`, `sales_offers`, `sales_closings` |
| **Schedule** | `schedule_phases`, `schedule_tasks` |
| **Team** | `team_members`, `chat_channels`, `chat_messages` |

---

## Troubleshooting

### "relation does not exist" error
- Run migrations in the correct order
- The `contacts` table must exist before `esign` tables

### Authentication errors
- Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check that RLS policies are in place

### Empty data
- Run the seed migration: `20260125_entity_accounting_seed.sql`
- Or add data manually through the app

---

## Optional: Enable Realtime

For live updates (team chat, notifications), enable realtime on specific tables:

```sql
-- In SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

---

## Support

For issues with this setup, check the GitHub repository or contact the development team.
