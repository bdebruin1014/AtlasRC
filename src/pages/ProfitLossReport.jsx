import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reportService } from '@/services/reportService';
import { format, startOfYear } from 'date-fns';

const ProfitLossReport = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  
  const [fromDate, setFromDate] = useState(startOfYear(new Date()).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const runReport = async () => {
    setLoading(true);
    const result = await reportService.getProfitLoss(entityId, fromDate, toDate);
    if (result.data) setReport(result.data);
    setLoading(false);
  };

  useEffect(() => {
    runReport();
  }, []);

  const handlePrint = () => window.print();

  const Section = ({ title, items, total, totalLabel }) => (
     <div className="mb-6">
        <h3 className="font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2 uppercase text-sm tracking-wider">{title}</h3>
        <div className="space-y-1">
           {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-0.5 hover:bg-gray-50">
                 <span className="text-gray-700 pl-2">{item.account_name}</span>
                 <span className="font-mono text-gray-900">
                    {item.displayAmount < 0 && '('}{Math.abs(item.displayAmount).toLocaleString('en-US', {minimumFractionDigits: 2})}{item.displayAmount < 0 && ')'}
                 </span>
              </div>
           ))}
        </div>
        <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-gray-300 bg-gray-50/30 px-2">
           <span>{totalLabel || `Total ${title}`}</span>
           <span className="font-mono">
               {total < 0 && '('}{Math.abs(total).toLocaleString('en-US', {minimumFractionDigits: 2})}{total < 0 && ')'}
           </span>
        </div>
     </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
       <Helmet><title>Profit & Loss | AtlasDev</title></Helmet>
       
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
       <div className="max-w-[1000px] mx-auto w-full bg-white shadow-lg print:shadow-none print:w-full p-10 min-h-[11in]">
          <div className="text-center mb-8">
             <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Profit & Loss</h1>
             <p className="text-gray-600 mt-1">
                {format(new Date(fromDate), 'MMMM d, yyyy')} to {format(new Date(toDate), 'MMMM d, yyyy')}
             </p>
          </div>

          {report ? (
             <div className="max-w-3xl mx-auto">
                <Section title="Income" items={report.revenue} total={report.totals.revenue} />
                
                {report.cogs.length > 0 && (
                  <Section title="Cost of Goods Sold" items={report.cogs} total={report.totals.cogs} />
                )}

                <div className="flex justify-between font-bold text-base py-3 border-t-2 border-gray-800 mb-6">
                   <span>Gross Profit</span>
                   <span className="font-mono">
                      {report.totals.grossProfit < 0 && '('}{Math.abs(report.totals.grossProfit).toLocaleString('en-US', {minimumFractionDigits: 2})}{report.totals.grossProfit < 0 && ')'}
                   </span>
                </div>

                <Section title="Operating Expenses" items={report.operatingExpenses} total={report.totals.expenses} totalLabel="Total Expenses" />

                <div className="flex justify-between font-bold text-base py-3 border-t border-gray-300 mb-6 bg-gray-50 px-2">
                   <span>Net Operating Income</span>
                   <span className="font-mono">
                      {report.totals.netOperatingIncome < 0 && '('}{Math.abs(report.totals.netOperatingIncome).toLocaleString('en-US', {minimumFractionDigits: 2})}{report.totals.netOperatingIncome < 0 && ')'}
                   </span>
                </div>

                {report.otherIncomeExpense.length > 0 && (
                   <Section title="Other Income & Expense" items={report.otherIncomeExpense} total={report.totals.other} totalLabel="Total Other Income/Expense" />
                )}

                <div className="flex justify-between font-bold text-lg py-4 border-t-2 border-b-4 border-double border-gray-800 mt-8">
                   <span>Net Income</span>
                   <span className="font-mono">
                      {report.totals.netIncome < 0 && '('}{Math.abs(report.totals.netIncome).toLocaleString('en-US', {minimumFractionDigits: 2})}{report.totals.netIncome < 0 && ')'}
                   </span>
                </div>
             </div>
          ) : (
             <div className="text-center py-20 text-gray-400">Run the report to view data.</div>
          )}

          <div className="mt-12 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-400">
             <span>Generated on {format(new Date(), 'MMM d, yyyy h:mm a')}</span>
             <span>Page 1 of 1</span>
          </div>
       </div>
    </div>
  );
};

export default ProfitLossReport;