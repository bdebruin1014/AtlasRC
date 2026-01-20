# Supabase Schema Analysis

**Generated:** $(date)
**Project:** Atlas RC

This document analyzes all Supabase table references found in the codebase.

## Summary

This analysis scans the codebase for `supabase.from()` calls to identify all tables being used.

## Tables Found

Total tables referenced: **17**

### Table List

- `bill_line_items`
- `bills`
- `capital_contributions`
- `distributions`
- `document_access_links`
- `document_access_log`
- `document_contacts`
- `entities`
- `entity_members`
- `expense_report_items`
- `floor_plans`
- `inspections`
- `members`
- `permission_audit_log`
- `profiles`
- `projects`
- `vendors`

## Detailed Table Usage

### `bill_line_items`

**Used in:**
- src/services/accountingEnhancedService.js
- src/services/billService.js

**Sample operations:**
```javascript
    await supabase.from('bill_line_items').insert(lineItems);
      await supabase.from('bill_line_items').insert(linesWithBillId);
    await supabase.from('bill_line_items').delete().eq('bill_id', id);
```

### `bills`

**Used in:**
- src/services/billService.js

**Sample operations:**
```javascript
    return await supabase.from('bills').delete().eq('id', id);
```

### `capital_contributions`

**Used in:**
- src/services/capitalService.js
- src/pages/EntityCapitalPage.jsx

**Sample operations:**
```javascript
    return await supabase.from('capital_contributions').delete().eq('id', id);
      const { data: contribs } = await supabase.from('capital_contributions')
```

### `distributions`

**Used in:**
- src/services/capitalService.js
- src/pages/EntityCapitalPage.jsx

**Sample operations:**
```javascript
    return await supabase.from('distributions').delete().eq('id', id);
      const { data: dists } = await supabase.from('distributions')
```

### `document_access_links`

**Used in:**
- src/services/documentService.js

**Sample operations:**
```javascript
    await supabase.from('document_access_links').insert({
```

### `document_access_log`

**Used in:**
- src/services/documentService.js

**Sample operations:**
```javascript
    await supabase.from('document_access_log').insert({
```

### `document_contacts`

**Used in:**
- src/services/esignService.js

**Sample operations:**
```javascript
        await supabase.from('document_contacts').upsert({
```

### `entities`

**Used in:**
- src/services/entityService.js

**Sample operations:**
```javascript
    return await supabase.from('entities').delete().eq('id', id);
```

### `entity_members`

**Used in:**
- src/services/capitalService.js

**Sample operations:**
```javascript
    return await supabase.from('entity_members').delete().eq('id', id);
```

### `expense_report_items`

**Used in:**
- src/services/expenseService.js

**Sample operations:**
```javascript
  await supabase.from('expense_report_items').insert(items);
```

### `floor_plans`

**Used in:**
- src/services/floorPlanService.js

**Sample operations:**
```javascript
  let query = supabase.from('floor_plans').select('*');
```

### `inspections`

**Used in:**
- src/archive/services/inspectionService.js

**Sample operations:**
```javascript
  let query = supabase.from('inspections').select('status, inspection_type, overall_score');
```

### `members`

**Used in:**
- src/pages/EntityCapitalPage.jsx

**Sample operations:**
```javascript
      const { data: members } = await supabase.from('members').select('capital_account_balance').eq('entity_id', entityId).eq('status', 'Active');
```

### `permission_audit_log`

**Used in:**
- src/services/permissionService.js

**Sample operations:**
```javascript
    await supabase.from('permission_audit_log').insert({
```

### `profiles`

**Used in:**
- src/lib/supabase.js

**Sample operations:**
```javascript
    const { error } = await supabase.from('profiles').select('count').limit(1);
```

### `projects`

**Used in:**
- src/services/projectService.js

**Sample operations:**
```javascript
    return await supabase.from('projects').delete().eq('id', id);
```

### `vendors`

**Used in:**
- src/services/vendorService.js
- src/pages/AccountingVendorsPage.jsx

**Sample operations:**
```javascript
    return await supabase.from('vendors').delete().eq('id', id);
      const { data, error } = await supabase.from('vendors').insert([{
```


## Next Steps

1. Create SQL migrations for each table identified
2. Define proper RLS policies for each table
3. Set up relationships and foreign keys
4. Create indexes for performance
5. Document the schema in Supabase

## Notes

- This analysis is based on code references only
- Actual schema may require additional fields not used in current code
- Review each table's usage to determine required columns and types
