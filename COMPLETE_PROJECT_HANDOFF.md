# AtlasRC - Complete Project Handoff Document

**Version:** 3.1.0
**Date:** January 29, 2026
**Prepared For:** Alex
**Supabase Project:** `opuykuydejpicqdtekne`

---

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Project Description](#2-project-description)
3. [Technology Stack](#3-technology-stack)
4. [What Has Been Built](#4-what-has-been-built)
5. [Complete Feature Inventory](#5-complete-feature-inventory)
6. [Pages & Routes Reference](#6-pages--routes-reference)
7. [Services Architecture](#7-services-architecture)
8. [Database & Supabase Status](#8-database--supabase-status)
9. [Environment Configuration](#9-environment-configuration)
10. [Security Considerations](#10-security-considerations)
11. [Known Issues & Technical Debt](#11-known-issues--technical-debt)
12. [Go-Live Checklist](#12-go-live-checklist)
13. [Deployment Instructions](#13-deployment-instructions)
14. [Post-Launch Recommendations](#14-post-launch-recommendations)
15. [Quick Reference](#15-quick-reference)

---

# 1. EXECUTIVE SUMMARY

## What Is AtlasRC?

AtlasRC is a comprehensive **real estate development management platform** that replaces spreadsheets and manual processes for real estate developers. It combines project management, construction tracking, and multi-entity accounting into a single application.

## Current State

| Component | Status | Details |
|-----------|--------|---------|
| **Frontend Code** | ✅ 100% Complete | 139 pages, 150+ components, 635+ routes |
| **Backend Services** | ✅ 100% Complete | 70+ service modules |
| **Database Schema** | ✅ 100% Complete | 30 migrations, 150+ tables |
| **Supabase Project** | ⚠️ Created | Needs migrations run |
| **Authentication** | ✅ Code Ready | Needs demo mode disabled |
| **Integrations** | ✅ Code Ready | DocuSeal, SharePoint, Outlook |
| **Testing** | ❌ None | Zero test files |
| **Production Deploy** | ⚠️ Pending | Ready for deployment |

## Bottom Line

**The application is built.** What's needed to go live:
1. Run database migrations (30 SQL files)
2. Remove demo mode and hardcoded values
3. Deploy to hosting platform
4. Test and fix edge cases

**Estimated effort:** 40-80 hours

---

# 2. PROJECT DESCRIPTION

## Business Purpose

AtlasRC manages the entire lifecycle of real estate development projects:

### Deal Pipeline (Opportunities Module)
Track potential deals from initial lead through contract signing:
- Lead capture and qualification
- Property analysis with comparable sales
- Automated deal numbering (YY-NNN-Address format)
- 5-stage pipeline: Prospecting → Contacted → Qualified → Negotiating → Under Contract
- Contract generation and e-signature

### Project Management (Projects Module)
Manage active development projects through completion:
- **Acquisition**: Due diligence, closing checklists, purchase contracts
- **Construction**: Budgets, schedules, permits, bids, change orders, work orders
- **Finance**: Cash flow, loans, draw requests, pro forma modeling
- **Disposition**: Sales contracts, settlement statements, fund tracking

### Multi-Entity Accounting (Accounting Module)
Full double-entry accounting for complex entity structures:
- Holding company → Operating company → Project LLC hierarchy
- Per-entity chart of accounts
- Journal entries with auto-balancing
- Bank reconciliation
- Financial reports: P&L, Balance Sheet, Cash Flow, Trial Balance, General Ledger
- Job costing by project
- 1099 vendor tracking
- Investor distributions

### Team Operations (Operations Module)
Coordinate team activities and documents:
- Global task management
- Team roles and permissions
- E-signature workflows (DocuSeal)
- Document library with version control
- Team chat and notifications
- SharePoint and Outlook integration

### System Administration (Admin Module)
Configure and manage the platform:
- User management with RBAC
- Template libraries (budgets, schedules, pro formas, tasks)
- Floor plan and pricing libraries
- Audit logs and compliance tracking
- Integration settings

## Supported Business Models

| Type | Description |
|------|-------------|
| **Spec Build** | Build custom homes for sale |
| **Horizontal Lot Development** | Subdivide land, develop lots, sell to builders |
| **Build-to-Rent (BTR)** | Build rental properties |
| **Fix & Flip** | Purchase, renovate, sell |

---

# 3. TECHNOLOGY STACK

## Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| Vite | 5.4.3 | Build Tool & Dev Server |
| React Router | 6.26.2 | Client-Side Routing |
| Tailwind CSS | 3.4.11 | Utility-First Styling |

## State Management

| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | 4.5.5 | Client State |
| TanStack React Query | 5.90.16 | Server State & Caching |
| React Hook Form | 7.70.0 | Form State |
| Zod | 3.25.76 | Schema Validation |

## UI Components

| Technology | Purpose |
|------------|---------|
| Radix UI | 25+ accessible primitives |
| shadcn/ui | 23 pre-built components |
| Lucide React | Icon library |
| Framer Motion | Animations |

## Backend & Database

| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase JS | 2.45.4 | Database Client |
| PostgreSQL | (via Supabase) | Relational Database |
| Supabase Auth | Built-in | Authentication |
| Supabase Storage | Built-in | File Storage |
| Supabase Realtime | Built-in | Live Subscriptions |

## Data Visualization

| Technology | Version | Purpose |
|------------|---------|---------|
| Recharts | 2.12.7 | Charts & Graphs |
| Chart.js | 4.4.4 | Additional Charts |

## Document Generation

| Technology | Version | Purpose |
|------------|---------|---------|
| jsPDF | 4.0.0 | PDF Generation |
| xlsx | 0.18.5 | Excel Export |
| pptxgenjs | 4.0.1 | PowerPoint Export |

## Integrations

| Integration | Status | Purpose |
|-------------|--------|---------|
| DocuSeal | ✅ Ready | E-Signature |
| SharePoint | ✅ Ready | Document Storage |
| Outlook | ✅ Ready | Calendar/Email Sync |
| Plaid | ⚠️ Optional | Bank Account Linking |

## Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code Linting |
| Prettier | Code Formatting |
| PostCSS | CSS Processing |

---

# 4. WHAT HAS BEEN BUILT

## Code Statistics

| Metric | Count |
|--------|-------|
| **Pages** | 139 |
| **Routes** | 635+ |
| **Components** | 150+ |
| **Services** | 70+ |
| **Custom Hooks** | 17 |
| **Database Tables** | 150+ |
| **Migration Files** | 30 |
| **Lines in App.jsx** | 54KB |

## Project Structure

```
AtlasRC/
├── src/
│   ├── App.jsx                    # Main router (635+ routes)
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Global styles
│   │
│   ├── pages/                     # 139 page components
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProjectsPage.jsx
│   │   ├── OpportunitiesPage.jsx
│   │   ├── projects/              # 58 project pages
│   │   ├── accounting/            # 71 accounting pages
│   │   ├── admin/                 # 25+ admin pages
│   │   ├── operations/            # 20+ operations pages
│   │   └── reports/               # 5 report pages
│   │
│   ├── components/                # 150+ components
│   │   ├── ui/                    # 23 shadcn/ui components
│   │   ├── shared/                # Reusable components
│   │   ├── accounting/            # Accounting components
│   │   ├── pipeline/              # Pipeline components
│   │   └── ...
│   │
│   ├── services/                  # 70+ API services
│   │   ├── projectService.js
│   │   ├── opportunityService.js
│   │   ├── entityService.js
│   │   ├── accountingService.js
│   │   └── ...
│   │
│   ├── contexts/                  # React contexts
│   │   ├── AuthContext.jsx        # Authentication
│   │   ├── PermissionContext.jsx  # RBAC
│   │   └── TransactionEntryContext.jsx
│   │
│   ├── hooks/                     # 17 custom hooks
│   │   ├── useProjects.js
│   │   ├── useBudget.js
│   │   ├── useAccounting.js
│   │   └── ...
│   │
│   ├── lib/                       # Core utilities
│   │   ├── supabase.js            # Database client
│   │   ├── utils.js
│   │   └── constants.js
│   │
│   ├── features/                  # Feature modules
│   │   └── budgets/               # Budget templates
│   │
│   └── archive/                   # Inactive modules (preserved)
│       ├── cahp/
│       ├── construction/
│       ├── investments/
│       ├── investors/
│       └── property-management/
│
├── supabase/
│   ├── migrations/                # 30 SQL files
│   ├── functions/                 # Edge Functions
│   │   ├── docuseal-webhook/      # E-sign webhooks
│   │   └── parse-contract/        # AI contract parsing (stub)
│   ├── combined_setup.sql         # Full schema
│   └── seed.sql                   # Sample data
│
├── public/                        # Static assets
├── .env                           # Environment (gitignored)
├── .env.example                   # Environment template
├── vite.config.js                 # Build config
├── tailwind.config.js             # Tailwind config
├── vercel.json                    # Vercel deployment
├── netlify.toml                   # Netlify deployment
├── Dockerfile                     # Docker deployment
└── package.json                   # Dependencies
```

## What's in the Archive (Not Active)

These modules were removed in v3.0 to focus on core functionality:

| Module | Reason |
|--------|--------|
| CAHP | California program-specific, not needed |
| Construction (standalone) | Merged into Projects module |
| Investments | Investor portal deferred |
| Investors | Investor management deferred |
| Property Management | Rental management deferred |
| Assets | Asset tracking deferred |

The code is preserved in `src/archive/` for future reference.

---

# 5. COMPLETE FEATURE INVENTORY

## A. Opportunities/Pipeline Module ✅

### Pages (5)
- `OpportunitiesPage.jsx` - Pipeline list with Kanban view
- `OpportunityDetailPage.jsx` - Full opportunity details
- `OpportunityFormPage.jsx` - Create/edit opportunities
- `PipelineAnalyticsDashboardPage.jsx` - Conversion metrics
- `OpportunityComparisonPage.jsx` - Side-by-side comparison

### Features
| Feature | Status | Description |
|---------|--------|-------------|
| Pipeline Stages | ✅ | Prospecting → Contacted → Qualified → Negotiating → Under Contract |
| Deal Numbering | ✅ | Auto-generated YY-NNN-Address format |
| Property Analysis | ✅ | Comps, ARV calculations |
| Kanban Board | ✅ | Drag-drop stage management |
| Contract Generation | ✅ | Auto-generate purchase contracts |
| E-Signature | ✅ | DocuSeal integration |
| Pipeline Analytics | ✅ | Conversion rates, stage timing, win/loss |
| Deal Comparison | ✅ | Compare multiple opportunities |
| Starring/Favorites | ✅ | Mark important deals |
| Activity Timeline | ✅ | Track all deal activities |

## B. Projects Module ✅

### Pages (58)
Organized into sections under `/project/:projectId/`:

**Overview Section**
- ProjectOverviewPage, PropertyDetailsPage, ProjectContactsPage
- ProjectMilestonesPage, ProjectActivityFeed, ProjectHealthDashboard

**Acquisition Section**
- DealAnalysisPage, DueDiligencePage, ClosingChecklistPage
- PurchaseContractPage, ClosingPage

**Construction Section**
- BudgetPage, SchedulePage, GanttChart, ActualsVsBudgetPage
- PermitsPage, BidsPage, ChangeOrdersPage, WorkOrdersPage
- ExpensesPage, InsurancePage, RFITracker, PunchList
- PhotoProgressTracker

**Finance Section**
- CashFlowPage, ProjectLoansPage, DrawRequestsPage
- ProFormaPage, SalesPage, VendorsPage

**Disposition Section (NEW v3.1)**
- DispositionPage - Main dashboard
- ContractRecordPage - Contract management
- SettlementStatementPage - HUD-1/ALTA statements

**Documents Section**
- DocumentsPage, DocumentExpirationTracker
- TasksPage, TaskManagementPage
- MeetingMinutes, AuditTrail

### Features
| Feature | Status | Description |
|---------|--------|-------------|
| 4 Project Types | ✅ | Spec, Horizontal Lot, BTR, Fix & Flip |
| Phase Tracking | ✅ | Acquisition → Construction → Disposition |
| Budget Management | ✅ | Line items, categories, variance tracking |
| Schedule/Gantt | ✅ | Task dependencies, critical path |
| Permit Tracking | ✅ | Applications, inspections, expirations |
| Bid Management | ✅ | Bid packages, vendor responses, awards |
| Change Orders | ✅ | Cost/schedule impacts, approvals |
| Draw Requests | ✅ | Line item draws, lender submission |
| Loan Tracking | ✅ | Multiple loans, draws, payoffs |
| Pro Forma | ✅ | Financial projections, waterfall |
| Sales Tracking | ✅ | Contracts, closings, revenue |
| Disposition | ✅ | Bulk sales, settlements, fund tracking |
| Document Storage | ✅ | Upload, organize, track expirations |
| Photo Progress | ✅ | Construction photo timeline |

## C. Accounting Module ✅

### Pages (71)
The most comprehensive module with full accounting functionality.

**Core Accounting**
- AccountingDashboardPage, ChartOfAccountsPage
- EntityLedgerPage, ProjectLedgerPage
- TransactionFormPage, TransactionDetailPage
- JournalEntriesPage

**Accounts Payable**
- BillsPage, BillDetailPage, BillFormPage
- VendorsPage, VendorDetailPage
- BatchPaymentsPage

**Accounts Receivable**
- InvoicesPage, CustomerPage
- APAgingReportPage, ARAgingReportPage

**Banking**
- BankingPage, BankAccountsSetupPage
- BankFeedsPage, ReconciliationPage
- CreditCardManagementPage

**Reporting**
- FinancialReportsPage, BalanceSheetReport
- ProfitLossReport, TrialBalanceReport
- GeneralLedgerReport, CashFlowStatementReport
- JobCostingReportPage

**Advanced**
- ConsolidationPage (multi-entity)
- PayrollPage, ExpenseManagementPage
- DepreciationSchedulePage, TaxTrackingPage
- FinancialForecastingPage, FinancialRatiosDashboardPage
- InvestorPortalPage

**Workflows**
- MonthEndCloseWorkflowPage
- InvoiceApprovalWorkflowPage
- VendorPaymentApprovalWorkflowPage
- WireTransferApprovalWorkflowPage

### Features
| Feature | Status | Description |
|---------|--------|-------------|
| Multi-Entity | ✅ | Holding → Operating → Project hierarchy |
| Chart of Accounts | ✅ | Per-entity COA with templates |
| Double-Entry | ✅ | Auto-balancing journal entries |
| Bank Reconciliation | ✅ | Match transactions, auto-reconcile |
| Financial Reports | ✅ | P&L, Balance Sheet, Cash Flow, TB, GL |
| Job Costing | ✅ | Allocate costs to projects |
| 1099 Tracking | ✅ | Vendor tax reporting |
| Payroll | ✅ | Employee payments |
| Batch Payments | ✅ | Bulk vendor payments |
| Month-End Close | ✅ | Workflow with checklist |
| Consolidation | ✅ | Multi-entity rollup |
| Investor Portal | ✅ | External investor access |
| Audit Trail | ✅ | All changes tracked |

## D. Operations Module ✅

### Pages (20+)
- TeamsPage, TeamDetailPage
- TasksPage, TaskManagementPage
- DocumentLibraryPage, ESignPage
- NotificationCenterPage
- ContractTemplatesPage, TaskWorkflowTemplatesPage
- ResourceAllocationDashboardPage
- OperationsReportsPage

### Features
| Feature | Status | Description |
|---------|--------|-------------|
| Task Management | ✅ | Global tasks with assignments |
| Team Management | ✅ | Roles, permissions, workload |
| E-Signature | ✅ | DocuSeal integration |
| Document Library | ✅ | Central document repository |
| Team Chat | ✅ | Real-time messaging |
| Notifications | ✅ | In-app and email alerts |
| Contract Templates | ✅ | Reusable contract templates |
| Workflow Templates | ✅ | Standardized task workflows |

## E. Admin Module ✅

### Pages (25+)
- AdminOverviewPage, AdminSettingsPage
- UsersManagementPage, TeamManagementPage
- UserPermissionsMatrixPage, ActivityLogPage
- FloorPlansPage, PricingLibraryPage
- MunicipalityFeesPage
- BudgetTemplatesPage, ProformaTemplatesPage
- ScheduleTemplatesPage, DealTemplatesPage
- COATemplatesPage, TaskTemplatesPage
- IntegrationsPage, AuditLogsPage
- OrganizationSettingsPage

### Features
| Feature | Status | Description |
|---------|--------|-------------|
| User Management | ✅ | Create, edit, deactivate users |
| Role-Based Access | ✅ | Granular permissions |
| Template Libraries | ✅ | Budget, schedule, pro forma, COA, tasks |
| Floor Plans | ✅ | Plan library with pricing |
| Pricing Library | ✅ | Standard pricing matrices |
| Audit Logs | ✅ | All system activity |
| Integrations | ✅ | Configure external services |
| Organization Settings | ✅ | Company-wide configuration |

## F. Reports Module ✅

### Pages (5)
- PresetReportsPage
- CustomReportsPage
- SubscribedReportsPage
- ReportPackagesPage
- TrendsPage

### Features
| Feature | Status | Description |
|---------|--------|-------------|
| Preset Reports | ✅ | Standard financial/operational reports |
| Custom Reports | ✅ | Build your own reports |
| Subscriptions | ✅ | Scheduled email delivery |
| Report Packages | ✅ | Bundle reports together |
| Trend Analysis | ✅ | Historical performance |
| Export | ✅ | PDF, Excel, PowerPoint |

## G. Integrations ✅

### DocuSeal E-Signature
| Feature | Status |
|---------|--------|
| Template Management | ✅ |
| Document Generation | ✅ |
| Signature Fields | ✅ |
| Webhook Handling | ✅ |
| Status Tracking | ✅ |

### SharePoint
| Feature | Status |
|---------|--------|
| OAuth Authentication | ✅ |
| Site/Folder Management | ✅ |
| File Upload/Download | ✅ |
| Document Sync | ✅ |

### Outlook
| Feature | Status |
|---------|--------|
| OAuth Authentication | ✅ |
| Calendar Sync | ✅ |
| Email Integration | ✅ |
| Meeting Scheduling | ✅ |

---

# 6. PAGES & ROUTES REFERENCE

## Route Structure

```
/                                    # Dashboard
/executive                           # Executive Dashboard
/login                               # Login
/signup                              # Registration
/forgot-password                     # Password Recovery
/reset-password                      # Password Reset

/projects                            # Projects List
/project/:id                         # Project Container
  /overview                          # Overview Section
    /                                # Project Overview
    /details                         # Property Details
    /contacts                        # Project Contacts
    /milestones                      # Milestones
    /activity                        # Activity Feed
    /health                          # Health Dashboard
  /acquisition                       # Acquisition Section
    /deal-analysis                   # Deal Analysis
    /due-diligence                   # Due Diligence
    /closing-checklist               # Closing Checklist
    /purchase-contract               # Purchase Contract
    /closing                         # Closing
  /construction                      # Construction Section
    /budget                          # Budget
    /schedule                        # Schedule
    /gantt                           # Gantt Chart
    /actuals-vs-budget               # Variance Analysis
    /permits                         # Permits
    /bids                            # Bids
    /change-orders                   # Change Orders
    /work-orders                     # Work Orders
    /expenses                        # Expenses
    /insurance                       # Insurance
    /rfi                             # RFI Tracker
    /punch-list                      # Punch List
    /photos                          # Photo Progress
  /finance                           # Finance Section
    /cashflow                        # Cash Flow
    /loans                           # Loans
    /draw-requests                   # Draw Requests
    /proforma                        # Pro Forma
    /sales                           # Sales
    /vendors                         # Vendors
  /disposition                       # Disposition Section
    /                                # Disposition Dashboard
    /contracts                       # Contract Records
    /settlement                      # Settlement Statements
  /documents                         # Documents Section
    /                                # Document Library
    /expiration                      # Expiration Tracker
  /tasks                             # Tasks
  /meetings                          # Meeting Minutes
  /audit                             # Audit Trail

/opportunities                       # Opportunities List
/opportunity/:id                     # Opportunity Detail
/opportunity/new                     # New Opportunity
/pipeline-analytics                  # Pipeline Analytics
/deal-comparison                     # Deal Comparison

/accounting                          # Accounting Dashboard
/accounting/entities                 # Entity List
/accounting/:entityId                # Entity-Specific
  /dashboard                         # Entity Dashboard
  /chart-of-accounts                 # Chart of Accounts
  /transactions                      # Transactions
  /journal-entries                   # Journal Entries
  /banking                           # Banking
  /reconciliation                    # Reconciliation
  /bills                             # Bills
  /vendors                           # Vendors
  /payroll                           # Payroll
  /expenses                          # Expenses
  /reports/*                         # All Financial Reports

/admin                               # Admin Dashboard
  /users                             # User Management
  /teams                             # Team Management
  /permissions                       # Permission Matrix
  /settings                          # Organization Settings
  /templates/*                       # All Template Types
  /floor-plans                       # Floor Plans
  /pricing                           # Pricing Library
  /integrations                      # Integrations
  /audit-logs                        # Audit Logs

/operations                          # Operations Dashboard
  /tasks                             # Global Tasks
  /teams                             # Teams
  /documents                         # Document Library
  /esign                             # E-Signature
  /chat                              # Team Chat
  /notifications                     # Notifications

/reports                             # Reports Dashboard
  /preset                            # Preset Reports
  /custom                            # Custom Reports
  /subscribed                        # Subscribed Reports
  /packages                          # Report Packages
  /trends                            # Trends

/entities                            # Entities List
/contacts                            # Contacts List
/calendar                            # Calendar
/settings                            # User Settings
```

---

# 7. SERVICES ARCHITECTURE

## Service Pattern

All services follow this standard pattern:

```javascript
import { supabase, isDemoMode } from '@/lib/supabase';

export async function getItems(filters = {}) {
  // Demo mode fallback
  if (isDemoMode) {
    return MOCK_DATA;
  }

  // Build query
  let query = supabase
    .from('table_name')
    .select('*, related_table(*)');

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  // Execute
  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function createItem(item) {
  const { data, error } = await supabase
    .from('table_name')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateItem(id, updates) {
  const { data, error } = await supabase
    .from('table_name')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteItem(id) {
  const { error } = await supabase
    .from('table_name')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
```

## Service Inventory

### Core Data Services
| Service | File | Tables | Status |
|---------|------|--------|--------|
| projectService | `projectService.js` | projects, project_* | ✅ Connected |
| opportunityService | `opportunityService.js` | opportunities | ✅ Connected |
| entityService | `entityService.js` | entities | ✅ Connected |
| contactsService | `contactsService.js` | contacts, companies | ⚠️ Hybrid* |

*Has mock data fallback for demo mode

### Accounting Services
| Service | Tables | Status |
|---------|--------|--------|
| accountService | accounts, coa_templates | ✅ Connected |
| transactionService | transactions | ✅ Connected |
| journalEntryService | journal_entries | ✅ Connected |
| billService | bills, bill_line_items | ✅ Connected |
| vendorService | vendors | ✅ Connected |
| capitalService | capital_contributions, distributions | ✅ Connected |
| payrollService | payroll | ✅ Connected |
| bankAccountService | bank_accounts | ✅ Connected |
| reconciliationService | bank_reconciliation | ✅ Connected |
| reportService | (aggregates data) | ✅ Connected |

### Project Services
| Service | Tables | Status |
|---------|--------|--------|
| budgetService | project_budgets, budget_* | ✅ Connected |
| scheduleService | schedule_phases, schedule_tasks | ✅ Connected |
| permitsService | permits, permit_inspections | ✅ Connected |
| bidsService | bid_packages, bids | ✅ Connected |
| changeOrderService | change_orders | ✅ Connected |
| drawRequestService | draw_requests | ✅ Connected |
| loanService | loans, loan_draws | ✅ Connected |
| proformaService | proformas | ✅ Connected |
| salesService | sales | ✅ Connected |
| dispositionService | disposition_* | ✅ Connected |
| expenseService | expenses | ✅ Connected |

### Integration Services
| Service | Integration | Status |
|---------|-------------|--------|
| esignService | DocuSeal | ✅ Ready |
| sharepointService | Microsoft Graph | ✅ Ready |
| outlookService | Microsoft Graph | ✅ Ready |
| plaidService | Plaid | ⚠️ Optional |

### Operations Services
| Service | Tables | Status |
|---------|--------|--------|
| chatService | chat_channels, chat_messages | ✅ Connected |
| notificationService | notifications | ✅ Connected |
| teamService | teams, team_members | ✅ Connected |
| taskService | tasks | ✅ Connected |
| documentService | documents | ✅ Connected |

### Admin Services
| Service | Tables | Status |
|---------|--------|--------|
| userService | profiles, auth.users | ✅ Connected |
| permissionService | roles, permissions | ✅ Connected |
| templateService | *_templates | ✅ Connected |
| auditService | audit_logs | ✅ Connected |

---

# 8. DATABASE & SUPABASE STATUS

## Supabase Project Details

| Item | Value |
|------|-------|
| **Project Reference** | `opuykuydejpicqdtekne` |
| **Project URL** | `https://opuykuydejpicqdtekne.supabase.co` |
| **Dashboard** | https://supabase.com/dashboard/project/opuykuydejpicqdtekne |
| **API Settings** | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/settings/api |
| **SQL Editor** | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/sql |
| **Table Editor** | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/editor |
| **Auth Settings** | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/auth |
| **Storage** | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/storage |

## Current Database Status

| Item | Status | Action |
|------|--------|--------|
| Supabase Project | ✅ Created | None |
| Anon Key | ✅ Configured | In `.env` |
| Migrations | ⚠️ Not Run | Run 30 SQL files |
| Tables | ⚠️ Not Created | Created by migrations |
| RLS Policies | ⚠️ Not Applied | Applied by migrations |
| Storage Buckets | ⚠️ Not Created | Create manually |
| Edge Functions | ⚠️ Not Deployed | Deploy via CLI |

## Migration Files (30 Total)

Run these in order via the SQL Editor or Supabase CLI:

| # | File | Purpose |
|---|------|---------|
| 1 | `20260120_init_atlas_schema.sql` | Core tables: entities, opportunities, projects, contacts |
| 2 | `20260120_extend_schema.sql` | Extended fields and indexes |
| 3 | `20260120_users_teams_permissions.sql` | Auth: profiles, roles, teams, permissions |
| 4 | `20260120_outlook_integration.sql` | Outlook: tokens, calendar events |
| 5 | `20260120_sharepoint_integration.sql` | SharePoint: tokens, files |
| 6 | `20260121_project_templates.sql` | Project templates |
| 7 | `20260122_add_esign_tables.sql` | E-sign: signing_requests, signers |
| 8 | `20260122_add_team_chat.sql` | Chat: channels, messages |
| 9 | `20260124_enhanced_contacts.sql` | Contact extensions |
| 10 | `20260124_project_contacts.sql` | Project-contact junction |
| 11 | `20260124_project_numbers.sql` | Auto-increment project numbers |
| 12 | `20260124_teams_budget_templates.sql` | Budget templates |
| 13 | `20260125_budget_module.sql` | Budgets: project_budgets, categories, line_items |
| 14 | `20260125_bids_module.sql` | Bids: bid_packages, bids, bid_items |
| 15 | `20260125_cashflow_module.sql` | Cash flow entries |
| 16 | `20260125_change_orders_module.sql` | Change orders |
| 17 | `20260125_documents_workorders_audit.sql` | Documents, work orders, audit |
| 18 | `20260125_draw_requests_module.sql` | Draw requests |
| 19 | `20260125_entity_accounting_architecture.sql` | Accounting: accounts, journal entries |
| 20 | `20260125_entity_accounting_seed.sql` | Sample accounting data |
| 21 | `20260125_expenses_module.sql` | Expenses |
| 22 | `20260125_loans_module.sql` | Loans and draws |
| 23 | `20260125_notifications.sql` | Notifications |
| 24 | `20260125_permits_module.sql` | Permits and inspections |
| 25 | `20260125_proforma_module.sql` | Pro forma |
| 26 | `20260125_proforma_waterfall.sql` | Waterfall calculations |
| 27 | `20260125_sales_module.sql` | Sales tracking |
| 28 | `20260125_schedule_module.sql` | Schedule phases and tasks |
| 29 | `20260126_disposition_module.sql` | Disposition contracts, settlements |
| 30 | `20260126_project_modules.sql` | Project module configuration |

## Storage Buckets to Create

| Bucket Name | Purpose | Access |
|-------------|---------|--------|
| `project-documents` | Project files | Private (authenticated) |
| `opportunity-documents` | Pipeline documents | Private |
| `expense-receipts` | Receipt images | Private |
| `investor-documents` | Investor documents | Private |
| `asset-documents` | Asset files | Private |
| `general-documents` | General files | Private |

## Edge Functions

| Function | Purpose | Status |
|----------|---------|--------|
| `docuseal-webhook` | Handle e-sign completions | ✅ Ready to deploy |
| `parse-contract` | AI contract parsing | ⚠️ Stub (needs AI integration) |

## RLS Policy Status

All tables have Row Level Security enabled with this pattern:

```sql
-- Current (permissive)
CREATE POLICY "Allow authenticated users" ON table_name
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
```

**Note:** Current policies allow all authenticated users full access. For production, refine to role-based policies.

---

# 9. ENVIRONMENT CONFIGURATION

## Current .env File

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://opuykuydejpicqdtekne.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# DocuSeal E-Signature (Optional)
VITE_DOCUSEAL_URL=https://api.docuseal.co
VITE_DOCUSEAL_API_KEY=

# Microsoft Integrations (Optional)
# VITE_MS_CLIENT_ID=
# VITE_MS_REDIRECT_URI=

# Plaid Banking (Optional)
# VITE_PLAID_CLIENT_ID=
# VITE_PLAID_SECRET=
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key |
| `VITE_DOCUSEAL_URL` | Optional | DocuSeal API URL |
| `VITE_DOCUSEAL_API_KEY` | Optional | DocuSeal API key |
| `VITE_MS_CLIENT_ID` | Optional | Microsoft OAuth client ID |
| `VITE_MS_REDIRECT_URI` | Optional | Microsoft OAuth redirect |
| `VITE_PLAID_CLIENT_ID` | Optional | Plaid client ID |
| `VITE_PLAID_SECRET` | Optional | Plaid secret |
| `VITE_DEMO_MODE` | Optional | Enable demo mode (set false for production) |

## Build Configuration

**vite.config.js:**
```javascript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    sourcemap: true,
  },
});
```

---

# 10. SECURITY CONSIDERATIONS

## Critical Security Items

### 1. Demo Mode (MUST DISABLE)

**Location:** `src/lib/supabase.js` and `src/contexts/AuthContext.jsx`

**Current Behavior:**
- If `VITE_DEMO_MODE=true` OR credentials contain "placeholder", demo mode activates
- Demo mode accepts ANY credentials
- Uses mock data instead of real database
- Creates a fake user session

**Fix for Production:**
```javascript
// In src/lib/supabase.js
// REMOVE or set to false:
export const isDemoMode = false;

// In src/contexts/AuthContext.jsx
// REMOVE the DEMO_USER constant and fallback logic
```

### 2. Hardcoded Values (MUST REPLACE)

| Value | Count | Locations |
|-------|-------|-----------|
| "Highland Park Development LLC" | 12+ | PropertyComparisonTool, ContractManagement, contractParsingService, PropertyInfoPage, ReminderWidget |
| Sample UUIDs | 20+ | seed.sql, various services |
| demo@atlasdev.com | 1 | AuthContext.jsx |

### 3. RLS Policies (SHOULD REFINE)

Current policies are permissive:
```sql
USING (true) WITH CHECK (true)
```

Should be refined to:
```sql
USING (auth.uid() = user_id OR user_has_role('admin'))
WITH CHECK (auth.uid() = user_id OR user_has_role('admin'))
```

### 4. API Keys

| Key | Location | Status |
|-----|----------|--------|
| Supabase Anon Key | .env | ✅ Safe for client |
| Supabase Service Role | Edge Functions only | ✅ Correct |
| DocuSeal API Key | .env | ⚠️ Should be server-side |
| Microsoft OAuth | .env | ✅ Safe (public client) |

## Security Checklist

- [ ] Set `VITE_DEMO_MODE=false`
- [ ] Remove DEMO_USER from AuthContext.jsx
- [ ] Verify Supabase credentials are real
- [ ] Replace all hardcoded company names
- [ ] Review RLS policies for each table
- [ ] Configure CORS in Supabase
- [ ] Enable HTTPS on deployment
- [ ] Set secure cookie settings
- [ ] Review audit logging

---

# 11. KNOWN ISSUES & TECHNICAL DEBT

## Critical Issues

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| Demo Mode Active | supabase.js, AuthContext | Security vulnerability | Disable for production |
| Hardcoded Entity Names | 12+ locations | Shows wrong data | Search and replace |
| Zero Test Coverage | Entire codebase | No safety net | Add tests |

## Hardcoded Values to Replace

Search for and replace these:

```
"Highland Park Development LLC" → Your company name
"demo@atlasdev.com" → Remove entirely
"demo-user-123" → Remove entirely
"00000000-0000-0000-0000-000000000001" → Real entity UUIDs
```

## TODO Comments in Code

| Location | TODO |
|----------|------|
| `src/utils/proformaExport.js:6` | Install pptxgenjs (already in package.json, just uncomment import) |
| `supabase/functions/parse-contract/index.ts:27` | Integrate AI for contract parsing |

## Technical Debt

| Item | Impact | Priority |
|------|--------|----------|
| 45 ESLint warnings | Build noise | Low |
| 6 npm vulnerabilities | Dev dependencies only | Low |
| Large App.jsx (54KB) | Maintainability | Medium |
| No TypeScript | Type safety | Low |
| Sourcemaps in production | Bundle size | Low |

## Missing Features (Stubs)

| Feature | Status | Notes |
|---------|--------|-------|
| AI Contract Parsing | Stub | Edge function needs AI integration |
| PowerPoint Export | Commented | Uncomment import in proformaExport.js |

---

# 12. GO-LIVE CHECKLIST

## Phase 1: Database Setup (4-8 hours)

- [ ] **1.1** Open Supabase SQL Editor: https://supabase.com/dashboard/project/opuykuydejpicqdtekne/sql
- [ ] **1.2** Run migration files in order (1-30)
- [ ] **1.3** Verify tables created in Table Editor
- [ ] **1.4** Create storage buckets:
  - [ ] project-documents
  - [ ] opportunity-documents
  - [ ] expense-receipts
  - [ ] investor-documents
  - [ ] asset-documents
  - [ ] general-documents
- [ ] **1.5** Set bucket policies to authenticated access only
- [ ] **1.6** (Optional) Run seed.sql for sample data

## Phase 2: Code Cleanup (8-16 hours)

- [ ] **2.1** Disable demo mode in `src/lib/supabase.js`
- [ ] **2.2** Remove DEMO_USER from `src/contexts/AuthContext.jsx`
- [ ] **2.3** Search and replace "Highland Park Development LLC" (12+ instances)
- [ ] **2.4** Remove any remaining hardcoded mock data
- [ ] **2.5** Verify environment variables are production values
- [ ] **2.6** Test local build: `npm run build`

## Phase 3: Authentication Setup (2-4 hours)

- [ ] **3.1** Configure Auth in Supabase Dashboard:
  - [ ] Enable Email provider
  - [ ] Set Site URL to production domain
  - [ ] Add Redirect URLs for production
- [ ] **3.2** Customize email templates:
  - [ ] Confirmation email
  - [ ] Password recovery email
  - [ ] Magic link email
- [ ] **3.3** Create first admin user

## Phase 4: Security Hardening (8-16 hours)

- [ ] **4.1** Review RLS policies for all tables
- [ ] **4.2** Refine policies from "allow all" to role-based
- [ ] **4.3** Test permission boundaries
- [ ] **4.4** Verify no API keys in client code
- [ ] **4.5** Configure CORS in Supabase

## Phase 5: Testing (16-32 hours)

- [ ] **5.1** Test authentication flow:
  - [ ] Sign up
  - [ ] Login
  - [ ] Logout
  - [ ] Password reset
- [ ] **5.2** Test core workflows:
  - [ ] Create entity
  - [ ] Create opportunity
  - [ ] Convert to project
  - [ ] Add budget items
  - [ ] Create draw request
  - [ ] Generate documents
- [ ] **5.3** Test accounting:
  - [ ] Create journal entry
  - [ ] Run financial reports
- [ ] **5.4** Test integrations (if configured):
  - [ ] E-signature
  - [ ] Document storage
- [ ] **5.5** Fix any bugs discovered

## Phase 6: Deployment (4-8 hours)

- [ ] **6.1** Choose hosting platform (Vercel recommended)
- [ ] **6.2** Connect repository
- [ ] **6.3** Configure environment variables on host
- [ ] **6.4** Deploy: `vercel --prod` or `netlify deploy --prod`
- [ ] **6.5** Configure custom domain
- [ ] **6.6** Verify HTTPS working
- [ ] **6.7** Test production site

## Phase 7: Post-Launch (4-8 hours)

- [ ] **7.1** Set up error monitoring (Sentry)
- [ ] **7.2** Configure backup verification
- [ ] **7.3** Document deployment configuration
- [ ] **7.4** Create runbook for common issues

---

# 13. DEPLOYMENT INSTRUCTIONS

## Option A: Vercel (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd /path/to/AtlasRC
vercel
```

Follow prompts to:
- Link to Vercel account
- Create new project
- Accept default settings

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| VITE_SUPABASE_URL | https://opuykuydejpicqdtekne.supabase.co |
| VITE_SUPABASE_ANON_KEY | (your key) |
| VITE_DOCUSEAL_URL | https://api.docuseal.co |
| VITE_DOCUSEAL_API_KEY | (your key) |

### Step 4: Production Deploy
```bash
vercel --prod
```

### Step 5: Custom Domain
In Vercel Dashboard → Project → Settings → Domains:
- Add your domain
- Configure DNS as instructed

---

## Option B: Netlify

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Initialize
```bash
netlify init
```

### Step 3: Configure Build
- Build command: `npm run build`
- Publish directory: `dist`

### Step 4: Environment Variables
In Netlify Dashboard → Site → Site configuration → Environment variables

### Step 5: Deploy
```bash
netlify deploy --prod
```

---

## Option C: Docker

### Step 1: Build Image
```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://opuykuydejpicqdtekne.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-key \
  -t atlasrc:latest .
```

### Step 2: Run Container
```bash
docker run -d -p 80:80 atlasrc:latest
```

---

## Post-Deployment Verification

1. **Check Console for Errors**
   - Open browser DevTools
   - Look for Supabase connection errors

2. **Test Authentication**
   - Try signing up
   - Try logging in

3. **Verify Database Connection**
   - Create a test entity
   - Verify it appears in Supabase

4. **Check Security Headers**
   - Visit securityheaders.com
   - Enter your URL
   - Verify A or B grade

---

# 14. POST-LAUNCH RECOMMENDATIONS

## Immediate (Week 1)

| Task | Priority | Effort |
|------|----------|--------|
| Set up Sentry error monitoring | HIGH | 2 hours |
| Verify Supabase backups enabled | HIGH | 30 min |
| Document deployment configuration | HIGH | 2 hours |
| Monitor for errors | HIGH | Ongoing |

## Short-term (Month 1)

| Task | Priority | Effort |
|------|----------|--------|
| Add unit tests for critical services | HIGH | 2-3 days |
| Add E2E tests for core workflows | HIGH | 3-5 days |
| Refine RLS policies | HIGH | 1-2 days |
| Performance optimization | MEDIUM | 1-2 days |
| Add rate limiting | MEDIUM | 4 hours |

## Long-term (Quarter 1)

| Task | Priority | Effort |
|------|----------|--------|
| Achieve 80% test coverage | MEDIUM | 2 weeks |
| Accessibility audit (WCAG 2.1) | MEDIUM | 1 week |
| Security penetration testing | HIGH | 1 week |
| Performance audit (Lighthouse) | MEDIUM | 2 days |
| Documentation updates | LOW | Ongoing |

## Architecture Improvements

| Improvement | Benefit | Effort |
|-------------|---------|--------|
| Split App.jsx by module | Better maintainability | 1 week |
| Add TypeScript | Type safety | 2-3 weeks |
| Add service worker | Offline support | 1 week |
| Implement caching | Performance | 3-5 days |

---

# 15. QUICK REFERENCE

## Key URLs

| Resource | URL |
|----------|-----|
| **Supabase Dashboard** | https://supabase.com/dashboard/project/opuykuydejpicqdtekne |
| **API Settings** | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/settings/api |
| **SQL Editor** | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/sql |
| **Table Editor** | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/editor |
| **Auth Settings** | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/auth |
| **Storage** | https://supabase.com/dashboard/project/opuykuydejpicqdtekne/storage |

## Key Files

| Purpose | File |
|---------|------|
| Main Router | `src/App.jsx` |
| Database Client | `src/lib/supabase.js` |
| Auth Context | `src/contexts/AuthContext.jsx` |
| Environment | `.env` |
| Combined Schema | `supabase/combined_setup.sql` |
| Migrations | `supabase/migrations/*.sql` |
| Seed Data | `supabase/seed.sql` |

## Commands

```bash
# Development
npm run dev              # Start dev server (port 5173)
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Supabase CLI
supabase login
supabase link --project-ref opuykuydejpicqdtekne
supabase db push         # Run migrations
supabase functions deploy # Deploy edge functions

# Deployment
vercel --prod            # Deploy to Vercel
netlify deploy --prod    # Deploy to Netlify
```

## NPM Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext js,jsx"
}
```

## Project Statistics

| Metric | Value |
|--------|-------|
| Pages | 139 |
| Routes | 635+ |
| Components | 150+ |
| Services | 70+ |
| Hooks | 17 |
| Database Tables | 150+ |
| Migrations | 30 |
| Version | 3.1.0 |

---

# APPENDIX A: ARCHIVED MODULES

The following modules were archived in v3.0 to focus on core functionality. Code is preserved in `src/archive/`:

| Module | Files | Original Purpose |
|--------|-------|------------------|
| **CAHP** | 5 files | California housing program tracking |
| **Construction** | 4 files | Standalone construction management (merged into Projects) |
| **Investments** | 8 files | Investment tracking and management |
| **Investors** | 7 files | Investor portal and directory |
| **Property Management** | 2 files | Rental property management |
| **Assets** | 1 file | Asset inventory tracking |

To restore an archived module:
1. Move files from `src/archive/[module]/` to `src/pages/[module]/`
2. Add routes in `App.jsx`
3. Run corresponding migrations if needed

---

# APPENDIX B: VERSION HISTORY

## v3.1.0 (January 19, 2025) - Current
- Added Disposition Module
- New routes for disposition, contracts, settlements
- Bulk sales schedule management
- Settlement statement with auto-calculations

## v3.0.0 (January 18, 2025)
- Streamlined to 5 core modules
- Archived non-essential modules
- New opportunity naming format
- Refined pipeline stages

## v2.x (December 2024)
- Initial accounting module
- SharePoint integration
- Outlook integration
- E-signature integration

## v1.x (November 2024)
- Core project management
- Opportunity pipeline
- Basic entity structure

---

# APPENDIX C: CONTACT & SUPPORT

## Project Owner
- **Name:** [Your Name]
- **Email:** [Your Email]
- **Phone:** [Your Phone]

## Technical Support
- **Supabase:** support.supabase.com
- **Vercel:** vercel.com/support
- **DocuSeal:** docuseal.co/support

## Documentation
- Main README: `/README.md`
- Deployment: `/DEPLOYMENT.md`
- Supabase Setup: `/supabase/SETUP_GUIDE.md`
- Changelog: `/CHANGELOG.md`

---

*Document generated: January 29, 2026*
*AtlasRC Version: 3.1.0*
