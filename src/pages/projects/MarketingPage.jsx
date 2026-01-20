import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, Mail, Phone, Calendar, User, MapPin, DollarSign, TrendingUp, Globe, Image, FileText, Download, ExternalLink, BarChart3, Users, Home, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const MarketingPage = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('leads'); // 'leads', 'campaigns', 'listings', 'analytics'
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [leads, setLeads] = useState([
    {
      id: 'LEAD-001',
      name: 'Jennifer Martinez',
      email: 'jmartinez@email.com',
      phone: '(555) 234-5678',
      source: 'Zillow',
      interestedIn: 'Unit 3 - Type B',
      priceRange: '$650K - $700K',
      status: 'hot',
      stage: 'showing-scheduled',
      createdDate: '2024-12-15',
      lastContact: '2024-12-27',
      notes: 'Very interested, pre-approved for $700K. Showing scheduled for 12/29.',
      assignedTo: 'Sarah Agent',
      preApproved: true,
      timeline: '30 days',
    },
    {
      id: 'LEAD-002',
      name: 'Michael & Lisa Chen',
      email: 'mchen@email.com',
      phone: '(555) 345-6789',
      source: 'Realtor.com',
      interestedIn: 'Type C - 4BR/3BA',
      priceRange: '$725K - $800K',
      status: 'hot',
      stage: 'offer-pending',
      createdDate: '2024-12-10',
      lastContact: '2024-12-26',
      notes: 'Submitted offer on Unit 7. Waiting for response.',
      assignedTo: 'Sarah Agent',
      preApproved: true,
      timeline: '45 days',
    },
    {
      id: 'LEAD-003',
      name: 'Robert Thompson',
      email: 'rthompson@email.com',
      phone: '(555) 456-7890',
      source: 'Website',
      interestedIn: 'Any 3BR unit',
      priceRange: '$550K - $600K',
      status: 'warm',
      stage: 'follow-up',
      createdDate: '2024-12-18',
      lastContact: '2024-12-22',
      notes: 'Interested but needs to sell current home first.',
      assignedTo: 'John Realtor',
      preApproved: false,
      timeline: '90 days',
    },
    {
      id: 'LEAD-004',
      name: 'Amanda Foster',
      email: 'afoster@email.com',
      phone: '(555) 567-8901',
      source: 'Facebook Ad',
      interestedIn: 'Unit 1 - Type A',
      priceRange: '$575K - $625K',
      status: 'warm',
      stage: 'showing-complete',
      createdDate: '2024-12-12',
      lastContact: '2024-12-24',
      notes: 'Loved the layout, comparing with 2 other properties.',
      assignedTo: 'Sarah Agent',
      preApproved: true,
      timeline: '60 days',
    },
    {
      id: 'LEAD-005',
      name: 'David Wilson',
      email: 'dwilson@email.com',
      phone: '(555) 678-9012',
      source: 'Referral',
      interestedIn: 'Type B units',
      priceRange: '$650K - $700K',
      status: 'cold',
      stage: 'new',
      createdDate: '2024-12-26',
      lastContact: '2024-12-26',
      notes: 'Referred by previous buyer. Initial inquiry only.',
      assignedTo: 'John Realtor',
      preApproved: false,
      timeline: 'Unknown',
    },
    {
      id: 'LEAD-006',
      name: 'Karen & Steve Miller',
      email: 'kmiller@email.com',
      phone: '(555) 789-0123',
      source: 'Open House',
      interestedIn: 'Unit 5 or 6',
      priceRange: '$700K - $750K',
      status: 'warm',
      stage: 'follow-up',
      createdDate: '2024-12-20',
      lastContact: '2024-12-23',
      notes: 'Attended open house, requested floor plans.',
      assignedTo: 'Sarah Agent',
      preApproved: true,
      timeline: '45 days',
    },
  ]);

  const campaigns = [
    { id: 1, name: 'Grand Opening Launch', platform: 'Facebook/Instagram', budget: 5000, spent: 4250, leads: 28, startDate: '2024-11-01', endDate: '2024-12-15', status: 'completed', cpl: 151.79 },
    { id: 2, name: 'Holiday Special', platform: 'Google Ads', budget: 3000, spent: 2100, leads: 15, startDate: '2024-12-01', endDate: '2024-12-31', status: 'active', cpl: 140.00 },
    { id: 3, name: 'New Year New Home', platform: 'Facebook/Instagram', budget: 4000, spent: 800, leads: 5, startDate: '2024-12-20', endDate: '2025-01-15', status: 'active', cpl: 160.00 },
    { id: 4, name: 'Zillow Premium', platform: 'Zillow', budget: 2500, spent: 2500, leads: 12, startDate: '2024-10-15', endDate: '2024-12-15', status: 'completed', cpl: 208.33 },
  ];

  const listings = [
    { id: 1, platform: 'Zillow', url: 'https://zillow.com/listing/123', status: 'active', views: 2450, saves: 89, inquiries: 24, lastUpdated: '2024-12-20' },
    { id: 2, platform: 'Realtor.com', url: 'https://realtor.com/listing/456', status: 'active', views: 1820, saves: 67, inquiries: 18, lastUpdated: '2024-12-20' },
    { id: 3, platform: 'MLS', url: '#', status: 'active', views: 890, saves: 34, inquiries: 12, lastUpdated: '2024-12-18' },
    { id: 4, platform: 'Redfin', url: 'https://redfin.com/listing/789', status: 'active', views: 1240, saves: 45, inquiries: 15, lastUpdated: '2024-12-19' },
    { id: 5, platform: 'Project Website', url: 'https://oakridgeestates.com', status: 'active', views: 3200, saves: 0, inquiries: 32, lastUpdated: '2024-12-22' },
  ];

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    interestedIn: '',
    priceRange: '',
    notes: '',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'hot': return 'bg-red-100 text-red-700';
      case 'warm': return 'bg-amber-100 text-amber-700';
      case 'cold': return 'bg-blue-100 text-blue-700';
      case 'converted': return 'bg-green-100 text-green-700';
      case 'lost': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'new': return 'bg-purple-100 text-purple-700';
      case 'follow-up': return 'bg-blue-100 text-blue-700';
      case 'showing-scheduled': return 'bg-amber-100 text-amber-700';
      case 'showing-complete': return 'bg-cyan-100 text-cyan-700';
      case 'offer-pending': return 'bg-orange-100 text-orange-700';
      case 'under-contract': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filterStatus === 'all') return true;
    return lead.status === filterStatus;
  });

  const hotLeads = leads.filter(l => l.status === 'hot').length;
  const warmLeads = leads.filter(l => l.status === 'warm').length;
  const totalInquiries = listings.reduce((sum, l) => sum + l.inquiries, 0);
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);

  const handleSaveLead = () => {
    const lead = {
      id: `LEAD-${String(leads.length + 1).padStart(3, '0')}`,
      ...newLead,
      status: 'cold',
      stage: 'new',
      createdDate: new Date().toISOString().split('T')[0],
      lastContact: new Date().toISOString().split('T')[0],
      assignedTo: 'Unassigned',
      preApproved: false,
      timeline: 'Unknown',
    };
    setLeads(prev => [lead, ...prev]);
    setShowLeadModal(false);
    setNewLead({ name: '', email: '', phone: '', source: '', interestedIn: '', priceRange: '', notes: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Marketing & Leads</h1>
          <p className="text-sm text-gray-500">Lead management and marketing campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowLeadModal(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Lead
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Leads</p>
          <p className="text-2xl font-semibold">{leads.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">Hot Leads</p>
          <p className="text-2xl font-semibold text-red-600">{hotLeads}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500">Warm Leads</p>
          <p className="text-2xl font-semibold text-amber-600">{warmLeads}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Inquiries</p>
          <p className="text-2xl font-semibold">{totalInquiries}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Listing Views</p>
          <p className="text-2xl font-semibold">{totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Avg CPL</p>
          <p className="text-2xl font-semibold">$156</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('leads')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'leads' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Leads ({leads.length})
        </button>
        <button onClick={() => setActiveTab('campaigns')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'campaigns' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Campaigns
        </button>
        <button onClick={() => setActiveTab('listings')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'listings' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Listings
        </button>
        <button onClick={() => setActiveTab('analytics')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'analytics' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Analytics
        </button>
      </div>

      {/* Leads Tab */}
      {activeTab === 'leads' && (
        <>
          {/* Filters */}
          <div className="bg-white border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search leads..." className="pl-9" />
              </div>
              <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
              <select className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Sources</option>
                <option>Zillow</option>
                <option>Realtor.com</option>
                <option>Website</option>
                <option>Facebook Ad</option>
                <option>Referral</option>
                <option>Open House</option>
              </select>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Lead</th>
                  <th className="text-left px-4 py-3 font-medium">Contact</th>
                  <th className="text-left px-4 py-3 font-medium">Interest</th>
                  <th className="text-left px-4 py-3 font-medium">Source</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Stage</th>
                  <th className="text-left px-4 py-3 font-medium">Last Contact</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-xs text-gray-500">{lead.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</p>
                        <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{lead.interestedIn}</p>
                      <p className="text-xs text-gray-500">{lead.priceRange}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{lead.source}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(lead.status))}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs capitalize", getStageColor(lead.stage))}>
                        {lead.stage.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{lead.lastContact}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setSelectedLead(lead)}><Eye className="w-4 h-4 text-gray-500" /></button>
                        <button className="p-1 hover:bg-gray-100 rounded"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Campaign</th>
                <th className="text-left px-4 py-3 font-medium">Platform</th>
                <th className="text-left px-4 py-3 font-medium">Duration</th>
                <th className="text-right px-4 py-3 font-medium">Budget</th>
                <th className="text-right px-4 py-3 font-medium">Spent</th>
                <th className="text-right px-4 py-3 font-medium">Leads</th>
                <th className="text-right px-4 py-3 font-medium">CPL</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{campaign.name}</td>
                  <td className="px-4 py-3">{campaign.platform}</td>
                  <td className="px-4 py-3 text-xs">{campaign.startDate} - {campaign.endDate}</td>
                  <td className="px-4 py-3 text-right">${campaign.budget.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${campaign.spent.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium">{campaign.leads}</td>
                  <td className="px-4 py-3 text-right">${campaign.cpl.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded text-xs capitalize", campaign.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                      {campaign.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t font-semibold">
              <tr>
                <td className="px-4 py-3">Totals</td>
                <td></td>
                <td></td>
                <td className="px-4 py-3 text-right">${campaigns.reduce((s, c) => s + c.budget, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">${campaigns.reduce((s, c) => s + c.spent, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{campaigns.reduce((s, c) => s + c.leads, 0)}</td>
                <td className="px-4 py-3 text-right">${(campaigns.reduce((s, c) => s + c.spent, 0) / campaigns.reduce((s, c) => s + c.leads, 0)).toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Platform</th>
                <th className="text-right px-4 py-3 font-medium">Views</th>
                <th className="text-right px-4 py-3 font-medium">Saves</th>
                <th className="text-right px-4 py-3 font-medium">Inquiries</th>
                <th className="text-right px-4 py-3 font-medium">Conversion</th>
                <th className="text-left px-4 py-3 font-medium">Last Updated</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{listing.platform}</td>
                  <td className="px-4 py-3 text-right">{listing.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{listing.saves}</td>
                  <td className="px-4 py-3 text-right font-medium">{listing.inquiries}</td>
                  <td className="px-4 py-3 text-right">{((listing.inquiries / listing.views) * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-xs">{listing.lastUpdated}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 capitalize">{listing.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={listing.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-gray-100 rounded inline-flex">
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Lead Sources</h3>
            <div className="space-y-3">
              {[
                { source: 'Zillow', count: 12, pct: 30 },
                { source: 'Realtor.com', count: 8, pct: 20 },
                { source: 'Website', count: 10, pct: 25 },
                { source: 'Facebook', count: 6, pct: 15 },
                { source: 'Referral', count: 4, pct: 10 },
              ].map((s, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.source}</span>
                    <span className="font-medium">{s.count} leads ({s.pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#047857] rounded-full" style={{ width: `${s.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Lead Pipeline</h3>
            <div className="space-y-3">
              {[
                { stage: 'New', count: 2, color: 'bg-purple-500' },
                { stage: 'Follow-up', count: 4, color: 'bg-blue-500' },
                { stage: 'Showing Scheduled', count: 3, color: 'bg-amber-500' },
                { stage: 'Showing Complete', count: 2, color: 'bg-cyan-500' },
                { stage: 'Offer Pending', count: 2, color: 'bg-orange-500' },
                { stage: 'Under Contract', count: 1, color: 'bg-green-500' },
              ].map((s, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", s.color)}></div>
                  <span className="flex-1 text-sm">{s.stage}</span>
                  <span className="font-semibold">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Add New Lead</h3>
              <button onClick={() => setShowLeadModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Name *</label>
                <Input value={newLead.name} onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Email *</label>
                  <Input type="email" value={newLead.email} onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Phone *</label>
                  <Input value={newLead.phone} onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))} placeholder="(555) 123-4567" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Source</label>
                <select className="w-full border rounded-md px-3 py-2" value={newLead.source} onChange={(e) => setNewLead(prev => ({ ...prev, source: e.target.value }))}>
                  <option value="">Select source...</option>
                  <option>Zillow</option>
                  <option>Realtor.com</option>
                  <option>Website</option>
                  <option>Facebook Ad</option>
                  <option>Google Ad</option>
                  <option>Referral</option>
                  <option>Open House</option>
                  <option>Walk-in</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Interested In</label>
                <Input value={newLead.interestedIn} onChange={(e) => setNewLead(prev => ({ ...prev, interestedIn: e.target.value }))} placeholder="Unit type or specific unit" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Price Range</label>
                <Input value={newLead.priceRange} onChange={(e) => setNewLead(prev => ({ ...prev, priceRange: e.target.value }))} placeholder="$500K - $600K" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={newLead.notes} onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowLeadModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSaveLead}>Add Lead</Button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">{selectedLead.name}</h3>
              <button onClick={() => setSelectedLead(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(selectedLead.status))}>{selectedLead.status}</span>
                <span className={cn("px-2 py-1 rounded text-xs capitalize", getStageColor(selectedLead.stage))}>{selectedLead.stage.replace(/-/g, ' ')}</span>
                {selectedLead.preApproved && <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Pre-Approved</span>}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Email</p><p>{selectedLead.email}</p></div>
                <div><p className="text-gray-500">Phone</p><p>{selectedLead.phone}</p></div>
                <div><p className="text-gray-500">Source</p><p>{selectedLead.source}</p></div>
                <div><p className="text-gray-500">Interested In</p><p>{selectedLead.interestedIn}</p></div>
                <div><p className="text-gray-500">Price Range</p><p>{selectedLead.priceRange}</p></div>
                <div><p className="text-gray-500">Timeline</p><p>{selectedLead.timeline}</p></div>
                <div><p className="text-gray-500">Created</p><p>{selectedLead.createdDate}</p></div>
                <div><p className="text-gray-500">Last Contact</p><p>{selectedLead.lastContact}</p></div>
              </div>
              {selectedLead.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedLead.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setSelectedLead(null)}>Close</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Edit Lead</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingPage;
