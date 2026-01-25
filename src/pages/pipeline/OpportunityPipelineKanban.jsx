import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, DollarSign, MapPin, Calendar, User, GripVertical, ChevronDown, TrendingUp, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const OpportunityPipelineKanban = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const stages = [
    { id: 'lead', name: 'Lead', color: 'gray', count: 5, value: 2450000 },
    { id: 'qualified', name: 'Qualified', color: 'blue', count: 4, value: 3850000 },
    { id: 'analysis', name: 'Analysis', color: 'purple', count: 3, value: 4200000 },
    { id: 'negotiation', name: 'Negotiation', color: 'amber', count: 2, value: 3100000 },
    { id: 'due-diligence', name: 'Due Diligence', color: 'orange', count: 2, value: 2850000 },
    { id: 'closing', name: 'Closing', color: 'green', count: 1, value: 1950000 },
  ];

  const opportunities = [
    // Lead Stage
    { id: 'opp-1', name: 'Oak Grove Estates', stage: 'lead', value: 450000, type: 'Land', location: 'Austin, TX', assignee: 'John Smith', score: 65, daysInStage: 3, lastActivity: '2h ago' },
    { id: 'opp-2', name: 'Riverside Commons', stage: 'lead', value: 680000, type: 'Multi-Family', location: 'Houston, TX', assignee: 'Sarah Johnson', score: 72, daysInStage: 5, lastActivity: '1d ago' },
    { id: 'opp-3', name: 'Pine Valley Lots', stage: 'lead', value: 320000, type: 'Lot Development', location: 'Dallas, TX', assignee: 'Mike Davis', score: 58, daysInStage: 1, lastActivity: '30m ago' },
    { id: 'opp-4', name: 'Cedar Park Land', stage: 'lead', value: 550000, type: 'Land', location: 'Cedar Park, TX', assignee: 'John Smith', score: 61, daysInStage: 7, lastActivity: '3d ago' },
    { id: 'opp-5', name: 'Meadow Brook Site', stage: 'lead', value: 450000, type: 'Land', location: 'Round Rock, TX', assignee: 'Sarah Johnson', score: 55, daysInStage: 2, lastActivity: '5h ago' },

    // Qualified Stage
    { id: 'opp-6', name: 'Summit Ridge Development', stage: 'qualified', value: 1250000, type: 'BTR', location: 'San Antonio, TX', assignee: 'John Smith', score: 78, daysInStage: 8, lastActivity: '1d ago' },
    { id: 'opp-7', name: 'Lakeside Village', stage: 'qualified', value: 950000, type: 'Community', location: 'Fort Worth, TX', assignee: 'Mike Davis', score: 82, daysInStage: 4, lastActivity: '2h ago' },
    { id: 'opp-8', name: 'Heritage Hills', stage: 'qualified', value: 780000, type: 'Land', location: 'Plano, TX', assignee: 'Sarah Johnson', score: 75, daysInStage: 6, lastActivity: '6h ago' },
    { id: 'opp-9', name: 'Valley View Acres', stage: 'qualified', value: 870000, type: 'Lot Development', location: 'McKinney, TX', assignee: 'John Smith', score: 70, daysInStage: 3, lastActivity: '4h ago' },

    // Analysis Stage
    { id: 'opp-10', name: 'Westfield Commercial', stage: 'analysis', value: 1850000, type: 'Commercial', location: 'Austin, TX', assignee: 'Mike Davis', score: 85, daysInStage: 12, lastActivity: '3h ago' },
    { id: 'opp-11', name: 'Sunrise Estates Phase 2', stage: 'analysis', value: 1450000, type: 'Lot Development', location: 'Georgetown, TX', assignee: 'Sarah Johnson', score: 88, daysInStage: 9, lastActivity: '1d ago' },
    { id: 'opp-12', name: 'Downtown Mixed Use', stage: 'analysis', value: 900000, type: 'Mixed Use', location: 'Houston, TX', assignee: 'John Smith', score: 79, daysInStage: 5, lastActivity: '8h ago' },

    // Negotiation Stage
    { id: 'opp-13', name: 'Harbor Point Marina', stage: 'negotiation', value: 1650000, type: 'Waterfront', location: 'Galveston, TX', assignee: 'John Smith', score: 91, daysInStage: 14, lastActivity: '1h ago' },
    { id: 'opp-14', name: 'Green Valley Ranch', stage: 'negotiation', value: 1450000, type: 'Land', location: 'Dripping Springs, TX', assignee: 'Mike Davis', score: 87, daysInStage: 7, lastActivity: '5h ago' },

    // Due Diligence Stage
    { id: 'opp-15', name: 'Tech Park North', stage: 'due-diligence', value: 1500000, type: 'Commercial', location: 'Frisco, TX', assignee: 'Sarah Johnson', score: 94, daysInStage: 21, lastActivity: '2h ago' },
    { id: 'opp-16', name: 'Willow Creek Subdivision', stage: 'due-diligence', value: 1350000, type: 'Lot Development', location: 'Kyle, TX', assignee: 'John Smith', score: 92, daysInStage: 18, lastActivity: '1d ago' },

    // Closing Stage
    { id: 'opp-17', name: 'Sunset Ridge Phase 3', stage: 'closing', value: 1950000, type: 'Community', location: 'New Braunfels, TX', assignee: 'Mike Davis', score: 98, daysInStage: 5, lastActivity: '30m ago' },
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStageColor = (color) => {
    switch (color) {
      case 'gray': return 'bg-gray-100 border-gray-300';
      case 'blue': return 'bg-blue-50 border-blue-300';
      case 'purple': return 'bg-purple-50 border-purple-300';
      case 'amber': return 'bg-amber-50 border-amber-300';
      case 'orange': return 'bg-orange-50 border-orange-300';
      case 'green': return 'bg-green-50 border-green-300';
      default: return 'bg-gray-50 border-gray-300';
    }
  };

  const getStageHeaderColor = (color) => {
    switch (color) {
      case 'gray': return 'bg-gray-500';
      case 'blue': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      case 'amber': return 'bg-amber-500';
      case 'orange': return 'bg-orange-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDragStart = (e, opportunity) => {
    setDraggedCard(opportunity);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    setDragOverColumn(stageId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (draggedCard) {
      console.log(`Moving ${draggedCard.name} to ${stageId}`);
      // In real app, update the opportunity's stage
    }
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || opp.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Pipeline Kanban</h1>
            <p className="text-sm text-gray-500">Drag and drop opportunities between stages</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Filter</Button>
            <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm"><Plus className="w-4 h-4 mr-1" />Add Opportunity</Button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Total Pipeline:</span>
            <span className="text-lg font-bold text-green-700">${(totalValue / 1000000).toFixed(2)}M</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Opportunities:</span>
            <span className="text-lg font-bold">{opportunities.length}</span>
          </div>
          <div className="flex-1" />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search opportunities..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="border rounded-md px-3 py-1.5 text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="Land">Land</option>
            <option value="Lot Development">Lot Development</option>
            <option value="BTR">BTR</option>
            <option value="Commercial">Commercial</option>
            <option value="Community">Community</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-w-max">
          {stages.map((stage) => {
            const stageOpps = filteredOpportunities.filter(opp => opp.stage === stage.id);
            const stageValue = stageOpps.reduce((sum, opp) => sum + opp.value, 0);

            return (
              <div
                key={stage.id}
                className={cn(
                  "w-80 flex flex-col rounded-lg border-2 transition-colors",
                  getStageColor(stage.color),
                  dragOverColumn === stage.id && "border-dashed border-blue-400 bg-blue-50"
                )}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className={cn("px-4 py-3 rounded-t-md", getStageHeaderColor(stage.color))}>
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stage.name}</span>
                      <span className="px-2 py-0.5 bg-white/20 rounded text-xs">{stageOpps.length}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-6 w-6 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-white/80 text-sm mt-1">${(stageValue / 1000000).toFixed(2)}M</p>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {stageOpps.map((opp) => (
                    <div
                      key={opp.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, opp)}
                      className={cn(
                        "bg-white rounded-lg border shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
                        draggedCard?.id === opp.id && "opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{opp.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {opp.location}
                          </div>
                        </div>
                        <div className={cn("w-2 h-2 rounded-full", getScoreColor(opp.score))} title={`Score: ${opp.score}`} />
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{opp.type}</span>
                        <span className="text-xs text-gray-400">{opp.daysInStage}d in stage</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-green-700">${(opp.value / 1000).toFixed(0)}K</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{opp.lastActivity}</span>
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                            {opp.assignee.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageOpps.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No opportunities in this stage
                    </div>
                  )}
                </div>

                {/* Add Button */}
                <div className="p-2 border-t border-gray-200">
                  <Button variant="ghost" className="w-full justify-start text-gray-500 hover:text-gray-700">
                    <Plus className="w-4 h-4 mr-1" />Add Opportunity
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OpportunityPipelineKanban;
