# Microsoft 365 Integration - Pre-Integration Verification & Cleanup
**Date:** February 2, 2026  
**Status:** Phase 1 - Discovery Complete

---

## EXECUTIVE SUMMARY

The Atlas RC codebase is **substantially prepared** for Microsoft 365 integration. Current state:
- ✅ **Supabase Auth Foundation**: Currently active with 20+ files using authentication
- ✅ **Azure Credentials**: Environment variables already configured (VITE_AZURE_CLIENT_ID, VITE_AZURE_TENANT_ID)
- ✅ **Microsoft Graph API Services**: Outlook and SharePoint integration services exist
- ⚠️ **Auth Migration Required**: Supabase Auth must be replaced with Microsoft Entra ID (Azure AD)
- ⚠️ **Session Management**: Current Supabase session handling needs refactoring

---

## PHASE 1: DISCOVERY RESULTS

### 1. CURRENT AUTHENTICATION SYSTEM

**Framework:** Supabase Auth (JWT-based)  
**Location:** `/src/contexts/AuthContext.jsx`

**Current Auth Flow:**
```
User → Supabase Auth → JWT Token → App Context → Protected Routes
```

**Key Files:**
- `src/lib/supabase.js` - Supabase client initialization
- `src/contexts/AuthContext.jsx` - React context for auth state
- `src/contexts/PermissionContext.jsx` - Role-based access control (RBAC)

**Demo Mode Active:** Yes
- Falls back to demo user when Supabase credentials unavailable
- Demo user: `demo@atlasdev.com` (ID: `demo-user-123`)

---

### 2. EXISTING MICROSOFT 365 INTEGRATIONS

#### 2.1 Outlook Integration
**Location:** `src/services/outlookService.js`

**Status:** Partially implemented (not yet tied to main auth)

**Configuration:**
```javascript
MS_TENANT_ID = VITE_MS_TENANT_ID
MS_CLIENT_ID = VITE_MS_CLIENT_ID
GRAPH_API_URL = 'https://graph.microsoft.com/v1.0'
REDIRECT_URI = '/auth/outlook/callback'
```

**Scopes Requested:**
- Mail.ReadWrite
- Mail.Send
- Calendars.ReadWrite
- User.Read
- offline_access

**Files Using Outlook:**
- `src/pages/auth/OutlookCallback.jsx` - OAuth callback handler
- `src/components/outlook/ProjectEmailPanel.jsx` - Email panel component

#### 2.2 SharePoint Integration
**Location:** `src/services/sharepointService.js`

**Status:** Partially implemented (org-wide admin connection model)

**Configuration:**
```javascript
MS_TENANT_ID = VITE_MS_TENANT_ID
MS_CLIENT_ID = VITE_MS_CLIENT_ID
GRAPH_API_URL = 'https://graph.microsoft.com/v1.0'
REDIRECT_URI = '/auth/sharepoint/callback'
```

**Scopes Requested:**
- Files.ReadWrite.All
- Sites.ReadWrite.All
- User.Read
- offline_access

**Files Using SharePoint:**
- `src/pages/auth/SharePointCallback.jsx` - OAuth callback handler
- `src/components/sharepoint/SharePointConnect.jsx` - Connection component
- `src/services/documentService.js` - Document management

---

### 3. ENVIRONMENT VARIABLES STATUS

**Configured:** ✅
```
VITE_SUPABASE_URL=https://opuykuydejpicqdtekne.supabase.co
VITE_SUPABASE_ANON_KEY=[TOKEN]
VITE_AZURE_CLIENT_ID=d8d18879-fde7-4165-812c-c2638ff324c8
VITE_AZURE_TENANT_ID=33575d04-ca7b-4396-8011-9eaea4030b46
VITE_AZURE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_DOCUSEAL_URL=https://api.docuseal.co
VITE_DOCUSEAL_API_KEY=[TOKEN]
```

**Missing for M365 Full Integration:**
- `VITE_MS_CLIENT_SECRET` - Required for token refresh (backend only)
- `VITE_MS_APP_ROLES` - Custom app roles definition
- `VITE_MS_GROUP_ID` - For group-based access control

---

### 4. AUTH DEPENDENCIES INVENTORY

**Supabase Auth Usage (20 files):**
1. `AuthContext.jsx` - Main auth provider
2. `PermissionContext.jsx` - Permission management
3. `permissionService.js` - Permission helpers
4. `userService.js` - User data service
5. `teamService.js` - Team management
6. `chatService.js` - Chat service
7. `projectTemplateService.js` - Template service
8. `documentService.js` - Document management
9. `SharePointConnect.jsx` - SharePoint connection component
10. `OutlookCallback.jsx` - Outlook callback
11. `SharePointCallback.jsx` - SharePoint callback
12. `InviteUserModal.jsx` - User invitation
13. `CreateProjectModal.jsx` - Project creation
14. `ProjectEmailPanel.jsx` - Email panel
15. `App.jsx` - Main app routes
16. `SignUpPage.jsx` - Sign up page
17. Plus others in archive

---

### 5. ROLE-BASED ACCESS CONTROL (RBAC)

**Location:** `src/services/permissionService.js`

**Existing Roles:**
- `super_admin` - Full system access
- `admin` - Organization admin
- `manager` - Project manager
- `analyst` - Data analyst
- `viewer` - View-only access

**Strategy:** These roles can be mapped to Microsoft Entra ID groups

---

## PHASE 2: STABILITY VERIFICATION

### Build Status
**Current:** ✅ No syntax errors in `ContactsPage.jsx` (recently fixed)

### Known Issues to Address

#### Issue 1: Merge Conflict Resolution (RESOLVED)
**File:** `src/pages/projects/ContactsPage.jsx`
**Status:** ✅ Fixed - All merge conflicts removed

#### Issue 2: Auth Session Fallback Logic
**File:** `src/contexts/AuthContext.jsx` (lines 47-55)
**Current Behavior:**
```javascript
try {
  const { data: { session } } = await supabase.auth.getSession();
  setUser(session?.user ?? null);
} catch (error) {
  console.error('Error checking auth session:', error);
  // Falls back to DEMO_USER on error ⚠️
  setUser(DEMO_USER);
}
```
**Risk:** Falls back to demo user instead of showing login page
**Recommendation:** Change behavior to redirect to login on auth failure

#### Issue 3: OAuth State Validation Missing
**File:** `src/pages/auth/SharePointCallback.jsx` (line ~60)
**Current:** State parameter not validated from sessionStorage
**Recommendation:** Implement CSRF protection with state parameter validation

---

## PHASE 3: MIGRATION ROADMAP

### Step 1: Authentication System Replacement (Week 1)
**Objective:** Replace Supabase Auth with Microsoft Entra ID

**Tasks:**
1. [ ] Create new `contexts/MicrosoftAuthContext.jsx`
2. [ ] Implement MSAL library (`@azure/msal-browser`)
3. [ ] Create Microsoft ID Token → App User profile mapping
4. [ ] Update `App.jsx` to use new auth context
5. [ ] Implement token refresh logic
6. [ ] Add logout with token revocation

**Files to Modify:**
- `src/contexts/AuthContext.jsx` → New Microsoft auth
- `src/App.jsx` → Auth provider swap
- `src/pages/LoginPage.jsx` → Microsoft login button
- `src/pages/SignUpPage.jsx` → Remove (use Microsoft signup)

### Step 2: Permission & User Services Update (Week 1)
**Objective:** Adapt RBAC to Microsoft Entra ID

**Tasks:**
1. [ ] Update `permissionService.js` to read from Entra ID groups
2. [ ] Map Entra ID groups to app roles
3. [ ] Update `userService.js` to sync from Microsoft Graph
4. [ ] Create user profile sync service

**Key Mapping:**
```
Microsoft Entra ID Group → App Role
"IT Admins" → "admin"
"Project Managers" → "manager"
"Analysts" → "analyst"
"Viewers" → "viewer"
```

### Step 3: OAuth Callbacks Unification (Week 2)
**Objective:** Consolidate OAuth callbacks

**Current State:**
- `/auth/outlook/callback` - Outlook-specific
- `/auth/sharepoint/callback` - SharePoint-specific
- `/auth/callback` - General (unused)

**Plan:**
1. [ ] Create unified `/auth/callback` handler
2. [ ] Update Outlook service to use unified callback
3. [ ] Update SharePoint service to use unified callback
4. [ ] Add service type detection in callback

### Step 4: Data Migration (Week 2-3)
**Objective:** Migrate Supabase auth data to Microsoft Entra ID

**Tasks:**
1. [ ] Export current Supabase users
2. [ ] Map to existing Microsoft Entra ID accounts
3. [ ] Create migration script for user roles/permissions
4. [ ] Validate all permissions transferred

### Step 5: Testing & Validation (Week 3)
**Objective:** Comprehensive integration testing

**Test Cases:**
1. [ ] Microsoft Entra ID login flow
2. [ ] Token refresh handling
3. [ ] RBAC enforcement
4. [ ] Outlook email integration
5. [ ] SharePoint document access
6. [ ] Session timeout and logout

---

## DEPENDENCIES TO ADD

```json
{
  "@azure/msal-browser": "^2.42.1",
  "@azure/msal-react": "^2.8.1",
  "axios": "^1.6.2"
}
```

### Removal Candidates
```json
{
  "@supabase/supabase-js": "Remove after auth migration complete",
  "@supabase/auth-js": "Remove after auth migration complete"
}
```

---

## SECURITY CONSIDERATIONS

### 1. Token Handling
**Current Risk:** Supabase tokens stored in browser
**Mitigation:** Microsoft Entra ID uses PKCE flow + refresh token in httpOnly cookies

### 2. CSRF Protection
**Status:** Partially implemented (state parameter in OAuth)
**Action:** Validate state parameter in all callbacks

### 3. API Secrets
**NEVER store in client code:**
- `VITE_MS_CLIENT_SECRET` → Backend only
- `VITE_MS_ADMIN_CONSENT_KEY` → Backend only

### 4. Scopes
**Principle of Least Privilege:**
- Current Outlook scopes: ✅ Appropriate (email + calendar)
- Current SharePoint scopes: ✅ Appropriate (read/write files)

---

## CONFIGURATION CHECKLIST

### Pre-Migration
- [ ] Document current Supabase auth flows
- [ ] Backup all current user data
- [ ] Create rollback plan
- [ ] Test in staging environment

### During Migration
- [ ] Deploy new auth infrastructure (backend)
- [ ] Deploy MSAL integration (frontend)
- [ ] Run side-by-side testing (both auth systems)
- [ ] Migrate user data
- [ ] Update all OAuth callbacks

### Post-Migration
- [ ] Decommission Supabase Auth
- [ ] Remove Supabase dependencies
- [ ] Monitor error rates (target: < 0.1%)
- [ ] Verify all integrations working
- [ ] Document new auth system

---

## RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Auth system failure during transition | Medium | High | Side-by-side testing, rollback plan |
| User permissions lost | Low | High | Pre-migration validation script |
| OAuth token refresh failures | Low | Medium | Comprehensive token handling tests |
| MSAL library incompatibility | Low | Medium | Early testing with staging env |
| Microsoft Graph API rate limits | Low | Medium | Implement caching + backoff |

---

## NEXT STEPS

1. **Approve Roadmap** - Review migration phases
2. **Prepare Backend** - Set up Microsoft Entra ID token validation
3. **Stage Deployment** - Deploy to staging environment first
4. **Load Testing** - Test with > 100 concurrent users
5. **Go Live** - Execute migration with monitoring

---

## APPENDIX: KEY FILE LOCATIONS

### Authentication System
- `src/contexts/AuthContext.jsx` - Main auth provider
- `src/lib/supabase.js` - Supabase client
- `src/services/permissionService.js` - RBAC implementation

### Microsoft Integration Services
- `src/services/outlookService.js` - Outlook API wrapper
- `src/services/sharepointService.js` - SharePoint API wrapper
- `src/services/documentService.js` - Document management
- `src/pages/auth/OutlookCallback.jsx` - Outlook OAuth callback
- `src/pages/auth/SharePointCallback.jsx` - SharePoint OAuth callback

### UI Components
- `src/pages/LoginPage.jsx` (or Auth/Login) - Login UI
- `src/pages/SignUpPage.jsx` - Registration UI
- `src/components/admin/InviteUserModal.jsx` - User invitation

### Configuration
- `.env.local` - Environment variables
- `vite.config.js` - Build configuration

---

**Generated:** 2026-02-02  
**Prepared For:** Microsoft 365 Integration Sprint
