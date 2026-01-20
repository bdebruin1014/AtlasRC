import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reportService } from '@/services/reportService';
import { format } from 'date-fns';

const APAgingReport = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({ current: 0, d30: 0, d60: 0, d90: 0, d90p: 0, total: 0 });

  const runReport = async () => {
    setLoading(true);
    const result = await reportService.getAPAging(entityId, asOfDate);
    if (result.data) {
       setData(result.data);
       // Calc totals
       const t = result.data.reduce((acc, row) => ({
          current: acc.current + row.current,
          d30: acc.d30 + row.days30,
          d60: acc.d60 + row.days60,
          d90: acc.d90 + row.days90,
          d90p: acc.d90p + row.days90Plus,
          total: acc.total + row.total
       }), { current: 0, d30: 0, d60: 0, d90: 0, d90p: 0, total: 0 });
       setTotals(t);
    }
    setLoading(false);
  };

  useEffect(() => {
    runReport();
  }, []);

  const handlePrint = () => window.print();
  
  const formatNum = (n) => n === 0 ? '-' : n.toLocaleString('en-US', {minimumFractionDigits: 2});

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
       <Helmet><title>AP Aging | AtlasDev</title></Helmet>
       
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
                <Label>As of Date</Label>
                <Input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} className="w-40" />
             </div>
             <Button onClick={runReport} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {loading ? 'Running...' : 'Run Report'}
             </Button>
          </div>
       </div>

       {/* Report Paper */}
       <div className="max-w-[1000px] mx-auto w-full bg-white shadow-lg print:shadow-none print:w-full p-8 min-h-[11in]">
          <div className="text-center mb-8">
             <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">A/P Aging Summary</h1>
             <p className="text-gray-600 mt-1">As of {format(new Date(asOfDate), 'MMMM d, yyyy')}</p>
          </div>

          <Table>
             <TableHeader>
                <TableRow className="border-b-2 border-gray-800">
                   <TableHead className="font-bold text-gray-900">Vendor</TableHead>
                   <TableHead className="font-bold text-gray-900 text-right">Current</TableHead>
                   <TableHead className="font-bold text-gray-900 text-right">1 - 30</TableHead>
                   <TableHead className="font-bold text-gray-900 text-right">31 - 60</TableHead>
                   <TableHead className="font-bold text-gray-900 text-right">61 - 90</TableHead>
                   <TableHead className="font-bold text-gray-900 text-right">90+</TableHead>
                   <TableHead className="font-bold text-gray-900 text-right">Total</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {data.map((row) => (
                   <TableRow key={row.vendorId} className="border-gray-100 hover:bg-gray-50 cursor-pointer group">
                      <TableCell className="font-medium text-gray-900 group-hover:text-emerald-700">{row.vendorName}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatNum(row.current)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatNum(row.days30)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatNum(row.days60)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatNum(row.days90)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatNum(row.days90Plus)}</TableCell>
                      <TableCell className="text-right font-mono font-bold">{formatNum(row.total)}</TableCell>
                   </TableRow>
                ))}
                {data.length === 0 && !loading && (
                   <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-400 italic">No aging payables found</TableCell>
                   </TableRow>
                )}
             </TableBody>
             {data.length > 0 && (
                <tfoot>
                   <TableRow className="border-t-2 border-gray-800 font-bold bg-gray-50/50">
                      <TableCell className="text-gray-900">TOTAL</TableCell>
                      <TableCell className="text-right text-gray-900">{formatNum(totals.current)}</TableCell>
                      <TableCell className="text-right text-gray-900">{formatNum(totals.d30)}</TableCell>
                      <TableCell className="text-right text-gray-900">{formatNum(totals.d60)}</TableCell>
                      <TableCell className="text-right text-gray-900">{formatNum(totals.d90)}</TableCell>
                      <TableCell className="text-right text-gray-900">{formatNum(totals.d90p)}</TableCell>
                      <TableCell className="text-right text-gray-900 border-b-4 border-double border-gray-800">{formatNum(totals.total)}</TableCell>
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

export default APAgingReport;