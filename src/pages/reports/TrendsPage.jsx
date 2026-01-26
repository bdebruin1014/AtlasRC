import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Building2, Target, Calendar, ArrowUpRight, ArrowDownRight, Minus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TrendsPage = () => {
  const [timeRange, setTimeRange] = useState('12m');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const metrics = [
    { id: 'revenue', name: 'Revenue', icon: DollarSign, color: 'green' },
    { id: 'projects', name: 'Projects', icon: Building2, color: 'blue' },
    { id: 'pipeline', name: 'Pipeline', icon: Target, color: 'purple' },
    { id: 'margins', name: 'Margins', icon: TrendingUp, color: 'orange' },
  ];

  const trendData = {
    revenue: {
      current: '$2.4M',
      previous: '$1.8M',
      change: 33.3,
      trend: 'up',
      monthlyData: [
        { month: 'Feb', value: 145000 },
        { month: 'Mar', value: 178000 },
        { month: 'Apr', value: 156000 },
        { month: 'May', value: 198000 },
        { month: 'Jun', value: 210000 },
        { month: 'Jul', value: 185000 },
        { month: 'Aug', value: 225000 },
        { month: 'Sep', value: 242000 },
        { month: 'Oct', value: 268000 },
        { month: 'Nov', value: 289000 },
        { month: 'Dec', value: 312000 },
        { month: 'Jan', value: 345000 },
      ],
    },
    projects: {
      current: '12',
      previous: '8',
      change: 50,
      trend: 'up',
      monthlyData: [
        { month: 'Feb', value: 6 },
        { month: 'Mar', value: 7 },
        { month: 'Apr', value: 7 },
        { month: 'May', value: 8 },
        { month: 'Jun', value: 8 },
        { month: 'Jul', value: 9 },
        { month: 'Aug', value: 9 },
        { month: 'Sep', value: 10 },
        { month: 'Oct', value: 10 },
        { month: 'Nov', value: 11 },
        { month: 'Dec', value: 11 },
        { month: 'Jan', value: 12 },
      ],
    },
    pipeline: {
      current: '$4.2M',
      previous: '$3.8M',
      change: 10.5,
      trend: 'up',
      monthlyData: [
        { month: 'Feb', value: 3200000 },
        { month: 'Mar', value: 3400000 },
        { month: 'Apr', value: 3100000 },
        { month: 'May', value: 3600000 },
        { month: 'Jun', value: 3500000 },
        { month: 'Jul', value: 3800000 },
        { month: 'Aug', value: 3700000 },
        { month: 'Sep', value: 3900000 },
        { month: 'Oct', value: 4000000 },
        { month: 'Nov', value: 4100000 },
        { month: 'Dec', value: 4000000 },
        { month: 'Jan', value: 4200000 },
      ],
    },
    margins: {
      current: '24.5%',
      previous: '22.1%',
      change: 2.4,
      trend: 'up',
      monthlyData: [
        { month: 'Feb', value: 21 },
        { month: 'Mar', value: 22 },
        { month: 'Apr', value: 21.5 },
        { month: 'May', value: 22.5 },
        { month: 'Jun', value: 23 },
        { month: 'Jul', value: 22.8 },
        { month: 'Aug', value: 23.5 },
        { month: 'Sep', value: 23.8 },
        { month: 'Oct', value: 24 },
        { month: 'Nov', value: 24.2 },
        { month: 'Dec', value: 24.3 },
        { month: 'Jan', value: 24.5 },
      ],
    },
  };

  const keyInsights = [
    { title: 'Revenue Growth', description: 'Revenue has grown 33% YoY, driven by spec build completions', trend: 'up', impact: 'high' },
    { title: 'Project Volume', description: 'Active projects up 50% from same period last year', trend: 'up', impact: 'high' },
    { title: 'Acquisition Pipeline', description: 'Pipeline value steady at $4.2M with strong conversion', trend: 'stable', impact: 'medium' },
    { title: 'Margin Improvement', description: 'Gross margins improved 2.4 points through better vendor management', trend: 'up', impact: 'medium' },
    { title: 'Lot Development Cycle', description: 'Average lot development time reduced from 8 to 6 months', trend: 'up', impact: 'high' },
    { title: 'Construction Costs', description: 'Per-sqft costs up 3% due to material increases', trend: 'down', impact: 'low' },
  ];

  const comparisons = [
    { metric: 'Avg Deal Size', current: '$95K', previous: '$82K', change: 15.8, trend: 'up' },
    { metric: 'Conversion Rate', current: '28%', previous: '24%', change: 16.7, trend: 'up' },
    { metric: 'Days to Close', current: '45', previous: '52', change: -13.5, trend: 'up' },
    { metric: 'Cost per Lead', current: '$125', previous: '$140', change: -10.7, trend: 'up' },
    { metric: 'Project ROI', current: '18.5%', previous: '16.2%', change: 14.2, trend: 'up' },
    { metric: 'Cash Cycle', current: '4.2mo', previous: '5.1mo', change: -17.6, trend: 'up' },
  ];

  const currentData = trendData[selectedMetric];
  const maxValue = Math.max(...currentData.monthlyData.map(d => d.value));

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (trend, isPositive = true) => {
    if (trend === 'up') return isPositive ? 'text-green-600' : 'text-red-600';
    if (trend === 'down') return isPositive ? 'text-red-600' : 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#2F855A]" />
          <h1 className="text-xl font-semibold text-gray-900">Trends & Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
            <option value="ytd">Year to Date</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {metrics.map(metric => {
          const data = trendData[metric.id];
          const isSelected = selectedMetric === metric.id;
          return (
            <Card
              key={metric.id}
              className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-[#2F855A] bg-green-50' : 'hover:bg-gray-50'}`}
              onClick={() => setSelectedMetric(metric.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{metric.name}</span>
                  <metric.icon className={`w-5 h-5 text-${metric.color}-500`} />
                </div>
                <p className="text-2xl font-semibold">{data.current}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(data.trend)}
                  <span className={getTrendColor(data.trend)}>
                    {data.change > 0 ? '+' : ''}{data.change}%
                  </span>
                  <span className="text-xs text-gray-400">vs last year</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Trend Chart */}
        <Card className="col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="text-base capitalize">{selectedMetric} Trend (12 Months)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between h-48 gap-2">
              {currentData.monthlyData.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-[#2F855A] rounded-t transition-all hover:bg-[#276749]"
                    style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '4px' }}
                    title={`${item.month}: ${selectedMetric === 'revenue' || selectedMetric === 'pipeline' ? '$' + (item.value / 1000).toFixed(0) + 'K' : item.value}`}
                  />
                  <span className="text-xs text-gray-400 mt-2">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#2F855A] rounded" />
                <span className="text-sm text-gray-600">Current Period</span>
              </div>
              <div className="text-sm text-gray-400">
                Peak: {currentData.monthlyData.reduce((max, d) => d.value > max.value ? d : max).month}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Comparisons */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Year-over-Year Comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {comparisons.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.metric}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-900">{item.current}</span>
                      <span className="text-gray-400">vs {item.previous}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(item.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {keyInsights.map((insight, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <div className="flex items-center gap-2">
                    {insight.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                    {insight.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                    {insight.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
                    <Badge className={
                      insight.impact === 'high' ? 'bg-green-100 text-green-700' :
                      insight.impact === 'medium' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {insight.impact}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Analysis */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Entity Performance */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Entity Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {[
                { name: 'VanRock Developers LLC', revenue: '$1.2M', projects: 5, roi: '22%' },
                { name: 'Atlas Acquisitions LLC', revenue: '$890K', projects: 3, roi: '19%' },
                { name: '123 Oak Street LLC', revenue: '$245K', projects: 1, roi: '24%' },
                { name: '456 Pine Avenue LLC', revenue: '$180K', projects: 1, roi: '18%' },
              ].map((entity, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{entity.name}</p>
                    <p className="text-xs text-gray-400">{entity.projects} active projects</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{entity.revenue}</p>
                    <p className="text-xs text-gray-400">ROI: {entity.roi}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Type Breakdown */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Project Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {[
                { type: 'Lot Development', count: 5, revenue: '$680K', avgMargin: '26%', color: 'bg-blue-500' },
                { type: 'Spec Build', count: 4, revenue: '$1.1M', avgMargin: '22%', color: 'bg-green-500' },
                { type: 'Flip Property', count: 2, revenue: '$320K', avgMargin: '28%', color: 'bg-purple-500' },
                { type: 'Custom Build', count: 1, revenue: '$285K', avgMargin: '18%', color: 'bg-orange-500' },
              ].map((type, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${type.color}`} />
                      <span className="text-sm font-medium">{type.type}</span>
                    </div>
                    <span className="text-sm text-gray-600">{type.revenue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${type.color}`} style={{ width: `${(type.count / 12) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-20 text-right">{type.count} projects</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrendsPage;
