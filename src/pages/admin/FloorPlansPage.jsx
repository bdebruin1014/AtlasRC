import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Plus, Search, Edit2, Copy, Trash2, Eye, Filter, Grid3x3,
  Bed, Bath, Car, Layers, Maximize2, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
  getFloorPlans,
  createFloorPlan,
  updateFloorPlan,
  deleteFloorPlan,
  getPlanElevations,
  createPlanElevation,
  deletePlanElevation
} from '@/services/floorPlanService';

const FloorPlansPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    plan_type: '',
    garage_type: '',
    bedrooms: '',
    is_active: true
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    loadPlans();
  }, [filters]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getFloorPlans(filters);
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading floor plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load floor plans',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    setShowAddModal(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowAddModal(true);
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this floor plan?')) return;

    try {
      await deleteFloorPlan(planId);
      toast({
        title: 'Success',
        description: 'Floor plan deleted successfully'
      });
      loadPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete floor plan',
        variant: 'destructive'
      });
    }
  };

  const handleDuplicatePlan = async (plan) => {
    try {
      const duplicate = {
        ...plan,
        plan_code: `${plan.plan_code}_COPY`,
        plan_name: `${plan.plan_name} (Copy)`,
        id: undefined,
        created_at: undefined
      };
      await createFloorPlan(duplicate);
      toast({
        title: 'Success',
        description: 'Floor plan duplicated successfully'
      });
      loadPlans();
    } catch (error) {
      console.error('Error duplicating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate floor plan',
        variant: 'destructive'
      });
    }
  };

  const filteredPlans = plans.filter(plan => {
    const query = searchQuery.toLowerCase();
    return (
      plan.plan_name.toLowerCase().includes(query) ||
      plan.plan_code.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Home className="w-7 h-7 text-blue-600" />
            Floor Plans Library
          </h1>
          <p className="text-gray-500 mt-1">
            Manage floor plans, elevations, and specifications
          </p>
        </div>
        <Button onClick={handleAddPlan} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Floor Plan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Plans</p>
                <p className="text-2xl font-bold">{plans.length}</p>
              </div>
              <Home className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Plans</p>
                <p className="text-2xl font-bold">{plans.filter(p => p.is_active).length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Single Family</p>
                <p className="text-2xl font-bold">{plans.filter(p => p.plan_type === 'single_family').length}</p>
              </div>
              <Layers className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Townhomes</p>
                <p className="text-2xl font-bold">{plans.filter(p => p.plan_type === 'townhome').length}</p>
              </div>
              <Grid3x3 className="w-8 h-8 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by plan name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={filters.plan_type}
              onChange={(e) => setFilters({ ...filters, plan_type: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Types</option>
              <option value="single_family">Single Family</option>
              <option value="townhome">Townhome</option>
            </select>
            <select
              value={filters.garage_type}
              onChange={(e) => setFilters({ ...filters, garage_type: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Garages</option>
              <option value="none">No Garage</option>
              <option value="1-car">1-Car</option>
              <option value="2-car">2-Car</option>
            </select>
            <select
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Bedrooms</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
            <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={filters.is_active}
                onChange={(e) => setFilters({ ...filters, is_active: e.target.checked })}
              />
              <span className="text-sm">Active Only</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Floor Plans Found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || Object.values(filters).some(v => v && v !== true)
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first floor plan'}
            </p>
            <Button onClick={handleAddPlan}>
              <Plus className="w-4 h-4 mr-2" />
              Add Floor Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <FloorPlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => handleEditPlan(plan)}
              onDelete={() => handleDeletePlan(plan.id)}
              onDuplicate={() => handleDuplicatePlan(plan)}
              onViewPricing={() => navigate(`/admin/pricing/plans/${plan.id}`)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <FloorPlanModal
          plan={editingPlan}
          onClose={() => {
            setShowAddModal(false);
            setEditingPlan(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setEditingPlan(null);
            loadPlans();
          }}
        />
      )}
    </div>
  );
};

// Floor Plan Card Component
const FloorPlanCard = ({ plan, onEdit, onDelete, onDuplicate, onViewPricing }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
              {plan.is_active ? (
                <Badge variant="success" className="text-xs">Active</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Inactive</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">Code: {plan.plan_code}</p>
          </div>
          <Badge variant="outline" className="capitalize">
            {plan.plan_type.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Specs */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-gray-400" />
              <span>{plan.square_footage.toLocaleString()} sqft</span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-gray-400" />
              <span>{plan.bedrooms} bed</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-4 h-4 text-gray-400" />
              <span>{plan.bathrooms} bath</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="capitalize">{plan.garage_type.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Dimensions */}
          <div className="pt-2 border-t text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-400" />
              <span>{plan.stories} {plan.stories === 1 ? 'story' : 'stories'}</span>
              {plan.width_feet && plan.depth_feet && (
                <span className="text-gray-400">• {plan.width_feet}&apos; × {plan.depth_feet}&apos;</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
              <Edit2 className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onViewPricing}>
              <Eye className="w-3 h-3 mr-1" />
              Pricing
            </Button>
            <Button variant="outline" size="sm" onClick={onDuplicate}>
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Floor Plan Modal Component
const FloorPlanModal = ({ plan, onClose, onSave }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(plan || {
    plan_code: '',
    plan_name: '',
    square_footage: '',
    bedrooms: 3,
    bathrooms: 2,
    garage_type: '2-car',
    stories: 2,
    width_feet: '',
    depth_feet: '',
    plan_type: 'single_family',
    description: '',
    is_active: true
  });

  const [elevations, setElevations] = useState([]);
  const [showAddElevation, setShowAddElevation] = useState(false);

  useEffect(() => {
    if (plan?.id) {
      loadElevations();
    }
  }, [plan]);

  const loadElevations = async () => {
    try {
      const data = await getPlanElevations(plan.id);
      setElevations(data || []);
    } catch (error) {
      console.error('Error loading elevations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (plan?.id) {
        await updateFloorPlan(plan.id, formData);
        toast({
          title: 'Success',
          description: 'Floor plan updated successfully'
        });
      } else {
        await createFloorPlan(formData);
        toast({
          title: 'Success',
          description: 'Floor plan created successfully'
        });
      }
      onSave();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save floor plan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddElevation = async (elevationData) => {
    try {
      await createPlanElevation({
        floor_plan_id: plan.id,
        ...elevationData
      });
      toast({
        title: 'Success',
        description: 'Elevation added successfully'
      });
      loadElevations();
      setShowAddElevation(false);
    } catch (error) {
      console.error('Error adding elevation:', error);
      toast({
        title: 'Error',
        description: 'Failed to add elevation',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteElevation = async (elevationId) => {
    if (!confirm('Are you sure you want to delete this elevation?')) return;

    try {
      await deletePlanElevation(elevationId);
      toast({
        title: 'Success',
        description: 'Elevation deleted successfully'
      });
      loadElevations();
    } catch (error) {
      console.error('Error deleting elevation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete elevation',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {plan ? 'Edit Floor Plan' : 'Add Floor Plan'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Plan Code *</label>
              <Input
                value={formData.plan_code}
                onChange={(e) => setFormData({ ...formData, plan_code: e.target.value.toUpperCase() })}
                placeholder="e.g., ATLAS"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plan Name *</label>
              <Input
                value={formData.plan_name}
                onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                placeholder="e.g., Atlas"
                required
              />
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Square Footage *</label>
              <Input
                type="number"
                value={formData.square_footage}
                onChange={(e) => setFormData({ ...formData, square_footage: parseInt(e.target.value) })}
                placeholder="1850"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bedrooms *</label>
              <Input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                min="1"
                max="10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bathrooms *</label>
              <Input
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) })}
                min="1"
                max="10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Garage Type *</label>
              <select
                value={formData.garage_type}
                onChange={(e) => setFormData({ ...formData, garage_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="none">No Garage</option>
                <option value="1-car">1-Car</option>
                <option value="2-car">2-Car</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stories *</label>
              <Input
                type="number"
                step="0.5"
                value={formData.stories}
                onChange={(e) => setFormData({ ...formData, stories: parseFloat(e.target.value) })}
                min="1"
                max="3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plan Type *</label>
              <select
                value={formData.plan_type}
                onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="single_family">Single Family</option>
                <option value="townhome">Townhome</option>
              </select>
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Width (feet)</label>
              <Input
                type="number"
                value={formData.width_feet}
                onChange={(e) => setFormData({ ...formData, width_feet: parseInt(e.target.value) || '' })}
                placeholder="42"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Depth (feet)</label>
              <Input
                type="number"
                value={formData.depth_feet}
                onChange={(e) => setFormData({ ...formData, depth_feet: parseInt(e.target.value) || '' })}
                placeholder="38"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows="3"
              placeholder="Brief description of the floor plan..."
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm font-medium">Active Plan</label>
          </div>

          {/* Elevations Section (only for existing plans) */}
          {plan?.id && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Elevations</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddElevation(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Elevation
                </Button>
              </div>
              <div className="space-y-2">
                {elevations.map((elevation) => (
                  <div key={elevation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Elevation {elevation.elevation_code}: {elevation.elevation_name}</p>
                      <p className="text-sm text-gray-500">
                        {elevation.base_siding_type === 'hardie' ? 'Hardie' : 'Vinyl'} • 
                        {elevation.elevation_adder > 0 ? ` +$${elevation.elevation_adder.toLocaleString()}` : ' Base'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDeleteElevation(elevation.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {elevations.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No elevations added yet</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Saving...' : (plan ? 'Update Plan' : 'Create Plan')}
            </Button>
          </div>
        </form>

        {/* Add Elevation Modal */}
        {showAddElevation && (
          <ElevationModal
            onClose={() => setShowAddElevation(false)}
            onSave={handleAddElevation}
          />
        )}
      </div>
    </div>
  );
};

// Elevation Modal Component
const ElevationModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    elevation_code: '',
    elevation_name: '',
    base_siding_type: 'vinyl',
    elevation_adder: 0,
    is_active: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-4">Add Elevation</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <Input
                value={formData.elevation_code}
                onChange={(e) => setFormData({ ...formData, elevation_code: e.target.value.toUpperCase() })}
                placeholder="A"
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                value={formData.elevation_name}
                onChange={(e) => setFormData({ ...formData, elevation_name: e.target.value })}
                placeholder="Traditional"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Base Siding Type</label>
            <select
              value={formData.base_siding_type}
              onChange={(e) => setFormData({ ...formData, base_siding_type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="vinyl">Vinyl</option>
              <option value="hardie">Hardie</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price Adder ($)</label>
            <Input
              type="number"
              step="100"
              value={formData.elevation_adder}
              onChange={(e) => setFormData({ ...formData, elevation_adder: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Add Elevation</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FloorPlansPage;
