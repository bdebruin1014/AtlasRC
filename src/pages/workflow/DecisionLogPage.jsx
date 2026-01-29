import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  FileText,
  Plus,
  Search,
  Calendar,
  User,
  Building2,
  Tag,
  DollarSign,
  Clock,
  Brain,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock decision log data - structured for AI learning
const initialDecisions = [
  {
    id: 1,
    project: 'Riverside Apartments',
    date: '2024-01-18',
    category: 'Design',
    title: 'HVAC System Upgrade',
    decisionMaker: 'Mike Johnson',
    participants: ['Sarah Chen', 'Tom Richards'],
    context: 'Fire marshal required additional coverage in retail areas due to updated mixed-use fire codes',
    options: [
      { option: 'Minimal compliance', cost: 85000, pros: 'Lowest cost', cons: 'May require future upgrades' },
      { option: 'Full system upgrade', cost: 150000, pros: 'Future-proof, energy efficient', cons: 'Higher upfront cost' },
      { option: 'Hybrid approach', cost: 115000, pros: 'Balanced cost/benefit', cons: 'Moderate improvements' }
    ],
    decision: 'Full system upgrade',
    rationale: 'Long-term energy savings and future code compliance justify higher upfront cost. Expected 5-year payback on energy savings.',
    financialImpact: 150000,
    scheduleImpact: '3 weeks',
    outcome: 'Approved',
    tags: ['MEP', 'Fire Code', 'Energy Efficiency', 'Value Engineering'],
    aiLearningFlags: ['code_compliance', 'value_engineering', 'long_term_roi']
  },
  {
    id: 2,
    project: 'Sunset Land Development',
    date: '2024-01-15',
    category: 'Entitlements',
    title: 'Lot Size Variance Request',
    decisionMaker: 'Legal Team',
    participants: ['Sarah Chen', 'City Planner'],
    context: 'HOA deed restriction requires 2-acre minimum lots, conflicting with planned 1-acre subdivision',
    options: [
      { option: 'Request HOA amendment', cost: 25000, pros: 'Maintains original plan', cons: 'Uncertain timeline, requires 2/3 vote' },
      { option: 'Redesign to 2-acre lots', cost: 0, pros: 'No approval needed', cons: 'Reduces lot count by 50%, impacts returns' },
      { option: 'Mixed lot sizes', cost: 15000, pros: 'Compromise solution', cons: 'Still requires partial amendment' }
    ],
    decision: 'Request HOA amendment',
    rationale: 'Market study supports 1-acre demand. Legal team confident in obtaining amendment based on precedent.',
    financialImpact: 25000,
    scheduleImpact: '6 weeks',
    outcome: 'Pending',
    tags: ['Entitlements', 'HOA', 'Zoning', 'Legal'],
    aiLearningFlags: ['hoa_negotiations', 'entitlement_strategy', 'market_demand']
  },
  {
    id: 3,
    project: 'Harbor View Homes',
    date: '2024-01-10',
    category: 'Sales',
    title: 'Unit 11 Price Reduction',
    decisionMaker: 'Sales Team',
    participants: ['Lisa Brown', 'Mike Johnson'],
    context: 'Unit 11 has been on market 45 days with no offers, market comparables suggest pricing may be high',
    options: [
      { option: 'Maintain price', cost: 0, pros: 'Preserve margin', cons: 'Extended days on market' },
      { option: '3% reduction', cost: 27750, pros: 'Competitive with comps', cons: 'Reduced profit' },
      { option: 'Incentive package', cost: 15000, pros: 'Maintain list price', cons: 'Hidden cost, may not convert' }
    ],
    decision: '3% reduction',
    rationale: 'Comparable analysis shows similar units selling at lower price point. Quick sale preferred to minimize carrying costs.',
    financialImpact: 27750,
    scheduleImpact: 'None',
    outcome: 'Approved',
    tags: ['Pricing', 'Sales Strategy', 'Market Analysis'],
    aiLearningFlags: ['pricing_strategy', 'market_comparison', 'days_on_market']
  },
  {
    id: 4,
    project: 'Riverside Apartments',
    date: '2024-01-05',
    category: 'Construction',
    title: 'Concrete Supplier Change',
    decisionMaker: 'Sarah Chen',
    participants: ['GC Representative'],
    context: 'Primary concrete supplier experienced equipment failure, unable to fulfill order for 2 weeks',
    options: [
      { option: 'Wait for primary supplier', cost: 0, pros: 'Established relationship, known quality', cons: '2-week schedule delay' },
      { option: 'Use backup supplier', cost: 12500, pros: 'Maintains schedule', cons: 'Higher cost, less familiar' },
      { option: 'Split order', cost: 8000, pros: 'Partial schedule maintenance', cons: 'Coordination complexity' }
    ],
    decision: 'Use backup supplier',
    rationale: 'Schedule delay cost exceeds supplier premium. Backup supplier has good reputation and references.',
    financialImpact: 12500,
    scheduleImpact: 'Avoided 2-week delay',
    outcome: 'Approved',
    tags: ['Supply Chain', 'Schedule', 'Vendor Management'],
    aiLearningFlags: ['supply_chain_disruption', 'schedule_priority', 'vendor_backup']
  }
];

const categories = ['Design', 'Construction', 'Entitlements', 'Sales', 'Financial', 'Legal', 'Operations'];

export default function DecisionLogPage() {
  const [decisions, setDecisions] = useState(initialDecisions);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const { toast } = useToast();

  const [newDecision, setNewDecision] = useState({
    project: '',
    category: '',
    title: '',
    context: '',
    decision: '',
    rationale: '',
    financialImpact: '',
    scheduleImpact: ''
  });

  const filteredDecisions = useMemo(() => {
    return decisions.filter(decision => {
      const matchesSearch = decision.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           decision.context.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = projectFilter === 'all' || decision.project === projectFilter;
      const matchesCategory = categoryFilter === 'all' || decision.category === categoryFilter;
      return matchesSearch && matchesProject && matchesCategory;
    });
  }, [decisions, searchTerm, projectFilter, categoryFilter]);

  const projects = useMemo(() => {
    return [...new Set(decisions.map(d => d.project))];
  }, [decisions]);

  const handleAddDecision = () => {
    const decision = {
      id: Math.max(...decisions.map(d => d.id)) + 1,
      ...newDecision,
      date: new Date().toISOString().split('T')[0],
      decisionMaker: 'Current User',
      participants: [],
      options: [],
      financialImpact: parseFloat(newDecision.financialImpact) || 0,
      outcome: 'Pending',
      tags: [],
      aiLearningFlags: []
    };
    setDecisions([decision, ...decisions]);
    setIsAddDialogOpen(false);
    setNewDecision({
      project: '',
      category: '',
      title: '',
      context: '',
      decision: '',
      rationale: '',
      financialImpact: '',
      scheduleImpact: ''
    });
    toast({
      title: "Decision Logged",
      description: "Decision has been recorded for future reference and AI learning."
    });
  };

  const getOutcomeColor = (outcome) => {
    const colors = {
      'Approved': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Deferred': 'bg-gray-100 text-gray-800'
    };
    return colors[outcome] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Design': 'bg-purple-100 text-purple-800',
      'Construction': 'bg-orange-100 text-orange-800',
      'Entitlements': 'bg-blue-100 text-blue-800',
      'Sales': 'bg-green-100 text-green-800',
      'Financial': 'bg-emerald-100 text-emerald-800',
      'Legal': 'bg-red-100 text-red-800',
      'Operations': 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Decision Log</h1>
          <p className="text-muted-foreground">Document decisions for tracking and AI-powered insights</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Decision
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log a Decision</DialogTitle>
              <DialogDescription>Document key decisions for future reference and AI learning</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={newDecision.project}
                    onValueChange={(value) => setNewDecision({ ...newDecision, project: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project} value={project}>{project}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newDecision.category}
                    onValueChange={(value) => setNewDecision({ ...newDecision, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Decision Title</Label>
                <Input
                  value={newDecision.title}
                  onChange={(e) => setNewDecision({ ...newDecision, title: e.target.value })}
                  placeholder="Brief title for the decision"
                />
              </div>
              <div className="space-y-2">
                <Label>Context</Label>
                <Textarea
                  value={newDecision.context}
                  onChange={(e) => setNewDecision({ ...newDecision, context: e.target.value })}
                  placeholder="What situation required this decision?"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Decision Made</Label>
                <Input
                  value={newDecision.decision}
                  onChange={(e) => setNewDecision({ ...newDecision, decision: e.target.value })}
                  placeholder="What was decided?"
                />
              </div>
              <div className="space-y-2">
                <Label>Rationale</Label>
                <Textarea
                  value={newDecision.rationale}
                  onChange={(e) => setNewDecision({ ...newDecision, rationale: e.target.value })}
                  placeholder="Why was this decision made?"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Financial Impact ($)</Label>
                  <Input
                    type="number"
                    value={newDecision.financialImpact}
                    onChange={(e) => setNewDecision({ ...newDecision, financialImpact: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Schedule Impact</Label>
                  <Input
                    value={newDecision.scheduleImpact}
                    onChange={(e) => setNewDecision({ ...newDecision, scheduleImpact: e.target.value })}
                    placeholder="e.g., 2 weeks"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddDecision} disabled={!newDecision.title || !newDecision.decision}>
                Log Decision
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisions.length}</div>
            <p className="text-xs text-muted-foreground">Logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisions.filter(d => d.date.startsWith('2024-01')).length}</div>
            <p className="text-xs text-muted-foreground">Decisions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(decisions.reduce((sum, d) => sum + d.financialImpact, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Financial decisions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Learning</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Active</div>
            <p className="text-xs text-muted-foreground">Pattern recognition enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search decisions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Decisions Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Financial Impact</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDecisions.map(decision => (
                <TableRow key={decision.id}>
                  <TableCell>{decision.date}</TableCell>
                  <TableCell>{decision.project}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(decision.category)}>{decision.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{decision.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">{decision.decision}</div>
                  </TableCell>
                  <TableCell>{formatCurrency(decision.financialImpact)}</TableCell>
                  <TableCell>{decision.scheduleImpact}</TableCell>
                  <TableCell>
                    <Badge className={getOutcomeColor(decision.outcome)}>{decision.outcome}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDecision(decision)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Decision Detail Dialog */}
      <Dialog open={!!selectedDecision} onOpenChange={() => setSelectedDecision(null)}>
        <DialogContent className="max-w-2xl">
          {selectedDecision && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDecision.title}</DialogTitle>
                <div className="flex gap-2 mt-2">
                  <Badge className={getCategoryColor(selectedDecision.category)}>{selectedDecision.category}</Badge>
                  <Badge className={getOutcomeColor(selectedDecision.outcome)}>{selectedDecision.outcome}</Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Project:</span> {selectedDecision.project}</div>
                  <div><span className="text-muted-foreground">Date:</span> {selectedDecision.date}</div>
                  <div><span className="text-muted-foreground">Decision Maker:</span> {selectedDecision.decisionMaker}</div>
                  <div><span className="text-muted-foreground">Financial Impact:</span> {formatCurrency(selectedDecision.financialImpact)}</div>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Context</h4>
                  <p className="text-sm">{selectedDecision.context}</p>
                </div>

                {selectedDecision.options.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Options Considered</h4>
                    <div className="space-y-2">
                      {selectedDecision.options.map((opt, i) => (
                        <div key={i} className={`p-3 rounded border ${opt.option === selectedDecision.decision ? 'border-green-300 bg-green-50' : ''}`}>
                          <div className="font-medium">{opt.option} - {formatCurrency(opt.cost)}</div>
                          <div className="text-xs text-muted-foreground">
                            <span className="text-green-600">Pros: {opt.pros}</span> | <span className="text-red-600">Cons: {opt.cons}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-1">Decision Made</h4>
                  <p className="text-blue-700">{selectedDecision.decision}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Rationale</h4>
                  <p className="text-sm">{selectedDecision.rationale}</p>
                </div>

                {selectedDecision.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedDecision.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-purple-50 rounded border border-purple-200">
                  <div className="flex items-center gap-2 text-purple-800">
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">AI Learning Flags</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDecision.aiLearningFlags.map(flag => (
                      <Badge key={flag} className="bg-purple-100 text-purple-800">{flag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
