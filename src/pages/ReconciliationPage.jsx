import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Calculator } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ReconciliationPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [statementDate, setStatementDate] = useState('');
  const [statementBalance, setStatementBalance] = useState('');
  const [loading, setLoading] = useState(true);
  const [reconciliationStarted, setReconciliationStarted] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('bank_accounts')
          .select('id, account_name, current_balance')
          .eq('entity_id', entityId);
        setAccounts(data || []);
      } catch (err) {
        console.error(err);
        toast({ variant: "destructive", title: "Error", description: "Failed to load bank accounts." });
      } finally {
        setLoading(false);
      }
    };
    if (entityId) fetchAccounts();
  }, [entityId]);

  const handleStartReconciliation = () => {
    if (!selectedAccountId || !statementDate || !statementBalance) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please provide account, date, and ending balance." });
      return;
    }
    setReconciliationStarted(true);
    toast({ title: "Reconciliation Started", description: "Begin matching transactions to statement items." });
  };

  return (
    <>
      <Helmet>
        <title>Reconciliation | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#F7FAFC] overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
           <div className="max-w-[1000px] mx-auto">
              <div className="flex items-center justify-between mb-4">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/accounting/entity/${entityId}/banking`)}
                    className="text-gray-500 hover:text-gray-900 -ml-2"
                 >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Banking
                 </Button>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Reconcile Account</h1>
              <p className="text-sm text-gray-500 mt-1">Match your books to your bank statement.</p>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
           <div className="max-w-[800px] mx-auto">
              <Card>
                 <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                       <Label>Account to Reconcile</Label>
                       <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                          <SelectTrigger>
                             <SelectValue placeholder="Select Account" />
                          </SelectTrigger>
                          <SelectContent>
                             {accounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>{acc.account_name} (Current: ${Number(acc.current_balance).toFixed(2)})</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label>Statement Ending Date</Label>
                          <Input type="date" value={statementDate} onChange={(e) => setStatementDate(e.target.value)} />
                       </div>
                       <div className="space-y-2">
                          <Label>Statement Ending Balance</Label>
                          <div className="relative">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                             <Input 
                                type="number" 
                                className="pl-8" 
                                placeholder="0.00" 
                                value={statementBalance} 
                                onChange={(e) => setStatementBalance(e.target.value)} 
                             />
                          </div>
                       </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 items-start">
                       <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                       <div className="text-sm text-blue-800">
                          <p className="font-medium">Before you start:</p>
                          <p className="mt-1">Ensure all transactions up to the statement date have been entered into the system. You can save your work and finish later.</p>
                       </div>
                    </div>

                    <div className="flex justify-end pt-4">
                       <Button onClick={handleStartReconciliation} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                          Start Reconciling
                       </Button>
                    </div>
                 </CardContent>
              </Card>

              <div className="mt-8">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">History</h3>
                 <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-gray-500">
                    No previous reconciliations found.
                 </div>
              </div>
           </div>
        </div>
      </div>
    </>
  );
};

export default ReconciliationPage;