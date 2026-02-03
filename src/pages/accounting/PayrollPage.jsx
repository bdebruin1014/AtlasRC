// src/pages/accounting/PayrollPage.jsx
// Payroll Management

import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, DollarSign, Calendar, CheckCircle2, Clock, Plus,
  FileText, ChevronRight, AlertCircle, Building2, TrendingUp,
  MoreHorizontal, Eye, Edit, Trash2, Loader2, Play, UserPlus,
  Search, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import EmployeeFormModal from '@/components/accounting/EmployeeFormModal';
import RunPayrollWizardModal from '@/components/accounting/RunPayrollWizardModal';

// Demo data for development
const demoPayrolls = [
  {
    id: 'pr-1',
    payroll_number: 'PR-20250125',
    pay_period_start: '2025-01-13',
    pay_period_end: '2025-01-26',
    pay_date: '2025-01-31',
    pay_frequency: 'biweekly',
    employee_count: 12,
    total_gross: 45680.00,
    total_deductions: 12450.00,
    total_net: 33230.00,
    total_employer_taxes: 4110.00,
    total_cost: 49790.00,
    status: 'paid',
  },
  {
    id: 'pr-2',
    payroll_number: 'PR-20250111',
    pay_period_start: '2024-12-30',
    pay_period_end: '2025-01-12',
    pay_date: '2025-01-17',
    pay_frequency: 'biweekly',
    employee_count: 12,
    total_gross: 44890.00,
    total_deductions: 12230.00,
    total_net: 32660.00,
    total_employer_taxes: 4040.00,
    total_cost: 48930.00,
    status: 'paid',
  },
  {
    id: 'pr-3',
    payroll_number: 'PR-20250208',
    pay_period_start: '2025-01-27',
    pay_period_end: '2025-02-09',
    pay_date: '2025-02-14',
    pay_frequency: 'biweekly',
    employee_count: 12,
    total_gross: 46200.00,
    total_deductions: 12590.00,
    total_net: 33610.00,
    total_employer_taxes: 4158.00,
    total_cost: 50358.00,
    status: 'pending',
  },
];

const demoEmployees = [
  { id: 'emp-1', first_name: 'John', last_name: 'Smith', employee_id: 'EMP-001', pay_type: 'salary', salary_amount: 85000, hourly_rate: null, pay_frequency: 'biweekly', department: 'Management', status: 'active' },
  { id: 'emp-2', first_name: 'Jane', last_name: 'Doe', employee_id: 'EMP-002', pay_type: 'hourly', salary_amount: null, hourly_rate: 35, pay_frequency: 'biweekly', department: 'Field', status: 'active' },
  { id: 'emp-3', first_name: 'Mike', last_name: 'Johnson', employee_id: 'EMP-003', pay_type: 'hourly', salary_amount: null, hourly_rate: 28, pay_frequency: 'biweekly', department: 'Field', status: 'active' },
  { id: 'emp-4', first_name: 'Sarah', last_name: 'Williams', employee_id: 'EMP-004', pay_type: 'salary', salary_amount: 65000, hourly_rate: null, pay_frequency: 'biweekly', department: 'Administration', status: 'active' },
  { id: 'emp-5', first_name: 'Tom', last_name: 'Brown', employee_id: 'EMP-005', pay_type: 'hourly', salary_amount: null, hourly_rate: 32, pay_frequency: 'biweekly', department: 'Field', status: 'active' },
  { id: 'emp-6', first_name: 'Emily', last_name: 'Davis', employee_id: 'EMP-006', pay_type: 'salary', salary_amount: 72000, hourly_rate: null, pay_frequency: 'biweekly', department: 'Operations', status: 'active' },
];

export default function PayrollPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const context = useOutletContext();
  const entity = context?.entity;
  const basePath = `/accounting/entities/${entityId}`;

  const [showRunPayrollModal, setShowRunPayrollModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('payrolls');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch payrolls
  const { data: payrolls = [], isLoading: loadingPayrolls } = useQuery({
    queryKey: ['payrolls', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('payrolls')
          .select('*')
          .eq('entity_id', entityId)
          .order('pay_date', { ascending: false });

        if (error) throw error;
        return data || demoPayrolls;
      } catch (err) {
        console.error('Error fetching payrolls:', err);
        return demoPayrolls;
      }
    },
  });

  // Fetch employees
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('entity_id', entityId)
          .order('last_name');

        if (error) throw error;
        return data || demoEmployees;
      } catch (err) {
        console.error('Error fetching employees:', err);
        return demoEmployees;
      }
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId) => {
      const { error } = await supabase
        .from('employees')
        .update({ status: 'terminated' })
        .eq('id', employeeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees', entityId]);
    },
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const handleTerminateEmployee = (employee) => {
    if (confirm(`Terminate ${employee.first_name} ${employee.last_name}? This will mark them as inactive.`)) {
      deleteEmployeeMutation.mutate(employee.id);
    }
  };

  // Filter payrolls
  const filteredPayrolls = payrolls.filter(pr => {
    const matchesSearch = !searchTerm ||
      pr.payroll_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter employees
  const activeEmployees = employees.filter(e => e.status === 'active');
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = !searchTerm ||
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate summary stats
  const currentYear = new Date().getFullYear();
  const ytdPayrolls = payrolls.filter(p => new Date(p.pay_date).getFullYear() === currentYear);
  const stats = {
    activeEmployees: activeEmployees.length,
    ytdGross: ytdPayrolls.reduce((sum, p) => sum + (p.total_gross || 0), 0),
    ytdEmployerCost: ytdPayrolls.reduce((sum, p) => sum + (p.total_employer_taxes || 0), 0),
    ytdTotalCost: ytdPayrolls.reduce((sum, p) => sum + (p.total_cost || 0), 0),
    pendingPayrolls: payrolls.filter(p => p.status === 'pending' || p.status === 'draft').length,
    lastPayrollDate: payrolls.find(p => p.status === 'paid')?.pay_date,
  };

  const getStatusBadge = (status) => {
    const config = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      void: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };
    const c = config[status] || config.draft;
    const Icon = c.icon;
    return (
      <Badge className={cn(c.color, "flex items-center gap-1")}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isLoading = loadingPayrolls || loadingEmployees;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Payroll</h1>
          <p className="text-muted-foreground">Manage payroll and employees</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { setSelectedEmployee(null); setShowEmployeeModal(true); }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
          <Button onClick={() => setShowRunPayrollModal(true)}>
            <Play className="h-4 w-4 mr-2" />
            Run Payroll
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Employees</p>
                <p className="text-2xl font-bold">{stats.activeEmployees}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  On payroll
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">YTD Gross Wages</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.ytdGross)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentYear} to date
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">YTD Employer Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.ytdTotalCost)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Wages + taxes
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payrolls</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingPayrolls}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.lastPayrollDate ? `Last paid: ${formatDate(stats.lastPayrollDate)}` : 'No payrolls yet'}
                </p>
              </div>
              <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          className={cn(
            "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'payrolls'
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab('payrolls')}
        >
          Payroll Runs
        </button>
        <button
          className={cn(
            "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'employees'
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab('employees')}
        >
          Employees ({activeEmployees.length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === 'payrolls' ? 'Search payrolls...' : 'Search employees...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {activeTab === 'payrolls' && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Payrolls Tab */}
      {activeTab === 'payrolls' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Payroll #</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Pay Period</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Pay Date</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Employees</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Gross</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Net</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium font-mono">{payroll.payroll_number}</td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(payroll.pay_period_start)} - {formatDate(payroll.pay_period_end)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(payroll.pay_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{payroll.employee_count}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(payroll.total_gross)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(payroll.total_net)}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(payroll.status)}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`${basePath}/payroll/${payroll.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Downloading pay stubs...')}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Pay Stubs
                          </DropdownMenuItem>
                          {payroll.status === 'pending' && (
                            <DropdownMenuItem onClick={() => alert('Approving payroll...')}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve Payroll
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredPayrolls.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="font-medium">No payroll runs found</p>
                      <p className="text-sm">Run your first payroll to get started</p>
                      <Button className="mt-4" onClick={() => setShowRunPayrollModal(true)}>
                        <Play className="h-4 w-4 mr-2" />
                        Run Payroll
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Employee</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Pay Type</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Rate</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {emp.first_name?.[0]}{emp.last_name?.[0]}
                          </span>
                        </div>
                        <span className="font-medium">{emp.first_name} {emp.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{emp.employee_id}</td>
                    <td className="px-4 py-3 text-sm capitalize">{emp.department || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">{emp.pay_type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {emp.pay_type === 'salary'
                        ? formatCurrency(emp.salary_amount) + '/yr'
                        : `$${emp.hourly_rate?.toFixed(2)}/hr`
                      }
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn(
                        emp.status === 'active' && "bg-green-100 text-green-800",
                        emp.status === 'terminated' && "bg-red-100 text-red-800",
                        emp.status === 'inactive' && "bg-gray-100 text-gray-800",
                      )}>
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditEmployee(emp)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View/Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`${basePath}/employees/${emp.id}/pay-history`)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Pay History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {emp.status === 'active' && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleTerminateEmployee(emp)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Terminate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="font-medium">No employees found</p>
                      <p className="text-sm">Add employees to start running payroll</p>
                      <Button className="mt-4" onClick={() => { setSelectedEmployee(null); setShowEmployeeModal(true); }}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Employee
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Employee Form Modal */}
      <EmployeeFormModal
        open={showEmployeeModal}
        onClose={() => { setShowEmployeeModal(false); setSelectedEmployee(null); }}
        entityId={entityId}
        employee={selectedEmployee}
      />

      {/* Run Payroll Wizard Modal */}
      <RunPayrollWizardModal
        open={showRunPayrollModal}
        onClose={() => setShowRunPayrollModal(false)}
        entityId={entityId}
      />
    </div>
  );
}
