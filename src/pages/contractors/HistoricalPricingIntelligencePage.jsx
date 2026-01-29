import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Brain,
  Lightbulb,
  Building2,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Target,
  AlertCircle
} from 'lucide-react';

const HistoricalPricingIntelligencePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('24months');

  const trades = ['Electrical', 'Plumbing', 'HVAC', 'Foundation', 'Roofing', 'Framing', 'Drywall', 'Concrete', 'Landscaping'];
  const markets = ['Austin Metro', 'San Antonio Metro', 'Dallas Metro', 'Houston Metro'];

  const pricingData = [
    {
      trade: 'Electrical',
      market: 'Austin Metro',
      dataPoints: 45,
      avgQuote: 285000,
      avgActual: 298500,
      avgVariance: 4.7,
      minQuote: 185000,
      maxQuote: 425000,
      avgPerSqFt: 12.50,
      trend: 'up',
      trendPercent: 8.2,
      lastUpdated: '2024-03-15',
      predictedCost: 310000,
      confidenceLevel: 85,
      recommendations: [
        'Request detailed breakdowns for panel upgrades',
        'Consider phased approach for large projects',
        'Premier Electric consistently 5% under average'
      ]
    },
    {
      trade: 'Plumbing',
      market: 'Austin Metro',
      dataPoints: 38,
      avgQuote: 195000,
      avgActual: 218400,
      avgVariance: 12.0,
      minQuote: 120000,
      maxQuote: 310000,
      avgPerSqFt: 8.75,
      trend: 'up',
      trendPercent: 12.5,
      lastUpdated: '2024-03-14',
      predictedCost: 225000,
      confidenceLevel: 72,
      recommendations: [
        'High variance trade - add 15% contingency',
        'Request fixed-price contracts when possible',
        'Pro Plumbing Services has best variance record'
      ]
    },
    {
      trade: 'HVAC',
      market: 'Austin Metro',
      dataPoints: 32,
      avgQuote: 320000,
      avgActual: 335200,
      avgVariance: 4.8,
      minQuote: 225000,
      maxQuote: 485000,
      avgPerSqFt: 14.25,
      trend: 'stable',
      trendPercent: 2.1,
      lastUpdated: '2024-03-12',
      predictedCost: 345000,
      confidenceLevel: 88,
      recommendations: [
        'Equipment costs stable, labor increasing',
        'Quality HVAC offers best value/performance ratio',
        'Consider mini-split systems for smaller units'
      ]
    },
    {
      trade: 'Foundation',
      market: 'Austin Metro',
      dataPoints: 28,
      avgQuote: 650000,
      avgActual: 668500,
      avgVariance: 2.8,
      minQuote: 450000,
      maxQuote: 950000,
      avgPerSqFt: 28.50,
      trend: 'up',
      trendPercent: 5.4,
      lastUpdated: '2024-03-10',
      predictedCost: 685000,
      confidenceLevel: 91,
      recommendations: [
        'Soil conditions key cost driver',
        'Foundation Experts most reliable performer',
        'Request geotechnical report early'
      ]
    },
    {
      trade: 'Roofing',
      market: 'Austin Metro',
      dataPoints: 41,
      avgQuote: 175000,
      avgActual: 172500,
      avgVariance: -1.4,
      minQuote: 95000,
      maxQuote: 285000,
      avgPerSqFt: 7.80,
      trend: 'down',
      trendPercent: -3.2,
      lastUpdated: '2024-03-08',
      predictedCost: 168000,
      confidenceLevel: 94,
      recommendations: [
        'Material costs declining, good time to bid',
        'Apex Roofing consistently under budget',
        'Consider metal roofing for long-term value'
      ]
    },
    {
      trade: 'Framing',
      market: 'Austin Metro',
      dataPoints: 52,
      avgQuote: 425000,
      avgActual: 445000,
      avgVariance: 4.7,
      minQuote: 280000,
      maxQuote: 620000,
      avgPerSqFt: 18.90,
      trend: 'stable',
      trendPercent: 1.8,
      lastUpdated: '2024-03-15',
      predictedCost: 455000,
      confidenceLevel: 87,
      recommendations: [
        'Lumber prices stabilized from 2023 highs',
        'Labor shortage driving slight increases',
        'ABC Construction top performer'
      ]
    },
    {
      trade: 'Drywall',
      market: 'Austin Metro',
      dataPoints: 47,
      avgQuote: 145000,
      avgActual: 148700,
      avgVariance: 2.6,
      minQuote: 85000,
      maxQuote: 225000,
      avgPerSqFt: 6.45,
      trend: 'stable',
      trendPercent: 0.8,
      lastUpdated: '2024-03-14',
      predictedCost: 150000,
      confidenceLevel: 92,
      recommendations: [
        'Very stable pricing category',
        'Schedule early to lock in crews',
        'Consider Level 5 finish for premium units'
      ]
    },
    {
      trade: 'Concrete',
      market: 'Austin Metro',
      dataPoints: 35,
      avgQuote: 280000,
      avgActual: 295400,
      avgVariance: 5.5,
      minQuote: 180000,
      maxQuote: 420000,
      avgPerSqFt: 12.20,
      trend: 'up',
      trendPercent: 7.8,
      lastUpdated: '2024-03-13',
      predictedCost: 305000,
      confidenceLevel: 79,
      recommendations: [
        'Cement prices driving increases',
        'Request material cost locks in contracts',
        'Texas Concrete Co best for large pours'
      ]
    }
  ];

  const filteredData = useMemo(() => {
    return pricingData.filter(item => {
      const matchesSearch = !searchQuery ||
        item.trade.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTrade = tradeFilter === 'all' || item.trade === tradeFilter;
      const matchesMarket = marketFilter === 'all' || item.market === marketFilter;
      return matchesSearch && matchesTrade && matchesMarket;
    });
  }, [searchQuery, tradeFilter, marketFilter]);

  const portfolioStats = useMemo(() => ({
    totalDataPoints: pricingData.reduce((acc, p) => acc + p.dataPoints, 0),
    avgVariance: (pricingData.reduce((acc, p) => acc + p.avgVariance, 0) / pricingData.length).toFixed(1),
    avgConfidence: Math.round(pricingData.reduce((acc, p) => acc + p.confidenceLevel, 0) / pricingData.length),
    tradesTracked: pricingData.length,
    highVarianceTrades: pricingData.filter(p => p.avgVariance > 5).length
  }), []);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <span className="text-gray-500">→</span>;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-red-600';
      case 'down': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getVarianceColor = (variance) => {
    if (variance <= 0) return 'text-green-600';
    if (variance <= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Historical Pricing Intelligence</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Historical Pricing Intelligence
            <Badge className="bg-purple-100 text-purple-700">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </h1>
          <p className="text-gray-600 mt-2">Auto-aggregated bid/actual data by trade for AI-powered future estimates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* AI Insights Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900">AI Cost Prediction Ready</h3>
              <p className="text-purple-700 text-sm mt-1">
                Based on {portfolioStats.totalDataPoints} historical data points across {portfolioStats.tradesTracked} trades,
                our AI can predict costs for your next project with {portfolioStats.avgConfidence}% average confidence.
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Cost Estimate
                </Button>
                <span className="text-xs text-purple-600">
                  Last model update: Today
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Data Points</p>
            <p className="text-2xl font-bold">{portfolioStats.totalDataPoints}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Trades Tracked</p>
            <p className="text-2xl font-bold">{portfolioStats.tradesTracked}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Avg Variance</p>
            <p className={`text-2xl font-bold ${getVarianceColor(parseFloat(portfolioStats.avgVariance))}`}>
              {parseFloat(portfolioStats.avgVariance) > 0 ? '+' : ''}{portfolioStats.avgVariance}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Avg Confidence</p>
            <p className={`text-2xl font-bold ${getConfidenceColor(portfolioStats.avgConfidence)}`}>
              {portfolioStats.avgConfidence}%
            </p>
          </CardContent>
        </Card>
        <Card className={portfolioStats.highVarianceTrades > 0 ? 'border-yellow-200 bg-yellow-50' : ''}>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">High Variance</p>
            <p className="text-2xl font-bold text-yellow-600">{portfolioStats.highVarianceTrades}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search trades..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                {trades.map(trade => (
                  <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {markets.map(market => (
                  <SelectItem key={market} value={market}>{market}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12months">Last 12 Months</SelectItem>
                <SelectItem value="24months">Last 24 Months</SelectItem>
                <SelectItem value="36months">Last 36 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trade Cards */}
      <div className="space-y-4">
        {filteredData.map((item) => (
          <Card key={item.trade}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    item.avgVariance <= 3 ? 'bg-green-100' :
                    item.avgVariance <= 6 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <Building2 className={`w-6 h-6 ${
                      item.avgVariance <= 3 ? 'text-green-600' :
                      item.avgVariance <= 6 ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {item.trade}
                      <Badge variant="outline">{item.market}</Badge>
                      <span className="text-sm text-gray-500">({item.dataPoints} data points)</span>
                    </CardTitle>
                    <CardDescription>Last updated: {item.lastUpdated}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`flex items-center gap-1 ${getTrendColor(item.trend)}`}>
                      {getTrendIcon(item.trend)}
                      <span className="font-semibold">
                        {item.trend === 'up' ? '+' : item.trend === 'down' ? '' : ''}{item.trendPercent}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">12mo Trend</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${getConfidenceColor(item.confidenceLevel)}`}>
                      {item.confidenceLevel}%
                    </p>
                    <p className="text-xs text-gray-500">Confidence</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Pricing Stats */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold">${(item.avgQuote / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">Avg Quote</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">${(item.avgActual / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">Avg Actual</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${getVarianceColor(item.avgVariance)}`}>
                      {item.avgVariance > 0 ? '+' : ''}{item.avgVariance}%
                    </p>
                    <p className="text-xs text-gray-500">Avg Variance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">${item.avgPerSqFt}</p>
                    <p className="text-xs text-gray-500">Per Sq Ft</p>
                  </div>
                </div>

                {/* AI Prediction */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-purple-900">AI Predicted Cost</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-purple-700">
                        ${(item.predictedCost / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-purple-600">
                        Range: ${(item.minQuote / 1000).toFixed(0)}K - ${(item.maxQuote / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-purple-100 text-purple-700">
                        {item.confidenceLevel}% confidence
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">AI Recommendations</span>
                </div>
                <ul className="space-y-1">
                  {item.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-blue-700">
                      <ChevronRight className="w-4 h-4" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Portfolio-Wide AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Best Performing Trades</span>
              </div>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Roofing: -1.4% avg variance</li>
                <li>• Drywall: +2.6% avg variance</li>
                <li>• Foundation: +2.8% avg variance</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-900">High Risk Trades</span>
              </div>
              <ul className="space-y-1 text-sm text-red-700">
                <li>• Plumbing: +12.0% avg variance</li>
                <li>• Concrete: +5.5% avg variance</li>
                <li>• Electrical: +4.7% avg variance</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Market Trends</span>
              </div>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Plumbing costs up 12.5% YoY</li>
                <li>• Electrical up 8.2% YoY</li>
                <li>• Roofing down 3.2% YoY</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricalPricingIntelligencePage;
