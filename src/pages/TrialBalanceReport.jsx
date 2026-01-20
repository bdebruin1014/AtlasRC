import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Calendar, Download, Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reportService } from '@/services/reportService';
import { format } from 'date-fns';

const TrialBalanceReport = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showZero, setShowZero] = useState(false);

  const runReport = async () => {
    setLoading(true);
    const result = await reportService.getTrialBalance(entityId, asOfDate);
    if (result.data) setData(result.data);
    setLoading(false);
  };

  useEffect(() => {
    runReport();
  }, []);

  const filteredData = showZero ? data : data.filter(acc => acc.displayDebit !== 0 || acc.displayCredit !== 0);
  const totalDebit = filteredData.reduce((s, i) => s + i.displayDebit, 0);
  const totalCredit = filteredData.reduce((s, i) => s + i.displayCredit, 0);

  const handlePrint = () => window.print();
  
  const handleExport = () => {
     const headers = ['Account Number,Account Name,Debit,Credit'];
     const rows = filteredData.map(d => `${d.account_number},"${d.account_name}",${d.displayDebit.toFixed(2)},${d.displayCredit.toFixed(2)}`);
     const csv = [headers, ...rows].join('\n');
     const blob = new Blob([csv], { type: 'text/csv' });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `TrialBalance_${asOfDate}.csv`;
     a.click();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
       <Helmet><title>Trial Balance | AtlasDev</title></Helmet>
       
       {/* Controls (Hidden on Print) */}
       <div className="max-w-[1000px] mx-auto w-full mb-6 print:hidden space-y-4">
          <div className="flex items-center justify-between">
             <Button variant="ghost" onClick={() => navigate('../reports')} className="-ml-2 text-gray-500">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reports
             </Button>
             <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
                <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Print</Button>
             </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap items-end gap-4">
             <div className="grid gap-1.5">
                <Label>As of Date</Label>
                <Input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} className="w-40" />
             </div>
             <div className="grid gap-1.5">
                 <Label>Show Zero Balances</Label>
                 <div className="flex items-center h-10">
                    <Switch checked={showZero} onCheckedChange={setShowZero} />
                 </div>
             </div>
             <Button onClick={runReport} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {loading ? 'Running...' : 'Run Report'}
             </Button>
          </div>
       </div>

       {/* Report Paper */}
       <div className="max-w-[1000px] mx-auto w-full bg-white shadow-lg print:shadow-none print:w-full p-8 min-h-[11in]">
          <div className="text-center mb-8">
             <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Trial Balance</h1>
             <p className="text-gray-600 mt-1">As of {format(new Date(asOfDate), 'MMMM d, yyyy')}</p>
          </div>

          <Table>
             <TableHeader>
                <TableRow className="border-b-2 border-gray-800">
                   <TableHead className="font-bold text-gray-900 w-[100px]">Acct #</TableHead>
                   <TableHead className="font-bold text-gray-900">Account Name</TableHead>
                   <TableHead className="font-bold text-gray-900 text-right w-[150px]">Debit</TableHead>
                   <TableHead className="font-bold text-gray-900 text-right w-[150px]">Credit</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {filteredData.map((row) => (
                   <TableRow key={row.id} className="border-gray-100">
                      <TableCell className="font-mono text-gray-600">{row.account_number}</TableCell>
                      <TableCell className="font-medium text-gray-900">{row.account_name}</TableCell>
                      <TableCell className="text-right font-mono">
                         {row.displayDebit !== 0 ? row.displayDebit.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                         {row.displayCredit !== 0 ? row.displayCredit.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}
                      </TableCell>
                   </TableRow>
                ))}
                {filteredData.length === 0 && !loading && (
                   <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-400 italic">No data found for this period</TableCell>
                   </TableRow>
                )}
             </TableBody>
             {/* Footer Totals */}
             {filteredData.length > 0 && (
                <tfoot>
                   <TableRow className="border-t-2 border-gray-800 font-bold bg-gray-50/50">
                      <TableCell colSpan={2} className="text-right text-gray-900">Totals:</TableCell>
                      <TableCell className="text-right text-gray-900 border-b-4 border-double border-gray-800">
                         {totalDebit.toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-right text-gray-900 border-b-4 border-double border-gray-800">
                         {totalCredit.toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </TableCell>
                   </TableRow>
                </tfoot>
             )}
          </Table>

          <div className="mt-12 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-400">
             <span>Generated on {format(new Date(), 'MMM d, yyyy h:mm a')}</span>
             <span>Page 1 of 1</span>
          </div>
       </div>
    </div>
  );
};

export default TrialBalanceReport;