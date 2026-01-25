import React, { useState } from 'react';
import { TrendingUp, TrendingDown, MapPin, BarChart3, PieChart, Users, Home, DollarSign, Building2, Calendar, Download, RefreshCw, Filter, ChevronDown, Activity, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MarketAnalysisPage = () => {
  const [selectedMetric, setSelectedMetric] = useState('absorption');
  const [timeRange, setTimeRange] = useState('12months');
  const [submarket, setSubmarket] = useState('all');

  const marketOverview = {
    market: 'New Braunfels, TX',
    submarket: 'Comal County',
    population: 98745,
    populationGrowth: 4.2,
    medianIncome: 78500,
    incomeGrowth: 3.8,
    employmentRate: 96.5,
    majorEmployers: ['Schlitterbahn', 'Comal ISD', 'Christus Santa Rosa'],
  };

  const housingMetrics = {
    medianHomePrice: 425000,
    priceChange12Mo: 8.5,
    avgDaysOnMarket: 32,
    domChange: -15,
    inventory: 1.8,
    newListings: 245,
    closedSales: 312,
    absorptionRate: 4.2,
  };

  const lotMetrics = {
    avgLotPrice: 125000,
    pricePerAcre: 65000,
    priceChange12Mo: 12.5,
    activeDevelopments: 8,
    totalLotsAvailable: 1250,
    monthlyAbsorption: 85,
    monthsOfSupply: 14.7,
  };

  const competitorProjects = [
    { name: 'Vintage Oaks', developer: 'SouthStar Communities', totalLots: 3500, lotsRemaining: 450, avgPrice: 135000, absorption: 8, distance: 3.2 },
    { name: 'River Chase', developer: 'Taylor Morrison', totalLots: 850, lotsRemaining: 180, avgPrice: 115000, absorption: 6, distance: 4.5 },
    { name: 'Havenwood', developer: 'KB Home', totalLots: 420, lotsRemaining: 95, avgPrice: 105000, absorption: 5, distance: 2.8 },
    { name: 'Mission Hills', developer: 'Meritage Homes', totalLots: 620, lotsRemaining: 220, avgPrice: 128000, absorption: 4, distance: 5.1 },
    { name: 'Copper Ridge', developer: 'Lennar', totalLots: 380, lotsRemaining: 125, avgPrice: 118000, absorption: 5, distance: 3.8 },
  ];

  const priceHistory = [
    { month: 'Jan', medianPrice: 385000, lotPrice: 108000 },
    { month: 'Feb', medianPrice: 392000, lotPrice: 110000 },
    { month: 'Mar', medianPrice: 398000, lotPrice: 112000 },
    { month: 'Apr', medianPrice: 405000, lotPrice: 115000 },
    { month: 'May', medianPrice: 412000, lotPrice: 117000 },
    { month: 'Jun', medianPrice: 418000, lotPrice: 119000 },
    { month: 'Jul', medianPrice: 415000, lotPrice: 120000 },
    { month: 'Aug', medianPrice: 420000, lotPrice: 121000 },
    { month: 'Sep', medianPrice: 418000, lotPrice: 122000 },
    { month: 'Oct', medianPrice: 422000, lotPrice: 123000 },
    { month: 'Nov', medianPrice: 425000, lotPrice: 124000 },
    { month: 'Dec', medianPrice: 425000, lotPrice: 125000 },
  ];

  const demographicTrends = [
    { category: 'Population Growth', value: '+4.2%', trend: 'up', benchmark: '+2.1% (TX Avg)' },
    { category: 'Median Age', value: '38.5', trend: 'stable', benchmark: '34.8 (TX Avg)' },
    { category: 'Median Income', value: '$78,500', trend: 'up', benchmark: '$64,000 (TX Avg)' },
    { category: 'College Educated', value: '42%', trend: 'up', benchmark: '31% (TX Avg)' },
    { category: 'Owner Occupied', value: '72%', trend: 'stable', benchmark: '62% (TX Avg)' },
  ];

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  const maxPrice = Math.max(...priceHistory.map(p => p.medianPrice));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Market Analysis</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-4 h-4" />{marketOverview.market} - {marketOverview.submarket}
            </p>
          </div>
          <div className="flex gap-2">
            <select className="border rounded-md px-3 py-1.5 text-sm" value={submarket} onChange={(e) => setSubmarket(e.target.value)}>
              <option value="all">All Submarkets</option>
              <option value="comal">Comal County</option>
              <option value="guadalupe">Guadalupe County</option>
              <option value="hays">Hays County</option>
            </select>
            <select className="border rounded-md px-3 py-1.5 text-sm" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="24months">Last 24 Months</option>
            </select>
            <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Refresh Data</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export Report</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Median Home Price</span>
            </div>
            <p className="text-xl font-bold text-blue-700">${(housingMetrics.medianHomePrice / 1000).toFixed(0)}K</p>
            <p className={cn("text-xs flex items-center gap-1", housingMetrics.priceChange12Mo > 0 ? "text-green-600" : "text-red-600")}>
              {housingMetrics.priceChange12Mo > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {housingMetrics.priceChange12Mo > 0 ? '+' : ''}{housingMetrics.priceChange12Mo}% YoY
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-500">Avg Lot Price</span>
            </div>
            <p className="text-xl font-bold text-green-700">${(lotMetrics.avgLotPrice / 1000).toFixed(0)}K</p>
            <p className={cn("text-xs flex items-center gap-1", lotMetrics.priceChange12Mo > 0 ? "text-green-600" : "text-red-600")}>
              {lotMetrics.priceChange12Mo > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              +{lotMetrics.priceChange12Mo}% YoY
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-500">Lot Absorption</span>
            </div>
            <p className="text-xl font-bold text-purple-700">{lotMetrics.monthlyAbsorption}/mo</p>
            <p className="text-xs text-gray-500">{lotMetrics.monthsOfSupply} mo supply</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-gray-500">Days on Market</span>
            </div>
            <p className="text-xl font-bold text-amber-700">{housingMetrics.avgDaysOnMarket}</p>
            <p className={cn("text-xs flex items-center gap-1", housingMetrics.domChange < 0 ? "text-green-600" : "text-red-600")}>
              {housingMetrics.domChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {housingMetrics.domChange}% vs last year
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-red-600" />
              <span className="text-xs text-gray-500">Inventory (Months)</span>
            </div>
            <p className="text-xl font-bold text-red-700">{housingMetrics.inventory}</p>
            <p className="text-xs text-gray-500">Seller's Market</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-500">Population</span>
            </div>
            <p className="text-xl font-bold text-gray-700">{(marketOverview.population / 1000).toFixed(0)}K</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />+{marketOverview.populationGrowth}% growth
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Price Trend Chart */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Price Trends (12 Months)</h3>
            <div className="h-48 flex items-end gap-2">
              {priceHistory.map((month, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col gap-1">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(month.medianPrice / maxPrice) * 140}px` }}
                      title={`Median: $${month.medianPrice.toLocaleString()}`}
                    />
                    <div
                      className="w-full bg-green-500 rounded-b"
                      style={{ height: `${(month.lotPrice / 150000) * 60}px` }}
                      title={`Lot: $${month.lotPrice.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 bg-blue-500 rounded" />Median Home Price</span>
              <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 bg-green-500 rounded" />Avg Lot Price</span>
            </div>
          </div>

          {/* Demographics */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Demographic Trends</h3>
            <div className="space-y-3">
              {demographicTrends.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTrendIcon(item.trend)}
                    <div>
                      <p className="font-medium text-sm">{item.category}</p>
                      <p className="text-xs text-gray-500">{item.benchmark}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Projects */}
          <div className="bg-white border rounded-lg p-4 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Competing Developments</h3>
              <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Filter</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Project</th>
                  <th className="text-left px-4 py-2 font-medium">Developer</th>
                  <th className="text-right px-4 py-2 font-medium">Total Lots</th>
                  <th className="text-right px-4 py-2 font-medium">Remaining</th>
                  <th className="text-right px-4 py-2 font-medium">Avg Price</th>
                  <th className="text-right px-4 py-2 font-medium">Absorption</th>
                  <th className="text-right px-4 py-2 font-medium">Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {competitorProjects.map((project, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{project.name}</td>
                    <td className="px-4 py-3 text-gray-600">{project.developer}</td>
                    <td className="px-4 py-3 text-right">{project.totalLots.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{project.lotsRemaining.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">${project.avgPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{project.absorption}/mo</td>
                    <td className="px-4 py-3 text-right text-gray-500">{project.distance} mi</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Market Summary */}
          <div className="bg-white border rounded-lg p-4 col-span-2">
            <h3 className="font-semibold mb-4">Market Summary & Outlook</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Strong population growth (+4.2%)</li>
                  <li>• Low inventory (1.8 months)</li>
                  <li>• Above-average income levels</li>
                  <li>• Excellent school district ratings</li>
                  <li>• Steady price appreciation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-amber-700 mb-2">Challenges</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Increasing competition from new developments</li>
                  <li>• Rising land and material costs</li>
                  <li>• Interest rate sensitivity</li>
                  <li>• Infrastructure capacity concerns</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Outlook (12-24 Months)</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Price growth expected: 5-8% annually</li>
                  <li>• Absorption to remain strong</li>
                  <li>• New inventory coming online</li>
                  <li>• Continued in-migration from Austin</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysisPage;
