# AtlasRC Production Deployment Audit Report

**Date**: February 4, 2026
**Version**: 3.1.0
**Auditor**: Claude Code Deployment Engineer

---

## Executive Summary

The AtlasRC application is **conditionally ready for production** with several critical and high-priority issues that should be addressed. The build succeeds, routing is well-structured, and deployment configurations are properly set up. However, security vulnerabilities, missing error handling, and XSS risks require attention.

| Category | Status | Issues Found |
|----------|--------|--------------|
| Build | PASS | Large chunk warnings |
| Security | NEEDS ATTENTION | 8 vulnerabilities |
| Routing | PASS | Well-organized |
| Error Handling | NEEDS IMPROVEMENT | Limited coverage |
| Database | PASS | Schema complete |
| Deployment Config | PASS | Properly configured |

---

## 1. CRITICAL ISSUES (Must Fix Before Deployment)

### 1.1 Security Vulnerabilities - npm audit

```
8 vulnerabilities (3 moderate, 5 high)
```

| Package | Severity | Issue | Fix |
|---------|----------|-------|-----|
| `react-router-dom` | HIGH | XSS via Open Redirects (GHSA-2w69-qvjg-hvjx) | `npm audit fix` |
| `jspdf` | HIGH | PDF Injection, DoS, XMP Injection | `npm update jspdf` |
| `xlsx` | HIGH | Prototype Pollution, ReDoS | **No fix available** - consider alternative |
| `lodash` | MODERATE | Prototype Pollution in `_.unset` | `npm update lodash` |
| `esbuild/vite` | MODERATE | Dev server request bypass | Dev-only, lower priority |

**Recommended Actions:**
```bash
# Fix most vulnerabilities
npm audit fix

# Update specific packages
npm update jspdf lodash

# For xlsx - consider alternatives like 'exceljs' or 'sheetjs-ce'
```

### 1.2 XSS Vulnerabilities - dangerouslySetInnerHTML

Found 3 instances without proper sanitization:

| File | Line | Context |
|------|------|---------|
| `src/components/outlook/ProjectEmailPanel.jsx` | 477 | Email body rendering |
| `src/components/CommentsNotes.jsx` | 531 | Comment rendering with mentions |
| `src/pages/accounting/ARAgingReportPage.jsx` | 273 | Print window content |

**Fix Required:**
```jsx
// Install DOMPurify (already in bundle)
import DOMPurify from 'dompurify';

// Before:
dangerouslySetInnerHTML={{ __html: emailContent.body }}

// After:
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emailContent.body) }}
```

### 1.3 Missing Environment Variables in .env.example

The `.env.example` is incomplete. Missing variables used in code:

```env
# Azure/Microsoft 365 Integration
VITE_AZURE_CLIENT_ID=
VITE_AZURE_TENANT_ID=
VITE_AZURE_REDIRECT_URI=
VITE_MS_TENANT_ID=
VITE_MS_CLIENT_ID=
VITE_MS_CLIENT_SECRET=
VITE_SHAREPOINT_SITE_ID=
VITE_SHAREPOINT_DRIVE_ID=

# Demo Mode
VITE_DEMO_MODE=false
```

---

## 2. HIGH PRIORITY ISSUES (Should Fix Before Deployment)

### 2.1 ESLint Errors (20 actual errors, 2758 warnings)

Critical errors that may cause runtime issues:

| File | Error | Impact |
|------|-------|--------|
| `proformaService.js:974` | Duplicate key 'costPerUnit' | Data loss in objects |
| `ContractGenerationModal.jsx:264-265` | Lexical declarations in case block | Potential scope issues |
| `BudgetModuleRouter.jsx` | Undefined constants (MONTHLY_RENT, etc.) | Runtime errors |
| `ReportsLayout.jsx:221` | Duplicate useState import | Parse error |

**Fix Command:**
```bash
npm run lint -- --fix  # Auto-fix what's possible
```

### 2.2 Large Bundle Chunks (500KB+ Warning)

```
dist/assets/index-Dr8_4oa6.js           580.86 kB  # Main bundle
dist/assets/jspdf.es.min-DFvPe8_B.js    387.63 kB  # PDF library
dist/assets/generateCategoricalChart...  373.78 kB  # Recharts
```

**Recommended:**
Add manual chunks in `vite.config.js`:

```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-charts': ['recharts', 'chart.js'],
        'vendor-pdf': ['jspdf', 'html2canvas'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
      }
    }
  }
}
```

### 2.3 Unused Imports in App.jsx

Lines 42-94 contain unused lazy imports that increase bundle size:
- `AccountingSidebar`
- `EntityChartOfAccountsPage`
- `EntityBankingPage`
- `EntityReconciliationPage`
- `EntityOwnershipPage`
- `TransactionDetailPage`

### 2.4 Demo Secrets in Source Code

`src/components/WebhookManager.jsx` contains hardcoded demo secrets:
```javascript
secret: 'whsec_abc123def456',  // Lines 13, 26, 39, 52, 65
headers: { 'Authorization': 'Bearer token123' }  // Line 44
```

While labeled as "demo", these should use placeholder text to avoid confusion.

---

## 3. MEDIUM PRIORITY ISSUES (Fix After Initial Deployment)

### 3.1 Error Handling Coverage

Only **4 service files** have try/catch blocks. Supabase queries in other services lack error handling:

**Files needing error handling:**
- `src/services/budgetService.js`
- `src/services/proformaService.js`
- Most hooks in `src/hooks/`

### 3.2 Console Statements

**620 console statements** found across 215 files. These should be:
1. Removed for production
2. Or replaced with a proper logging service

```bash
# Find all console statements
grep -r "console\." src/ --include="*.js" --include="*.jsx" | wc -l
```

### 3.3 React Router v7 Migration Prep

Current version has v7 future flags enabled (good!):
```javascript
future={{
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}}
```

But `react-router-dom` should be updated from 6.30.2 to address the XSS vulnerability.

### 3.4 Missing CSP Header

The `vercel.json` and `netlify.toml` are missing Content-Security-Policy headers:

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.docuseal.co"
}
```

---

## 4. LOW PRIORITY ISSUES (Nice to Have)

### 4.1 Outdated Packages

Major version updates available (may have breaking changes):

| Package | Current | Latest |
|---------|---------|--------|
| `@hookform/resolvers` | 3.10.0 | 5.2.2 |
| `date-fns` | 3.6.0 | 4.1.0 |
| `eslint` | 8.57.1 | 9.39.2 |
| `framer-motion` | 11.18.2 | 12.31.0 |
| `zod` | 3.25.76 | 4.3.6 |

### 4.2 TypeScript Migration Progress

The codebase is 89.2% JavaScript, 6.6% TypeScript. Consider continuing TypeScript migration for:
- Better type safety
- Improved IDE support
- Catch errors at compile time

### 4.3 Missing Documentation

- `docs/M365_INTEGRATION_README.md` - Referenced but doesn't exist
- `docs/route-audit-report.md` - Referenced but doesn't exist

---

## 5. DEPLOYMENT READINESS CHECKLIST

### Vercel (vercel.json) - READY

- [x] SPA routing rewrites configured
- [x] Security headers (X-Frame-Options, X-XSS-Protection, etc.)
- [x] Asset caching (1 year immutable)
- [ ] CSP header (missing)
- [x] Framework auto-detected (Vite)

### Netlify (netlify.toml) - READY

- [x] Build command and publish directory
- [x] Node version specified (18)
- [x] SPA redirects
- [x] Security headers
- [x] Asset caching
- [x] Context-specific builds
- [ ] CSP header (missing)

### GitHub Actions (ci.yml) - READY

- [x] Multi-version Node testing (18.x, 20.x)
- [x] Lint step (with `|| true` to not block)
- [x] Build step
- [x] Artifact upload
- [ ] No test step (tests not configured)

### Database (Supabase) - READY

- [x] All 171+ tables created
- [x] RLS policies enabled
- [x] Indexes in place
- [x] Foreign keys configured
- [x] Migration scripts organized
- [x] `COMPLETE_ACCOUNTING_SCHEMA.sql` available

---

## 6. RECOMMENDED ACTIONS (Step-by-Step)

### Pre-Deployment (Do Now)

```bash
# 1. Fix npm vulnerabilities
npm audit fix
npm update jspdf lodash react-router-dom

# 2. Fix critical ESLint errors
npm run lint -- --fix

# 3. Update .env.example with all variables
# (Manual - copy from .env.local, remove values)
```

### Post-Deployment (Do Soon)

```bash
# 4. Remove console statements
npx eslint . --ext js,jsx --rule 'no-console: error' --fix

# 5. Add DOMPurify sanitization to XSS-vulnerable components
npm install dompurify
# Then update the 3 files identified

# 6. Optimize bundle with manual chunks
# (Update vite.config.js as shown above)
```

### Ongoing Maintenance

1. Consider replacing `xlsx` with `exceljs` for better security
2. Continue TypeScript migration
3. Add unit/integration tests
4. Set up error monitoring (Sentry, LogRocket)
5. Add proper logging service to replace console statements

---

## 7. ROUTING AUDIT SUMMARY

The routing in `App.jsx` is well-organized with:
- **~200 routes** across all modules
- Proper lazy loading with Suspense
- Protected routes with authentication
- Legacy route redirects for backwards compatibility
- Nested routes for accounting module
- No duplicate route conflicts detected

### Route Structure:
```
/                     - Home (protected)
/login, /signup       - Auth (public)
/projects/*           - Projects module (~40 routes)
/opportunities/*      - Opportunities module (~6 routes)
/accounting/*         - Accounting module (~50 routes with nested entity routes)
/admin/*              - Admin module (~25 routes)
/operations/*         - Operations module (~20 routes)
/reports/*            - Reports module (~5 routes)
/eos/*                - EOS module (~5 routes)
```

---

## 8. SECURITY SUMMARY

| Check | Status | Notes |
|-------|--------|-------|
| Secrets in code | WARN | Demo secrets in WebhookManager |
| .gitignore | PASS | .env files properly ignored |
| Auth guards | PASS | ProtectedRoute wrapper on all private routes |
| RLS policies | PASS | Enabled on all Supabase tables |
| XSS prevention | FAIL | 3 unsanitized dangerouslySetInnerHTML |
| CORS | PASS | Handled by Supabase |
| HTTPS | PASS | Enforced by Vercel/Netlify |
| Security headers | PARTIAL | Missing CSP |

---

## Conclusion

AtlasRC is **production-ready with conditions**. The critical path forward:

1. **Immediately**: Fix npm vulnerabilities (`npm audit fix`)
2. **Before launch**: Add DOMPurify sanitization to 3 XSS-vulnerable files
3. **Before launch**: Fix the ~20 ESLint errors
4. **After launch**: Address medium/low priority items

Total build size: **25MB** (dist folder)
Total JS chunks: **345 files**
Build time: **~34 seconds**

The application architecture is sound, routing is clean, and the database schema is complete. With the security fixes applied, this is ready for production deployment.
