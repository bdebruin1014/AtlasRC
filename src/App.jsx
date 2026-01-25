import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { TransactionEntryProvider } from '@/contexts/TransactionEntryContext';
import TopNavigation from '@/components/TopNavigation';
import LoadingState from '@/components/LoadingState';
import { ChatButton } from '@/components/chat';
import ReminderWidget from '@/components/ReminderWidget';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } } });

// ============================================
// CORE PAGE IMPORTS
// ============================================
// Auth Pages (new TypeScript implementations)
const LoginPage = lazy(() => import('@/pages/Auth/Login'));
const SignUpPage = lazy(() => import('@/pages/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/Auth/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('@/pages/Auth/ResetPassword'));
const SharePointCallback = lazy(() => import('@/pages/auth/SharePointCallback'));
const OutlookCallback = lazy(() => import('@/pages/auth/OutlookCallback'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const ExecutiveDashboard = lazy(() => import('@/pages/ExecutiveDashboard'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'));
const EntitiesPage = lazy(() => import('@/pages/EntitiesPage'));
const OpportunitiesPage = lazy(() => import('@/pages/OpportunitiesPage'));
const OpportunityDetailPage = lazy(() => import('@/pages/OpportunityDetailPage'));
const ContactsPage = lazy(() => import('@/pages/ContactsPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// ============================================
// ACCOUNTING MODULE
// ============================================
const AccountingSidebar = lazy(() => import('@/components/AccountingSidebar'));
const AccountingEntitiesListPage = lazy(() => import('@/pages/accounting/AccountingEntitiesListPage'));
const EntityOwnershipHierarchyPage = lazy(() => import('@/pages/accounting/EntityOwnershipHierarchyPage'));
const EntityDashboardPage = lazy(() => import('@/pages/accounting/EntityDashboardPage'));
const EntityChartOfAccountsPage = lazy(() => import('@/pages/accounting/EntityChartOfAccountsPage'));
const EntityTransactionsPage = lazy(() => import('@/pages/accounting/EntityDashboardPage'));
const EntityBankingPage = lazy(() => import('@/pages/accounting/BankingPage'));
const EntityReconciliationPage = lazy(() => import('@/pages/accounting/EntityDashboardPage'));
const EntityInvoicesPage = lazy(() => import('@/pages/accounting/EntityDashboardPage'));
const EntityBillsPage = lazy(() => import('@/pages/accounting/EntityDashboardPage'));
const EntityReportsPage = lazy(() => import('@/pages/accounting/EntityDashboardPage'));
const EntityOwnershipPage = lazy(() => import('@/pages/accounting/EntityOwnershipPage'));
const EntityTasksPage = lazy(() => import('@/pages/accounting/EntityTasksPage'));

// Accounting Enhancements (Phase 7)
const Vendors1099Page = lazy(() => import('@/pages/accounting/Vendors1099Page'));
const BatchPaymentsPage = lazy(() => import('@/pages/accounting/BatchPaymentsPage'));
const ARAgingReportPage = lazy(() => import('@/pages/accounting/ARAgingReportPage'));
const EntityAccountingSettingsPage = lazy(() => import('@/pages/accounting/EntityAccountingSettingsPage'));
const ChartOfAccountsSettingsPage = lazy(() => import('@/pages/accounting/ChartOfAccountsSettingsPage'));
const BankAccountsSetupPage = lazy(() => import('@/pages/accounting/BankAccountsSetupPage'));

// Accounting Priority 2 (Phase 8)
const BankFeedsPage = lazy(() => import('@/pages/accounting/BankFeedsPage'));
const PayrollPage = lazy(() => import('@/pages/accounting/PayrollPage'));
const ExpenseManagementPage = lazy(() => import('@/pages/accounting/ExpenseManagementPage'));
const JobCostingReportPage = lazy(() => import('@/pages/accounting/JobCostingReportPage'));

// New Accounting Pages (TypeScript)
const AccountingDashboardPage = lazy(() => import('@/pages/Accounting/AccountingDashboard'));
const TransactionFormPage = lazy(() => import('@/pages/Accounting/TransactionForm'));
const TransactionDetailPage = lazy(() => import('@/pages/Accounting/TransactionDetail'));
const EntityLedgerPage = lazy(() => import('@/pages/Accounting/EntityLedger'));
const ProjectLedgerPage = lazy(() => import('@/pages/Accounting/ProjectLedger'));
const ChartOfAccountsPage = lazy(() => import('@/pages/Accounting/ChartOfAccounts'));

// ============================================
// ADMIN MODULE
// ============================================
const AdminSidebar = lazy(() => import('@/components/AdminSidebar'));
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'));
const AdminPage = lazy(() => import('@/pages/admin/AdminPage'));
const FloorPlansPage = lazy(() => import('@/pages/admin/FloorPlansPage'));
const PricingLibraryPage = lazy(() => import('@/pages/admin/PricingLibraryPage'));
const PlanPricingMatrixPage = lazy(() => import('@/pages/admin/PlanPricingMatrixPage'));
const MunicipalityFeesPage = lazy(() => import('@/pages/admin/MunicipalityFeesPage'));
const UpgradePricingPage = lazy(() => import('@/pages/admin/UpgradePricingPage'));
const SoftCostTemplatesPage = lazy(() => import('@/pages/admin/SoftCostTemplatesPage'));
const LotPrepTemplatesPage = lazy(() => import('@/pages/admin/LotPrepTemplatesPage'));
const BudgetTemplatesPage = lazy(() => import('@/pages/admin/BudgetTemplatesPage'));
const ProformaTemplatesPage = lazy(() => import('@/pages/admin/ProformaTemplatesPage'));
const ScheduleTemplatesPage = lazy(() => import('@/pages/admin/ScheduleTemplatesPage'));
const DealTemplatesPage = lazy(() => import('@/pages/admin/DealTemplatesPage'));
const AdminTaskTemplatesPage = lazy(() => import('@/pages/admin/TaskTemplatesPage'));
const MilestoneTemplatesPage = lazy(() => import('@/pages/admin/MilestoneTemplatesPage'));
const AdminProjectTemplatesPage = lazy(() => import('@/pages/admin/ProjectTemplatesPage'));
const COATemplatesPage = lazy(() => import('@/pages/admin/COATemplatesPage'));
const UsersManagementPage = lazy(() => import('@/pages/admin/UsersManagementPage'));
const IntegrationsPage = lazy(() => import('@/pages/admin/IntegrationsPage'));

// New Admin Pages (TypeScript)
const AdminSettingsPage = lazy(() => import('@/pages/Admin/Settings'));
const TeamManagementPage = lazy(() => import('@/pages/Admin/TeamManagement'));
const ActivityLogPage = lazy(() => import('@/pages/Admin/ActivityLog'));

// ============================================
// OPERATIONS ENHANCEMENTS
// ============================================
const DocumentExpirationTracker = lazy(() => import('@/components/DocumentExpirationTracker'));
const WorkOrderSystem = lazy(() => import('@/components/WorkOrderSystem'));
const GanttChart = lazy(() => import('@/components/GanttChart'));
const AuditTrail = lazy(() => import('@/components/AuditTrail'));
const ProjectActivityFeed = lazy(() => import('@/components/ProjectActivityFeed'));
const VendorPerformanceTracker = lazy(() => import('@/components/VendorPerformanceTracker'));
const ProjectHealthDashboard = lazy(() => import('@/components/ProjectHealthDashboard'));
const RecurringTasksManager = lazy(() => import('@/components/RecurringTasksManager'));
const RFITracker = lazy(() => import('@/components/RFITracker'));
const PunchList = lazy(() => import('@/components/PunchList'));
const MeetingMinutes = lazy(() => import('@/components/MeetingMinutes'));
const PhotoProgressTracker = lazy(() => import('@/components/PhotoProgressTracker'));
const ContactTimeline = lazy(() => import('@/components/ContactTimeline'));
const DocumentTemplates = lazy(() => import('@/components/DocumentTemplates'));
const ApprovalWorkflow = lazy(() => import('@/components/ApprovalWorkflow'));
const AdvancedSearch = lazy(() => import('@/components/AdvancedSearch'));
const EmailDashboard = lazy(() => import('@/components/EmailDashboard'));
const DashboardBuilder = lazy(() => import('@/components/DashboardBuilder'));
const DataImportExport = lazy(() => import('@/components/DataImportExport'));
const NotificationPreferences = lazy(() => import('@/components/NotificationPreferences'));
const ReportScheduler = lazy(() => import('@/components/ReportScheduler'));
const TagManager = lazy(() => import('@/components/TagManager'));
const BulkActions = lazy(() => import('@/components/BulkActions'));
const UserActivityAnalytics = lazy(() => import('@/components/UserActivityAnalytics'));
const CustomFieldsManager = lazy(() => import('@/components/CustomFieldsManager'));
const WebhookManager = lazy(() => import('@/components/WebhookManager'));
const CommentsNotes = lazy(() => import('@/components/CommentsNotes'));
const ContractManagement = lazy(() => import('@/components/ContractManagement'));
const ComparativeMarketAnalysis = lazy(() => import('@/components/ComparativeMarketAnalysis'));
const DealPipelineKanban = lazy(() => import('@/components/DealPipelineKanban'));
const TeamWorkloadDashboard = lazy(() => import('@/components/TeamWorkloadDashboard'));
const PropertyComparisonTool = lazy(() => import('@/components/PropertyComparisonTool'));
const SavedViewsManager = lazy(() => import('@/components/SavedViewsManager'));
const UserActivityTimeTracker = lazy(() => import('@/components/UserActivityTimeTracker'));
const MilestoneTracker = lazy(() => import('@/components/MilestoneTracker'));

// ============================================
// OPERATIONS & REPORTS
// ============================================
const OperationsDashboard = lazy(() => import('@/pages/OperationsDashboard'));
const GlobalTasksPage = lazy(() => import('@/pages/GlobalTasksPage'));
const TeamsPage = lazy(() => import('@/pages/operations/TeamsPage'));
const ESignPage = lazy(() => import('@/pages/operations/ESignPage'));
const DocumentLibraryPage = lazy(() => import('@/pages/operations/DocumentLibraryPage'));

// New Operations Pages (TypeScript)
const ContactsListPage = lazy(() => import('@/pages/Operations/ContactsList'));
const ContactDetailPage = lazy(() => import('@/pages/Operations/ContactDetail'));
const ContactFormPage = lazy(() => import('@/pages/Operations/ContactForm'));
const EntitiesListPage = lazy(() => import('@/pages/Operations/EntitiesList'));
const EntityDetailPage = lazy(() => import('@/pages/Operations/EntityDetail'));
const EntityFormPage = lazy(() => import('@/pages/Operations/EntityForm'));
const OpportunityFormPage = lazy(() => import('@/pages/OpportunityForm'));

// ============================================
// ACQUISITION PIPELINE MODULE
// ============================================
const AcquisitionPage = lazy(() => import('@/pages/pipeline/AcquisitionPage'));
const AcquisitionPropertyPage = lazy(() => import('@/pages/pipeline/AcquisitionPropertyPage'));
const DealAnalyzerPage = lazy(() => import('@/pages/pipeline/DealAnalyzerPage'));

const ReportsLayout = lazy(() => import('@/components/ReportsLayout'));
const PresetReportsPage = lazy(() => import('@/pages/reports/PresetReportsPage'));
const CustomReportsPage = lazy(() => import('@/pages/reports/CustomReportsPage'));
const SubscribedReportsPage = lazy(() => import('@/pages/reports/SubscribedReportsPage'));
const ReportPackagesPage = lazy(() => import('@/pages/reports/ReportPackagesPage'));
const TrendsPage = lazy(() => import('@/pages/reports/TrendsPage'));

// ============================================
// EOS MODULE
// ============================================
const EOSMainPage = lazy(() => import('@/pages/eos/EOSMainPage'));
const EOSDetailPage = lazy(() => import('@/pages/eos/EOSDetailPage'));

// ============================================
// PROJECT MODULE - Focused Pages
// ============================================
// Overview Section
const ProjectOverviewPage = lazy(() => import('@/pages/projects/ProjectOverviewPage'));
const PropertyDetailsPage = lazy(() => import('@/pages/projects/PropertyDetailsPage'));
const ProjectContactsPage = lazy(() => import('@/pages/projects/ContactsPage'));

// Acquisition Section
const ClosingChecklistPage = lazy(() => import('@/pages/projects/ClosingChecklistPage'));

// Construction Section
const BudgetPage = lazy(() => import('@/pages/projects/Budget/BudgetPage'));
const SchedulePage = lazy(() => import('@/pages/projects/Schedule/SchedulePage'));
const ActualsVsBudgetPage = lazy(() => import('@/pages/projects/ActualsVsBudgetPage'));
const InsurancePage = lazy(() => import('@/pages/projects/InsurancePage'));
const PermitsPage = lazy(() => import('@/pages/projects/Permits/PermitsPage'));
const BidsPage = lazy(() => import('@/pages/projects/Bids/BidsPage'));
const ExpensesPage = lazy(() => import('@/pages/projects/Expenses/ExpensesPage'));

// Finance Section
const CashFlowPage = lazy(() => import('@/pages/projects/CashFlow/CashFlowPage'));
const VendorsPage = lazy(() => import('@/pages/projects/VendorsPage'));
const SalesPage = lazy(() => import('@/pages/projects/Sales/SalesPage'));
const ProjectLoansPage = lazy(() => import('@/pages/projects/Loans/LoansPage'));
const DrawRequestsPage = lazy(() => import('@/pages/projects/DrawRequests/DrawRequestsPage'));
const ChangeOrdersPage = lazy(() => import('@/pages/projects/ChangeOrders/ChangeOrdersPage'));
const ProFormaPage = lazy(() => import('@/pages/projects/ProForma/ProFormaPage'));

// Documents Section
const DocumentsPage = lazy(() => import('@/pages/projects/DocumentsPage'));
const TasksPage = lazy(() => import('@/pages/projects/TasksPage'));

// Additional Project Pages (for legacy support)
const DealAnalysisPage = lazy(() => import('@/pages/projects/DealAnalysisPage'));
const ProjectSettingsPage = lazy(() => import('@/pages/projects/SettingsPage'));
const UnitsManagementPage = lazy(() => import('@/pages/projects/UnitsManagementPage'));
const TakedownSchedulePage = lazy(() => import('@/pages/projects/TakedownSchedulePage'));
const LeaseUpPage = lazy(() => import('@/pages/projects/LeaseUpPage'));

// Disposition Module
const DispositionPage = lazy(() => import('@/pages/projects/DispositionPage'));
const ContractRecordPage = lazy(() => import('@/pages/projects/ContractRecordPage'));
const SettlementStatementPage = lazy(() => import('@/pages/projects/SettlementStatementPage'));

// New Project Pages (Phase 9)
const BasicInfoPage = lazy(() => import('@/pages/projects/BasicInfoPage'));
const PropertyInfoPage = lazy(() => import('@/pages/projects/PropertyInfoPage'));
const PurchaseContractPage = lazy(() => import('@/pages/projects/PurchaseContractPage'));
const DueDiligencePage = lazy(() => import('@/pages/projects/DueDiligencePage'));
const ClosingPage = lazy(() => import('@/pages/projects/ClosingPage'));

// New Admin Pages (Phase 9)
const TeamsListPage = lazy(() => import('@/pages/admin/TeamsListPage'));

// Enhanced Contacts Pages (Phase 9)
const ContactDetailPageEnhanced = lazy(() => import('@/pages/Contacts/ContactDetail'));
const ContactFormPageEnhanced = lazy(() => import('@/pages/Contacts/ContactForm'));

const BudgetModuleRouter = lazy(() => import('@/features/budgets/components/BudgetModuleRouter'));

// ============================================
// PROTECTED ROUTE & LAYOUTS
// ============================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavigation />
      <main className="flex-1 overflow-auto"><Suspense fallback={<LoadingState />}>{children}</Suspense></main>
      <ReminderWidget />
      <ChatButton currentUser={user} />
    </div>
  );
};

const AdminLayout = ({ children }) => (
  <div className="flex h-[calc(100vh-40px)]">
    <Suspense fallback={<LoadingState />}><AdminSidebar /></Suspense>
    <div className="flex-1 overflow-auto"><Suspense fallback={<LoadingState />}>{children}</Suspense></div>
  </div>
);

const AccountingEntityLayout = ({ children }) => {
  const entity = { name: 'Highland Park Development LLC', type: 'project', cashBalance: 485000, ytdRevenue: 3200000, ytdExpenses: 2485000 };
  return (
    <TransactionEntryProvider>
      <div className="flex h-[calc(100vh-40px)]">
        <Suspense fallback={<LoadingState />}><AccountingSidebar entity={entity} /></Suspense>
        <div className="flex-1 overflow-auto"><Suspense fallback={<LoadingState />}>{children}</Suspense></div>
      </div>
    </TransactionEntryProvider>
  );
};

// ============================================
// APP ROUTES
// ============================================
const AppContent = () => (
  <Routes>
    {/* Auth Routes */}
    <Route path="/login" element={<Suspense fallback={<LoadingState />}><LoginPage /></Suspense>} />
    <Route path="/signup" element={<Suspense fallback={<LoadingState />}><SignUpPage /></Suspense>} />
    <Route path="/forgot-password" element={<Suspense fallback={<LoadingState />}><ForgotPasswordPage /></Suspense>} />
    <Route path="/reset-password" element={<Suspense fallback={<LoadingState />}><ResetPasswordPage /></Suspense>} />

    {/* OAuth Callback Routes */}
    <Route path="/auth/sharepoint/callback" element={<Suspense fallback={<LoadingState />}><SharePointCallback /></Suspense>} />
    <Route path="/auth/outlook/callback" element={<Suspense fallback={<LoadingState />}><OutlookCallback /></Suspense>} />

    {/* Core Routes */}
    <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
    <Route path="/executive" element={<ProtectedRoute><AppLayout><ExecutiveDashboard /></AppLayout></ProtectedRoute>} />
    <Route path="/projects" element={<ProtectedRoute><AppLayout><ProjectsPage /></AppLayout></ProtectedRoute>} />
    
    {/* ============================================ */}
    {/* PROJECT DETAIL ROUTES - Streamlined */}
    {/* ============================================ */}
    <Route path="/project/:projectId" element={<ProtectedRoute><AppLayout><ProjectDetailPage /></AppLayout></ProtectedRoute>} />
    
    {/* Overview Section */}
    <Route path="/project/:projectId/overview" element={<ProtectedRoute><AppLayout><ProjectOverviewPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/property-details" element={<ProtectedRoute><AppLayout><PropertyDetailsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/contacts" element={<ProtectedRoute><AppLayout><ProjectContactsPage /></AppLayout></ProtectedRoute>} />
    
    {/* Acquisition Section */}
    <Route path="/project/:projectId/acquisition" element={<ProtectedRoute><AppLayout><DealAnalysisPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/acquisition/contract" element={<ProtectedRoute><AppLayout><DealAnalysisPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/acquisition/due-diligence" element={<ProtectedRoute><AppLayout><DealAnalysisPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/acquisition/closing" element={<ProtectedRoute><AppLayout><ClosingChecklistPage /></AppLayout></ProtectedRoute>} />
    
    {/* Construction Section */}
    <Route path="/project/:projectId/construction" element={<ProtectedRoute><AppLayout><BudgetPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/construction/budget" element={<ProtectedRoute><AppLayout><BudgetPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/construction/schedule" element={<ProtectedRoute><AppLayout><SchedulePage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/construction/budget-vs-actual" element={<ProtectedRoute><AppLayout><ActualsVsBudgetPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/construction/insurance" element={<ProtectedRoute><AppLayout><InsurancePage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/construction/change-orders" element={<ProtectedRoute><AppLayout><ChangeOrdersPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/construction/permits" element={<ProtectedRoute><AppLayout><PermitsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/construction/bids" element={<ProtectedRoute><AppLayout><BidsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/construction/work-orders" element={<ProtectedRoute><AppLayout><WorkOrderSystem /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/construction/gantt" element={<ProtectedRoute><AppLayout><GanttChart /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/construction/rfis" element={<ProtectedRoute><AppLayout><RFITracker /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/construction/punch-list" element={<ProtectedRoute><AppLayout><PunchList /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/construction/photos" element={<ProtectedRoute><AppLayout><PhotoProgressTracker /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/meetings" element={<ProtectedRoute><AppLayout><MeetingMinutes /></AppLayout></ProtectedRoute>} />

    {/* Finance Section */}
    <Route path="/project/:projectId/finance" element={<ProtectedRoute><AppLayout><CashFlowPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/finance/summary" element={<ProtectedRoute><AppLayout><CashFlowPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/finance/expenses" element={<ProtectedRoute><AppLayout><ExpensesPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/finance/revenue" element={<ProtectedRoute><AppLayout><SalesPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/finance/loans" element={<ProtectedRoute><AppLayout><ProjectLoansPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/finance/draws" element={<ProtectedRoute><AppLayout><DrawRequestsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/finance/proforma" element={<ProtectedRoute><AppLayout><ProFormaPage /></AppLayout></ProtectedRoute>} />
    
    {/* Documents Section */}
    <Route path="/project/:projectId/documents" element={<ProtectedRoute><AppLayout><DocumentsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/documents/files" element={<ProtectedRoute><AppLayout><DocumentsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/documents/mailing" element={<ProtectedRoute><AppLayout><DocumentsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/documents/communications" element={<ProtectedRoute><AppLayout><DocumentsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/documents/esigned" element={<ProtectedRoute><AppLayout><DocumentsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/documents/expiration" element={<ProtectedRoute><AppLayout><DocumentExpirationTracker /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/audit" element={<ProtectedRoute><AppLayout><AuditTrail /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/activity" element={<ProtectedRoute><AppLayout><ProjectActivityFeed /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/health" element={<ProtectedRoute><AppLayout><ProjectHealthDashboard /></AppLayout></ProtectedRoute>} />
    
    {/* New Project Pages (Phase 9) */}
    <Route path="/project/:projectId/basic-info" element={<ProtectedRoute><AppLayout><BasicInfoPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/property-info" element={<ProtectedRoute><AppLayout><PropertyInfoPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/purchase-contract" element={<ProtectedRoute><AppLayout><PurchaseContractPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/due-diligence" element={<ProtectedRoute><AppLayout><DueDiligencePage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/closing" element={<ProtectedRoute><AppLayout><ClosingPage /></AppLayout></ProtectedRoute>} />

    {/* Additional Project Routes */}
    <Route path="/project/:projectId/tasks" element={<ProtectedRoute><AppLayout><TasksPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/units" element={<ProtectedRoute><AppLayout><UnitsManagementPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/takedown" element={<ProtectedRoute><AppLayout><TakedownSchedulePage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/lease-up" element={<ProtectedRoute><AppLayout><LeaseUpPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/settings" element={<ProtectedRoute><AppLayout><ProjectSettingsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/deal-analysis" element={<ProtectedRoute><AppLayout><DealAnalysisPage /></AppLayout></ProtectedRoute>} />
    
    {/* Disposition Module Routes */}
    <Route path="/project/:projectId/disposition" element={<ProtectedRoute><AppLayout><DispositionPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/disposition/contracts" element={<ProtectedRoute><AppLayout><DispositionPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/disposition/contracts/new" element={<ProtectedRoute><AppLayout><ContractRecordPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/disposition/contracts/:contractId" element={<ProtectedRoute><AppLayout><ContractRecordPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/disposition/settlements" element={<ProtectedRoute><AppLayout><DispositionPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/disposition/settlements/new" element={<ProtectedRoute><AppLayout><SettlementStatementPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/disposition/settlements/:settlementId" element={<ProtectedRoute><AppLayout><SettlementStatementPage /></AppLayout></ProtectedRoute>} />
    
    {/* Legacy Project Routes - Redirect to new structure */}
    <Route path="/project/:projectId/schedule" element={<ProtectedRoute><AppLayout><SchedulePage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/budget" element={<ProtectedRoute><AppLayout><BudgetPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/actuals-vs-budget" element={<ProtectedRoute><AppLayout><ActualsVsBudgetPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/insurance" element={<ProtectedRoute><AppLayout><InsurancePage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/proforma" element={<ProtectedRoute><AppLayout><ProFormaPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/vendors" element={<ProtectedRoute><AppLayout><VendorsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/loans" element={<ProtectedRoute><AppLayout><ProjectLoansPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/draw-requests" element={<ProtectedRoute><AppLayout><DrawRequestsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/change-orders" element={<ProtectedRoute><AppLayout><ChangeOrdersPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/permits" element={<ProtectedRoute><AppLayout><PermitsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/bids" element={<ProtectedRoute><AppLayout><BidsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/expenses" element={<ProtectedRoute><AppLayout><ExpensesPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/sales" element={<ProtectedRoute><AppLayout><SalesPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/cash-flow" element={<ProtectedRoute><AppLayout><CashFlowPage /></AppLayout></ProtectedRoute>} />
    <Route path="/project/:projectId/closing-checklist" element={<ProtectedRoute><AppLayout><ClosingChecklistPage /></AppLayout></ProtectedRoute>} />

    {/* ============================================ */}
    {/* OPPORTUNITIES MODULE */}
    {/* ============================================ */}
    <Route path="/opportunities" element={<ProtectedRoute><AppLayout><OpportunitiesPage /></AppLayout></ProtectedRoute>} />
    <Route path="/opportunities/new" element={<ProtectedRoute><AppLayout><OpportunityFormPage /></AppLayout></ProtectedRoute>} />
    <Route path="/opportunity/:opportunityId" element={<ProtectedRoute><AppLayout><OpportunityDetailPage /></AppLayout></ProtectedRoute>} />
    <Route path="/opportunity/:opportunityId/edit" element={<ProtectedRoute><AppLayout><OpportunityFormPage /></AppLayout></ProtectedRoute>} />
    <Route path="/opportunity/:opportunityId/*" element={<ProtectedRoute><AppLayout><OpportunityDetailPage /></AppLayout></ProtectedRoute>} />

    {/* ============================================ */}
    {/* ENTITIES MODULE */}
    {/* ============================================ */}
    <Route path="/entities" element={<ProtectedRoute><AppLayout><EntitiesPage /></AppLayout></ProtectedRoute>} />
    <Route path="/entities/list" element={<ProtectedRoute><AppLayout><EntitiesListPage /></AppLayout></ProtectedRoute>} />
    <Route path="/entities/new" element={<ProtectedRoute><AppLayout><EntityFormPage /></AppLayout></ProtectedRoute>} />
    <Route path="/entity/:entityId" element={<ProtectedRoute><AppLayout><EntityDetailPage /></AppLayout></ProtectedRoute>} />
    <Route path="/entity/:entityId/edit" element={<ProtectedRoute><AppLayout><EntityFormPage /></AppLayout></ProtectedRoute>} />

    {/* ============================================ */}
    {/* CONTACTS MODULE */}
    {/* ============================================ */}
    <Route path="/contacts" element={<ProtectedRoute><AppLayout><ContactsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/contacts/list" element={<ProtectedRoute><AppLayout><ContactsListPage /></AppLayout></ProtectedRoute>} />
    <Route path="/contacts/new" element={<ProtectedRoute><AppLayout><ContactFormPageEnhanced /></AppLayout></ProtectedRoute>} />
    <Route path="/contacts/:contactId" element={<ProtectedRoute><AppLayout><ContactDetailPageEnhanced /></AppLayout></ProtectedRoute>} />
    <Route path="/contacts/:contactId/edit" element={<ProtectedRoute><AppLayout><ContactFormPageEnhanced /></AppLayout></ProtectedRoute>} />
    <Route path="/contact/:contactId" element={<ProtectedRoute><AppLayout><ContactDetailPage /></AppLayout></ProtectedRoute>} />
    <Route path="/contact/:contactId/edit" element={<ProtectedRoute><AppLayout><ContactFormPage /></AppLayout></ProtectedRoute>} />
    <Route path="/contacts/:contactId/timeline" element={<ProtectedRoute><AppLayout><ContactTimeline /></AppLayout></ProtectedRoute>} />

    {/* Calendar & Settings */}
    <Route path="/calendar" element={<ProtectedRoute><AppLayout><CalendarPage /></AppLayout></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />

    {/* ============================================ */}
    {/* ACCOUNTING MODULE */}
    {/* ============================================ */}
    <Route path="/accounting" element={<ProtectedRoute><AppLayout><AccountingEntitiesListPage /></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/dashboard" element={<ProtectedRoute><AppLayout><AccountingDashboardPage /></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/hierarchy" element={<ProtectedRoute><AppLayout><EntityOwnershipHierarchyPage /></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/chart-of-accounts" element={<ProtectedRoute><AppLayout><ChartOfAccountsPage /></AppLayout></ProtectedRoute>} />

    {/* Transaction Routes */}
    <Route path="/accounting/transactions" element={<ProtectedRoute><AppLayout><AccountingDashboardPage /></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/transactions/new" element={<ProtectedRoute><AppLayout><TransactionFormPage /></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/transactions/:transactionId" element={<ProtectedRoute><AppLayout><TransactionDetailPage /></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/transactions/:transactionId/edit" element={<ProtectedRoute><AppLayout><TransactionFormPage /></AppLayout></ProtectedRoute>} />

    {/* Ledger Routes */}
    <Route path="/accounting/entity-ledger/:entityId" element={<ProtectedRoute><AppLayout><EntityLedgerPage /></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/project-ledger/:projectId" element={<ProtectedRoute><AppLayout><ProjectLedgerPage /></AppLayout></ProtectedRoute>} />
    
    {/* Entity-Specific Accounting Routes */}
    <Route path="/accounting/:entityId" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityDashboardPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/dashboard" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityDashboardPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/chart-of-accounts" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityChartOfAccountsPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/banking" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityBankingPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/transactions" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityTransactionsPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/ownership" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityOwnershipPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/tasks" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityTasksPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/journal-entries" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityTransactionsPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/reconciliation" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityReconciliationPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/invoices" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityInvoicesPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/bills" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityBillsPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/payments" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityDashboardPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/intercompany" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityDashboardPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/due-to-from" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityDashboardPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/reports" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityReportsPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/trial-balance" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityReportsPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/cash-flow" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityReportsPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    
    {/* Accounting Enhancements - Phase 7 */}
    <Route path="/accounting/:entityId/vendors-1099" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><Vendors1099Page /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/batch-payments" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><BatchPaymentsPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/ar-aging" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><ARAgingReportPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/settings" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityAccountingSettingsPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/settings/chart-of-accounts" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><ChartOfAccountsSettingsPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/settings/bank-accounts" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><BankAccountsSetupPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    
    {/* Accounting Priority 2 - Phase 8 */}
    <Route path="/accounting/:entityId/bank-feeds" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><BankFeedsPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/payroll" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><PayrollPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/expenses" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><ExpenseManagementPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    <Route path="/accounting/:entityId/job-costing" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><JobCostingReportPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />
    
    <Route path="/accounting/:entityId/*" element={<ProtectedRoute><AppLayout><AccountingEntityLayout><EntityDashboardPage /></AccountingEntityLayout></AppLayout></ProtectedRoute>} />

    {/* Reports */}
    <Route path="/reports" element={<ProtectedRoute><AppLayout><ReportsLayout /></AppLayout></ProtectedRoute>}>
      <Route index element={<Navigate to="/reports/preset" replace />} />
      <Route path="preset" element={<PresetReportsPage />} />
      <Route path="preset/:category" element={<PresetReportsPage />} />
      <Route path="custom" element={<CustomReportsPage />} />
      <Route path="subscribed" element={<SubscribedReportsPage />} />
      <Route path="packages" element={<ReportPackagesPage />} />
      <Route path="trends" element={<TrendsPage />} />
    </Route>

    {/* Admin Routes with Sidebar */}
    <Route path="/admin" element={<ProtectedRoute><AppLayout><AdminLayout><AdminOverviewPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute><AppLayout><AdminLayout><UsersManagementPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/team" element={<ProtectedRoute><AppLayout><AdminLayout><TeamManagementPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/settings" element={<ProtectedRoute><AppLayout><AdminLayout><AdminSettingsPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/activity-log" element={<ProtectedRoute><AppLayout><AdminLayout><ActivityLogPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/audit-trail" element={<ProtectedRoute><AppLayout><AdminLayout><AuditTrail /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/plans" element={<ProtectedRoute><AppLayout><AdminLayout><FloorPlansPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    
    {/* Pricing Library Routes */}
    <Route path="/admin/pricing" element={<ProtectedRoute><AppLayout><AdminLayout><PricingLibraryPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/pricing/plans" element={<ProtectedRoute><AppLayout><AdminLayout><PlanPricingMatrixPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/pricing/municipalities" element={<ProtectedRoute><AppLayout><AdminLayout><MunicipalityFeesPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/pricing/upgrades" element={<ProtectedRoute><AppLayout><AdminLayout><UpgradePricingPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/pricing/soft-costs" element={<ProtectedRoute><AppLayout><AdminLayout><SoftCostTemplatesPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/pricing/lot-prep" element={<ProtectedRoute><AppLayout><AdminLayout><LotPrepTemplatesPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    
    {/* Other Admin Templates */}
    <Route path="/admin/budget-templates" element={<ProtectedRoute><AppLayout><AdminLayout><BudgetTemplatesPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/proforma-templates" element={<ProtectedRoute><AppLayout><AdminLayout><ProformaTemplatesPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/schedule-templates" element={<ProtectedRoute><AppLayout><AdminLayout><ScheduleTemplatesPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/deal-templates" element={<ProtectedRoute><AppLayout><AdminLayout><DealTemplatesPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/task-templates" element={<ProtectedRoute><AppLayout><AdminLayout><AdminTaskTemplatesPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/milestone-templates" element={<ProtectedRoute><AppLayout><AdminLayout><MilestoneTemplatesPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/project-templates" element={<ProtectedRoute><AppLayout><AdminLayout><AdminProjectTemplatesPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/coa-templates" element={<ProtectedRoute><AppLayout><AdminLayout><COATemplatesPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/integrations" element={<ProtectedRoute><AppLayout><AdminLayout><IntegrationsPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/teams" element={<ProtectedRoute><AppLayout><AdminLayout><TeamsListPage /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/*" element={<ProtectedRoute><AppLayout><AdminLayout><AdminPage /></AdminLayout></AppLayout></ProtectedRoute>} />

    {/* Operations */}
    <Route path="/operations" element={<ProtectedRoute><AppLayout><OperationsDashboard /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/tasks" element={<ProtectedRoute><AppLayout><GlobalTasksPage /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/teams" element={<ProtectedRoute><AppLayout><TeamsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/esign" element={<ProtectedRoute><AppLayout><ESignPage /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/documents" element={<ProtectedRoute><AppLayout><DocumentLibraryPage /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/document-expiration" element={<ProtectedRoute><AppLayout><DocumentExpirationTracker /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/work-orders" element={<ProtectedRoute><AppLayout><WorkOrderSystem /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/vendors" element={<ProtectedRoute><AppLayout><VendorPerformanceTracker /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/recurring-tasks" element={<ProtectedRoute><AppLayout><RecurringTasksManager /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/approvals" element={<ProtectedRoute><AppLayout><ApprovalWorkflow /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/templates" element={<ProtectedRoute><AppLayout><DocumentTemplates /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/emails" element={<ProtectedRoute><AppLayout><EmailDashboard /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/import-export" element={<ProtectedRoute><AppLayout><DataImportExport /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/report-scheduler" element={<ProtectedRoute><AppLayout><ReportScheduler /></AppLayout></ProtectedRoute>} />
    <Route path="/search" element={<ProtectedRoute><AppLayout><AdvancedSearch /></AppLayout></ProtectedRoute>} />
    <Route path="/dashboard-builder" element={<ProtectedRoute><AppLayout><DashboardBuilder /></AppLayout></ProtectedRoute>} />
    <Route path="/settings/notifications" element={<ProtectedRoute><AppLayout><NotificationPreferences /></AppLayout></ProtectedRoute>} />
    <Route path="/admin/tags" element={<ProtectedRoute><AppLayout><AdminLayout><TagManager /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/bulk-actions" element={<ProtectedRoute><AppLayout><AdminLayout><BulkActions /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/analytics" element={<ProtectedRoute><AppLayout><AdminLayout><UserActivityAnalytics /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/custom-fields" element={<ProtectedRoute><AppLayout><AdminLayout><CustomFieldsManager /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/admin/webhooks" element={<ProtectedRoute><AppLayout><AdminLayout><WebhookManager /></AdminLayout></AppLayout></ProtectedRoute>} />
    <Route path="/operations/comments" element={<ProtectedRoute><AppLayout><CommentsNotes /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/contracts" element={<ProtectedRoute><AppLayout><ContractManagement /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/cma" element={<ProtectedRoute><AppLayout><ComparativeMarketAnalysis /></AppLayout></ProtectedRoute>} />
    <Route path="/pipeline" element={<ProtectedRoute><AppLayout><DealPipelineKanban /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/team-workload" element={<ProtectedRoute><AppLayout><TeamWorkloadDashboard /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/property-compare" element={<ProtectedRoute><AppLayout><PropertyComparisonTool /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/saved-views" element={<ProtectedRoute><AppLayout><SavedViewsManager /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/activity-tracker" element={<ProtectedRoute><AppLayout><UserActivityTimeTracker /></AppLayout></ProtectedRoute>} />
    <Route path="/operations/milestones" element={<ProtectedRoute><AppLayout><MilestoneTracker /></AppLayout></ProtectedRoute>} />

    {/* ============================================ */}
    {/* ACQUISITION PIPELINE MODULE */}
    {/* ============================================ */}
    <Route path="/acquisition" element={<ProtectedRoute><AppLayout><AcquisitionPage /></AppLayout></ProtectedRoute>} />
    <Route path="/acquisition/:propertyId" element={<ProtectedRoute><AppLayout><AcquisitionPropertyPage /></AppLayout></ProtectedRoute>} />
    <Route path="/deal-analyzer" element={<ProtectedRoute><AppLayout><DealAnalyzerPage /></AppLayout></ProtectedRoute>} />

    {/* EOS Module */}
    <Route path="/eos" element={<ProtectedRoute><AppLayout><EOSMainPage /></AppLayout></ProtectedRoute>} />
    <Route path="/eos/:programId/*" element={<ProtectedRoute><AppLayout><EOSDetailPage /></AppLayout></ProtectedRoute>} />

    {/* Budget Tools */}
    <Route path="/budgets/*" element={<ProtectedRoute><AppLayout><BudgetModuleRouter /></AppLayout></ProtectedRoute>} />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Helmet><title>Atlas | Real Estate Development Platform</title></Helmet>
        <AuthProvider><PermissionProvider><AppContent /><Toaster /></PermissionProvider></AuthProvider>
        </Router>
      </QueryClientProvider>
  );
}

export default App;
