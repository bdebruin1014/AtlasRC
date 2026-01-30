# ESLint Errors - Detailed Report
## AtlasRC - January 30, 2026

This document lists all 46 ESLint errors found in the codebase with exact locations and fixes needed.

## Summary
- **Total Errors**: 46
- **Files Affected**: 6 production files (excluding archive folder)
- **Severity**: CRITICAL - These prevent clean builds

---

## Files with Errors (Non-Archive)

### 1. src/components/TransactionModal.jsx
**Total Errors**: 1

#### Error 1: Duplicate import statement
- **Line**: 221
- **Error**: `Parsing error: Identifier 'useState' has already been declared`
- **Cause**: Missing newline between closing brace `}` and import statement
- **Current Code**: `}import React, { useState, useEffect } from 'react';`
- **Fix**: Add newline after `}` or remove duplicate import section

**Impact**: File has duplicate component definitions - second definition should be removed

---

### 2. src/components/shared/ContactSelector.jsx  
**Total Errors**: 1

#### Error 1: Duplicate Select identifier
- **Line**: 26
- **Error**: `Parsing error: Identifier 'Select' has already been declared`
- **Fix**: Remove duplicate import or rename one of the Select components

---

### 3. src/features/budgets/index.js
**Total Errors**: 1

#### Error 1: Undefined component
- **Line**: 9
- **Error**: `'BudgetModuleRouter' is not defined`
- **Fix**: Add import: `import BudgetModuleRouter from './BudgetModuleRouter'`

---

### 4. src/pages/TransactionsPage.jsx
**Total Errors**: 7

#### Error 1-3: Undefined constants (Rental properties)
- **Lines**: 52, 54, 57
- **Errors**: 
  - Line 52: `'MONTHLY_RENT' is not defined`
  - Line 54: `'LATE_FEE' is not defined`
  - Line 57: `'SECURITY_DEPOSIT' is not defined`
- **Fix**: Define constants at top of file or import from constants file

#### Error 4-5: Undefined constants (Purchase)  
- **Lines**: 94, 96
- **Errors**:
  - Line 94: `'PURCHASE_PRICE' is not defined`
  - Line 96: `'EARNEST_MONEY' is not defined`
- **Fix**: Define constants at top of file

#### Error 6: Undefined constant (Contract)
- **Line**: 139
- **Error**: `'CONTRACT_AMOUNT' is not defined`
- **Fix**: Define constant at top of file

#### Error 7: Undefined mock data
- **Line**: 477
- **Error**: `'MOCK_TRANSACTIONS' is not defined`
- **Fix**: Define mock data array or import from mock data file

---

### 5. src/pages/admin/SystemHealthPage.jsx
**Total Errors**: 12

#### Error 1: Case block declarations
- **Lines**: 263, 264
- **Error**: `Unexpected lexical declaration in case block`
- **Fix**: Wrap case block contents in curly braces `{}`

#### Error 2-7: Missing icon imports
- **Various lines**
- **Missing Icons**: ChevronDown, ChevronRight, Unlock, Lock, Eye, RefreshCw
- **Fix**: Add to lucide-react imports:
  ```javascript
  import { 
    AlertCircle, 
    Activity,
    ChevronDown, 
    ChevronRight, 
    Unlock, 
    Lock, 
    Eye, 
    RefreshCw,
    // ... other icons
  } from 'lucide-react';
  ```

---

### 6. src/pages/projects/Expenses/ExpensesPage.jsx
**Total Errors**: 24+

#### Error 1: Missing React Hooks import
- **Line**: 500  
- **Error**: `Parsing error: Identifier 'React' has already been declared`
- **Fix**: Remove duplicate React import

#### Error 2: Undefined variable
- **Line**: 90
- **Error**: `'selectedEntity' is not defined`
- **Fix**: Add state variable or get from context

#### Error 3: Undefined variable  
- **Line**: 228
- **Error**: `'inv' is not defined`
- **Fix**: Define variable or fix typo

#### Error 4-6: Undefined components (Opportunity tabs)
- **Lines**: 764, 767, 770
- **Missing Components**: 
  - OpportunityTasks
  - OpportunityContacts  
  - OpportunityComparables
- **Fix**: Import from appropriate files or comment out unused tabs

#### Error 7: Undefined variable
- **Line**: 764, 767, 770
- **Error**: `'opportunity' is not defined`
- **Fix**: Define opportunity state variable or get from props/params

#### Error 8-9: Undefined mailings
- **Lines**: 1398, 1409
- **Error**: `'mailings' is not defined`
- **Fix**: Define mailings state variable

#### Error 10: Parsing error
- **Line**: 395
- **Error**: `Unexpected token '>'`
- **Fix**: Escape JSX or check syntax

#### Error 11-18: Missing icon imports
- **Various lines**
- **Missing Icons**: 
  - BarChart3, FileText, Target, Clock, Eye
- **Fix**: Add to lucide-react imports

#### Error 19: Conditional Hook
- **Line**: 40
- **Error**: `React Hook "useMemo" is called conditionally`
- **Fix**: Move hook call outside of conditional block

---

## Archive Folder Errors

The archive folder contains an additional **22 errors** in deprecated code:
- These are in files not used in production
- Can be ignored or fixed as part of archive cleanup
- Primarily missing imports and undefined variables

---

## Recommended Fix Strategy

### Immediate (Today)
1. **TransactionModal.jsx** - Remove duplicate code section (lines 221+)
2. **ContactSelector.jsx** - Fix duplicate Select import
3. **BudgetModuleRouter** - Add missing import

### High Priority (This Week)  
4. **TransactionsPage.jsx** - Define missing constants
5. **SystemHealthPage.jsx** - Add missing icon imports

### Medium Priority (Next Sprint)
6. **ExpensesPage.jsx** - Complex file, needs careful review
   - Missing imports
   - Undefined variables
   - Possible merge conflict remnants

### Optional
7. **Archive folder** - Fix or suppress errors (22 errors in deprecated code)

---

## Verification

After fixes, verify with:
```bash
npm run lint
```

Expected result: 
- **0 errors**
- **~80 warnings** (unused vars in active code - low priority)
- **~2,900 warnings** (archive folder - can ignore)

---

*Report generated: January 30, 2026*
*AtlasRC Version: 3.1.0*
