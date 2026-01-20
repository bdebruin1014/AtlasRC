import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Save, X, Home, DollarSign, Ruler, User, Calendar, CheckCircle, Clock, AlertTriangle, Camera, FileText, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const UnitDetailsPage = ({ projectId, unitId }) => {
  const [currentUnit, setCurrentUnit] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'construction', 'sales', 'financials'

  const units = [
    {
      id: 'unit-1',
      name: 'Unit 1',
      address: '1250 Oakridge Dr, Unit 1',
      model: 'The Ashford',
      sqft: 2200,
      bedrooms: 3,
      bathrooms: 2.5,
      garage: '2-car',
      lot: 'Lot 1',
      lotSize: '0.35 acres',
      constructionStatus: 'complete',
      constructionProgress: 100,
      coDate: '2024-12-15',
      salesStatus: 'sold',
      listPrice: 425000,
      contractPrice: 420000,
      buyer: 'Michael & Sarah Thompson',
      buyerEmail: 'thompson@email.com',
      buyerPhone: '(555) 111-2222',
      contractDate: '2024-10-15',
      closingDate: '2024-12-20',
      agent: 'Sarah Agent',
      lender: 'First Mortgage Corp',
      costs: { land: 100000, construction: 285000, soft: 15000, total: 400000 },
      features: ['Granite Countertops', 'Stainless Appliances', 'Hardwood Floors', 'Covered Patio'],
    },
    {
      id: 'unit-2',
      name: 'Unit 2',
      address: '1250 Oakridge Dr, Unit 2',
      model: 'The Brookfield',
      sqft: 2400,
      bedrooms: 4,
      bathrooms: 3,
      garage: '2-car',
      lot: 'Lot 2',
      lotSize: '0.38 acres',
      constructionStatus: 'in-progress',
      constructionProgress: 85,
      coDate: null,
      salesStatus: 'under-contract',
      listPrice: 395000,
      contractPrice: 385000,
      buyer: 'Jennifer Martinez',
      buyerEmail: 'jmartinez@email.com',
      buyerPhone: '(555) 333-4444',
      contractDate: '2024-11-20',
      closingDate: '2025-01-25',
      agent: 'Sarah Agent',
      lender: 'Bank of America',
      costs: { land: 100000, construction: 265000, soft: 12000, total: 377000 },
      features: ['Quartz Countertops', 'Stainless Appliances', 'LVP Flooring', 'Screened Porch'],
    },
    {
      id: 'unit-3',
      name: 'Unit 3',
      address: '1250 Oakridge Dr, Unit 3',
      model: 'The Ashford',
      sqft: 2200,
      bedrooms: 3,
      bathrooms: 2.5,
      garage: '2-car',
      lot: 'Lot 3',
      lotSize: '0.32 acres',
      constructionStatus: 'in-progress',
      constructionProgress: 70,
      coDate: null,
      salesStatus: 'available',
      listPrice: 415000,
      contractPrice: null,
      buyer: null,
      buyerEmail: null,
      buyerPhone: null,
      contractDate: null,
      closingDate: null,
      agent: 'Sarah Agent',
      lender: null,
      costs: { land: 100000, construction: 245000, soft: 10000, total: 355000 },
      features: ['Granite Countertops', 'Stainless Appliances', 'Hardwood Floors', 'Covered Patio'],
    },
  ];

  const unit = units[currentUnit];

  const getStatusColor = (status) => {
    switch (status) {
      case 'sold': case 'complete': return 'bg-green-100 text-green-700';
      case 'under-contract': case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'available': case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '-';
    return `$${value.toLocaleString()}`;
  };

  const constructionMilestones = [
    { name: 'Foundation', status: 'complete', date: '2024-06-15' },
    { name: 'Framing', status: 'complete', date: '2024-08-20' },
    { name: 'Roofing', status: 'complete', date: '2024-09-15' },
    { name: 'MEP Rough', status: unit.constructionProgress >= 70 ? 'complete' : 'in-progress', date: '2024-10-30' },
    { name: 'Insulation', status: unit.constructionProgress >= 75 ? 'complete' : 'pending', date: null },
    { name: 'Drywall', status: unit.constructionProgress >= 80 ? 'complete' : 'pending', date: null },
    { name: 'Interior Finishes', status: unit.constructionProgress >= 90 ? 'complete' : 'pending', date: null },
    { name: 'Final/CO', status: unit.constructionProgress === 100 ? 'complete' : 'pending', date: unit.coDate },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentUnit(prev => Math.max(0, prev - 1))}
              disabled={currentUnit === 0}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500">Unit {currentUnit + 1} of {units.length}</span>
            <button 
              onClick={() => setCurrentUnit(prev => Math.min(units.length - 1, prev + 1))}
              disabled={currentUnit === units.length - 1}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div>
            <h1 className="text-xl font-semibold">{unit.name} - {unit.model}</h1>
            <p className="text-sm text-gray-500">{unit.address}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Camera className="w-4 h-4 mr-1" />Photos</Button>
          <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-1" />Documents</Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit2 className="w-4 h-4 mr-1" />Edit
          </Button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-3 mb-6">
        <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(unit.constructionStatus))}>
          Construction: {unit.constructionStatus.replace('-', ' ')}
        </span>
        <span className={cn("px-3 py-1 rounded text-sm capitalize", getStatusColor(unit.salesStatus))}>
          Sales: {unit.salesStatus.replace('-', ' ')}
        </span>
        {unit.constructionProgress < 100 && (
          <span className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-700">
            {unit.constructionProgress}% Complete
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('overview')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'overview' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Overview
        </button>
        <button onClick={() => setActiveTab('construction')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'construction' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Construction
        </button>
        <button onClick={() => setActiveTab('sales')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'sales' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Sales
        </button>
        <button onClick={() => setActiveTab('financials')} className={cn("px-4 py-2 rounded-lg text-sm font-medium", activeTab === 'financials' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}>
          Financials
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Unit Specs */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Home className="w-4 h-4" />Unit Specifications</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">{unit.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Square Feet</p>
                  <p className="font-medium">{unit.sqft.toLocaleString()} SF</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="font-medium">{unit.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="font-medium">{unit.bathrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Garage</p>
                  <p className="font-medium">{unit.garage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lot</p>
                  <p className="font-medium">{unit.lot}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lot Size</p>
                  <p className="font-medium">{unit.lotSize}</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Features & Upgrades</h3>
              <div className="flex flex-wrap gap-2">
                {unit.features.map((feature, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{feature}</span>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#047857]">{unit.constructionProgress}%</p>
                <p className="text-xs text-gray-500">Construction</p>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{formatCurrency(unit.listPrice)}</p>
                <p className="text-xs text-gray-500">List Price</p>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{formatCurrency(unit.costs.total)}</p>
                <p className="text-xs text-gray-500">Total Cost</p>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {unit.contractPrice ? formatCurrency(unit.contractPrice - unit.costs.total) : '-'}
                </p>
                <p className="text-xs text-gray-500">Profit</p>
              </div>
            </div>
          </div>

          {/* Right Column - Buyer/Status */}
          <div className="space-y-6">
            {unit.buyer && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4" />Buyer Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Buyer</p>
                    <p className="font-medium">{unit.buyer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-[#047857]">{unit.buyerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{unit.buyerPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lender</p>
                    <p className="font-medium">{unit.lender}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" />Key Dates</h3>
              <div className="space-y-3">
                {unit.contractDate && (
                  <div>
                    <p className="text-sm text-gray-500">Contract Date</p>
                    <p className="font-medium">{unit.contractDate}</p>
                  </div>
                )}
                {unit.closingDate && (
                  <div>
                    <p className="text-sm text-gray-500">Closing Date</p>
                    <p className="font-medium">{unit.closingDate}</p>
                  </div>
                )}
                {unit.coDate && (
                  <div>
                    <p className="text-sm text-gray-500">CO Date</p>
                    <p className="font-medium">{unit.coDate}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Construction Tab */}
      {activeTab === 'construction' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Wrench className="w-4 h-4" />Construction Milestones</h3>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span className="font-medium">{unit.constructionProgress}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#047857] rounded-full transition-all"
                    style={{ width: `${unit.constructionProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                {constructionMilestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {milestone.status === 'complete' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : milestone.status === 'in-progress' ? (
                      <Clock className="w-5 h-5 text-blue-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    )}
                    <div className="flex-1">
                      <p className={cn("font-medium", milestone.status === 'complete' && "text-gray-500")}>{milestone.name}</p>
                    </div>
                    <span className="text-sm text-gray-500">{milestone.date || '-'}</span>
                    <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getStatusColor(milestone.status))}>
                      {milestone.status.replace('-', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Construction Costs</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Land</span>
                  <span className="font-medium">{formatCurrency(unit.costs.land)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Hard Costs</span>
                  <span className="font-medium">{formatCurrency(unit.costs.construction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Soft Costs</span>
                  <span className="font-medium">{formatCurrency(unit.costs.soft)}</span>
                </div>
                <div className="pt-3 border-t flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(unit.costs.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Pricing</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">List Price</p>
                <p className="text-2xl font-bold">{formatCurrency(unit.listPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price per SF</p>
                <p className="font-medium">${(unit.listPrice / unit.sqft).toFixed(0)}/SF</p>
              </div>
              {unit.contractPrice && (
                <div>
                  <p className="text-sm text-gray-500">Contract Price</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(unit.contractPrice)}</p>
                </div>
              )}
            </div>
          </div>

          {unit.buyer && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Contract Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Buyer</p>
                  <p className="font-medium">{unit.buyer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contract Date</p>
                  <p className="font-medium">{unit.contractDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Closing Date</p>
                  <p className="font-medium">{unit.closingDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Listing Agent</p>
                  <p className="font-medium">{unit.agent}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Financials Tab */}
      {activeTab === 'financials' && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Unit P&L</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-3 font-medium">Revenue</td>
                <td className="py-3 text-right">{formatCurrency(unit.contractPrice || unit.listPrice)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pl-4 text-gray-500">Land Cost</td>
                <td className="py-3 text-right text-red-600">({formatCurrency(unit.costs.land)})</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pl-4 text-gray-500">Hard Costs</td>
                <td className="py-3 text-right text-red-600">({formatCurrency(unit.costs.construction)})</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pl-4 text-gray-500">Soft Costs</td>
                <td className="py-3 text-right text-red-600">({formatCurrency(unit.costs.soft)})</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 font-medium">Total Costs</td>
                <td className="py-3 text-right font-medium text-red-600">({formatCurrency(unit.costs.total)})</td>
              </tr>
              <tr className="bg-green-50">
                <td className="py-3 font-semibold">Gross Profit</td>
                <td className="py-3 text-right font-semibold text-green-600">
                  {formatCurrency((unit.contractPrice || unit.listPrice) - unit.costs.total)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Margin</td>
                <td className="py-3 text-right font-medium">
                  {(((unit.contractPrice || unit.listPrice) - unit.costs.total) / (unit.contractPrice || unit.listPrice) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UnitDetailsPage;
