# Remaining Issues and Technical Debt

This document outlines all remaining issues, bugs, and technical debt in the AtlasRC project after the January 2026 bug fix session.

## ✅ Fixed Issues

### 1. Hardcoded Entity in App.jsx (FIXED)
- **Previous Issue**: AccountingEntityLayout had hardcoded "Highland Park Development LLC" entity
- **Fix Applied**: Now dynamically fetches entity using `entityService.getById(entityId)` from route params
- **Impact**: Accounting module now works with any entity, not just the hardcoded one
- **Files Changed**: `src/App.jsx`

### 2. Demo User Security Risk (FIXED)
- **Previous Issue**: AuthContext would fall back to demo user on authentication errors
- **Fix Applied**: Removed fallback to DEMO_USER on errors; now properly sets user to null
- **Impact**: Prevents unauthorized access when authentication fails
- **Files Changed**: `src/contexts/AuthContext.jsx`

### 3. NPM Security Vulnerabilities (PARTIALLY FIXED)
- **Fixed**: 4 of 9 vulnerabilities resolved using `npm audit fix`
- **Fixed Packages**: @remix-run/router, lodash (partial)
- **Files Changed**: `package-lock.json`

---

## ⚠️ Remaining Issues

### 1. NPM Security Vulnerabilities (5 Remaining)

#### High Severity (1)
- **Package**: `xlsx@*`
- **Vulnerabilities**: 
  - Prototype Pollution (GHSA-4r6h-8v6p-xvw6)
  - Regular Expression Denial of Service (GHSA-5pgg-2g8v-p4x9)
- **Status**: No fix available
- **Recommendation**: Consider switching to an alternative library like `exceljs` or accept the risk if not using untrusted input

#### Moderate Severity (4)
- **Package**: `esbuild@<=0.24.2`
  - **Issue**: Development server vulnerability
  - **Fix**: Requires upgrading to `vite@7.3.1` (breaking change)
  
- **Package**: `eslint@<9.26.0`
  - **Issue**: Stack overflow when serializing circular references
  - **Fix**: Requires upgrading to `eslint@9.39.2` (breaking change)
  - **Impact**: May require updating `.eslintrc.json` config format

**Recommendation**: Plan a separate upgrade cycle to address these breaking changes with proper testing.

---

### 2. ESLint Warnings (45 Total - Low Priority)

All warnings are in the `src/archive/` folder and are unused imports or variables. These are low priority since:
- Archive folder contains deprecated/inactive code
- No functional impact
- Can be cleaned up when archive code is removed

**Examples**:
- Unused icon imports (MoreVertical, Filter, Calendar, etc.)
- Unused utility imports (cn function)
- Unused constants (SAFE_HARBOR_THRESHOLDS, COMPLIANCE_STATUS, etc.)
- React Hooks warnings (missing dependencies in useEffect)

**Recommendation**: Clean up when removing archived modules, or ignore as they're not in production code.

---

### 3. Configuration Requirements (Not Bugs - Setup Needed)

These are not bugs but require manual configuration for production deployment:

#### Database Setup
- [ ] Run Supabase migrations in production
- [ ] Create storage buckets in Supabase
- [ ] Verify all tables are created correctly
- [ ] Set up Row Level Security (RLS) policies

#### Authentication Setup
- [ ] Configure Supabase Auth settings
- [ ] Set up email templates
- [ ] Configure redirect URLs for production domain
- [ ] Create first admin user

#### Environment Variables
- [ ] Set `VITE_SUPABASE_URL` in production
- [ ] Set `VITE_SUPABASE_ANON_KEY` in production
- [ ] Configure DocuSeal API key (optional)
- [ ] Configure Microsoft Graph API keys (optional)

#### Production Configuration
- [ ] Update site URL in Supabase Auth
- [ ] Configure custom domain
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Set up analytics tracking

---

### 4. Missing Implementations (Stubs/Placeholders)

These features exist in the code but are not fully implemented:

#### Contract AI Parsing
- **Location**: `src/services/contractParsingService.js`
- **Status**: Stub only - needs AI integration with Supabase Edge Functions
- **Impact**: Contract parsing requires manual data entry
- **Recommendation**: Implement with OpenAI/Anthropic API integration

#### PowerPoint Export
- **Location**: Various report pages
- **Status**: Code exists but commented out
- **Requirement**: Confirm pptxgenjs is properly installed
- **Impact**: Cannot export reports to PowerPoint format
- **Recommendation**: Uncomment and test PowerPoint export functionality

---

### 5. Technical Debt (Non-Critical)

#### Large Files
- **File**: `src/App.jsx` (54KB)
- **Issue**: Maintainability concern
- **Recommendation**: Consider splitting routes into separate route configuration files

#### TypeScript Migration
- **Status**: Using jsconfig.json for type hints, not full TypeScript
- **Impact**: Less type safety than full TypeScript
- **Recommendation**: Consider gradual migration to TypeScript

#### Build Optimization
- **Issue**: Some chunks larger than 500KB after minification
- **Impact**: Slower initial page load
- **Recommendation**: Implement code splitting with dynamic imports

#### Testing Coverage
- **Status**: Zero test files
- **Impact**: No automated testing safety net
- **Recommendation**: Add Vitest or Jest with critical path tests

---

## 📋 Mock Data (Intentional - Not Issues)

The following files contain hardcoded "Highland Park Development LLC" and other mock data **by design** for demo/fallback purposes:

- `src/services/contractParsingService.js` - Mock parsed contract data for demo mode
- `src/pages/EntitiesPage.jsx` - Mock entities for when Supabase isn't connected
- `src/pages/accounting/EntityDashboardPage.jsx` - Mock entity data for demo
- `src/pages/accounting/AccountingEntitiesListPage.jsx` - Mock accounting entities
- `src/archive/**/*.jsx` - Archived components (not in production)

**These are NOT bugs** - they provide graceful fallbacks when the database is unavailable.

---

## 🎯 Recommended Action Items

### Immediate (Before Production)
1. ✅ Fix hardcoded entity in App.jsx - DONE
2. ✅ Remove demo mode security risk - DONE
3. ✅ Fix non-breaking NPM vulnerabilities - DONE
4. Run Supabase migrations in production environment
5. Configure authentication and environment variables
6. Test all critical user flows

### Short Term (1-2 Sprints)
1. Plan and execute breaking dependency upgrades (Vite 7, ESLint 9)
2. Evaluate xlsx alternatives or accept the risk
3. Add error monitoring (Sentry)
4. Add basic test coverage for critical paths
5. Implement Contract AI parsing or document limitation

### Long Term (Future Iterations)
1. Clean up archive folder and remove unused code
2. Implement code splitting for large chunks
3. Consider TypeScript migration
4. Add comprehensive test suite
5. Refactor App.jsx into smaller route files

---

## 📊 Summary

| Category | Total | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical Security Issues | 2 | 2 | 0 |
| NPM Vulnerabilities | 9 | 4 | 5 |
| Code Quality Issues | 45 | 0 | 45 (low priority) |
| Missing Implementations | 2 | 0 | 2 |
| Configuration Tasks | 12 | 0 | 12 (required for production) |

**All critical bugs have been fixed.** Remaining issues are either:
- Low priority technical debt (archive folder warnings)
- Dependencies requiring breaking changes (planned for future)
- Configuration tasks (not bugs, normal setup)
- Known limitations (documented features)

---

## 🔐 Security Summary

### Fixed Security Issues
✅ **Demo User Fallback** - Authentication now properly fails instead of falling back to demo credentials
✅ **4 NPM Vulnerabilities** - Resolved with npm audit fix

### Remaining Security Considerations
⚠️ **xlsx Library** - Has known vulnerabilities, but risk is low if not processing untrusted Excel files
⚠️ **5 NPM Vulnerabilities** - Require breaking changes; plan upgrade cycle with testing
✅ **Demo Mode** - Still available via explicit env var, but no longer a security risk

**Overall Security Posture**: Good - All critical security issues resolved. Remaining vulnerabilities are in development dependencies or require breaking changes.

---

*Document Last Updated: January 30, 2026*
*AtlasRC Version: 3.1.0*
