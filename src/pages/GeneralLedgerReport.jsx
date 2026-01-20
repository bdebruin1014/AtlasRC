import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reportService } from '@/services/reportService';
import { format, startOfMonth } from 'date-fns';

const GeneralLedgerReport = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  
  const [fromDate, setFromDate] = useState(startOfMonth(new Date()).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const runReport = async () => {
    setLoading(true);
    // Pass empty array for accounts to get ALL accounts
    const result = await reportService.getGeneralLedger(entityId, [], fromDate, toDate);
    if (result.data) setData(result.data);
    setLoading(false);
  };

  useEffect(() => {
    runReport();
  }, []);

  const handlePrint = () => window.print();
  const formatNum = (n) => n === 0 ? '-' : n.toLocaleString('en-US', {minimumFractionDigits: 2});

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
       <Helmet><title>General Ledger | AtlasDev</title></Helmet>
       
       {/* Controls */}
       <div className="max-w-[1000px] mx-auto w-full mb-6 print:hidden space-y-4">
          <div className="flex items-center justify-between">
             <Button variant="ghost" onClick={() => navigate('../reports')} className="-ml-2 text-gray-500">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reports
             </Button>
             <div className="flex gap-2">
                <Button variant="outline"><Download className="w-4 h-4 mr-2" /> CSV</Button>
                <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Print</Button>
             </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap items-end gap-4">
             <div className="grid gap-1.5">
                <Label>From</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
             </div>
             <div className="grid gap-1.5">
                <Label>To</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
             </div>
             <Button onClick={runReport} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {loading ? 'Running...' : 'Run Report'}
             </Button>
          </div>
       </div>

       {/* Report Paper */}
       <div className="max-w-[1000px] mx-auto w-full bg-white shadow-lg print:shadow-none print:w-full p-8 min-h-[11in]">
          <div className="text-center mb-8">
             <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">General Ledger</h1>
             <p className="text-gray-600 mt-1">
                {format(new Date(fromDate), 'MMMM d, yyyy')} to {format(new Date(toDate), 'MMMM d, yyyy')}
             </p>
          </div>

          <div className="space-y-8">
             {data.map((group) => (
                <div key={group.account.id} className="break-inside-avoid">
                   <div className="flex justify-between items-end border-b-2 border-gray-200 pb-2 mb-2">
                      <div>
                         <h3 className="font-bold text-lg text-gray-900">{group.account.account_name}</h3>
                         <p className="text-xs text-gray-500 font-mono">Acct #: {group.account.account_number}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xs text-gray-500 uppercase">Beginning Balance</p>
                         <p className="font-mono font-medium">{formatNum(group.beginningBalance)}</p>
                      </div>
                   </div>

                   <Table>
                      <TableHeader>
                         <TableRow className="bg-gray-50/50 border-none text-xs uppercase">
                            <TableHead className="w-[100px]">Date</TableHead>
                            <TableHead className="w-[100px]">Ref</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right w-[100px]">Debit</TableHead>
                            <TableHead className="text-right w-[100px]">Credit</TableHead>
                            <TableHead className="text-right w-[120px]">Balance</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {group.transactions.map((tx, idx) => (
                            <TableRow key={idx} className="border-gray-50 hover:bg-gray-50 text-sm">
                               <TableCell>{format(new Date(tx.date), 'MM/dd/yyyy')}</TableCell>
                               <TableCell className="font-mono text-xs text-gray-500">{tx.ref}</TableCell>
                               <TableCell className="truncate max-w-[200px]">{tx.desc}</TableCell>
                               <TableCell className="text-right font-mono text-gray-600">{formatNum(tx.debit)}</TableCell>
                               <TableCell className="text-right font-mono text-gray-600">{formatNum(tx.credit)}</TableCell>
                               <TableCell className="text-right font-mono font-medium text-gray-900">{formatNum(tx.runningBalance)}</TableCell>
                            </TableRow>
                         ))}
                         {group.transactions.length === 0 && (
                             <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-400 text-xs italic py-2">No transactions in this period</TableCell>
                             </TableRow>
                         )}
                      </TableBody>
                      {group.transactions.length > 0 && (
                         <tfoot className="bg-gray-50/30">
                            <TableRow>
                               <TableCell colSpan={5} className="text-right font-bold text-gray-900">Ending Balance:</TableCell>
                               <TableCell className="text-right font-mono font-bold text-gray-900">{formatNum(group.endingBalance)}</TableCell>
                            </TableRow>
                         </tfoot>
                      )}
                   </Table>
                </div>
             ))}
          </div>

          <div className="mt-12 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-400">
             <span>Generated on {format(new Date(), 'MMM d, yyyy h:mm a')}</span>
             <span>Page 1 of 1</span>
          </div>
       </div>
    </div>
  );
};

export default GeneralLedgerReport;