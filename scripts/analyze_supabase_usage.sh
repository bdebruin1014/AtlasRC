#!/usr/bin/env bash
set -euo pipefail

# analyze_supabase_usage.sh
# Analyzes the codebase to document all Supabase table usage
# This helps understand the schema requirements

OUTPUT_FILE="supabase_schema_analysis.md"

echo "=== Analyzing Supabase Usage in Codebase ==="
echo "Generating: $OUTPUT_FILE"
echo ""

cat > "$OUTPUT_FILE" <<'EOF'
# Supabase Schema Analysis

**Generated:** $(date)
**Project:** Atlas RC

This document analyzes all Supabase table references found in the codebase.

## Summary

This analysis scans the codebase for `supabase.from()` calls to identify all tables being used.

## Tables Found

EOF

# Extract all table names from supabase.from() calls
echo "Scanning for table references..."
grep -r "supabase\.from(" src/ --include="*.js" --include="*.jsx" -h | \
  sed -n "s/.*supabase\.from(['\"]\\([^'\"]*\\)['\"].*/\\1/p" | \
  sort -u > /tmp/tables_list.txt

# Count unique tables
TABLE_COUNT=$(wc -l < /tmp/tables_list.txt)
echo "Found $TABLE_COUNT unique tables"
echo ""

echo "Total tables referenced: **$TABLE_COUNT**" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "### Table List" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# List all tables
while IFS= read -r table; do
  echo "- \`$table\`" >> "$OUTPUT_FILE"
done < /tmp/tables_list.txt

echo "" >> "$OUTPUT_FILE"
echo "## Detailed Table Usage" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# For each table, find where it's used
while IFS= read -r table; do
  echo "### \`$table\`" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  # Find files that reference this table
  echo "**Used in:**" >> "$OUTPUT_FILE"
  grep -r "supabase\.from(['\"]$table['\"]" src/ --include="*.js" --include="*.jsx" -l | \
    sed 's|^|- |' >> "$OUTPUT_FILE" 2>/dev/null || echo "- (not found)" >> "$OUTPUT_FILE"
  
  echo "" >> "$OUTPUT_FILE"
  
  # Sample queries (first 3)
  echo "**Sample operations:**" >> "$OUTPUT_FILE"
  echo "\`\`\`javascript" >> "$OUTPUT_FILE"
  grep -r "supabase\.from(['\"]$table['\"]" src/ --include="*.js" --include="*.jsx" -h | \
    head -3 >> "$OUTPUT_FILE" 2>/dev/null || echo "// No operations found" >> "$OUTPUT_FILE"
  echo "\`\`\`" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
done < /tmp/tables_list.txt

cat >> "$OUTPUT_FILE" <<'EOF'

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
EOF

rm /tmp/tables_list.txt

echo "Analysis complete: $OUTPUT_FILE"
cat "$OUTPUT_FILE"
