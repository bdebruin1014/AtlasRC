import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, MapPin, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const OpportunitiesPage = () => {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState('all');

  // Updated stages per requirements
  const stages = [
    { id: 'all', label: 'All Opportunities', count: 8 },
    { id: 'prospecting', label: 'Prospecting', count: 2, color: '#6b7280' },
    { id: 'qualified', label: 'Qualified', count: 3, color: '#3b82f6' },
    { id: 'negotiating', label: 'Negotiating', count: 2, color: '#f59e0b' },
    { id: 'under-contract', label: 'Under Contract', count: 1, color: '#047857' },
  ];

  // Opportunity types matching project types
  const opportunityTypes = {
    'lot-dev': 'Lot Development',
    'for-sale-dev': 'For Sale Development',
    'btr-dev': 'BTR Development',
    'for-sale-lot': 'For Sale Lot Purchase',
    'btr-lot': 'BTR Lot Purchase',
    'fix-flip': 'Fix and Flip',
    'brrr': 'BRRR',
  };

  // Updated opportunities with new naming convention: YY-NNN-Address
  const opportunities = [
    { id: 1, name: '25-001-450 Pine Valley Rd', address: '450 Pine Valley Rd, Greenville, SC 29607', type: 'lot-dev', acres: 12.5, price: 850000, stage: 'prospecting', team: 'Development Team', daysInStage: 5 },
    { id: 2, name: '25-002-200 River St', address: '200 River St, Spartanburg, SC 29303', type: 'btr-dev', acres: 8.0, price: 3200000, stage: 'prospecting', team: 'Development Team', daysInStage: 12 },
    { id: 3, name: '25-003-100 Oak St', address: '100 Oak St, Anderson, SC 29621', type: 'fix-flip', sqft: 2200, price: 185000, stage: 'qualified', team: 'Flip Team', daysInStage: 3 },
    { id: 4, name: '25-004-800 Magnolia Ave', address: '800 Magnolia Ave, Greenville, SC 29601', type: 'for-sale-lot', acres: 2.1, price: 320000, stage: 'qualified', team: 'Development Team', daysInStage: 8 },
    { id: 5, name: '25-005-50 Main St', address: '50 Main St, Greenville, SC 29601', type: 'brrr', sqft: 1800, price: 225000, stage: 'qualified', team: 'Flip Team', daysInStage: 14 },
    { id: 6, name: '25-006-1200 Industrial Blvd', address: '1200 Industrial Blvd, Greer, SC 29651', type: 'for-sale-dev', acres: 15.0, price: 1200000, stage: 'negotiating', team: 'Development Team', daysInStage: 6 },
    { id: 7, name: '25-007-300 Creek Rd', address: '300 Creek Rd, Simpsonville, SC 29681', type: 'btr-lot', acres: 3.5, price: 420000, stage: 'negotiating', team: 'Development Team', daysInStage: 10 },
    { id: 8, name: '25-008-600 Heritage Way', address: '600 Heritage Way, Mauldin, SC 29662', type: 'lot-dev', acres: 25, price: 2100000, stage: 'under-contract', team: 'Development Team', daysInStage: 21 },
  ];

  const filteredOpps = activeStage === 'all' ? opportunities : opportunities.filter(o => o.stage === activeStage);

  const formatPrice = (price) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    return `$${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div className="flex h-[calc(100vh-40px)] bg-gray-50">
      <div className="w-52 bg-[#1e2a3a] flex-shrink-0 overflow-y-auto">
        <div className="p-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-white">Pipeline Stages</h2>
        </div>
        <nav className="p-2">
          {stages.map((stage) => (
            <button key={stage.id} onClick={() => setActiveStage(stage.id)} className={cn("w-full flex items-center justify-between px-3 py-2 text-xs rounded transition-colors mb-1", activeStage === stage.id ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}>
              <div className="flex items-center gap-2">
                {stage.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />}
                {stage.label}
              </div>
              <span className="text-gray-500">{stage.count}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700 mt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Pipeline Value</h3>
          <p className="text-xl font-semibold text-white">$8.5M</p>
          <p className="text-xs text-gray-500">8 opportunities</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search opportunities..." className="pl-9 w-72 h-9 text-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9"><Filter className="w-4 h-4 mr-1" />Filter</Button>
          </div>
          <Button className="bg-[#047857] hover:bg-[#065f46] h-9"><Plus className="w-4 h-4 mr-1" />New Opportunity</Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {/* Table Header */}
          <div className="bg-gray-100 border border-gray-200 rounded-t-lg px-4 py-2 grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase">
            <div className="col-span-3">Opportunity Name</div>
            <div className="col-span-1">Land Size</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Team</div>
            <div className="col-span-2">Stage</div>
          </div>
          
          <div className="border-x border-b border-gray-200 rounded-b-lg bg-white divide-y divide-gray-100">
            {filteredOpps.map((opp) => {
              const stage = stages.find(s => s.id === opp.stage);
              return (
                <div 
                  key={opp.id} 
                  onClick={() => navigate(`/opportunity/${opp.id}`)}
                  className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-[#047857]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{opp.name}</p>
                        <p className="text-xs text-gray-500">{formatPrice(opp.price)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 text-sm text-gray-600">
                    {opp.acres ? `${opp.acres} ac` : opp.sqft ? `${opp.sqft.toLocaleString()} sf` : '-'}
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{opportunityTypes[opp.type]}</span>
                  </div>
                  <div className="col-span-2 text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{opp.address.split(',')[1]?.trim()}, {opp.address.split(',')[2]?.trim()}</span>
                  </div>
                  <div className="col-span-2 text-sm text-gray-600 flex items-center gap-1">
                    <Users className="w-3 h-3 text-gray-400" />
                    {opp.team}
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs px-2 py-1 rounded font-medium" style={{ backgroundColor: stage.color + '20', color: stage.color }}>
                      {stage.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-56 bg-white border-l border-gray-200 flex-shrink-0 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4">Stage Summary</h3>
        <div className="space-y-3">
          {stages.filter(s => s.id !== 'all').map((stage) => (
            <div key={stage.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-sm text-gray-600">{stage.label}</span>
              </div>
              <span className="text-sm font-medium">{stage.count}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Avg Deal Size</span><span className="font-medium">$1.1M</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Avg Days to Close</span><span className="font-medium">45</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Conversion Rate</span><span className="font-medium">32%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesPage;
