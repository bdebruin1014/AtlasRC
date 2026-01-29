import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  DollarSign,
  Calendar,
  User,
  Home,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MoreHorizontal,
  Eye,
  Edit2,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UnitSalesLeasePipelinePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pipelineMode, setPipelineMode] = useState('sales');
  const [showAddModal, setShowAddModal] = useState(false);

  const [transactionData, setTransactionData] = useState({
    unitNumber: '',
    buyerTenant: '',
    price: '',
    contractDate: '',
    closingDate: '',
    agent: '',
    notes: ''
  });

  const salesPipeline = [
    {
      id: 1,
      unitNumber: 'L-015',
      unitType: 'lot',
      project: 'Oakwood Estates',
      phase: 'Phase 1',
      tier: 'Premium',
      sqFt: 8500,
      listPrice: 127500,
      contractPrice: 125000,
      priceVariance: -1.96,
      buyer: 'Smith Family Trust',
      buyerContact: 'John Smith',
      buyerPhone: '(512) 555-0123',
      agent: 'Jennifer Martinez',
      status: 'under_contract',
      contractDate: '2024-03-01',
      closingDate: '2024-04-15',
      daysInPipeline: 28,
      earnestMoney: 5000,
      earnestMoneyReceived: true,
      loanApproved: false,
      inspectionComplete: true
    },
    {
      id: 2,
      unitNumber: 'L-022',
      unitType: 'lot',
      project: 'Oakwood Estates',
      phase: 'Phase 2',
      tier: 'Estate',
      sqFt: 12000,
      listPrice: 180000,
      contractPrice: 178000,
      priceVariance: -1.11,
      buyer: 'Chen Development LLC',
      buyerContact: 'Michael Chen',
      buyerPhone: '(512) 555-0234',
      agent: 'Sarah Chen',
      status: 'pending_closing',
      contractDate: '2024-02-15',
      closingDate: '2024-03-30',
      daysInPipeline: 42,
      earnestMoney: 10000,
      earnestMoneyReceived: true,
      loanApproved: true,
      inspectionComplete: true
    },
    {
      id: 3,
      unitNumber: 'H-005',
      unitType: 'home',
      project: 'Downtown Homes',
      phase: 'Phase 1',
      tier: 'Model B',
      sqFt: 2800,
      listPrice: 525000,
      contractPrice: null,
      priceVariance: null,
      buyer: null,
      buyerContact: null,
      buyerPhone: null,
      agent: 'Robert Thompson',
      status: 'showing',
      contractDate: null,
      closingDate: null,
      daysInPipeline: 14,
      showings: 5,
      lastShowing: '2024-03-10'
    },
    {
      id: 4,
      unitNumber: 'L-031',
      unitType: 'lot',
      project: 'Oakwood Estates',
      phase: 'Phase 2',
      tier: 'Standard',
      sqFt: 6500,
      listPrice: 97500,
      contractPrice: 97500,
      priceVariance: 0,
      buyer: 'Johnson Builders',
      buyerContact: 'Tom Johnson',
      buyerPhone: '(512) 555-0345',
      agent: 'Jennifer Martinez',
      status: 'closed',
      contractDate: '2024-01-20',
      closingDate: '2024-03-01',
      daysInPipeline: 41,
      earnestMoney: 3000,
      earnestMoneyReceived: true,
      loanApproved: true,
      inspectionComplete: true
    },
    {
      id: 5,
      unitNumber: 'L-018',
      unitType: 'lot',
      project: 'Oakwood Estates',
      phase: 'Phase 1',
      tier: 'Premium',
      sqFt: 9200,
      listPrice: 138000,
      contractPrice: 130000,
      priceVariance: -5.80,
      buyer: 'Williams Family',
      buyerContact: 'Susan Williams',
      buyerPhone: '(512) 555-0456',
      agent: 'Sarah Chen',
      status: 'negotiating',
      contractDate: null,
      closingDate: null,
      daysInPipeline: 7,
      lastOffer: 130000,
      counterOffer: 135000
    }
  ];

  const leasePipeline = [
    {
      id: 1,
      unitNumber: 'A-101',
      unitType: 'rental',
      project: 'Riverside Apartments',
      building: 'Building A',
      tier: '1BR',
      sqFt: 750,
      listRent: 1500,
      contractRent: 1475,
      rentVariance: -1.67,
      tenant: 'James Thompson',
      tenantPhone: '(512) 555-0567',
      tenantEmail: 'jthompson@email.com',
      agent: 'Property Manager',
      status: 'lease_signed',
      applicationDate: '2024-03-01',
      leaseStart: '2024-04-01',
      leaseEnd: '2025-03-31',
      securityDeposit: 1475,
      depositReceived: true,
      backgroundCheck: 'passed',
      incomeVerified: true
    },
    {
      id: 2,
      unitNumber: 'B-205',
      unitType: 'rental',
      project: 'Riverside Apartments',
      building: 'Building B',
      tier: '2BR',
      sqFt: 1100,
      listRent: 1950,
      contractRent: null,
      rentVariance: null,
      tenant: 'Maria Garcia',
      tenantPhone: '(512) 555-0678',
      tenantEmail: 'mgarcia@email.com',
      agent: 'Property Manager',
      status: 'application_review',
      applicationDate: '2024-03-08',
      leaseStart: null,
      leaseEnd: null,
      securityDeposit: null,
      depositReceived: false,
      backgroundCheck: 'pending',
      incomeVerified: false
    },
    {
      id: 3,
      unitNumber: 'A-215',
      unitType: 'rental',
      project: 'Riverside Apartments',
      building: 'Building A',
      tier: '2BR',
      sqFt: 1050,
      listRent: 1850,
      contractRent: 1850,
      rentVariance: 0,
      tenant: 'David Kim',
      tenantPhone: '(512) 555-0789',
      tenantEmail: 'dkim@email.com',
      agent: 'Property Manager',
      status: 'move_in_scheduled',
      applicationDate: '2024-02-20',
      leaseStart: '2024-03-15',
      leaseEnd: '2025-03-14',
      securityDeposit: 1850,
      depositReceived: true,
      backgroundCheck: 'passed',
      incomeVerified: true
    }
  ];

  const projects = ['Oakwood Estates', 'Downtown Homes', 'Riverside Apartments'];

  const salesStatuses = [
    { value: 'showing', label: 'Showing', color: 'bg-blue-100 text-blue-700' },
    { value: 'negotiating', label: 'Negotiating', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'under_contract', label: 'Under Contract', color: 'bg-purple-100 text-purple-700' },
    { value: 'pending_closing', label: 'Pending Closing', color: 'bg-orange-100 text-orange-700' },
    { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-700' }
  ];

  const leaseStatuses = [
    { value: 'application_review', label: 'Application Review', color: 'bg-blue-100 text-blue-700' },
    { value: 'lease_sent', label: 'Lease Sent', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'lease_signed', label: 'Lease Signed', color: 'bg-purple-100 text-purple-700' },
    { value: 'move_in_scheduled', label: 'Move-in Scheduled', color: 'bg-orange-100 text-orange-700' },
    { value: 'occupied', label: 'Occupied', color: 'bg-green-100 text-green-700' }
  ];

  const currentPipeline = pipelineMode === 'sales' ? salesPipeline : leasePipeline;
  const currentStatuses = pipelineMode === 'sales' ? salesStatuses : leaseStatuses;

  const filteredPipeline = useMemo(() => {
    return currentPipeline.filter(item => {
      const matchesSearch = !searchQuery ||
        item.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.buyer && item.buyer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tenant && item.tenant.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesProject = projectFilter === 'all' || item.project === projectFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [searchQuery, projectFilter, statusFilter, currentPipeline]);

  const stats = useMemo(() => {
    if (pipelineMode === 'sales') {
      const underContract = salesPipeline.filter(s => ['under_contract', 'pending_closing'].includes(s.status));
      return {
        total: salesPipeline.length,
        active: salesPipeline.filter(s => s.status !== 'closed').length,
        underContract: underContract.length,
        pendingValue: underContract.reduce((acc, s) => acc + (s.contractPrice || 0), 0),
        closed: salesPipeline.filter(s => s.status === 'closed').length,
        avgDaysInPipeline: Math.round(salesPipeline.reduce((acc, s) => acc + s.daysInPipeline, 0) / salesPipeline.length)
      };
    } else {
      const pending = leasePipeline.filter(l => !['occupied'].includes(l.status));
      return {
        total: leasePipeline.length,
        active: pending.length,
        leasesSigned: leasePipeline.filter(l => ['lease_signed', 'move_in_scheduled', 'occupied'].includes(l.status)).length,
        pendingRent: pending.reduce((acc, l) => acc + (l.contractRent || l.listRent), 0),
        occupied: leasePipeline.filter(l => l.status === 'occupied').length,
        avgDaysToLease: 12
      };
    }
  }, [pipelineMode]);

  const getStatusBadge = (status) => {
    const statusInfo = currentStatuses.find(s => s.value === status);
    return statusInfo?.color || 'bg-gray-100 text-gray-700';
  };

  const getVarianceColor = (variance) => {
    if (variance === null) return '';
    if (variance >= 0) return 'text-green-600';
    if (variance > -3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Unit Sales & Lease Pipeline</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Unit Sales & Lease Pipeline</h1>
          <p className="text-gray-600 mt-2">Track individual unit transactions from showing to closing</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg">
            <Button
              variant={pipelineMode === 'sales' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setPipelineMode('sales')}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Sales
            </Button>
            <Button
              variant={pipelineMode === 'lease' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setPipelineMode('lease')}
            >
              <Building2 className="w-4 h-4 mr-1" />
              Leasing
            </Button>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add {pipelineMode === 'sales' ? 'Sale' : 'Lease'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">In Pipeline</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">
              {pipelineMode === 'sales' ? 'Under Contract' : 'Leases Signed'}
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {pipelineMode === 'sales' ? stats.underContract : stats.leasesSigned}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">
              {pipelineMode === 'sales' ? 'Pending Value' : 'Pending Rent'}
            </p>
            <p className="text-2xl font-bold">
              ${pipelineMode === 'sales'
                ? (stats.pendingValue / 1000).toFixed(0) + 'K'
                : stats.pendingRent.toLocaleString() + '/mo'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">
              {pipelineMode === 'sales' ? 'Closed' : 'Occupied'}
            </p>
            <p className="text-2xl font-bold text-green-600">
              {pipelineMode === 'sales' ? stats.closed : stats.occupied}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">
              {pipelineMode === 'sales' ? 'Avg Days in Pipeline' : 'Avg Days to Lease'}
            </p>
            <p className="text-2xl font-bold">
              {pipelineMode === 'sales' ? stats.avgDaysInPipeline : stats.avgDaysToLease}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={`Search ${pipelineMode === 'sales' ? 'units or buyers' : 'units or tenants'}...`}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {currentStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Table */}
      <Card>
        <CardHeader>
          <CardTitle>{pipelineMode === 'sales' ? 'Sales' : 'Lease'} Pipeline ({filteredPipeline.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>{pipelineMode === 'sales' ? 'Buyer' : 'Tenant'}</TableHead>
                <TableHead>List {pipelineMode === 'sales' ? 'Price' : 'Rent'}</TableHead>
                <TableHead>Contract {pipelineMode === 'sales' ? 'Price' : 'Rent'}</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>{pipelineMode === 'sales' ? 'Closing' : 'Move-in'}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPipeline.map((item) => {
                const listValue = pipelineMode === 'sales' ? item.listPrice : item.listRent;
                const contractValue = pipelineMode === 'sales' ? item.contractPrice : item.contractRent;
                const variance = pipelineMode === 'sales' ? item.priceVariance : item.rentVariance;
                const targetDate = pipelineMode === 'sales' ? item.closingDate : item.leaseStart;
                const contact = pipelineMode === 'sales' ? item.buyer : item.tenant;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.unitType === 'lot' && <MapPin className="w-4 h-4 text-gray-400" />}
                        {item.unitType === 'home' && <Home className="w-4 h-4 text-gray-400" />}
                        {item.unitType === 'rental' && <Building2 className="w-4 h-4 text-gray-400" />}
                        <div>
                          <p className="font-medium">{item.unitNumber}</p>
                          <p className="text-xs text-gray-500">{item.tier} • {item.sqFt.toLocaleString()} SF</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{item.project}</p>
                        <p className="text-xs text-gray-500">{item.phase || item.building}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{contact}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      ${listValue.toLocaleString()}{pipelineMode === 'lease' && '/mo'}
                    </TableCell>
                    <TableCell>
                      {contractValue ? (
                        <span className="font-semibold">
                          ${contractValue.toLocaleString()}{pipelineMode === 'lease' && '/mo'}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {variance !== null ? (
                        <span className={`flex items-center gap-1 ${getVarianceColor(variance)}`}>
                          {variance >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {variance >= 0 ? '+' : ''}{variance}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {targetDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {targetDate}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(item.status)}>
                        {currentStatuses.find(s => s.value === item.status)?.label}
                      </Badge>
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
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="w-4 h-4 mr-2" />
                            Documents
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add {pipelineMode === 'sales' ? 'Sale' : 'Lease'} Transaction</DialogTitle>
            <DialogDescription>Track a new unit transaction</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Unit Number</Label>
                <Input
                  placeholder="L-001"
                  value={transactionData.unitNumber}
                  onChange={(e) => setTransactionData({...transactionData, unitNumber: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>{pipelineMode === 'sales' ? 'Buyer' : 'Tenant'} Name</Label>
                <Input
                  placeholder="Name"
                  value={transactionData.buyerTenant}
                  onChange={(e) => setTransactionData({...transactionData, buyerTenant: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{pipelineMode === 'sales' ? 'Contract Price' : 'Monthly Rent'}</Label>
                <Input
                  type="number"
                  value={transactionData.price}
                  onChange={(e) => setTransactionData({...transactionData, price: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Contract Date</Label>
                <Input
                  type="date"
                  value={transactionData.contractDate}
                  onChange={(e) => setTransactionData({...transactionData, contractDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{pipelineMode === 'sales' ? 'Closing Date' : 'Move-in Date'}</Label>
                <Input
                  type="date"
                  value={transactionData.closingDate}
                  onChange={(e) => setTransactionData({...transactionData, closingDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Agent</Label>
                <Input
                  placeholder="Agent name"
                  value={transactionData.agent}
                  onChange={(e) => setTransactionData({...transactionData, agent: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input
                placeholder="Additional details..."
                value={transactionData.notes}
                onChange={(e) => setTransactionData({...transactionData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Add {pipelineMode === 'sales' ? 'Sale' : 'Lease'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitSalesLeasePipelinePage;
