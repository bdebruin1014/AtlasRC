// src/pages/accounting/PayrollPage.jsx
// Payroll Management - Manual Entry

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users, DollarSign, Calendar, CheckCircle2, Clock, Plus,
  FileText, ChevronRight, AlertCircle, Building2, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  getPayrollDashboard,
  getPayrolls,
  getPayrollById,
  createPayroll,
  approvePayroll,
  processPayroll,
  getEmployees,
  calculatePayrollItem,
  createPayrollItem,
  PAYROLL_STATUS,
  PAY_FREQUENCY,
} from '@/services/payrollService';

const PayrollPage = () => {
  const { entityId } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [activeTab, setActiveTab] = useState('payrolls');

  // New payroll form
  const [newPayroll, setNewPayroll] = useState({
    pay_period_start: '',
    pay_period_end: '',
    pay_date: '',
    pay_frequency: PAY_FREQUENCY.BIWEEKLY,
  });

  useEffect(() => {
    loadData();
  }, [entityId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardData, payrollsData, employeesData] = await Promise.all([
        getPayrollDashboard(entityId),
        getPayrolls(entityId),
        getEmployees(entityId, { status: 'active' }),
      ]);
      setDashboard(dashboardData);
      setPayrolls(payrollsData || []);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayroll = async () => {
    try {
      const payroll = await createPayroll({
        entity_id: entityId,
        ...newPayroll,
      });

      // Calculate and add payroll items for each employee
      for (const employee of employees) {
        const calculated = await calculatePayrollItem(employee.id, {
          start: newPayroll.pay_period_start,
          end: newPayroll.pay_period_end,
        });
        
        await createPayrollItem({
          payroll_id: payroll.id,
          ...calculated,
        });
      }

      setShowCreateModal(false);
      setNewPayroll({
        pay_period_start: '',
        pay_period_end: '',
        pay_date: '',
        pay_frequency: PAY_FREQUENCY.BIWEEKLY,
      });
      loadData();
    } catch (error) {
      console.error('Error creating payroll:', error);
    }
  };

  const handleViewPayroll = async (payrollId) => {
    try {
      const payroll = await getPayrollById(payrollId);
      setSelectedPayroll(payroll);
      setShowPayrollModal(true);
    } catch (error) {
      console.error('Error loading payroll:', error);
    }
  };

  const handleApprovePayroll = async (payrollId) => {
    try {
      await approvePayroll(payrollId, 'current-user-id'); // Replace with actual user ID
      loadData();
      if (selectedPayroll?.id === payrollId) {
        handleViewPayroll(payrollId);
      }
    } catch (error) {
      console.error('Error approving payroll:', error);
    }
  };

  const handleProcessPayroll = async (payrollId) => {
    try {
      await processPayroll(payrollId);
      loadData();
      setShowPayrollModal(false);
    } catch (error) {
      console.error('Error processing payroll:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
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

  const getStatusBadge = (status) => {
    const config = {
      [PAYROLL_STATUS.DRAFT]: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      [PAYROLL_STATUS.PENDING]: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      [PAYROLL_STATUS.APPROVED]: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
      [PAYROLL_STATUS.PAID]: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      [PAYROLL_STATUS.VOID]: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };
    const c = config[status] || config[PAYROLL_STATUS.DRAFT];
    const Icon = c.icon;
    return (
      <Badge className={cn(c.color, "flex items-center gap-1")}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" />
            Payroll
          </h1>
          <p className="text-gray-500 mt-1">Manage employee payroll and taxes</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Run Payroll
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Employees</p>
                <p className="text-2xl font-bold">{dashboard?.active_employees || 0}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">YTD Gross Wages</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboard?.ytd_gross)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">YTD Total Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboard?.ytd_employer_cost)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Payrolls</p>
                <p className="text-2xl font-bold text-amber-600">{dashboard?.pending_payrolls || 0}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Summary */}
      {dashboard?.quarterly_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quarterly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(dashboard.quarterly_summary).map(([quarter, data]) => (
                <div key={quarter} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700">{quarter}</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(data.gross)}</p>
                  <p className="text-xs text-gray-500">Gross Wages</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Taxes: {formatCurrency(data.employer_taxes)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          className={cn(
            "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'payrolls' 
              ? "border-purple-600 text-purple-600" 
              : "border-transparent text-gray-500 hover:text-gray-700"
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
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
          onClick={() => setActiveTab('employees')}
        >
          Employees ({employees.length})
        </button>
      </div>

      {/* Payrolls Tab */}
      {activeTab === 'payrolls' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Payroll #</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Pay Period</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Pay Date</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Gross</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Net</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{payroll.payroll_number}</td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(payroll.pay_period_start)} - {formatDate(payroll.pay_period_end)}
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDate(payroll.pay_date)}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(payroll.total_gross)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(payroll.total_net)}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(payroll.status)}</td>
                    <td className="px-4 py-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewPayroll(payroll.id)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {payrolls.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No payroll runs yet</p>
                      <Button 
                        className="mt-4" 
                        variant="outline"
                        onClick={() => setShowCreateModal(true)}
                      >
                        Run First Payroll
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
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Employee</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Pay Type</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Rate</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Frequency</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
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
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.employee_id}</td>
                    <td className="px-4 py-3 text-sm capitalize">{emp.pay_type}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {emp.pay_type === 'salary' 
                        ? formatCurrency(emp.salary_amount) + '/yr'
                        : formatCurrency(emp.hourly_rate) + '/hr'
                      }
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{emp.pay_frequency?.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn(
                        emp.status === 'active' && "bg-green-100 text-green-800",
                        emp.status === 'terminated' && "bg-red-100 text-red-800",
                      )}>
                        {emp.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Create Payroll Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Run Payroll</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pay Frequency</label>
              <select
                value={newPayroll.pay_frequency}
                onChange={(e) => setNewPayroll(prev => ({ ...prev, pay_frequency: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value={PAY_FREQUENCY.WEEKLY}>Weekly</option>
                <option value={PAY_FREQUENCY.BIWEEKLY}>Bi-Weekly</option>
                <option value={PAY_FREQUENCY.SEMIMONTHLY}>Semi-Monthly</option>
                <option value={PAY_FREQUENCY.MONTHLY}>Monthly</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Period Start</label>
                <input
                  type="date"
                  value={newPayroll.pay_period_start}
                  onChange={(e) => setNewPayroll(prev => ({ ...prev, pay_period_start: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Period End</label>
                <input
                  type="date"
                  value={newPayroll.pay_period_end}
                  onChange={(e) => setNewPayroll(prev => ({ ...prev, pay_period_end: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Pay Date</label>
              <input
                type="date"
                value={newPayroll.pay_date}
                onChange={(e) => setNewPayroll(prev => ({ ...prev, pay_date: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>{employees.length}</strong> employees will be included in this payroll
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePayroll}>
              Create Payroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payroll Detail Modal */}
      <Dialog open={showPayrollModal} onOpenChange={setShowPayrollModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Payroll {selectedPayroll?.payroll_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayroll && (
            <div className="space-y-4">
              {/* Payroll Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Pay Period</p>
                  <p className="font-medium">
                    {formatDate(selectedPayroll.pay_period_start)} - {formatDate(selectedPayroll.pay_period_end)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Pay Date</p>
                  <p className="font-medium">{formatDate(selectedPayroll.pay_date)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedPayroll.status)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Total Cost</p>
                  <p className="font-bold text-lg">{formatCurrency(selectedPayroll.total_cost)}</p>
                </div>
              </div>

              {/* Payroll Items */}
              <table className="w-full border rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-sm font-medium">Employee</th>
                    <th className="text-right px-3 py-2 text-sm font-medium">Gross</th>
                    <th className="text-right px-3 py-2 text-sm font-medium">Deductions</th>
                    <th className="text-right px-3 py-2 text-sm font-medium">Net Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedPayroll.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        {item.employee?.first_name} {item.employee?.last_name}
                      </td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.gross_pay)}</td>
                      <td className="px-3 py-2 text-right text-red-600">
                        -{formatCurrency(item.total_deductions)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.net_pay)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td className="px-3 py-2">Totals</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(selectedPayroll.total_gross)}</td>
                    <td className="px-3 py-2 text-right text-red-600">
                      -{formatCurrency(selectedPayroll.total_deductions)}
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrency(selectedPayroll.total_net)}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Employer Taxes */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Employer Taxes & Contributions</p>
                <p className="text-lg font-bold text-blue-900 mt-1">
                  {formatCurrency(selectedPayroll.total_employer_taxes)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayrollModal(false)}>
              Close
            </Button>
            {selectedPayroll?.status === PAYROLL_STATUS.DRAFT && (
              <Button onClick={() => handleApprovePayroll(selectedPayroll.id)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
            )}
            {selectedPayroll?.status === PAYROLL_STATUS.APPROVED && (
              <Button onClick={() => handleProcessPayroll(selectedPayroll.id)}>
                <DollarSign className="w-4 h-4 mr-2" />
                Process Payment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollPage;
