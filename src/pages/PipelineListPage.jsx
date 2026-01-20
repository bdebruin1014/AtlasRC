import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Search, Plus, Filter, MoreHorizontal, MapPin, 
  DollarSign, ChevronRight, Calendar, Building2,
  Target, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

// Mock opportunities data
const mockOpportunities = [
  {
    id: 1,
    name: 'Highland Park Mixed-Use',
    address: '5800 N Figueroa St, Los Angeles, CA',
    status: 'qualified',
    stage: 'Due Diligence',
    askingPrice: 4200000,
    targetOffer: 3850000,
    estRehab: 450000,
    estARV: 5100000,
    createdDate: '2023-10-24',
    dueDate: '2024-02-15',
    propertyType: 'Mixed-Use',
    source: 'Broker Referral',
  },
  {
    id: 2,
    name: 'Riverside Industrial',
    address: '2100 Commerce Way, Riverside, CA',
    status: 'new',
    stage: 'Initial Review',
    askingPrice: 2800000,
    targetOffer: 2500000,
    estRehab: 200000,
    estARV: 3200000,
    createdDate: '2024-01-10',
    dueDate: null,
    propertyType: 'Industrial',
    source: 'Direct Mail',
  },
  {
    id: 3,
    name: 'Downtown Retail Center',
    address: '450 Main Street, San Diego, CA',
    status: 'offer_submitted',
    stage: 'Negotiation',
    askingPrice: 6500000,
    targetOffer: 5900000,
    estRehab: 750000,
    estARV: 8000000,
    createdDate: '2023-12-01',
    dueDate: '2024-01-30',
    propertyType: 'Retail',
    source: 'MLS',
  },
  {
    id: 4,
    name: 'Oak Valley Apartments',
    address: '789 Oak Valley Dr, Sacramento, CA',
    status: 'under_contract',
    stage: 'Due Diligence',
    askingPrice: 3200000,
    targetOffer: 3000000,
    estRehab: 350000,
    estARV: 4200000,
    createdDate: '2023-11-15',
    dueDate: '2024-02-28',
    propertyType: 'Multifamily',
    source: 'Off-Market',
  },
  {
    id: 5,
    name: 'Sunset Strip Development',
    address: '1200 Sunset Blvd, Los Angeles, CA',
    status: 'lost',
    stage: 'Closed',
    askingPrice: 8500000,
    targetOffer: 7800000,
    estRehab: 1200000,
    estARV: 12000000,
    createdDate: '2023-09-20',
    dueDate: null,
    propertyType: 'Development',
    source: 'Broker Referral',
  },
];

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: Clock },
  qualified: { label: 'Qualified', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  offer_submitted: { label: 'Offer Submitted', color: 'bg-yellow-100 text-yellow-800', icon: Target },
  under_contract: { label: 'Under Contract', color: 'bg-purple-100 text-purple-800', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const PipelineListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredOpportunities = mockOpportunities.filter(opp => {
    const matchesSearch = 
      opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || opp.status === statusFilter;
    const matchesType = typeFilter === 'all' || opp.propertyType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpportunityClick = (opportunityId) => {
    navigate(`/pipeline/opportunity/${opportunityId}`);
  };

  const stats = {
    total: mockOpportunities.filter(o => o.status !== 'lost').length,
    qualified: mockOpportunities.filter(o => o.status === 'qualified').length,
    underContract: mockOpportunities.filter(o => o.status === 'under_contract').length,
    totalValue: mockOpportunities
      .filter(o => !['lost', 'closed'].includes(o.status))
      .reduce((sum, o) => sum + o.targetOffer, 0),
  };

  return (
    <>
      <Helmet>
        <title>Pipeline | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full bg-[#EDF2F7]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
              <p className="text-sm text-gray-500 mt-1">
                {stats.total} opportunities • {stats.qualified} qualified • {formatCurrency(stats.totalValue)} in pipeline
              </p>
            </div>
            <Button className="bg-[#2F855A] hover:bg-[#276749]">
              <Plus className="w-4 h-4 mr-2" /> Add Opportunity
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="offer_submitted">Offer Submitted</SelectItem>
                <SelectItem value="under_contract">Under Contract</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Multifamily">Multifamily</SelectItem>
                <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Opportunity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Asking Price</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Offer</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Est. ARV</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOpportunities.map((opp) => {
                  const status = statusConfig[opp.status];
                  const StatusIcon = status?.icon || Clock;
                  
                  return (
                    <tr 
                      key={opp.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleOpportunityClick(opp.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{opp.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {opp.address}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn('text-xs', status?.color)}>
                          {status?.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{opp.stage}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {formatCurrency(opp.askingPrice)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(opp.targetOffer)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {formatCurrency(opp.estARV)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(opp.createdDate)}
                      </td>
                      <td className="px-6 py-4">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredOpportunities.length === 0 && (
              <div className="p-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Opportunities Found</h3>
                <p className="text-gray-500">Try adjusting your filters or add a new opportunity.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PipelineListPage;
