import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit2, Trash2, DollarSign, Home,
  Save, X, FileSpreadsheet, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { getFloorPlans } from '@/services/floorPlanService';
import { getUpgradePackages, getPlanUpgradePricing, updateUpgradePricing } from '@/services/pricingService';
import { cn } from '@/lib/utils';

const UPGRADE_CATEGORIES = [
  { id: 'exterior', name: 'Exterior', color: 'bg-blue-100 text-blue-800' },
  { id: 'interior_classic', name: 'Interior Classic', color: 'bg-purple-100 text-purple-800' },
  { id: 'interior_elegance', name: 'Interior Elegance', color: 'bg-pink-100 text-pink-800' }
];

const UpgradePackageManagementPage = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [packages, setPackages] = useState([]);
  const [pricingData, setPricingData] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newPackage, setNewPackage] = useState({
    package_code: '',
    package_name: '',
    category: 'exterior',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, packagesData] = await Promise.all([
        getFloorPlans({ is_active: true }),
        getUpgradePackages()
      ]);

      setPlans(plansData);
      setPackages(packagesData);

      // Load pricing for all plan/package combinations
      const pricingMap = {};
      for (const plan of plansData) {
        const pricing = await getPlanUpgradePricing(plan.id);
        pricingMap[plan.id] = pricing.reduce((acc, item) => {
          acc[item.upgrade_package_id] = item.price;
          return acc;
        }, {});
      }
      setPricingData(pricingMap);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load upgrade packages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = async (planId, packageId, newValue) => {
    try {
      const numericValue = parseFloat(newValue) || 0;
      await updateUpgradePricing(planId, packageId, numericValue);
      
      setPricingData(prev => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [packageId]: numericValue
        }
      }));

      toast({
        title: 'Success',
        description: 'Upgrade pricing updated successfully'
      });
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update pricing',
        variant: 'destructive'
      });
    } finally {
      setEditingCell(null);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const filteredPackages = selectedCategory === 'all'
    ? packages
    : packages.filter(pkg => pkg.category === selectedCategory);

  const groupedPackages = packages.reduce((acc, pkg) => {
    const category = pkg.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(pkg);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading upgrade packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upgrade Package Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage upgrade options and pricing across floor plans
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Packages</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{packages.length}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        {UPGRADE_CATEGORIES.map(cat => {
          const count = packages.filter(p => p.category === cat.id).length;
          return (
            <Card key={cat.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{cat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Filter */}
      <div className="mb-4 flex gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Packages
        </Button>
        {UPGRADE_CATEGORIES.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Pricing Matrix */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 border-r min-w-[300px]">
                  Upgrade Package
                </th>
                {plans.map(plan => (
                  <th 
                    key={plan.id}
                    className="px-3 py-3 text-center font-semibold text-gray-700 border-r min-w-[120px]"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{plan.plan_code || plan.plan_name}</span>
                      <span className="text-xs text-gray-500 font-normal">
                        {plan.square_footage} SF
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedPackages).map(([category, pkgs]) => (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr className="bg-gray-100">
                    <td 
                      colSpan={plans.length + 1}
                      className="sticky left-0 px-4 py-2 font-semibold text-gray-900 uppercase text-xs tracking-wide"
                    >
                      {UPGRADE_CATEGORIES.find(c => c.id === category)?.name || category}
                    </td>
                  </tr>
                  {/* Packages */}
                  {pkgs.map((pkg, idx) => (
                    <tr 
                      key={pkg.id}
                      className={cn(
                        "hover:bg-blue-50 transition-colors",
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      )}
                    >
                      <td className="sticky left-0 bg-inherit px-4 py-3 border-r">
                        <div>
                          <div className="font-medium text-gray-900">{pkg.package_name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {pkg.package_code}
                          </div>
                          {pkg.description && (
                            <div className="text-xs text-gray-400 mt-1">
                              {pkg.description}
                            </div>
                          )}
                        </div>
                      </td>
                      {plans.map(plan => {
                        const cellKey = `${plan.id}-${pkg.id}`;
                        const value = pricingData[plan.id]?.[pkg.id] || 0;
                        const isEditing = editingCell === cellKey;

                        return (
                          <td 
                            key={cellKey}
                            className="px-2 py-2 border-r text-center"
                          >
                            {isEditing ? (
                              <Input
                                type="number"
                                step="0.01"
                                defaultValue={value}
                                className="w-full text-right text-sm"
                                autoFocus
                                onBlur={(e) => handleCellEdit(plan.id, pkg.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCellEdit(plan.id, pkg.id, e.target.value);
                                  } else if (e.key === 'Escape') {
                                    setEditingCell(null);
                                  }
                                }}
                              />
                            ) : (
                              <div
                                className="px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                                onClick={() => setEditingCell(cellKey)}
                              >
                                {formatCurrency(value)}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Details Section */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {filteredPackages.slice(0, 6).map(pkg => (
          <Card key={pkg.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{pkg.package_name}</CardTitle>
                  <p className="text-xs text-gray-500 mt-1">{pkg.package_code}</p>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  UPGRADE_CATEGORIES.find(c => c.id === pkg.category)?.color || 'bg-gray-100 text-gray-800'
                )}>
                  {UPGRADE_CATEGORIES.find(c => c.id === pkg.category)?.name || pkg.category}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                {pkg.description || 'No description available'}
              </p>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-xs text-gray-500">Avg Price</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(
                    plans.reduce((sum, p) => sum + (pricingData[p.id]?.[pkg.id] || 0), 0) / (plans.length || 1)
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Package Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Upgrade Package</DialogTitle>
            <DialogDescription>
              Create a new upgrade package option
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Package Name *
              </label>
              <Input
                placeholder="e.g., Hardie Color-Plus Siding"
                value={newPackage.package_name}
                onChange={(e) => setNewPackage({
                  ...newPackage,
                  package_name: e.target.value
                })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Package Code *
              </label>
              <Input
                placeholder="e.g., HARDIE"
                value={newPackage.package_code}
                onChange={(e) => setNewPackage({
                  ...newPackage,
                  package_code: e.target.value.toUpperCase()
                })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Category *
              </label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={newPackage.category}
                onChange={(e) => setNewPackage({
                  ...newPackage,
                  category: e.target.value
                })}
              >
                {UPGRADE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Description
              </label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm"
                rows={3}
                placeholder="Describe what's included in this package..."
                value={newPackage.description}
                onChange={(e) => setNewPackage({
                  ...newPackage,
                  description: e.target.value
                })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Add Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpgradePackageManagementPage;
