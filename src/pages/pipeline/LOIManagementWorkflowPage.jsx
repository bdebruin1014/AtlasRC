import React, { useState, useMemo } from 'react';
import {
  FileText, CheckCircle, XCircle, Clock, AlertTriangle, Send,
  DollarSign, Calendar, Edit, Eye, Download, RefreshCw, Building,
  MapPin, User, MessageSquare, History, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockLOIs = [
  {
    id: 'LOI-2024-0045',
    property: 'Metro Industrial Complex',
    address: '2200 Commerce Way, Dallas, TX',
    seller: 'Industrial Holdings Inc.',
    sellerContact: 'Robert Martinez',
    status: 'executed',
    version: 3,
    purchasePrice: 30500000,
    earnestMoney: 500000,
    dueDiligencePeriod: 45,
    closingPeriod: 30,
    createdDate: '2024-01-15',
    sentDate: '2024-01-16',
    executedDate: '2024-01-18',
    expirationDate: '2024-01-25',
    assignedTo: 'Sarah Johnson',
    keyTerms: {
      financing: 'Subject to financing contingency',
      inspection: '45-day inspection period',
      title: 'Marketable title required',
      survey: 'New ALTA survey required',
      environmentalPhase1: 'Clean Phase I required'
    },
    history: [
      { version: 1, date: '2024-01-15', action: 'Created', user: 'John Smith', notes: 'Initial draft' },
      { version: 1, date: '2024-01-16', action: 'Sent', user: 'Sarah Johnson', notes: 'Sent to seller' },
      { version: 2, date: '2024-01-17', action: 'Counter Received', user: 'Seller', notes: 'Seller requested higher price' },
      { version: 3, date: '2024-01-17', action: 'Counter Sent', user: 'Sarah Johnson', notes: 'Revised price to $30.5M' },
      { version: 3, date: '2024-01-18', action: 'Executed', user: 'Both Parties', notes: 'LOI fully executed' }
    ]
  },
  {
    id: 'LOI-2024-0044',
    property: 'Lakeside Business Park',
    address: '500 Lakeside Dr, Austin, TX',
    seller: 'Lakeside Development LLC',
    sellerContact: 'Jennifer Adams',
    status: 'pending_seller',
    version: 2,
    purchasePrice: 17250000,
    earnestMoney: 250000,
    dueDiligencePeriod: 60,
    closingPeriod: 45,
    createdDate: '2024-01-20',
    sentDate: '2024-01-21',
    executedDate: null,
    expirationDate: '2024-01-28',
    assignedTo: 'John Smith',
    keyTerms: {
      financing: 'Subject to financing contingency',
      inspection: '60-day inspection period',
      title: 'Marketable title required',
      survey: 'Existing survey acceptable',
      environmentalPhase1: 'Clean Phase I required'
    },
    history: [
      { version: 1, date: '2024-01-20', action: 'Created', user: 'John Smith', notes: 'Initial draft' },
      { version: 1, date: '2024-01-20', action: 'Sent', user: 'John Smith', notes: 'Sent to seller' },
      { version: 2, date: '2024-01-21', action: 'Counter Received', user: 'Seller', notes: 'Seller wants shorter DD period' },
      { version: 2, date: '2024-01-21', action: 'Counter Sent', user: 'John Smith', notes: 'Revised DD to 60 days' }
    ]
  },
  {
    id: 'LOI-2024-0043',
    property: 'Sunset Retail Center',
    address: '1800 Sunset Blvd, Phoenix, AZ',
    seller: 'Retail Properties Group',
    sellerContact: 'Mark Thompson',
    status: 'expired',
    version: 1,
    purchasePrice: 11000000,
    earnestMoney: 150000,
    dueDiligencePeriod: 30,
    closingPeriod: 30,
    createdDate: '2024-01-05',
    sentDate: '2024-01-06',
    executedDate: null,
    expirationDate: '2024-01-15',
    assignedTo: 'Tom Davis',
    keyTerms: {},
    history: [
      { version: 1, date: '2024-01-05', action: 'Created', user: 'Tom Davis', notes: 'Initial draft' },
      { version: 1, date: '2024-01-06', action: 'Sent', user: 'Tom Davis', notes: 'Sent to seller' },
      { version: 1, date: '2024-01-15', action: 'Expired', user: 'System', notes: 'No response from seller' }
    ]
  },
  {
    id: 'LOI-2024-0042',
    property: 'Harbor View Apartments',
    address: '850 Harbor Way, San Diego, CA',
    seller: 'Pacific Coast Realty',
    sellerContact: 'David Chen',
    status: 'draft',
    version: 1,
    purchasePrice: 42500000,
    earnestMoney: 750000,
    dueDiligencePeriod: 45,
    closingPeriod: 45,
    createdDate: '2024-01-22',
    sentDate: null,
    executedDate: null,
    expirationDate: null,
    assignedTo: 'John Smith',
    keyTerms: {},
    history: [
      { version: 1, date: '2024-01-22', action: 'Created', user: 'John Smith', notes: 'Initial draft - pending review' }
    ]
  }
];

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  pending_seller: { label: 'Awaiting Seller', color: 'bg-blue-100 text-blue-800', icon: Send },
  counter_received: { label: 'Counter Received', color: 'bg-orange-100 text-orange-800', icon: RefreshCw },
  executed: { label: 'Executed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800', icon: XCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function LOIManagementWorkflowPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLOI, setSelectedLOI] = useState(mockLOIs[0]);
  const [view, setView] = useState('details');

  const filteredLOIs = useMemo(() => {
    return mockLOIs.filter(loi => {
      const matchesFilter = filter === 'all' || loi.status === filter ||
        (filter === 'active' && ['draft', 'pending_review', 'pending_seller', 'counter_received'].includes(loi.status));
      const matchesSearch = loi.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loi.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const stats = useMemo(() => ({
    active: mockLOIs.filter(l => ['draft', 'pending_review', 'pending_seller', 'counter_received'].includes(l.status)).length,
    executed: mockLOIs.filter(l => l.status === 'executed').length,
    pendingValue: mockLOIs.filter(l => l.status === 'pending_seller').reduce((sum, l) => sum + l.purchasePrice, 0),
    expiringSoon: mockLOIs.filter(l => {
      if (!l.expirationDate || l.status === 'executed' || l.status === 'expired') return false;
      const exp = new Date(l.expirationDate);
      const today = new Date();
      const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      return diff <= 7 && diff > 0;
    }).length
  }), []);

  const getDaysUntilExpiration = (date) => {
    if (!date) return null;
    const exp = new Date(date);
    const today = new Date();
    return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LOI Management</h1>
          <p className="text-gray-600">Create, track, and manage Letters of Intent</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />Create LOI
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-600">Active LOIs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.executed}</p>
              <p className="text-sm text-gray-600">Executed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.pendingValue / 1000000).toFixed(0)}M</p>
              <p className="text-sm text-gray-600">Pending Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</p>
              <p className="text-sm text-gray-600">Expiring Soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search LOIs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'executed', 'expired'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredLOIs.map((loi) => {
            const daysLeft = getDaysUntilExpiration(loi.expirationDate);
            return (
              <div
                key={loi.id}
                onClick={() => setSelectedLOI(loi)}
                className={cn(
                  "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                  selectedLOI?.id === loi.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{loi.property}</p>
                    <p className="text-sm text-gray-500">{loi.id} • v{loi.version}</p>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[loi.status].color)}>{statusConfig[loi.status].label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">${(loi.purchasePrice / 1000000).toFixed(1)}M</span>
                  {daysLeft !== null && daysLeft > 0 && loi.status !== 'executed' && (
                    <span className={cn("text-xs", daysLeft <= 3 ? "text-red-600" : daysLeft <= 7 ? "text-orange-600" : "text-gray-500")}>
                      {daysLeft}d left
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="col-span-2">
          {selectedLOI && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedLOI.property}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedLOI.status].color)}>{statusConfig[selectedLOI.status].label}</span>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">v{selectedLOI.version}</span>
                    </div>
                    <p className="text-gray-600 flex items-center gap-1"><MapPin className="w-4 h-4" />{selectedLOI.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
                    <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" />Edit</Button>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Button variant={view === 'details' ? 'default' : 'outline'} size="sm" onClick={() => setView('details')}>Details</Button>
                  <Button variant={view === 'history' ? 'default' : 'outline'} size="sm" onClick={() => setView('history')}>History</Button>
                </div>

                {view === 'details' && (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Deal Terms</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-500">Purchase Price</span><span className="font-medium">${selectedLOI.purchasePrice.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Earnest Money</span><span className="font-medium">${selectedLOI.earnestMoney.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">DD Period</span><span className="font-medium">{selectedLOI.dueDiligencePeriod} days</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Closing Period</span><span className="font-medium">{selectedLOI.closingPeriod} days</span></div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Parties</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-500">Seller</span><span className="font-medium">{selectedLOI.seller}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Contact</span><span className="font-medium">{selectedLOI.sellerContact}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Assigned To</span><span className="font-medium">{selectedLOI.assignedTo}</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Key Dates</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Created</p>
                          <p className="font-medium">{selectedLOI.createdDate}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Sent</p>
                          <p className="font-medium">{selectedLOI.sentDate || '-'}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Executed</p>
                          <p className="font-medium">{selectedLOI.executedDate || '-'}</p>
                        </div>
                        <div className={cn("text-center p-3 rounded-lg", selectedLOI.status === 'expired' ? "bg-red-50" : "bg-gray-50")}>
                          <p className="text-xs text-gray-500">Expiration</p>
                          <p className="font-medium">{selectedLOI.expirationDate || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {view === 'history' && (
                  <div className="space-y-3">
                    {selectedLOI.history.map((entry, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-white rounded-full">
                          <History className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{entry.action}</p>
                            <span className="text-xs text-gray-500">{entry.date}</span>
                          </div>
                          <p className="text-sm text-gray-600">By: {entry.user}</p>
                          {entry.notes && <p className="text-sm text-gray-500 mt-1">{entry.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedLOI.status === 'draft' && (
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button variant="outline">Save Draft</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700"><Send className="w-4 h-4 mr-2" />Send to Seller</Button>
                </div>
              )}

              {selectedLOI.status === 'pending_seller' && (
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button variant="outline">Withdraw LOI</Button>
                  <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Send Reminder</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
