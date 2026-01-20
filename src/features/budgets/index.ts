// AtlasDev Budget Module
// Main Export Index
// VanRock Holdings LLC

// ============================================
// TYPES
// ============================================
export * from './types/budget.types';

// ============================================
// UTILITIES
// ============================================
export * from './utils/budgetCalculations';

// ============================================
// UI COMPONENTS
// ============================================
export {
  CurrencyInput,
  PercentInput,
  NumberInput,
  TextInput,
  CalculatedField,
  SectionHeader,
  CategorySection,
  BudgetLineItemRow,
  SubtotalRow,
  GrandTotalRow,
  MetricCard,
  TabNavigation,
  ActionButtons,
} from './components/ui/BudgetComponents';

// ============================================
// BUDGET COMPONENTS
// ============================================
export { HorizontalLotDevelopmentBudget } from './components/HorizontalLotDevelopmentBudget';
export { BuildToRentBudget } from './components/BuildToRentBudget';
export { BuildToSellBudget } from './components/BuildToSellBudget';
export { IndividualSpecHomeBudget } from './components/IndividualSpecHomeBudget';
export { PipelineDealAnalyzer } from './components/PipelineDealAnalyzer';
export { ConstructionBudgetTemplate } from './components/ConstructionBudgetTemplate';

// ============================================
// DEFAULT EXPORT - All Budget Components
// ============================================
import { HorizontalLotDevelopmentBudget } from './components/HorizontalLotDevelopmentBudget';
import { BuildToRentBudget } from './components/BuildToRentBudget';
import { BuildToSellBudget } from './components/BuildToSellBudget';
import { IndividualSpecHomeBudget } from './components/IndividualSpecHomeBudget';
import { PipelineDealAnalyzer } from './components/PipelineDealAnalyzer';
import { ConstructionBudgetTemplate } from './components/ConstructionBudgetTemplate';

export default {
  HorizontalLotDevelopmentBudget,
  BuildToRentBudget,
  BuildToSellBudget,
  IndividualSpecHomeBudget,
  PipelineDealAnalyzer,
  ConstructionBudgetTemplate,
};
