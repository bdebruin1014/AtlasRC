import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Calendar,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  FileText,
  Building2,
  Users,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Gavel,
  Key,
  Banknote
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock closing data
const initialClosings = [
  {
    id: 1,
    projectName: 'Oak Street Industrial',
    closingDate: '2024-01-30',
    closingTime: '10:00 AM',
    purchasePrice: 14200000,
    earnestMoney: 500000,
    loanAmount: 9940000,
    closingCosts: 285000,
    status: 'On Track',
    daysToClose: 5,
    titleCompany: 'First American Title',
    titleOfficer: 'Jennifer Walsh',
    titlePhone: '(555) 234-5678',
    titleEmail: 'jwalsh@firstam.com',
    escrowNumber: 'ESC-2024-00892',
    closingLocation: '123 Main St, Suite 400, Atlanta, GA',
    parties: [
      { role: 'Buyer', name: 'Atlas Real Estate Holdings LLC', contact: 'Mike Johnson', status: 'Ready' },
      { role: 'Seller', name: 'Oak Industrial Partners', contact: 'David Smith', status: 'Ready' },
      { role: 'Buyer Attorney', name: 'Smith & Associates', contact: 'Robert Smith', status: 'Ready' },
      { role: 'Seller Attorney', name: 'Legal Partners LLP', contact: 'Sarah Lee', status: 'Ready' },
      { role: 'Lender', name: 'First National Bank', contact: 'John Williams', status: 'Pending Docs' }
    ],
    checklist: [
      { id: 1, item: 'Title commitment received', completed: true, dueDate: '2024-01-15' },
      { id: 2, item: 'Survey approved', completed: true, dueDate: '2024-01-20' },
      { id: 3, item: 'Loan documents received', completed: false, dueDate: '2024-01-28' },
      { id: 4, item: 'Wire instructions confirmed', completed: true, dueDate: '2024-01-25' },
      { id: 5, item: 'Final walkthrough scheduled', completed: true, dueDate: '2024-01-29' },
      { id: 6, item: 'Insurance binder received', completed: true, dueDate: '2024-01-25' },
      { id: 7, item: 'Entity documents to title', completed: true, dueDate: '2024-01-22' },
      { id: 8, item: 'Estoppels collected', completed: true, dueDate: '2024-01-25' },
      { id: 9, item: 'Prorations calculated', completed: false, dueDate: '2024-01-28' },
      { id: 10, item: 'Final settlement statement', completed: false, dueDate: '2024-01-29' }
    ],
    fundingSources: [
      { source: 'Loan Proceeds', amount: 9940000, status: 'Pending' },
      { source: 'Equity (Wire)', amount: 4545000, status: 'Ready' },
      { source: 'Earnest Money Credit', amount: 500000, status: 'Applied' }
    ],
    notes: 'Waiting on lender loan docs. Expected by 1/28.'
  },
  {
    id: 2,
    projectName: 'Harbor View Homes - Unit 11',
    closingDate: '2024-02-05',
    closingTime: '2:00 PM',
    purchasePrice: 925000,
    earnestMoney: 50000,
    loanAmount: 740000,
    closingCosts: 18500,
    status: 'On Track',
    daysToClose: 11,
    titleCompany: 'Chicago Title',
    titleOfficer: 'Amanda Chen',
    titlePhone: '(555) 345-6789',
    titleEmail: 'achen@chicagotitle.com',
    escrowNumber: 'ESC-2024-01102',
    closingLocation: '456 Harbor Blvd, Tampa, FL',
    parties: [
      { role: 'Buyer', name: 'John & Mary Thompson', contact: 'John Thompson', status: 'Ready' },
      { role: 'Seller', name: 'Harbor View Development LLC', contact: 'Mike Johnson', status: 'Ready' },
      { role: 'Buyer Agent', name: 'RE/MAX Realty', contact: 'Lisa Brown', status: 'Ready' },
      { role: 'Lender', name: 'Wells Fargo', contact: 'Tom Richards', status: 'Ready' }
    ],
    checklist: [
      { id: 1, item: 'Title commitment received', completed: true, dueDate: '2024-01-25' },
      { id: 2, item: 'Survey approved', completed: true, dueDate: '2024-01-28' },
      { id: 3, item: 'Loan documents received', completed: true, dueDate: '2024-02-01' },
      { id: 4, item: 'Wire instructions confirmed', completed: true, dueDate: '2024-02-02' },
      { id: 5, item: 'Final walkthrough scheduled', completed: true, dueDate: '2024-02-04' },
      { id: 6, item: 'HOA docs provided', completed: true, dueDate: '2024-01-30' }
    ],
    fundingSources: [
      { source: 'Buyer Loan', amount: 740000, status: 'Ready' },
      { source: 'Buyer Cash', amount: 253500, status: 'Ready' },
      { source: 'Earnest Money Credit', amount: 50000, status: 'Applied' }
    ],
    notes: 'Clean deal, all parties ready'
  },
  {
    id: 3,
    projectName: 'Sunset Land - Phase 1 Bulk Sale',
    closingDate: '2024-02-15',
    closingTime: '11:00 AM',
    purchasePrice: 3750000,
    earnestMoney: 200000,
    loanAmount: 0,
    closingCosts: 75000,
    status: 'At Risk',
    daysToClose: 21,
    titleCompany: 'Stewart Title',
    titleOfficer: 'Mark Davis',
    titlePhone: '(555) 456-7890',
    titleEmail: 'mdavis@stewart.com',
    escrowNumber: 'ESC-2024-01205',
    closingLocation: '789 Builder Lane, Phoenix, AZ',
    parties: [
      { role: 'Buyer', name: 'National Homes Inc', contact: 'Steve Builder', status: 'Ready' },
      { role: 'Seller', name: 'Sunset Development LLC', contact: 'Sarah Chen', status: 'Ready' },
      { role: 'Buyer Attorney', name: 'Builder Legal Group', contact: 'Jim Attorney', status: 'Pending Review' }
    ],
    checklist: [
      { id: 1, item: 'Title commitment received', completed: true, dueDate: '2024-02-01' },
      { id: 2, item: 'Plat recorded', completed: false, dueDate: '2024-02-10' },
      { id: 3, item: 'HOA docs drafted', completed: true, dueDate: '2024-02-05' },
      { id: 4, item: 'Utility letters obtained', completed: true, dueDate: '2024-02-01' },
      { id: 5, item: 'Final lot survey', completed: false, dueDate: '2024-02-12' },
      { id: 6, item: 'Development agreement executed', completed: false, dueDate: '2024-02-08' }
    ],
    fundingSources: [
      { source: 'Buyer Cash', amount: 3950000, status: 'Pending' },
      { source: 'Earnest Money Credit', amount: 200000, status: 'Applied' }
    ],
    notes: 'Plat recording delayed due to engineering review. May need to push closing.'
  }
];

export default function ClosingCoordinatorDashboardPage() {
  const [closings, setClosings] = useState(initialClosings);
  const [selectedClosing, setSelectedClosing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const filteredClosings = useMemo(() => {
    if (statusFilter === 'all') return closings;
    return closings.filter(c => c.status === statusFilter);
  }, [closings, statusFilter]);

  const stats = useMemo(() => {
    const totalValue = closings.reduce((sum, c) => sum + c.purchasePrice, 0);
    const onTrack = closings.filter(c => c.status === 'On Track').length;
    const atRisk = closings.filter(c => c.status === 'At Risk').length;
    const thisWeek = closings.filter(c => c.daysToClose <= 7).length;
    return { totalValue, onTrack, atRisk, thisWeek, total: closings.length };
  }, [closings]);

  const handleChecklistToggle = (closingId, itemId) => {
    setClosings(closings.map(closing => {
      if (closing.id === closingId) {
        const updatedChecklist = closing.checklist.map(item => {
          if (item.id === itemId) {
            return { ...item, completed: !item.completed };
          }
          return item;
        });
        return { ...closing, checklist: updatedChecklist };
      }
      return closing;
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'On Track': 'bg-green-100 text-green-800',
      'At Risk': 'bg-red-100 text-red-800',
      'Delayed': 'bg-yellow-100 text-yellow-800',
      'Closed': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPartyStatusColor = (status) => {
    const colors = {
      'Ready': 'bg-green-100 text-green-800',
      'Pending Docs': 'bg-yellow-100 text-yellow-800',
      'Pending Review': 'bg-orange-100 text-orange-800',
      'Not Started': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getFundingStatusColor = (status) => {
    const colors = {
      'Ready': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Applied': 'bg-blue-100 text-blue-800',
      'Received': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateProgress = (checklist) => {
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Closing Coordinator Dashboard</h1>
          <p className="text-muted-foreground">Manage and track all upcoming closings</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Closing
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalValue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">{stats.total} closings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">Closings scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onTrack}</div>
            <p className="text-xs text-muted-foreground">Ready to close</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.atRisk}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days to Close</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(closings.reduce((sum, c) => sum + c.daysToClose, 0) / closings.length)}
            </div>
            <p className="text-xs text-muted-foreground">Days remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Closings</SelectItem>
              <SelectItem value="On Track">On Track</SelectItem>
              <SelectItem value="At Risk">At Risk</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Closings List */}
      <div className="space-y-4">
        {filteredClosings.map(closing => (
          <Card key={closing.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{closing.projectName}</CardTitle>
                    <Badge className={getStatusColor(closing.status)}>{closing.status}</Badge>
                  </div>
                  <CardDescription className="mt-1">
                    <span className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {closing.closingDate} at {closing.closingTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {closing.closingLocation}
                      </span>
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${(closing.purchasePrice / 1000000).toFixed(2)}M</div>
                  <div className="text-sm text-muted-foreground">
                    {closing.daysToClose} days to close
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="checklist" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  <TabsTrigger value="parties">Parties</TabsTrigger>
                  <TabsTrigger value="funding">Funding</TabsTrigger>
                  <TabsTrigger value="title">Title Info</TabsTrigger>
                </TabsList>

                <TabsContent value="checklist">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Closing Readiness</span>
                      <span>{calculateProgress(closing.checklist)}% Complete</span>
                    </div>
                    <Progress value={calculateProgress(closing.checklist)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {closing.checklist.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleChecklistToggle(closing.id, item.id)}
                        />
                        <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                          {item.item}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {item.dueDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="parties">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {closing.parties.map((party, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{party.role}</TableCell>
                          <TableCell>{party.name}</TableCell>
                          <TableCell>{party.contact}</TableCell>
                          <TableCell>
                            <Badge className={getPartyStatusColor(party.status)}>
                              {party.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="funding">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Purchase Price</div>
                        <div className="text-xl font-bold">${closing.purchasePrice.toLocaleString()}</div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Loan Amount</div>
                        <div className="text-xl font-bold">${closing.loanAmount.toLocaleString()}</div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Closing Costs</div>
                        <div className="text-xl font-bold">${closing.closingCosts.toLocaleString()}</div>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Funding Source</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {closing.fundingSources.map((source, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{source.source}</TableCell>
                            <TableCell>${source.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={getFundingStatusColor(source.status)}>
                                {source.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="title">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Title Company</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {closing.titleCompany}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {closing.titleOfficer}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {closing.titlePhone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${closing.titleEmail}`} className="text-blue-600 hover:underline">
                            {closing.titleEmail}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Escrow Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Escrow #:</strong> {closing.escrowNumber}</div>
                        <div><strong>Earnest Money:</strong> ${closing.earnestMoney.toLocaleString()}</div>
                        <div><strong>Location:</strong> {closing.closingLocation}</div>
                      </div>
                    </div>
                  </div>
                  {closing.notes && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Notes:</span>
                      </div>
                      <p className="text-yellow-700 mt-1">{closing.notes}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
