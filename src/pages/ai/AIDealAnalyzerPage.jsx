import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Target,
  Zap,
  Building2,
  MapPin,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AIDealAnalyzerPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { toast } = useToast();

  const [dealInput, setDealInput] = useState({
    projectName: '',
    propertyType: '',
    location: '',
    purchasePrice: '',
    units: '',
    squareFootage: '',
    acquisitionCosts: '',
    developmentCosts: '',
    projectedRents: '',
    exitCapRate: ''
  });

  const handleAnalyze = () => {
    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResult({
        overallScore: 78,
        recommendation: 'Proceed with Caution',
        confidence: 85,
        metrics: {
          projectedIRR: 22.5,
          equityMultiple: 1.95,
          cashOnCash: 12.8,
          capRateSpread: 1.2
        },
        strengths: [
          { item: 'Strong rental market fundamentals', score: 85 },
          { item: 'Below-market acquisition price', score: 82 },
          { item: 'Value-add potential with renovations', score: 78 },
          { item: 'Favorable debt market conditions', score: 75 }
        ],
        risks: [
          { item: 'Construction cost escalation risk', severity: 'Medium', mitigation: 'Lock in contractor pricing early' },
          { item: 'Interest rate sensitivity', severity: 'Medium', mitigation: 'Consider rate cap or fixed-rate financing' },
          { item: 'Absorption timeline uncertainty', severity: 'Low', mitigation: 'Phase development to match demand' }
        ],
        comparables: [
          { name: 'Similar Deal A (2023)', irr: 24.2, status: 'Outperformed' },
          { name: 'Similar Deal B (2023)', irr: 19.8, status: 'Met Projections' },
          { name: 'Similar Deal C (2022)', irr: 21.5, status: 'Met Projections' }
        ],
        aiInsights: [
          'Based on 47 similar deals in your portfolio, this deal falls within the 65th percentile for projected returns.',
          'Market timing analysis suggests favorable entry point with rental growth expected to outpace regional averages by 2.3%.',
          'Cost structure analysis indicates 8% higher soft costs than comparable deals - recommend reviewing professional fee assumptions.',
          'Exit cap rate assumption of 5.5% is conservative relative to current market transactions averaging 5.2%.'
        ],
        sensitivities: {
          bestCase: { irr: 28.5, probability: 20 },
          baseCase: { irr: 22.5, probability: 60 },
          downside: { irr: 15.2, probability: 20 }
        }
      });
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "AI deal analysis has been generated."
      });
    }, 3000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            AI Deal Analyzer
          </h1>
          <p className="text-muted-foreground">AI-powered deal analysis and recommendations</p>
        </div>
        <Badge className="bg-purple-100 text-purple-800">
          <Sparkles className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Information</CardTitle>
            <CardDescription>Enter deal details for AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  value={dealInput.projectName}
                  onChange={(e) => setDealInput({ ...dealInput, projectName: e.target.value })}
                  placeholder="Oak Street Apartments"
                />
              </div>
              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select
                  value={dealInput.propertyType}
                  onValueChange={(value) => setDealInput({ ...dealInput, propertyType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Multifamily">Multifamily</SelectItem>
                    <SelectItem value="Land Development">Land Development</SelectItem>
                    <SelectItem value="Single Family">Single Family</SelectItem>
                    <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={dealInput.location}
                onChange={(e) => setDealInput({ ...dealInput, location: e.target.value })}
                placeholder="Austin, TX"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purchase Price ($)</Label>
                <Input
                  type="number"
                  value={dealInput.purchasePrice}
                  onChange={(e) => setDealInput({ ...dealInput, purchasePrice: e.target.value })}
                  placeholder="12000000"
                />
              </div>
              <div className="space-y-2">
                <Label>Units / Lots</Label>
                <Input
                  type="number"
                  value={dealInput.units}
                  onChange={(e) => setDealInput({ ...dealInput, units: e.target.value })}
                  placeholder="280"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Development Costs ($)</Label>
                <Input
                  type="number"
                  value={dealInput.developmentCosts}
                  onChange={(e) => setDealInput({ ...dealInput, developmentCosts: e.target.value })}
                  placeholder="33000000"
                />
              </div>
              <div className="space-y-2">
                <Label>Exit Cap Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={dealInput.exitCapRate}
                  onChange={(e) => setDealInput({ ...dealInput, exitCapRate: e.target.value })}
                  placeholder="5.5"
                />
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Analyzing Deal...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBackground(analysisResult.overallScore)}`}>
                  <span className={`text-4xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                    {analysisResult.overallScore}
                  </span>
                </div>
                <div className="mt-2 font-semibold">{analysisResult.recommendation}</div>
                <div className="text-sm text-muted-foreground">
                  Confidence: {analysisResult.confidence}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded text-center">
                  <div className="text-2xl font-bold text-green-600">{analysisResult.metrics.projectedIRR}%</div>
                  <div className="text-xs text-muted-foreground">Projected IRR</div>
                </div>
                <div className="p-3 bg-muted rounded text-center">
                  <div className="text-2xl font-bold">{analysisResult.metrics.equityMultiple}x</div>
                  <div className="text-xs text-muted-foreground">Equity Multiple</div>
                </div>
                <div className="p-3 bg-muted rounded text-center">
                  <div className="text-2xl font-bold">{analysisResult.metrics.cashOnCash}%</div>
                  <div className="text-xs text-muted-foreground">Cash-on-Cash</div>
                </div>
                <div className="p-3 bg-muted rounded text-center">
                  <div className="text-2xl font-bold">+{analysisResult.metrics.capRateSpread}%</div>
                  <div className="text-xs text-muted-foreground">Cap Rate Spread</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Analysis */}
      {analysisResult && (
        <Tabs defaultValue="insights" className="space-y-4">
          <TabsList>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="strengths">Strengths & Risks</TabsTrigger>
            <TabsTrigger value="comparables">Comparables</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  AI-Generated Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.aiInsights.map((insight, index) => (
                    <div key={index} className="flex gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Brain className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <p className="text-purple-900">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strengths">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    Deal Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResult.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{strength.item}</span>
                      <Badge className="bg-green-100 text-green-800">{strength.score}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResult.risks.map((risk, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{risk.item}</span>
                        <Badge className={getSeverityColor(risk.severity)}>{risk.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparables">
            <Card>
              <CardHeader>
                <CardTitle>Similar Deals Analysis</CardTitle>
                <CardDescription>AI-matched comparable transactions from your portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.comparables.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <div className="font-medium">{comp.name}</div>
                        <div className="text-sm text-muted-foreground">Actual IRR: {comp.irr}%</div>
                      </div>
                      <Badge className={comp.status === 'Outperformed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {comp.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenarios">
            <Card>
              <CardHeader>
                <CardTitle>Scenario Analysis</CardTitle>
                <CardDescription>Probability-weighted return scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-green-800">Best Case</div>
                        <div className="text-green-600">IRR: {analysisResult.sensitivities.bestCase.irr}%</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{analysisResult.sensitivities.bestCase.probability}% probability</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-blue-800">Base Case</div>
                        <div className="text-blue-600">IRR: {analysisResult.sensitivities.baseCase.irr}%</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">{analysisResult.sensitivities.baseCase.probability}% probability</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded border border-red-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-red-800">Downside Case</div>
                        <div className="text-red-600">IRR: {analysisResult.sensitivities.downside.irr}%</div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">{analysisResult.sensitivities.downside.probability}% probability</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
