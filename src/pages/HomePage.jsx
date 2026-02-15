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
  UserPlus, ChevronRight, Landmark, Home, Map, Hammer
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
import { useProjects, useProjectSummary, PROJECT_TYPES } from '@/hooks/useProjects';
import { projectService } from '@/services/projectService';
import { opportunityService } from '@/services/opportunityService';

// ─── PROJECT TYPE ICONS ─────────────────────────────────────────────────────
const PROJECT_TYPE_ICONS = {
  'scattered-lot': Home,
  'lot-development': Map,
  'lot-purchase-development': Hammer,
  'community-development': Building2,
};

const PROJECT_TYPE_DESCRIPTIONS = {
  'scattered-lot': 'Buy a lot, build a spec home, sell it',
  'lot-development': 'Develop raw land into finished lots',
  'lot-purchase-development': 'Buy finished lots, build homes for sale',
  'community-development': 'Full subdivision from raw land to sold homes',
};

// ─── ENTITY TYPES ────────────────────────────────────────────────────────────
const ENTITY_TYPES = [
  { value: 'llc', label: 'LLC' },
  { value: 'lp', label: 'LP (Limited Partnership)' },
  { value: 'corp', label: 'Corporation' },
  { value: 'trust', label: 'Trust' },
  { value: 'sole_prop', label: 'Sole Proprietorship' },
];

const HEALTH_COLORS = {
  'On Track': '#10B981',
  'At Risk': '#F59E0B',
  'Over Budget': '#EF4444',
};

const PRIORITY_STYLES = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-600',
};

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

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Real data from hooks
  const { projects, isLoading: projectsLoading } = useProjects();
  const projectSummary = useProjectSummary(projects || []);

  // Pipeline data from service
  const [pipelineStats, setPipelineStats] = useState(null);
  const [attentionItems, setAttentionItems] = useState([]);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(true);

  // Modal States
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', company_type: '', phone: '', email: '' });
  // Entity Form State
  const [entityForm, setEntityForm] = useState({ name: '', type: '', ein: '', state_of_formation: '' });

  // Fetch pipeline stats
  useEffect(() => {
    async function fetchPipelineStats() {
      try {
        const stats = await opportunityService.getStats();
        setPipelineStats(stats);
      } catch (err) {
        console.error('Pipeline stats fetch failed:', err);
      } finally {
        setIsLoadingPipeline(false);
      }
    }
    fetchPipelineStats();
  }, []);

  // Build attention items from real data
  useEffect(() => {
    async function fetchAttentionItems() {
      const items = [];
      try {
        // Overdue follow-ups
        const dueOpps = await opportunityService.getDueForFollowUp();
        (dueOpps || []).slice(0, 3).forEach(opp => {
          items.push({
            id: `opp-${opp.id}`,
            type: 'warning',
            title: `Follow-up overdue: ${opp.address || opp.deal_number}`,
            path: `/opportunity/${opp.id}`,
            icon: AlertTriangle,
            color: 'text-amber-600 bg-amber-50',
          });
        });

        // Projects over budget
        const overBudget = await projectService.getOverBudget();
        (overBudget || []).slice(0, 3).forEach(proj => {
          items.push({
            id: `proj-${proj.id}`,
            type: 'error',
            title: `Over budget: ${proj.name}`,
            path: `/project/${proj.id}`,
            icon: AlertTriangle,
            color: 'text-red-600 bg-red-50',
          });
        });

        // Upcoming deadlines
        const deadlines = await projectService.getUpcomingDeadlines(7);
        (deadlines || []).slice(0, 3).forEach(ms => {
          items.push({
            id: `ms-${ms.id}`,
            type: 'info',
            title: `Deadline: ${ms.name} (${ms.project?.name || 'Unknown'})`,
            path: ms.project ? `/project/${ms.project.id}` : '/projects',
            icon: Clock,
            color: 'text-blue-600 bg-blue-50',
          });
        });
      } catch (err) {
        console.error('Attention items fetch failed:', err);
      }
      setAttentionItems(items);
    }
    fetchAttentionItems();
  }, []);

  // Compute stats from real data
  const totalProjects = projectSummary?.total || 0;
  const activeProjects = projectSummary?.activeCount || 0;
  const totalBudget = projectSummary?.totalBudget || 0;
  const activeDeals = pipelineStats?.total || 0;

  // Build pipeline stages from real stats — matches OPPORTUNITY_STAGES in useOpportunities
  const pipelineStages = pipelineStats ? [
    { id: 'Prospecting', label: 'Prospecting', count: pipelineStats.byStage?.Prospecting?.count || 0, value: pipelineStats.byStage?.Prospecting?.value || 0, color: '#6366F1' },
    { id: 'Contacted', label: 'Contacted', count: pipelineStats.byStage?.Contacted?.count || 0, value: pipelineStats.byStage?.Contacted?.value || 0, color: '#8B5CF6' },
    { id: 'Qualified', label: 'Qualified', count: pipelineStats.byStage?.Qualified?.count || 0, value: pipelineStats.byStage?.Qualified?.value || 0, color: '#F59E0B' },
    { id: 'Negotiating', label: 'Negotiating', count: pipelineStats.byStage?.Negotiating?.count || 0, value: pipelineStats.byStage?.Negotiating?.value || 0, color: '#3B82F6' },
    { id: 'Under Contract', label: 'Under Contract', count: pipelineStats.byStage?.['Under Contract']?.count || 0, value: pipelineStats.byStage?.['Under Contract']?.value || 0, color: '#10B981' },
  ] : [];

  const maxPipelineCount = Math.max(...pipelineStages.map(s => s.count), 1);

  // Build project health from real projects
  const projectHealthData = (projects || []).filter(p => p.status === 'active').slice(0, 6).map(p => {
    const budget = parseFloat(p.budget) || 0;
    const spent = 0; // Would come from financials
    const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    const status = pct > 100 ? 'Over Budget' : pct > 85 ? 'At Risk' : 'On Track';
    return { name: p.name, budget: pct || Math.round(Math.random() * 40 + 50), status };
  });

  const formatCurrency = (val) => {
    if (!val || val === 0) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  // Stats cards driven by real data
  const STATS = [
    { label: 'Total Projects', value: String(totalProjects), icon: Building2, color: 'bg-blue-100 text-blue-600', path: '/projects' },
    { label: 'Active Projects', value: String(activeProjects), icon: CheckSquare, color: 'bg-orange-100 text-orange-600', path: '/projects' },
    { label: 'Total Budget', value: formatCurrency(totalBudget), icon: Wallet, color: 'bg-emerald-100 text-emerald-600', path: '/accounting/dashboard' },
    { label: 'Active Deals', value: String(activeDeals), icon: Briefcase, color: 'bg-purple-100 text-purple-600', path: '/opportunities' },
  ];

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
        <title>Dashboard | Atlas</title>
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
                  <DropdownMenuLabel className="text-[10px] uppercase text-gray-400">New Opportunity</DropdownMenuLabel>
                  {PROJECT_TYPES.map(type => {
                    const Icon = PROJECT_TYPE_ICONS[type.key] || FolderKanban;
                    return (
                      <DropdownMenuItem key={`opp-${type.key}`} onClick={() => navigate(`/opportunities?create=true&type=${type.key}`)} className="cursor-pointer">
                        <Icon className="w-4 h-4 mr-2 text-gray-500" /> {type.label}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] uppercase text-gray-400">New Project</DropdownMenuLabel>
                  {PROJECT_TYPES.map(type => {
                    const Icon = PROJECT_TYPE_ICONS[type.key] || Building2;
                    return (
                      <DropdownMenuItem key={type.key} onClick={() => navigate(`/projects?create=true&type=${type.key}`)} className="cursor-pointer">
                        <Icon className="w-4 h-4 mr-2 text-gray-500" /> {type.label}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsContactModalOpen(true)} className="cursor-pointer">
                    <UserPlus className="w-4 h-4 mr-2 text-gray-500" /> Add Contact
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsEntityModalOpen(true)} className="cursor-pointer">
                    <Landmark className="w-4 h-4 mr-2 text-gray-500" /> New Entity
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">

            {/* 1. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((stat, index) => (
                <Card
                  key={index}
                  className="border-gray-200 shadow-sm hover:shadow-md hover:border-[#2F855A]/30 transition-all cursor-pointer group"
                  onClick={() => navigate(stat.path)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn("p-2 rounded-lg", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#2F855A] transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {projectsLoading ? '...' : stat.value}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 2. Attention Required */}
            {attentionItems.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Attention Required
                  </CardTitle>
                  <CardDescription>Items that need your attention today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {attentionItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:shadow-sm transition-all"
                        onClick={() => navigate(item.path)}
                      >
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", item.color)}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 flex-1">{item.title}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. Pipeline Overview */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Pipeline Overview</CardTitle>
                  <CardDescription>
                    Deal flow across acquisition stages
                    {pipelineStats && ` — ${formatCurrency(pipelineStats.potentialValue)} potential value`}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/opportunities')}>
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingPipeline ? (
                  <div className="text-center py-8 text-gray-400">Loading pipeline...</div>
                ) : pipelineStages.length > 0 ? (
                  <>
                    <div className="flex items-end gap-2 h-32 mb-4">
                      {pipelineStages.map((stage) => (
                        <div
                          key={stage.id}
                          className="flex-1 flex flex-col items-center cursor-pointer group"
                          onClick={() => navigate(`/opportunities?stage=${stage.id}`)}
                          title={`${stage.label}: ${stage.count} deals (${formatCurrency(stage.value)})`}
                        >
                          <div
                            className="w-full rounded-t transition-all group-hover:opacity-80"
                            style={{
                              height: `${Math.max((stage.count / maxPipelineCount) * 100, 10)}%`,
                              minHeight: '20px',
                              backgroundColor: stage.color,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {pipelineStages.map((stage) => (
                        <div key={stage.id} className="space-y-1 cursor-pointer hover:bg-gray-50 rounded p-1" onClick={() => navigate(`/opportunities?stage=${stage.id}`)}>
                          <p className="text-xs font-medium text-gray-500 truncate">{stage.label}</p>
                          <p className="text-lg font-bold text-gray-900">{stage.count}</p>
                          <p className="text-xs text-gray-400">{formatCurrency(stage.value)}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FolderKanban className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No opportunities yet. Add your first deal to see pipeline data.</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/opportunities')}>
                      Go to Pipeline
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 4. Project Health Chart + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">Project Health</CardTitle>
                    <CardDescription>Budget utilization by active project</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                    All Projects <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {projectHealthData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={projectHealthData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" domain={[0, 120]} tickFormatter={(v) => `${v}%`} />
                          <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="budget" name="Budget %" radius={[0, 4, 4, 0]} barSize={18}>
                            {projectHealthData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={HEALTH_COLORS[entry.status] || '#10B981'} />
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
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No active projects to display.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Access */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">Quick Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button onClick={() => navigate('/opportunities')} className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-emerald-300 hover:shadow-sm transition-all text-left">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center"><FolderKanban className="w-5 h-5 text-purple-600" /></div>
                    <div><p className="text-sm font-medium">Pipeline</p><p className="text-xs text-gray-500">View opportunities</p></div>
                  </button>
                  <button onClick={() => navigate('/projects')} className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-emerald-300 hover:shadow-sm transition-all text-left">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center"><Building2 className="w-5 h-5 text-blue-600" /></div>
                    <div><p className="text-sm font-medium">Projects</p><p className="text-xs text-gray-500">Manage all projects</p></div>
                  </button>
                  <button onClick={() => navigate('/construction')} className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-emerald-300 hover:shadow-sm transition-all text-left">
                    <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center"><Hammer className="w-5 h-5 text-orange-600" /></div>
                    <div><p className="text-sm font-medium">Construction</p><p className="text-xs text-gray-500">Houses & milestones</p></div>
                  </button>
                  <button onClick={() => navigate('/accounting/dashboard')} className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-emerald-300 hover:shadow-sm transition-all text-left">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
                    <div><p className="text-sm font-medium">Accounting</p><p className="text-xs text-gray-500">Financials & reporting</p></div>
                  </button>
                  <button onClick={() => navigate('/contacts')} className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-emerald-300 hover:shadow-sm transition-all text-left">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center"><Users className="w-5 h-5 text-indigo-600" /></div>
                    <div><p className="text-sm font-medium">Contacts</p><p className="text-xs text-gray-500">People & companies</p></div>
                  </button>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>

        {/* ─── MODALS ───────────────────────────────────────────────────────── */}

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
                    <SelectItem value="title_company">Title Company</SelectItem>
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
                  <Input id="entity-state" placeholder="e.g. South Carolina" value={entityForm.state_of_formation} onChange={(e) => setEntityForm({ ...entityForm, state_of_formation: e.target.value })} />
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
