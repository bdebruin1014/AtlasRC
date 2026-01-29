import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  ExternalLink,
  MoreHorizontal,
  Eye,
  Edit2,
  RefreshCw,
  Bell,
  Shield,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const EntityComplianceDashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');

  const entities = [
    {
      id: 1,
      name: 'AtlasRC Holdings LLC',
      type: 'Holding Company',
      state: 'Delaware',
      formationDate: '2020-01-15',
      registeredAgent: 'CT Corporation',
      ein: '84-1234567',
      compliance: {
        annualReport: { status: 'current', dueDate: '2024-06-01', filedDate: '2024-03-15' },
        franchiseTax: { status: 'current', dueDate: '2024-03-01', paidDate: '2024-02-28' },
        goodStanding: { status: 'good', lastVerified: '2024-03-01' },
        registeredAgent: { status: 'current', expiresDate: '2025-01-15' }
      },
      overallStatus: 'compliant'
    },
    {
      id: 2,
      name: 'Oakwood Estates LP',
      type: 'Project Entity',
      state: 'Texas',
      formationDate: '2023-06-01',
      registeredAgent: 'Registered Agent Solutions',
      ein: '88-7654321',
      compliance: {
        annualReport: { status: 'due_soon', dueDate: '2024-05-01', filedDate: null },
        franchiseTax: { status: 'current', dueDate: '2024-05-15', paidDate: null },
        goodStanding: { status: 'good', lastVerified: '2024-02-15' },
        registeredAgent: { status: 'current', expiresDate: '2024-06-01' }
      },
      overallStatus: 'attention'
    },
    {
      id: 3,
      name: 'Riverside Development LLC',
      type: 'Project Entity',
      state: 'Texas',
      formationDate: '2022-03-15',
      registeredAgent: 'Registered Agent Solutions',
      ein: '85-9876543',
      compliance: {
        annualReport: { status: 'overdue', dueDate: '2024-02-15', filedDate: null },
        franchiseTax: { status: 'overdue', dueDate: '2024-02-15', paidDate: null },
        goodStanding: { status: 'unknown', lastVerified: '2023-12-01' },
        registeredAgent: { status: 'current', expiresDate: '2025-03-15' }
      },
      overallStatus: 'non_compliant'
    },
    {
      id: 4,
      name: 'Downtown Portfolio Holdings LLC',
      type: 'Holding Company',
      state: 'Delaware',
      formationDate: '2021-08-20',
      registeredAgent: 'CT Corporation',
      ein: '86-1122334',
      compliance: {
        annualReport: { status: 'current', dueDate: '2024-06-01', filedDate: '2024-02-20' },
        franchiseTax: { status: 'current', dueDate: '2024-03-01', paidDate: '2024-02-25' },
        goodStanding: { status: 'good', lastVerified: '2024-03-05' },
        registeredAgent: { status: 'current', expiresDate: '2025-08-20' }
      },
      overallStatus: 'compliant'
    },
    {
      id: 5,
      name: 'Liberty Hill Land Partners LP',
      type: 'Project Entity',
      state: 'Texas',
      formationDate: '2024-01-10',
      registeredAgent: 'Registered Agent Solutions',
      ein: '89-5566778',
      compliance: {
        annualReport: { status: 'not_due', dueDate: '2025-01-10', filedDate: null },
        franchiseTax: { status: 'not_due', dueDate: '2025-05-15', paidDate: null },
        goodStanding: { status: 'good', lastVerified: '2024-01-15' },
        registeredAgent: { status: 'current', expiresDate: '2025-01-10' }
      },
      overallStatus: 'compliant'
    },
    {
      id: 6,
      name: 'Austin Industrial Holdings LLC',
      type: 'Holding Company',
      state: 'Texas',
      formationDate: '2019-11-05',
      registeredAgent: 'National Registered Agents',
      ein: '83-4455667',
      compliance: {
        annualReport: { status: 'current', dueDate: '2024-05-15', filedDate: '2024-03-01' },
        franchiseTax: { status: 'due_soon', dueDate: '2024-05-15', paidDate: null },
        goodStanding: { status: 'good', lastVerified: '2024-02-28' },
        registeredAgent: { status: 'expiring_soon', expiresDate: '2024-04-05' }
      },
      overallStatus: 'attention'
    }
  ];

  const states = ['Delaware', 'Texas', 'Nevada', 'Wyoming'];

  const filteredEntities = useMemo(() => {
    return entities.filter(entity => {
      const matchesSearch = !searchQuery ||
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.ein.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || entity.overallStatus === statusFilter;
      const matchesState = stateFilter === 'all' || entity.state === stateFilter;
      return matchesSearch && matchesStatus && matchesState;
    });
  }, [searchQuery, statusFilter, stateFilter]);

  const stats = useMemo(() => ({
    total: entities.length,
    compliant: entities.filter(e => e.overallStatus === 'compliant').length,
    attention: entities.filter(e => e.overallStatus === 'attention').length,
    nonCompliant: entities.filter(e => e.overallStatus === 'non_compliant').length
  }), []);

  const getOverallStatusBadge = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-700';
      case 'attention': return 'bg-yellow-100 text-yellow-700';
      case 'non_compliant': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getItemStatusBadge = (status) => {
    switch (status) {
      case 'current':
      case 'good': return 'bg-green-100 text-green-700';
      case 'due_soon':
      case 'expiring_soon':
      case 'unknown': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'not_due': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getItemStatusIcon = (status) => {
    switch (status) {
      case 'current':
      case 'good': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'due_soon':
      case 'expiring_soon':
      case 'unknown': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getComplianceScore = (entity) => {
    const items = Object.values(entity.compliance);
    const compliantCount = items.filter(item =>
      item.status === 'current' || item.status === 'good' || item.status === 'not_due'
    ).length;
    return Math.round((compliantCount / items.length) * 100);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Entity Compliance Dashboard</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Entity Compliance Dashboard</h1>
          <p className="text-gray-600 mt-2">Track annual filings, registered agents, and good standing by entity</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Verify All
          </Button>
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Set Reminders
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Entities</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Compliant</p>
                <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={stats.attention > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Needs Attention</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.attention}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={stats.nonCompliant > 0 ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Non-Compliant</p>
                <p className="text-2xl font-bold text-red-600">{stats.nonCompliant}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.nonCompliant > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Urgent: Non-Compliant Entities</h3>
                <p className="text-red-700">
                  {stats.nonCompliant} entity(ies) have overdue filings or compliance issues that require immediate attention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search entities or EIN..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="attention">Needs Attention</SelectItem>
                <SelectItem value="non_compliant">Non-Compliant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Entities List */}
      <div className="space-y-4">
        {filteredEntities.map((entity) => (
          <Card key={entity.id} className={entity.overallStatus === 'non_compliant' ? 'border-red-200' : entity.overallStatus === 'attention' ? 'border-yellow-200' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    entity.overallStatus === 'compliant' ? 'bg-green-100' :
                    entity.overallStatus === 'attention' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <Building2 className={`w-6 h-6 ${
                      entity.overallStatus === 'compliant' ? 'text-green-600' :
                      entity.overallStatus === 'attention' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {entity.name}
                      <Badge className={getOverallStatusBadge(entity.overallStatus)}>
                        {entity.overallStatus === 'compliant' && 'Compliant'}
                        {entity.overallStatus === 'attention' && 'Needs Attention'}
                        {entity.overallStatus === 'non_compliant' && 'Non-Compliant'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span>{entity.type}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {entity.state}
                      </span>
                      <span>EIN: {entity.ein}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Compliance Score</p>
                    <div className="flex items-center gap-2">
                      <Progress value={getComplianceScore(entity)} className="w-24 h-2" />
                      <span className="font-semibold">{getComplianceScore(entity)}%</span>
                    </div>
                  </div>
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
                        Edit Entity
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="w-4 h-4 mr-2" />
                        View Documents
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Secretary of State
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Annual Report</span>
                    <Badge className={getItemStatusBadge(entity.compliance.annualReport.status)}>
                      {getItemStatusIcon(entity.compliance.annualReport.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Due: {entity.compliance.annualReport.dueDate}
                  </p>
                  {entity.compliance.annualReport.filedDate && (
                    <p className="text-xs text-green-600">
                      Filed: {entity.compliance.annualReport.filedDate}
                    </p>
                  )}
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Franchise Tax</span>
                    <Badge className={getItemStatusBadge(entity.compliance.franchiseTax.status)}>
                      {getItemStatusIcon(entity.compliance.franchiseTax.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Due: {entity.compliance.franchiseTax.dueDate}
                  </p>
                  {entity.compliance.franchiseTax.paidDate && (
                    <p className="text-xs text-green-600">
                      Paid: {entity.compliance.franchiseTax.paidDate}
                    </p>
                  )}
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Good Standing</span>
                    <Badge className={getItemStatusBadge(entity.compliance.goodStanding.status)}>
                      {getItemStatusIcon(entity.compliance.goodStanding.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Verified: {entity.compliance.goodStanding.lastVerified}
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Registered Agent</span>
                    <Badge className={getItemStatusBadge(entity.compliance.registeredAgent.status)}>
                      {getItemStatusIcon(entity.compliance.registeredAgent.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{entity.registeredAgent}</p>
                  <p className="text-xs text-gray-500">
                    Expires: {entity.compliance.registeredAgent.expiresDate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EntityComplianceDashboardPage;
