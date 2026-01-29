import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  MoreHorizontal,
  Eye,
  Edit2,
  Download,
  Send,
  Copy,
  Trash2,
  ArrowUpDown,
  Award
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const BidCollectionCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateBidPackage, setShowCreateBidPackage] = useState(false);
  const [showBidComparison, setShowBidComparison] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [bidPackageData, setBidPackageData] = useState({
    name: '',
    project: '',
    trade: '',
    dueDate: '',
    description: '',
    scope: ''
  });

  const bidPackages = [
    {
      id: 1,
      name: 'Electrical - Phase 2',
      project: 'Oakwood Estates',
      trade: 'Electrical',
      status: 'collecting',
      dueDate: '2024-03-25',
      budgetEstimate: 280000,
      bidsReceived: 4,
      bidsExpected: 5,
      lowestBid: 265000,
      highestBid: 312000,
      avgBid: 285000,
      bids: [
        { id: 1, contractor: 'Premier Electric', amount: 285000, daysToComplete: 28, status: 'received', submittedDate: '2024-03-10', selected: false },
        { id: 2, contractor: 'Austin Electrical Co', amount: 265000, daysToComplete: 32, status: 'received', submittedDate: '2024-03-12', selected: true },
        { id: 3, contractor: 'Volt Solutions', amount: 312000, daysToComplete: 25, status: 'received', submittedDate: '2024-03-14', selected: false },
        { id: 4, contractor: 'Spark Electric', amount: 278000, daysToComplete: 30, status: 'received', submittedDate: '2024-03-15', selected: false }
      ]
    },
    {
      id: 2,
      name: 'Plumbing - Downtown Homes',
      project: 'Downtown Homes',
      trade: 'Plumbing',
      status: 'collecting',
      dueDate: '2024-03-20',
      budgetEstimate: 220000,
      bidsReceived: 3,
      bidsExpected: 4,
      lowestBid: 198000,
      highestBid: 245000,
      avgBid: 218000,
      bids: [
        { id: 1, contractor: 'Smith Plumbing Co', amount: 245000, daysToComplete: 22, status: 'received', submittedDate: '2024-03-08', selected: false },
        { id: 2, contractor: 'Pro Plumbing Services', amount: 198000, daysToComplete: 28, status: 'received', submittedDate: '2024-03-10', selected: false },
        { id: 3, contractor: 'Capital Plumbing', amount: 211000, daysToComplete: 25, status: 'received', submittedDate: '2024-03-12', selected: false }
      ]
    },
    {
      id: 3,
      name: 'HVAC Installation',
      project: 'Oakwood Estates',
      trade: 'HVAC',
      status: 'awarded',
      dueDate: '2024-03-01',
      budgetEstimate: 320000,
      bidsReceived: 5,
      bidsExpected: 5,
      lowestBid: 298000,
      highestBid: 385000,
      avgBid: 335000,
      awardedTo: 'Quality HVAC',
      awardedAmount: 310000,
      bids: [
        { id: 1, contractor: 'Quality HVAC', amount: 310000, daysToComplete: 35, status: 'awarded', submittedDate: '2024-02-20', selected: true },
        { id: 2, contractor: 'Cool Air Systems', amount: 298000, daysToComplete: 42, status: 'declined', submittedDate: '2024-02-22', selected: false },
        { id: 3, contractor: 'Climate Control Inc', amount: 345000, daysToComplete: 32, status: 'declined', submittedDate: '2024-02-24', selected: false },
        { id: 4, contractor: 'Texas HVAC Pro', amount: 385000, daysToComplete: 30, status: 'declined', submittedDate: '2024-02-25', selected: false },
        { id: 5, contractor: 'Comfort Systems', amount: 337000, daysToComplete: 36, status: 'declined', submittedDate: '2024-02-26', selected: false }
      ]
    },
    {
      id: 4,
      name: 'Foundation Work',
      project: 'Riverside Development',
      trade: 'Foundation',
      status: 'draft',
      dueDate: '2024-04-01',
      budgetEstimate: 750000,
      bidsReceived: 0,
      bidsExpected: 4,
      lowestBid: null,
      highestBid: null,
      avgBid: null,
      bids: []
    },
    {
      id: 5,
      name: 'Roofing - Phase 1',
      project: 'Oakwood Estates',
      trade: 'Roofing',
      status: 'closed',
      dueDate: '2024-02-15',
      budgetEstimate: 180000,
      bidsReceived: 3,
      bidsExpected: 3,
      lowestBid: 165000,
      highestBid: 195000,
      avgBid: 178000,
      awardedTo: 'Apex Roofing',
      awardedAmount: 172000,
      bids: [
        { id: 1, contractor: 'Apex Roofing', amount: 172000, daysToComplete: 14, status: 'awarded', submittedDate: '2024-02-10', selected: true },
        { id: 2, contractor: 'Top Roof Co', amount: 165000, daysToComplete: 20, status: 'declined', submittedDate: '2024-02-12', selected: false },
        { id: 3, contractor: 'Roofing Masters', amount: 195000, daysToComplete: 12, status: 'declined', submittedDate: '2024-02-14', selected: false }
      ]
    }
  ];

  const projects = ['Oakwood Estates', 'Downtown Homes', 'Riverside Development'];
  const trades = ['Electrical', 'Plumbing', 'HVAC', 'Foundation', 'Roofing', 'Framing', 'Drywall'];

  const filteredPackages = useMemo(() => {
    return bidPackages.filter(pkg => {
      const matchesSearch = !searchQuery ||
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.project.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProject = projectFilter === 'all' || pkg.project === projectFilter;
      const matchesTrade = tradeFilter === 'all' || pkg.trade === tradeFilter;
      const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
      return matchesSearch && matchesProject && matchesTrade && matchesStatus;
    });
  }, [searchQuery, projectFilter, tradeFilter, statusFilter]);

  const stats = useMemo(() => ({
    totalPackages: bidPackages.length,
    collecting: bidPackages.filter(p => p.status === 'collecting').length,
    awarded: bidPackages.filter(p => p.status === 'awarded' || p.status === 'closed').length,
    totalBidsReceived: bidPackages.reduce((acc, p) => acc + p.bidsReceived, 0),
    totalBudget: bidPackages.reduce((acc, p) => acc + p.budgetEstimate, 0),
    totalAwarded: bidPackages.filter(p => p.awardedAmount).reduce((acc, p) => acc + p.awardedAmount, 0)
  }), []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'collecting': return 'bg-blue-100 text-blue-700';
      case 'reviewing': return 'bg-yellow-100 text-yellow-700';
      case 'awarded': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getBidStatusBadge = (status) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-700';
      case 'awarded': return 'bg-green-100 text-green-700';
      case 'declined': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleViewComparison = (pkg) => {
    setSelectedPackage(pkg);
    setShowBidComparison(true);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Bid Collection Center</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bid Collection Center</h1>
          <p className="text-gray-600 mt-2">Collect, compare, and store contractor bids with line-item breakdowns</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateBidPackage(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Bid Package
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Packages</p>
            <p className="text-2xl font-bold">{stats.totalPackages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Collecting Bids</p>
            <p className="text-2xl font-bold text-blue-600">{stats.collecting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Awarded</p>
            <p className="text-2xl font-bold text-green-600">{stats.awarded}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Bids Received</p>
            <p className="text-2xl font-bold">{stats.totalBidsReceived}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="text-2xl font-bold">${(stats.totalBudget / 1000000).toFixed(2)}M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Awarded</p>
            <p className="text-2xl font-bold text-green-600">${(stats.totalAwarded / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search bid packages..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Trade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                {trades.map(trade => (
                  <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="collecting">Collecting</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bid Packages */}
      <div className="space-y-4">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    pkg.status === 'awarded' || pkg.status === 'closed' ? 'bg-green-100' :
                    pkg.status === 'collecting' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <FileText className={`w-6 h-6 ${
                      pkg.status === 'awarded' || pkg.status === 'closed' ? 'text-green-600' :
                      pkg.status === 'collecting' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {pkg.name}
                      <Badge className={getStatusBadge(pkg.status)}>{pkg.status}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {pkg.project} • {pkg.trade} • Due: {pkg.dueDate}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pkg.bidsReceived > 0 && (
                    <Button variant="outline" size="sm" onClick={() => handleViewComparison(pkg)}>
                      <ArrowUpDown className="w-4 h-4 mr-1" />
                      Compare Bids
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="w-4 h-4 mr-2" />
                        Send to Contractors
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Summary Stats */}
              <div className="grid grid-cols-6 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-bold">${(pkg.budgetEstimate / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500">Budget</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{pkg.bidsReceived}/{pkg.bidsExpected}</p>
                  <p className="text-xs text-gray-500">Bids Received</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">
                    {pkg.lowestBid ? `$${(pkg.lowestBid / 1000).toFixed(0)}K` : '-'}
                  </p>
                  <p className="text-xs text-gray-500">Lowest Bid</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-600">
                    {pkg.highestBid ? `$${(pkg.highestBid / 1000).toFixed(0)}K` : '-'}
                  </p>
                  <p className="text-xs text-gray-500">Highest Bid</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {pkg.avgBid ? `$${(pkg.avgBid / 1000).toFixed(0)}K` : '-'}
                  </p>
                  <p className="text-xs text-gray-500">Average Bid</p>
                </div>
                <div className="text-center">
                  {pkg.awardedAmount ? (
                    <>
                      <p className="text-lg font-bold text-green-600">${(pkg.awardedAmount / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-500">Awarded</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-gray-400">-</p>
                      <p className="text-xs text-gray-500">Awarded</p>
                    </>
                  )}
                </div>
              </div>

              {/* Bids Table */}
              {pkg.bids.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contractor</TableHead>
                      <TableHead>Bid Amount</TableHead>
                      <TableHead>vs Budget</TableHead>
                      <TableHead>Days to Complete</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pkg.bids.map((bid) => {
                      const budgetVariance = ((bid.amount - pkg.budgetEstimate) / pkg.budgetEstimate * 100).toFixed(1);
                      return (
                        <TableRow key={bid.id} className={bid.selected ? 'bg-green-50' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {bid.selected && <Award className="w-4 h-4 text-green-600" />}
                              <span className="font-medium">{bid.contractor}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">${bid.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={parseFloat(budgetVariance) <= 0 ? 'text-green-600' : 'text-red-600'}>
                              {parseFloat(budgetVariance) > 0 ? '+' : ''}{budgetVariance}%
                            </span>
                          </TableCell>
                          <TableCell>{bid.daysToComplete} days</TableCell>
                          <TableCell>{bid.submittedDate}</TableCell>
                          <TableCell>
                            <Badge className={getBidStatusBadge(bid.status)}>{bid.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Bid
                                </DropdownMenuItem>
                                {bid.status === 'received' && (
                                  <DropdownMenuItem>
                                    <Award className="w-4 h-4 mr-2" />
                                    Award Bid
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {pkg.bids.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No bids received yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Bid Package Modal */}
      <Dialog open={showCreateBidPackage} onOpenChange={setShowCreateBidPackage}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Bid Package</DialogTitle>
            <DialogDescription>Create a new bid package to collect contractor bids</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Package Name</Label>
              <Input
                placeholder="e.g., Electrical - Phase 2"
                value={bidPackageData.name}
                onChange={(e) => setBidPackageData({...bidPackageData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Project</Label>
                <Select
                  value={bidPackageData.project}
                  onValueChange={(value) => setBidPackageData({...bidPackageData, project: value})}
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
              <div className="grid gap-2">
                <Label>Trade</Label>
                <Select
                  value={bidPackageData.trade}
                  onValueChange={(value) => setBidPackageData({...bidPackageData, trade: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade" />
                  </SelectTrigger>
                  <SelectContent>
                    {trades.map(trade => (
                      <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={bidPackageData.dueDate}
                onChange={(e) => setBidPackageData({...bidPackageData, dueDate: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of the work scope..."
                value={bidPackageData.description}
                onChange={(e) => setBidPackageData({...bidPackageData, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Scope of Work</Label>
              <Textarea
                placeholder="Detailed scope of work..."
                rows={4}
                value={bidPackageData.scope}
                onChange={(e) => setBidPackageData({...bidPackageData, scope: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBidPackage(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Create Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bid Comparison Modal */}
      <Dialog open={showBidComparison} onOpenChange={setShowBidComparison}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Bid Comparison - {selectedPackage?.name}</DialogTitle>
            <DialogDescription>Compare bids side by side</DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <div className="py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Bid Amount</TableHead>
                    <TableHead>vs Budget</TableHead>
                    <TableHead>vs Lowest</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>$/Day</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPackage.bids
                    .sort((a, b) => a.amount - b.amount)
                    .map((bid, index) => {
                      const budgetVariance = ((bid.amount - selectedPackage.budgetEstimate) / selectedPackage.budgetEstimate * 100).toFixed(1);
                      const lowestVariance = ((bid.amount - selectedPackage.lowestBid) / selectedPackage.lowestBid * 100).toFixed(1);
                      const perDay = Math.round(bid.amount / bid.daysToComplete);
                      return (
                        <TableRow key={bid.id} className={index === 0 ? 'bg-green-50' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {index === 0 && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                              <span className="font-medium">{bid.contractor}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">${bid.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={parseFloat(budgetVariance) <= 0 ? 'text-green-600' : 'text-red-600'}>
                              {parseFloat(budgetVariance) > 0 ? '+' : ''}{budgetVariance}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={index === 0 ? 'text-green-600' : 'text-gray-600'}>
                              {index === 0 ? 'Lowest' : `+${lowestVariance}%`}
                            </span>
                          </TableCell>
                          <TableCell>{bid.daysToComplete} days</TableCell>
                          <TableCell>${perDay.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBidComparison(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BidCollectionCenterPage;
