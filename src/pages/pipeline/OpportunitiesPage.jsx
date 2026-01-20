// OpportunitiesPage.jsx - List and manage opportunities
import { useState } from 'react';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Opportunities</h1>
          <p className="text-gray-500">Manage your deal pipeline</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Opportunity
        </Button>
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

      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Opportunities ({opportunities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No opportunities yet. Click "New Opportunity" to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Deal #</th>
                    <th className="text-left py-3 px-4 font-medium">Address</th>
                    <th className="text-left py-3 px-4 font-medium">Stage</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-right py-3 px-4 font-medium">Est. Value</th>
                    <th className="text-right py-3 px-4 font-medium">Assignment Fee</th>
                    <th className="text-left py-3 px-4 font-medium">Seller</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((opp) => (
                    <tr key={opp.id} className="border-b hover:bg-gray-50">
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
                      <td className="py-3 px-4 capitalize">{opp.property_type?.replace('-', ' ')}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(opp.estimated_value)}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">
                        {formatCurrency(opp.assignment_fee)}
                      </td>
                      <td className="py-3 px-4">
                        {opp.seller_name && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{opp.seller_name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
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
          )}
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <div className="flex justify-end gap-8 text-sm">
        <div>Total Pipeline Value: <span className="font-bold">{formatCurrency(summary.totalValue)}</span></div>
        <div>Total Assignment Fees: <span className="font-bold text-green-600">{formatCurrency(summary.totalAssignmentFees)}</span></div>
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
