// src/components/accounting/RunPayrollWizardModal.jsx
// Multi-step wizard for running payroll

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Play, Users, DollarSign, Calendar, CheckCircle, AlertCircle,
  Loader2, ChevronRight, Clock, FileText, Calculator, CreditCard
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Demo employees for development
const demoEmployees = [
  { id: 'emp-1', first_name: 'John', last_name: 'Smith', pay_type: 'salary', salary_amount: 75000, hourly_rate: null, hours_worked: 80, department: 'Management' },
  { id: 'emp-2', first_name: 'Jane', last_name: 'Doe', pay_type: 'hourly', salary_amount: null, hourly_rate: 35, hours_worked: 88, department: 'Field' },
  { id: 'emp-3', first_name: 'Mike', last_name: 'Johnson', pay_type: 'hourly', salary_amount: null, hourly_rate: 28, hours_worked: 80, department: 'Field' },
  { id: 'emp-4', first_name: 'Sarah', last_name: 'Williams', pay_type: 'salary', salary_amount: 65000, hourly_rate: null, hours_worked: 80, department: 'Administration' },
  { id: 'emp-5', first_name: 'Tom', last_name: 'Brown', pay_type: 'hourly', salary_amount: null, hourly_rate: 32, hours_worked: 84, department: 'Field' },
];

const payFrequencies = [
  { value: 'weekly', label: 'Weekly', periods: 52 },
  { value: 'biweekly', label: 'Bi-Weekly', periods: 26 },
  { value: 'semimonthly', label: 'Semi-Monthly', periods: 24 },
  { value: 'monthly', label: 'Monthly', periods: 12 },
];

export default function RunPayrollWizardModal({ open, onClose, entityId }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);

  const [payrollData, setPayrollData] = useState({
    pay_frequency: 'biweekly',
    pay_period_start: '',
    pay_period_end: '',
    pay_date: '',
  });

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeHours, setEmployeeHours] = useState({});
  const [payrollItems, setPayrollItems] = useState([]);
  const [payrollSummary, setPayrollSummary] = useState(null);

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', entityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('entity_id', entityId)
          .eq('status', 'active')
          .order('last_name');

        if (error) throw error;
        return data || demoEmployees;
      } catch (err) {
        console.error('Error fetching employees:', err);
        return demoEmployees;
      }
    },
    enabled: open,
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      // Calculate default dates based on frequency
      const today = new Date();
      let periodStart, periodEnd, payDate;

      // Default to biweekly
      const dayOfWeek = today.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 13 : dayOfWeek + 6;
      periodStart = new Date(today);
      periodStart.setDate(today.getDate() - daysToSubtract);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 13);
      payDate = new Date(periodEnd);
      payDate.setDate(periodEnd.getDate() + 5);

      setPayrollData({
        pay_frequency: 'biweekly',
        pay_period_start: periodStart.toISOString().split('T')[0],
        pay_period_end: periodEnd.toISOString().split('T')[0],
        pay_date: payDate.toISOString().split('T')[0],
      });

      setSelectedEmployees([]);
      setEmployeeHours({});
      setPayrollItems([]);
      setPayrollSummary(null);
      setStep(1);
      setError(null);
    }
  }, [open]);

  // Initialize employee selection when employees load
  useEffect(() => {
    if (employees.length > 0 && selectedEmployees.length === 0) {
      setSelectedEmployees(employees.map(e => e.id));
      const hours = {};
      employees.forEach(emp => {
        hours[emp.id] = emp.pay_type === 'salary' ? 80 : 80; // Default hours
      });
      setEmployeeHours(hours);
    }
  }, [employees]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const handleSelectEmployee = (empId) => {
    setSelectedEmployees(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
  };

  const handleHoursChange = (empId, hours) => {
    setEmployeeHours(prev => ({
      ...prev,
      [empId]: parseFloat(hours) || 0,
    }));
  };

  const calculatePayroll = () => {
    const frequency = payFrequencies.find(f => f.value === payrollData.pay_frequency);
    const periodsPerYear = frequency?.periods || 26;

    const items = employees
      .filter(emp => selectedEmployees.includes(emp.id))
      .map(emp => {
        const hours = employeeHours[emp.id] || 80;
        let grossPay = 0;
        let regularHours = Math.min(hours, 80);
        let overtimeHours = Math.max(0, hours - 80);

        if (emp.pay_type === 'salary') {
          grossPay = (emp.salary_amount || 0) / periodsPerYear;
        } else {
          const regularPay = regularHours * (emp.hourly_rate || 0);
          const overtimePay = overtimeHours * (emp.hourly_rate || 0) * 1.5;
          grossPay = regularPay + overtimePay;
        }

        // Calculate deductions (simplified)
        const federalTax = grossPay * 0.22; // Simplified flat rate
        const stateTax = grossPay * 0.05;
        const socialSecurity = grossPay * 0.062;
        const medicare = grossPay * 0.0145;
        const totalDeductions = federalTax + stateTax + socialSecurity + medicare;
        const netPay = grossPay - totalDeductions;

        // Employer taxes
        const employerSS = grossPay * 0.062;
        const employerMedicare = grossPay * 0.0145;
        const futa = grossPay * 0.006;
        const suta = grossPay * 0.027;
        const employerTaxes = employerSS + employerMedicare + futa + suta;

        return {
          employee_id: emp.id,
          employee: emp,
          hours_worked: hours,
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          gross_pay: grossPay,
          federal_tax: federalTax,
          state_tax: stateTax,
          social_security: socialSecurity,
          medicare: medicare,
          total_deductions: totalDeductions,
          net_pay: netPay,
          employer_taxes: employerTaxes,
        };
      });

    setPayrollItems(items);

    const summary = {
      employee_count: items.length,
      total_hours: items.reduce((sum, i) => sum + i.hours_worked, 0),
      total_gross: items.reduce((sum, i) => sum + i.gross_pay, 0),
      total_deductions: items.reduce((sum, i) => sum + i.total_deductions, 0),
      total_net: items.reduce((sum, i) => sum + i.net_pay, 0),
      total_employer_taxes: items.reduce((sum, i) => sum + i.employer_taxes, 0),
      total_cost: items.reduce((sum, i) => sum + i.gross_pay + i.employer_taxes, 0),
    };

    setPayrollSummary(summary);
    setStep(3);
  };

  const processPayrollMutation = useMutation({
    mutationFn: async () => {
      // Create payroll record
      const payrollNumber = `PR-${Date.now().toString().slice(-8)}`;

      const { data: payroll, error: payrollError } = await supabase
        .from('payrolls')
        .insert([{
          entity_id: entityId,
          payroll_number: payrollNumber,
          pay_frequency: payrollData.pay_frequency,
          pay_period_start: payrollData.pay_period_start,
          pay_period_end: payrollData.pay_period_end,
          pay_date: payrollData.pay_date,
          total_gross: payrollSummary.total_gross,
          total_deductions: payrollSummary.total_deductions,
          total_net: payrollSummary.total_net,
          total_employer_taxes: payrollSummary.total_employer_taxes,
          total_cost: payrollSummary.total_cost,
          employee_count: payrollSummary.employee_count,
          status: 'pending',
        }])
        .select()
        .single();

      if (payrollError) throw payrollError;

      // Create payroll items
      const itemsToInsert = payrollItems.map(item => ({
        payroll_id: payroll.id,
        employee_id: item.employee_id,
        hours_worked: item.hours_worked,
        regular_hours: item.regular_hours,
        overtime_hours: item.overtime_hours,
        gross_pay: item.gross_pay,
        federal_tax: item.federal_tax,
        state_tax: item.state_tax,
        social_security: item.social_security,
        medicare: item.medicare,
        total_deductions: item.total_deductions,
        net_pay: item.net_pay,
        employer_taxes: item.employer_taxes,
      }));

      const { error: itemsError } = await supabase
        .from('payroll_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return payroll;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payrolls', entityId]);
      setStep(5);
    },
    onError: (err) => {
      setError(err.message || 'Failed to process payroll');
    },
  });

  const handleProcessPayroll = () => {
    setStep(4);
    processPayrollMutation.mutate();
  };

  const handleClose = () => {
    setStep(1);
    setError(null);
    onClose();
  };

  const selectedCount = selectedEmployees.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Run Payroll
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Set pay period and select employees'}
            {step === 2 && 'Review and adjust hours worked'}
            {step === 3 && 'Review payroll before processing'}
            {step === 4 && 'Processing payroll...'}
            {step === 5 && 'Payroll processed successfully'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <React.Fragment key={s}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step >= s ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
              )}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 5 && (
                <div className={cn(
                  "w-8 h-0.5",
                  step > s ? "bg-purple-600" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Pay Period & Employee Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pay Frequency</Label>
                  <Select
                    value={payrollData.pay_frequency}
                    onValueChange={(value) => setPayrollData(prev => ({ ...prev, pay_frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {payFrequencies.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pay Date</Label>
                  <Input
                    type="date"
                    value={payrollData.pay_date}
                    onChange={(e) => setPayrollData(prev => ({ ...prev, pay_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Period Start</Label>
                  <Input
                    type="date"
                    value={payrollData.pay_period_start}
                    onChange={(e) => setPayrollData(prev => ({ ...prev, pay_period_start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Period End</Label>
                  <Input
                    type="date"
                    value={payrollData.pay_period_end}
                    onChange={(e) => setPayrollData(prev => ({ ...prev, pay_period_end: e.target.value }))}
                  />
                </div>
              </div>

              <div className="border rounded-lg">
                <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedEmployees.length === employees.length && employees.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="font-medium">Select Employees ({selectedCount}/{employees.length})</span>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y">
                  {employees.map((emp) => (
                    <div
                      key={emp.id}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer",
                        selectedEmployees.includes(emp.id) && "bg-purple-50"
                      )}
                      onClick={() => handleSelectEmployee(emp.id)}
                    >
                      <Checkbox
                        checked={selectedEmployees.includes(emp.id)}
                        onCheckedChange={() => handleSelectEmployee(emp.id)}
                      />
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                          {emp.first_name?.[0]}{emp.last_name?.[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                        <p className="text-xs text-muted-foreground">{emp.department || 'No department'}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{emp.pay_type}</Badge>
                      <p className="font-medium">
                        {emp.pay_type === 'salary'
                          ? formatCurrency(emp.salary_amount) + '/yr'
                          : formatCurrency(emp.hourly_rate) + '/hr'
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Enter Hours */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Enter hours worked for each employee. Overtime (over 80 hours) is calculated at 1.5x rate for hourly employees.
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2 text-sm font-medium">Employee</th>
                      <th className="text-left px-4 py-2 text-sm font-medium">Pay Type</th>
                      <th className="text-left px-4 py-2 text-sm font-medium">Rate</th>
                      <th className="text-center px-4 py-2 text-sm font-medium w-32">Hours</th>
                      <th className="text-right px-4 py-2 text-sm font-medium">Est. Gross</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {employees
                      .filter(emp => selectedEmployees.includes(emp.id))
                      .map((emp) => {
                        const hours = employeeHours[emp.id] || 80;
                        const frequency = payFrequencies.find(f => f.value === payrollData.pay_frequency);
                        let estGross = 0;

                        if (emp.pay_type === 'salary') {
                          estGross = (emp.salary_amount || 0) / (frequency?.periods || 26);
                        } else {
                          const regularHours = Math.min(hours, 80);
                          const overtimeHours = Math.max(0, hours - 80);
                          estGross = (regularHours * (emp.hourly_rate || 0)) + (overtimeHours * (emp.hourly_rate || 0) * 1.5);
                        }

                        return (
                          <tr key={emp.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-purple-600">
                                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                                  </span>
                                </div>
                                <span className="font-medium">{emp.first_name} {emp.last_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 capitalize">{emp.pay_type}</td>
                            <td className="px-4 py-3">
                              {emp.pay_type === 'salary'
                                ? formatCurrency(emp.salary_amount) + '/yr'
                                : formatCurrency(emp.hourly_rate) + '/hr'
                              }
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={hours}
                                onChange={(e) => handleHoursChange(emp.id, e.target.value)}
                                className="w-24 mx-auto text-center"
                              />
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {formatCurrency(estGross)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 3: Review Payroll */}
          {step === 3 && payrollSummary && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Employees</p>
                  <p className="text-xl font-bold">{payrollSummary.employee_count}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Gross Pay</p>
                  <p className="text-xl font-bold">{formatCurrency(payrollSummary.total_gross)}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Net Pay</p>
                  <p className="text-xl font-bold">{formatCurrency(payrollSummary.total_net)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg text-center">
                  <p className="text-xs text-purple-700">Total Cost</p>
                  <p className="text-xl font-bold text-purple-900">{formatCurrency(payrollSummary.total_cost)}</p>
                </div>
              </div>

              {/* Payroll Details Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Employee</th>
                      <th className="text-right px-3 py-2 font-medium">Hours</th>
                      <th className="text-right px-3 py-2 font-medium">Gross</th>
                      <th className="text-right px-3 py-2 font-medium">Deductions</th>
                      <th className="text-right px-3 py-2 font-medium">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payrollItems.map((item) => (
                      <tr key={item.employee_id}>
                        <td className="px-3 py-2 font-medium">
                          {item.employee.first_name} {item.employee.last_name}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.hours_worked}
                          {item.overtime_hours > 0 && (
                            <span className="text-xs text-orange-600 ml-1">
                              (+{item.overtime_hours} OT)
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.gross_pay)}</td>
                        <td className="px-3 py-2 text-right text-red-600">
                          -{formatCurrency(item.total_deductions)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.net_pay)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/50 font-bold">
                    <tr>
                      <td className="px-3 py-2">Totals</td>
                      <td className="px-3 py-2 text-right">{payrollSummary.total_hours}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(payrollSummary.total_gross)}</td>
                      <td className="px-3 py-2 text-right text-red-600">-{formatCurrency(payrollSummary.total_deductions)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(payrollSummary.total_net)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Employer Taxes */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-800">Employer Taxes & Contributions</p>
                    <p className="text-sm text-blue-700">Social Security, Medicare, FUTA, SUTA</p>
                  </div>
                  <p className="text-xl font-bold text-blue-900">{formatCurrency(payrollSummary.total_employer_taxes)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Processing */}
          {step === 4 && (
            <div className="py-12 text-center">
              <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="font-medium text-lg">Processing Payroll...</p>
              <p className="text-muted-foreground mt-1">
                Creating payroll records and calculating taxes
              </p>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 5 && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Payroll Processed!</h3>
              <p className="text-muted-foreground">
                Payroll for {payrollSummary?.employee_count} employees has been created
              </p>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm text-muted-foreground">Pay Date</p>
                    <p className="font-medium">{new Date(payrollData.pay_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Net Pay</p>
                    <p className="font-medium">{formatCurrency(payrollSummary?.total_net)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employer Taxes</p>
                    <p className="font-medium">{formatCurrency(payrollSummary?.total_employer_taxes)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="font-bold text-purple-600">{formatCurrency(payrollSummary?.total_cost)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <Button variant="outline" onClick={() => toast({ title: 'Pay stubs download started' })}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download Pay Stubs
                </Button>
                <Button variant="outline" onClick={() => toast({ title: 'Direct deposits processing started' })}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process Direct Deposits
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          {step === 1 && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={() => setStep(2)}
                disabled={selectedCount === 0}
              >
                Continue ({selectedCount} employees)
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={calculatePayroll}>
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Payroll
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleProcessPayroll}>
                <Play className="h-4 w-4 mr-2" />
                Process Payroll
              </Button>
            </>
          )}
          {step === 5 && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
