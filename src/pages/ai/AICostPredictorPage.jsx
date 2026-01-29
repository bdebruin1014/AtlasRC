import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  Sparkles,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  History,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock historical data for AI predictions
const historicalBidData = {
  totalBids: 847,
  contractors: 45,
  projectTypes: 8,
  avgAccuracy: 94.2
};

export default function AICostPredictorPage() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const { toast } = useToast();

  const [projectInput, setProjectInput] = useState({
    projectType: '',
    region: '',
    squareFootage: '',
    units: '',
    buildingType: '',
    quality: ''
  });

  const handlePredict = () => {
    setIsPredicting(true);

    // Simulate AI prediction
    setTimeout(() => {
      setPredictionResult({
        totalEstimate: 42500000,
        confidenceRange: { low: 40200000, high: 44800000 },
        confidence: 89,
        breakdown: [
          { category: 'Land & Acquisition', estimate: 12000000, perSF: 48, benchmark: 45, variance: 6.7 },
          { category: 'Site Work', estimate: 3200000, perSF: 12.80, benchmark: 11.50, variance: 11.3 },
          { category: 'Concrete & Foundation', estimate: 5500000, perSF: 22.00, benchmark: 20.00, variance: 10.0 },
          { category: 'Structural', estimate: 4200000, perSF: 16.80, benchmark: 15.50, variance: 8.4 },
          { category: 'MEP Systems', estimate: 8500000, perSF: 34.00, benchmark: 32.00, variance: 6.3 },
          { category: 'Interior Finishes', estimate: 6200000, perSF: 24.80, benchmark: 23.00, variance: 7.8 },
          { category: 'Soft Costs', estimate: 3500000, perSF: 14.00, benchmark: 12.50, variance: 12.0 }
        ],
        marketFactors: [
          { factor: 'Regional Labor Costs', impact: '+5.2%', trend: 'up' },
          { factor: 'Material Prices', impact: '+3.8%', trend: 'up' },
          { factor: 'Subcontractor Availability', impact: '+2.1%', trend: 'up' },
          { factor: 'Seasonal Adjustment', impact: '-1.5%', trend: 'down' }
        ],
        comparableProjects: [
          { name: 'Riverside Phase I', actual: 41200000, predicted: 40800000, accuracy: 99.0 },
          { name: 'Sunset Gardens', actual: 38500000, predicted: 39200000, accuracy: 98.2 },
          { name: 'Harbor Pointe', actual: 44800000, predicted: 43500000, accuracy: 97.1 }
        ],
        recommendations: [
          'Concrete costs 10% above regional average - recommend additional bid solicitation',
          'Soft costs higher than benchmarks - review professional fee assumptions',
          'Consider value engineering in MEP to capture potential 5-8% savings',
          'Current market favors early material procurement locks'
        ]
      });
      setIsPredicting(false);
      toast({
        title: "Prediction Complete",
        description: "AI cost prediction has been generated based on historical data."
      });
    }, 2500);
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getVarianceColor = (variance) => {
    if (variance <= 5) return 'text-green-600';
    if (variance <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            AI Cost Predictor
          </h1>
          <p className="text-muted-foreground">AI-powered cost estimation based on historical bid data</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          <Brain className="h-3 w-3 mr-1" />
          Trained on {historicalBidData.totalBids} bids
        </Badge>
      </div>

      {/* Data Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Historical Bids</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historicalBidData.totalBids}</div>
            <p className="text-xs text-muted-foreground">Training data points</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contractors</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historicalBidData.contractors}</div>
            <p className="text-xs text-muted-foreground">In database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Types</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historicalBidData.projectTypes}</div>
            <p className="text-xs text-muted-foreground">Categorized</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{historicalBidData.avgAccuracy}%</div>
            <p className="text-xs text-muted-foreground">Historical accuracy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Project Parameters</CardTitle>
            <CardDescription>Enter project details for AI cost prediction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Type</Label>
                <Select
                  value={projectInput.projectType}
                  onValueChange={(value) => setProjectInput({ ...projectInput, projectType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Multifamily">Multifamily</SelectItem>
                    <SelectItem value="Land Development">Land Development</SelectItem>
                    <SelectItem value="Single Family">Single Family Build</SelectItem>
                    <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Select
                  value={projectInput.region}
                  onValueChange={(value) => setProjectInput({ ...projectInput, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Southeast">Southeast</SelectItem>
                    <SelectItem value="Southwest">Southwest</SelectItem>
                    <SelectItem value="Midwest">Midwest</SelectItem>
                    <SelectItem value="Northeast">Northeast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Square Footage</Label>
                <Input
                  type="number"
                  value={projectInput.squareFootage}
                  onChange={(e) => setProjectInput({ ...projectInput, squareFootage: e.target.value })}
                  placeholder="250000"
                />
              </div>
              <div className="space-y-2">
                <Label>Units</Label>
                <Input
                  type="number"
                  value={projectInput.units}
                  onChange={(e) => setProjectInput({ ...projectInput, units: e.target.value })}
                  placeholder="280"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Building Type</Label>
                <Select
                  value={projectInput.buildingType}
                  onValueChange={(value) => setProjectInput({ ...projectInput, buildingType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wood Frame">Wood Frame</SelectItem>
                    <SelectItem value="Steel Frame">Steel Frame</SelectItem>
                    <SelectItem value="Concrete">Concrete</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quality Level</Label>
                <Select
                  value={projectInput.quality}
                  onValueChange={(value) => setProjectInput({ ...projectInput, quality: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Mid-Range">Mid-Range</SelectItem>
                    <SelectItem value="High-End">High-End</SelectItem>
                    <SelectItem value="Luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handlePredict} disabled={isPredicting} className="w-full">
              {isPredicting ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Generating Prediction...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Cost Prediction
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {predictionResult && (
          <Card>
            <CardHeader>
              <CardTitle>Prediction Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600">
                  {formatCurrency(predictionResult.totalEstimate)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Range: {formatCurrency(predictionResult.confidenceRange.low)} - {formatCurrency(predictionResult.confidenceRange.high)}
                </div>
                <Badge className="mt-2 bg-green-100 text-green-800">
                  {predictionResult.confidence}% Confidence
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Prediction Confidence</span>
                  <span>{predictionResult.confidence}%</span>
                </div>
                <Progress value={predictionResult.confidence} className="h-2" />
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Brain className="h-4 w-4" />
                  <span className="font-medium">AI Confidence Note</span>
                </div>
                <p className="text-sm text-blue-700">
                  Prediction based on {historicalBidData.totalBids} historical bids with similar project characteristics.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Results */}
      {predictionResult && (
        <Tabs defaultValue="breakdown" className="space-y-4">
          <TabsList>
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="factors">Market Factors</TabsTrigger>
            <TabsTrigger value="comparables">Comparables</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Cost Breakdown</CardTitle>
                <CardDescription>AI-predicted costs by category with benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Estimate</TableHead>
                      <TableHead className="text-right">$/SF</TableHead>
                      <TableHead className="text-right">Benchmark</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictionResult.breakdown.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.estimate)}</TableCell>
                        <TableCell className="text-right">${item.perSF.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.benchmark.toFixed(2)}</TableCell>
                        <TableCell className={`text-right font-medium ${getVarianceColor(item.variance)}`}>
                          +{item.variance}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted font-bold">
                      <TableCell>TOTAL</TableCell>
                      <TableCell className="text-right">{formatCurrency(predictionResult.totalEstimate)}</TableCell>
                      <TableCell className="text-right">$170.00</TableCell>
                      <TableCell className="text-right">$159.50</TableCell>
                      <TableCell className="text-right text-yellow-600">+6.6%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="factors">
            <Card>
              <CardHeader>
                <CardTitle>Market Factor Adjustments</CardTitle>
                <CardDescription>Current market conditions affecting estimates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictionResult.marketFactors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-3">
                        {factor.trend === 'up' ? (
                          <TrendingUp className="h-5 w-5 text-red-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-green-500" />
                        )}
                        <span className="font-medium">{factor.factor}</span>
                      </div>
                      <Badge className={factor.trend === 'up' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {factor.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparables">
            <Card>
              <CardHeader>
                <CardTitle>Comparable Project Accuracy</CardTitle>
                <CardDescription>How well AI predicted similar projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictionResult.comparableProjects.map((project, index) => (
                    <div key={index} className="p-4 border rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{project.name}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {project.accuracy}% Accurate
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Predicted:</span>
                          <span className="ml-2 font-medium">{formatCurrency(project.predicted)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Actual:</span>
                          <span className="ml-2 font-medium">{formatCurrency(project.actual)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictionResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-blue-900">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
