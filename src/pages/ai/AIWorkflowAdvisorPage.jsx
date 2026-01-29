import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Brain,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Workflow,
  MessageSquare,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock AI advisor suggestions
const activeAdvisories = [
  {
    id: 1,
    type: 'Opportunity',
    priority: 'High',
    project: 'Riverside Apartments',
    title: 'Concrete Bid Opportunity',
    description: 'Based on historical data, current concrete bids are 12% above market average. Consider requesting re-bids or negotiating with current bidder.',
    potentialSavings: 150000,
    confidence: 87,
    action: 'Request additional bids',
    dataPoints: ['47 similar project bids', '15 regional contractors', 'Current market trends']
  },
  {
    id: 2,
    type: 'Risk',
    priority: 'Medium',
    project: 'Sunset Land Development',
    title: 'Permitting Timeline Risk',
    description: 'Pattern analysis indicates permitting taking 30% longer than projected. Historical data suggests engaging expediter early reduces delays by average of 4 weeks.',
    potentialSavings: 85000,
    confidence: 82,
    action: 'Engage permitting expediter',
    dataPoints: ['23 similar entitlement processes', 'City approval patterns', 'Seasonal timing analysis']
  },
  {
    id: 3,
    type: 'Recommendation',
    priority: 'Medium',
    project: 'Harbor View Homes',
    title: 'Pricing Optimization',
    description: 'Market analysis suggests remaining 2 units could sell 15% faster with 2.5% price reduction. Current days on market exceeding comparable properties by 40%.',
    potentialSavings: 25000,
    confidence: 79,
    action: 'Implement price adjustment',
    dataPoints: ['Market comparable analysis', 'DOM trends', 'Absorption rate patterns']
  },
  {
    id: 4,
    type: 'Opportunity',
    priority: 'Low',
    project: 'Downtown Mixed Use',
    title: 'MEP Value Engineering',
    description: 'Analysis of completed projects shows potential 8% savings in MEP systems through alternative equipment specifications without quality compromise.',
    potentialSavings: 180000,
    confidence: 75,
    action: 'Review VE options with engineer',
    dataPoints: ['12 completed projects', 'Equipment performance data', 'Maintenance cost analysis']
  }
];

const workflowInsights = {
  decisionsAnalyzed: 156,
  patternsIdentified: 23,
  recommendationsGenerated: 89,
  adoptionRate: 72
};

const recentLearnings = [
  { pattern: 'Change orders above $50K typically require 3+ approvals', source: '34 decisions', confidence: 94 },
  { pattern: 'Projects using pre-qualified contractors have 15% fewer delays', source: '28 projects', confidence: 88 },
  { pattern: 'Early material locks save average 8% on material costs', source: '45 purchase orders', confidence: 91 },
  { pattern: 'Weekly city meetings reduce permitting time by 25%', source: '15 entitlement processes', confidence: 85 }
];

export default function AIWorkflowAdvisorPage() {
  const [selectedProject, setSelectedProject] = useState('all');
  const [advisories, setAdvisories] = useState(activeAdvisories);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleDismiss = (advisoryId) => {
    setAdvisories(advisories.filter(a => a.id !== advisoryId));
    toast({
      title: "Advisory Dismissed",
      description: "This recommendation has been dismissed."
    });
  };

  const handleAccept = (advisory) => {
    toast({
      title: "Action Accepted",
      description: `"${advisory.action}" has been added to your tasks.`
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Insights Updated",
        description: "AI has analyzed latest data and updated recommendations."
      });
    }, 2000);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Opportunity':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'Risk':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'Recommendation':
        return <Lightbulb className="h-5 w-5 text-blue-600" />;
      default:
        return <Brain className="h-5 w-5 text-purple-600" />;
    }
  };

  const formatCurrency = (value) => {
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const filteredAdvisories = selectedProject === 'all'
    ? advisories
    : advisories.filter(a => a.project === selectedProject);

  const projects = [...new Set(advisories.map(a => a.project))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Workflow className="h-8 w-8 text-purple-600" />
            AI Workflow Advisor
          </h1>
          <p className="text-muted-foreground">Intelligent recommendations based on your workflow patterns</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Insights
          </Button>
          <Badge className="bg-purple-100 text-purple-800">
            <Brain className="h-3 w-3 mr-1" />
            Learning Active
          </Badge>
        </div>
      </div>

      {/* AI Learning Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decisions Analyzed</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowInsights.decisionsAnalyzed}</div>
            <p className="text-xs text-muted-foreground">From decision log</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patterns Identified</CardTitle>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowInsights.patternsIdentified}</div>
            <p className="text-xs text-muted-foreground">Actionable insights</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowInsights.recommendationsGenerated}</div>
            <p className="text-xs text-muted-foreground">Generated this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adoption Rate</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{workflowInsights.adoptionRate}%</div>
            <p className="text-xs text-muted-foreground">Recommendations followed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="advisories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="advisories">Active Advisories</TabsTrigger>
          <TabsTrigger value="patterns">Learned Patterns</TabsTrigger>
          <TabsTrigger value="chat">Ask AI</TabsTrigger>
        </TabsList>

        {/* Active Advisories */}
        <TabsContent value="advisories" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredAdvisories.map(advisory => (
              <Card key={advisory.id} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      {getTypeIcon(advisory.type)}
                      <div>
                        <CardTitle className="text-lg">{advisory.title}</CardTitle>
                        <CardDescription>{advisory.project}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(advisory.priority)}>{advisory.priority}</Badge>
                      <Badge variant="outline">{advisory.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{advisory.description}</p>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-green-50 rounded text-center">
                      <div className="text-lg font-bold text-green-600">{formatCurrency(advisory.potentialSavings)}</div>
                      <div className="text-xs text-green-700">Potential Savings</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded text-center">
                      <div className="text-lg font-bold text-blue-600">{advisory.confidence}%</div>
                      <div className="text-xs text-blue-700">Confidence</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded text-center">
                      <div className="text-lg font-bold text-purple-600">{advisory.dataPoints.length}</div>
                      <div className="text-xs text-purple-700">Data Sources</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-2">Based on:</div>
                    <div className="flex flex-wrap gap-1">
                      {advisory.dataPoints.map((point, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{point}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-4 w-4" />
                      <span>Recommended action: <strong>{advisory.action}</strong></span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDismiss(advisory.id)}>
                        Dismiss
                      </Button>
                      <Button size="sm" onClick={() => handleAccept(advisory)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAdvisories.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No active advisories for the selected filter.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Learned Patterns */}
        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Learned Workflow Patterns
              </CardTitle>
              <CardDescription>Insights AI has learned from your decision history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLearnings.map((learning, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{learning.pattern}</p>
                      <Badge className="bg-purple-100 text-purple-800">{learning.confidence}% confident</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      <span>Based on: {learning.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ask AI */}
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Ask AI Advisor
              </CardTitle>
              <CardDescription>Get instant answers based on your project data and decision history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Ask a question about your projects..." className="flex-1" />
                <Button>
                  <Brain className="h-4 w-4 mr-2" />
                  Ask AI
                </Button>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-purple-900 font-medium mb-2">Example questions you can ask:</p>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>"What's the average change order rate for multifamily projects?"</li>
                      <li>"Which contractors have the best on-time completion record?"</li>
                      <li>"How does Riverside Apartments compare to similar projects?"</li>
                      <li>"What's the typical timeline for permitting in Austin?"</li>
                      <li>"What cost categories usually exceed budget?"</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>AI responses are generated based on your historical data and industry patterns.</p>
                <p>Always verify critical decisions with your team.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
