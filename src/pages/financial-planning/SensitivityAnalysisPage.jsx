import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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
  TrendingUp,
  TrendingDown,
  Calculator,
  RefreshCw,
  Download,
  Settings,
  AlertTriangle,
  DollarSign,
  Percent,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Base case assumptions
const baseCase = {
  projectName: 'Riverside Apartments',
  purchasePrice: 12000000,
  totalDevelopmentCost: 45000000,
  exitValue: 58000000,
  holdPeriod: 24,
  ltv: 75,
  interestRate: 8.0,
  capRate: 5.5,
  rentPerUnit: 1850,
  units: 280,
  vacancy: 5,
  operatingExpenseRatio: 35,
  irr: 24.5,
  equityMultiple: 2.08,
  profit: 13000000
};

export default function SensitivityAnalysisPage() {
  const [selectedProject, setSelectedProject] = useState('Riverside Apartments');
  const [adjustments, setAdjustments] = useState({
    exitCapRate: 0,
    constructionCost: 0,
    rentGrowth: 0,
    vacancy: 0,
    interestRate: 0,
    holdPeriod: 0
  });
  const { toast } = useToast();

  // Calculate adjusted metrics
  const adjustedMetrics = useMemo(() => {
    const adjCapRate = baseCase.capRate + adjustments.exitCapRate;
    const adjCost = baseCase.totalDevelopmentCost * (1 + adjustments.constructionCost / 100);
    const adjRent = baseCase.rentPerUnit * (1 + adjustments.rentGrowth / 100);
    const adjVacancy = baseCase.vacancy + adjustments.vacancy;
    const adjRate = baseCase.interestRate + adjustments.interestRate;
    const adjHold = baseCase.holdPeriod + adjustments.holdPeriod;

    // Calculate adjusted NOI
    const grossRent = adjRent * baseCase.units * 12;
    const effectiveGrossIncome = grossRent * (1 - adjVacancy / 100);
    const operatingExpenses = effectiveGrossIncome * (baseCase.operatingExpenseRatio / 100);
    const noi = effectiveGrossIncome - operatingExpenses;

    // Calculate exit value based on cap rate
    const exitValue = noi / (adjCapRate / 100);

    // Calculate interest expense
    const loanAmount = adjCost * (baseCase.ltv / 100);
    const annualInterest = loanAmount * (adjRate / 100);
    const totalInterest = annualInterest * (adjHold / 12);

    // Calculate profit and returns
    const equity = adjCost - loanAmount;
    const profit = exitValue - adjCost - totalInterest;
    const equityMultiple = (equity + profit) / equity;

    // Simplified IRR calculation
    const annualReturn = Math.pow(equityMultiple, 12 / adjHold) - 1;
    const irr = annualReturn * 100;

    return {
      capRate: adjCapRate,
      cost: adjCost,
      rent: adjRent,
      vacancy: adjVacancy,
      interestRate: adjRate,
      holdPeriod: adjHold,
      exitValue,
      noi,
      profit,
      equityMultiple: equityMultiple.toFixed(2),
      irr: irr.toFixed(1),
      irrChange: irr - baseCase.irr,
      profitChange: profit - baseCase.profit
    };
  }, [adjustments]);

  // Sensitivity matrix data
  const sensitivityMatrix = useMemo(() => {
    const capRates = [-0.5, -0.25, 0, 0.25, 0.5];
    const costChanges = [-10, -5, 0, 5, 10];

    return costChanges.map(costChange => {
      return capRates.map(capChange => {
        const adjCapRate = baseCase.capRate + capChange;
        const adjCost = baseCase.totalDevelopmentCost * (1 + costChange / 100);

        const grossRent = baseCase.rentPerUnit * baseCase.units * 12;
        const effectiveGrossIncome = grossRent * (1 - baseCase.vacancy / 100);
        const operatingExpenses = effectiveGrossIncome * (baseCase.operatingExpenseRatio / 100);
        const noi = effectiveGrossIncome - operatingExpenses;
        const exitValue = noi / (adjCapRate / 100);

        const loanAmount = adjCost * (baseCase.ltv / 100);
        const totalInterest = loanAmount * (baseCase.interestRate / 100) * (baseCase.holdPeriod / 12);
        const profit = exitValue - adjCost - totalInterest;
        const equity = adjCost - loanAmount;
        const equityMultiple = (equity + profit) / equity;
        const irr = (Math.pow(equityMultiple, 12 / baseCase.holdPeriod) - 1) * 100;

        return { irr: irr.toFixed(1), profit };
      });
    });
  }, []);

  const handleReset = () => {
    setAdjustments({
      exitCapRate: 0,
      constructionCost: 0,
      rentGrowth: 0,
      vacancy: 0,
      interestRate: 0,
      holdPeriod: 0
    });
    toast({
      title: "Reset Complete",
      description: "All adjustments have been reset to base case."
    });
  };

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getIRRColor = (irr) => {
    const irrNum = parseFloat(irr);
    if (irrNum >= 25) return 'bg-green-100 text-green-800';
    if (irrNum >= 20) return 'bg-green-50 text-green-700';
    if (irrNum >= 15) return 'bg-yellow-50 text-yellow-700';
    if (irrNum >= 10) return 'bg-orange-50 text-orange-700';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sensitivity Analysis</h1>
          <p className="text-muted-foreground">Analyze how changes in assumptions affect project returns</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Riverside Apartments">Riverside Apartments</SelectItem>
              <SelectItem value="Sunset Land Development">Sunset Land Development</SelectItem>
              <SelectItem value="Downtown Mixed Use">Downtown Mixed Use</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adjusted IRR</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(adjustedMetrics.irr) >= baseCase.irr ? 'text-green-600' : 'text-red-600'}`}>
              {adjustedMetrics.irr}%
            </div>
            <p className="text-xs text-muted-foreground">
              Base: {baseCase.irr}% ({adjustedMetrics.irrChange >= 0 ? '+' : ''}{adjustedMetrics.irrChange.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equity Multiple</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(adjustedMetrics.equityMultiple) >= baseCase.equityMultiple ? 'text-green-600' : 'text-red-600'}`}>
              {adjustedMetrics.equityMultiple}x
            </div>
            <p className="text-xs text-muted-foreground">Base: {baseCase.equityMultiple}x</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${adjustedMetrics.profit >= baseCase.profit ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(adjustedMetrics.profit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {adjustedMetrics.profitChange >= 0 ? '+' : ''}{formatCurrency(adjustedMetrics.profitChange)} vs base
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exit Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(adjustedMetrics.exitValue)}</div>
            <p className="text-xs text-muted-foreground">At {adjustedMetrics.capRate.toFixed(2)}% cap rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Adjustment Sliders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Assumption Adjustments
            </CardTitle>
            <CardDescription>Adjust variables to see impact on returns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Exit Cap Rate Adjustment</Label>
                <span className="text-sm font-medium">
                  {adjustments.exitCapRate >= 0 ? '+' : ''}{adjustments.exitCapRate.toFixed(2)}%
                </span>
              </div>
              <Slider
                value={[adjustments.exitCapRate * 100]}
                min={-100}
                max={100}
                step={5}
                onValueChange={([value]) => setAdjustments({ ...adjustments, exitCapRate: value / 100 })}
              />
              <p className="text-xs text-muted-foreground">
                Result: {adjustedMetrics.capRate.toFixed(2)}% cap (Base: {baseCase.capRate}%)
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Construction Cost Change</Label>
                <span className="text-sm font-medium">
                  {adjustments.constructionCost >= 0 ? '+' : ''}{adjustments.constructionCost}%
                </span>
              </div>
              <Slider
                value={[adjustments.constructionCost]}
                min={-20}
                max={20}
                step={1}
                onValueChange={([value]) => setAdjustments({ ...adjustments, constructionCost: value })}
              />
              <p className="text-xs text-muted-foreground">
                Result: {formatCurrency(adjustedMetrics.cost)} (Base: {formatCurrency(baseCase.totalDevelopmentCost)})
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Rent Growth</Label>
                <span className="text-sm font-medium">
                  {adjustments.rentGrowth >= 0 ? '+' : ''}{adjustments.rentGrowth}%
                </span>
              </div>
              <Slider
                value={[adjustments.rentGrowth]}
                min={-15}
                max={15}
                step={1}
                onValueChange={([value]) => setAdjustments({ ...adjustments, rentGrowth: value })}
              />
              <p className="text-xs text-muted-foreground">
                Result: ${adjustedMetrics.rent.toFixed(0)}/unit (Base: ${baseCase.rentPerUnit})
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Vacancy Change</Label>
                <span className="text-sm font-medium">
                  {adjustments.vacancy >= 0 ? '+' : ''}{adjustments.vacancy}%
                </span>
              </div>
              <Slider
                value={[adjustments.vacancy]}
                min={-3}
                max={10}
                step={1}
                onValueChange={([value]) => setAdjustments({ ...adjustments, vacancy: value })}
              />
              <p className="text-xs text-muted-foreground">
                Result: {adjustedMetrics.vacancy}% vacancy (Base: {baseCase.vacancy}%)
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Interest Rate Change</Label>
                <span className="text-sm font-medium">
                  {adjustments.interestRate >= 0 ? '+' : ''}{adjustments.interestRate}%
                </span>
              </div>
              <Slider
                value={[adjustments.interestRate * 100]}
                min={-200}
                max={200}
                step={25}
                onValueChange={([value]) => setAdjustments({ ...adjustments, interestRate: value / 100 })}
              />
              <p className="text-xs text-muted-foreground">
                Result: {adjustedMetrics.interestRate.toFixed(2)}% rate (Base: {baseCase.interestRate}%)
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Hold Period Change (months)</Label>
                <span className="text-sm font-medium">
                  {adjustments.holdPeriod >= 0 ? '+' : ''}{adjustments.holdPeriod}
                </span>
              </div>
              <Slider
                value={[adjustments.holdPeriod]}
                min={-12}
                max={24}
                step={3}
                onValueChange={([value]) => setAdjustments({ ...adjustments, holdPeriod: value })}
              />
              <p className="text-xs text-muted-foreground">
                Result: {adjustedMetrics.holdPeriod} months (Base: {baseCase.holdPeriod})
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sensitivity Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              IRR Sensitivity Matrix
            </CardTitle>
            <CardDescription>Exit Cap Rate vs Construction Cost</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cost \ Cap</TableHead>
                  <TableHead className="text-center">5.0%</TableHead>
                  <TableHead className="text-center">5.25%</TableHead>
                  <TableHead className="text-center">5.5%</TableHead>
                  <TableHead className="text-center">5.75%</TableHead>
                  <TableHead className="text-center">6.0%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {['-10%', '-5%', 'Base', '+5%', '+10%'].map((costLabel, costIdx) => (
                  <TableRow key={costLabel}>
                    <TableCell className="font-medium">{costLabel}</TableCell>
                    {sensitivityMatrix[costIdx].map((cell, capIdx) => (
                      <TableCell key={capIdx} className="text-center">
                        <Badge className={getIRRColor(cell.irr)}>
                          {cell.irr}%
                        </Badge>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex gap-2 text-xs justify-center">
              <Badge className="bg-green-100 text-green-800">25%+</Badge>
              <Badge className="bg-green-50 text-green-700">20-25%</Badge>
              <Badge className="bg-yellow-50 text-yellow-700">15-20%</Badge>
              <Badge className="bg-orange-50 text-orange-700">10-15%</Badge>
              <Badge className="bg-red-100 text-red-800">&lt;10%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alert */}
      {parseFloat(adjustedMetrics.irr) < 15 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Return Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              The adjusted IRR of {adjustedMetrics.irr}% falls below the minimum target return of 15%.
              Consider reviewing assumptions or adjusting the deal structure.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
