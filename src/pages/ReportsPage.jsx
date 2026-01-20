import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, FileText, Download, Filter, 
  Calendar, ChevronRight, Search, History, 
  Plus, Clock, FileSpreadsheet
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import LoadingState from '@/components/LoadingState';
import ErrorBoundary from '@/components/ErrorBoundary';

const CATEGORIES = [
  { id: 'financial', label: 'Financial' },
  { id: 'project', label: 'Project & Construction' },
  { id: 'investor', label: 'Investor Relations' },
  { id: 'operational', label: 'Operational' },
];

const REPORTS = [
  { id: 1, category: 'financial', name: 'Profit & Loss by Project', path: '/reports/pnl-by-project', desc: 'Detailed P&L breakdown allocated by project centers.', lastRun: 'Today, 9:00 AM' },
  { id: 6, category: 'financial', name: 'AP Aging Summary', path: '/reports/ap-aging', desc: 'Accounts payable aging report by vendor.', lastRun: 'Yesterday, 5:00 PM' },
  { id: 2, category: 'financial', name: 'Balance Sheet Consolidated', path: '/reports/balance-sheet', desc: 'Consolidated BS for AtlasDev and subsidiaries.', lastRun: 'Yesterday' },
  { id: 3, category: 'project', name: 'Budget vs Actuals Variance', path: '/reports/budget', desc: 'Line item variance analysis for active construction projects.', lastRun: '2 days ago' },
  { id: 4, category: 'investor', name: 'Quarterly Distribution Statement', path: '/reports/distributions', desc: 'Capital account changes and distributions per investor.', lastRun: 'Oct 1, 2025' },
  { id: 5, category: 'operational', name: 'Task Completion Efficiency', path: '/reports/tasks', desc: 'Team productivity metrics and task aging.', lastRun: 'Never' },
];

const RECENT_HISTORY = [
  { id: 101, name: 'Profit & Loss (Nov 2025)', date: 'Dec 1, 2025 9:00 AM', user: 'Alex J.', status: 'Ready' },
  { id: 102, name: 'Budget Report - Highland Park', date: 'Nov 28, 2025 2:15 PM', user: 'Mike R.', status: 'Ready' },
  { id: 103, name: 'Investor Distribution Q3', date: 'Nov 25, 2025 10:30 AM', user: 'System', status: 'Archived' },
];

const ReportsPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [view, setView] = useState('library'); // 'library', 'history'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     setIsLoading(true);
     const timer = setTimeout(() => setIsLoading(false), 600);
     return () => clearTimeout(timer);
  }, []);

  const filteredReports = REPORTS.filter(r => 
    (activeCategory === 'all' || r.category === activeCategory) &&
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerate = (report) => {
    if (report.path && (report.path.includes('pnl') || report.path.includes('aging'))) {
        navigate(report.path);
    } else {
        // Fallback for demos that don't exist yet
        navigate('/reports'); 
        // In a real app, we would show a toast here via useToast
        alert("This report template is not yet implemented in this demo.");
    }
  };

  if (isLoading) {
     return <LoadingState type="skeleton" />;
  }

  return (
    <ErrorBoundary>
      <Helmet>
        <title>Reports | AtlasDev</title>
      </Helmet>

      <div className="flex h-full bg-[#EDF2F7] overflow-hidden">
         {/* Sidebar Navigation */}
         <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
            <div className="p-6 border-b border-gray-200">
               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-[#2F855A]" /> Reports
               </h2>
            </div>
            <div className="p-4 flex-1">
               <div className="space-y-1 mb-8">
                  <button 
                     onClick={() => setView('library')}
                     className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors", view === 'library' ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50")}
                  >
                     <FileText className="w-4 h-4" /> Report Library
                  </button>
                  <button 
                     onClick={() => setView('history')}
                     className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors", view === 'history' ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50")}
                  >
                     <History className="w-4 h-4" /> History & Downloads
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
                     <Clock className="w-4 h-4" /> Scheduled Reports
                  </button>
               </div>

               <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Create New</h3>
                  <Button onClick={() => setIsGeneratorOpen(true)} className="w-full bg-[#2F855A] hover:bg-[#276749] text-white shadow-sm">
                     <Plus className="w-4 h-4 mr-2" /> Custom Report
                  </Button>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            {view === 'library' && (
               <>
                  {/* Toolbar */}
                  <div className="bg-white border-b border-gray-200 px-8 py-6 shrink-0">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                           <h1 className="text-2xl font-bold text-gray-900">Report Library</h1>
                           <p className="text-gray-500 mt-1">Select a template to generate a new report.</p>
                        </div>
                        <div className="relative w-full md:w-80">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                           <input 
                              type="text"
                              placeholder="Search templates..." 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                           />
                        </div>
                     </div>
                     
                     {/* Category Tabs */}
                     <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
                        <button 
                           onClick={() => setActiveCategory('all')}
                           className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all border", activeCategory === 'all' ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
                        >
                           All
                        </button>
                        {CATEGORIES.map(cat => (
                           <button 
                              key={cat.id}
                              onClick={() => setActiveCategory(cat.id)}
                              className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all border whitespace-nowrap", activeCategory === cat.id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
                           >
                              {cat.label}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Grid */}
                  <div className="flex-1 overflow-y-auto p-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReports.map(report => (
                           <div key={report.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                 </div>
                                 <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-[10px] uppercase">
                                    {CATEGORIES.find(c => c.id === report.category)?.label}
                                 </Badge>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">{report.name}</h3>
                              <p className="text-sm text-gray-500 mb-6 flex-1">{report.desc}</p>
                              
                              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                 <span className="text-xs text-gray-400">Last run: {report.lastRun}</span>
                                 <Button size="sm" variant="outline" onClick={() => handleGenerate(report)} className="gap-2 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                                    Generate <ChevronRight className="w-3 h-3" />
                                 </Button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </>
            )}

            {view === 'history' && (
               <div className="p-8 flex-1 overflow-y-auto bg-white m-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Generated Reports History</h2>
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                           <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Report Name</th>
                           <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date Generated</th>
                           <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Generated By</th>
                           <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                           <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {RECENT_HISTORY.map(item => (
                           <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{item.user}</td>
                              <td className="px-6 py-4">
                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    {item.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <Button size="sm" variant="ghost" className="text-emerald-600">
                                    <Download className="w-4 h-4 mr-2" /> Download
                                 </Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>

         {/* Generator Modal */}
         <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
            <DialogContent className="sm:max-w-[600px]">
               <DialogHeader>
                  <DialogTitle>Custom Report Builder</DialogTitle>
               </DialogHeader>
               <div className="py-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                     <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                     <p className="text-gray-500">Drag and drop data fields here to build your report layout.</p>
                  </div>
                  <p className="text-center text-sm text-gray-400 italic">Advanced report builder functionality is currently being implemented.</p>
               </div>
            </DialogContent>
         </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default ReportsPage;