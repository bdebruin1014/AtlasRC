import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  DollarSign, Users, TrendingUp, Calendar, Building2, 
  ArrowUpRight, ArrowDownRight, PieChart, BarChart3, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const InvestmentDashboardPage = () => {
  const { dealId } = useParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [deal, setDeal] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, [dealId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // For now, use mock data - replace with actual API call
      // const data = await getInvestmentDashboard(dealId);
      
      // Mock data fallback
      setDeal({
        id: dealId,
        name: 'Highland Park Lofts',
        stage: 'raising_capital',
        targetAmount: 2500000,
        totalRaised: 1875000,
        totalDistributions: 0,
        investorCount: 12,
        preferredReturn: 8,
        targetIRR: 18,
        closeDate: '2025-03-15',
      });

      setRecentActivity([
        { id: 1, type: 'investment', description: 'John Smith funded $100,000', date: '2 hours ago' },
        { id: 2, type: 'document', description: 'Subscription Agreement signed by Jane Doe', date: '1 day ago' },
        { id: 3, type: 'investment', description: 'Acme LLC committed $250,000', date: '2 days ago' },
        { id: 4, type: 'update', description: 'Deal terms updated', date: '3 days ago' },
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const percentFunded = deal ? Math.round((deal.totalRaised / deal.targetAmount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Deal not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of {deal.name}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Raised</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(deal.totalRaised)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+$100K</span>
            <span className="text-gray-500 ml-1">this week</span>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Investors</p>
              <p className="text-2xl font-bold">{deal.investorCount}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+2</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Distributions</p>
              <p className="text-2xl font-bold">{formatCurrency(deal.totalDistributions)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Next distribution: Q1 2025
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Days to Close</p>
              <p className="text-2xl font-bold">76</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Close: {deal.closeDate}
          </div>
        </div>
      </div>

      {/* Progress & Charts */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Funding Progress */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Funding Progress</h3>
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{percentFunded}% Funded</span>
              <span className="text-sm text-gray-500">{formatCurrency(deal.targetAmount)} target</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-[#047857] h-4 rounded-full transition-all"
                style={{ width: `${percentFunded}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{formatCurrency(deal.totalRaised)} raised</span>
              <span>{formatCurrency(deal.targetAmount - deal.totalRaised)} remaining</span>
            </div>
          </div>
        </div>

        {/* Investment Terms */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Investment Terms</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Preferred Return</span>
              <span className="font-semibold">{deal.preferredReturn}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Target IRR</span>
              <span className="font-semibold">{deal.targetIRR}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">LP/GP Split</span>
              <span className="font-semibold">70/30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Min Investment</span>
              <span className="font-semibold">$50,000</span>
            </div>
          </div>
        </div>

        {/* Investor Breakdown */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Investor Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm">Funded</span>
              </div>
              <span className="font-semibold">8</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm">Signed</span>
              </div>
              <span className="font-semibold">2</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="text-sm">Pending</span>
              </div>
              <span className="font-semibold">2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map(activity => (
            <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                activity.type === 'investment' ? 'bg-green-100' : 
                activity.type === 'document' ? 'bg-blue-100' : 'bg-gray-100'
              )}>
                {activity.type === 'investment' && <DollarSign className="w-4 h-4 text-green-600" />}
                {activity.type === 'document' && <Building2 className="w-4 h-4 text-blue-600" />}
                {activity.type === 'update' && <BarChart3 className="w-4 h-4 text-gray-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestmentDashboardPage;
