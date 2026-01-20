import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, Building2, FileText, Mail, Phone, MapPin,
  Calendar, CheckCircle, AlertCircle, Clock, ArrowUpRight, ArrowDownRight,
  MessageSquare, Send, ExternalLink, Edit2, User, Shield, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const InvestorDashboardPage = () => {
  const { investorId } = useParams();

  // Mock investor data
  const investor = {
    id: investorId,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(864) 555-0101',
    entityType: 'individual',
    entityName: null,
    investorType: 'accredited',
    accreditationStatus: 'verified',
    accreditationExpiry: '2025-06-15',
    totalInvested: 450000,
    totalDistributions: 28500,
    activeDeals: 3,
    preferredReturn: 8,
    address: {
      street: '123 Main Street',
      city: 'Greenville',
      state: 'SC',
      zip: '29601',
    },
    taxId: '***-**-1234',
    bankOnFile: true,
    w9OnFile: true,
    portalAccess: true,
    lastLogin: '2024-12-27',
    createdAt: '2023-03-15',
  };

  const investments = [
    { id: 'deal-001', name: 'Highland Park Lofts', invested: 200000, ownership: 4.2, status: 'active', irr: 18.5, distributions: 12500 },
    { id: 'deal-002', name: 'Riverside Commons', invested: 150000, ownership: 3.1, status: 'active', irr: 15.2, distributions: 9000 },
    { id: 'deal-003', name: 'Cedar Mill Phase 2', invested: 100000, ownership: 2.8, status: 'active', irr: null, distributions: 7000 },
  ];

  const recentActivity = [
    { id: 1, type: 'distribution', description: 'Q4 2024 Distribution - Highland Park', amount: 4200, date: '2024-12-20' },
    { id: 2, type: 'document', description: 'K-1 Tax Document Available', deal: 'Riverside Commons', date: '2024-12-15' },
    { id: 3, type: 'message', description: 'Investor Update - Cedar Mill Progress', date: '2024-12-10' },
    { id: 4, type: 'distribution', description: 'Q4 2024 Distribution - Riverside Commons', amount: 3000, date: '2024-12-05' },
    { id: 5, type: 'login', description: 'Portal Login', date: '2024-12-27' },
  ];

  const pendingItems = [
    { id: 1, type: 'document', description: 'Subscription Agreement - New Deal', action: 'Sign' },
    { id: 2, type: 'accreditation', description: 'Accreditation expires in 168 days', action: 'Renew' },
  ];

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getActivityIcon = (type) => ({
    distribution: { icon: DollarSign, bg: 'bg-green-100', color: 'text-green-600' },
    document: { icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600' },
    message: { icon: MessageSquare, bg: 'bg-purple-100', color: 'text-purple-600' },
    login: { icon: User, bg: 'bg-gray-100', color: 'text-gray-600' },
  }[type] || { icon: Clock, bg: 'bg-gray-100', color: 'text-gray-600' });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{investor.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{investor.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{investor.phone}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Accredited</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">Portal Active</span>
              {investor.w9OnFile && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">W-9 ✓</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Mail className="w-4 h-4 mr-2" />Send Email</Button>
          <Button variant="outline"><MessageSquare className="w-4 h-4 mr-2" />Portal Message</Button>
          <Button variant="outline"><Send className="w-4 h-4 mr-2" />Share Document</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]"><Edit2 className="w-4 h-4 mr-2" />Edit</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Invested</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(investor.totalInvested)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Distributions</p>
              <p className="text-2xl font-bold">{formatCurrency(investor.totalDistributions)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Investments</p>
              <p className="text-2xl font-bold">{investor.activeDeals}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg IRR</p>
              <p className="text-2xl font-bold">16.9%</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Active Investments */}
        <div className="col-span-2 bg-white border rounded-lg">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Active Investments</h3>
            <Link to={`/investors/${investorId}/investments`} className="text-sm text-[#047857] hover:underline">View All</Link>
          </div>
          <div className="divide-y">
            {investments.map(inv => (
              <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{inv.name}</p>
                    <p className="text-xs text-gray-500">{inv.ownership}% ownership</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(inv.invested)}</p>
                  <p className="text-xs text-green-600">+{formatCurrency(inv.distributions)} distributed</p>
                </div>
                <div className="text-right">
                  {inv.irr ? (
                    <p className="font-medium text-green-600">{inv.irr}% IRR</p>
                  ) : (
                    <p className="text-sm text-gray-400">Calculating...</p>
                  )}
                </div>
                <Link to={`/investments/${inv.id}`} className="p-2 hover:bg-gray-200 rounded">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Items */}
        <div className="space-y-6">
          {pendingItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg">
              <div className="p-4 border-b border-amber-200">
                <h3 className="font-semibold text-amber-800">Action Required</h3>
              </div>
              <div className="divide-y divide-amber-200">
                {pendingItems.map(item => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">{item.description}</p>
                        <Button size="sm" className="mt-2 bg-amber-600 hover:bg-amber-700 text-white">
                          {item.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info Card */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Contact Information</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <p>{investor.address.street}</p>
                  <p>{investor.address.city}, {investor.address.state} {investor.address.zip}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <span className="text-gray-500">Tax ID:</span> {investor.taxId}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <span className="text-gray-500">Investor since:</span> {new Date(investor.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <span className="text-gray-500">Last portal login:</span> {investor.lastLogin}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Recent Activity</h3>
        </div>
        <div className="divide-y">
          {recentActivity.map(activity => {
            const config = getActivityIcon(activity.type);
            const IconComponent = config.icon;
            return (
              <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", config.bg)}>
                    <IconComponent className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
                {activity.amount && (
                  <span className="font-medium text-green-600">+{formatCurrency(activity.amount)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboardPage;
