import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';

// Demo deals data
const demoDeals = [
  {
    id: 'deal-001',
    name: 'Highland Park Development',
    propertyType: 'Multifamily',
    address: '200 Highland Park Drive, Austin, TX',
    stage: 'due_diligence',
    value: 8750000,
    units: 50,
    sqft: 53000,
    assignee: { id: 'user-1', name: 'Michael Chen', initials: 'MC' },
    priority: 'high',
    probability: 75,
    expectedCloseDate: '2026-03-15',
    daysInStage: 12,
    lastActivity: '2026-01-24',
    tags: ['Urban', 'Value-Add'],
    source: 'Broker',
    notes: 'Environmental Phase I complete, reviewing financials'
  },
  {
    id: 'deal-002',
    name: 'Riverside Commons',
    propertyType: 'Multifamily',
    address: '450 River Road, Austin, TX',
    stage: 'negotiation',
    value: 12500000,
    units: 72,
    sqft: 76000,
    assignee: { id: 'user-2', name: 'Sarah Johnson', initials: 'SJ' },
    priority: 'high',
    probability: 60,
    expectedCloseDate: '2026-04-30',
    daysInStage: 8,
    lastActivity: '2026-01-25',
    tags: ['Waterfront', 'New Construction'],
    source: 'Off-Market',
    notes: 'Price negotiation ongoing, seller countered at $13M'
  },
  {
    id: 'deal-003',
    name: 'Oak Street Townhomes',
    propertyType: 'Townhomes',
    address: '789 Oak Street, Round Rock, TX',
    stage: 'prospecting',
    value: 3200000,
    units: 16,
    sqft: 24000,
    assignee: { id: 'user-3', name: 'Emily Davis', initials: 'ED' },
    priority: 'medium',
    probability: 25,
    expectedCloseDate: '2026-06-30',
    daysInStage: 5,
    lastActivity: '2026-01-23',
    tags: ['Suburban', 'Development'],
    source: 'Cold Call',
    notes: 'Initial meeting scheduled for next week'
  },
  {
    id: 'deal-004',
    name: 'Commerce Park Office',
    propertyType: 'Office',
    address: '100 Commerce Blvd, Austin, TX',
    stage: 'proposal',
    value: 5800000,
    units: null,
    sqft: 45000,
    assignee: { id: 'user-1', name: 'Michael Chen', initials: 'MC' },
    priority: 'medium',
    probability: 40,
    expectedCloseDate: '2026-05-15',
    daysInStage: 15,
    lastActivity: '2026-01-22',
    tags: ['Office', 'Stabilized'],
    source: 'Referral',
    notes: 'LOI submitted, waiting for response'
  },
  {
    id: 'deal-005',
    name: 'Maple Grove Apartments',
    propertyType: 'Multifamily',
    address: '555 Maple Drive, Cedar Park, TX',
    stage: 'closing',
    value: 9360000,
    units: 52,
    sqft: 54000,
    assignee: { id: 'user-2', name: 'Sarah Johnson', initials: 'SJ' },
    priority: 'high',
    probability: 90,
    expectedCloseDate: '2026-02-15',
    daysInStage: 20,
    lastActivity: '2026-01-25',
    tags: ['Class B', 'Stabilized'],
    source: 'Broker',
    notes: 'Loan approved, final docs in review'
  },
  {
    id: 'deal-006',
    name: 'Industrial Park Land',
    propertyType: 'Land',
    address: '1000 Industrial Way, Pflugerville, TX',
    stage: 'prospecting',
    value: 2400000,
    units: null,
    sqft: null,
    assignee: { id: 'user-4', name: 'David Park', initials: 'DP' },
    priority: 'low',
    probability: 15,
    expectedCloseDate: '2026-08-30',
    daysInStage: 3,
    lastActivity: '2026-01-24',
    tags: ['Land', 'Development'],
    source: 'Direct Owner',
    notes: 'Preliminary research phase'
  },
  {
    id: 'deal-007',
    name: 'Downtown Retail Strip',
    propertyType: 'Retail',
    address: '321 Main Street, Austin, TX',
    stage: 'due_diligence',
    value: 4200000,
    units: null,
    sqft: 18000,
    assignee: { id: 'user-3', name: 'Emily Davis', initials: 'ED' },
    priority: 'medium',
    probability: 55,
    expectedCloseDate: '2026-04-01',
    daysInStage: 22,
    lastActivity: '2026-01-20',
    tags: ['Retail', 'Urban'],
    source: 'Auction',
    notes: 'Tenant estoppels being collected'
  },
  {
    id: 'deal-008',
    name: 'Sunset View Condos',
    propertyType: 'Condo',
    address: '888 Sunset Blvd, Lakeway, TX',
    stage: 'closed_won',
    value: 6800000,
    units: 24,
    sqft: 32000,
    assignee: { id: 'user-1', name: 'Michael Chen', initials: 'MC' },
    priority: 'high',
    probability: 100,
    expectedCloseDate: '2026-01-10',
    daysInStage: 15,
    lastActivity: '2026-01-10',
    tags: ['Luxury', 'Lake View'],
    source: 'Broker',
    notes: 'Closed successfully, under renovation'
  }
];

const defaultStages = [
  { id: 'prospecting', name: 'Prospecting', color: 'gray' },
  { id: 'proposal', name: 'Proposal', color: 'blue' },
  { id: 'negotiation', name: 'Negotiation', color: 'yellow' },
  { id: 'due_diligence', name: 'Due Diligence', color: 'purple' },
  { id: 'closing', name: 'Closing', color: 'orange' },
  { id: 'closed_won', name: 'Closed Won', color: 'green' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'red' }
];

const stageColors = {
  gray: 'bg-gray-100 border-gray-300',
  blue: 'bg-blue-100 border-blue-300',
  yellow: 'bg-yellow-100 border-yellow-300',
  purple: 'bg-purple-100 border-purple-300',
  orange: 'bg-orange-100 border-orange-300',
  green: 'bg-green-100 border-green-300',
  red: 'bg-red-100 border-red-300'
};

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-400'
};

export default function DealPipelineKanban() {
  const [deals, setDeals] = useState([]);
  const [stages, setStages] = useState(defaultStages);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    propertyType: 'Multifamily',
    address: '',
    stage: 'prospecting',
    value: '',
    units: '',
    sqft: '',
    priority: 'medium',
    probability: 50,
    expectedCloseDate: '',
    source: '',
    notes: ''
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      if (isDemoMode()) {
        setDeals(demoDeals);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setDeals(demoDeals);
    } finally {
      setLoading(false);
    }
  }

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = !searchQuery ||
        deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.address?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAssignee = filterAssignee === 'all' || deal.assignee?.id === filterAssignee;
      const matchesPriority = filterPriority === 'all' || deal.priority === filterPriority;

      return matchesSearch && matchesAssignee && matchesPriority;
    });
  }, [deals, searchQuery, filterAssignee, filterPriority]);

  const dealsByStage = useMemo(() => {
    const grouped = {};
    stages.forEach(stage => {
      grouped[stage.id] = filteredDeals.filter(deal => deal.stage === stage.id);
    });
    return grouped;
  }, [filteredDeals, stages]);

  const pipelineStats = useMemo(() => {
    const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    return {
      totalDeals: activeDeals.length,
      totalValue: activeDeals.reduce((sum, d) => sum + (d.value || 0), 0),
      weightedValue: activeDeals.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0),
      avgDaysInPipeline: Math.round(activeDeals.reduce((sum, d) => sum + (d.daysInStage || 0), 0) / (activeDeals.length || 1)),
      closedWon: deals.filter(d => d.stage === 'closed_won').length,
      closedLost: deals.filter(d => d.stage === 'closed_lost').length
    };
  }, [deals]);

  const teamMembers = useMemo(() => {
    const members = {};
    deals.forEach(deal => {
      if (deal.assignee) {
        members[deal.assignee.id] = deal.assignee;
      }
    });
    return Object.values(members);
  }, [deals]);

  function formatCurrency(value) {
    if (!value) return '-';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function handleDragStart(e, deal) {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, targetStage) {
    e.preventDefault();
    if (!draggedDeal || draggedDeal.stage === targetStage) {
      setDraggedDeal(null);
      return;
    }

    moveDealToStage(draggedDeal, targetStage);
    setDraggedDeal(null);
  }

  async function moveDealToStage(deal, newStage) {
    if (isDemoMode()) {
      setDeals(prev => prev.map(d =>
        d.id === deal.id
          ? { ...d, stage: newStage, daysInStage: 0, lastActivity: new Date().toISOString().split('T')[0] }
          : d
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from('deals')
        .update({
          stage: newStage,
          days_in_stage: 0,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', deal.id);

      if (error) throw error;
      fetchDeals();
    } catch (error) {
      console.error('Error moving deal:', error);
    }
  }

  function openCreateModal() {
    setEditingDeal(null);
    setFormData({
      name: '',
      propertyType: 'Multifamily',
      address: '',
      stage: 'prospecting',
      value: '',
      units: '',
      sqft: '',
      priority: 'medium',
      probability: 50,
      expectedCloseDate: '',
      source: '',
      notes: ''
    });
    setShowModal(true);
  }

  function openEditModal(deal) {
    setEditingDeal(deal);
    setFormData({
      name: deal.name,
      propertyType: deal.propertyType,
      address: deal.address || '',
      stage: deal.stage,
      value: deal.value?.toString() || '',
      units: deal.units?.toString() || '',
      sqft: deal.sqft?.toString() || '',
      priority: deal.priority,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate || '',
      source: deal.source || '',
      notes: deal.notes || ''
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (isDemoMode()) {
      if (editingDeal) {
        setDeals(prev => prev.map(d =>
          d.id === editingDeal.id
            ? {
                ...d,
                ...formData,
                value: parseFloat(formData.value) || 0,
                units: parseInt(formData.units) || null,
                sqft: parseInt(formData.sqft) || null,
                lastActivity: new Date().toISOString().split('T')[0]
              }
            : d
        ));
      } else {
        const newDeal = {
          id: `deal-${Date.now()}`,
          ...formData,
          value: parseFloat(formData.value) || 0,
          units: parseInt(formData.units) || null,
          sqft: parseInt(formData.sqft) || null,
          assignee: { id: 'user-1', name: 'Michael Chen', initials: 'MC' },
          daysInStage: 0,
          lastActivity: new Date().toISOString().split('T')[0],
          tags: []
        };
        setDeals(prev => [newDeal, ...prev]);
      }
      setShowModal(false);
      return;
    }

    try {
      if (editingDeal) {
        const { error } = await supabase
          .from('deals')
          .update({
            name: formData.name,
            property_type: formData.propertyType,
            address: formData.address,
            stage: formData.stage,
            value: parseFloat(formData.value) || 0,
            units: parseInt(formData.units) || null,
            sqft: parseInt(formData.sqft) || null,
            priority: formData.priority,
            probability: formData.probability,
            expected_close_date: formData.expectedCloseDate || null,
            source: formData.source,
            notes: formData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingDeal.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('deals')
          .insert({
            name: formData.name,
            property_type: formData.propertyType,
            address: formData.address,
            stage: formData.stage,
            value: parseFloat(formData.value) || 0,
            units: parseInt(formData.units) || null,
            sqft: parseInt(formData.sqft) || null,
            priority: formData.priority,
            probability: formData.probability,
            expected_close_date: formData.expectedCloseDate || null,
            source: formData.source,
            notes: formData.notes
          });

        if (error) throw error;
      }

      fetchDeals();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving deal:', error);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
          <p className="text-gray-600 mt-1">Track and manage deals through your pipeline stages</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Add Deal</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Deals</div>
          <div className="text-2xl font-bold text-gray-900">{pipelineStats.totalDeals}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Pipeline Value</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(pipelineStats.totalValue)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Weighted Value</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(pipelineStats.weightedValue)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Avg Days</div>
          <div className="text-2xl font-bold text-orange-600">{pipelineStats.avgDaysInPipeline}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Won</div>
          <div className="text-2xl font-bold text-green-600">{pipelineStats.closedWon}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Lost</div>
          <div className="text-2xl font-bold text-red-600">{pipelineStats.closedLost}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Team Members</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {stages.filter(s => !['closed_won', 'closed_lost'].includes(s.id)).map(stage => {
            const stageDeals = dealsByStage[stage.id] || [];
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

            return (
              <div
                key={stage.id}
                className={`w-80 flex flex-col rounded-lg border-2 ${stageColors[stage.color]} min-h-[500px]`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className="p-3 border-b bg-white/50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                    <span className="px-2 py-0.5 bg-white rounded-full text-sm font-medium">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatCurrency(stageValue)}
                  </div>
                </div>

                {/* Stage Cards */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {stageDeals.map(deal => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal)}
                      onClick={() => openEditModal(deal)}
                      className="bg-white rounded-lg shadow p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4"
                      style={{ borderLeftColor: priorityColors[deal.priority]?.replace('bg-', '') }}
                    >
                      {/* Priority Indicator */}
                      <div className="flex justify-between items-start mb-2">
                        <span className={`w-2 h-2 rounded-full ${priorityColors[deal.priority]}`} />
                        <span className="text-xs text-gray-500">{deal.daysInStage}d</span>
                      </div>

                      {/* Deal Name */}
                      <h4 className="font-medium text-gray-900 mb-1">{deal.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{deal.propertyType}</p>

                      {/* Value */}
                      <div className="text-lg font-bold text-blue-600 mb-2">
                        {formatCurrency(deal.value)}
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        {deal.units && <span>{deal.units} units</span>}
                        {deal.sqft && <span>{(deal.sqft / 1000).toFixed(0)}K SF</span>}
                      </div>

                      {/* Probability Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Probability</span>
                          <span className="font-medium">{deal.probability}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      {deal.tags && deal.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {deal.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-2 border-t">
                        {deal.assignee && (
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                            {deal.assignee.initials}
                          </div>
                        )}
                        {deal.expectedCloseDate && (
                          <span className="text-xs text-gray-500">
                            {new Date(deal.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Drop deals here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDeal ? 'Edit Deal' : 'Add Deal'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Highland Park Development"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type *
                  </label>
                  <select
                    required
                    value={formData.propertyType}
                    onChange={(e) => setFormData(prev => ({ ...prev, propertyType: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Multifamily">Multifamily</option>
                    <option value="Office">Office</option>
                    <option value="Retail">Retail</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Land">Land</option>
                    <option value="Townhomes">Townhomes</option>
                    <option value="Condo">Condo</option>
                    <option value="Mixed Use">Mixed Use</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Property address"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Units
                  </label>
                  <input
                    type="number"
                    value={formData.units}
                    onChange={(e) => setFormData(prev => ({ ...prev, units: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sq Ft
                  </label>
                  <input
                    type="number"
                    value={formData.sqft}
                    onChange={(e) => setFormData(prev => ({ ...prev, sqft: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="e.g., Broker, Off-Market"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingDeal ? 'Update Deal' : 'Add Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
