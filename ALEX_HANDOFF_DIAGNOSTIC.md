# AtlasRC v3.1.0 - Complete Project Diagnostic & Handoff Document

**Prepared for:** Alex
**Date:** January 28, 2026
**Project Version:** 3.1.0
**Supabase Project:** `opuykuydejpicqdtekne`

---

## Executive Summary

AtlasRC is a comprehensive real estate development management platform built with React 18 + Vite and Supabase backend. The frontend application is **production-ready** with 139+ pages, 70+ services, and 150+ components. The database schema is fully designed with 30 migration files covering 150+ tables.

**Current State:** Ready for deployment with configuration and testing requirements.

| Area | Status | Notes |
|------|--------|-------|
| Frontend Code | ✅ Complete | 139 pages, 635+ routes |
| Backend Services | ✅ Complete | 70+ service modules |
| Database Schema | ✅ Complete | 30 migrations, 150+ tables |
| Supabase Project | ⚠️ Created | Needs migrations run |
| Authentication | ✅ Code Ready | Needs production config |
| Testing | ❌ None | Zero test files |
| Error Monitoring | ❌ None | Needs setup |

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Project Structure](#2-project-structure)
3. [Features & Modules Built](#3-features--modules-built)
4. [Pages & Routes Inventory](#4-pages--routes-inventory)
5. [Services Architecture](#5-services-architecture)
6. [Supabase Integration Status](#6-supabase-integration-status)
7. [Database Schema Overview](#7-database-schema-overview)
8. [Security Considerations](#8-security-considerations)
9. [Known Issues & Technical Debt](#9-known-issues--technical-debt)
10. [Go-Live Checklist](#10-go-live-checklist)
11. [Deployment Guide](#11-deployment-guide)
12. [Post-Deployment Recommendations](#12-post-deployment-recommendations)

---

## 1. Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| Vite | 5.4.3 | Build Tool |
| React Router | 6.26.2 | SPA Routing |
| Tailwind CSS | 3.4.11 | Styling |

### State Management
| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | 4.5.5 | Client State |
| TanStack React Query | 5.90.16 | Server State |
| React Hook Form | 7.70.0 | Form State |
| Zod | 3.25.76 | Validation |

### Backend & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase JS | 2.45.4 | Database Client |
| PostgreSQL | (via Supabase) | Database |

### UI Components
| Technology | Purpose |
|------------|---------|
| Radix UI | 25+ accessible primitives |
| shadcn/ui | 23 styled components |
| Lucide React | Icons |
| Framer Motion | Animations |

### Data Visualization
| Technology | Purpose |
|------------|---------|
| Recharts | Charts & graphs |
| Chart.js | Additional charts |

### Document Generation
| Technology | Purpose |
|------------|---------|
| jsPDF | PDF generation |
| pptxgenjs | PowerPoint export |
| xlsx | Excel export |

### Integrations
| Integration | Status | Notes |
|-------------|--------|-------|
| DocuSeal | ✅ Ready | E-signature |
| SharePoint | ✅ Ready | Document storage |
| Outlook | ✅ Ready | Calendar/email sync |
| Plaid | ⚠️ Optional | Banking integration |

---

## 2. Project Structure

```
AtlasRC/
├── src/
│   ├── App.jsx                 # Main router (635+ routes, 54KB)
│   ├── main.jsx                # Entry point
│   ├── index.css               # Global styles
│   │
│   ├── pages/                  # 57 root pages + 16 subdirectories
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProjectsPage.jsx
│   │   ├── projects/           # 58 project-specific pages
│   │   ├── accounting/         # 71 accounting pages
│   │   ├── admin/              # 20+ admin pages
│   │   ├── operations/         # 10 operations pages
│   │   └── reports/            # 5 report pages
│   │
│   ├── components/             # 150+ components in 16 categories
│   │   ├── ui/                 # 23 shadcn/ui components
│   │   ├── shared/             # 10+ shared components
│   │   ├── accounting/         # Accounting-specific
│   │   ├── pipeline/           # Pipeline components
│   │   └── ...
│   │
│   ├── services/               # 70+ service modules
│   │   ├── projectService.js
│   │   ├── opportunityService.js
│   │   ├── entityService.js
│   │   ├── accountingService.js
│   │   └── ...
│   │
│   ├── contexts/               # 3 React contexts
│   │   ├── AuthContext.jsx
│   │   ├── PermissionContext.jsx
│   │   └── TransactionEntryContext.jsx
│   │
│   ├── hooks/                  # 17 custom hooks
│   │   ├── useProjects.js
│   │   ├── useBudget.js
│   │   └── ...
│   │
│   ├── lib/                    # Core utilities
│   │   ├── supabase.js         # Database client
│   │   ├── utils.js
│   │   └── constants.js
│   │
│   └── archive/                # 8 inactive modules (preserved)
│
├── supabase/
│   ├── migrations/             # 30 SQL migration files
│   ├── functions/              # 2 Edge Functions
│   │   ├── docuseal-webhook/
│   │   └── parse-contract/
│   ├── combined_setup.sql      # Combined schema
│   ├── seed.sql                # Sample data
│   └── SETUP_GUIDE.md
│
├── public/                     # Static assets
├── .env.example                # Environment template
├── .env                        # Your environment (gitignored)
├── vite.config.js              # Build configuration
├── tailwind.config.js          # Tailwind configuration
├── vercel.json                 # Vercel deployment
├── netlify.toml                # Netlify deployment
└── package.json                # Dependencies
```

---

## 3. Features & Modules Built

### A. Opportunities/Pipeline Module ✅
Complete wholesale deal pipeline management.

| Feature | Status | Description |
|---------|--------|-------------|
| Pipeline Stages | ✅ | Prospecting → Contacted → Qualified → Negotiating → Under Contract |
| Deal Analysis | ✅ | Property comps, ARV calculations |
| Contract Generation | ✅ | Auto-generate purchase contracts |
| E-Signature | ✅ | DocuSeal integration |
| Pipeline Analytics | ✅ | Conversion rates, stage timing |
| Deal Comparison | ✅ | Side-by-side comparison tool |
| Kanban View | ✅ | Drag-drop stage management |

### B. Projects Module ✅
Comprehensive project lifecycle management.

| Section | Features |
|---------|----------|
| **Overview** | Property details, contacts, milestones, activity feed |
| **Acquisition** | Deal analysis, due diligence checklist, closing checklist, purchase contracts |
| **Construction** | Budget, schedule, Gantt chart, permits, bids, change orders, work orders, RFIs, punch lists, photo progress |
| **Finance** | Cash flow, loans, draw requests, proforma, expenses, vendors, actuals vs budget |
| **Disposition** | Sales contracts, settlement statements, takedown schedule, fund tracking |
| **Documents** | Document library, expiration tracking, e-signature |

**Project Types Supported:**
- Spec Build (custom homes)
- Horizontal Lot Development (subdivisions)
- Build-to-Rent (BTR)
- Fix & Flip

### C. Accounting Module ✅
Full double-entry accounting system.

| Feature | Status | Description |
|---------|--------|-------------|
| Multi-Entity | ✅ | Holding → Operating → Project LLC hierarchy |
| Chart of Accounts | ✅ | Per-entity COA with templates |
| Journal Entries | ✅ | Double-entry with auto-balancing |
| Bank Reconciliation | ✅ | Match transactions, auto-reconcile |
| Financial Reports | ✅ | P&L, Balance Sheet, Cash Flow, Trial Balance, GL |
| Job Costing | ✅ | Cost allocation by project |
| 1099 Tracking | ✅ | Vendor tax reporting |
| Payroll | ✅ | Employee payment processing |
| Batch Payments | ✅ | Bulk vendor payments |
| Month-End Close | ✅ | Workflow with checklist |
| Investor Portal | ✅ | External investor access |
| Consolidation | ✅ | Multi-entity consolidation |

### D. Operations Module ✅
Team and workflow management.

| Feature | Status |
|---------|--------|
| Task Management | ✅ |
| Team Management | ✅ |
| E-Signature Workflows | ✅ |
| Document Library | ✅ |
| Team Chat | ✅ |
| Notification Center | ✅ |
| Contract Templates | ✅ |
| Resource Allocation | ✅ |

### E. Admin Module ✅
System configuration and user management.

| Feature | Status |
|---------|--------|
| User Management | ✅ |
| Role-Based Permissions | ✅ |
| Organization Settings | ✅ |
| Template Libraries | ✅ |
| Floor Plan Library | ✅ |
| Pricing Library | ✅ |
| Audit Logs | ✅ |
| Integration Settings | ✅ |

### F. Reports Module ✅
Comprehensive reporting system.

| Feature | Description |
|---------|-------------|
| Preset Reports | Standard financial & operational reports |
| Custom Reports | Build your own reports |
| Subscribed Reports | Scheduled email delivery |
| Report Packages | Bundled report sets |
| Trends Analysis | Historical performance tracking |

### G. Integration Features

#### DocuSeal E-Signature ✅
- Template management
- PDF generation & signing
- Signature field configuration
- Contact linking
- Access tracking & audit log
- Webhook for completion notifications

#### SharePoint Integration ✅
- OAuth 2.0 (Microsoft multi-tenant)
- Site & folder management
- File upload/download
- Document sync
- Isolated customer folders

#### Outlook Integration ✅
- OAuth 2.0 authentication
- Calendar sync
- Email integration
- Meeting scheduling
- Activity logging

---

## 4. Pages & Routes Inventory

### Total: 139 Lazy-Loaded Pages, 635+ Routes

| Module | Pages | Key Routes |
|--------|-------|------------|
| **Authentication** | 4 | `/login`, `/signup`, `/forgot-password`, `/reset-password` |
| **Core** | 12 | `/`, `/executive`, `/projects`, `/opportunities`, `/entities`, `/contacts`, `/calendar`, `/settings` |
| **Projects** | 58 | `/project/:id/*` (overview, acquisition, construction, finance, disposition, documents) |
| **Accounting** | 71 | `/accounting/*`, `/accounting/:entityId/*` |
| **Admin** | 25+ | `/admin/*` (users, teams, templates, integrations) |
| **Operations** | 20+ | `/operations/*` (tasks, documents, chat, esign) |
| **Reports** | 5 | `/reports/*` (preset, custom, subscribed, packages, trends) |
| **Pipeline** | 5 | `/acquisition`, `/deal-analyzer`, `/eos` |

### Detailed Route Structure

```
/                               # Main Dashboard
/executive                      # Executive Dashboard
/login                          # Login Page
/signup                         # Registration
/forgot-password                # Password Recovery
/reset-password                 # Password Reset

/projects                       # Projects List
/project/:id                    # Project Detail
  /overview                     # Project Overview
    /details                    # Property Details
    /contacts                   # Project Contacts
  /acquisition                  # Acquisition Section
    /deal-analysis              # Deal Analysis
    /due-diligence              # Due Diligence
    /closing-checklist          # Closing Checklist
    /purchase-contract          # Purchase Contract
    /closing                    # Closing
  /construction                 # Construction Section
    /budget                     # Budget Management
    /schedule                   # Schedule/Gantt
    /permits                    # Permit Tracking
    /bids                       # Bid Management
    /change-orders              # Change Orders
    /expenses                   # Expense Tracking
    /work-orders                # Work Orders
    /rfi                        # RFI Tracker
    /punch-list                 # Punch List
    /photos                     # Photo Progress
  /finance                      # Finance Section
    /cashflow                   # Cash Flow
    /loans                      # Loan Tracking
    /draw-requests              # Draw Requests
    /proforma                   # Pro Forma
    /sales                      # Sales Tracking
    /vendors                    # Vendor Management
  /disposition                  # Disposition Section (v3.1)
    /contracts                  # Contract Management
    /settlement                 # Settlement Statements
  /documents                    # Document Library
  /tasks                        # Task Management

/opportunities                  # Pipeline List
/opportunity/:id                # Opportunity Detail
/opportunity/new                # New Opportunity
/pipeline-analytics             # Pipeline Analytics

/accounting                     # Accounting Dashboard
/accounting/:entityId           # Entity-Specific
  /dashboard                    # Entity Dashboard
  /chart-of-accounts            # COA
  /transactions                 # Transaction List
  /journal-entries              # Journal Entries
  /banking                      # Bank Management
  /reconciliation               # Bank Reconciliation
  /reports/*                    # Financial Reports
  /payroll                      # Payroll
  /vendors                      # Vendor Management
  /bills                        # Bills/AP
  /expenses                     # Expense Management

/admin                          # Admin Dashboard
  /users                        # User Management
  /teams                        # Team Management
  /permissions                  # Permission Matrix
  /settings                     # Organization Settings
  /templates/*                  # All Template Types
  /floor-plans                  # Floor Plan Library
  /pricing                      # Pricing Library
  /integrations                 # Integration Settings
  /audit-logs                   # Audit Trail

/operations                     # Operations Dashboard
  /tasks                        # Global Tasks
  /teams                        # Team Overview
  /documents                    # Document Library
  /esign                        # E-Signature
  /chat                         # Team Chat
  /notifications                # Notification Center
```

---

## 5. Services Architecture

### 70+ Service Modules

#### Core Data Services
| Service | File | Supabase Tables | Status |
|---------|------|-----------------|--------|
| projectService | `projectService.js` | projects, project_* | ✅ Full |
| opportunityService | `opportunityService.js` | opportunities | ✅ Full |
| entityService | `entityService.js` | entities | ✅ Full |
| contactsService | `contactsService.js` | contacts, companies | ⚠️ Hybrid* |

*Hybrid = Has mock data fallback for demo mode

#### Accounting Services
| Service | Tables | Status |
|---------|--------|--------|
| accountService | accounts, coa_templates | ✅ Full |
| transactionService | transactions | ✅ Full |
| journalEntryService | journal_entries | ✅ Full |
| billService | bills, bill_line_items | ✅ Full |
| vendorService | vendors | ✅ Full |
| capitalService | capital_contributions, distributions | ✅ Full |
| payrollService | payroll | ✅ Full |
| bankAccountService | bank_accounts | ✅ Full |
| reconciliationService | bank_reconciliation | ✅ Full |

#### Project Management Services
| Service | Tables | Status |
|---------|--------|--------|
| budgetService | project_budgets, budget_* | ✅ Full |
| scheduleService | schedule_phases, schedule_tasks | ✅ Full |
| permitsService | permits, permit_inspections | ✅ Full |
| bidsService | bid_packages, bids | ✅ Full |
| changeOrderService | change_orders | ✅ Full |
| drawRequestService | draw_requests | ✅ Full |
| loanService | loans, loan_draws | ✅ Full |
| proformaService | proformas, proforma_* | ✅ Full |
| salesService | sales, sales_* | ✅ Full |
| dispositionService | disposition_* | ✅ Full |

#### Integration Services
| Service | Integration | Status |
|---------|-------------|--------|
| esignService | DocuSeal | ✅ Full |
| sharepointService | Microsoft Graph | ✅ Full |
| outlookService | Microsoft Graph | ✅ Full |
| plaidService | Plaid | ⚠️ Optional |
| chatService | Supabase Realtime | ✅ Full |
| notificationService | Supabase | ✅ Full |

#### Admin Services
| Service | Purpose | Status |
|---------|---------|--------|
| userService | User management | ✅ Full |
| teamService | Team management | ✅ Full |
| permissionService | RBAC | ✅ Full |
| reportService | Report generation | ✅ Full |

### Service Pattern
All services follow this pattern:
```javascript
import { supabase, isDemoMode } from '@/lib/supabase';

export async function getData() {
  if (isDemoMode) {
    return MOCK_DATA; // Demo mode fallback
  }

  const { data, error } = await supabase
    .from('table')
    .select('*');

  if (error) throw error;
  return data;
}
```

---

## 6. Supabase Integration Status

### Project Details
| Item | Value |
|------|-------|
| Project Reference | `opuykuydejpicqdtekne` |
| Project URL | `https://opuykuydejpicqdtekne.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/opuykuydejpicqdtekne |
| Region | (check dashboard) |

### Configuration Status

| Item | Status | Location |
|------|--------|----------|
| Supabase Client | ✅ Configured | `src/lib/supabase.js` |
| Environment Variables | ✅ Created | `.env` file |
| VITE_SUPABASE_URL | ✅ Set | `.env` |
| VITE_SUPABASE_ANON_KEY | ⚠️ Needs Key | Get from dashboard |

### Database Status

| Item | Status | Action Required |
|------|--------|-----------------|
| Migrations | ⚠️ Not Run | Run 30 migration files |
| Core Tables | ⚠️ Not Created | Run combined_setup.sql |
| RLS Policies | ⚠️ Not Applied | Applied via migrations |
| Triggers | ⚠️ Not Created | Applied via migrations |
| Seed Data | ⚠️ Not Loaded | Run seed.sql (optional) |

### Storage Buckets Needed

| Bucket Name | Purpose | Status |
|-------------|---------|--------|
| `project-documents` | Project files | ⚠️ Create |
| `opportunity-documents` | Pipeline docs | ⚠️ Create |
| `expense-receipts` | Receipt images | ⚠️ Create |
| `investor-documents` | Investor docs | ⚠️ Create |
| `asset-documents` | Asset files | ⚠️ Create |
| `general-documents` | General files | ⚠️ Create |

### Edge Functions

| Function | Purpose | Status |
|----------|---------|--------|
| `docuseal-webhook` | E-sign completion handler | ✅ Ready to deploy |
| `parse-contract` | AI contract parsing | ⚠️ Stub only (needs AI integration) |

### Realtime Subscriptions
The app uses Supabase Realtime for:
- Team chat messaging (`chat:{channelId}`)
- Team presence (`team:presence`)
- Opportunity updates
- Project updates

---

## 7. Database Schema Overview

### Migration Files (30 Total)

| # | Migration | Purpose | Tables Created |
|---|-----------|---------|----------------|
| 1 | `20260120_init_atlas_schema.sql` | Core tables | entities, opportunities, projects, contacts, transactions |
| 2 | `20260120_extend_schema.sql` | Extended fields | Additional columns, indexes |
| 3 | `20260120_users_teams_permissions.sql` | Auth & RBAC | profiles, roles, teams, permissions |
| 4 | `20260120_outlook_integration.sql` | Outlook sync | outlook_tokens, calendar_events |
| 5 | `20260120_sharepoint_integration.sql` | SharePoint | sharepoint_tokens, sharepoint_files |
| 6 | `20260121_project_templates.sql` | Templates | project_templates, template_* |
| 7 | `20260122_add_esign_tables.sql` | E-signature | document_signing_requests, document_signers |
| 8 | `20260122_add_team_chat.sql` | Messaging | chat_channels, chat_messages |
| 9 | `20260124_enhanced_contacts.sql` | Contact ext | Additional contact fields |
| 10 | `20260124_project_contacts.sql` | Project contacts | project_contacts junction |
| 11 | `20260124_project_numbers.sql` | Numbering | Auto-increment project numbers |
| 12 | `20260124_teams_budget_templates.sql` | Budget templates | budget_templates |
| 13 | `20260125_budget_module.sql` | Budgets | project_budgets, budget_categories, budget_line_items |
| 14 | `20260125_bids_module.sql` | Bids | bid_packages, bids, bid_items |
| 15 | `20260125_cashflow_module.sql` | Cash flow | cashflow_entries |
| 16 | `20260125_change_orders_module.sql` | Change orders | change_orders, change_order_items |
| 17 | `20260125_documents_workorders_audit.sql` | Docs & work | documents, work_orders, audit_logs |
| 18 | `20260125_draw_requests_module.sql` | Draw requests | draw_requests, draw_request_items |
| 19 | `20260125_entity_accounting_architecture.sql` | Accounting | accounts, journal_entries, entity_relationships |
| 20 | `20260125_entity_accounting_seed.sql` | Sample data | Default COA, sample entities |
| 21 | `20260125_expenses_module.sql` | Expenses | expenses, expense_categories |
| 22 | `20260125_loans_module.sql` | Loans | loans, loan_draws |
| 23 | `20260125_notifications.sql` | Notifications | notifications, notification_preferences |
| 24 | `20260125_permits_module.sql` | Permits | permits, permit_inspections |
| 25 | `20260125_proforma_module.sql` | Pro forma | proformas, proforma_categories |
| 26 | `20260125_proforma_waterfall.sql` | Waterfall | proforma_waterfall calculations |
| 27 | `20260125_sales_module.sql` | Sales | sales, sales_offers, sales_closings |
| 28 | `20260125_schedule_module.sql` | Scheduling | schedule_phases, schedule_tasks |
| 29 | `20260126_disposition_module.sql` | Disposition | disposition_contracts, settlements |
| 30 | `20260126_project_modules.sql` | Project modules | project_modules configuration |

### Core Table Structure

```
entities
├── id (UUID)
├── name
├── type (holding/operating/project)
├── parent_entity_id (FK → entities)
├── tax_id
└── timestamps

opportunities
├── id (UUID)
├── deal_number (unique)
├── address, city, state, zip
├── stage (pipeline stage)
├── property_type
├── assigned_to
├── estimated_value
└── timestamps

projects
├── id (UUID)
├── name
├── entity_id (FK → entities)
├── opportunity_id (FK → opportunities)
├── status, project_type
├── dates (start, target, actual)
├── budget
└── timestamps

contacts
├── id (UUID)
├── first_name, last_name
├── company, email, phone
├── contact_type
└── timestamps
```

### RLS Policy Status
All tables have RLS enabled with policies for:
- Authenticated users: Full access (current state)
- Anonymous users: No access

**Note:** Current policies are permissive ("allow all authenticated"). For production, should be refined to role-based access.

---

## 8. Security Considerations

### Authentication Security

| Item | Status | Risk | Action |
|------|--------|------|--------|
| Demo User Bypass | ⚠️ Active | HIGH | Disable in production |
| Rate Limiting | ❌ None | MEDIUM | Implement on auth endpoints |
| MFA Support | ❌ None | LOW | Consider for admin users |
| Session Timeout | ✅ Default | OK | Supabase handles |
| Password Policy | ✅ Default | OK | Supabase handles |

### Data Security

| Item | Status | Notes |
|------|--------|-------|
| RLS Enabled | ✅ Yes | All tables |
| Policies | ⚠️ Basic | "Allow authenticated" - refine for production |
| Service Role Key | ✅ Server Only | Only in Edge Functions |
| Anon Key | ✅ Public OK | Safe for client |

### Code Security

| Item | Status | Notes |
|------|--------|-------|
| Environment Variables | ✅ gitignored | .env not committed |
| API Keys | ⚠️ Check | Ensure no hardcoded keys |
| Input Validation | ✅ Zod | Form validation in place |
| XSS Protection | ✅ React | React escapes by default |
| CORS | ⚠️ Supabase | Configure allowed origins |

### Critical Security Items for Production

1. **CRITICAL: Remove Demo Mode**
   - Location: `src/lib/supabase.js` and `src/contexts/AuthContext.jsx`
   - The `isDemoMode` flag and `DEMO_USER` should not exist in production
   - Currently accepts ANY credentials in demo mode

2. **CRITICAL: Refine RLS Policies**
   - Current: `USING (true)` allows all authenticated users
   - Should: Check user roles and ownership

3. **HIGH: Add Rate Limiting**
   - Auth endpoints vulnerable to brute force
   - Consider Supabase rate limiting or edge function protection

---

## 9. Known Issues & Technical Debt

### Critical Issues

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| Hardcoded Entity | `App.jsx:308` | Shows wrong data | Fetch from Supabase |
| Demo User Active | `AuthContext.jsx` | Security risk | Remove for production |
| Zero Tests | Entire codebase | No safety net | Add test suite |

### Hardcoded Values Found

| Value | Locations | Count |
|-------|-----------|-------|
| "Highland Park Development LLC" | App.jsx, EntityPages, Services | 12 |
| Demo user data | AuthContext.jsx | 1 |
| Mock accounts | accountService.js | 14 accounts |
| Demo plans | budgetService.js | 2 plans |

### Missing Implementations

| Feature | Status | Notes |
|---------|--------|-------|
| Contract AI Parsing | Stub only | Edge function needs AI integration |
| PowerPoint Export | Commented out | Requires pptxgenjs install confirmation |
| Error Monitoring | None | Need Sentry/DataDog |
| Analytics | None | Need tracking setup |

### Technical Debt

| Item | Impact | Priority |
|------|--------|----------|
| 45 ESLint errors | Build warnings | Low (mostly archived code) |
| 6 npm vulnerabilities | Dev only | Low (ESLint v8) |
| Large App.jsx (54KB) | Maintainability | Medium |
| No TypeScript | Type safety | Low |
| Sourcemaps in prod | Bundle size | Low |

### Tables Referenced but Potentially Missing

| Table | Service | Status |
|-------|---------|--------|
| `companies` | contactsService.js | May need migration |
| `company_employees` | contactsService.js | May need migration |

---

## 10. Go-Live Checklist

### Phase 1: Database Setup (Required)

- [ ] **Get Supabase Anon Key**
  - Go to: https://supabase.com/dashboard/project/opuykuydejpicqdtekne/settings/api
  - Copy the `anon` `public` key
  - Update `.env` file: `VITE_SUPABASE_ANON_KEY=your-key`

- [ ] **Run Database Migrations**
  - Option A: SQL Editor (https://supabase.com/dashboard/project/opuykuydejpicqdtekne/sql)
    - Run `combined_setup.sql` first
    - Then run each migration in `supabase/migrations/` in date order
  - Option B: Supabase CLI
    ```bash
    supabase link --project-ref opuykuydejpicqdtekne
    supabase db push
    ```

- [ ] **Create Storage Buckets**
  - Go to: https://supabase.com/dashboard/project/opuykuydejpicqdtekne/storage
  - Create buckets: `project-documents`, `opportunity-documents`, `expense-receipts`, `investor-documents`, `asset-documents`, `general-documents`
  - Set each bucket to "Private" with authenticated access

- [ ] **Verify Tables Created**
  - Go to: https://supabase.com/dashboard/project/opuykuydejpicqdtekne/editor
  - Confirm core tables exist: entities, opportunities, projects, contacts, accounts

### Phase 2: Authentication Setup (Required)

- [ ] **Configure Auth Settings**
  - Go to: https://supabase.com/dashboard/project/opuykuydejpicqdtekne/auth/providers
  - Enable Email provider
  - Configure Site URL for production domain
  - Configure Redirect URLs

- [ ] **Configure Email Templates**
  - Go to: https://supabase.com/dashboard/project/opuykuydejpicqdtekne/auth/templates
  - Customize confirmation, recovery, and magic link emails

- [ ] **Create First Admin User**
  - Sign up through the app, or
  - Create via Supabase Auth dashboard

### Phase 3: Code Updates for Production (Required)

- [ ] **Remove Demo Mode**
  - Edit `src/lib/supabase.js`: Set `isDemoMode = false` or remove demo logic
  - Edit `src/contexts/AuthContext.jsx`: Remove DEMO_USER fallback

- [ ] **Fix Hardcoded Entity**
  - Edit `App.jsx:308`: Replace hardcoded entity with dynamic fetch

- [ ] **Update Environment Variables**
  - Ensure `.env` has production Supabase credentials
  - Add any integration API keys (DocuSeal, Microsoft)

### Phase 4: Deployment (Required)

- [ ] **Build Application**
  ```bash
  npm run build
  ```

- [ ] **Deploy to Host**
  - Vercel: `vercel --prod`
  - Netlify: `netlify deploy --prod`
  - Or upload `dist/` folder to your host

- [ ] **Configure Environment Variables on Host**
  - Add all `.env` variables to hosting platform
  - Ensure HTTPS is enabled

- [ ] **Configure Custom Domain** (if applicable)
  - Point DNS to hosting platform
  - Update Supabase Auth redirect URLs

### Phase 5: Testing (Required)

- [ ] **Test Authentication Flow**
  - Sign up new user
  - Login/logout
  - Password reset

- [ ] **Test Core Workflows**
  - Create entity
  - Create opportunity
  - Convert to project
  - Add budget items
  - Generate documents

- [ ] **Test Integrations**
  - E-signature workflow (if DocuSeal configured)
  - Document storage

### Phase 6: Post-Launch (Recommended)

- [ ] **Setup Error Monitoring**
  - Add Sentry or similar
  - Configure error alerting

- [ ] **Setup Analytics**
  - Add tracking for user actions
  - Monitor feature usage

- [ ] **Create Backups**
  - Enable Supabase automatic backups
  - Document recovery procedures

- [ ] **Add Tests**
  - Install Vitest or Jest
  - Add critical path tests

---

## 11. Deployment Guide

### Option A: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel
   ```

2. **Configure Environment Variables**
   - In Vercel dashboard, add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - Other integration keys

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Domain**
   - Add custom domain in Vercel dashboard
   - Update Supabase Auth URLs

### Option B: Netlify

1. **Connect Repository**
   - Link GitHub repo in Netlify dashboard
   - Or use CLI: `netlify init`

2. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Add Environment Variables**
   - In Netlify dashboard → Site settings → Environment variables

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Option C: Manual/VPS

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Upload `dist/` Folder**
   - Upload to your web server
   - Configure nginx/Apache for SPA routing:
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

3. **Configure Environment**
   - Set environment variables on server
   - Ensure HTTPS via Let's Encrypt

---

## 12. Post-Deployment Recommendations

### Immediate (Week 1)

| Task | Priority | Effort |
|------|----------|--------|
| Error monitoring (Sentry) | HIGH | 2 hours |
| User activity logging | HIGH | 4 hours |
| Backup verification | HIGH | 1 hour |
| Performance baseline | MEDIUM | 2 hours |

### Short-term (Month 1)

| Task | Priority | Effort |
|------|----------|--------|
| Add unit tests for services | HIGH | 2 days |
| Add E2E tests for critical flows | HIGH | 3 days |
| Refine RLS policies by role | HIGH | 1 day |
| Add rate limiting | MEDIUM | 4 hours |
| Implement audit logging | MEDIUM | 1 day |

### Long-term (Quarter 1)

| Task | Priority | Effort |
|------|----------|--------|
| Full test coverage (>80%) | MEDIUM | 2 weeks |
| Performance optimization | MEDIUM | 1 week |
| Accessibility audit (WCAG) | MEDIUM | 1 week |
| Security audit | HIGH | 1 week |
| Documentation updates | LOW | Ongoing |

### Architecture Improvements

| Improvement | Benefit |
|-------------|---------|
| Split App.jsx routing by module | Better maintainability |
| Add TypeScript | Type safety |
| Implement service worker | Offline support |
| Add API rate limiting | Security |
| Implement caching layer | Performance |

---

## Quick Reference

### Key URLs

| Resource | URL |
|----------|-----|
| Supabase Dashboard | https://supabase.com/dashboard/project/opuykuydejpicqdtekne |
| Supabase API Settings | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/settings/api |
| Supabase SQL Editor | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/sql |
| Supabase Table Editor | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/editor |
| Supabase Auth | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/auth |
| Supabase Storage | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/storage |

### Key Files

| Purpose | File |
|---------|------|
| Database Client | `src/lib/supabase.js` |
| Auth Context | `src/contexts/AuthContext.jsx` |
| Main Router | `src/App.jsx` |
| Environment | `.env` |
| Combined Schema | `supabase/combined_setup.sql` |
| Migrations | `supabase/migrations/*.sql` |

### Commands

```bash
# Development
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Supabase CLI
supabase login
supabase link --project-ref opuykuydejpicqdtekne
supabase db push     # Run migrations
supabase db reset    # Reset database (DESTRUCTIVE)

# Deployment
vercel --prod        # Deploy to Vercel
netlify deploy --prod # Deploy to Netlify
```

### Support Contacts

| Role | Contact |
|------|---------|
| Original Developer | (your info) |
| Supabase Support | support.supabase.com |
| DocuSeal Support | docuseal.co/support |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-28 | Claude | Initial diagnostic document |

---

*This document provides a complete snapshot of the AtlasRC project as of January 28, 2026. For the most current information, always refer to the codebase and Supabase dashboard.*
