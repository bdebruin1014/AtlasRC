import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Copy, Home, Ruler, BedDouble, Bath, DollarSign, 
  Image, Layers, ChevronRight, ChevronDown, Upload, RefreshCw, 
  TrendingUp, Percent, Building2, Package, Settings, Filter,
  CheckSquare, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getFloorPlans } from '@/services/floorPlanService';

const HomePlanLibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [selectedPlansForBulk, setSelectedPlansForBulk] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFloorPlans();
      console.log('Loaded floor plans:', data);
      
      // Transform to match component format
      const transformedPlans = data.map((plan, idx) => ({
        id: plan.id,
        name: plan.plan_name,
        sqft: plan.square_footage,
        beds: plan.bedrooms,
        baths: plan.bathrooms,
        garage: plan.garage_type === 'none' ? 0 : plan.garage_type === '1-car' ? 1 : 2,
        stories: plan.stories,
        basePrice: plan.base_price || 0,
        buildCost: Math.round((plan.base_price || 0) * 0.77), // Estimate build cost at 77%
        margin: 22.5,
        elevations: ['A', 'B'],
        status: plan.is_active ? 'Active' : 'Inactive',
        lastUpdated: new Date().toISOString().split('T')[0],
        projectsUsing: 0,
        image: '/api/placeholder/400/300'
      }));
      console.log('Transformed plans:', transformedPlans);
      setPlans(transformedPlans);
      setLoading(false);
    } catch (error) {
      console.error('Error loading floor plans:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const budgetCategories = [
    { name: 'Site Work', cost: 18500, pct: 6.2 },
    { name: 'Foundation', cost: 24500, pct: 8.2 },
    { name: 'Framing', cost: 52000, pct: 17.4 },
    { name: 'Roofing', cost: 14500, pct: 4.9 },
    { name: 'Plumbing', cost: 22000, pct: 7.4 },
    { name: 'Electrical', cost: 18500, pct: 6.2 },
    { name: 'HVAC', cost: 16000, pct: 5.4 },
    { name: 'Insulation', cost: 8500, pct: 2.8 },
    { name: 'Drywall', cost: 15500, pct: 5.2 },
    { name: 'Interior Finishes', cost: 45000, pct: 15.1 },
    { name: 'Exterior Finishes', cost: 28000, pct: 9.4 },
    { name: 'Appliances', cost: 12000, pct: 4.0 },
    { name: 'Landscaping', cost: 8500, pct: 2.8 },
    { name: 'Soft Costs', cost: 15000, pct: 5.0 },
  ];

  const addOns = [
    { id: 1, name: 'Covered Patio Extension', category: 'Outdoor', cost: 8500, price: 12500, popular: true },
    { id: 2, name: 'Third Car Garage', category: 'Garage', cost: 18000, price: 25000, popular: false },
    { id: 3, name: 'Gourmet Kitchen Package', category: 'Interior', cost: 12000, price: 18500, popular: true },
    { id: 4, name: 'Premium Flooring Upgrade', category: 'Interior', cost: 6500, price: 9500, popular: true },
    { id: 5, name: 'Smart Home Package', category: 'Technology', cost: 4500, price: 7500, popular: true },
    { id: 6, name: 'Extended Primary Suite', category: 'Interior', cost: 15000, price: 22000, popular: false },
    { id: 7, name: 'Outdoor Kitchen', category: 'Outdoor', cost: 12000, price: 18000, popular: false },
    { id: 8, name: 'Upgraded Lighting Package', category: 'Interior', cost: 3500, price: 5500, popular: true },
    { id: 9, name: 'Tankless Water Heater', category: 'Plumbing', cost: 2200, price: 3500, popular: true },
    { id: 10, name: 'Spray Foam Insulation', category: 'Insulation', cost: 4500, price: 6500, popular: false },
  ];

  const dimensions = [
    { room: 'Great Room', width: '18\'', length: '22\'', sqft: 396 },
    { room: 'Primary Bedroom', width: '15\'', length: '18\'', sqft: 270 },
    { room: 'Primary Bath', width: '12\'', length: '14\'', sqft: 168 },
    { room: 'Kitchen', width: '14\'', length: '16\'', sqft: 224 },
    { room: 'Dining Room', width: '12\'', length: '14\'', sqft: 168 },
    { room: 'Bedroom 2', width: '12\'', length: '13\'', sqft: 156 },
    { room: 'Bedroom 3', width: '11\'', length: '12\'', sqft: 132 },
    { room: 'Bedroom 4', width: '11\'', length: '12\'', sqft: 132 },
    { room: 'Garage', width: '20\'', length: '22\'', sqft: 440 },
  ];

  const bulkUpdateCategories = [
    { name: 'All Categories', count: 14 },
    { name: 'Framing', count: 18, vendor: 'ABC Lumber' },
    { name: 'Plumbing', count: 14, vendor: 'Pro Plumbing' },
    { name: 'Electrical', count: 16, vendor: 'Sparks Electric' },
    { name: 'HVAC', count: 10, vendor: 'Cool Air Systems' },
    { name: 'Roofing', count: 8, vendor: 'Top Roofing Co' },
    { name: 'Interior Finishes', count: 22, vendor: 'Multiple' },
  ];

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading floor plans...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-600 inline mr-2" />
          <span className="text-red-800">Error loading floor plans: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Home Plan Library</h1>
          <p className="text-sm text-gray-500">Manage floor plans, budgets, and pricing options</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkUpdate(!showBulkUpdate)}>
            <RefreshCw className="w-4 h-4 mr-2" />Bulk Update Pricing
          </Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />Add Plan
          </Button>
        </div>
      </div>

      {/* Bulk Update Panel */}
      {showBulkUpdate && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Bulk Budget Update
              </h3>
              <p className="text-sm text-amber-700 mt-1">Update pricing across all plans by category or vendor</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowBulkUpdate(false)}>×</Button>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Update Type</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm">
                <option>By Category</option>
                <option>By Vendor</option>
                <option>All Line Items</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Category/Vendor</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm">
                {bulkUpdateCategories.map((c, i) => (
                  <option key={i}>{c.name} ({c.count} items)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Adjustment</label>
              <div className="flex gap-2">
                <select className="w-20 border rounded-md px-2 py-2 text-sm">
                  <option>+</option>
                  <option>-</option>
                </select>
                <Input type="number" placeholder="5" className="flex-1" />
                <select className="w-16 border rounded-md px-2 py-2 text-sm">
                  <option>%</option>
                  <option>$</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Apply To</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm">
                <option>All Plans ({plans.length})</option>
                <option>Selected Plans ({selectedPlansForBulk.length})</option>
                <option>Active Plans Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-amber-700">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                This will update {plans.length} plans and {plans.length * 14} budget line items
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="w-4 h-4 mr-1" />Preview Changes
              </Button>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                <CheckSquare className="w-4 h-4 mr-1" />Apply Update
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{plans.length}</p>
          <p className="text-sm text-gray-500">Total Plans</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{plans.filter(p => p.status === 'Active').length}</p>
          <p className="text-sm text-gray-500">Active Plans</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{plans.reduce((s, p) => s + p.projectsUsing, 0)}</p>
          <p className="text-sm text-gray-500">Projects Using</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{addOns.length}</p>
          <p className="text-sm text-gray-500">Add-On Options</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">
            {plans.length > 0 ? (plans.reduce((s, p) => s + p.margin, 0) / plans.length).toFixed(1) : 0}%
          </p>
          <p className="text-sm text-gray-500">Avg Margin</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Plans List */}
        <div className="col-span-1 bg-white border rounded-lg">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search plans..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Loading floor plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Home className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No floor plans found</p>
              </div>
            ) : (
              plans.map((plan) => (
              <div 
                key={plan.id} 
                className={cn(
                  "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                  selectedPlan?.id === plan.id && "bg-green-50 border-l-4 border-l-[#047857]"
                )}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="flex gap-3">
                  <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    <Home className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{plan.name}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs",
                        plan.status === 'Active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      )}>{plan.status}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{plan.sqft.toLocaleString()} sqft</span>
                      <span>•</span>
                      <span>{plan.beds} bd</span>
                      <span>•</span>
                      <span>{plan.baths} ba</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-medium text-green-700">{formatCurrency(plan.basePrice)}</span>
                      <span className="text-xs text-gray-400">{plan.projectsUsing} projects</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        {/* Plan Details */}
        <div className="col-span-2">
          {selectedPlan ? (
            <div className="bg-white border rounded-lg">
              {/* Plan Header */}
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{selectedPlan.name}</h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Ruler className="w-4 h-4" />{selectedPlan.sqft.toLocaleString()} sqft</span>
                      <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" />{selectedPlan.beds} beds</span>
                      <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{selectedPlan.baths} baths</span>
                      <span>{selectedPlan.stories} story</span>
                      <span>{selectedPlan.garage} car garage</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
                    <Button variant="outline" size="sm"><Copy className="w-4 h-4 mr-1" />Duplicate</Button>
                  </div>
                </div>
                
                {/* Pricing Summary */}
                <div className="grid grid-cols-4 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Base Price</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(selectedPlan.basePrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Build Cost</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedPlan.buildCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Gross Margin</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedPlan.basePrice - selectedPlan.buildCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Margin %</p>
                    <p className="text-lg font-bold text-green-600">{selectedPlan.margin}%</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b">
                <div className="flex">
                  {['details', 'budget', 'addons', 'elevations'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize",
                        activeTab === tab 
                          ? "border-[#047857] text-[#047857]" 
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {tab === 'addons' ? 'Add-Ons' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 max-h-[400px] overflow-y-auto">
                {activeTab === 'details' && (
                  <div>
                    <h3 className="font-semibold mb-3">Room Dimensions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {dimensions.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{d.room}</span>
                          <span className="text-gray-500 text-sm">{d.width} × {d.length} ({d.sqft} sqft)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'budget' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Budget Breakdown</h3>
                      <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1" />Edit Budget</Button>
                    </div>
                    <div className="space-y-2">
                      {budgetCategories.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-500">
                              {cat.pct}%
                            </div>
                            <span>{cat.name}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(cat.cost)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg mt-4 font-bold">
                      <span>Total Build Cost</span>
                      <span>{formatCurrency(selectedPlan.buildCost)}</span>
                    </div>
                  </div>
                )}

                {activeTab === 'addons' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Available Add-Ons & Options</h3>
                      <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" />Add Option</Button>
                    </div>
                    <div className="space-y-2">
                      {addOns.map((addon) => (
                        <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{addon.name}</span>
                                {addon.popular && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">Popular</span>}
                              </div>
                              <span className="text-xs text-gray-500">{addon.category}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-700">{formatCurrency(addon.price)}</p>
                            <p className="text-xs text-gray-500">Cost: {formatCurrency(addon.cost)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'elevations' && (
                  <div>
                    <h3 className="font-semibold mb-3">Available Elevations</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedPlan.elevations.map((elev, i) => (
                        <div key={i} className="border rounded-lg overflow-hidden">
                          <div className="h-32 bg-gray-200 flex items-center justify-center">
                            <Image className="w-12 h-12 text-gray-400" />
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium">Elevation {elev}</h4>
                            <p className="text-xs text-gray-500">
                              {elev === 'A' ? 'Craftsman Style' : elev === 'B' ? 'Traditional' : elev === 'C' ? 'Modern Farmhouse' : 'Contemporary'}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="border-2 border-dashed rounded-lg flex items-center justify-center h-48 text-gray-400 hover:text-gray-500 hover:border-gray-400 cursor-pointer transition-colors">
                        <div className="text-center">
                          <Plus className="w-8 h-8 mx-auto mb-2" />
                          <span className="text-sm">Add Elevation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50 flex items-center justify-between text-sm text-gray-500">
                <span>Last updated: {selectedPlan.lastUpdated}</span>
                <span>Used in {selectedPlan.projectsUsing} active projects</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-12 text-center text-gray-500">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a Plan</h3>
              <p className="text-sm">Choose a floor plan from the list to view details, budget breakdown, and add-on options</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePlanLibraryPage;
