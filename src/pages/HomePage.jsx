import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import {
  Plus, LayoutDashboard, Activity, ArrowRight,
  Building2, CheckSquare, DollarSign, Calendar,
  MoreHorizontal, Briefcase, Users, FileText,
  TrendingUp, ChevronDown, Wallet, CreditCard,
  Target, AlertTriangle, Clock, PieChart,
  ArrowUpRight, ArrowDownRight, FolderKanban,
  UserPlus, ChevronRight, Landmark
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// ─── STATS (Clickable Cards) ─────────────────────────────────────────────────
const STATS = [
  { label: 'Total Projects', value: '12', icon: Building2, color: 'bg-blue-100 text-blue-600', path: '/projects' },
  { label: 'Active Tasks', value: '8', icon: CheckSquare, color: 'bg-orange-100 text-orange-600', path: '/operations/tasks' },
  { label: 'Cash Position', value: '$1.24M', icon: Wallet, color: 'bg-emerald-100 text-emerald-600', path: '/accounting/dashboard', trend: '+12%' },
  { label: 'Active Deals', value: '5', icon: Briefcase, color: 'bg-purple-100 text-purple-600', path: '/opportunities' },
];

// ─── PIPELINE STAGES ─────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { id: 'prospecting', label: 'Prospecting', count: 12, value: '$18.5M', color: '#6366F1' },
  { id: 'underwriting', label: 'Underwriting', count: 6, value: '$9.2M', color: '#8B5CF6' },
  { id: 'loi', label: 'LOI', count: 4, value: '$6.8M', color: '#F59E0B' },
  { id: 'due_diligence', label: 'Due Diligence', count: 3, value: '$4.8M', color: '#3B82F6' },
  { id: 'closed', label: 'Closed', count: 2, value: '$3.1M', color: '#10B981' },
  { id: 'dead', label: 'Dead', count: 5, value: '$7.4M', color: '#6B7280' },
];

// ─── FINANCIAL DATA WITH ENTITIES ────────────────────────────────────────────
const DEMO_ENTITIES = [
  { id: 'consolidated', name: 'Consolidated (All)' },
  { id: 'atlas-fund-i', name: 'Atlas Fund I, LLC' },
  { id: 'highland-llc', name: 'Highland Park, LLC' },
  { id: 'riverside-lp', name: 'Riverside Partners, LP' },
  { id: 'downtown-holdings', name: 'Downtown Holdings, LLC' },
];

const FINANCIAL_DATA = {
  consolidated: { cashOnHand: 2450000, netIncome: 910000, arReceivable: 485000, apPayable: 312000, equity: 16700000, ytdRevenue: 3850000 },
  'atlas-fund-i': { cashOnHand: 980000, netIncome: 420000, arReceivable: 125000, apPayable: 89000, equity: 7200000, ytdRevenue: 1520000 },
  'highland-llc': { cashOnHand: 650000, netIncome: 280000, arReceivable: 195000, apPayable: 112000, equity: 4800000, ytdRevenue: 1100000 },
  'riverside-lp': { cashOnHand: 520000, netIncome: 145000, arReceivable: 95000, apPayable: 67000, equity: 3200000, ytdRevenue: 780000 },
  'downtown-holdings': { cashOnHand: 300000, netIncome: 65000, arReceivable: 70000, apPayable: 44000, equity: 1500000, ytdRevenue: 450000 },
};

// ─── PROJECT HEALTH CHART DATA ───────────────────────────────────────────────
const PROJECT_TYPES = ['All', 'Residential', 'Commercial', 'Mixed-Use'];

const HEALTH_COLORS = {
  'On Track': '#10B981',
  'At Risk': '#F59E0B',
  'Delayed': '#EF4444',
};

const PROJECT_HEALTH_DATA = [
  { name: 'Highland Park Townhomes', type: 'Residential', status: 'On Track', budget: 92, timeline: 88 },
  { name: 'Riverside Commercial', type: 'Commercial', status: 'At Risk', budget: 105, timeline: 72 },
  { name: 'Downtown Mixed Use', type: 'Mixed-Use', status: 'On Track', budget: 85, timeline: 95 },
  { name: 'Oak Street Renovation', type: 'Residential', status: 'Delayed', budget: 78, timeline: 45 },
  { name: 'Elm Court Apartments', type: 'Residential', status: 'On Track', budget: 88, timeline: 91 },
  { name: 'Market Street Retail', type: 'Commercial', status: 'At Risk', budget: 97, timeline: 68 },
];

// ─── RECENT ACTIVITY WITH USER FILTER ────────────────────────────────────────
const TEAM_MEMBERS = [
  { id: 'all', name: 'All Members' },
  { id: 'alex', name: 'Alex Johnson' },
  { id: 'sarah', name: 'Sarah Mitchell' },
  { id: 'mike', name: 'Mike Roberts' },
  { id: 'system', name: 'System' },
];

const RECENT_ACTIVITY = [
  { userId: 'alex', user: 'Alex J.', action: 'completed task', target: 'Review Highland Park Permits', time: '2 hours ago', icon: CheckSquare, color: 'bg-emerald-100 text-emerald-700', recordType: 'task', recordId: 'task-101' },
  { userId: 'system', user: 'System', action: 'received payment', target: '$12,500 from Unit 4B Closing', time: '4 hours ago', icon: DollarSign, color: 'bg-green-100 text-green-700', recordType: 'transaction', recordId: 'txn-201' },
  { userId: 'sarah', user: 'Sarah M.', action: 'uploaded document', target: 'Q3 Investor Report.pdf', time: 'Yesterday', icon: FileText, color: 'bg-blue-100 text-blue-700', recordType: 'document', recordId: 'doc-301' },
  { userId: 'mike', user: 'Mike R.', action: 'created project', target: 'Riverside Commercial Phase 2', time: 'Yesterday', icon: Building2, color: 'bg-purple-100 text-purple-700', recordType: 'project', recordId: 'proj-401' },
  { userId: 'alex', user: 'Alex J.', action: 'approved draw request', target: 'Draw #4 - Highland Park ($85K)', time: '2 days ago', icon: DollarSign, color: 'bg-amber-100 text-amber-700', recordType: 'draw', recordId: 'draw-501' },
  { userId: 'sarah', user: 'Sarah M.', action: 'updated contact', target: 'First National Bank - Terms', time: '2 days ago', icon: Users, color: 'bg-indigo-100 text-indigo-700', recordType: 'contact', recordId: 'contact-601' },
  { userId: 'mike', user: 'Mike R.', action: 'completed inspection', target: 'Phase 1 Environmental - Oak St', time: '3 days ago', icon: CheckSquare, color: 'bg-teal-100 text-teal-700', recordType: 'inspection', recordId: 'insp-701' },
  { userId: 'system', user: 'System', action: 'generated report', target: 'Monthly Financial Summary - Nov', time: '3 days ago', icon: PieChart, color: 'bg-gray-100 text-gray-700', recordType: 'report', recordId: 'rpt-801' },
];

// ─── UPCOMING TASKS WITH SMART DATES ─────────────────────────────────────────
const USER_TASKS = [
  { id: 't1', title: 'Review structural drawings', project: 'Highland Park', dueDate: new Date(Date.now() + 0), priority: 'high', assignee: 'Alex J.' },
  { id: 't2', title: 'Call City Planner re: zoning', project: 'Riverside', dueDate: new Date(Date.now() + 86400000), priority: 'urgent', assignee: 'Mike R.' },
  { id: 't3', title: 'Approve Invoice #1042', project: 'General', dueDate: new Date(Date.now() + 172800000), priority: 'medium', assignee: 'Sarah M.' },
  { id: 't4', title: 'Submit environmental report', project: 'Oak Street', dueDate: new Date(Date.now() + 345600000), priority: 'high', assignee: 'Alex J.' },
  { id: 't5', title: 'Review title commitment', project: 'Downtown Mixed', dueDate: new Date(Date.now() + 518400000), priority: 'medium', assignee: 'Sarah M.' },
  { id: 't6', title: 'Contractor bid comparison', project: 'Highland Park', dueDate: new Date(Date.now() + 604800000), priority: 'low', assignee: 'Mike R.' },
];

const formatTaskDue = (date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((taskDay - today) / 86400000);

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `${diffDays} days`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const PRIORITY_STYLES = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-600',
};

// ─── QUICK ACTION ITEMS ──────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: 'task', label: 'New Task', icon: CheckSquare, color: 'bg-orange-100 text-orange-600' },
  { id: 'project', label: 'New Project', icon: Building2, color: 'bg-blue-100 text-blue-600' },
  { id: 'contact', label: 'Add Contact', icon: UserPlus, color: 'bg-purple-100 text-purple-600' },
  { id: 'entity', label: 'New Entity', icon: Landmark, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'transaction', label: 'Record Transaction', icon: DollarSign, color: 'bg-green-100 text-green-600' },
];

// ─── ENTITY TYPES ────────────────────────────────────────────────────────────
const ENTITY_TYPES = [
  { value: 'llc', label: 'LLC' },
  { value: 'lp', label: 'LP (Limited Partnership)' },
  { value: 'corp', label: 'Corporation' },
  { value: 'trust', label: 'Trust' },
  { value: 'sole_prop', label: 'Sole Proprietorship' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Modal States
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);

  // Entity Selector State (Financial Summary)
  const [selectedEntity, setSelectedEntity] = useState(() => {
    return localStorage.getItem('dashboard_entity') || 'consolidated';
  });

  // Project Health Filter
  const [projectTypeFilter, setProjectTypeFilter] = useState('All');

  // Activity Filter
  const [activityFilter, setActivityFilter] = useState('all');

  // Save entity selection to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard_entity', selectedEntity);
  }, [selectedEntity]);

  // Transaction Form State
  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    account: '',
    type: 'Expense',
    amount: '',
    payee: '',
    memo: '',
    entity: '',
    category: '',
  });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    company_type: '',
    phone: '',
    email: '',
  });

  // Entity Form State
  const [entityForm, setEntityForm] = useState({
    name: '',
    type: '',
    ein: '',
    state_of_formation: '',
  });

  // Get financial data for selected entity
  const financials = FINANCIAL_DATA[selectedEntity] || FINANCIAL_DATA.consolidated;

  // Filter project health data
  const filteredProjects = projectTypeFilter === 'All'
    ? PROJECT_HEALTH_DATA
    : PROJECT_HEALTH_DATA.filter(p => p.type === projectTypeFilter);

  // Filter activity
  const filteredActivity = activityFilter === 'all'
    ? RECENT_ACTIVITY
    : RECENT_ACTIVITY.filter(a => a.userId === activityFilter);

  // Handlers
  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'task': navigate('/operations/tasks'); break;
      case 'project': navigate('/projects'); break;
      case 'contact': setIsContactModalOpen(true); break;
      case 'entity': setIsEntityModalOpen(true); break;
      case 'transaction': setIsTransactionModalOpen(true); break;
    }
  };

  const handleSaveTransaction = () => {
    if (!transactionForm.amount || !transactionForm.account || !transactionForm.payee) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill in all required fields." });
      return;
    }
    toast({ title: "Transaction Recorded", description: `${transactionForm.type} of $${transactionForm.amount} has been recorded.` });
    setIsTransactionModalOpen(false);
    setTransactionForm({ date: new Date().toISOString().split('T')[0], account: '', type: 'Expense', amount: '', payee: '', memo: '', entity: '', category: '' });
  };

  const handleSaveContact = () => {
    if (!contactForm.name) {
      toast({ variant: "destructive", title: "Missing Information", description: "Company/Contact name is required." });
      return;
    }
    toast({ title: "Contact Added", description: `${contactForm.name} has been added to contacts.` });
    setIsContactModalOpen(false);
    setContactForm({ name: '', company_type: '', phone: '', email: '' });
  };

  const handleSaveEntity = () => {
    if (!entityForm.name || !entityForm.type) {
      toast({ variant: "destructive", title: "Missing Information", description: "Entity name and type are required." });
      return;
    }
    toast({ title: "Entity Created", description: `${entityForm.name} has been created.` });
    setIsEntityModalOpen(false);
    setEntityForm({ name: '', type: '', ein: '', state_of_formation: '' });
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#EDF2F7] overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your daily overview.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>

              {/* Quick Action Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#2F855A] hover:bg-[#276749] text-white shadow-sm gap-2">
                    <Plus className="w-4 h-4" /> Quick Action <ChevronDown className="w-3 h-3 opacity-80" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Create New</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/operations/tasks')} className="cursor-pointer">
                    <CheckSquare className="w-4 h-4 mr-2 text-gray-500" /> New Task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/projects')} className="cursor-pointer">
                    <Building2 className="w-4 h-4 mr-2 text-gray-500" /> New Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsContactModalOpen(true)} className="cursor-pointer">
                    <UserPlus className="w-4 h-4 mr-2 text-gray-500" /> Add Contact
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsEntityModalOpen(true)} className="cursor-pointer">
                    <Landmark className="w-4 h-4 mr-2 text-gray-500" /> New Entity
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsTransactionModalOpen(true)} className="cursor-pointer">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-500" /> Record Transaction
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">

            {/* 1. Stats Grid - Clickable Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((stat, index) => (
                <Card
                  key={index}
                  className="border-gray-200 shadow-sm hover:shadow-md hover:border-[#2F855A]/30 transition-all cursor-pointer group"
                  onClick={() => navigate(stat.path)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${stat.label}: ${stat.value}. Click to view.`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(stat.path); }}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn("p-2 rounded-lg", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        {stat.trend && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>}
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#2F855A] transition-colors" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 2. Pipeline Overview */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Pipeline Overview</CardTitle>
                  <CardDescription>Deal flow across acquisition stages</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/opportunities')}>
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-32 mb-4">
                  {PIPELINE_STAGES.map((stage) => (
                    <div
                      key={stage.id}
                      className="flex-1 flex flex-col items-center cursor-pointer group"
                      onClick={() => navigate(`/opportunities?stage=${stage.id}`)}
                      title={`${stage.label}: ${stage.count} deals (${stage.value})`}
                    >
                      <div
                        className="w-full rounded-t transition-all group-hover:opacity-80 group-hover:scale-y-105"
                        style={{
                          height: `${(stage.count / 12) * 100}%`,
                          minHeight: '20px',
                          backgroundColor: stage.color,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-6 gap-1 text-center">
                  {PIPELINE_STAGES.map((stage) => (
                    <div
                      key={stage.id}
                      className="space-y-1 cursor-pointer hover:bg-gray-50 rounded p-1 transition-colors"
                      onClick={() => navigate(`/opportunities?stage=${stage.id}`)}
                    >
                      <p className="text-xs font-medium text-gray-500 truncate">{stage.label}</p>
                      <p className="text-lg font-bold text-gray-900">{stage.count}</p>
                      <p className="text-xs text-gray-400">{stage.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 3. Financial Summary with Entity Selector */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">Financial Summary</CardTitle>
                    <CardDescription>
                      <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                        <SelectTrigger className="w-[200px] h-7 text-xs border-none shadow-none p-0 font-normal text-gray-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEMO_ENTITIES.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => navigate('/accounting/dashboard')}>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-emerald-600 font-medium">Cash on Hand</p>
                      <p className="text-xl font-bold text-emerald-700">
                        ${(financials.cashOnHand / 1000000).toFixed(2)}M
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">Net Income YTD</p>
                      <p className="text-xl font-bold text-blue-700 flex items-center gap-1">
                        ${(financials.netIncome / 1000).toFixed(0)}K
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      </p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-xs text-indigo-600 font-medium">YTD Revenue</p>
                      <p className="text-xl font-bold text-indigo-700">
                        ${(financials.ytdRevenue / 1000000).toFixed(2)}M
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="text-xs text-amber-600 font-medium">Total Equity</p>
                      <p className="text-xl font-bold text-amber-700">
                        ${(financials.equity / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">A/R Outstanding</span>
                      <span className="font-medium">${(financials.arReceivable / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">A/P Due</span>
                      <span className="font-medium">${(financials.apPayable / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Project Health Chart */}
              <Card className="lg:col-span-2 border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">Project Health</CardTitle>
                    <CardDescription>Budget utilization by project</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_TYPES.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                      All Projects <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={filteredProjects} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 120]} tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => `${value}%`} labelFormatter={(label) => label} />
                      <Bar dataKey="budget" name="Budget %" radius={[0, 4, 4, 0]} barSize={18}>
                        {filteredProjects.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={HEALTH_COLORS[entry.status]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    {Object.entries(HEALTH_COLORS).map(([label, color]) => (
                      <div key={label} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                        {label}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 5. Recent Activity with User Filter */}
              <Card className="lg:col-span-2 border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">Recent Activity</CardTitle>
                    <CardDescription>Latest updates across your projects and teams</CardDescription>
                  </div>
                  <Select value={activityFilter} onValueChange={setActivityFilter}>
                    <SelectTrigger className="w-[150px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_MEMBERS.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {filteredActivity.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No activity for this filter.</p>
                    ) : (
                      filteredActivity.map((item, i) => (
                        <div key={i} className="flex items-start gap-4 group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", item.color)}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              <span className="font-semibold">{item.user}</span> {item.action}{' '}
                              <span className="font-medium text-gray-700">{item.target}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Button variant="ghost" className="w-full mt-4 text-sm text-gray-500 hover:text-emerald-600" onClick={() => navigate('/admin/activity-log')}>View All Activity</Button>
                </CardContent>
              </Card>

              {/* 6. Upcoming Tasks with Smart Dates */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">Upcoming Tasks</CardTitle>
                  <CardDescription>Tasks due in the next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {USER_TASKS.map((task) => {
                      const dueLabel = formatTaskDue(task.dueDate);
                      const isOverdue = dueLabel === 'Overdue';
                      const isToday = dueLabel === 'Today';
                      return (
                        <div
                          key={task.id}
                          className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group flex items-center gap-3"
                          onClick={() => navigate('/operations/tasks')}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium capitalize", PRIORITY_STYLES[task.priority])}>
                                {task.priority}
                              </span>
                              <span className={cn("text-xs ml-auto", isOverdue ? 'text-red-600 font-medium' : isToday ? 'text-orange-600 font-medium' : 'text-gray-400')}>
                                {dueLabel}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 truncate">{task.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{task.project} &middot; {task.assignee}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2F855A] transition-colors shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/operations/tasks')}>Go to Tasks</Button>
                </CardContent>
              </Card>
            </div>

            {/* 7. Quick Access Actions */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Quick Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {QUICK_ACTIONS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleQuickAction(item.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100 hover:border-[#2F855A]/30 hover:shadow-sm transition-all group"
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", item.color)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 group-hover:text-[#2F855A]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* ─── MODALS ───────────────────────────────────────────────────────── */}

        {/* Record Transaction Modal (Enhanced) */}
        <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Transaction</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="txn-date">Date</Label>
                  <Input id="txn-date" type="date" value={transactionForm.date} onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="txn-type">Type</Label>
                  <Select value={transactionForm.type} onValueChange={(val) => setTransactionForm({ ...transactionForm, type: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Deposit">Deposit</SelectItem>
                      <SelectItem value="Expense">Payment / Expense</SelectItem>
                      <SelectItem value="Transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="txn-entity">Entity</Label>
                <Select value={transactionForm.entity} onValueChange={(val) => setTransactionForm({ ...transactionForm, entity: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Entity" /></SelectTrigger>
                  <SelectContent>
                    {DEMO_ENTITIES.filter(e => e.id !== 'consolidated').map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="txn-account">Account</Label>
                <Select value={transactionForm.account} onValueChange={(val) => setTransactionForm({ ...transactionForm, account: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="op-cash">Operating Cash (...8821)</SelectItem>
                    <SelectItem value="payroll">Payroll (...9912)</SelectItem>
                    <SelectItem value="construct">Construction Yield (...1102)</SelectItem>
                    <SelectItem value="credit">Chase Credit Card (...4452)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="txn-amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input id="txn-amount" type="number" placeholder="0.00" className="pl-9" value={transactionForm.amount} onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="txn-category">Category</Label>
                  <Select value={transactionForm.category} onValueChange={(val) => setTransactionForm({ ...transactionForm, category: val })}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="professional">Professional Fees</SelectItem>
                      <SelectItem value="permits">Permits & Fees</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="txn-payee">Payee / Description</Label>
                <Input id="txn-payee" placeholder="e.g. Home Depot, Client Payment" value={transactionForm.payee} onChange={(e) => setTransactionForm({ ...transactionForm, payee: e.target.value })} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="txn-memo">Memo</Label>
                <Input id="txn-memo" placeholder="Optional notes..." value={transactionForm.memo} onChange={(e) => setTransactionForm({ ...transactionForm, memo: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsTransactionModalOpen(false)}>Cancel</Button>
              <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={handleSaveTransaction}>Save Transaction</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Contact Modal */}
        <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Add Contact</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="contact-name">Company / Contact Name *</Label>
                <Input id="contact-name" placeholder="e.g. ABC Construction, John Smith" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-type">Type</Label>
                <Select value={contactForm.company_type} onValueChange={(val) => setContactForm({ ...contactForm, company_type: val })}>
                  <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_contractor">General Contractor</SelectItem>
                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                    <SelectItem value="architect">Architect</SelectItem>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    <SelectItem value="lender">Lender</SelectItem>
                    <SelectItem value="investor">Investor</SelectItem>
                    <SelectItem value="attorney">Attorney</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input id="contact-phone" type="tel" placeholder="(555) 123-4567" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" placeholder="email@example.com" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsContactModalOpen(false)}>Cancel</Button>
              <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={handleSaveContact}>Add Contact</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Entity Modal */}
        <Dialog open={isEntityModalOpen} onOpenChange={setIsEntityModalOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Create Entity</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="entity-name">Entity Name *</Label>
                <Input id="entity-name" placeholder="e.g. Highland Park Holdings, LLC" value={entityForm.name} onChange={(e) => setEntityForm({ ...entityForm, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entity-type">Entity Type *</Label>
                <Select value={entityForm.type} onValueChange={(val) => setEntityForm({ ...entityForm, type: val })}>
                  <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="entity-ein">EIN</Label>
                  <Input id="entity-ein" placeholder="XX-XXXXXXX" value={entityForm.ein} onChange={(e) => setEntityForm({ ...entityForm, ein: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="entity-state">State of Formation</Label>
                  <Input id="entity-state" placeholder="e.g. Delaware" value={entityForm.state_of_formation} onChange={(e) => setEntityForm({ ...entityForm, state_of_formation: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsEntityModalOpen(false)}>Cancel</Button>
              <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={handleSaveEntity}>Create Entity</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
};

export default HomePage;
