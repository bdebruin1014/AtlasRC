import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { journalEntryService } from '@/services/journalEntryService';
import { cn, formatCurrency } from '@/lib/utils';

// Mock cost centers / departments
const mockCostCenters = [
  { id: 1, code: 'ADMIN', name: 'Administration' },
  { id: 2, code: 'SALES', name: 'Sales & Marketing' },
  { id: 3, code: 'OPS', name: 'Operations' },
  { id: 4, code: 'FIN', name: 'Finance' },
  { id: 5, code: 'DEV', name: 'Development' },
  { id: 6, code: 'PROP-001', name: 'Downtown Tower' },
  { id: 7, code: 'PROP-002', name: 'Riverside Plaza' },
  { id: 8, code: 'PROP-003', name: 'Cedar Mill Apartments' },
  { id: 9, code: 'CORP', name: 'Corporate Overhead' },
];

// Mock chart of accounts
const mockAccounts = [
  { id: 1, number: '1000', name: 'Cash', type: 'Asset' },
  { id: 2, number: '1100', name: 'Accounts Receivable', type: 'Asset' },
  { id: 3, number: '1500', name: 'Fixed Assets', type: 'Asset' },
  { id: 4, number: '1510', name: 'Accumulated Depreciation', type: 'Asset' },
  { id: 5, number: '2000', name: 'Accounts Payable', type: 'Liability' },
  { id: 6, number: '2500', name: 'Notes Payable', type: 'Liability' },
  { id: 7, number: '3000', name: 'Owner\'s Equity', type: 'Equity' },
  { id: 8, number: '4000', name: 'Revenue', type: 'Revenue' },
  { id: 9, number: '5000', name: 'Cost of Goods Sold', type: 'Expense' },
  { id: 10, number: '6000', name: 'Operating Expenses', type: 'Expense' },
  { id: 11, number: '6100', name: 'Depreciation Expense', type: 'Expense' },
  { id: 12, number: '6200', name: 'Interest Expense', type: 'Expense' },
];

const JournalEntryForm = ({ entityId, existingEntry, onCancel, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    memo: '',
  });
  
  const [lines, setLines] = useState([
    { id: 1, account_id: '', debit: '', credit: '', cost_center_id: '' },
    { id: 2, account_id: '', debit: '', credit: '', cost_center_id: '' },
  ]);

  useEffect(() => {
    if (existingEntry) {
      setFormData({
        date: existingEntry.date,
        description: existingEntry.description || '',
        reference: existingEntry.reference || '',
        memo: existingEntry.memo || '',
      });
      if (existingEntry.lines && existingEntry.lines.length > 0) {
        setLines(existingEntry.lines.map((line, idx) => ({
          id: idx + 1,
          account_id: line.account_id?.toString() || '',
          debit: line.debit > 0 ? line.debit.toString() : '',
          credit: line.credit > 0 ? line.credit.toString() : '',
          cost_center_id: line.cost_center_id?.toString() || '',
        })));
      }
    }
  }, [existingEntry]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (lineId, field, value) => {
    setLines(prev => prev.map(line => {
      if (line.id !== lineId) return line;
      
      // If entering debit, clear credit and vice versa
      if (field === 'debit' && value) {
        return { ...line, debit: value, credit: '' };
      }
      if (field === 'credit' && value) {
        return { ...line, credit: value, debit: '' };
      }
      
      return { ...line, [field]: value };
    }));
  };

  const addLine = () => {
    const newId = Math.max(...lines.map(l => l.id)) + 1;
    setLines(prev => [...prev, { id: newId, account_id: '', debit: '', credit: '', cost_center_id: '' }]);
  };

  const removeLine = (lineId) => {
    if (lines.length <= 2) {
      toast({
        variant: 'destructive',
        title: 'Cannot Remove',
        description: 'A journal entry must have at least 2 lines.',
      });
      return;
    }
    setLines(prev => prev.filter(line => line.id !== lineId));
  };

  const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01;

  // Enhanced validation checks
  const validationErrors = [];

  // Check for zero amounts
  if (totalDebit === 0 && totalCredit === 0) {
    validationErrors.push('Entry must have at least one debit or credit amount.');
  }

  // Check that each line has only debit OR credit, not both
  const linesWithBoth = lines.filter(line =>
    parseFloat(line.debit) > 0 && parseFloat(line.credit) > 0
  );
  if (linesWithBoth.length > 0) {
    validationErrors.push('Each line can only have a debit OR a credit, not both.');
  }

  // Check for at least one debit and one credit line
  const hasDebit = lines.some(line => parseFloat(line.debit) > 0);
  const hasCredit = lines.some(line => parseFloat(line.credit) > 0);
  if ((hasDebit && !hasCredit) || (hasCredit && !hasDebit)) {
    validationErrors.push('Entry must have at least one debit and one credit line.');
  }

  // Check for duplicate accounts with same type (debit or credit)
  const accountDebits = {};
  const accountCredits = {};
  lines.forEach(line => {
    if (line.account_id) {
      if (parseFloat(line.debit) > 0) {
        accountDebits[line.account_id] = (accountDebits[line.account_id] || 0) + 1;
      }
      if (parseFloat(line.credit) > 0) {
        accountCredits[line.account_id] = (accountCredits[line.account_id] || 0) + 1;
      }
    }
  });
  const duplicateWarning = Object.values(accountDebits).some(count => count > 1) ||
                          Object.values(accountCredits).some(count => count > 1);

  const hasValidationErrors = validationErrors.length > 0;
  const canPost = isBalanced && !hasValidationErrors;

  const handleSubmit = async (asDraft = false) => {
    // Validation
    if (!formData.date || !formData.description) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in the date and description.',
      });
      return;
    }

    const validLines = lines.filter(line => 
      line.account_id && (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0)
    );

    if (validLines.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Invalid Entry',
        description: 'A journal entry must have at least 2 lines with accounts and amounts.',
      });
      return;
    }

    if (!asDraft) {
      if (!isBalanced) {
        toast({
          variant: 'destructive',
          title: 'Entry Not Balanced',
          description: `Debits and credits must be equal. Difference: ${formatCurrency(difference)}`,
        });
        return;
      }

      if (hasValidationErrors) {
        toast({
          variant: 'destructive',
          title: 'Validation Failed',
          description: validationErrors[0],
        });
        return;
      }
    }

    setLoading(true);
    try {
      const entryData = {
        entity_id: entityId,
        date: formData.date,
        description: formData.description,
        reference: formData.reference,
        memo: formData.memo,
        status: asDraft ? 'draft' : 'posted',
        total_debit: totalDebit,
        total_credit: totalCredit,
        lines: validLines.map(line => ({
          account_id: parseInt(line.account_id),
          debit: parseFloat(line.debit) || 0,
          credit: parseFloat(line.credit) || 0,
          cost_center_id: line.cost_center_id ? parseInt(line.cost_center_id) : null,
        })),
      };

      if (existingEntry) {
        await journalEntryService.update(existingEntry.id, entryData);
      } else {
        await journalEntryService.create(entryData);
      }

      toast({
        title: 'Success',
        description: `Journal entry ${existingEntry ? 'updated' : 'created'} successfully.`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save journal entry.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <h2 className="text-lg font-bold">
          {existingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
        </h2>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reference">Reference</Label>
            <Input
              id="reference"
              placeholder="Optional reference number"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            placeholder="What is this entry for?"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        {/* Lines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Entry Lines</Label>
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="w-4 h-4 mr-1" /> Add Line
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 text-sm font-medium text-gray-500">
              <div className="col-span-4">Account</div>
              <div className="col-span-2">Cost Center</div>
              <div className="col-span-2 text-right">Debit</div>
              <div className="col-span-2 text-right">Credit</div>
              <div className="col-span-2"></div>
            </div>

            {lines.map((line) => (
              <div key={line.id} className="grid grid-cols-12 gap-2 p-3 border-t items-center">
                <div className="col-span-4">
                  <Select
                    value={line.account_id}
                    onValueChange={(value) => handleLineChange(line.id, 'account_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.number} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Select
                    value={line.cost_center_id}
                    onValueChange={(value) => handleLineChange(line.id, 'cost_center_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {mockCostCenters.map((cc) => (
                        <SelectItem key={cc.id} value={cc.id.toString()}>
                          {cc.code} - {cc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="text-right"
                    value={line.debit}
                    onChange={(e) => handleLineChange(line.id, 'debit', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="text-right"
                    value={line.credit}
                    onChange={(e) => handleLineChange(line.id, 'credit', e.target.value)}
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(line.id)}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="grid grid-cols-12 gap-2 p-3 border-t bg-gray-50 font-medium">
              <div className="col-span-6 text-right">Totals:</div>
              <div className="col-span-2 text-right font-mono">{formatCurrency(totalDebit)}</div>
              <div className="col-span-2 text-right font-mono">{formatCurrency(totalCredit)}</div>
              <div className="col-span-2"></div>
            </div>
          </div>

          {/* Balance and Validation Indicator */}
          <div className="space-y-2">
            {/* Balance Status */}
            <div className={cn(
              "flex items-center gap-2 p-3 rounded-lg",
              isBalanced ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}>
              {isBalanced ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Debits equal credits - Entry is balanced</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>Out of balance by {formatCurrency(difference)} - {totalDebit > totalCredit ? 'Debits exceed credits' : 'Credits exceed debits'}</span>
                </>
              )}
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-amber-50 text-amber-700 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Validation Issues:</p>
                    <ul className="text-sm mt-1 space-y-1">
                      {validationErrors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Duplicate Warning */}
            {duplicateWarning && (
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">Multiple entries for the same account detected. Consider consolidating.</span>
              </div>
            )}
          </div>
        </div>

        {/* Memo */}
        <div className="grid gap-2">
          <Label htmlFor="memo">Memo</Label>
          <Textarea
            id="memo"
            placeholder="Additional notes..."
            value={formData.memo}
            onChange={(e) => handleChange('memo', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
        <Button type="button" variant="outline" onClick={() => handleSubmit(true)} disabled={loading}>
          Save as Draft
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading || !canPost}
            className="bg-[#2F855A] hover:bg-[#276749]"
          >
            {loading ? 'Saving...' : 'Post Entry'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryForm;
