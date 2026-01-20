import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reportService } from '@/services/reportService';
import { format } from 'date-fns';

const BalanceSheetReport = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const runReport = async () => {
    setLoading(true);
    const result = await reportService.getBalanceSheet(entityId, asOfDate);
    if (result.data) setReport(result.data);
    setLoading(false);
  };

  useEffect(() => {
    runReport();
  }, []);

  const handlePrint = () => window.print();

  const SectionGroup = ({ title, children, total }) => (
     <div className="mb-8">
        <h3 className="font-bold text-gray-900 text-lg mb-3 uppercase tracking-wide border-b border-gray-200 pb-1">{title}</h3>
        {children}
        <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-gray-800">
           <span className="uppercase">Total {title}</span>
           <span className="font-mono">
               {total < 0 && '('}{Math.abs(total).toLocaleString('en-US', {minimumFractionDigits: 2})}{total < 0 && ')'}
           </span>
        </div>
     </div>
  );

  const SubSection = ({ title, items }) => {
     if (!items || items.length === 0) return null;
     const total = items.reduce((sum, i) => sum + i.balance, 0);
     return (
        <div className="mb-4 pl-4">
           <h4 className="font-semibold text-gray-700 text-sm mb-2 underline decoration-gray-300 underline-offset-2">{title}</h4>
           <div className="space-y-1 mb-2">
              {items.map(item => (
                 <div key={item.id} className="flex justify-between text-sm py-0.5">
                    <span className="text-gray-600">{item.account_name}</span>
                    <span className="font-mono text-gray-900">
                       {item.balance < 0 && '('}{Math.abs(item.balance).toLocaleString('en-US', {minimumFractionDigits: 2})}{item.balance < 0 && ')'}
                    </span>
                 </div>
              ))}
           </div>
           <div className="flex justify-between font-semibold text-sm pl-4 border-t border-gray-200 pt-1">
              <span className="text-gray-500">Total {title}</span>
              <span className="font-mono text-gray-800">
                 {total < 0 && '('}{Math.abs(total).toLocaleString('en-US', {minimumFractionDigits: 2})}{total < 0 && ')'}
              </span>
           </div>
        </div>
     );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
       <Helmet><title>Balance Sheet | AtlasDev</title></Helmet>
       
       {/* Controls */}
       <div className="max-w-[1000px] mx-auto w-full mb-6 print:hidden space-y-4">
          <div className="flex items-center justify-between">
             <Button variant="ghost" onClick={() => navigate('../reports')} className="-ml-2 text-gray-500">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reports
             </Button>
             <div className="flex gap-2">
                <Button variant="outline"><Download className="w-4 h-4 mr-2" /> PDF</Button>
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
       <div className="max-w-[1000px] mx-auto w-full bg-white shadow-lg print:shadow-none print:w-full p-10 min-h-[11in]">
          <div className="text-center mb-8">
             <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Balance Sheet</h1>
             <p className="text-gray-600 mt-1">As of {format(new Date(asOfDate), 'MMMM d, yyyy')}</p>
          </div>

          {report ? (
             <div className="max-w-3xl mx-auto space-y-8">
                
                {/* ASSETS */}
                <SectionGroup title="Assets" total={report.totalAssets}>
                   <SubSection title="Current Assets" items={report.assets.current} />
                   <SubSection title="Fixed Assets" items={report.assets.fixed} />
                   <SubSection title="Other Assets" items={report.assets.other} />
                </SectionGroup>

                {/* LIABILITIES & EQUITY */}
                <SectionGroup title="Liabilities & Equity" total={report.totalLiabilitiesEquity}>
                    <div className="mb-6">
                       <h4 className="font-bold text-gray-800 mb-2 uppercase text-sm tracking-wider pl-2">Liabilities</h4>
                       <SubSection title="Current Liabilities" items={report.liabilities.current} />
                       <SubSection title="Long Term Liabilities" items={report.liabilities.longTerm} />
                       <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-gray-300 pl-4">
                          <span>Total Liabilities</span>
                          <span className="font-mono">{report.liabilities.total.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                       </div>
                    </div>

                    <div>
                       <h4 className="font-bold text-gray-800 mb-2 uppercase text-sm tracking-wider pl-2">Equity</h4>
                       <SubSection title="Equity" items={report.equity.items} />
                       <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-gray-300 pl-4">
                          <span>Total Equity</span>
                          <span className="font-mono">{report.equity.total.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                       </div>
                    </div>
                </SectionGroup>

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

export default BalanceSheetReport;