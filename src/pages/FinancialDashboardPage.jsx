import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight, ArrowDownLeft, DollarSign, Wallet,
  CreditCard, FileText, Plus, ArrowRight, Calendar,
  TrendingUp, AlertCircle, Building2, MoreHorizontal,
  BarChart3, PieChart, Download, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// --- Mock Data ---

const SUMMARY_STATS = {
  cashPosition: 1245000,
  receivables: 45200,
  payables: 17450,
  netIncome: 85400
};

const CASH_FLOW_DATA = [
  { month: 'Jul', inflow: 120000, outflow: 85000 },
  { month: 'Aug', inflow: 145000, outflow: 95000 },
  { month: 'Sep', inflow: 135000, outflow: 110000 },
  { month: 'Oct', inflow: 190000, outflow: 105000 },
  { month: 'Nov', inflow: 165000, outflow: 140000 },
  { month: 'Dec', inflow: 210000, outflow: 125000 },
];

const RECENT_TRANSACTIONS = [
  { id: 1, date: '2025-12-02', desc: 'Payment to Smith Engineering', account: 'Professional Fees', amount: -2500.00 },
  { id: 2, date: '2025-12-01', desc: 'Rent Income - Unit 4B', account: 'Rental Income', amount: 1850.00 },
  { id: 3, date: '2025-11-29', desc: 'Home Depot Purchase', account: 'Materials', amount: -432.15 },
  { id: 4, date: '2025-11-28', desc: 'Draw #4 Funding', account: 'Loan Proceeds', amount: 45000.00 },
  { id: 5, date: '2025-11-28', desc: 'City Water Utilities', account: 'Utilities', amount: -150.25 },
];

const UPCOMING_PAYMENTS = [
  { id: 1, dueDate: '2025-11-30', vendor: 'BuildPro Supply', amount: 12500.00, status: 'Overdue' },
  { id: 2, dueDate: '2025-12-05', vendor: 'Apex Plumbing', amount: 4200.00, status: 'Due Soon' },
  { id: 3, dueDate: '2025-12-10', vendor: 'City of Austin', amount: 350.00, status: 'Due Soon' },
  { id: 4, dueDate: '2025-12-15', vendor: 'Insurance Solutions', amount: 1200.00, status: 'Future' },
];

const ENTITIES = [
  { id: 'ent_1', name: 'AtlasDev Corp', projects: 4, cash: 850000, ar: 32000, ap: 12500 },
  { id: 'ent_2', name: 'Highland Park LLC', projects: 2, cash: 250000, ar: 8500, ap: 4200 },
  { id: 'ent_3', name: 'Sunset Ridge LP', projects: 1, cash: 145000, ar: 4700, ap: 750 },
];

const formatCurrency = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const formatDate = (dateStr) => 
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const getDaysUntilDue = (dateStr) => {
  const today = new Date('2025-12-02'); // Mock current date
  const due = new Date(dateStr);
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

const FinancialDashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('this_month');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentData, setPaymentData] = useState({
    type: 'payment_out',
    vendor: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    account: '',
    reference: '',
    memo: '',
  });

  const handleRecordPayment = async () => {
    if (!paymentData.vendor || !paymentData.amount || !paymentData.account) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in vendor, amount, and account',
        variant: 'destructive',
      });
      return;
    }

    setPaymentSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Payment Recorded',
        description: `${paymentData.type === 'payment_out' ? 'Payment to' : 'Payment from'} ${paymentData.vendor} for ${formatCurrency(parseFloat(paymentData.amount))} has been recorded.`,
      });
      setPaymentDialogOpen(false);
      setPaymentData({
        type: 'payment_out',
        vendor: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        account: '',
        reference: '',
        memo: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive',
      });
    } finally {
      setPaymentSaving(false);
    }
  };

  // Helper to calculate bar height percentage
  const maxFlow = Math.max(...CASH_FLOW_DATA.map(d => Math.max(d.inflow, d.outflow))) * 1.1; // 10% buffer

  return (
    <>
      <Helmet>
        <title>Financial Dashboard | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#EDF2F7] overflow-hidden font-sans">
         {/* --- Header --- */}
         <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
                  <p className="text-sm text-gray-500 mt-1">Real-time financial performance across all entities</p>
               </div>
               <div className="flex items-center gap-3">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[180px] bg-white border-gray-300">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="this_quarter">This Quarter</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button className="bg-[#2F855A] hover:bg-[#276749] text-white shadow-sm">
                    <Download className="w-4 h-4 mr-2" /> Report
                  </Button>
               </div>
            </div>
         </div>

         {/* --- Main Content --- */}
         <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
               
               {/* 1. Summary Cards */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-gray-200 shadow-sm">
                     <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                           <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                              <Wallet className="w-5 h-5" />
                           </div>
                           <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">+12%</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Cash Position</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(SUMMARY_STATS.cashPosition)}</h3>
                     </CardContent>
                  </Card>
                  <Card className="border-gray-200 shadow-sm">
                     <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                           <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                              <ArrowDownLeft className="w-5 h-5" />
                           </div>
                           <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">+5%</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Accounts Receivable</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(SUMMARY_STATS.receivables)}</h3>
                     </CardContent>
                  </Card>
                  <Card className="border-gray-200 shadow-sm">
                     <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                           <div className="p-2 bg-orange-100 rounded-lg text-orange-700">
                              <ArrowUpRight className="w-5 h-5" />
                           </div>
                           <Badge variant="outline" className="text-orange-700 bg-orange-50 border-orange-200">-2%</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Accounts Payable</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(SUMMARY_STATS.payables)}</h3>
                     </CardContent>
                  </Card>
                  <Card className="border-gray-200 shadow-sm">
                     <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                           <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                              <TrendingUp className="w-5 h-5" />
                           </div>
                           <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200">+8%</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Net Income (YTD)</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(SUMMARY_STATS.netIncome)}</h3>
                     </CardContent>
                  </Card>
               </div>

               {/* 2. Middle Section: Chart & Quick Actions */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cash Flow Chart (Custom Implementation for Constraint Compliance) */}
                  <Card className="lg:col-span-2 border-gray-200 shadow-sm flex flex-col">
                     <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900">Cash Flow Analysis</CardTitle>
                        <CardDescription>Inflow vs Outflow over the last 6 months</CardDescription>
                     </CardHeader>
                     <CardContent className="flex-1 min-h-[300px] flex items-end justify-between gap-2 px-6 pb-6 pt-2">
                        {CASH_FLOW_DATA.map((data, idx) => (
                           <div key={idx} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group relative">
                              {/* Tooltip-like overlay */}
                              <div className="absolute -top-12 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                                 In: {formatCurrency(data.inflow)} | Out: {formatCurrency(data.outflow)}
                              </div>
                              
                              <div className="flex gap-1 items-end h-full w-full justify-center">
                                 {/* Inflow Bar */}
                                 <div 
                                    className="w-3 sm:w-6 bg-emerald-500 rounded-t-sm hover:bg-emerald-600 transition-all duration-500"
                                    style={{ height: `${(data.inflow / maxFlow) * 100}%` }}
                                 />
                                 {/* Outflow Bar */}
                                 <div 
                                    className="w-3 sm:w-6 bg-red-400 rounded-t-sm hover:bg-red-500 transition-all duration-500"
                                    style={{ height: `${(data.outflow / maxFlow) * 100}%` }}
                                 />
                              </div>
                              <span className="text-xs font-medium text-gray-500 mt-2">{data.month}</span>
                           </div>
                        ))}
                     </CardContent>
                     <div className="px-6 pb-4 flex justify-center gap-6 text-xs text-gray-500">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Cash In</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded-sm"></div> Cash Out</div>
                     </div>
                  </Card>

                  {/* Quick Actions & Upcoming Payments */}
                  <div className="space-y-6">
                     {/* Quick Actions */}
                     <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="pb-3">
                           <CardTitle className="text-base font-bold text-gray-900">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                           <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors" onClick={() => setPaymentDialogOpen(true)}>
                              <CreditCard className="w-5 h-5" />
                              <span className="text-xs">Record Payment</span>
                           </Button>
                           <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors" onClick={() => navigate('/finance/entities/1110/receivables')}>
                              <FileText className="w-5 h-5" />
                              <span className="text-xs">Create Invoice</span>
                           </Button>
                           <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 transition-colors" onClick={() => navigate('/finance/entities/1110/bills')}>
                              <Plus className="w-5 h-5" />
                              <span className="text-xs">Enter Bill</span>
                           </Button>
                           <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors" onClick={() => toast({ title: "Transfer Funds", description: "Initiating transfer protocol..." })}>
                              <ArrowRight className="w-5 h-5" />
                              <span className="text-xs">Transfer Funds</span>
                           </Button>
                        </CardContent>
                     </Card>

                     {/* Upcoming Payments */}
                     <Card className="border-gray-200 shadow-sm flex-1">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                           <CardTitle className="text-base font-bold text-gray-900">Upcoming Payments</CardTitle>
                           <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">Next 14 Days</Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {UPCOMING_PAYMENTS.map(pay => {
                              const days = getDaysUntilDue(pay.dueDate);
                              const isOverdue = days < 0;
                              
                              return (
                                 <div key={pay.id} className="flex justify-between items-center text-sm">
                                    <div className="flex-1 min-w-0 pr-4">
                                       <p className="font-medium text-gray-900 truncate">{pay.vendor}</p>
                                       <div className="flex items-center gap-2 text-xs">
                                          <span className={cn(isOverdue ? "text-red-600 font-bold" : "text-gray-500")}>
                                             {formatDate(pay.dueDate)}
                                          </span>
                                          <span className="text-gray-300">•</span>
                                          <span className={cn(
                                             "font-medium",
                                             isOverdue ? "text-red-600" : days <= 3 ? "text-orange-500" : "text-gray-500"
                                          )}>
                                             {isOverdue ? `${Math.abs(days)} days overdue` : `Due in ${days} days`}
                                          </span>
                                       </div>
                                    </div>
                                    <span className="font-bold text-gray-900">{formatCurrency(pay.amount)}</span>
                                 </div>
                              );
                           })}
                        </CardContent>
                     </Card>
                  </div>
               </div>

               {/* 3. Bottom Section: Recent Transactions & Entity Summary */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Transactions */}
                  <Card className="lg:col-span-2 border-gray-200 shadow-sm">
                     <CardHeader className="flex flex-row items-center justify-between pb-0">
                        <CardTitle className="text-lg font-bold text-gray-900">Recent Transactions</CardTitle>
                        <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">View All</Button>
                     </CardHeader>
                     <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left">
                              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                 <tr>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Description</th>
                                    <th className="px-4 py-3 font-medium">Account</th>
                                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                 {RECENT_TRANSACTIONS.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50/50">
                                       <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(tx.date)}</td>
                                       <td className="px-4 py-3 font-medium text-gray-900">{tx.desc}</td>
                                       <td className="px-4 py-3 text-gray-500">
                                          <Badge variant="outline" className="font-normal text-xs text-gray-500 border-gray-200">{tx.account}</Badge>
                                       </td>
                                       <td className={cn("px-4 py-3 text-right font-mono font-medium", tx.amount > 0 ? "text-emerald-600" : "text-gray-900")}>
                                          {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </CardContent>
                  </Card>

                  {/* Entity Summary Cards */}
                  <div className="space-y-4">
                     <h3 className="text-lg font-bold text-gray-900">Entity Snapshot</h3>
                     {ENTITIES.map(ent => (
                        <Card key={ent.id} className="border-gray-200 shadow-sm hover:border-emerald-200 transition-colors cursor-pointer group">
                           <CardContent className="p-4">
                              <div className="flex justify-between items-center mb-3">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                       <Building2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                       <p className="font-bold text-gray-900 text-sm">{ent.name}</p>
                                       <p className="text-xs text-gray-500">{ent.projects} Active Projects</p>
                                    </div>
                                 </div>
                                 <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 text-center mt-2 pt-2 border-t border-gray-100">
                                 <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Cash</p>
                                    <p className="text-xs font-bold text-gray-900">{formatCurrency(ent.cash)}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold">AR</p>
                                    <p className="text-xs font-bold text-blue-600">{formatCurrency(ent.ar)}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold">AP</p>
                                    <p className="text-xs font-bold text-red-500">{formatCurrency(ent.ap)}</p>
                                 </div>
                              </div>
                           </CardContent>
                        </Card>
                     ))}
                     <Button variant="ghost" className="w-full text-gray-500 hover:text-emerald-600 text-xs border border-dashed border-gray-300">
                        View All Entities
                     </Button>
                  </div>
               </div>

            </div>
         </div>
      </div>

      {/* Payment Recording Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record an incoming or outgoing payment transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Payment Type</Label>
              <Select
                value={paymentData.type}
                onValueChange={(value) => setPaymentData({ ...paymentData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_out">Payment Out (Bill Payment)</SelectItem>
                  <SelectItem value="payment_in">Payment In (Receipt)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{paymentData.type === 'payment_out' ? 'Pay To (Vendor)' : 'Received From'}</Label>
                <Input
                  placeholder="Enter name"
                  value={paymentData.vendor}
                  onChange={(e) => setPaymentData({ ...paymentData, vendor: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={paymentData.date}
                  onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Bank Account</Label>
                <Select
                  value={paymentData.account}
                  onValueChange={(value) => setPaymentData({ ...paymentData, account: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Operating Checking</SelectItem>
                    <SelectItem value="savings">Reserve Savings</SelectItem>
                    <SelectItem value="money_market">Money Market</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Reference / Check Number</Label>
              <Input
                placeholder="Optional"
                value={paymentData.reference}
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Memo</Label>
              <Textarea
                placeholder="Add notes about this payment..."
                value={paymentData.memo}
                onChange={(e) => setPaymentData({ ...paymentData, memo: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={paymentSaving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {paymentSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FinancialDashboardPage;