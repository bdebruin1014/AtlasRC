import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function ImportJournalEntriesModal({ open, onClose, entityId }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: importing, 4: complete
  const [file, setFile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

    // Expected format: date, description, account, debit, credit, memo
    const parsed = [];
    let currentEntry = null;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      if (!values.some(v => v)) continue;

      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      // If row has a date and description, start a new entry
      if (row.date && row.description) {
        if (currentEntry && currentEntry.lines.length > 0) {
          parsed.push(currentEntry);
        }
        currentEntry = {
          date: row.date,
          description: row.description,
          lines: []
        };
      }

      // Add line item if we have account info
      if (currentEntry && row.account) {
        currentEntry.lines.push({
          account: row.account,
          debit: parseFloat(row.debit?.replace(/[$,]/g, '') || '0'),
          credit: parseFloat(row.credit?.replace(/[$,]/g, '') || '0'),
          memo: row.memo || ''
        });
      }
    }

    // Don't forget the last entry
    if (currentEntry && currentEntry.lines.length > 0) {
      parsed.push(currentEntry);
    }

    return parsed;
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

      if (parsed.length === 0) {
        setError('No valid journal entries found in file');
        return;
      }

      // Validate entries are balanced
      const validEntries = parsed.map(entry => {
        const totalDebits = entry.lines.reduce((sum, l) => sum + l.debit, 0);
        const totalCredits = entry.lines.reduce((sum, l) => sum + l.credit, 0);
        return {
          ...entry,
          totalDebits,
          totalCredits,
          isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
        };
      });

      setEntries(validEntries);
      setStep(2);
    } catch (err) {
      setError('Failed to parse CSV file');
    }
  };

  const importMutation = useMutation({
    mutationFn: async (entriesToImport) => {
      const results = [];
      for (const entry of entriesToImport) {
        if (!entry.isBalanced) continue;

        const { data, error } = await supabase
          .from('journal_entries')
          .insert([{
            entity_id: entityId,
            entry_date: new Date(entry.date).toISOString().split('T')[0],
            description: entry.description,
            status: 'draft',
            lines: entry.lines,
            total_debits: entry.totalDebits,
            total_credits: entry.totalCredits,
          }])
          .select()
          .single();

        if (!error) results.push(data);
      }
      return { imported: results.length, total: entriesToImport.length };
    },
    onSuccess: (result) => {
      setImportResult(result);
      setStep(4);
      queryClient.invalidateQueries(['journal-entries', entityId]);
    },
    onError: (err) => {
      setError(err.message || 'Failed to import journal entries');
      setStep(2);
    }
  });

  const handleImport = () => {
    setStep(3);
    const balancedEntries = entries.filter(e => e.isBalanced);
    importMutation.mutate(balancedEntries);
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setEntries([]);
    setImportResult(null);
    setError(null);
    onClose();
  };

  const downloadTemplate = () => {
    const template = `date,description,account,debit,credit,memo
2024-01-15,Monthly Depreciation,6100 - Depreciation Expense,5000,0,Building depreciation
,,1510 - Accumulated Depreciation,0,5000,
2024-01-15,Accrued Interest,7000 - Interest Expense,2500,0,Loan interest
,,2100 - Interest Payable,0,2500,`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'journal-entries-template.csv';
    a.click();
  };

  const balancedCount = entries.filter(e => e.isBalanced).length;
  const unbalancedCount = entries.length - balancedCount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Journal Entries</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Upload a CSV file to import journal entries'}
            {step === 2 && 'Review entries before importing'}
            {step === 3 && 'Importing entries...'}
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
          <div className="py-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
            >
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-lg font-medium mb-1">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
              <Button type="button" variant="outline" size="sm">
                Select File
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="link" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-1" />
                Download Template
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              CSV format: date, description, account, debit, credit, memo
            </p>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{file?.name}</span>
              <span className="text-sm text-muted-foreground">
                ({entries.length} entries)
              </span>
            </div>

            {unbalancedCount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                <AlertCircle className="h-4 w-4" />
                {unbalancedCount} entry(ies) are unbalanced and will be skipped
              </div>
            )}

            <div className="space-y-3">
              {entries.map((entry, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "border rounded-lg p-3",
                    entry.isBalanced ? "border-gray-200" : "border-red-200 bg-red-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm text-muted-foreground">{entry.date}</span>
                      <p className="font-medium">{entry.description}</p>
                    </div>
                    {entry.isBalanced ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Debits: ${entry.totalDebits.toLocaleString()}</span>
                      <span>Credits: ${entry.totalCredits.toLocaleString()}</span>
                    </div>
                    {!entry.isBalanced && (
                      <p className="text-red-600 text-xs mt-1">
                        Out of balance by ${Math.abs(entry.totalDebits - entry.totalCredits).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Importing */}
        {step === 3 && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="font-medium">Importing journal entries...</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Import Complete!</h3>
            <p className="text-muted-foreground">
              Successfully imported {importResult?.imported} of {importResult?.total} entries
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 1 && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => { setStep(1); setFile(null); setEntries([]); }}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={balancedCount === 0}>
                Import {balancedCount} Entries
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
