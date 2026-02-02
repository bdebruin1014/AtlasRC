# Microsoft 365 Integration - Quick Reference Commands

## Pre-Migration Verification

```bash
# Check project status
cd /workspaces/AtlasRC
git status

# Run pre-flight checklist
bash scripts/check_m365_readiness.sh

# Verify build
npm run build

# Verify no merge conflicts
grep -r "^<<<<<<" src/ || echo "✓ No merge conflicts"
```

## Installation

```bash
# Install required packages
npm install @azure/msal-browser@^2.42.1 @azure/msal-react@^2.8.1

# Optional: Install axios for API calls
npm install axios

# Verify installation
npm list @azure/msal-browser @azure/msal-react
```

## Key Files to Review

```bash
# Review current auth system
cat src/contexts/AuthContext.jsx

# Review RBAC system
cat src/services/permissionService.js

# Review existing OAuth implementations
cat src/services/outlookService.js
cat src/services/sharepointService.js

# Review environment configuration
cat .env.local
```

## Migration Strategy

### 1. Create New Auth Context
```bash
# Create Microsoft auth context template
cat > src/contexts/MicrosoftAuthContext.jsx << 'TEMPLATE'
// To be implemented with MSAL integration
TEMPLATE
```

### 2. Update Main App
```bash
# Backup current App.jsx
cp src/App.jsx src/App.jsx.supabase_backup

# Will need to update:
# - Import MicrosoftAuthContext instead of AuthContext
# - Wrap app with MsalProvider
# - Update auth state management
```

### 3. Update OAuth Callbacks
```bash
# Review and consolidate:
src/pages/auth/OutlookCallback.jsx   # Update to use new auth
src/pages/auth/SharePointCallback.jsx# Update to use new auth
```

## Backup & Recovery

```bash
# Location of pre-migration backup
ls -la backups/pre_m365_integration_*/

# To restore from backup
cp backups/pre_m365_integration_20260202_133151/contexts_backup/* src/contexts/
cp backups/pre_m365_integration_20260202_133151/.env.local.backup .env.local
```

## Testing Commands

```bash
# Run dev server
npm run dev

# Test Outlook OAuth flow
# Visit: http://localhost:5173/auth/outlook/callback?code=<test_code>

# Test SharePoint OAuth flow
# Visit: http://localhost:5173/auth/sharepoint/callback?code=<test_code>

# Check console for errors
# Browser DevTools → Console → Look for auth-related messages
```

## Environment Variables to Update

```bash
# Current (Supabase)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# After migration (Microsoft Entra ID)
VITE_AZURE_CLIENT_ID=d8d18879-fde7-4165-812c-c2638ff324c8
VITE_AZURE_TENANT_ID=33575d04-ca7b-4396-8011-9eaea4030b46
VITE_AZURE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_MS_CLIENT_ID=${VITE_AZURE_CLIENT_ID}  # Alias for services
VITE_MS_TENANT_ID=${VITE_AZURE_TENANT_ID}  # Alias for services
```

## Critical Dates & Milestones

- **Week 1**: Auth system replacement
- **Week 2**: Service integration & testing
- **Week 3**: Staging validation & go-live

## Contacts & Support

- **Auth Issues**: Review `src/contexts/AuthContext.jsx` implementation
- **Permission Issues**: Review `src/services/permissionService.js`
- **OAuth Issues**: Review callback handlers in `src/pages/auth/`
- **Graph API Issues**: Review service wrappers (`outlookService.js`, `sharepointService.js`)

## Rollback Plan

If issues occur:

```bash
# 1. Restore from backup
cp -r backups/pre_m365_integration_*/contexts_backup/* src/contexts/

# 2. Restore environment
cp backups/pre_m365_integration_*/.env.local.backup .env.local

# 3. Restore package.json
cp backups/pre_m365_integration_*/package.json.backup package.json
npm install

# 4. Restart dev server
npm run dev
```

## Documentation Links

- **Integration Prep Guide**: `MICROSOFT_365_INTEGRATION_PREP.md`
- **Status Report**: `MICROSOFT_365_INTEGRATION_STATUS.md`
- **This Document**: `MIGRATION_COMMANDS.md`
- **Backup Location**: `backups/pre_m365_integration_20260202_133151/`

---
**Last Updated**: 2026-02-02  
**Next Review**: After MSAL integration complete
