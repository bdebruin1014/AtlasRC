# Supabase Setup Guide for Atlas RC

## Overview

This guide will help you download and review your Supabase database configuration for the Atlas RC application.

## Prerequisites

- Supabase account and project created
- Project linked to this repository
- `.env` file configured with credentials

## Step 1: Configure Environment Variables

1. Copy the example environment file (if not already done):
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to **Settings** → **API**
   - Copy:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (the `anon` `public` key)
     - **service_role key** (optional, for full access)

3. Update `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Optional
   ```

## Step 2: Analyze Current Schema Usage

We've analyzed your codebase and found **17 tables** currently in use:

### Core Tables
- `profiles` - User authentication and profile data
- `entities` - Business entities/companies
- `projects` - Development projects

### Accounting Tables
- `vendors` - Vendor information
- `bills` - Bills payable
- `bill_line_items` - Individual bill line items

### Capital Management
- `members` - Entity members/investors
- `entity_members` - Member-entity relationships
- `capital_contributions` - Capital contribution records
- `distributions` - Distribution records

### Documents & Inspections
- `documents` - Document metadata
- `document_access_links` - Shareable document links
- `document_access_log` - Document access tracking
- `document_contacts` - Document contact associations
- `floor_plans` - Floor plan data
- `inspections` - Property inspection records

### Other
- `expense_report_items` - Expense report line items
- `permission_audit_log` - Permission change audit trail

See `supabase_schema_analysis.md` for detailed usage information.

## Step 3: Download Supabase Data

### Option A: Download All Table Data (Recommended for Review)

Run the comprehensive download script:

```bash
bash scripts/download_all_supabase_data.sh
```

This will:
- Create a timestamped export directory (e.g., `supabase_export_20260120_143022`)
- Download data from all 17+ tables
- Generate a summary README with record counts
- Flag any errors or missing tables

### Option B: Download Specific JSON File

If you have a specific JSON endpoint:

```bash
SUPABASE_URL="https://your-project.supabase.co/path/to/file.json" \
  bash scripts/download_supabase_json.sh output.json
```

## Step 4: Review Downloaded Data

After running the download script:

1. Navigate to the export directory:
   ```bash
   cd supabase_export_*
   ```

2. Review the README:
   ```bash
   cat README.md
   ```

3. Check table data:
   ```bash
   # View table with jq (formatted JSON)
   cat vendors.json | jq '.'
   
   # Count records
   cat projects.json | jq '. | length'
   
   # View first record
   cat entities.json | jq '.[0]'
   ```

4. Check for errors:
   ```bash
   # List any error files
   ls *.error 2>/dev/null
   
   # View specific error
   cat profiles.json.error
   ```

## Step 5: Create Database Schema (If Needed)

If your tables don't exist yet in Supabase:

### Using Supabase Dashboard
1. Go to **Table Editor** in Supabase dashboard
2. Create each table manually using the column information from downloaded data
3. Set up relationships and foreign keys
4. Configure Row Level Security (RLS) policies

### Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Create migration files
supabase migration new create_initial_schema

# Edit the migration file in supabase/migrations/
# Then push to Supabase
supabase db push
```

## Step 6: Test Connection

After setting up your database:

```bash
# Start the development server
npm run dev
```

The app will automatically:
- Connect to Supabase using your `.env` credentials
- Run a connection check against the `profiles` table
- Fall back to demo mode if connection fails

Check the browser console for connection status.

## Troubleshooting

### "Error: VITE_SUPABASE_URL not set in .env"
- Make sure you've created `.env` from `.env.example`
- Ensure the values are not the placeholder values

### "HTTP 401 - Unauthorized"
- Check that your API keys are correct
- Verify you're using the correct key (anon vs service_role)
- Ensure RLS policies allow access

### "HTTP 404 - Table not found"
- The table doesn't exist in your Supabase project yet
- Create the table using SQL Editor or migrations

### "HTTP 403 - Forbidden"
- Row Level Security (RLS) is blocking access
- Add appropriate RLS policies or use service_role_key

## Files Created

- `scripts/download_all_supabase_data.sh` - Downloads all table data
- `scripts/download_supabase_json.sh` - Downloads specific JSON files
- `scripts/analyze_supabase_usage.sh` - Analyzes codebase for table usage
- `supabase_schema_analysis.md` - Detailed table usage analysis
- `SUPABASE_SETUP.md` - This file

## Next Steps for Claude Review

Once you've downloaded the data:

1. Share the export directory contents with Claude
2. Review `supabase_schema_analysis.md` for table relationships
3. Discuss schema design and optimizations
4. Plan migrations and RLS policies
5. Identify any missing tables or fields

## Security Notes

- **Never commit `.env` to version control** (already in `.gitignore`)
- Use `anon_key` for client-side code
- Only use `service_role_key` in secure server environments
- Set up proper RLS policies for all tables
- Regularly rotate API keys

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Schema Design Best Practices](https://supabase.com/docs/guides/database/overview)
