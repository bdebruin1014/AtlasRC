import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { 
  Wallet, ArrowUpRight, Filter, Download, 
  Search, MoreHorizontal, DollarSign, Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Map project names to their IDs for navigation
const projectIdMap = {
  'Highland Park Lofts': 1,
  'Watson House': 1,
  'Oslo Townhomes': 2,
  'Cedar Mill Apartments': 3,
  'Pine Valley Lots': 4,
  'Riverside Commercial': 1,  // fallback for demo
};

const InvestorDistributionsOverview = () => {
  const distributions = [
    { id: 1, investor: 'Blackstone Capital', project: 'Watson House', projectId: 1, amount: 450000, type: 'Quarterly Pref', date: '2025-10-15', status: 'Paid' },
    { id: 2, investor: 'Summit Equity', project: 'Watson House', projectId: 1, amount: 320000, type: 'Quarterly Pref', date: '2025-10-15', status: 'Paid' },
    { id: 3, investor: 'Dr. Sarah Jenkins', project: 'Oslo Townhomes', projectId: 2, amount: 15000, type: 'Quarterly Pref', date: '2025-10-15', status: 'Processing' },
    { id: 4, investor: 'Johnson Family Trust', project: 'Cedar Mill Apartments', projectId: 3, amount: 125000, type: 'Cash Flow', date: '2025-09-30', status: 'Paid' },
    { id: 5, investor: 'ABC Capital Partners', project: 'Pine Valley Lots', projectId: 4, amount: 75000, type: 'Profit Share', date: '2025-09-15', status: 'Paid' },
  ];

  const getProjectId = (projectName) => {
    return projectIdMap[projectName] || 1;
  };

  return (
    <>
      <Helmet>
        <title>Distributions | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full bg-[#EDF2F7] overflow-hidden">
         {/* Header */}
         <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center shrink-0">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">Distributions Dashboard</h1>
               <p className="text-sm text-gray-500 mt-1">Monitor and process investor payouts.</p>
            </div>
            <Button className="bg-[#2F855A] hover:bg-[#276749] text-white shadow-sm">
               <Wallet className="w-4 h-4 mr-2" /> New Distribution
            </Button>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-y-auto p-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase">Total Paid YTD</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">$8.4M</h3>
               </div>
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase">Last Month</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-2">$450k</h3>
               </div>
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase">Pending Processing</p>
                  <h3 className="text-2xl font-bold text-orange-600 mt-2">$15k</h3>
               </div>
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase">Next Scheduled</p>
                  <h3 className="text-lg font-bold text-gray-900 mt-2">Jan 15, 2026</h3>
               </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-4 w-full max-w-lg">
                     <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md" placeholder="Search distributions..." />
                     </div>
                     <Button variant="outline" size="sm"><Filter className="w-3 h-3 mr-2" /> Filter</Button>
                  </div>
                  <Button variant="ghost" size="sm"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
               </div>

               <table className="w-full text-sm text-left">
                  <thead className="bg-white border-b border-gray-200">
                     <tr>
                        <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Investor</th>
                        <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Project</th>
                        <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Type</th>
                        <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Date</th>
                        <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs text-right">Amount</th>
                        <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {distributions.map(dist => (
                        <tr key={dist.id} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 font-medium text-gray-900">{dist.investor}</td>
                           <td className="px-6 py-4">
                              <Link 
                                 to={`/project/${dist.projectId || getProjectId(dist.project)}`}
                                 className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium inline-flex items-center gap-1"
                              >
                                 {dist.project}
                                 <ArrowUpRight className="w-3 h-3" />
                              </Link>
                           </td>
                           <td className="px-6 py-4 text-gray-500">{dist.type}</td>
                           <td className="px-6 py-4 text-gray-500">{dist.date}</td>
                           <td className="px-6 py-4 text-right font-bold text-gray-900">${(dist.amount).toLocaleString()}</td>
                           <td className="px-6 py-4 text-center">
                              <Badge variant="outline" className={cn(
                                 dist.status === 'Paid' 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                    : "bg-orange-50 text-orange-700 border-orange-200"
                              )}>
                                 {dist.status}
                              </Badge>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </>
  );
};

export default InvestorDistributionsOverview;
