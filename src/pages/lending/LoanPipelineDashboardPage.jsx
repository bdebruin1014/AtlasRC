import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Textarea } from '@/components/ui/textarea';
import {
  DollarSign,
  Plus,
  Search,
  Calendar,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Banknote,
  Percent,
  XCircle,
  PauseCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock loan pipeline data
const initialLoans = [
  {
    id: 1,
    projectName: 'Riverside Apartments',
    lender: 'First National Bank',
    loanType: 'Construction',
    loanAmount: 12500000,
    ltv: 75,
    interestRate: 8.25,
    term: '24 months',
    status: 'Underwriting',
    stage: 3,
    totalStages: 6,
    applicationDate: '2024-01-05',
    expectedClose: '2024-02-15',
    lastUpdate: '2024-01-18',
    documents: { submitted: 12, required: 15 },
    conditions: { cleared: 8, total: 12 },
    nextAction: 'Submit appraisal report',
    notes: 'Strong deal, bank very interested'
  },
  {
    id: 2,
    projectName: 'Oak Street Mixed Use',
    lender: 'Regional Capital Partners',
    loanType: 'Bridge',
    loanAmount: 3200000,
    ltv: 80,
    interestRate: 11.5,
    term: '18 months',
    status: 'Term Sheet',
    stage: 2,
    totalStages: 6,
    applicationDate: '2024-01-10',
    expectedClose: '2024-02-28',
    lastUpdate: '2024-01-15',
    documents: { submitted: 6, required: 10 },
    conditions: { cleared: 0, total: 0 },
    nextAction: 'Review and sign term sheet',
    notes: 'Flexible on terms, higher rate'
  },
  {
    id: 3,
    projectName: 'Sunset Land Development',
    lender: 'Community Credit Union',
    loanType: 'Land Acquisition',
    loanAmount: 2800000,
    ltv: 65,
    interestRate: 7.75,
    term: '12 months',
    status: 'Approved',
    stage: 5,
    totalStages: 6,
    applicationDate: '2023-12-15',
    expectedClose: '2024-01-25',
    lastUpdate: '2024-01-19',
    documents: { submitted: 15, required: 15 },
    conditions: { cleared: 10, total: 10 },
    nextAction: 'Schedule closing',
    notes: 'Ready to close, waiting on title'
  },
  {
    id: 4,
    projectName: 'Harbor View Homes',
    lender: 'Hard Money Express',
    loanType: 'Fix & Flip',
    loanAmount: 850000,
    ltv: 70,
    interestRate: 13.0,
    term: '12 months',
    status: 'Funded',
    stage: 6,
    totalStages: 6,
    applicationDate: '2023-11-20',
    expectedClose: '2023-12-15',
    lastUpdate: '2023-12-15',
    documents: { submitted: 10, required: 10 },
    conditions: { cleared: 6, total: 6 },
    nextAction: 'N/A - Active loan',
    notes: 'Funded, renovation in progress',
    fundedDate: '2023-12-15',
    maturityDate: '2024-12-15'
  },
  {
    id: 5,
    projectName: 'Downtown Office Refi',
    lender: 'SunBelt Capital',
    loanType: 'Refinance',
    loanAmount: 8500000,
    ltv: 70,
    interestRate: 6.85,
    term: '10 years',
    status: 'Due Diligence',
    stage: 4,
    totalStages: 6,
    applicationDate: '2024-01-02',
    expectedClose: '2024-03-15',
    lastUpdate: '2024-01-17',
    documents: { submitted: 18, required: 25 },
    conditions: { cleared: 5, total: 15 },
    nextAction: 'Complete environmental report',
    notes: 'CMBS deal, lengthy process'
  },
  {
    id: 6,
    projectName: 'Meadow Creek Subdivision',
    lender: 'First National Bank',
    loanType: 'Construction',
    loanAmount: 18000000,
    ltv: 72,
    interestRate: 8.0,
    term: '36 months',
    status: 'Application',
    stage: 1,
    totalStages: 6,
    applicationDate: '2024-01-18',
    expectedClose: '2024-04-01',
    lastUpdate: '2024-01-18',
    documents: { submitted: 3, required: 15 },
    conditions: { cleared: 0, total: 0 },
    nextAction: 'Complete loan application package',
    notes: 'Large development, phased draw structure'
  }
];

const stages = ['Application', 'Term Sheet', 'Underwriting', 'Due Diligence', 'Approved', 'Funded'];

export default function LoanPipelineDashboardPage() {
  const [loans, setLoans] = useState(initialLoans);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loanTypeFilter, setLoanTypeFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const { toast } = useToast();

  const [newLoan, setNewLoan] = useState({
    projectName: '',
    lender: '',
    loanType: '',
    loanAmount: '',
    ltv: '',
    interestRate: '',
    term: '',
    expectedClose: '',
    notes: ''
  });

  // Filter loans
  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const matchesSearch = loan.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           loan.lender.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
      const matchesType = loanTypeFilter === 'all' || loan.loanType === loanTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [loans, searchTerm, statusFilter, loanTypeFilter]);

  // Pipeline by status
  const pipelineByStatus = useMemo(() => {
    const grouped = {};
    stages.forEach(stage => {
      grouped[stage] = loans.filter(l => l.status === stage);
    });
    return grouped;
  }, [loans]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeLoans = loans.filter(l => l.status !== 'Funded');
    const fundedLoans = loans.filter(l => l.status === 'Funded');
    const totalPipeline = activeLoans.reduce((sum, l) => sum + l.loanAmount, 0);
    const totalFunded = fundedLoans.reduce((sum, l) => sum + l.loanAmount, 0);
    const avgLTV = loans.reduce((sum, l) => sum + l.ltv, 0) / loans.length;
    const avgRate = loans.reduce((sum, l) => sum + l.interestRate, 0) / loans.length;

    return {
      totalLoans: loans.length,
      activeLoans: activeLoans.length,
      totalPipeline,
      totalFunded,
      avgLTV: avgLTV.toFixed(1),
      avgRate: avgRate.toFixed(2)
    };
  }, [loans]);

  const handleAddLoan = () => {
    const loan = {
      id: Math.max(...loans.map(l => l.id)) + 1,
      ...newLoan,
      loanAmount: parseFloat(newLoan.loanAmount) || 0,
      ltv: parseFloat(newLoan.ltv) || 0,
      interestRate: parseFloat(newLoan.interestRate) || 0,
      status: 'Application',
      stage: 1,
      totalStages: 6,
      applicationDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      documents: { submitted: 0, required: 15 },
      conditions: { cleared: 0, total: 0 },
      nextAction: 'Complete loan application package'
    };
    setLoans([...loans, loan]);
    setIsAddDialogOpen(false);
    setNewLoan({
      projectName: '',
      lender: '',
      loanType: '',
      loanAmount: '',
      ltv: '',
      interestRate: '',
      term: '',
      expectedClose: '',
      notes: ''
    });
    toast({
      title: "Loan Added",
      description: `${loan.projectName} has been added to the pipeline.`
    });
  };

  const handleStageAdvance = (loanId) => {
    setLoans(loans.map(loan => {
      if (loan.id === loanId && loan.stage < loan.totalStages) {
        const newStage = loan.stage + 1;
        return {
          ...loan,
          stage: newStage,
          status: stages[newStage - 1],
          lastUpdate: new Date().toISOString().split('T')[0]
        };
      }
      return loan;
    }));
    toast({
      title: "Stage Updated",
      description: "Loan has been advanced to the next stage."
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Application': 'bg-gray-100 text-gray-800',
      'Term Sheet': 'bg-blue-100 text-blue-800',
      'Underwriting': 'bg-yellow-100 text-yellow-800',
      'Due Diligence': 'bg-purple-100 text-purple-800',
      'Approved': 'bg-green-100 text-green-800',
      'Funded': 'bg-emerald-100 text-emerald-800',
      'On Hold': 'bg-orange-100 text-orange-800',
      'Declined': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Application': <FileText className="h-4 w-4" />,
      'Term Sheet': <FileText className="h-4 w-4" />,
      'Underwriting': <Clock className="h-4 w-4" />,
      'Due Diligence': <Search className="h-4 w-4" />,
      'Approved': <CheckCircle className="h-4 w-4" />,
      'Funded': <DollarSign className="h-4 w-4" />,
      'On Hold': <PauseCircle className="h-4 w-4" />,
      'Declined': <XCircle className="h-4 w-4" />
    };
    return icons[status] || <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Loan Pipeline Dashboard</h1>
          <p className="text-muted-foreground">Track and manage your financing pipeline</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Loan Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Loan Application</DialogTitle>
              <DialogDescription>Add a new loan to the pipeline</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    value={newLoan.projectName}
                    onChange={(e) => setNewLoan({ ...newLoan, projectName: e.target.value })}
                    placeholder="Riverside Apartments"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lender</Label>
                  <Input
                    value={newLoan.lender}
                    onChange={(e) => setNewLoan({ ...newLoan, lender: e.target.value })}
                    placeholder="First National Bank"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loan Type</Label>
                  <Select
                    value={newLoan.loanType}
                    onValueChange={(value) => setNewLoan({ ...newLoan, loanType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Bridge">Bridge</SelectItem>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Land Acquisition">Land Acquisition</SelectItem>
                      <SelectItem value="Refinance">Refinance</SelectItem>
                      <SelectItem value="Fix & Flip">Fix & Flip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Loan Amount ($)</Label>
                  <Input
                    type="number"
                    value={newLoan.loanAmount}
                    onChange={(e) => setNewLoan({ ...newLoan, loanAmount: e.target.value })}
                    placeholder="5000000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>LTV (%)</Label>
                  <Input
                    type="number"
                    value={newLoan.ltv}
                    onChange={(e) => setNewLoan({ ...newLoan, ltv: e.target.value })}
                    placeholder="75"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interest Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newLoan.interestRate}
                    onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                    placeholder="8.25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <Input
                    value={newLoan.term}
                    onChange={(e) => setNewLoan({ ...newLoan, term: e.target.value })}
                    placeholder="24 months"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expected Close Date</Label>
                <Input
                  type="date"
                  value={newLoan.expectedClose}
                  onChange={(e) => setNewLoan({ ...newLoan, expectedClose: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={newLoan.notes}
                  onChange={(e) => setNewLoan({ ...newLoan, notes: e.target.value })}
                  placeholder="Additional details..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddLoan} disabled={!newLoan.projectName || !newLoan.lender}>
                Add to Pipeline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalPipeline / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">{stats.activeLoans} active loans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funded</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalFunded / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Underwriting</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineByStatus['Underwriting']?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Loans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineByStatus['Approved']?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Ready to close</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg LTV</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgLTV}%</div>
            <p className="text-xs text-muted-foreground">Across pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRate}%</div>
            <p className="text-xs text-muted-foreground">Interest rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="kanban">Stage Board</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        {/* Pipeline View */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center flex-wrap">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search loans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {stages.map(stage => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Loan Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Bridge">Bridge</SelectItem>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                    <SelectItem value="Land Acquisition">Land Acquisition</SelectItem>
                    <SelectItem value="Refinance">Refinance</SelectItem>
                    <SelectItem value="Fix & Flip">Fix & Flip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredLoans.map(loan => (
              <Card key={loan.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{loan.projectName}</h3>
                        <Badge className={getStatusColor(loan.status)}>
                          {getStatusIcon(loan.status)}
                          <span className="ml-1">{loan.status}</span>
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{loan.lender} • {loan.loanType}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${(loan.loanAmount / 1000000).toFixed(2)}M</div>
                      <p className="text-sm text-muted-foreground">{loan.ltv}% LTV • {loan.interestRate}%</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Stage Progress</span>
                      <span>{loan.stage} of {loan.totalStages}</span>
                    </div>
                    <div className="flex gap-1">
                      {stages.map((stage, index) => (
                        <div
                          key={stage}
                          className={`flex-1 h-2 rounded ${
                            index < loan.stage ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                          title={stage}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      {stages.map((stage, index) => (
                        <span key={stage} className={index < loan.stage ? 'text-green-600 font-medium' : ''}>
                          {stage}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Documents:</span>
                      <div className="font-medium">{loan.documents.submitted}/{loan.documents.required}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conditions:</span>
                      <div className="font-medium">{loan.conditions.cleared}/{loan.conditions.total || '-'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected Close:</span>
                      <div className="font-medium">{loan.expectedClose}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Update:</span>
                      <div className="font-medium">{loan.lastUpdate}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Next: {loan.nextAction}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedLoan(loan)}>
                        View Details
                      </Button>
                      {loan.stage < loan.totalStages && (
                        <Button size="sm" onClick={() => handleStageAdvance(loan.id)}>
                          Advance Stage
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Kanban View */}
        <TabsContent value="kanban">
          <div className="grid grid-cols-6 gap-4">
            {stages.map(stage => (
              <div key={stage} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{stage}</h3>
                  <Badge variant="outline">{pipelineByStatus[stage]?.length || 0}</Badge>
                </div>
                <div className="space-y-2">
                  {pipelineByStatus[stage]?.map(loan => (
                    <Card key={loan.id} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedLoan(loan)}>
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm truncate">{loan.projectName}</h4>
                        <p className="text-xs text-muted-foreground truncate">{loan.lender}</p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="outline" className="text-xs">{loan.loanType}</Badge>
                          <span className="text-xs font-medium">${(loan.loanAmount / 1000000).toFixed(1)}M</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Lender</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>LTV</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expected Close</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map(loan => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.projectName}</TableCell>
                      <TableCell>{loan.lender}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{loan.loanType}</Badge>
                      </TableCell>
                      <TableCell>${(loan.loanAmount / 1000000).toFixed(2)}M</TableCell>
                      <TableCell>{loan.ltv}%</TableCell>
                      <TableCell>{loan.interestRate}%</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(loan.status)}>{loan.status}</Badge>
                      </TableCell>
                      <TableCell>{loan.expectedClose}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLoan(loan)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loan Detail Dialog */}
      <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedLoan?.projectName}</DialogTitle>
            <DialogDescription>
              {selectedLoan?.lender} • {selectedLoan?.loanType}
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-xl font-bold">${(selectedLoan.loanAmount / 1000000).toFixed(2)}M</div>
                    <div className="text-xs text-muted-foreground">Loan Amount</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-xl font-bold">{selectedLoan.ltv}%</div>
                    <div className="text-xs text-muted-foreground">LTV</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-xl font-bold">{selectedLoan.interestRate}%</div>
                    <div className="text-xs text-muted-foreground">Interest Rate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-xl font-bold">{selectedLoan.term}</div>
                    <div className="text-xs text-muted-foreground">Term</div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Status: {selectedLoan.status}</h4>
                <div className="flex gap-1 mb-2">
                  {stages.map((stage, index) => (
                    <div
                      key={stage}
                      className={`flex-1 h-3 rounded ${
                        index < selectedLoan.stage ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Documents</h4>
                  <Progress value={(selectedLoan.documents.submitted / selectedLoan.documents.required) * 100} />
                  <p className="text-sm text-muted-foreground">
                    {selectedLoan.documents.submitted} of {selectedLoan.documents.required} submitted
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Conditions</h4>
                  {selectedLoan.conditions.total > 0 ? (
                    <>
                      <Progress value={(selectedLoan.conditions.cleared / selectedLoan.conditions.total) * 100} />
                      <p className="text-sm text-muted-foreground">
                        {selectedLoan.conditions.cleared} of {selectedLoan.conditions.total} cleared
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No conditions yet</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Application Date:</span>
                  <span className="ml-2 font-medium">{selectedLoan.applicationDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Expected Close:</span>
                  <span className="ml-2 font-medium">{selectedLoan.expectedClose}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Update:</span>
                  <span className="ml-2 font-medium">{selectedLoan.lastUpdate}</span>
                </div>
                {selectedLoan.fundedDate && (
                  <div>
                    <span className="text-muted-foreground">Funded Date:</span>
                    <span className="ml-2 font-medium">{selectedLoan.fundedDate}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Next Action Required:</span>
                </div>
                <p className="text-orange-700 mt-1">{selectedLoan.nextAction}</p>
              </div>

              {selectedLoan.notes && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-1">Notes</h4>
                  <p className="text-sm">{selectedLoan.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
