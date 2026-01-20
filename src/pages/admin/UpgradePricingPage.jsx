import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ChevronLeft, Download, Upload, Plus, Edit2, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { getFloorPlans } from '@/services/floorPlanService';
import {
  getUpgradePackages,
  getPlanUpgradePricing,
  updateUpgradePricing
} from '@/services/pricingService';

const UpgradePricingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [pricingData, setPricingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, upgradesData] = await Promise.all([
        getFloorPlans({ is_active: true }),
        getUpgradePackages()
      ]);

      setPlans(plansData || []);
      setUpgrades(upgradesData || []);

      // Load upgrade pricing for all plans
      const pricing = {};
      for (const plan of plansData || []) {
        const planUpgrades = await getPlanUpgradePricing(plan.id);
        pricing[plan.id] = planUpgrades.reduce((acc, p) => {
          acc[p.upgrade_package_id] = p.price;
          return acc;
        }, {});
      }
      setPricingData(pricing);
    } catch (error) {
      console.error('Error loading upgrade pricing:', error);
      toast({
        title: 'Error',
        description: 'Failed to load upgrade pricing',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = async (planId, upgradeId, newValue) => {
    try {
      const value = parseFloat(newValue) || 0;
      await updateUpgradePricing(planId, upgradeId, value);
      
      setPricingData(prev => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [upgradeId]: value
        }
      }));

      toast({
        title: 'Success',
        description: 'Upgrade price updated successfully'
      });
    } catch (error) {
      console.error('Error updating upgrade price:', error);
      toast({
        title: 'Error',
        description: 'Failed to update upgrade price',
        variant: 'destructive'
      });
    }
    setEditingCell(null);
  };

  const calculateColumnTotal = (planId) => {
    const pricing = pricingData[planId] || {};
    return Object.values(pricing).reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
  };

  const calculateRowAverage = (upgradeId) => {
    let sum = 0;
    let count = 0;
    plans.forEach(plan => {
      const price = pricingData[plan.id]?.[upgradeId];
      if (price) {
        sum += parseFloat(price);
        count++;
      }
    });
    return count > 0 ? sum / count : 0;
  };

  // Group upgrades by category
  const upgradesByCategory = upgrades.reduce((acc, upgrade) => {
    if (!acc[upgrade.category]) acc[upgrade.category] = [];
    acc[upgrade.category].push(upgrade);
    return acc;
  }, {});

  const categories = Object.keys(upgradesByCategory).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pricing')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-7 h-7 text-purple-600" />
              Upgrade Package Pricing
            </h1>
            <p className="text-gray-500 mt-1">
              Category 2: Optional upgrades to base construction
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Package
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Packages</p>
                <p className="text-2xl font-bold">{upgrades.length}</p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Exterior Upgrades</p>
                <p className="text-2xl font-bold">{upgradesByCategory.exterior?.length || 0}</p>
              </div>
              <Badge variant="outline" className="text-xs">Category</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Interior Upgrades</p>
                <p className="text-2xl font-bold">{upgradesByCategory.interior?.length || 0}</p>
              </div>
              <Badge variant="outline" className="text-xs">Category</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Plans</p>
                <p className="text-2xl font-bold">{plans.length}</p>
              </div>
              <Badge variant="outline" className="text-xs">Pricing</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Packages by Category */}
      <div className="space-y-6">
        {categories.map(category => (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{category} Upgrades</CardTitle>
                <Badge variant="outline">{upgradesByCategory[category].length} packages</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50">
                    <tr className="border-b">
                      <th className="sticky left-0 bg-gray-50 p-3 text-left font-semibold w-64 border-r">
                        Package Name
                      </th>
                      <th className="p-3 text-left font-semibold w-48 border-r">
                        Package Code
                      </th>
                      {plans.map(plan => (
                        <th key={plan.id} className="p-3 text-center font-semibold min-w-[140px] border-r bg-purple-50">
                          <div className="flex flex-col items-center">
                            <span className="font-bold">{plan.plan_code}</span>
                            <span className="text-xs text-gray-500 font-normal">{plan.square_footage} sqft</span>
                          </div>
                        </th>
                      ))}
                      <th className="p-3 text-center font-semibold min-w-[120px] bg-orange-50">
                        Average
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {upgradesByCategory[category].map((upgrade, idx) => (
                      <tr 
                        key={upgrade.id} 
                        className={cn(
                          "border-b hover:bg-gray-50",
                          idx % 2 === 0 && "bg-gray-50/50"
                        )}
                      >
                        <td className="sticky left-0 bg-inherit p-3 font-medium border-r">
                          <div className="flex flex-col">
                            <span>{upgrade.package_name}</span>
                            {upgrade.description && (
                              <span className="text-xs text-gray-500">{upgrade.description}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-gray-600 border-r">
                          <Badge variant="outline">{upgrade.package_code}</Badge>
                        </td>
                        {plans.map(plan => {
                          const cellKey = `${plan.id}-${upgrade.id}`;
                          const value = pricingData[plan.id]?.[upgrade.id] || 0;
                          const isEditing = editingCell === cellKey;

                          return (
                            <td key={cellKey} className="p-1 border-r">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  step="100"
                                  defaultValue={value}
                                  onBlur={(e) => handleCellEdit(plan.id, upgrade.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCellEdit(plan.id, upgrade.id, e.target.value);
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null);
                                    }
                                  }}
                                  autoFocus
                                  className="h-9 text-center font-mono"
                                />
                              ) : (
                                <div
                                  onClick={() => setEditingCell(cellKey)}
                                  className="h-9 flex items-center justify-center cursor-pointer hover:bg-purple-100 rounded px-2 transition-colors font-mono"
                                >
                                  ${value.toLocaleString()}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3 text-center font-semibold bg-orange-50">
                          ${calculateRowAverage(upgrade.id).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upgrade Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Upgrade Package Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Exterior Upgrades</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• <strong>Hardie Siding:</strong> Upgrade from vinyl to fiber cement</li>
                <li>• Includes all necessary trim and accessories</li>
                <li>• 50-year warranty vs 25-year for vinyl</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Interior Upgrades</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• <strong>Classic Tier:</strong> Upgraded fixtures and finishes</li>
                <li>• <strong>Elegance Tier:</strong> Premium selections throughout</li>
                <li>• Varies by market (Foxcroft, Midwood, Madison, Uptown)</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> Upgrade package pricing is guaranteed once selected during contract. 
              Pricing shown is per plan and should be reviewed annually for cost adjustments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradePricingPage;
