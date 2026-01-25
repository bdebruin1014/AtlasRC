import React, { useState, useMemo } from 'react';
import {
  Users, User, Building, Phone, Mail, MapPin, Star, Plus,
  Search, Filter, Edit, Trash2, MessageSquare, Calendar,
  Briefcase, Globe, ChevronDown, ChevronRight, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockStakeholders = [
  {
    id: 'STK-001',
    name: 'Jennifer Adams',
    company: 'Lakeside Development LLC',
    role: 'Managing Director',
    type: 'seller',
    email: 'jadams@lakeside.com',
    phone: '(512) 555-0123',
    location: 'Austin, TX',
    linkedDeals: ['Lakeside Business Park'],
    importance: 'high',
    relationship: 'warm',
    notes: 'Decision maker for Lakeside portfolio. Has expressed interest in selling additional assets.',
    interactions: [
      { date: '2024-01-20', type: 'call', summary: 'Discussed LOI terms, counter on price', user: 'Sarah Johnson' },
      { date: '2024-01-18', type: 'meeting', summary: 'Initial property tour', user: 'John Smith' },
      { date: '2024-01-15', type: 'email', summary: 'Sent CA and initial questions', user: 'John Smith' }
    ],
    tags: ['seller', 'decision-maker', 'multi-asset']
  },
  {
    id: 'STK-002',
    name: 'Robert Martinez',
    company: 'Industrial Holdings Inc.',
    role: 'CEO',
    type: 'seller',
    email: 'rmartinez@industrial.com',
    phone: '(214) 555-0789',
    location: 'Dallas, TX',
    linkedDeals: ['Metro Industrial Complex'],
    importance: 'high',
    relationship: 'strong',
    notes: 'Long-term relationship. Previously sold us Downtown Tower. Very straightforward negotiator.',
    interactions: [
      { date: '2024-01-18', type: 'meeting', summary: 'LOI signing meeting', user: 'Sarah Johnson' },
      { date: '2024-01-16', type: 'call', summary: 'Negotiated final terms', user: 'Sarah Johnson' }
    ],
    tags: ['seller', 'repeat-relationship', 'decision-maker']
  },
  {
    id: 'STK-003',
    name: 'Mark Thompson',
    company: 'CBRE',
    role: 'Senior Vice President',
    type: 'broker',
    email: 'mthompson@cbre.com',
    phone: '(512) 555-0456',
    location: 'Austin, TX',
    linkedDeals: ['Lakeside Business Park', 'Austin Tech Campus'],
    importance: 'medium',
    relationship: 'strong',
    notes: 'Top broker in Austin market. Good source for off-market deals.',
    interactions: [
      { date: '2024-01-19', type: 'call', summary: 'Discussed market conditions and pipeline', user: 'Sarah Johnson' },
      { date: '2024-01-10', type: 'email', summary: 'Shared new listing - Austin Tech Campus', user: 'Mark Thompson' }
    ],
    tags: ['broker', 'CBRE', 'austin-market']
  },
  {
    id: 'STK-004',
    name: 'James Wilson',
    company: 'Wells Fargo Commercial',
    role: 'Senior Relationship Manager',
    type: 'lender',
    email: 'jwilson@wellsfargo.com',
    phone: '(214) 555-0456',
    location: 'Dallas, TX',
    linkedDeals: ['Metro Industrial Complex'],
    importance: 'high',
    relationship: 'strong',
    notes: 'Primary lending relationship. Competitive rates on industrial. Has appetite for $20-50M deals.',
    interactions: [
      { date: '2024-01-22', type: 'call', summary: 'Discussed loan terms for Metro Industrial', user: 'Sarah Johnson' },
      { date: '2024-01-15', type: 'meeting', summary: 'Annual relationship review', user: 'Mike Chen' }
    ],
    tags: ['lender', 'wells-fargo', 'industrial']
  },
  {
    id: 'STK-005',
    name: 'David Chen',
    company: 'Pacific Coast Realty',
    role: 'Principal',
    type: 'seller',
    email: 'dchen@pacificcoast.com',
    phone: '(619) 555-0321',
    location: 'San Diego, CA',
    linkedDeals: ['Harbor View Apartments'],
    importance: 'medium',
    relationship: 'new',
    notes: 'First interaction. Family-owned multifamily portfolio in San Diego.',
    interactions: [
      { date: '2024-01-22', type: 'email', summary: 'Introduction via JLL broker', user: 'John Smith' }
    ],
    tags: ['seller', 'multifamily', 'san-diego']
  },
  {
    id: 'STK-006',
    name: 'Amy Roberts',
    company: 'JLL',
    role: 'Managing Director',
    type: 'broker',
    email: 'aroberts@jll.com',
    phone: '(619) 555-0654',
    location: 'San Diego, CA',
    linkedDeals: ['Harbor View Apartments'],
    importance: 'medium',
    relationship: 'warm',
    notes: 'West Coast multifamily specialist. Good market intelligence.',
    interactions: [
      { date: '2024-01-21', type: 'call', summary: 'Introduced Harbor View opportunity', user: 'John Smith' }
    ],
    tags: ['broker', 'JLL', 'multifamily', 'west-coast']
  }
];

const typeConfig = {
  seller: { label: 'Seller', color: 'bg-blue-100 text-blue-800' },
  broker: { label: 'Broker', color: 'bg-purple-100 text-purple-800' },
  lender: { label: 'Lender', color: 'bg-green-100 text-green-800' },
  investor: { label: 'Investor', color: 'bg-orange-100 text-orange-800' },
  vendor: { label: 'Vendor', color: 'bg-gray-100 text-gray-800' }
};

const importanceConfig = {
  high: { label: 'High', color: 'text-red-600' },
  medium: { label: 'Medium', color: 'text-yellow-600' },
  low: { label: 'Low', color: 'text-gray-600' }
};

const relationshipConfig = {
  strong: { label: 'Strong', color: 'bg-green-100 text-green-800' },
  warm: { label: 'Warm', color: 'bg-yellow-100 text-yellow-800' },
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  cold: { label: 'Cold', color: 'bg-gray-100 text-gray-800' }
};

const interactionIcons = {
  call: Phone,
  meeting: Users,
  email: Mail
};

export default function StakeholderManagementPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStakeholder, setSelectedStakeholder] = useState(mockStakeholders[0]);
  const [expandedInteractions, setExpandedInteractions] = useState(true);

  const filteredStakeholders = useMemo(() => {
    return mockStakeholders.filter(s => {
      const matchesFilter = filter === 'all' || s.type === filter;
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.company.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const stats = useMemo(() => ({
    total: mockStakeholders.length,
    sellers: mockStakeholders.filter(s => s.type === 'seller').length,
    brokers: mockStakeholders.filter(s => s.type === 'broker').length,
    lenders: mockStakeholders.filter(s => s.type === 'lender').length,
    highImportance: mockStakeholders.filter(s => s.importance === 'high').length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stakeholder Management</h1>
          <p className="text-gray-600">Manage relationships with key deal stakeholders</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />Add Stakeholder
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Contacts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Building className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.sellers}</p>
              <p className="text-sm text-gray-600">Sellers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><Briefcase className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.brokers}</p>
              <p className="text-sm text-gray-600">Brokers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><DollarSign className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.lenders}</p>
              <p className="text-sm text-gray-600">Lenders</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><Star className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.highImportance}</p>
              <p className="text-sm text-gray-600">High Priority</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search stakeholders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'seller', 'broker', 'lender'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : typeConfig[f]?.label || f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredStakeholders.map((stakeholder) => (
            <div
              key={stakeholder.id}
              onClick={() => setSelectedStakeholder(stakeholder)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedStakeholder?.id === stakeholder.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{stakeholder.name}</p>
                  <p className="text-sm text-gray-500">{stakeholder.company}</p>
                </div>
                <Star className={cn("w-4 h-4", importanceConfig[stakeholder.importance].color)} fill={stakeholder.importance === 'high' ? 'currentColor' : 'none'} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("px-2 py-0.5 rounded text-xs", typeConfig[stakeholder.type].color)}>{typeConfig[stakeholder.type].label}</span>
                <span className={cn("px-2 py-0.5 rounded text-xs", relationshipConfig[stakeholder.relationship].color)}>{relationshipConfig[stakeholder.relationship].label}</span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{stakeholder.location}</p>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedStakeholder && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-gray-900">{selectedStakeholder.name}</h2>
                        <Star className={cn("w-4 h-4", importanceConfig[selectedStakeholder.importance].color)} fill={selectedStakeholder.importance === 'high' ? 'currentColor' : 'none'} />
                      </div>
                      <p className="text-gray-600">{selectedStakeholder.role}</p>
                      <p className="text-gray-500">{selectedStakeholder.company}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className={cn("px-2 py-1 rounded text-xs", typeConfig[selectedStakeholder.type].color)}>{typeConfig[selectedStakeholder.type].label}</span>
                  <span className={cn("px-2 py-1 rounded text-xs", relationshipConfig[selectedStakeholder.relationship].color)}>{relationshipConfig[selectedStakeholder.relationship].label}</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <a href={`mailto:${selectedStakeholder.email}`} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-blue-600">{selectedStakeholder.email}</span>
                  </a>
                  <a href={`tel:${selectedStakeholder.phone}`} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{selectedStakeholder.phone}</span>
                  </a>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{selectedStakeholder.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Linked Deals</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStakeholder.linkedDeals.map((deal, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-1">
                      <Building className="w-3 h-3" />{deal}
                    </span>
                  ))}
                </div>
              </div>

              {selectedStakeholder.notes && (
                <div className="p-6 border-b border-gray-200 bg-yellow-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-700">{selectedStakeholder.notes}</p>
                </div>
              )}

              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Interaction History</h3>
                  <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Log Interaction</Button>
                </div>
                <div className="space-y-3">
                  {selectedStakeholder.interactions.map((interaction, idx) => {
                    const Icon = interactionIcons[interaction.type] || MessageSquare;
                    return (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-white rounded-full">
                          <Icon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 capitalize">{interaction.type}</p>
                            <span className="text-xs text-gray-500">{interaction.date}</span>
                          </div>
                          <p className="text-sm text-gray-600">{interaction.summary}</p>
                          <p className="text-xs text-gray-500 mt-1">By: {interaction.user}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStakeholder.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">{tag}</span>
                  ))}
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs"><Plus className="w-3 h-3 mr-1" />Add Tag</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
