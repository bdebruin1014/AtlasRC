import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Building2, LayoutDashboard, FileText, CreditCard, 
  BookOpen, List, Wallet, Users, Settings, AlertTriangle, Briefcase
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { cn, isValidUUID } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components for Tabs
import EntityAccountingDashboard from '@/pages/accounting/EntityAccountingDashboard';
import BillsList from '@/components/accounting/BillsList';
import PaymentsList from '@/components/accounting/PaymentsList';
import JournalEntriesList from '@/components/accounting/JournalEntriesList';
import AllTransactionsView from '@/components/accounting/AllTransactionsView';
import BankAccountsPage from '@/pages/accounting/BankAccountsPage';
import VendorsPage from '@/pages/accounting/VendorsPage';
import ChartOfAccountsPage from '@/pages/accounting/ChartOfAccountsPage';
import EntitySettingsPage from '@/pages/accounting/EntitySettingsPage';
import EntityCapitalPage from '@/pages/accounting/EntityCapitalPage';

const TABS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: 'dashboard' },
  { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: List, path: 'chart-of-accounts' },
  { id: 'bills', label: 'Bills', icon: FileText, path: 'bills', hasBadge: true },
  { id: 'payments', label: 'Payments', icon: CreditCard, path: 'payments', hasBadge: true },
  { id: 'journal-entries', label: 'Journal Entries', icon: BookOpen, path: 'journal-entries' },
  { id: 'capital', label: 'Capital', icon: Briefcase, path: 'capital' },
  { id: 'banking', label: 'Bank Accounts', icon: Wallet, path: 'banking' },
  { id: 'vendors', label: 'Vendors', icon: Users, path: 'vendors' },
  { id: 'settings', label: 'Settings', icon: Settings, path: 'settings' },
];

const AccountingPage = () => {
  const { entityId, tab } = useParams();
  const navigate = useNavigate();
  
  const [entityName, setEntityName] = useState('Loading...');
  const [activeTab, setActiveTab] = useState(tab || 'dashboard');
  const [counts, setCounts] = useState({ bills: 0, payments: 0 });
  const [error, setError] = useState(null);

  // Sync tab state with URL param
  useEffect(() => {
    if (tab && TABS.find(t => t.path === tab)) {
      setActiveTab(tab);
      sessionStorage.setItem(`last_accounting_tab_${entityId}`, tab);
    } else if (!tab) {
      const lastTab = sessionStorage.getItem(`last_accounting_tab_${entityId}`);
      if (lastTab) {
        navigate(`/accounting/entities/${entityId}/${lastTab}`, { replace: true });
      } else {
        navigate(`/accounting/entities/${entityId}/dashboard`, { replace: true });
      }
    }
  }, [tab, entityId, navigate]);

  // Fetch Entity Info & Counts
  useEffect(() => {
    const fetchData = async () => {
      if (!entityId) return;
      
      if (!isValidUUID(entityId)) {
        setError("Invalid Entity ID");
        setEntityName("Unknown Entity");
        return;
      }

      try {
        // 1. Get Entity Name
        const { data: ent, error: entError } = await supabase
          .from('entities')
          .select('name')
          .eq('id', entityId)
          .single();
        
        if (entError) throw entError;
        if (ent) setEntityName(ent.name);

        // 2. Get Counts
        const { count: billCount } = await supabase
          .from('bills')
          .select('*', { count: 'exact', head: true })
          .eq('entity_id', entityId)
          .neq('status', 'Paid')
          .neq('status', 'Void');

        const { count: payCount } = await supabase
          .from('bill_payments')
          .select('*', { count: 'exact', head: true })
          .eq('entity_id', entityId)
          .eq('status', 'Pending'); 

        setCounts({ 
          bills: billCount || 0, 
          payments: payCount || 0 
        });
      } catch (err) {
        console.error("Error loading entity details:", err);
        setError("Entity not found or access denied.");
      }
    };
    
    fetchData();
  }, [entityId]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    // If switching to capital, we might default to members, but let the CapitalPage handle that redirect logic or the router will catch /capital/members if we navigate there.
    // For now, just navigate to the base tab path.
    navigate(`/accounting/entities/${entityId}/${value}`);
  };

  // Render content based on active tab
  const renderContent = () => {
    if (error) return null; // Don't render children if error exists

    switch (activeTab) {
      case 'dashboard': return <EntityAccountingDashboard />; 
      case 'bills': return (
          <div className="p-6 bg-gray-50 min-h-full">
            <div className="max-w-[1600px] mx-auto">
              <BillsList entityId={entityId} onSelectBill={() => {}} onNewBill={() => {}} />
            </div>
          </div>
        );
      case 'payments': return (
          <div className="p-6 bg-gray-50 min-h-full">
            <div className="max-w-[1600px] mx-auto">
              <PaymentsList entityId={entityId} onSelectPayment={() => {}} onNewPayment={() => {}} />
            </div>
          </div>
        );
      case 'journal-entries': return (
          <div className="p-6 bg-gray-50 min-h-full">
            <div className="max-w-[1600px] mx-auto">
              <JournalEntriesList entityId={entityId} onSelectEntry={() => {}} onNewEntry={() => {}} />
            </div>
          </div>
        );
      case 'capital': return (
          <div className="p-6 bg-gray-50 min-h-full">
             <div className="max-w-[1600px] mx-auto">
                <EntityCapitalPage />
             </div>
          </div>
      );
      case 'all-transactions': return (
          <div className="p-6 bg-gray-50 min-h-full">
            <div className="max-w-[1600px] mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">All Transactions</h2>
                <p className="text-sm text-gray-500">Unified view of bills, payments, and journal entries.</p>
              </div>
              <AllTransactionsView 
                entityId={entityId} 
                onNavigate={(type, item) => {
                  if (type === 'bills') navigate(`/accounting/entities/${entityId}/bills`);
                }}
              />
            </div>
          </div>
        );
      case 'banking': return <BankAccountsPage />;
      case 'vendors': return <VendorsPage />;
      case 'chart-of-accounts': return <ChartOfAccountsPage />;
      case 'settings': return <EntitySettingsPage />;
      default: return <EntityAccountingDashboard />;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Entity</h1>
          <p className="text-gray-500 mb-6 text-sm">The entity ID provided is invalid or does not exist. Please return to the main accounting page.</p>
          <Button onClick={() => navigate('/accounting')} className="w-full">
            Return to Entity List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{entityName} | Accounting</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-white overflow-hidden">
        {/* Top Header & Tabs */}
        <div className="border-b border-gray-200 bg-white shrink-0 pt-4 px-6">
          <div className="max-w-[1600px] mx-auto">
            {/* Entity Title */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 leading-none">{entityName}</h1>
                  <p className="text-xs text-gray-500 mt-1">Entity Accounting</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/accounting')}>
                Switch Entity
              </Button>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="bg-transparent p-0 h-auto space-x-1 overflow-x-auto no-scrollbar flex w-full justify-start border-b border-gray-100">
                {TABS.map((t) => (
                  <TabsTrigger
                    key={t.id}
                    value={t.path}
                    className={cn(
                      "rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none bg-transparent",
                      "flex items-center gap-2 transition-all"
                    )}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                    {t.hasBadge && t.id === 'bills' && counts.bills > 0 && (
                      <Badge className="ml-1 h-5 px-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200" variant="secondary">
                        {counts.bills}
                      </Badge>
                    )}
                    {t.hasBadge && t.id === 'payments' && counts.payments > 0 && (
                      <Badge className="ml-1 h-5 px-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200" variant="secondary">
                        {counts.payments}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden bg-[#F7FAFC] relative">
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default AccountingPage;