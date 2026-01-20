import React, { useState, useEffect } from 'react';
import { 
  Download, Upload, RefreshCw, Plus, Filter, Search,
  Save, X, Edit2, Copy, TrendingUp, AlertCircle, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getFloorPlans } from '@/services/floorPlanService';
import { 
  getSticksBricksLineItems, 
  getPlanBasePricing, 
  updatePlanPricing 
} from '@/services/pricingService';
import { cn } from '@/lib/utils';

const PlanPricingMatrixPage = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [pricingData, setPricingData] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkUpdate, setBulkUpdate] = useState({
    type: 'percentage',
    value: '',
    category: 'all',
    plans: 'all'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, lineItemsData] = await Promise.all([
        getFloorPlans({ is_active: true }),
        getSticksBricksLineItems()
      ]);

      setPlans(plansData);
      setLineItems(lineItemsData);

      // Load pricing for all plans
      const pricingMap = {};
      for (const plan of plansData) {
        const pricing = await getPlanBasePricing(plan.id);
        pricingMap[plan.id] = pricing.reduce((acc, item) => {
          acc[item.line_item_id] = item.base_cost;
          return acc;
        }, {});
      }
      setPricingData(pricingMap);
    } catch (error) {
      console.error('Error loading data:', error);
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
      const numericValue = parseFloat(newValue) || 0;
      await updatePlanPricing(planId, lineItemId, numericValue);
      
      setPricingData(prev => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [lineItemId]: numericValue
        }
      }));

      toast({
        title: 'Success',
        description: 'Pricing updated successfully'
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

  const calculatePlanTotal = (planId) => {
    const planPricing = pricingData[planId] || {};
    return lineItems.reduce((sum, item) => {
      return sum + (parseFloat(planPricing[item.id]) || 0);
    }, 0);
  };

  const calculateLineItemTotal = (lineItemId) => {
    return plans.reduce((sum, plan) => {
      const planPricing = pricingData[plan.id] || {};
      return sum + (parseFloat(planPricing[lineItemId]) || 0);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return plans.reduce((sum, plan) => sum + calculatePlanTotal(plan.id), 0);
  };

  const handleBulkUpdate = async () => {
    try {
      const updateValue = parseFloat(bulkUpdate.value);
      if (isNaN(updateValue)) {
        toast({
          title: 'Error',
          description: 'Please enter a valid number',
          variant: 'destructive'
        });
        return;
      }

      // Determine which plans to update
      const plansToUpdate = bulkUpdate.plans === 'all' 
        ? plans 
        : plans.filter(p => p.plan_type === bulkUpdate.plans);

      // Determine which line items to update
      const itemsToUpdate = bulkUpdate.category === 'all'
        ? lineItems
        : lineItems.filter(item => item.category === bulkUpdate.category);

      let updateCount = 0;
      for (const plan of plansToUpdate) {
        for (const lineItem of itemsToUpdate) {
          const currentPrice = pricingData[plan.id]?.[lineItem.id] || 0;
          let newPrice;

          if (bulkUpdate.type === 'percentage') {
            newPrice = currentPrice * (1 + updateValue / 100);
          } else {
            newPrice = currentPrice + updateValue;
          }

          await updatePlanPricing(plan.id, lineItem.id, newPrice);
          updateCount++;
        }
      }

      await loadData(); // Reload all data

      toast({
        title: 'Success',
        description: `Updated ${updateCount} pricing entries`
      });

      setShowBulkUpdate(false);
      setBulkUpdate({ type: 'percentage', value: '', category: 'all', plans: 'all' });
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete bulk update',
        variant: 'destructive'
      });
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

  // Group line items by category
  const groupedLineItems = lineItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading pricing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plan Pricing Matrix</h1>
            <p className="text-sm text-gray-500 mt-1">
              Sticks & Bricks itemized pricing across all floor plans
            </p>
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowBulkUpdate(!showBulkUpdate)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Bulk Update
            </Button>
          </div>
        </div>

        {/* Bulk Update Panel */}
        {showBulkUpdate && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-amber-900">Bulk Price Update</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Apply percentage or fixed amount changes across multiple items
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowBulkUpdate(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-5 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Update Type
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={bulkUpdate.type}
                  onChange={(e) => setBulkUpdate({ ...bulkUpdate, type: e.target.value })}
                >
                  <option value="percentage">Percentage Change</option>
                  <option value="amount">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  {bulkUpdate.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={bulkUpdate.type === 'percentage' ? '5.0' : '500'}
                  value={bulkUpdate.value}
                  onChange={(e) => setBulkUpdate({ ...bulkUpdate, value: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Category
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={bulkUpdate.category}
                  onChange={(e) => setBulkUpdate({ ...bulkUpdate, category: e.target.value })}
                >
                  <option value="all">All Categories</option>
                  {Object.keys(groupedLineItems).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Apply To Plans
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={bulkUpdate.plans}
                  onChange={(e) => setBulkUpdate({ ...bulkUpdate, plans: e.target.value })}
                >
                  <option value="all">All Plans</option>
                  <option value="single_family">Single Family Only</option>
                  <option value="townhome">Townhome Only</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  onClick={handleBulkUpdate}
                >
                  Apply Update
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500 font-medium">Total Plans</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{plans.length}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500 font-medium">Line Items</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{lineItems.length}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500 font-medium">Grand Total</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(calculateGrandTotal())}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500 font-medium">Avg per Plan</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {formatCurrency(calculateGrandTotal() / (plans.length || 1))}
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Matrix */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 border-r min-w-[250px]">
                  Line Item
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
                <th className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[120px] bg-gray-100">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedLineItems).map(([category, items]) => (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr className="bg-gray-100">
                    <td 
                      colSpan={plans.length + 2}
                      className="sticky left-0 px-4 py-2 font-semibold text-gray-900 uppercase text-xs tracking-wide"
                    >
                      {category}
                    </td>
                  </tr>
                  {/* Line Items */}
                  {items.map((lineItem, idx) => (
                    <tr 
                      key={lineItem.id}
                      className={cn(
                        "hover:bg-blue-50 transition-colors",
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      )}
                    >
                      <td className="sticky left-0 bg-inherit px-4 py-2 border-r font-medium text-gray-700">
                        <div>
                          <div className="font-medium">{lineItem.item_name}</div>
                          <div className="text-xs text-gray-500">
                            {lineItem.item_code} • {lineItem.scaling_type}
                          </div>
                        </div>
                      </td>
                      {plans.map(plan => {
                        const cellKey = `${plan.id}-${lineItem.id}`;
                        const value = pricingData[plan.id]?.[lineItem.id] || 0;
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
                                onBlur={(e) => handleCellEdit(plan.id, lineItem.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCellEdit(plan.id, lineItem.id, e.target.value);
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
                      <td className="px-4 py-2 text-center font-semibold bg-gray-100 text-gray-700">
                        {formatCurrency(calculateLineItemTotal(lineItem.id))}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {/* Total Row */}
              <tr className="bg-green-50 font-bold border-t-2">
                <td className="sticky left-0 bg-green-50 px-4 py-3 text-gray-900">
                  TOTAL STICKS & BRICKS
                </td>
                {plans.map(plan => (
                  <td 
                    key={plan.id}
                    className="px-4 py-3 text-center text-green-700 border-r"
                  >
                    {formatCurrency(calculatePlanTotal(plan.id))}
                  </td>
                ))}
                <td className="px-4 py-3 text-center text-green-700 bg-green-100">
                  {formatCurrency(calculateGrandTotal())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">How to use this matrix:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Click any cell to edit the price for that plan/line item combination</li>
              <li>Press Enter to save or Escape to cancel</li>
              <li>Use Bulk Update to apply percentage or fixed amount changes across categories</li>
              <li>Export to Excel to work offline and import back when done</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanPricingMatrixPage;
