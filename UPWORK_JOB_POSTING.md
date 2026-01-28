# Upwork Job Posting - AtlasRC Production Deployment

## Summary

We're seeking an experienced React/Supabase developer to take a **fully-built** real estate development platform from development to production. AtlasRC is a comprehensive application with 139 pages, 70+ services, and a complete database schema - it needs final configuration, testing, and deployment to go live.

This is NOT a build project - the code is written. This is a **deployment and polish** project.

---

## About the Project

AtlasRC replaces spreadsheets and manual processes for real estate developers by combining project management and accounting functionality. The platform manages the entire lifecycle of real estate projects including:

- **Deal Pipeline** - Opportunity tracking from lead to contract
- **Project Management** - Phase-based workflows, budgets, schedules, permits
- **Construction Tracking** - Bids, change orders, draw requests, work orders
- **Accounting** - Multi-entity chart of accounts, journal entries, financial reporting
- **Investor Relations** - Capital tracking, distributions, investor portal
- **Document Management** - E-signature integration, document storage
- **Integrations** - DocuSeal, SharePoint, Outlook

Supports multiple business models: lot development, spec building, fix & flip, and build-to-rent.

---

## Technical Stack

- **Frontend**: React 18.3 with Vite 5.4
- **Styling**: Tailwind CSS + shadcn/ui (23 components)
- **State**: Zustand + React Query + React Hook Form + Zod
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Charts**: Recharts, Chart.js
- **Documents**: jsPDF, xlsx, pptxgenjs

---

## Current State (What's Already Built)

| Component | Status | Details |
|-----------|--------|---------|
| **Pages** | ✅ Complete | 139 pages, 635+ routes |
| **Components** | ✅ Complete | 150+ components across 16 categories |
| **Services** | ✅ Complete | 70+ service modules connected to Supabase |
| **Database Schema** | ✅ Complete | 30 migrations, 150+ tables defined |
| **Authentication** | ✅ Complete | Email/password, magic link, password reset |
| **Accounting Module** | ✅ Complete | 71 pages (P&L, Balance Sheet, GL, reconciliation, etc.) |
| **Integrations** | ✅ Complete | DocuSeal, SharePoint, Outlook code ready |

### What's NOT Done:

| Item | Status | Work Required |
|------|--------|---------------|
| Database deployed | ⚠️ Pending | Run 30 migrations on Supabase project |
| Demo mode removed | ⚠️ Pending | Remove hardcoded demo user/data |
| RLS policies | ⚠️ Basic | Refine row-level security for roles |
| Storage buckets | ⚠️ Pending | Create 6 buckets in Supabase |
| Testing | ❌ None | Zero test coverage currently |
| Error monitoring | ❌ None | Needs Sentry or similar |
| Edge cases | ⚠️ Some | Bug fixes as discovered |

---

## Scope of Work

### Phase 1: Database Deployment (4-8 hours)
- [ ] Run 30 SQL migration files on Supabase
- [ ] Create storage buckets (project-documents, expense-receipts, etc.)
- [ ] Verify all tables created correctly
- [ ] Load seed data if needed

### Phase 2: Code Cleanup for Production (8-16 hours)
- [ ] Remove demo mode from AuthContext and supabase.js
- [ ] Remove/replace hardcoded entity references (12 occurrences)
- [ ] Configure environment variables for production
- [ ] Fix any remaining mock data fallbacks

### Phase 3: Security Hardening (8-16 hours)
- [ ] Refine RLS policies from "allow all authenticated" to role-based
- [ ] Review and test permission system
- [ ] Ensure no API keys are exposed
- [ ] Configure Supabase Auth for production (redirect URLs, email templates)

### Phase 4: Testing & Bug Fixes (16-32 hours)
- [ ] Manual testing of all core workflows
- [ ] Add automated tests for critical paths (optional but recommended)
- [ ] Fix edge cases and UI bugs discovered
- [ ] Performance testing

### Phase 5: Deployment (4-8 hours)
- [ ] Deploy to Vercel/Netlify
- [ ] Configure custom domain
- [ ] Set up error monitoring (Sentry)
- [ ] Verify production environment

**Total Estimated Hours: 40-80 hours**

---

## Deliverables

1. Fully deployed, working production application
2. All database migrations applied
3. Demo mode removed, production-ready auth
4. Refined RLS policies
5. Documented deployment configuration
6. (Optional) Basic test suite

---

## Ideal Candidate

**Required:**
- Strong React experience (hooks, context, React Query)
- Supabase experience (PostgreSQL, RLS, Auth, Storage)
- Experience deploying to Vercel or Netlify
- Understanding of security best practices

**Nice to Have:**
- Testing experience (Vitest, Jest, Playwright)
- Error monitoring setup (Sentry)
- Real estate or accounting software experience

---

## What I Provide

- Complete handoff documentation (detailed diagnostic report)
- Supabase project already created
- Clean, well-organized codebase
- 30 migration files ready to run
- Direct access for questions
- Quick feedback turnaround

---

## Working Style

- This is a handoff/deployment project, not a greenfield build
- Most code decisions are already made - you're executing a plan
- I'm available for questions but looking for independent work
- Prefer async communication (Slack/email) with sync calls as needed

---

## Budget

**Fixed Price: $2,000 - $4,000** (depending on experience and testing scope)

Or

**Hourly: $40-75/hour** for estimated 40-80 hours

---

## To Apply

Please include:
1. Your experience with Supabase (especially RLS and migrations)
2. A similar deployment/handoff project you've completed
3. Your approach to testing a codebase you didn't write
4. Availability and estimated timeline

---

## Project Links

- Supabase Project: Created and ready
- Documentation: Comprehensive handoff document provided
- Codebase: Well-organized, 54KB App.jsx with lazy-loaded pages
