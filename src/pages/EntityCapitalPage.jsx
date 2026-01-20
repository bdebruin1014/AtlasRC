import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, Wallet, TrendingUp, TrendingDown, 
  Plus, ArrowRightLeft
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

import MembersList from '@/components/accounting/MembersList';
import MemberForm from '@/components/accounting/MemberForm';
import ContributionsList from '@/components/accounting/ContributionsList';
import ContributionForm from '@/components/accounting/ContributionForm';
import DistributionsList from '@/components/accounting/DistributionsList';
import DistributionForm from '@/components/accounting/DistributionForm';
import InterEntityTransfersList from '@/components/accounting/InterEntityTransfersList';
import InterEntityTransferForm from '@/components/accounting/InterEntityTransferForm';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const EntityCapitalPage = () => {
  const { entityId, subtab } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(subtab || 'members');

  const [summary, setSummary] = useState({
    activeMembers: 0,
    totalCapital: 0,
    ytdContributions: 0,
    ytdDistributions: 0
  });

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showContribForm, setShowContribForm] = useState(false);
  const [showDistForm, setShowDistForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

  useEffect(() => {
    if (subtab && subtab !== activeTab) {
      setActiveTab(subtab);
    }
  }, [subtab]);

  const handleTabChange = (val) => {
    setActiveTab(val);
    navigate(`/accounting/entity/${entityId}/capital/${val}`);
  };

  useEffect(() => {
    const fetchSummary = async () => {
      const { data: members } = await supabase.from('members').select('capital_account_balance').eq('entity_id', entityId).eq('status', 'Active');
      const activeMembers = members?.length || 0;
      const totalCapital = members?.reduce((sum, m) => sum + (Number(m.capital_account_balance) || 0), 0) || 0;

      const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();

      const { data: contribs } = await supabase.from('capital_contributions')
         .select('amount')
         .eq('entity_id', entityId)
         .gte('contribution_date', startOfYear)
         .neq('status', 'Void');
      const ytdContributions = contribs?.reduce((sum, c) => sum + (Number(c.amount) || 0), 0) || 0;

      const { data: dists } = await supabase.from('distributions')
         .select('amount, total_amount')
         .eq('entity_id', entityId)
         .gte('distribution_date', startOfYear)
         .neq('status', 'Void');
      const ytdDistributions = dists?.reduce((sum, d) => sum + (Number(d.amount) || Number(d.total_amount) || 0), 0) || 0;

      setSummary({ activeMembers, totalCapital, ytdContributions, ytdDistributions });
    };

    if (entityId) fetchSummary();
  }, [entityId]);

  return (
    <div className="flex flex-col h-full overflow-hidden pt-4">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0 px-1">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-4 h-4" /></div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Active Members</p>
             </div>
             <h3 className="text-2xl font-bold text-gray-900">{summary.activeMembers}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Wallet className="w-4 h-4" /></div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Total Capital</p>
             </div>
             <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalCapital)}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
                <p className="text-xs font-semibold text-gray-500 uppercase">YTD Contributions</p>
             </div>
             <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.ytdContributions)}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><TrendingDown className="w-4 h-4" /></div>
                <p className="text-xs font-semibold text-gray-500 uppercase">YTD Distributions</p>
             </div>
             <h3 className="text-2xl font-bold text-amber-600">{formatCurrency(summary.ytdDistributions)}</h3>
          </div>
       </div>

       <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-full overflow-hidden">
             <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0 bg-white">
                <TabsList className="bg-gray-100">
                   <TabsTrigger value="members" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Members</TabsTrigger>
                   <TabsTrigger value="contributions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Contributions</TabsTrigger>
                   <TabsTrigger value="distributions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Distributions</TabsTrigger>
                   <TabsTrigger value="inter-entity-transfers" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Inter-Entity</TabsTrigger>
                </TabsList>
                
                {activeTab === 'members' && (
                   <Button onClick={() => setShowMemberForm(true)} className="bg-[#2F855A] hover:bg-[#276749] text-white"><Plus className="w-4 h-4 mr-2"/> Add Member</Button>
                )}
                {activeTab === 'contributions' && (
                   <Button onClick={() => setShowContribForm(true)} className="bg-[#2F855A] hover:bg-[#276749] text-white"><Plus className="w-4 h-4 mr-2"/> Record Contribution</Button>
                )}
                {activeTab === 'distributions' && (
                   <Button onClick={() => setShowDistForm(true)} className="bg-[#2F855A] hover:bg-[#276749] text-white"><Plus className="w-4 h-4 mr-2"/> New Distribution</Button>
                )}
                {activeTab === 'inter-entity-transfers' && (
                   <Button onClick={() => setShowTransferForm(true)} className="bg-[#2F855A] hover:bg-[#276749] text-white"><ArrowRightLeft className="w-4 h-4 mr-2"/> New Transfer</Button>
                )}
             </div>

             <div className="flex-1 overflow-y-auto p-6 pb-24 bg-white">
                <TabsContent value="members" className="m-0 h-full animate-in fade-in-50 duration-300 data-[state=inactive]:hidden">
                   <MembersList entityId={entityId} onNewMember={() => setShowMemberForm(true)} />
                </TabsContent>

                <TabsContent value="contributions" className="m-0 h-full animate-in fade-in-50 duration-300 data-[state=inactive]:hidden">
                   <ContributionsList entityId={entityId} onNewContribution={() => setShowContribForm(true)} />
                </TabsContent>

                <TabsContent value="distributions" className="m-0 h-full animate-in fade-in-50 duration-300 data-[state=inactive]:hidden">
                   <DistributionsList entityId={entityId} onNewDistribution={() => setShowDistForm(true)} />
                </TabsContent>

                <TabsContent value="inter-entity-transfers" className="m-0 h-full animate-in fade-in-50 duration-300 data-[state=inactive]:hidden">
                   <InterEntityTransfersList entityId={entityId} onNewTransfer={() => setShowTransferForm(true)} />
                </TabsContent>
             </div>
          </Tabs>
       </div>

       <Dialog open={showMemberForm} onOpenChange={setShowMemberForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
             <MemberForm entityId={entityId} onCancel={() => setShowMemberForm(false)} onSuccess={() => setShowMemberForm(false)} />
          </DialogContent>
       </Dialog>

       <Dialog open={showContribForm} onOpenChange={setShowContribForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
             <ContributionForm entityId={entityId} onCancel={() => setShowContribForm(false)} onSuccess={() => setShowContribForm(false)} />
          </DialogContent>
       </Dialog>

       <Dialog open={showDistForm} onOpenChange={setShowDistForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
             <DistributionForm entityId={entityId} onCancel={() => setShowDistForm(false)} onSuccess={() => setShowDistForm(false)} />
          </DialogContent>
       </Dialog>

       <Dialog open={showTransferForm} onOpenChange={setShowTransferForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
             <InterEntityTransferForm defaultFromEntityId={entityId} onCancel={() => setShowTransferForm(false)} onSuccess={() => setShowTransferForm(false)} />
          </DialogContent>
       </Dialog>
    </div>
  );
};

export default EntityCapitalPage;