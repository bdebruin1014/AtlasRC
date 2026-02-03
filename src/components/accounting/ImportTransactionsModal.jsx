import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const COLUMN_MAPPINGS = [
  { value: 'date', label: 'Date' },
  { value: 'description', label: 'Description' },
  { value: 'amount', label: 'Amount' },
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
  { value: 'balance', label: 'Balance' },
  { value: 'reference', label: 'Reference/Check #' },
  { value: 'category', label: 'Category' },
  { value: 'skip', label: 'Skip Column' },
];

export default function ImportTransactionsModal({ open, onClose, entityId, bankAccountId }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1: upload, 2: mapping, 3: preview, 4: importing
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState({ headers: [], rows: [] });
  const [columnMappings, setColumnMappings] = useState({});
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });

    return { headers, rows: rows.filter(r => r.some(v => v)) };
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);

    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      setCsvData(parsed);

      // Auto-detect column mappings
      const autoMappings = {};
      parsed.headers.forEach((header, idx) => {
        const h = header.toLowerCase();
        if (h.includes('date')) autoMappings[idx] = 'date';
        else if (h.includes('desc') || h.includes('memo') || h.includes('payee')) autoMappings[idx] = 'description';
        else if (h.includes('amount')) autoMappings[idx] = 'amount';
        else if (h.includes('debit') || h.includes('withdrawal')) autoMappings[idx] = 'debit';
        else if (h.includes('credit') || h.includes('deposit')) autoMappings[idx] = 'credit';
        else if (h.includes('balance')) autoMappings[idx] = 'balance';
        else if (h.includes('ref') || h.includes('check')) autoMappings[idx] = 'reference';
        else autoMappings[idx] = 'skip';
      });
      setColumnMappings(autoMappings);
      setStep(2);
    } catch (err) {
      setError('Failed to parse CSV file');
    }
  };

  const handleMappingChange = (columnIndex, mapping) => {
    setColumnMappings(prev => ({ ...prev, [columnIndex]: mapping }));
  };

  const getMappedTransactions = () => {
    const mappings = columnMappings;
    const dateIdx = Object.entries(mappings).find(([, v]) => v === 'date')?.[0];
    const descIdx = Object.entries(mappings).find(([, v]) => v === 'description')?.[0];
    const amountIdx = Object.entries(mappings).find(([, v]) => v === 'amount')?.[0];
    const debitIdx = Object.entries(mappings).find(([, v]) => v === 'debit')?.[0];
    const creditIdx = Object.entries(mappings).find(([, v]) => v === 'credit')?.[0];
    const refIdx = Object.entries(mappings).find(([, v]) => v === 'reference')?.[0];

    return csvData.rows.map((row, idx) => {
      let amount = 0;
      if (amountIdx !== undefined) {
        amount = parseFloat(row[amountIdx]?.replace(/[$,]/g, '') || '0');
      } else {
        const debit = parseFloat(row[debitIdx]?.replace(/[$,]/g, '') || '0');
        const credit = parseFloat(row[creditIdx]?.replace(/[$,]/g, '') || '0');
        amount = credit - debit;
      }

      return {
        row_number: idx + 1,
        date: row[dateIdx] || '',
        description: row[descIdx] || '',
        amount,
        reference: row[refIdx] || '',
        raw: row,
      };
    }).filter(t => t.date && (t.amount !== 0 || t.description));
  };

  const importMutation = useMutation({
    mutationFn: async (transactions) => {
      const toInsert = transactions.map(t => ({
        entity_id: entityId,
        bank_account_id: bankAccountId,
        transaction_date: new Date(t.date).toISOString().split('T')[0],
        description: t.description,
        amount: t.amount,
        reference_number: t.reference || null,
        match_status: 'unmatched',
        source: 'csv_import',
      }));

      const { data, error } = await supabase
        .from('bank_transactions')
        .insert(toInsert)
        .select();

      if (error) throw error;
      return { imported: data.length, total: transactions.length };
    },
    onSuccess: (result) => {
      setImportResult(result);
      setStep(4);
      queryClient.invalidateQueries(['bank-transactions', entityId]);
      queryClient.invalidateQueries(['bank-feeds', entityId]);
    },
    onError: (err) => {
      setError(err.message || 'Failed to import transactions');
    }
  });

  const handleImport = () => {
    const transactions = getMappedTransactions();
    importMutation.mutate(transactions);
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setCsvData({ headers: [], rows: [] });
    setColumnMappings({});
    setImportResult(null);
    setError(null);
    onClose();
  };

  const previewTransactions = getMappedTransactions().slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Upload a CSV file to import bank transactions'}
            {step === 2 && 'Map the columns in your CSV to transaction fields'}
            {step === 3 && 'Review the transactions before importing'}
            {step === 4 && 'Import complete'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="py-8">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <Button type="button" variant="outline">
                Select File
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Supports CSV files exported from your bank
            </p>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 2 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{file?.name}</span>
              <span className="text-sm text-muted-foreground">
                ({csvData.rows.length} rows)
              </span>
            </div>

            <div className="space-y-3">
              {csvData.headers.map((header, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-40 font-medium text-sm truncate" title={header}>
                    {header}
                  </div>
                  <div className="text-muted-foreground">&rarr;</div>
                  <Select
                    value={columnMappings[idx] || 'skip'}
                    onValueChange={(val) => handleMappingChange(idx, val)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMN_MAPPINGS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex-1 text-sm text-muted-foreground truncate">
                    {csvData.rows[0]?.[idx] || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {getMappedTransactions().length} transactions to import. Here's a preview:
            </p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-right p-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {previewTransactions.map((t, idx) => (
                    <tr key={idx}>
                      <td className="p-2">{t.date}</td>
                      <td className="p-2 truncate max-w-xs">{t.description}</td>
                      <td className={cn(
                        "p-2 text-right font-medium",
                        t.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        ${Math.abs(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {getMappedTransactions().length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                ...and {getMappedTransactions().length - 5} more transactions
              </p>
            )}
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Import Complete!</h3>
            <p className="text-muted-foreground">
              Successfully imported {importResult?.imported} of {importResult?.total} transactions
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 1 && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Preview</Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleImport} disabled={importMutation.isPending}>
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>Import {getMappedTransactions().length} Transactions</>
                )}
              </Button>
            </>
          )}
          {step === 4 && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
