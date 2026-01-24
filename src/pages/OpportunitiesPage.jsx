// OpportunitiesPage.jsx - List and manage opportunities
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOpportunities, useOpportunityActions, useOpportunitySummary, OPPORTUNITY_STAGES } from '@/hooks/useOpportunities';
import OpportunityModal from '@/components/OpportunityModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, DollarSign, MapPin, User } from 'lucide-react';

const formatCurrency = (amount) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const getStageBadgeColor = (stage) => {
  const colors = {
    'Prospecting': 'bg-indigo-100 text-indigo-800',
    'Contacted': 'bg-purple-100 text-purple-800',
    'Qualified': 'bg-amber-100 text-amber-800',
    'Negotiating': 'bg-emerald-100 text-emerald-800',
    'Under Contract': 'bg-green-100 text-green-800',
  };
  return colors[stage] || 'bg-gray-100 text-gray-800';
};

const OpportunitiesPage = () => {
  const { opportunities, isLoading, error, refetch } = useOpportunities();
  const { createOpportunity, updateOpportunity, deleteOpportunity, isLoading: isSaving } = useOpportunityActions();
  const summary = useOpportunitySummary(opportunities);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFilter = searchParams.get('stage') || '';

  // Filter opportunities by stage if URL param is present
  const filteredOpportunities = useMemo(() => {
    if (!stageFilter) return opportunities;
    return opportunities.filter(opp =>
      opp.stage?.toLowerCase().replace(/\s+/g, '_') === stageFilter.toLowerCase()
    );
  }, [opportunities, stageFilter]);

  const clearStageFilter = () => {
    searchParams.delete('stage');
    setSearchParams(searchParams);
  };

  const handleCreate = () => {
    setEditingOpportunity(null);
    setModalOpen(true);
  };

  const handleEdit = (opp) => {
    setEditingOpportunity(opp);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      await deleteOpportunity(id);
      refetch();
    }
  };

  const handleSave = async (data) => {
    if (editingOpportunity) {
      await updateOpportunity(editingOpportunity.id, data);
    } else {
      await createOpportunity(data);
    }
    setModalOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading opportunities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error: {error}</div>
        <Button onClick={refetch} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">Opportunities</h1>
          <p className="text-gray-500">Manage your deal pipeline</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex border rounded overflow-hidden">
            <button
              className={`px-3 py-1 text-sm ${viewMode === 'list' ? 'bg-gray-200 font-semibold' : 'bg-white'} transition`}
              onClick={() => setViewMode('list')}
              type="button"
            >
              List
            </button>
            <button
              className={`px-3 py-1 text-sm ${viewMode === 'grid' ? 'bg-gray-200 font-semibold' : 'bg-white'} transition`}
              onClick={() => setViewMode('grid')}
              type="button"
            >
              Grid
            </button>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Opportunity
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {OPPORTUNITY_STAGES.map((stage) => (
          <Card key={stage.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stage.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.byStage[stage.key]?.count || 0}</div>
              <div className="text-sm text-gray-500">
                {formatCurrency(summary.byStage[stage.key]?.value || 0)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stage Filter Indicator */}
      {stageFilter && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-700">
            Filtered by stage: <span className="font-semibold capitalize">{stageFilter.replace(/_/g, ' ')}</span>
          </span>
          <button onClick={clearStageFilter} className="text-blue-500 hover:text-blue-700 text-sm underline ml-2">
            Clear filter
          </button>
        </div>
      )}

      {/* Opportunities List/Grid View */}
      <Card>
        <CardHeader>
          <CardTitle>{stageFilter ? `Filtered Opportunities (${filteredOpportunities.length})` : `All Opportunities (${opportunities.length})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOpportunities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {stageFilter ? 'No opportunities in this stage.' : 'No opportunities yet. Click "New Opportunity" to add one.'}
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Deal #</th>
                    <th className="text-left py-3 px-4 font-medium">Address</th>
                    <th className="text-left py-3 px-4 font-medium">Stage</th>
                    <th className="text-left py-3 px-4 font-medium">Opportunity Type</th>
                    <th className="text-right py-3 px-4 font-medium">Est. Value</th>
                    <th className="text-left py-3 px-4 font-medium">Seller</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOpportunities.map((opp) => (
                    <tr
                      key={opp.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/opportunities/${opp.id}`)}
                    >
                      <td className="py-3 px-4 font-medium">{opp.deal_number}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <div>{opp.address}</div>
                            <div className="text-sm text-gray-500">{opp.city}, {opp.state}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStageBadgeColor(opp.stage)}>{opp.stage}</Badge>
                      </td>
                      <td className="py-3 px-4 capitalize">{opp.opportunity_type?.replace('-', ' ')}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(opp.estimated_value)}</td>
                      <td className="py-3 px-4">
                        {opp.seller_name && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{opp.seller_name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(opp)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(opp.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOpportunities.map((opp) => (
                <Card
                  key={opp.id}
                  className="cursor-pointer hover:shadow-lg transition"
                  onClick={() => navigate(`/opportunities/${opp.id}`)}
                >
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="font-bold text-lg">{opp.deal_number}</div>
                    <Badge className={getStageBadgeColor(opp.stage)}>{opp.stage}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 text-gray-700 font-medium capitalize">{opp.opportunity_type?.replace('-', ' ')}</div>
                    <div className="mb-1 flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{opp.address}, {opp.city}, {opp.state}</span>
                    </div>
                    <div className="mb-1 text-gray-600">Est. Value: <span className="font-semibold">{formatCurrency(opp.estimated_value)}</span></div>
                    {opp.seller_name && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{opp.seller_name}</span>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleEdit(opp); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleDelete(opp.id); }} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <div className="flex justify-end gap-8 text-sm">
        <div>Total Pipeline Value: <span className="font-bold">{formatCurrency(summary.totalValue)}</span></div>
      </div>

      {/* Modal */}
      <OpportunityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        opportunity={editingOpportunity}
        onSave={handleSave}
        isLoading={isSaving}
      />
    </div>
  );
};

export default OpportunitiesPage;
