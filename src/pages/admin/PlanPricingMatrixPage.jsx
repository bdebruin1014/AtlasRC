import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, Download, Upload, Save, Plus, ChevronLeft, 
  TrendingUp, AlertCircle, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { getFloorPlans } from '@/services/floorPlanService';
import {
  getSticksBricksLineItems,
  getPlanBasePricing,
  updatePlanPricing,
  calculatePlanTotal
} from '@/services/pricingService';

const PlanPricingMatrixPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [pricingData, setPricingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, itemsData] = await Promise.all([
        getFloorPlans({ is_active: true }),
        getSticksBricksLineItems()
      ]);

      setPlans(plansData || []);
      setLineItems(itemsData || []);

      // Load pricing for all plans
      const pricing = {};
      for (const plan of plansData || []) {
        const planPricing = await getPlanBasePricing(plan.id);
        pricing[plan.id] = planPricing.reduce((acc, p) => {
          acc[p.line_item_id] = p.base_cost;
          return acc;
        }, {});
      }
      setPricingData(pricing);
    } catch (error) {
      console.error('Error loading pricing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pricing data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = async (planId, lineItemId, newValue) => {
    try {
      const value = parseFloat(newValue) || 0;
      await updatePlanPricing(planId, lineItemId, value, null);
      
      setPricingData(prev => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [lineItemId]: value
        }
      }));

      toast({
        title: 'Success',
        description: 'Price updated successfully'
      });
    } catch (error) {
      console.error('Error updating price:', error);
      toast({
        title: 'Error',
        description: 'Failed to update price',
        variant: 'destructive'
      });
    }
    setEditingCell(null);
  };

  const calculateColumnTotal = (planId) => {
    const pricing = pricingData[planId] || {};
    return Object.values(pricing).reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
  };

  const calculateRowTotal = (lineItemId) => {
    let sum = 0;
    plans.forEach(plan => {
      sum += parseFloat(pricingData[plan.id]?.[lineItemId] || 0);
    });
    return sum;
  };

  const handleBulkUpdate = (percentage) => {
    if (!window.confirm(`Apply ${percentage}% increase to all prices?`)) return;

    const multiplier = 1 + (percentage / 100);
    const newPricing = { ...pricingData };
    
    Object.keys(newPricing).forEach(planId => {
      Object.keys(newPricing[planId]).forEach(lineItemId => {
        const currentPrice = newPricing[planId][lineItemId];
        newPricing[planId][lineItemId] = Math.round(currentPrice * multiplier * 100) / 100;
      });
    });

    setPricingData(newPricing);
    setHasChanges(true);
    toast({
      title: 'Bulk Update Applied',
      description: `${percentage}% increase applied to all prices. Save to confirm.`
    });
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    toast({
      title: 'Export Started',
      description: 'Generating Excel file...'
    });
  };

  const handleImportExcel = () => {
    // TODO: Implement Excel import
    toast({
      title: 'Import',
      description: 'Excel import coming soon'
    });
  };

  // Group line items by category
  const itemsByCategory = lineItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(itemsByCategory).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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
              <DollarSign className="w-7 h-7 text-green-600" />
              Sticks & Bricks Pricing Matrix
            </h1>
            <p className="text-gray-500 mt-1">
              Category 1: Base construction pricing across all floor plans
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportExcel}>
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
        </div>
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
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Line Items</p>
                <p className="text-2xl font-bold">{lineItems.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Plan Total</p>
                <p className="text-2xl font-bold">
                  ${Math.round(plans.reduce((sum, p) => sum + calculateColumnTotal(p.id), 0) / plans.length).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold">
                  ${plans.reduce((sum, p) => sum + calculateColumnTotal(p.id), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Bulk Price Adjustments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Apply % increase to all prices:</span>
            <Button size="sm" variant="outline" onClick={() => handleBulkUpdate(3)}>+3%</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkUpdate(5)}>+5%</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkUpdate(10)}>+10%</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkUpdate(-5)}>-5%</Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-900">Pricing Matrix Guide</p>
          <p className="text-blue-700 mt-1">
            Click any blue cell to edit pricing. Prices are saved immediately. Use scaling types (per sqft, per bathroom, etc.) 
            to automatically adjust pricing based on plan specifications.
          </p>
        </div>
      </div>

      {/* Pricing Matrix */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b-2">
                  <th className="sticky left-0 bg-gray-50 p-3 text-left font-semibold w-80 border-r">Line Item</th>
                  <th className="p-3 text-left font-semibold w-32 border-r">Category</th>
                  <th className="p-3 text-left font-semibold w-32 border-r">Scale Type</th>
                  {plans.map(plan => (
                    <th key={plan.id} className="p-3 text-center font-semibold min-w-[140px] border-r bg-blue-50">
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{plan.plan_code}</span>
                        <span className="text-xs text-gray-500 font-normal">{plan.square_footage} sqft</span>
                        <span className="text-xs text-gray-500 font-normal">{plan.bedrooms}BR / {plan.bathrooms}BA</span>
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-center font-semibold min-w-[120px] bg-orange-50">Row Total</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, catIdx) => (
                  <React.Fragment key={category}>
                    {/* Category Header */}
                    <tr className="bg-gray-100">
                      <td colSpan={3 + plans.length + 1} className="p-2 font-bold text-gray-700 uppercase text-xs">
                        {category.replace('_', ' ')}
                      </td>
                    </tr>
                    
                    {/* Line Items in Category */}
                    {itemsByCategory[category].map((item, idx) => (
                      <tr 
                        key={item.id} 
                        className={cn(
                          "border-b hover:bg-gray-50",
                          idx % 2 === 0 && "bg-gray-50/50"
                        )}
                      >
                        <td className="sticky left-0 bg-inherit p-3 font-medium border-r">
                          <div className="flex flex-col">
                            <span>{item.item_name}</span>
                            <span className="text-xs text-gray-500">{item.item_code}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600 capitalize border-r text-xs">{item.category.replace('_', ' ')}</td>
                        <td className="p-3 text-gray-600 text-xs border-r">
                          <Badge variant="outline" className="text-xs">
                            {item.scaling_type.replace('_', ' ')}
                          </Badge>
                        </td>
                        {plans.map(plan => {
                          const cellKey = `${plan.id}-${item.id}`;
                          const value = pricingData[plan.id]?.[item.id] || 0;
                          const isEditing = editingCell === cellKey;

                          return (
                            <td key={cellKey} className="p-1 border-r">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  defaultValue={value}
                                  onBlur={(e) => handleCellEdit(plan.id, item.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCellEdit(plan.id, item.id, e.target.value);
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
                                  className="h-9 flex items-center justify-center cursor-pointer hover:bg-blue-100 rounded px-2 transition-colors font-mono"
                                >
                                  ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3 text-center font-semibold bg-orange-50">
                          ${calculateRowTotal(item.id).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                
                {/* Total Row */}
                <tr className="border-t-2 bg-blue-100 font-bold sticky bottom-0">
                  <td className="sticky left-0 bg-blue-100 p-3">PLAN TOTAL (Category 1)</td>
                  <td className="p-3 border-r" colSpan={2}></td>
                  {plans.map(plan => (
                    <td key={plan.id} className="p-3 text-center border-r">
                      ${calculateColumnTotal(plan.id).toLocaleString()}
                    </td>
                  ))}
                  <td className="p-3 text-center bg-orange-100">
                    ${plans.reduce((sum, p) => sum + calculateColumnTotal(p.id), 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Pricing Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• <strong>Fixed:</strong> Same cost regardless of plan size (e.g., dumpster, permits)</p>
          <p>• <strong>Per Square Foot:</strong> Multiplied by plan square footage (e.g., lumber, roofing)</p>
          <p>• <strong>Per Bathroom:</strong> Multiplied by number of bathrooms (e.g., plumbing fixtures)</p>
          <p>• <strong>Per Garage:</strong> Based on garage type - 0 for none, 1 for single, 2 for double</p>
          <p className="mt-3 text-xs text-gray-500">All pricing changes are tracked with effective dates for historical reference.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanPricingMatrixPage;
