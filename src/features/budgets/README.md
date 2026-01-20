# AtlasDev Budget Module

React-based budget tools for real estate development projects. Converted from Excel templates for use in the AtlasDev platform.

## 📦 Components Included

### Pipeline Module
- **PipelineDealAnalyzer** - Single deal acquisition analysis with proforma, ROI, and profit projections

### Construction Module
- **IndividualSpecHomeBudget** - Single spec home construction budget with line-item costs
- **ConstructionBudgetTemplate** - Detailed SOV (Schedule of Values) with draw request system
- **HorizontalLotDevelopmentBudget** - 100-lot subdivision development budget
- **BuildToRentBudget** - 100-home BTR community with unit mix and yield analysis
- **BuildToSellBudget** - 100-home for-sale community with product mix and absorption

## 🚀 Installation

### 1. Copy Files to Your AtlasDev Project

```bash
# Copy the entire atlas-budgets folder to your src directory
cp -r atlas-budgets/ your-project/src/features/budgets/
```

### 2. Folder Structure

```
src/
└── features/
    └── budgets/
        ├── index.ts                    # Main exports
        ├── types/
        │   └── budget.types.ts         # TypeScript interfaces
        ├── utils/
        │   └── budgetCalculations.ts   # Utility functions
        └── components/
            ├── ui/
            │   └── BudgetComponents.tsx    # Shared UI components
            ├── BudgetModuleRouter.tsx      # Navigation router
            ├── PipelineDealAnalyzer.tsx
            ├── IndividualSpecHomeBudget.tsx
            ├── ConstructionBudgetTemplate.tsx
            ├── HorizontalLotDevelopmentBudget.tsx
            ├── BuildToRentBudget.tsx
            └── BuildToSellBudget.tsx
```

### 3. Dependencies

These components use only React and Tailwind CSS. Make sure you have:

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.0.0"
  }
}
```

## 📖 Usage

### Option 1: Use the Router (Recommended)

The `BudgetModuleRouter` provides a nice selection UI for all budget tools:

```tsx
import { BudgetModuleRouter } from '@/features/budgets';

function BudgetsPage() {
  return <BudgetModuleRouter />;
}
```

### Option 2: Use Individual Components

Import specific budget tools directly:

```tsx
import { 
  PipelineDealAnalyzer,
  IndividualSpecHomeBudget,
  ConstructionBudgetTemplate,
  HorizontalLotDevelopmentBudget,
  BuildToRentBudget,
  BuildToSellBudget 
} from '@/features/budgets';

// Use in your routes
<Route path="/pipeline/analyzer" element={<PipelineDealAnalyzer />} />
<Route path="/construction/budget" element={<ConstructionBudgetTemplate />} />
```

### Option 3: Use Shared UI Components

Build custom budget interfaces using the shared components:

```tsx
import { 
  CurrencyInput, 
  PercentInput,
  CategorySection,
  MetricCard,
  GrandTotalRow 
} from '@/features/budgets';

function CustomBudget() {
  const [amount, setAmount] = useState(0);
  
  return (
    <div>
      <CurrencyInput 
        label="Land Cost" 
        value={amount} 
        onChange={setAmount} 
      />
      <MetricCard label="Total" value={amount} />
    </div>
  );
}
```

## 🎨 Customization

### Color Schemes

Each budget type has a designated color scheme:
- **Pipeline/Deal Analyzer**: Slate (`bg-slate-700`)
- **Spec Home/Construction**: Emerald (`bg-emerald-700`)
- **Build to Rent**: Blue (`bg-blue-700`)
- **Build to Sell**: Purple (`bg-purple-700`)
- **Horizontal Development**: Emerald (`bg-emerald-800`)

### Default Values

Edit the `default*` objects in each component to change starting values:

```tsx
// In IndividualSpecHomeBudget.tsx
const defaultPlanSelection: PlanSelection = {
  planName: 'Your Default Plan',
  heatedSqFt: 2500,
  bedsBaths: '4/3',
  // ...
};
```

### Adding Line Items

Add new budget line items to the `defaultCategories` array:

```tsx
{
  id: 'new_category',
  name: 'NEW CATEGORY',
  items: [
    { id: generateId(), description: 'New Item', budget: 1000, actual: 0, notes: '' },
  ],
}
```

## 🔧 Utility Functions

Available in `budgetCalculations.ts`:

```tsx
import {
  formatCurrency,      // formatCurrency(50000) → "$50,000"
  formatPercent,       // formatPercent(0.125) → "12.5%"
  formatNumber,        // formatNumber(1500) → "1,500"
  parseCurrency,       // parseCurrency("$50,000") → 50000
  calculateROI,        // calculateROI(profit, equity)
  calculateCashMultiple,
  generateId,          // Generate unique IDs
} from '@/features/budgets';
```

## 📊 Features by Component

| Component | Budget Entry | Actual Tracking | Draw Schedule | Unit Mix | Profit Analysis | Timeline |
|-----------|--------------|-----------------|---------------|----------|-----------------|----------|
| Pipeline Deal Analyzer | ✓ | - | - | - | ✓ | ✓ |
| Spec Home Budget | ✓ | ✓ | - | - | ✓ | - |
| Construction (SOV) | ✓ | ✓ | ✓ | - | - | - |
| Horizontal Lot Dev | ✓ | - | ✓ | - | - | - |
| Build to Rent | ✓ | - | - | ✓ | ✓ | - |
| Build to Sell | ✓ | - | ✓ | ✓ | ✓ | - |

## 🔌 Integration with Supabase

To persist data to your database, add save/load logic:

```tsx
// Example: Save budget to Supabase
const saveBudget = async (budgetData) => {
  const { data, error } = await supabase
    .from('project_budgets')
    .upsert({
      project_id: projectId,
      budget_type: 'spec_home',
      data: budgetData,
      updated_at: new Date().toISOString(),
    });
};

// Pass to component
<IndividualSpecHomeBudget 
  onSave={saveBudget}
  initialData={existingBudget}
/>
```

## 📝 Notes

- All currency inputs accept formatted ($1,000) or raw (1000) values
- Percentage inputs expect decimals (0.05 for 5%) but display as percentages
- Components are fully responsive and work on mobile
- Print styles are included for generating reports

## 🏗️ Built For

VanRock Holdings LLC - AtlasDev Platform

---

For questions or customization requests, contact the development team.
