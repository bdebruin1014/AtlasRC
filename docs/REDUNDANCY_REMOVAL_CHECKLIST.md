# Entity Accounting Module - Redundancy Removal Checklist

**Generated:** 2026-02-03
**Reference:** Section 5 of Entity Accounting Module Architecture v2.0

## 5.1 Routes - Status: COMPLETE

### Deprecated Routes (Now Redirect)

| Old Pattern | Status | Action Taken |
|-------------|--------|--------------|
| `/accounting/:entityId` | **REDIRECTS** | Now redirects to `/accounting/entities/:entityId/dashboard` |
| `/accounting/:entityId/*` | **REDIRECTS** | Now redirects to `/accounting/entities/:entityId/{path}` |
| `/operations/entities` | **N/A** | Route never existed |
| `/operations/entities/:entityId` | **N/A** | Route never existed |

### Canonical Routes (Active)

| Pattern | Status |
|---------|--------|
| `/accounting/entities` | **ACTIVE** |
| `/accounting/entities/:entityId` | **ACTIVE** |
| `/accounting/entities/:entityId/dashboard` | **ACTIVE** |
| `/accounting/entities/:entityId/bills` | **ACTIVE** |
| `/accounting/entities/:entityId/invoices` | **ACTIVE** |
| All other canonical patterns | **ACTIVE** |

---

## 5.2 Pages to Merge or Remove

### Chart of Accounts Pages

| File | Location | Status | Action |
|------|----------|--------|--------|
| `ChartOfAccountsPage.jsx` | `/pages/accounting/` | **KEEP** | Primary component |
| `EntityChartOfAccountsPage.jsx` | `/pages/accounting/` | **REVIEW** | May duplicate |
| `ChartOfAccountsSettingsPage.jsx` | `/pages/accounting/` | **MERGE** | Into Settings tab |
| `FinanceChartOfAccountsPage.jsx` | `/pages/` | **REMOVE** | Duplicate |
| `AccountingChartOfAccountsPage.jsx` | `/pages/` | **REMOVE** | Duplicate |
| `ChartOfAccounts/index.tsx` | `/pages/Accounting/` | **KEEP** | TypeScript version |

**Recommendation:** Keep one canonical `ChartOfAccountsPage.jsx` in `/pages/accounting/` and the TypeScript version. Remove standalone duplicates.

### Bank Accounts Pages

| File | Location | Status | Action |
|------|----------|--------|--------|
| `BankAccountsPage.jsx` | `/pages/accounting/` | **KEEP** | Primary component |
| `BankAccountsSetupPage.jsx` | `/pages/accounting/` | **MERGE** | Into Settings Bank Setup tab |
| `BankAccountsPage.jsx` | `/pages/` | **REMOVE** | Duplicate in wrong location |
| `BankAccountModal.jsx` | `/pages/accounting/` | **KEEP** | Modal component |

**Recommendation:** `BankAccountsSetupPage.jsx` functionality now in `EntityAccountingSettingsPage.jsx` Bank Setup tab. Mark for deprecation.

### Ownership Pages

| File | Location | Status | Action |
|------|----------|--------|--------|
| `EntityOwnershipPage.jsx` | `/pages/accounting/` | **KEEP** | Primary component |
| `EntityOwnershipHierarchyPage.jsx` | `/pages/accounting/` | **KEEP** | Different function (hierarchy view) |

**Recommendation:** Both serve different purposes - keep both.

### Capital Pages

| File | Location | Status | Action |
|------|----------|--------|--------|
| `EntityCapitalPage.jsx` | `/pages/` | **REVIEW** | May be redundant with Ownership |
| `CapitalCallsPage.jsx` | `/pages/` | **KEEP** | Specific capital calls functionality |
| `CapitalContributionsPage.jsx` | `/pages/accounting/` | **KEEP** | Specific contributions functionality |

**Recommendation:** Review `EntityCapitalPage.jsx` - if it only shows ownership info, redirect to Entity Ownership page.

### Bills Pages

| File | Location | Status | Action |
|------|----------|--------|--------|
| `BillsPage.jsx` | `/pages/accounting/` | **KEEP** | Primary entity bills component |

**Recommendation:** Only one Bills page exists - no consolidation needed.

---

## 5.3 Component File Consolidation

### Current State Analysis

```
/pages/accounting/
├── BillsPage.jsx                    ← CANONICAL
├── InvoicesPage.jsx                 ← CANONICAL
├── VendorsPage.jsx                  ← CANONICAL
├── CustomersPage.jsx                ← CANONICAL
├── TransactionsPage.jsx             ← CANONICAL
├── JournalEntriesPage.jsx           ← CANONICAL
├── BankAccountsPage.jsx             ← CANONICAL
├── BankReconciliationPage.jsx       ← CANONICAL
├── EntityAccountingSettingsPage.jsx ← CANONICAL (with tabs)
├── EntityDashboardPage.jsx          ← CANONICAL
├── EntityTasksPage.jsx              ← CANONICAL
├── EntityOwnershipPage.jsx          ← CANONICAL
├── EntityChartOfAccountsPage.jsx    ← REVIEW
├── ChartOfAccountsPage.jsx          ← KEEP or MERGE
├── ChartOfAccountsSettingsPage.jsx  ← DEPRECATED (now in Settings)
├── BankAccountsSetupPage.jsx        ← DEPRECATED (now in Settings)
└── ...
```

### Files Safe to Remove (After Migration)

These files are no longer needed since their functionality is now in the Settings tabs:

```bash
# Mark for removal after verifying Settings page is complete
src/pages/accounting/ChartOfAccountsSettingsPage.jsx  # → Settings > Chart of Accounts tab
src/pages/accounting/BankAccountsSetupPage.jsx        # → Settings > Bank Setup tab
```

### Files to Keep But Not Route To

These standalone pages at project root level duplicate accounting module pages:

```bash
# Duplicate files in wrong location
src/pages/FinanceChartOfAccountsPage.jsx     # Remove - use /accounting/ChartOfAccountsPage
src/pages/AccountingChartOfAccountsPage.jsx  # Remove - use /accounting/ChartOfAccountsPage
src/pages/BankAccountsPage.jsx               # Remove - use /accounting/BankAccountsPage
```

---

## 5.4 Import Cleanup Required

After removing duplicate files, clean up imports in `App.jsx`:

### Current Imports to Review

```javascript
// These imports may reference deprecated files:
const ChartOfAccountsSettingsPage = lazy(() => import('@/pages/accounting/ChartOfAccountsSettingsPage'));
const BankAccountsSetupPage = lazy(() => import('@/pages/accounting/BankAccountsSetupPage'));
```

### Routes Using Deprecated Components

```javascript
// These routes should be removed or redirected:
// None currently - Settings page already handles these via tabs
```

---

## 5.5 Migration Status

| Task | Status | Notes |
|------|--------|-------|
| Legacy route redirects | **DONE** | `/accounting/:entityId` → `/accounting/entities/:entityId` |
| Settings tabs implementation | **DONE** | Chart of Accounts, Bank Setup, Ownership, Admin tabs |
| Duplicate file identification | **DONE** | See lists above |
| Duplicate file removal | **PENDING** | Requires careful testing |
| Import cleanup | **PENDING** | After file removal |
| Route cleanup | **PENDING** | After file removal |

---

## 5.6 Safe Removal Procedure

Before removing any file:

1. **Search for imports:**
   ```bash
   grep -r "import.*ChartOfAccountsSettingsPage" src/
   grep -r "import.*BankAccountsSetupPage" src/
   ```

2. **Check for route references:**
   ```bash
   grep -r "chart-of-accounts-settings\|bank-accounts-setup" src/
   ```

3. **Verify Settings page provides equivalent functionality**

4. **Update any remaining references to use Settings tabs**

5. **Remove file and run build to verify no breakage**

---

## 5.7 Files Summary

### Confirmed KEEP

- `/pages/accounting/EntityAccountingSettingsPage.jsx` - Main settings with tabs
- `/pages/accounting/EntityDashboardPage.jsx`
- `/pages/accounting/BillsPage.jsx`
- `/pages/accounting/InvoicesPage.jsx`
- `/pages/accounting/VendorsPage.jsx`
- `/pages/accounting/CustomersPage.jsx`
- `/pages/accounting/TransactionsPage.jsx`
- `/pages/accounting/JournalEntriesPage.jsx`
- `/pages/accounting/BankAccountsPage.jsx`
- `/pages/accounting/BankReconciliationPage.jsx`
- `/pages/accounting/EntityTasksPage.jsx`
- `/pages/accounting/EntityOwnershipPage.jsx`
- `/pages/accounting/EntityOwnershipHierarchyPage.jsx`

### Marked for DEPRECATION

- `/pages/accounting/ChartOfAccountsSettingsPage.jsx` - Functionality in Settings
- `/pages/accounting/BankAccountsSetupPage.jsx` - Functionality in Settings

### Marked for REMOVAL

- `/pages/FinanceChartOfAccountsPage.jsx` - Duplicate
- `/pages/AccountingChartOfAccountsPage.jsx` - Duplicate
- `/pages/BankAccountsPage.jsx` (root level) - Duplicate

---

**Status: ROUTES COMPLETE, FILE CLEANUP PENDING**

The route structure follows canonical patterns with proper redirects. File consolidation requires additional testing before removal.
