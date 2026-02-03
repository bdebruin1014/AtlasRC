// src/components/accounting/InitializePeriodsModal.jsx
// Modal for initializing fiscal periods for an entity

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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar, Loader2, AlertCircle, CheckCircle, Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const fiscalYearEndOptions = [
  { value: '12', label: 'December (Calendar Year)' },
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
];

const periodTypeOptions = [
  { value: 'monthly', label: 'Monthly (12 periods)' },
  { value: 'quarterly', label: 'Quarterly (4 periods)' },
  { value: '4-4-5', label: '4-4-5 Weeks (13 periods)' },
];

export default function InitializePeriodsModal({ open, onClose, entityId }) {
  const queryClient = useQueryClient();

  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [generatedPeriods, setGeneratedPeriods] = useState([]);
  const [formData, setFormData] = useState({
    fiscal_year_start: new Date().getFullYear(),
    fiscal_year_end_month: '12',
    period_type: 'monthly',
    number_of_years: 1,
    auto_close_days: 15,
    require_reconciliation: true,
    require_approval: true,
    lock_after_close: true,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setGeneratedPeriods([]);
      setFormData({
        fiscal_year_start: new Date().getFullYear(),
        fiscal_year_end_month: '12',
        period_type: 'monthly',
        number_of_years: 1,
        auto_close_days: 15,
        require_reconciliation: true,
        require_approval: true,
        lock_after_close: true,
      });
      setError(null);
    }
  }, [open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const generatePeriods = () => {
    const periods = [];
    const startYear = parseInt(formData.fiscal_year_start);
    const endMonth = parseInt(formData.fiscal_year_end_month);
    const yearsToGenerate = parseInt(formData.number_of_years);

    for (let y = 0; y < yearsToGenerate; y++) {
      const fiscalYear = startYear + y;

      if (formData.period_type === 'monthly') {
        for (let m = 0; m < 12; m++) {
          const periodMonth = ((endMonth + m) % 12) + 1;
          const periodYear = periodMonth <= endMonth ? fiscalYear : fiscalYear - 1;

          const startDate = new Date(periodYear, periodMonth - 1, 1);
          const endDate = new Date(periodYear, periodMonth, 0);

          periods.push({
            fiscal_year: fiscalYear,
            period_number: m + 1,
            period_name: `Period ${m + 1}`,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            month_name: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            status: 'open',
          });
        }
      } else if (formData.period_type === 'quarterly') {
        for (let q = 0; q < 4; q++) {
          const startMonth = ((endMonth + (q * 3)) % 12) + 1;
          const startYear = startMonth <= endMonth ? fiscalYear : fiscalYear - 1;
          const endMonthQ = ((endMonth + ((q + 1) * 3) - 1) % 12) + 1;
          const endYearQ = endMonthQ <= endMonth ? fiscalYear : fiscalYear - 1;

          const startDate = new Date(startYear, startMonth - 1, 1);
          const endDate = new Date(endYearQ, endMonthQ, 0);

          periods.push({
            fiscal_year: fiscalYear,
            period_number: q + 1,
            period_name: `Q${q + 1}`,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            month_name: `Q${q + 1} FY${fiscalYear}`,
            status: 'open',
          });
        }
      }
    }

    // Add adjustment period for each year
    for (let y = 0; y < yearsToGenerate; y++) {
      const fiscalYear = startYear + y;
      const lastPeriod = periods.filter(p => p.fiscal_year === fiscalYear).pop();
      if (lastPeriod) {
        periods.push({
          fiscal_year: fiscalYear,
          period_number: formData.period_type === 'monthly' ? 13 : 5,
          period_name: 'Adjustment',
          start_date: lastPeriod.end_date,
          end_date: lastPeriod.end_date,
          month_name: `Adj FY${fiscalYear}`,
          status: 'open',
          is_adjustment: true,
        });
      }
    }

    return periods;
  };

  const handleGeneratePeriods = () => {
    const periods = generatePeriods();
    setGeneratedPeriods(periods);
    setStep(2);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const periodsToInsert = generatedPeriods.map(period => ({
        entity_id: entityId,
        fiscal_year: period.fiscal_year,
        period_number: period.period_number,
        period_name: period.period_name,
        start_date: period.start_date,
        end_date: period.end_date,
        status: 'open',
        is_adjustment: period.is_adjustment || false,
        require_reconciliation: formData.require_reconciliation,
        require_approval: formData.require_approval,
        lock_after_close: formData.lock_after_close,
        auto_close_days: formData.auto_close_days,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('fiscal_periods')
        .insert(periodsToInsert);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['fiscal-periods', entityId]);
      queryClient.invalidateQueries(['month-end-close', entityId]);
      setStep(3);
    },
    onError: (err) => {
      setError(err.message || 'Failed to initialize periods');
    },
  });

  const handleSubmit = () => {
    if (step === 1) {
      handleGeneratePeriods();
    } else if (step === 2) {
      saveMutation.mutate();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group periods by fiscal year
  const groupedPeriods = generatedPeriods.reduce((acc, period) => {
    if (!acc[period.fiscal_year]) acc[period.fiscal_year] = [];
    acc[period.fiscal_year].push(period);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Initialize Fiscal Periods
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "w-12 h-1 mx-1",
                  step > s ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-8 text-xs text-muted-foreground mb-4">
          <span>Configure</span>
          <span>Review Periods</span>
          <span>Complete</span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1: Configure */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                Initialize fiscal periods to enable month-end close processes.
                Periods define when transactions can be posted and when books are closed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fiscal_year_start">Starting Fiscal Year</Label>
                <Input
                  id="fiscal_year_start"
                  type="number"
                  min="2020"
                  max="2030"
                  value={formData.fiscal_year_start}
                  onChange={(e) => handleChange('fiscal_year_start', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fiscal Year End Month</Label>
                <Select
                  value={formData.fiscal_year_end_month}
                  onValueChange={(value) => handleChange('fiscal_year_end_month', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fiscalYearEndOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period Type</Label>
                <Select
                  value={formData.period_type}
                  onValueChange={(value) => handleChange('period_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="number_of_years">Years to Generate</Label>
                <Select
                  value={formData.number_of_years.toString()}
                  onValueChange={(value) => handleChange('number_of_years', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Close Process Settings</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_close_days">Auto-close after (days)</Label>
                    <p className="text-xs text-muted-foreground">Days after period end to auto-close</p>
                  </div>
                  <Input
                    id="auto_close_days"
                    type="number"
                    min="0"
                    max="60"
                    value={formData.auto_close_days}
                    onChange={(e) => handleChange('auto_close_days', e.target.value)}
                    className="w-20"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="require_reconciliation"
                    checked={formData.require_reconciliation}
                    onCheckedChange={(checked) => handleChange('require_reconciliation', checked)}
                  />
                  <div>
                    <Label htmlFor="require_reconciliation" className="cursor-pointer">
                      Require bank reconciliation
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      All bank accounts must be reconciled before closing
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="require_approval"
                    checked={formData.require_approval}
                    onCheckedChange={(checked) => handleChange('require_approval', checked)}
                  />
                  <div>
                    <Label htmlFor="require_approval" className="cursor-pointer">
                      Require approval to close
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Manager approval required to close period
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="lock_after_close"
                    checked={formData.lock_after_close}
                    onCheckedChange={(checked) => handleChange('lock_after_close', checked)}
                  />
                  <div>
                    <Label htmlFor="lock_after_close" className="cursor-pointer">
                      Lock period after close
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Prevent posting to closed periods
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review Periods */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review the fiscal periods that will be created. You can modify these after initialization.
            </p>

            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {Object.entries(groupedPeriods).map(([year, periods]) => (
                <div key={year}>
                  <div className="px-4 py-2 bg-muted/50 font-medium text-sm">
                    Fiscal Year {year}
                  </div>
                  <div className="divide-y">
                    {periods.map((period) => (
                      <div
                        key={`${period.fiscal_year}-${period.period_number}`}
                        className={cn(
                          "flex items-center justify-between px-4 py-2 text-sm",
                          period.is_adjustment && "bg-amber-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-muted-foreground w-6">
                            {period.period_number}
                          </span>
                          <span>{period.month_name}</span>
                          {period.is_adjustment && (
                            <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                              Adj
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {formatDate(period.start_date)} - {formatDate(period.end_date)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Periods</span>
                <span className="font-medium">{generatedPeriods.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Periods Initialized!</h3>
            <p className="text-muted-foreground mb-4">
              {generatedPeriods.length} fiscal periods have been created successfully.
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-left">
              <p className="font-medium mb-1">Next Steps:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Review periods in the Fiscal Periods page</li>
                <li>Configure close checklists for each period</li>
                <li>Set up recurring close tasks</li>
              </ul>
            </div>
          </div>
        )}

        <DialogFooter>
          {step < 3 ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={step === 1 ? onClose : () => setStep(step - 1)}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {step === 1 ? 'Generate Periods' : 'Initialize Periods'}
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
