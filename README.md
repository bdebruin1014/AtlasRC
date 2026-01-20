# Atlas - Real Estate Development Platform

## Version 3.1.0 - January 2025

Atlas is a comprehensive internal operating system designed for real estate development companies. It functions as a custom CRM, project management platform, and family office accounting solution.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- Supabase account (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/atlas.git
cd atlas

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
atlas/
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── shared/          # Shared components
│   │   ├── accounting/      # Accounting module components
│   │   ├── admin/           # Admin module components
│   │   ├── docs/            # Document components
│   │   ├── documents/       # Document management
│   │   ├── esign/           # E-signature components
│   │   ├── inspections/     # Inspection components
│   │   ├── layouts/         # Layout components
│   │   └── pipeline/        # Pipeline components
│   ├── contexts/            # React contexts
│   ├── features/            # Feature modules
│   │   └── budgets/         # Budget components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and constants
│   ├── pages/               # Page components
│   │   ├── accounting/      # Accounting pages
│   │   ├── admin/           # Admin pages
│   │   ├── eos/             # EOS module pages
│   │   ├── operations/      # Operations pages
│   │   ├── pipeline/        # Pipeline/Opportunities pages
│   │   ├── projects/        # Project pages (including Disposition)
│   │   ├── reports/         # Report pages
│   │   └── user-settings/   # User settings pages
│   ├── services/            # API services
│   ├── archive/             # Archived modules (not active)
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── supabase/                # Supabase migrations
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🏗️ Core Modules

### 1. Opportunities / Pipeline
Manages acquisition pipeline from prospecting through contract execution.

**Stages:** Prospecting → Contacted → Qualified → Negotiating → Under Contract

**Features:**
- Lead tracking and management
- Property analysis
- Deal analyzer with financial projections
- Comp selection
- Contract generation
- E-signature integration

### 2. Projects
Active development deals from acquisition through disposition.

**Project Types:**
- `spec-home` - Individual Spec Home
- `horizontal-lot` - Lot Development
- `btr` - Build-to-Rent
- `bts` - Build-to-Sell

**Sections:**
- Overview (Basic Info, Property Details, Contacts)
- Acquisition (Contract, Due Diligence, Closing)
- Construction (Budget, Schedule, Draws, Change Orders)
- Finance (Cash Flow, Proforma, Loans, Expenses)
- Disposition (NEW - Sales, Contracts, Settlements)
- Documents

### 3. Disposition (NEW)
Manages the sale process for completed projects.

**Features:**
- Bulk sales schedules (for lot development)
- Lease-up tracking (for BTR)
- Individual home sales (for-sale development)
- Contract management
- Settlement statement recording
- Fund tracking

**Pages:**
- `/project/:projectId/disposition` - Main dashboard
- `/project/:projectId/disposition/contracts/new` - New contract
- `/project/:projectId/disposition/contracts/:id` - Contract detail
- `/project/:projectId/disposition/settlements/new` - New settlement
- `/project/:projectId/disposition/settlements/:id` - Settlement detail

### 4. Accounting
Entity-level financial management.

**Features:**
- Multi-entity support
- Chart of Accounts
- Transaction management
- Bank reconciliation
- Financial reports (P&L, Balance Sheet, Cash Flow)
- Job costing
- 1099 tracking

### 5. Operations
Operational management tools.

**Features:**
- Global task management
- Team management
- E-signature workflows
- Document library

### 6. Admin
System configuration and templates.

**Features:**
- User management
- Floor plan library
- Pricing library
- Budget templates
- Proforma templates
- Schedule templates

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| TypeScript | Type Safety (jsconfig) |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| Supabase | Backend (Auth, Database, Storage) |
| React Query | Server State Management |
| React Router v6 | Routing |
| Recharts | Charts |
| Lucide React | Icons |
| React Hook Form | Form Management |
| Zod | Schema Validation |

---

## 📦 Key Dependencies

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "@supabase/supabase-js": "^2.45.4",
  "@tanstack/react-query": "^5.90.16",
  "tailwindcss": "^3.4.11",
  "lucide-react": "^0.441.0",
  "recharts": "^2.12.7",
  "react-hook-form": "^7.70.0",
  "zod": "^3.25.76"
}
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Netlify

1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables

### Manual

```bash
npm run build
# Deploy the `dist` folder to your hosting provider
```

---

## 📝 Recent Updates (v3.1.0)

### New Disposition Module
- **DispositionPage.jsx** - Main disposition dashboard
- **ContractRecordPage.jsx** - Contract management
- **SettlementStatementPage.jsx** - Settlement/HUD statements
- Updated routing in App.jsx

### Features Added
- Bulk sales schedule management for lot development
- Takedown schedule tracking with variance analysis
- Contract recording with all parties and terms
- Settlement statement with automatic calculations
- Fund tracking and wire confirmation

---

## 🔐 Authentication

Atlas uses Supabase Auth for authentication:
- Email/Password authentication
- Protected routes
- Role-based access control (RBAC)

---

## 📊 Database Schema

See `/supabase/migrations` for database schema and migrations.

Key tables:
- `entities` - Legal entities/LLCs
- `projects` - Development projects
- `opportunities` - Pipeline opportunities
- `contacts` - Contact management
- `transactions` - Financial transactions
- `documents` - Document metadata

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

Proprietary - VanRock Holdings LLC

---

## 📞 Support

For questions or issues, contact the development team.
