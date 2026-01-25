import React, { useState, useMemo } from 'react';
import {
  Building, CheckCircle, XCircle, Clock, AlertTriangle, User,
  DollarSign, Calendar, Filter, Search, Eye, ThumbsUp, ThumbsDown,
  MessageSquare, FileText, TrendingUp, MapPin, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockDeals = [
  {
    id: 'DEAL-2024-0089',
    property: 'Lakeside Business Park',
    address: '500 Lakeside Dr, Austin, TX',
    type: 'Office',
    askingPrice: 18500000,
    proposedPrice: 17250000,
    capRate: 7.2,
    sqft: 125000,
    submittedDate: '2024-01-18',
    submittedBy: 'John Smith',
    status: 'pending_ic',
    currentStage: 'Investment Committee',
    priority: 'high',
    investmentThesis: 'Value-add opportunity in growing Austin submarket with below-market rents and deferred maintenance. 18-month repositioning plan with projected 25% IRR.',
    keyMetrics: {
      noi: 1242000,
      occupancy: 78,
      projectedIrr: 25,
      holdPeriod: 5
    },
    approvalChain: [
      { name: 'John Smith', role: 'Acquisitions Analyst', action: 'submitted', date: '2024-01-18', comment: 'Initial underwriting complete, strong fundamentals' },
      { name: 'Sarah Johnson', role: 'Acquisitions Director', action: 'approved', date: '2024-01-19', comment: 'Agree with thesis, proceed to IC' },
      { name: 'Investment Committee', role: 'IC', action: 'pending', date: null, comment: null },
      { name: 'Mike Chen', role: 'CEO', action: 'pending', date: null, comment: null }
    ],
    documents: ['Investment Memo.pdf', 'Financial Model.xlsx', 'Market Analysis.pdf', 'Property Photos.zip']
  },
  {
    id: 'DEAL-2024-0088',
    property: 'Metro Industrial Complex',
    address: '2200 Commerce Way, Dallas, TX',
    type: 'Industrial',
    askingPrice: 32000000,
    proposedPrice: 30500000,
    capRate: 6.5,
    sqft: 285000,
    submittedDate: '2024-01-15',
    submittedBy: 'Lisa Wang',
    status: 'approved',
    currentStage: 'LOI Sent',
    priority: 'high',
    investmentThesis: 'Core-plus industrial acquisition in prime logistics corridor with Amazon distribution center as anchor tenant.',
    keyMetrics: {
      noi: 1982500,
      occupancy: 95,
      projectedIrr: 18,
      holdPeriod: 7
    },
    approvalChain: [
      { name: 'Lisa Wang', role: 'Acquisitions Analyst', action: 'submitted', date: '2024-01-15', comment: null },
      { name: 'Sarah Johnson', role: 'Acquisitions Director', action: 'approved', date: '2024-01-16', comment: 'Strong tenant, proceed' },
      { name: 'Investment Committee', role: 'IC', action: 'approved', date: '2024-01-17', comment: 'Unanimous approval' },
      { name: 'Mike Chen', role: 'CEO', action: 'approved', date: '2024-01-17', comment: 'Approved, send LOI' }
    ],
    documents: ['Investment Memo.pdf', 'Financial Model.xlsx']
  },
  {
    id: 'DEAL-2024-0087',
    property: 'Sunset Retail Center',
    address: '1800 Sunset Blvd, Phoenix, AZ',
    type: 'Retail',
    askingPrice: 12500000,
    proposedPrice: 11000000,
    capRate: 7.8,
    sqft: 78000,
    submittedDate: '2024-01-12',
    submittedBy: 'Tom Davis',
    status: 'rejected',
    currentStage: 'Rejected',
    priority: 'normal',
    investmentThesis: 'Grocery-anchored retail center with stable tenancy and potential pad site development.',
    keyMetrics: {
      noi: 858000,
      occupancy: 82,
      projectedIrr: 15,
      holdPeriod: 5
    },
    approvalChain: [
      { name: 'Tom Davis', role: 'Acquisitions Analyst', action: 'submitted', date: '2024-01-12', comment: null },
      { name: 'Sarah Johnson', role: 'Acquisitions Director', action: 'rejected', date: '2024-01-13', comment: 'Retail exposure too high in current portfolio. Revisit after disposition of Oak Street.' }
    ],
    documents: ['Investment Memo.pdf']
  },
  {
    id: 'DEAL-2024-0086',
    property: 'Harbor View Apartments',
    address: '850 Harbor Way, San Diego, CA',
    type: 'Multifamily',
    askingPrice: 45000000,
    proposedPrice: 42500000,
    capRate: 5.2,
    sqft: 180000,
    submittedDate: '2024-01-10',
    submittedBy: 'John Smith',
    status: 'pending_director',
    currentStage: 'Director Review',
    priority: 'high',
    investmentThesis: 'Class A multifamily in supply-constrained coastal market with strong demographic tailwinds.',
    keyMetrics: {
      noi: 2210000,
      occupancy: 96,
      projectedIrr: 16,
      holdPeriod: 10
    },
    approvalChain: [
      { name: 'John Smith', role: 'Acquisitions Analyst', action: 'submitted', date: '2024-01-10', comment: 'Premium location, limited new supply' },
      { name: 'Sarah Johnson', role: 'Acquisitions Director', action: 'pending', date: null, comment: null }
    ],
    documents: ['Investment Memo.pdf', 'Financial Model.xlsx', 'Rent Roll.xlsx']
  }
];

const statusConfig = {
  pending_director: { label: 'Director Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  pending_ic: { label: 'IC Review', color: 'bg-blue-100 text-blue-800', icon: Clock },
  pending_ceo: { label: 'CEO Review', color: 'bg-purple-100 text-purple-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
};

const typeColors = {
  Office: 'bg-blue-100 text-blue-800',
  Industrial: 'bg-orange-100 text-orange-800',
  Retail: 'bg-purple-100 text-purple-800',
  Multifamily: 'bg-green-100 text-green-800'
};

export default function DealApprovalWorkflowPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeal, setSelectedDeal] = useState(mockDeals[0]);

  const filteredDeals = useMemo(() => {
    return mockDeals.filter(deal => {
      const matchesFilter = filter === 'all' ||
        (filter === 'pending' && deal.status.startsWith('pending')) ||
        deal.status === filter;
      const matchesSearch = deal.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const stats = useMemo(() => ({
    pending: mockDeals.filter(d => d.status.startsWith('pending')).length,
    pendingValue: mockDeals.filter(d => d.status.startsWith('pending')).reduce((sum, d) => sum + d.proposedPrice, 0),
    approved: mockDeals.filter(d => d.status === 'approved').length,
    rejected: mockDeals.filter(d => d.status === 'rejected').length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Approval Workflow</h1>
          <p className="text-gray-600">Review and approve acquisition opportunities</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <FileText className="w-4 h-4 mr-2" />Submit New Deal
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><DollarSign className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.pendingValue / 1000000).toFixed(0)}M</p>
              <p className="text-sm text-gray-600">Pending Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search deals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : statusConfig[f]?.label || f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => setSelectedDeal(deal)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedDeal?.id === deal.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{deal.property}</p>
                  <p className="text-sm text-gray-500">{deal.id}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs", typeColors[deal.type])}>{deal.type}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />{deal.address.split(',')[1]?.trim()}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">${(deal.proposedPrice / 1000000).toFixed(1)}M</span>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[deal.status].color)}>{statusConfig[deal.status].label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedDeal && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedDeal.property}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedDeal.status].color)}>{statusConfig[selectedDeal.status].label}</span>
                    </div>
                    <p className="text-gray-600 flex items-center gap-1"><MapPin className="w-4 h-4" />{selectedDeal.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Proposed Price</p>
                    <p className="text-2xl font-bold text-gray-900">${(selectedDeal.proposedPrice / 1000000).toFixed(1)}M</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Cap Rate</p>
                    <p className="text-xl font-bold text-gray-900">{selectedDeal.capRate}%</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">NOI</p>
                    <p className="text-xl font-bold text-gray-900">${(selectedDeal.keyMetrics.noi / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Projected IRR</p>
                    <p className="text-xl font-bold text-green-600">{selectedDeal.keyMetrics.projectedIrr}%</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Occupancy</p>
                    <p className="text-xl font-bold text-gray-900">{selectedDeal.keyMetrics.occupancy}%</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Investment Thesis</h3>
                <p className="text-gray-600 text-sm">{selectedDeal.investmentThesis}</p>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Approval Workflow</h3>
                <div className="space-y-4">
                  {selectedDeal.approvalChain.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        step.action === 'approved' || step.action === 'submitted' ? "bg-green-100" :
                        step.action === 'rejected' ? "bg-red-100" : "bg-gray-100"
                      )}>
                        {step.action === 'approved' || step.action === 'submitted' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                         step.action === 'rejected' ? <XCircle className="w-4 h-4 text-red-600" /> :
                         <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{step.name}</p>
                            <p className="text-sm text-gray-500">{step.role}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium capitalize">{step.action}</p>
                            {step.date && <p className="text-xs text-gray-500">{step.date}</p>}
                          </div>
                        </div>
                        {step.comment && <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">{step.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Documents</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDeal.documents.map((doc, idx) => (
                    <Button key={idx} variant="outline" size="sm"><FileText className="w-4 h-4 mr-1" />{doc}</Button>
                  ))}
                </div>
              </div>

              {selectedDeal.status.startsWith('pending') && (
                <div className="p-6 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Input placeholder="Add a comment..." className="flex-1" />
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"><ThumbsDown className="w-4 h-4 mr-2" />Reject</Button>
                    <Button className="bg-green-600 hover:bg-green-700"><ThumbsUp className="w-4 h-4 mr-2" />Approve</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
