import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Percent, Edit2, Save, Download, RefreshCw, ChevronDown, ChevronRight, Plus, X, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ProformaPage = ({ projectId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['revenue', 'costs', 'financing']);
  const [showVersions, setShowVersions] = useState(false);

  const [proforma, setProforma] = useState({
    version: 'v3.2',
    lastUpdated: '2024-12-20',
    lockedDate: null,
    
    // Revenue
    revenue: {
      units: [
        { id: 1, type: 'Type A - 3BR/2BA', count: 4, sqft: 1800, pricePerSqft: 325, salePrice: 585000 },
        { id: 2, type: 'Type B - 4BR/2.5BA', count: 4, sqft: 2200, pricePerSqft: 310, salePrice: 682000 },
        { id: 3, type: 'Type C - 4BR/3BA', count: 4, sqft: 2600, pricePerSqft: 295, salePrice: 767000 },
      ],
      otherIncome: [
        { description: 'Lot Premiums', amount: 120000 },
        { description: 'Upgrade Packages', amount: 85000 },
      ],
    },
    
    // Costs
    costs: {
      land: {
        purchasePrice: 2500000,
        closingCosts: 75000,
        dueDiligence: 25000,
        carryingCosts: 45000,
      },
      hardCosts: {
        sitework: 450000,
        foundation: 380000,
        framing: 720000,
        mechanicals: 540000,
        exteriorFinishes: 320000,
        interiorFinishes: 680000,
        landscaping: 180000,
        contingency: 328000,
      },
      softCosts: {
        architecture: 185000,
        engineering: 95000,
        permits: 120000,
        insurance: 85000,
        legal: 45000,
        marketing: 125000,
        realtorCommissions: 488400,
        miscellaneous: 75000,
      },
    },
    
    // Financing
    financing: {
      constructionLoan: {
        amount: 5800000,
        interestRate: 8.5,
        term: 24,
        originationFee: 1.0,
        interestReserve: 450000,
      },
      equity: {
        developerEquity: 1800000,
        investorEquity: 700000,
      },
    },
    
    // Timeline
    timeline: {
      acquisitionDate: '2024-01-15',
      constructionStart: '2024-03-01',
      constructionEnd: '2024-12-31',
      selloutDate: '2025-06-30',
      totalMonths: 18,
    },
  });

  const versions = [
    { id: 'v3.2', date: '2024-12-20', notes: 'Updated sale prices based on comps', locked: false },
    { id: 'v3.1', date: '2024-11-15', notes: 'Added contingency increase', locked: true },
    { id: 'v3.0', date: '2024-10-01', notes: 'Revised hard costs after bids', locked: true },
    { id: 'v2.0', date: '2024-06-15', notes: 'Post-entitlement update', locked: true },
    { id: 'v1.0', date: '2024-02-01', notes: 'Initial proforma', locked: true },
  ];

  // Calculations
  const totalUnits = proforma.revenue.units.reduce((sum, u) => sum + u.count, 0);
  const grossSalesRevenue = proforma.revenue.units.reduce((sum, u) => sum + (u.count * u.salePrice), 0);
  const otherIncome = proforma.revenue.otherIncome.reduce((sum, i) => sum + i.amount, 0);
  const totalRevenue = grossSalesRevenue + otherIncome;

  const totalLandCosts = Object.values(proforma.costs.land).reduce((sum, v) => sum + v, 0);
  const totalHardCosts = Object.values(proforma.costs.hardCosts).reduce((sum, v) => sum + v, 0);
  const totalSoftCosts = Object.values(proforma.costs.softCosts).reduce((sum, v) => sum + v, 0);
  const totalProjectCosts = totalLandCosts + totalHardCosts + totalSoftCosts;

  const loanOriginationFee = proforma.financing.constructionLoan.amount * (proforma.financing.constructionLoan.originationFee / 100);
  const estimatedInterest = proforma.financing.constructionLoan.interestReserve;
  const totalFinancingCosts = loanOriginationFee + estimatedInterest;
  
  const totalCosts = totalProjectCosts + totalFinancingCosts;
  const grossProfit = totalRevenue - totalCosts;
  const grossMargin = (grossProfit / totalRevenue) * 100;
  const totalEquity = proforma.financing.equity.developerEquity + proforma.financing.equity.investorEquity;
  const roi = (grossProfit / totalEquity) * 100;
  const profitPerUnit = grossProfit / totalUnits;
  const costPerUnit = totalCosts / totalUnits;
  const revenuePerUnit = totalRevenue / totalUnits;

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Project Proforma</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-500">Version {proforma.version}</span>
            <span className="text-xs text-gray-400">Last updated: {proforma.lastUpdated}</span>
            <button onClick={() => setShowVersions(!showVersions)} className="text-xs text-[#047857] hover:underline">
              View History
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Recalculate</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <><Save className="w-4 h-4 mr-1" />Save</> : <><Edit2 className="w-4 h-4 mr-1" />Edit</>}
          </Button>
        </div>
      </div>

      {/* Version History Panel */}
      {showVersions && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Version History</h3>
            <button onClick={() => setShowVersions(false)}><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2">
            {versions.map(v => (
              <div key={v.id} className={cn("flex items-center justify-between p-2 rounded", v.id === proforma.version ? "bg-green-50 border border-green-200" : "hover:bg-gray-50")}>
                <div className="flex items-center gap-3">
                  {v.locked ? <Lock className="w-4 h-4 text-gray-400" /> : <Unlock className="w-4 h-4 text-green-600" />}
                  <div>
                    <span className="font-medium">{v.id}</span>
                    <span className="text-xs text-gray-500 ml-2">{v.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{v.notes}</span>
                  {v.id !== proforma.version && <Button variant="outline" size="sm">View</Button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">Total Costs</p>
          <p className="text-xl font-semibold">{formatCurrency(totalCosts)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Gross Profit</p>
          <p className="text-xl font-semibold text-blue-600">{formatCurrency(grossProfit)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Gross Margin</p>
          <p className="text-xl font-semibold">{grossMargin.toFixed(1)}%</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-purple-500">
          <p className="text-xs text-gray-500">ROI (on Equity)</p>
          <p className="text-xl font-semibold text-purple-600">{roi.toFixed(1)}%</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Profit/Unit</p>
          <p className="text-xl font-semibold">{formatCurrency(profitPerUnit)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Revenue Section */}
        <div className="col-span-2 space-y-4">
          {/* Revenue */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-green-50 border-b cursor-pointer flex items-center justify-between"
              onClick={() => toggleSection('revenue')}
            >
              <div className="flex items-center gap-2">
                {expandedSections.includes('revenue') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <h3 className="font-semibold text-green-800">Revenue</h3>
              </div>
              <span className="font-semibold text-green-800">{formatCurrency(totalRevenue)}</span>
            </div>
            {expandedSections.includes('revenue') && (
              <div className="p-4">
                <table className="w-full text-sm mb-4">
                  <thead className="text-xs text-gray-500">
                    <tr>
                      <th className="text-left py-2">Unit Type</th>
                      <th className="text-right py-2">Count</th>
                      <th className="text-right py-2">Sq Ft</th>
                      <th className="text-right py-2">$/SF</th>
                      <th className="text-right py-2">Sale Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proforma.revenue.units.map(unit => (
                      <tr key={unit.id} className="border-t">
                        <td className="py-2">{unit.type}</td>
                        <td className="py-2 text-right">{unit.count}</td>
                        <td className="py-2 text-right">{unit.sqft.toLocaleString()}</td>
                        <td className="py-2 text-right">${unit.pricePerSqft}</td>
                        <td className="py-2 text-right">${unit.salePrice.toLocaleString()}</td>
                        <td className="py-2 text-right font-medium">${(unit.count * unit.salePrice).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t font-semibold bg-gray-50">
                      <td className="py-2">Gross Sales Revenue</td>
                      <td className="py-2 text-right">{totalUnits}</td>
                      <td colSpan={3}></td>
                      <td className="py-2 text-right">${grossSalesRevenue.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mb-2">Other Income</p>
                <table className="w-full text-sm">
                  <tbody>
                    {proforma.revenue.otherIncome.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2">{item.description}</td>
                        <td className="py-2 text-right">${item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t font-semibold bg-green-50">
                      <td className="py-2">Total Revenue</td>
                      <td className="py-2 text-right text-green-700">${totalRevenue.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Costs */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-red-50 border-b cursor-pointer flex items-center justify-between"
              onClick={() => toggleSection('costs')}
            >
              <div className="flex items-center gap-2">
                {expandedSections.includes('costs') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <h3 className="font-semibold text-red-800">Project Costs</h3>
              </div>
              <span className="font-semibold text-red-800">{formatCurrency(totalProjectCosts)}</span>
            </div>
            {expandedSections.includes('costs') && (
              <div className="p-4 space-y-4">
                {/* Land Costs */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700">Land & Acquisition</p>
                    <p className="text-sm font-semibold">${totalLandCosts.toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(proforma.costs.land).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-dashed">
                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span>${value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hard Costs */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700">Hard Costs</p>
                    <p className="text-sm font-semibold">${totalHardCosts.toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(proforma.costs.hardCosts).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-dashed">
                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span>${value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Soft Costs */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700">Soft Costs</p>
                    <p className="text-sm font-semibold">${totalSoftCosts.toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(proforma.costs.softCosts).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-dashed">
                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span>${value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-between font-semibold text-red-700 bg-red-50 -mx-4 px-4 py-2">
                  <span>Total Project Costs</span>
                  <span>${totalProjectCosts.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Financing */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-blue-50 border-b cursor-pointer flex items-center justify-between"
              onClick={() => toggleSection('financing')}
            >
              <div className="flex items-center gap-2">
                {expandedSections.includes('financing') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <h3 className="font-semibold text-blue-800">Financing</h3>
              </div>
              <span className="font-semibold text-blue-800">{formatCurrency(totalFinancingCosts)}</span>
            </div>
            {expandedSections.includes('financing') && (
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Construction Loan</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-dashed">
                      <span className="text-gray-500">Loan Amount</span>
                      <span>${proforma.financing.constructionLoan.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed">
                      <span className="text-gray-500">Interest Rate</span>
                      <span>{proforma.financing.constructionLoan.interestRate}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed">
                      <span className="text-gray-500">Term</span>
                      <span>{proforma.financing.constructionLoan.term} months</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed">
                      <span className="text-gray-500">Origination Fee ({proforma.financing.constructionLoan.originationFee}%)</span>
                      <span>${loanOriginationFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed">
                      <span className="text-gray-500">Interest Reserve</span>
                      <span>${proforma.financing.constructionLoan.interestReserve.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Equity</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-dashed">
                      <span className="text-gray-500">Developer Equity</span>
                      <span>${proforma.financing.equity.developerEquity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed">
                      <span className="text-gray-500">Investor Equity</span>
                      <span>${proforma.financing.equity.investorEquity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-between font-semibold text-blue-700 bg-blue-50 -mx-4 px-4 py-2">
                  <span>Total Financing Costs</span>
                  <span>${totalFinancingCosts.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          {/* Profit Summary */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Profit Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Revenue</span>
                <span className="font-medium text-green-600">${totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Project Costs</span>
                <span className="font-medium">-${totalProjectCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Financing Costs</span>
                <span className="font-medium">-${totalFinancingCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t font-semibold">
                <span>Gross Profit</span>
                <span className="text-blue-600">${grossProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Unit Economics */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Unit Economics</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Units</span>
                <span className="font-medium">{totalUnits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Avg Revenue/Unit</span>
                <span className="font-medium">${Math.round(revenuePerUnit).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Avg Cost/Unit</span>
                <span className="font-medium">${Math.round(costPerUnit).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-gray-500">Profit/Unit</span>
                <span className="font-semibold text-green-600">${Math.round(profitPerUnit).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Sources & Uses */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Sources & Uses</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Sources</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Construction Loan</span>
                    <span>${proforma.financing.constructionLoan.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Developer Equity</span>
                    <span>${proforma.financing.equity.developerEquity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investor Equity</span>
                    <span>${proforma.financing.equity.investorEquity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t">
                    <span>Total Sources</span>
                    <span>${(proforma.financing.constructionLoan.amount + totalEquity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Uses</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Land & Acquisition</span>
                    <span>${totalLandCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hard Costs</span>
                    <span>${totalHardCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soft Costs</span>
                    <span>${totalSoftCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Financing Costs</span>
                    <span>${totalFinancingCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t">
                    <span>Total Uses</span>
                    <span>${totalCosts.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Returns */}
          <div className="bg-gradient-to-br from-[#047857] to-[#065f46] text-white rounded-lg p-4">
            <h3 className="font-semibold mb-4">Key Returns</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-100">Gross Margin</span>
                <span className="font-semibold">{grossMargin.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-100">ROI (on Equity)</span>
                <span className="font-semibold">{roi.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-100">Equity Multiple</span>
                <span className="font-semibold">{((totalEquity + grossProfit) / totalEquity).toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-100">IRR (Est.)</span>
                <span className="font-semibold">32.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProformaPage;
