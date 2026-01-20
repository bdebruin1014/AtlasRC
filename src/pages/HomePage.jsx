import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, LayoutDashboard, Activity, ArrowRight, 
  Building2, CheckSquare, DollarSign, Calendar,
  MoreHorizontal, Briefcase, Users, FileText,
  TrendingUp, ChevronDown, Wallet, CreditCard
} from 'lucide-react';
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

// Mock Data for Dashboard
const STATS = [
  { label: 'Total Projects', value: '12', icon: Building2, color: 'bg-blue-100 text-blue-600' },
  { label: 'Active Tasks', value: '8', icon: CheckSquare, color: 'bg-orange-100 text-orange-600' },
  { label: 'Cash Position', value: '$1.24M', icon: Wallet, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Active Deals', value: '5', icon: Briefcase, color: 'bg-purple-100 text-purple-600' },
];

const RECENT_ACTIVITY = [
  { user: 'Alex J.', action: 'completed task', target: 'Review Highland Park Permits', time: '2 hours ago', icon: CheckSquare, color: 'bg-emerald-100 text-emerald-700' },
  { user: 'System', action: 'received payment', target: '$12,500 from Unit 4B Closing', time: '4 hours ago', icon: DollarSign, color: 'bg-green-100 text-green-700' },
  { user: 'Sarah M.', action: 'uploaded document', target: 'Q3 Investor Report.pdf', time: 'Yesterday', icon: FileText, color: 'bg-blue-100 text-blue-700' },
  { user: 'Mike R.', action: 'created project', target: 'Riverside Commercial Phase 2', time: 'Yesterday', icon: Building2, color: 'bg-purple-100 text-purple-700' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Modal States
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  
  // Transaction Form State
  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    account: '',
    type: 'Expense',
    amount: '',
    payee: '',
    memo: ''
  });

  const handleSaveTransaction = () => {
    // Validate
    if (!transactionForm.amount || !transactionForm.account || !transactionForm.payee) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields."
      });
      return;
    }

    // Simulate Save
    toast({
      title: "Transaction Recorded",
      description: `${transactionForm.type} of $${transactionForm.amount} has been recorded.`
    });
    setIsTransactionModalOpen(false);
    
    // Reset form
    setTransactionForm({
      date: new Date().toISOString().split('T')[0],
      account: '',
      type: 'Expense',
      amount: '',
      payee: '',
      memo: ''
    });
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
               
               {/* Stats Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {STATS.map((stat, index) => (
                    <Card key={index} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                       <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                             <div className={cn("p-2 rounded-lg", stat.color)}>
                                <stat.icon className="w-5 h-5" />
                             </div>
                             {index === 2 && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>}
                          </div>
                          <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                       </CardContent>
                    </Card>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activity */}
                  <Card className="lg:col-span-2 border-gray-200 shadow-sm">
                     <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900">Recent Activity</CardTitle>
                        <CardDescription>Latest updates across your projects and teams</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-6">
                           {RECENT_ACTIVITY.map((item, i) => (
                              <div key={i} className="flex items-start gap-4">
                                 <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", item.color)}>
                                    <item.icon className="w-4 h-4" />
                                 </div>
                                 <div className="flex-1">
                                    <p className="text-sm text-gray-900"><span className="font-semibold">{item.user}</span> {item.action} <span className="font-medium text-gray-700">{item.target}</span></p>
                                    <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-sm text-gray-500 hover:text-emerald-600">View All Activity</Button>
                     </CardContent>
                  </Card>

                  {/* Quick Links / Upcoming */}
                  <Card className="border-gray-200 shadow-sm">
                     <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900">Upcoming Tasks</CardTitle>
                        <CardDescription>Tasks due in the next 7 days</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-4">
                           {[
                              { title: 'Review structural drawings', project: 'Highland Park', due: 'Today', priority: 'High' },
                              { title: 'Call City Planner', project: 'Riverside', due: 'Tomorrow', priority: 'Urgent' },
                              { title: 'Approve Invoice #1042', project: 'General', due: 'Dec 08', priority: 'Medium' },
                           ].map((task, i) => (
                              <div key={i} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer">
                                 <div className="flex justify-between items-start mb-1">
                                    <span className={cn(
                                       "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                       task.priority === 'Urgent' ? "bg-red-100 text-red-700" : 
                                       task.priority === 'High' ? "bg-orange-100 text-orange-700" : 
                                       "bg-blue-100 text-blue-700"
                                    )}>{task.priority}</span>
                                    <span className="text-xs text-gray-400">{task.due}</span>
                                 </div>
                                 <h4 className="text-sm font-medium text-gray-900 truncate">{task.title}</h4>
                                 <p className="text-xs text-gray-500 mt-0.5">{task.project}</p>
                              </div>
                           ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/operations/tasks')}>Go to Tasks</Button>
                     </CardContent>
                  </Card>
               </div>

            </div>
         </div>

         {/* Record Transaction Modal */}
         <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                  <DialogTitle>Record Transaction</DialogTitle>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input 
                          id="date" 
                          type="date" 
                          value={transactionForm.date}
                          onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})} 
                        />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select 
                          value={transactionForm.type}
                          onValueChange={(val) => setTransactionForm({...transactionForm, type: val})}
                        >
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
                     <Label htmlFor="account">Account</Label>
                     <Select 
                       value={transactionForm.account}
                       onValueChange={(val) => setTransactionForm({...transactionForm, account: val})}
                     >
                        <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="op-cash">Operating Cash (...8821)</SelectItem>
                           <SelectItem value="payroll">Payroll (...9912)</SelectItem>
                           <SelectItem value="construct">Construction Yield (...1102)</SelectItem>
                           <SelectItem value="credit">Chase Credit Card (...4452)</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="grid gap-2">
                     <Label htmlFor="amount">Amount</Label>
                     <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input 
                          id="amount" 
                          type="number" 
                          placeholder="0.00" 
                          className="pl-9"
                          value={transactionForm.amount}
                          onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="grid gap-2">
                     <Label htmlFor="payee">Payee / Description</Label>
                     <Input 
                       id="payee" 
                       placeholder="e.g. Home Depot, Client Payment" 
                       value={transactionForm.payee}
                       onChange={(e) => setTransactionForm({...transactionForm, payee: e.target.value})}
                     />
                  </div>

                  <div className="grid gap-2">
                     <Label htmlFor="memo">Memo</Label>
                     <Input 
                       id="memo" 
                       placeholder="Optional notes..." 
                       value={transactionForm.memo}
                       onChange={(e) => setTransactionForm({...transactionForm, memo: e.target.value})}
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsTransactionModalOpen(false)}>Cancel</Button>
                  <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={handleSaveTransaction}>Save Transaction</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

      </div>
    </>
  );
};

export default HomePage;