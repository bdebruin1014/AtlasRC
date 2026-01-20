import React from 'react';
import { 
  DollarSign, Home, Building2, Package, FileSpreadsheet, 
  MapPin, Settings, AlertCircle, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PricingLibraryPage = () => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: 'Plan Pricing Matrix',
      description: 'Manage itemized pricing for all floor plans',
      icon: FileSpreadsheet,
      color: 'bg-blue-500',
      path: '/admin/pricing/plans',
      stats: 'Pricing Matrix'
    },
    {
      title: 'Municipality Fees',
      description: 'Configure tap fees and permits by jurisdiction',
      icon: MapPin,
      color: 'bg-green-500',
      path: '/admin/pricing/municipalities',
      stats: 'Fee Schedules'
    },
    {
      title: 'Upgrade Packages',
      description: 'Manage upgrade options and pricing',
      icon: Package,
      color: 'bg-purple-500',
      path: '/admin/pricing/upgrades',
      stats: 'Packages'
    },
    {
      title: 'Soft Cost Templates',
      description: 'Configure default soft cost line items',
      icon: Settings,
      color: 'bg-orange-500',
      path: '/admin/pricing/soft-costs',
      stats: 'Templates'
    },
    {
      title: 'Lot Prep Templates',
      description: 'Configure default lot preparation costs',
      icon: Building2,
      color: 'bg-teal-500',
      path: '/admin/pricing/lot-prep',
      stats: 'Templates'
    },
    {
      title: 'Floor Plan Library',
      description: 'Manage floor plan specifications',
      icon: Home,
      color: 'bg-indigo-500',
      path: '/admin/plans',
      stats: 'Floor Plans'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pricing Library</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage construction pricing, floor plans, and cost templates
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">22</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Active floor plans</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Municipalities</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Fee schedules configured</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Upgrade Packages</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">11</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Available options</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Last Updated</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">Today</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Pricing data</p>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <div
              key={link.path}
              className="bg-white rounded-lg border hover:shadow-lg transition-shadow cursor-pointer group p-6"
              onClick={() => navigate(link.path)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{link.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">{link.stats}</span>
                <span className="text-sm text-blue-600">View →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity / Info Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Pricing Structure</h3>
            <p className="text-sm text-gray-500 mt-1">7-Category Contract Budget Format</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {[
                { category: '1. Sticks & Bricks', type: 'Guaranteed', color: 'text-green-600' },
                { category: '2. Upgrades to Base Construction', type: 'Guaranteed', color: 'text-green-600' },
                { category: '3. Lot Preparation', type: 'Estimate (Min $15,000)', color: 'text-blue-600' },
                { category: '4. Site-Specific Adjustments', type: 'Estimate', color: 'text-blue-600' },
                { category: '5. Soft Costs', type: 'Estimate (Min $15,000)', color: 'text-blue-600' },
                { category: '6. Contingency', type: 'MIN($10,000, 5%)', color: 'text-purple-600' },
                { category: '7. Builder Fee', type: 'Fixed $25,000', color: 'text-orange-600' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className={`text-xs font-semibold ${item.color}`}>{item.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Important Notes</h3>
            <p className="text-sm text-gray-500 mt-1">Pricing guidelines and rules</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Minimum Requirements</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Lot Preparation and Soft Costs each have a $15,000 minimum
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Contingency Calculation</p>
                  <p className="text-xs text-green-700 mt-1">
                    Lower of $10,000 or 5% of categories 1-5 combined
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Pricing Updates</p>
                  <p className="text-xs text-purple-700 mt-1">
                    All changes are tracked with effective dates for historical reference
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingLibraryPage;
