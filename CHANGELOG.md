# Changelog

All notable changes to Atlas will be documented in this file.

## [3.1.0] - 2025-01-19

### Added

#### New Disposition Module
Complete disposition management system for tracking sales, contracts, and settlements.

**New Pages:**
- `DispositionPage.jsx` - Main disposition dashboard
  - KPI cards (Total Units, Contracted, Sold, Remaining)
  - Revenue tracking (Received vs Pending)
  - Progress toward target visualization
  - Active buyer agreements overview
  - Upcoming closings calendar
  - Adapts based on project type (lot-dev, BTR, for-sale)

- `ContractRecordPage.jsx` - Individual contract management
  - Multiple contract types (Bulk Sale, Home Sale, Lease, Assignment, Lot Sale)
  - Full party information (Seller/Buyer details)
  - Financial terms (Purchase Price, Earnest Money, etc.)
  - Key dates tracking (Effective, DD Deadline, Closing)
  - Contingencies management
  - Takedown schedule builder
  - Document upload section

- `SettlementStatementPage.jsx` - HUD/Closing statement recording
  - Closing information (Title Company, Escrow)
  - Property/units conveyed
  - Seller credits management
  - Seller charges/debits with categories
  - Auto-calculated net to seller
  - Fund tracking with wire confirmation

**New Routes:**
```
/project/:projectId/disposition
/project/:projectId/disposition/contracts
/project/:projectId/disposition/contracts/new
/project/:projectId/disposition/contracts/:contractId
/project/:projectId/disposition/settlements
/project/:projectId/disposition/settlements/new
/project/:projectId/disposition/settlements/:settlementId
```

### Changed
- Updated `App.jsx` with new disposition routes and lazy-loaded imports
- Updated `package.json` version to 3.1.0
- Renamed project from "atlasdev" to "atlas"
- Updated README with comprehensive documentation

### Documentation
- Added complete module documentation (Atlas_Module_Documentation.docx)
- Covers Opportunities, Projects, Disposition, and Accounting modules
- Field-level documentation with types and descriptions

---

## [3.0.0] - 2025-01-18

### Initial Streamlined Release
- Core 5 modules: Projects, Opportunities, Accounting, Operations, Admin
- Archived non-essential modules (Construction, Investor Management, Property Management, CAHP)
- New opportunity naming convention (YY-NNN-Address)
- Refined pipeline stages (Prospecting → Contacted → Qualified → Negotiating → Under Contract)

---

## Migration Notes

### From v3.0.0 to v3.1.0

No database migrations required. New pages are additive.

To integrate:
1. Copy new files to `src/pages/projects/`:
   - DispositionPage.jsx
   - ContractRecordPage.jsx
   - SettlementStatementPage.jsx
2. Update `src/App.jsx` with new imports and routes
3. Run `npm install` (no new dependencies)
4. Test routes at `/project/:id/disposition`

---

## Upcoming (Planned)

### v3.2.0
- Supabase database tables for disposition module
- Real data integration for contracts and settlements
- E-signature integration for contract signing
- SharePoint document sync

### v3.3.0
- SoftLedger accounting integration
- Multi-entity consolidation reports
- Advanced disposition analytics
