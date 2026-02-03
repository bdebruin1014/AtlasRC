// src/components/accounting/EmployeeFormModal.jsx
// Modal for creating and editing employees

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  User, DollarSign, Calendar, Building2, FileText,
  Loader2, AlertCircle, Mail, Phone, MapPin, CreditCard
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const payTypes = [
  { value: 'salary', label: 'Salary' },
  { value: 'hourly', label: 'Hourly' },
];

const payFrequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'semimonthly', label: 'Semi-Monthly' },
  { value: 'monthly', label: 'Monthly' },
];

const employmentTypes = [
  { value: 'full_time', label: 'Full-Time' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'temporary', label: 'Temporary' },
];

const filingStatuses = [
  { value: 'single', label: 'Single' },
  { value: 'married_filing_jointly', label: 'Married Filing Jointly' },
  { value: 'married_filing_separately', label: 'Married Filing Separately' },
  { value: 'head_of_household', label: 'Head of Household' },
];

const departments = [
  { value: 'operations', label: 'Operations' },
  { value: 'administration', label: 'Administration' },
  { value: 'field', label: 'Field/Construction' },
  { value: 'sales', label: 'Sales' },
  { value: 'management', label: 'Management' },
  { value: 'accounting', label: 'Accounting' },
];

export default function EmployeeFormModal({ open, onClose, entityId, employee = null }) {
  const queryClient = useQueryClient();
  const isEditing = !!employee;

  const [activeTab, setActiveTab] = useState('personal');
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    ssn: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',

    // Employment Details
    employee_id: '',
    hire_date: '',
    department: '',
    job_title: '',
    employment_type: 'full_time',
    manager_id: '',

    // Compensation
    pay_type: 'hourly',
    hourly_rate: '',
    salary_amount: '',
    pay_frequency: 'biweekly',

    // Tax Information
    filing_status: 'single',
    federal_allowances: '0',
    state_allowances: '0',
    additional_federal_withholding: '',
    additional_state_withholding: '',
    exempt_from_federal: false,
    exempt_from_state: false,

    // Banking
    bank_name: '',
    routing_number: '',
    account_number: '',
    account_type: 'checking',
  });

  // Reset form when modal opens/closes or employee changes
  useEffect(() => {
    if (open) {
      if (employee) {
        setFormData({
          first_name: employee.first_name || '',
          last_name: employee.last_name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          date_of_birth: employee.date_of_birth || '',
          ssn: employee.ssn || '',
          address_line1: employee.address_line1 || '',
          address_line2: employee.address_line2 || '',
          city: employee.city || '',
          state: employee.state || '',
          zip: employee.zip || '',
          employee_id: employee.employee_id || '',
          hire_date: employee.hire_date || '',
          department: employee.department || '',
          job_title: employee.job_title || '',
          employment_type: employee.employment_type || 'full_time',
          manager_id: employee.manager_id || '',
          pay_type: employee.pay_type || 'hourly',
          hourly_rate: employee.hourly_rate?.toString() || '',
          salary_amount: employee.salary_amount?.toString() || '',
          pay_frequency: employee.pay_frequency || 'biweekly',
          filing_status: employee.filing_status || 'single',
          federal_allowances: employee.federal_allowances?.toString() || '0',
          state_allowances: employee.state_allowances?.toString() || '0',
          additional_federal_withholding: employee.additional_federal_withholding?.toString() || '',
          additional_state_withholding: employee.additional_state_withholding?.toString() || '',
          exempt_from_federal: employee.exempt_from_federal || false,
          exempt_from_state: employee.exempt_from_state || false,
          bank_name: employee.bank_name || '',
          routing_number: employee.routing_number || '',
          account_number: employee.account_number || '',
          account_type: employee.account_type || 'checking',
        });
      } else {
        // Generate employee ID
        const empId = `EMP-${Date.now().toString().slice(-6)}`;
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          date_of_birth: '',
          ssn: '',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip: '',
          employee_id: empId,
          hire_date: new Date().toISOString().split('T')[0],
          department: '',
          job_title: '',
          employment_type: 'full_time',
          manager_id: '',
          pay_type: 'hourly',
          hourly_rate: '',
          salary_amount: '',
          pay_frequency: 'biweekly',
          filing_status: 'single',
          federal_allowances: '0',
          state_allowances: '0',
          additional_federal_withholding: '',
          additional_state_withholding: '',
          exempt_from_federal: false,
          exempt_from_state: false,
          bank_name: '',
          routing_number: '',
          account_number: '',
          account_type: 'checking',
        });
      }
      setActiveTab('personal');
      setError(null);
    }
  }, [open, employee]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const employeeData = {
        entity_id: entityId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        date_of_birth: data.date_of_birth || null,
        ssn: data.ssn || null,
        address_line1: data.address_line1 || null,
        address_line2: data.address_line2 || null,
        city: data.city || null,
        state: data.state || null,
        zip: data.zip || null,
        employee_id: data.employee_id,
        hire_date: data.hire_date || null,
        department: data.department || null,
        job_title: data.job_title || null,
        employment_type: data.employment_type,
        pay_type: data.pay_type,
        hourly_rate: data.pay_type === 'hourly' ? parseFloat(data.hourly_rate) || 0 : null,
        salary_amount: data.pay_type === 'salary' ? parseFloat(data.salary_amount) || 0 : null,
        pay_frequency: data.pay_frequency,
        filing_status: data.filing_status,
        federal_allowances: parseInt(data.federal_allowances) || 0,
        state_allowances: parseInt(data.state_allowances) || 0,
        additional_federal_withholding: parseFloat(data.additional_federal_withholding) || 0,
        additional_state_withholding: parseFloat(data.additional_state_withholding) || 0,
        exempt_from_federal: data.exempt_from_federal,
        exempt_from_state: data.exempt_from_state,
        bank_name: data.bank_name || null,
        routing_number: data.routing_number || null,
        account_number: data.account_number || null,
        account_type: data.account_type || 'checking',
        status: 'active',
      };

      if (isEditing) {
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', employee.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('employees')
          .insert([employeeData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees', entityId]);
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to save employee');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.first_name.trim()) {
      setError('First name is required');
      setActiveTab('personal');
      return;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      setActiveTab('personal');
      return;
    }
    if (formData.pay_type === 'hourly' && (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0)) {
      setError('Valid hourly rate is required');
      setActiveTab('compensation');
      return;
    }
    if (formData.pay_type === 'salary' && (!formData.salary_amount || parseFloat(formData.salary_amount) <= 0)) {
      setError('Valid salary amount is required');
      setActiveTab('compensation');
      return;
    }

    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? 'Edit Employee' : 'Add Employee'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="compensation">Compensation</TabsTrigger>
              <TabsTrigger value="tax">Tax & Banking</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {/* Personal Tab */}
              <TabsContent value="personal" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssn">SSN (Last 4)</Label>
                    <Input
                      id="ssn"
                      placeholder="XXX-XX-1234"
                      value={formData.ssn}
                      onChange={(e) => handleChange('ssn', e.target.value)}
                      maxLength={11}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_line1">Address</Label>
                  <Input
                    id="address_line1"
                    placeholder="Street address"
                    value={formData.address_line1}
                    onChange={(e) => handleChange('address_line1', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP</Label>
                    <Input
                      id="zip"
                      value={formData.zip}
                      onChange={(e) => handleChange('zip', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Employment Tab */}
              <TabsContent value="employment" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Employee ID</Label>
                    <Input
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) => handleChange('employee_id', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hire_date">Hire Date</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => handleChange('hire_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleChange('department', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      placeholder="e.g., Project Manager"
                      value={formData.job_title}
                      onChange={(e) => handleChange('job_title', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select
                    value={formData.employment_type}
                    onValueChange={(value) => handleChange('employment_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Compensation Tab */}
              <TabsContent value="compensation" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label>Pay Type *</Label>
                  <Select
                    value={formData.pay_type}
                    onValueChange={(value) => handleChange('pay_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {payTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.pay_type === 'hourly' ? (
                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="hourly_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.hourly_rate}
                        onChange={(e) => handleChange('hourly_rate', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="salary_amount">Annual Salary *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="salary_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.salary_amount}
                        onChange={(e) => handleChange('salary_amount', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Pay Frequency</Label>
                  <Select
                    value={formData.pay_frequency}
                    onValueChange={(value) => handleChange('pay_frequency', value)}
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

                {formData.pay_type === 'salary' && formData.salary_amount && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Per Pay Period:</p>
                    <p className="text-lg font-bold">
                      ${(parseFloat(formData.salary_amount) / (formData.pay_frequency === 'weekly' ? 52 : formData.pay_frequency === 'biweekly' ? 26 : formData.pay_frequency === 'semimonthly' ? 24 : 12)).toFixed(2)}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Tax & Banking Tab */}
              <TabsContent value="tax" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label>Filing Status</Label>
                  <Select
                    value={formData.filing_status}
                    onValueChange={(value) => handleChange('filing_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filingStatuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="federal_allowances">Federal Allowances</Label>
                    <Input
                      id="federal_allowances"
                      type="number"
                      min="0"
                      value={formData.federal_allowances}
                      onChange={(e) => handleChange('federal_allowances', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state_allowances">State Allowances</Label>
                    <Input
                      id="state_allowances"
                      type="number"
                      min="0"
                      value={formData.state_allowances}
                      onChange={(e) => handleChange('state_allowances', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="exempt_from_federal"
                      checked={formData.exempt_from_federal}
                      onCheckedChange={(checked) => handleChange('exempt_from_federal', checked)}
                    />
                    <Label htmlFor="exempt_from_federal" className="font-normal">Exempt from federal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="exempt_from_state"
                      checked={formData.exempt_from_state}
                      onCheckedChange={(checked) => handleChange('exempt_from_state', checked)}
                    />
                    <Label htmlFor="exempt_from_state" className="font-normal">Exempt from state</Label>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Direct Deposit
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) => handleChange('bank_name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routing_number">Routing Number</Label>
                      <Input
                        id="routing_number"
                        value={formData.routing_number}
                        onChange={(e) => handleChange('routing_number', e.target.value)}
                        maxLength={9}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account_number">Account Number</Label>
                      <Input
                        id="account_number"
                        value={formData.account_number}
                        onChange={(e) => handleChange('account_number', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <Select
                        value={formData.account_type}
                        onValueChange={(value) => handleChange('account_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
