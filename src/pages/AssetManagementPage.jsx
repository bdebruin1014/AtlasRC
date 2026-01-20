import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Home, TrendingUp, Users, DollarSign, AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AssetManagementPage = () => {
  const navigate = useNavigate();

  const assets = [
    { 
      id: 'sunset', 
      name: 'Sunset Apartments', 
      type: 'Multifamily', 
      location: 'Denver, CO', 
      units: 120, 
      sqft: 108000,
      value: 4500000, 
      noi: 1133080,
      occupancy: 96,
      capRate: 25.2,
      status: 'performing',
      alerts: 2
    },
    { 
      id: 'downtown', 
      name: 'Downtown Office', 
      type: 'Commercial Office', 
      location: 'Austin, TX', 
      units: null,
      sqft: 35000, 
      value: 2800000, 
      noi: 427600,
      occupancy: 88,
      capRate: 15.3,
      status: 'watch',
      alerts: 1
    },
    { 
      id: 'retail-phoenix', 
      name: 'Phoenix Retail Center', 
      type: 'Retail', 
      location: 'Phoenix, AZ', 
      units: null,
      sqft: 12000, 
      value: 550000, 
      noi: 77000,
      occupancy: 92,
      capRate: 14.0,
      status: 'performing',
      alerts: 0
    },
    { 
      id: 'retail-vegas', 
      name: 'Las Vegas Retail', 
      type: 'Retail', 
      location: 'Las Vegas, NV', 
      units: null,
      sqft: 8000, 
      value: 350000, 
      noi: 48000,
      occupancy: 100,
      capRate: 13.7,
      status: 'performing',
      alerts: 0
    },
  ];

  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
  const totalNoi = assets.reduce((sum, a) => sum + a.noi, 0);
  const avgOccupancy = assets.reduce((sum, a) => sum + a.occupancy, 0) / assets.length;
  const totalAlerts = assets.reduce((sum, a) => sum + a.alerts, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Asset Management</h1>
          <p className="text-sm text-gray-500">Rental property portfolio performance & operations</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]"><Plus className="w-4 h-4 mr-1" />Add Asset</Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Portfolio Value</p>
            <Building2 className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-semibold mt-1">${(totalValue / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-green-600 mt-1">+12.5% from acquisition</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total NOI</p>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-semibold mt-1">${(totalNoi / 1000000).toFixed(2)}M</p>
          <p className="text-xs text-gray-500 mt-1">Annualized</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Avg Occupancy</p>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-semibold mt-1">{avgOccupancy.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Across all assets</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Blended Cap Rate</p>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-semibold mt-1">20.5%</p>
          <p className="text-xs text-gray-500 mt-1">NOI / Cost basis</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Active Alerts</p>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-semibold mt-1 text-red-600">{totalAlerts}</p>
          <p className="text-xs text-gray-500 mt-1">Requires attention</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search assets..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">All Types</Button>
          <Button variant="outline" size="sm">Performing</Button>
          <Button variant="outline" size="sm">Watch List</Button>
        </div>
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-2 gap-4">
        {assets.map((asset) => (
          <div 
            key={asset.id}
            onClick={() => navigate(`/assets/${asset.id}`)}
            className="bg-white border rounded-lg p-5 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                    {asset.alerts > 0 && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{asset.alerts} alerts</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-3 h-3" />{asset.location}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${asset.status === 'performing' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {asset.status === 'performing' ? '★★★★★' : '★★★★☆'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Value</p>
                <p className="text-lg font-semibold">${(asset.value / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">NOI</p>
                <p className="text-lg font-semibold text-[#047857]">${(asset.noi / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Occupancy</p>
                <p className="text-lg font-semibold">{asset.occupancy}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Cap Rate</p>
                <p className="text-lg font-semibold">{asset.capRate}%</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
              <span className="text-gray-500">{asset.type} • {asset.units ? `${asset.units} units` : `${asset.sqft.toLocaleString()} SF`}</span>
              <Button variant="link" className="text-[#047857] p-0 h-auto">View Details →</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetManagementPage;
