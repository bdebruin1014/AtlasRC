import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock cash flow forecast data
const cashFlowData = {
  summary: {
    currentCash: 12500000,
    projectedEndCash: 8200000,
    totalInflows: 45000000,
    totalOutflows: 49300000,
    netCashFlow: -4300000
  },
  projects: [
    { id: 1, name: 'Riverside Apartments', status: 'Development' },
    { id: 2, name: 'Sunset Land Development', status: 'Development' },
    { id: 3, name: 'Harbor View Homes', status: 'Disposition' },
    { id: 4, name: 'Downtown Mixed Use', status: 'Stabilization' }
  ],
  forecast: [
    {
      period: 'Jan 2024',
      openingBalance: 12500000,
      inflows: {
        loanDraws: 2500000,
        capitalCalls: 1000000,
        lotSales: 0,
        unitSales: 925000,
        rental: 45000,
        other: 25000
      },
      outflows: {
        construction: 3200000,
        softCosts: 180000,
        landPayments: 0,
        loanPayments: 285000,
        operating: 125000,
        distributions: 0
      },
      closingBalance: 13205000,
      netFlow: 705000
    },
    {
      period: 'Feb 2024',
      openingBalance: 13205000,
      inflows: {
        loanDraws: 3000000,
        capitalCalls: 0,
        lotSales: 1750000,
        unitSales: 1850000,
        rental: 48000,
        other: 15000
      },
      outflows: {
        construction: 4500000,
        softCosts: 220000,
        landPayments: 0,
        loanPayments: 295000,
        operating: 135000,
        distributions: 500000
      },
      closingBalance: 14218000,
      netFlow: 1013000
    },
    {
      period: 'Mar 2024',
      openingBalance: 14218000,
      inflows: {
        loanDraws: 2800000,
        capitalCalls: 2000000,
        lotSales: 2625000,
        unitSales: 925000,
        rental: 52000,
        other: 10000
      },
      outflows: {
        construction: 5200000,
        softCosts: 195000,
        landPayments: 0,
        loanPayments: 305000,
        operating: 142000,
        distributions: 0
      },
      closingBalance: 16788000,
      netFlow: 2570000
    },
    {
      period: 'Apr 2024',
      openingBalance: 16788000,
      inflows: {
        loanDraws: 2200000,
        capitalCalls: 0,
        lotSales: 3500000,
        unitSales: 0,
        rental: 280000,
        other: 20000
      },
      outflows: {
        construction: 4800000,
        softCosts: 175000,
        landPayments: 0,
        loanPayments: 315000,
        operating: 155000,
        distributions: 1000000
      },
      closingBalance: 16343000,
      netFlow: -445000
    },
    {
      period: 'May 2024',
      openingBalance: 16343000,
      inflows: {
        loanDraws: 1800000,
        capitalCalls: 0,
        lotSales: 2625000,
        unitSales: 0,
        rental: 295000,
        other: 15000
      },
      outflows: {
        construction: 4200000,
        softCosts: 160000,
        landPayments: 0,
        loanPayments: 325000,
        operating: 165000,
        distributions: 0
      },
      closingBalance: 16228000,
      netFlow: -115000
    },
    {
      period: 'Jun 2024',
      openingBalance: 16228000,
      inflows: {
        loanDraws: 1500000,
        capitalCalls: 0,
        lotSales: 4375000,
        unitSales: 0,
        rental: 310000,
        other: 10000
      },
      outflows: {
        construction: 3800000,
        softCosts: 145000,
        landPayments: 0,
        loanPayments: 335000,
        operating: 175000,
        distributions: 2000000
      },
      closingBalance: 15968000,
      netFlow: -260000
    }
  ],
  projectCashFlows: {
    'Riverside Apartments': {
      totalBudget: 45000000,
      fundedToDate: 28500000,
      remainingToDraw: 16500000,
      monthlyBurn: 3500000,
      expectedCompletion: 'Aug 2024'
    },
    'Sunset Land Development': {
      totalBudget: 38000000,
      fundedToDate: 22000000,
      remainingToDraw: 16000000,
      monthlyBurn: 2000000,
      expectedCompletion: 'Jun 2024'
    },
    'Harbor View Homes': {
      totalBudget: 8500000,
      fundedToDate: 7800000,
      remainingToDraw: 700000,
      monthlyBurn: 350000,
      expectedCompletion: 'Feb 2024'
    },
    'Downtown Mixed Use': {
      totalBudget: 25000000,
      fundedToDate: 24200000,
      remainingToDraw: 800000,
      monthlyBurn: 400000,
      expectedCompletion: 'Apr 2024'
    }
  }
};

export default function CashFlowForecastingPage() {
  const [selectedProject, setSelectedProject] = useState('all');
  const [forecastPeriod, setForecastPeriod] = useState('6');
  const { toast } = useToast();

  const formatCurrency = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const calculateTotalInflows = (period) => {
    return Object.values(period.inflows).reduce((sum, val) => sum + val, 0);
  };

  const calculateTotalOutflows = (period) => {
    return Object.values(period.outflows).reduce((sum, val) => sum + val, 0);
  };

  const handleRefreshForecast = () => {
    toast({
      title: "Forecast Updated",
      description: "Cash flow projections have been refreshed with latest data."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cash Flow Forecasting</h1>
          <p className="text-muted-foreground">Project and track cash flows across all projects</p>
        </div>
        <div className="flex gap-3">
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefreshForecast}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Cash</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cashFlowData.summary.currentCash)}</div>
            <p className="text-xs text-muted-foreground">As of today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected End Cash</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cashFlowData.summary.projectedEndCash)}</div>
            <p className="text-xs text-muted-foreground">End of period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inflows</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(cashFlowData.summary.totalInflows)}</div>
            <p className="text-xs text-muted-foreground">Projected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outflows</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(cashFlowData.summary.totalOutflows)}</div>
            <p className="text-xs text-muted-foreground">Projected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            {cashFlowData.summary.netCashFlow >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cashFlowData.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(cashFlowData.summary.netCashFlow)}
            </div>
            <p className="text-xs text-muted-foreground">Net change</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Forecast</TabsTrigger>
          <TabsTrigger value="projects">By Project</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
        </TabsList>

        {/* Monthly Forecast */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cash Flow Forecast</CardTitle>
              <CardDescription>Projected cash movements over the forecast period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Opening Balance</TableHead>
                    <TableHead className="text-right">Total Inflows</TableHead>
                    <TableHead className="text-right">Total Outflows</TableHead>
                    <TableHead className="text-right">Net Flow</TableHead>
                    <TableHead className="text-right">Closing Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((period, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{period.period}</TableCell>
                      <TableCell className="text-right">{formatCurrency(period.openingBalance)}</TableCell>
                      <TableCell className="text-right text-green-600">
                        +{formatCurrency(calculateTotalInflows(period))}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        -{formatCurrency(calculateTotalOutflows(period))}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${period.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {period.netFlow >= 0 ? '+' : ''}{formatCurrency(period.netFlow)}
                      </TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(period.closingBalance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Cash Position Alert */}
          {cashFlowData.forecast.some(p => p.closingBalance < 5000000) && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Cash Position Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700">
                  Projected cash balance falls below $5M threshold. Consider delaying distributions or accelerating capital calls.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* By Project */}
        <TabsContent value="projects">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(cashFlowData.projectCashFlows).map(([project, data]) => (
              <Card key={project}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project}</CardTitle>
                    <Badge variant="outline">{data.expectedCompletion}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Budget</div>
                      <div className="text-xl font-bold">{formatCurrency(data.totalBudget)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Funded to Date</div>
                      <div className="text-xl font-bold">{formatCurrency(data.fundedToDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Remaining to Draw</div>
                      <div className="text-xl font-bold text-blue-600">{formatCurrency(data.remainingToDraw)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Monthly Burn Rate</div>
                      <div className="text-xl font-bold text-red-600">{formatCurrency(data.monthlyBurn)}/mo</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Funding Progress</span>
                      <span>{Math.round((data.fundedToDate / data.totalBudget) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded">
                      <div
                        className="h-2 bg-blue-500 rounded"
                        style={{ width: `${(data.fundedToDate / data.totalBudget) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Detailed View */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Cash Flow Breakdown</CardTitle>
              <CardDescription>Line item details for each period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableHead key={i} className="text-right">{p.period}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Inflows Section */}
                  <TableRow className="bg-green-50">
                    <TableCell className="font-bold text-green-800" colSpan={parseInt(forecastPeriod) + 1}>
                      INFLOWS
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Loan Draws</TableCell>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableCell key={i} className="text-right text-green-600">{formatCurrency(p.inflows.loanDraws)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Capital Calls</TableCell>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableCell key={i} className="text-right text-green-600">{formatCurrency(p.inflows.capitalCalls)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Lot Sales</TableCell>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableCell key={i} className="text-right text-green-600">{formatCurrency(p.inflows.lotSales)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Unit Sales</TableCell>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableCell key={i} className="text-right text-green-600">{formatCurrency(p.inflows.unitSales)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Rental Income</TableCell>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableCell key={i} className="text-right text-green-600">{formatCurrency(p.inflows.rental)}</TableCell>
                    ))}
                  </TableRow>

                  {/* Outflows Section */}
                  <TableRow className="bg-red-50">
                    <TableCell className="font-bold text-red-800" colSpan={parseInt(forecastPeriod) + 1}>
                      OUTFLOWS
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Construction</TableCell>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableCell key={i} className="text-right text-red-600">({formatCurrency(p.outflows.construction)})</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Soft Costs</TableCell>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableCell key={i} className="text-right text-red-600">({formatCurrency(p.outflows.softCosts)})</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Loan Payments</TableCell>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableCell key={i} className="text-right text-red-600">({formatCurrency(p.outflows.loanPayments)})</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Operating Expenses</TableCell>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableCell key={i} className="text-right text-red-600">({formatCurrency(p.outflows.operating)})</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Distributions</TableCell>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableCell key={i} className="text-right text-red-600">({formatCurrency(p.outflows.distributions)})</TableCell>
                    ))}
                  </TableRow>

                  {/* Summary */}
                  <TableRow className="bg-gray-100 font-bold">
                    <TableCell>Net Cash Flow</TableCell>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableCell key={i} className={`text-right ${p.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {p.netFlow >= 0 ? '+' : ''}{formatCurrency(p.netFlow)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="bg-gray-200 font-bold">
                    <TableCell>Closing Balance</TableCell>
                    {cashFlowData.forecast.slice(0, parseInt(forecastPeriod)).map((p, i) => (
                      <TableCell key={i} className="text-right">{formatCurrency(p.closingBalance)}</TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
