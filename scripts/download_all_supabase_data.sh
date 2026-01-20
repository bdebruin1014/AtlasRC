#!/usr/bin/env bash
set -euo pipefail

# download_all_supabase_data.sh
# Downloads all table data and schema from Supabase for review
# Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY) in .env

echo "=== Supabase Data Download Script ==="
echo ""

# Load environment variables from .env
if [ -f .env ]; then
  echo "Loading .env file..."
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
else
  echo "Error: .env file not found. Please create it from .env.example"
  exit 1
fi

# Check if credentials are set
if [ -z "${VITE_SUPABASE_URL:-}" ] || [ "${VITE_SUPABASE_URL}" = "https://your-project-id.supabase.co" ]; then
  echo "Error: VITE_SUPABASE_URL not set in .env"
  exit 1
fi

if [ -z "${VITE_SUPABASE_ANON_KEY:-}" ] || [ "${VITE_SUPABASE_ANON_KEY}" = "your-anon-key-here" ]; then
  echo "Error: VITE_SUPABASE_ANON_KEY not set in .env"
  exit 1
fi

# Create output directory
OUTPUT_DIR="supabase_export_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "Output directory: $OUTPUT_DIR"
echo "Supabase URL: $VITE_SUPABASE_URL"
echo ""

# Use service role key if available, otherwise anon key
if [ -n "${VITE_SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  AUTH_KEY="$VITE_SUPABASE_SERVICE_ROLE_KEY"
  echo "Using SERVICE_ROLE_KEY"
else
  AUTH_KEY="$VITE_SUPABASE_ANON_KEY"
  echo "Using ANON_KEY (some tables may be restricted)"
fi

# List of tables to download based on the codebase
TABLES=(
  "profiles"
  "vendors"
  "bills"
  "bill_line_items"
  "projects"
  "entities"
  "entity_members"
  "members"
  "capital_contributions"
  "distributions"
  "inspections"
  "floor_plans"
  "document_access_links"
  "document_access_log"
  "document_contacts"
  "expense_report_items"
  "permission_audit_log"
  "accounts"
  "journal_entries"
  "transactions"
  "contacts"
  "opportunities"
  "tasks"
  "documents"
  "bank_accounts"
  "capital_calls"
  "invoices"
)

echo "Downloading data from tables..."
echo ""

# Function to download table data
download_table() {
  local table=$1
  local output_file="$OUTPUT_DIR/${table}.json"
  
  echo -n "Downloading $table... "
  
  # Try to download the table
  response=$(curl -s -w "\n%{http_code}" \
    -H "apikey: $AUTH_KEY" \
    -H "Authorization: Bearer $AUTH_KEY" \
    -H "Content-Type: application/json" \
    "$VITE_SUPABASE_URL/rest/v1/${table}?select=*&limit=1000" 2>&1)
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "200" ]; then
    echo "$body" > "$output_file"
    record_count=$(echo "$body" | jq '. | length' 2>/dev/null || echo "?")
    echo "✓ ($record_count records)"
  else
    echo "✗ (HTTP $http_code - table may not exist or access denied)"
    echo "$body" > "$output_file.error"
  fi
}

# Download all tables
for table in "${TABLES[@]}"; do
  download_table "$table"
done

echo ""
echo "=== Download Complete ==="
echo "Data saved to: $OUTPUT_DIR/"
echo ""
echo "Summary file created: $OUTPUT_DIR/README.md"

# Create a summary README
cat > "$OUTPUT_DIR/README.md" <<EOF
# Supabase Export Summary

**Export Date:** $(date)
**Supabase URL:** $VITE_SUPABASE_URL

## Tables Exported

This directory contains JSON exports of all tables from your Supabase database.

### Files

EOF

# List all downloaded files
for json_file in "$OUTPUT_DIR"/*.json; do
  if [ -f "$json_file" ]; then
    filename=$(basename "$json_file")
    table_name="${filename%.json}"
    record_count=$(jq '. | length' "$json_file" 2>/dev/null || echo "error")
    echo "- \`$filename\` - $record_count records" >> "$OUTPUT_DIR/README.md"
  fi
done

cat >> "$OUTPUT_DIR/README.md" <<EOF

### Errors

EOF

if ls "$OUTPUT_DIR"/*.error 1> /dev/null 2>&1; then
  for error_file in "$OUTPUT_DIR"/*.error; do
    filename=$(basename "$error_file")
    table_name="${filename%.json.error}"
    echo "- \`$table_name\` - See \`$filename\` for details" >> "$OUTPUT_DIR/README.md"
  done
else
  echo "No errors during export." >> "$OUTPUT_DIR/README.md"
fi

cat >> "$OUTPUT_DIR/README.md" <<EOF

## Next Steps

1. Review the exported data in each JSON file
2. Check for any errors in *.error files
3. Use this data to validate your schema and relationships
4. Import into a local Supabase instance if needed

## Notes

- Exports are limited to 1000 records per table
- Some tables may require service_role_key for access
- Tables that don't exist will have .error files
EOF

echo "Done! Review the data in $OUTPUT_DIR/"
