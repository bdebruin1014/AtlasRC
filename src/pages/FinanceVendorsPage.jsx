import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, Search, Plus, Download, Upload, Filter,
  MoreHorizontal, FileText, DollarSign, Phone, Mail,
  MapPin, Building, User, CreditCard, FileCheck,
  AlertCircle, CheckCircle2, Banknote, ExternalLink,
  Edit
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from '@/components/ui/use-toast';

// --- Mock Data ---
const VENDORS_DATA = [
  {
    id: 1,
    displayName: 'ABC General Contractors',
    companyName: 'ABC General Contractors Inc.',
    firstName: 'John',
    lastName: 'Doe',
    type: 'Contractor',
    phone: '(512) 555-0123',
    email: 'accounts@abcgc.com',
    openBalance: 156000,
    ytdPayments: 450000,
    status: 'Active',
    is1099Eligible: true,
    taxId: '74-1234567',
    address: '123 Builder Way, Austin, TX 78701',
    paymentTerms: 'Net 30'
  },
  {
    id: 2,
    displayName: 'Smith & Associates',
    companyName: 'Smith & Associates Legal',
    firstName: 'Sarah',
    lastName: 'Smith',
    type: 'Professional Services',
    phone: '(512) 555-0199',
    email: 'billing@smithlegal.com',
    openBalance: 0,
    ytdPayments: 25000,
    status: 'Active',
    is1099Eligible: true,
    taxId: '74-9876543',
    address: '500 Congress Ave, Austin, TX 78701',
    paymentTerms: 'Due on Receipt'
  },
  {
    id: 3,
    displayName: 'BuildPro Supply',
    companyName: 'BuildPro Supply Co.',
    firstName: 'Mike',
    lastName: 'Johnson',
    type: 'Supplier',
    phone: '(512) 555-0200',
    email: 'ar@buildpro.com',
    openBalance: 12500,
    ytdPayments: 180000,
    status: 'Active',
    is1099Eligible: false,
    taxId: '74-5551234',
    address: '800 Industrial Blvd, Austin, TX 78744',
    paymentTerms: 'Net 45'
  },
  {
    id: 4,
    displayName: 'Austin Electric Co',
    companyName: 'Austin Electric Company',
    firstName: 'David',
    lastName: 'Watts',
    type: 'Subcontractor',
    phone: '(512) 555-0300',
    email: 'billing@austinelectric.com',
    openBalance: 8750,
    ytdPayments: 95000,
    status: 'Active',
    is1099Eligible: true,
    taxId: '74-3332221',
    address: '200 Sparky Ln, Austin, TX 78704',
    paymentTerms: 'Net 30'
  },
  {
    id: 5,
    displayName: 'City of Austin',
    companyName: 'City of Austin Utilities',
    firstName: '',
    lastName: '',
    type: 'Government',
    phone: '(512) 974-2000',
    email: 'support@austinenergy.com',
    openBalance: 0,
    ytdPayments: 12400,
    status: 'Active',
    is1099Eligible: false,
    taxId: '',
    address: '721 Barton Springs Rd, Austin, TX 78704',
    paymentTerms: 'Net 15'
  },
  {
    id: 6,
    displayName: 'Apex Plumbing',
    companyName: 'Apex Plumbing LLC',
    firstName: 'Tom',
    lastName: 'Pipes',
    type: 'Subcontractor',
    phone: '(512) 555-0400',
    email: 'accounts@apexplumbing.com',
    openBalance: 5200,
    ytdPayments: 68000,
    status: 'Active',
    is1099Eligible: true,
    taxId: '74-7778889',
    address: '300 Water Works Rd, Austin, TX 78702',
    paymentTerms: 'Net 30'
  },
  {
    id: 7,
    displayName: 'Insurance Solutions Inc',
    companyName: 'Insurance Solutions Inc',
    firstName: 'Lisa',
    lastName: 'Cover',
    type: 'Professional Services',
    phone: '(512) 555-0500',
    email: 'policies@insurancesolutions.com',
    openBalance: 0,
    ytdPayments: 42000,
    status: 'Active',
    is1099Eligible: false,
    taxId: '74-1112223',
    address: '900 MoPac Expy, Austin, TX 78746',
    paymentTerms: 'Net 30'
  },
  {
    id: 8,
    displayName: 'Office Depot',
    companyName: 'Office Depot',
    firstName: '',
    lastName: '',
    type: 'Supplier',
    phone: '(800) 463-3768',
    email: 'business.services@officedepot.com',
    openBalance: 450,
    ytdPayments: 3200,
    status: 'Active',
    is1099Eligible: false,
    taxId: '',
    address: '1200 Lamar Blvd, Austin, TX 78703',
    paymentTerms: 'Due on Receipt'
  }
];

const formatCurrency = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const getVendorTypeColor = (type) => {
  switch(type) {
    case 'Contractor': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Subcontractor': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Supplier': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Professional Services': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Government': return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Utility': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const VendorsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [vendors, setVendors] = useState(VENDORS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [filterOpenBalance, setFilterOpenBalance] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Derived Data
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchesSearch = 
        v.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || v.type === filterType;
      const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
      const matchesBalance = !filterOpenBalance || v.openBalance > 0;
      
      return matchesSearch && matchesType && matchesStatus && matchesBalance;
    });
  }, [vendors, searchQuery, filterType, filterStatus, filterOpenBalance]);

  const stats = useMemo(() => {
    return {
      total: vendors.length,
      active: vendors.filter(v => v.status === 'Active').length,
      payables: vendors.reduce((acc, curr) => acc + curr.openBalance, 0),
      paidYTD: vendors.reduce((acc, curr) => acc + curr.ytdPayments, 0)
    };
  }, [vendors]);

  const handleSaveVendor = () => {
    setIsAddModalOpen(false);
    toast({
      title: "Vendor Saved",
      description: "The vendor has been successfully added to the system.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Vendors | Finance Module</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#F7FAFC] overflow-hidden">
        {/* --- 1. Header --- */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-4">
               <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(`/accounting/${entityId}/dashboard`)}
                  className="text-gray-500 hover:text-gray-900 -ml-2"
               >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
               </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-none">Vendors</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage suppliers, contractors, and payables</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="text-gray-600">
                  <Upload className="w-4 h-4 mr-2" /> Import
                </Button>
                <Button variant="outline" className="text-gray-600">
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
                <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Vendor
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. Summary Cards --- */}
        <div className="px-6 py-6 shrink-0 max-w-[1600px] w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Vendors</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                  <Building className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Vendors</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</h3>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payables</p>
                  <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats.payables)}</h3>
                </div>
                <div className="p-2 bg-red-50 rounded-lg text-red-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Paid YTD</p>
                  <h3 className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(stats.paidYTD)}</h3>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                  <Banknote className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- 3. Filter Bar --- */}
        <div className="px-6 pb-4 max-w-[1600px] w-full mx-auto">
           <div className="flex items-center justify-between bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center flex-1 gap-2 p-1">
                 <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search by vendor name or company..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 text-sm border-none focus:ring-0 bg-transparent"
                    />
                 </div>
                 <div className="h-6 w-px bg-gray-200 mx-2"></div>
                 <select 
                    className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 font-medium cursor-pointer hover:text-gray-900 py-1"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                 >
                    <option value="All">All Types</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Utility">Utility</option>
                    <option value="Government">Government</option>
                    <option value="Other">Other</option>
                 </select>
                 <div className="h-6 w-px bg-gray-200 mx-2"></div>
                 <select 
                    className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 font-medium cursor-pointer hover:text-gray-900 py-1"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                 >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                 </select>
                 <div className="h-6 w-px bg-gray-200 mx-2"></div>
                 <div className="flex items-center gap-2 px-2">
                    <Switch 
                      id="open-balance" 
                      checked={filterOpenBalance} 
                      onCheckedChange={setFilterOpenBalance} 
                    />
                    <label htmlFor="open-balance" className="text-sm font-medium text-gray-600 cursor-pointer">Has Open Balance</label>
                 </div>
              </div>
           </div>
        </div>

        {/* --- 4. Vendors Table --- */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
           <div className="max-w-[1600px] mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                       <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Vendor Name</th>
                       <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Type</th>
                       <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Contact</th>
                       <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Open Balance</th>
                       <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">YTD Payments</th>
                       <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">Status</th>
                       <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right w-[60px]"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {filteredVendors.length > 0 ? filteredVendors.map((vendor) => (
                       <tr key={vendor.id} className="hover:bg-gray-50 group transition-colors">
                          <td className="px-6 py-3">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-xs shrink-0">
                                   {vendor.displayName.substring(0,2).toUpperCase()}
                                </div>
                                <div>
                                   <div 
                                      className="font-medium text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors"
                                      onClick={() => setSelectedVendor(vendor)}
                                   >
                                      {vendor.displayName}
                                   </div>
                                   <div className="text-xs text-gray-500">{vendor.companyName}</div>
                                </div>
                                {vendor.is1099Eligible && (
                                  <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-gray-100 text-gray-500 border-gray-200 ml-1">1099</Badge>
                                )}
                             </div>
                          </td>
                          <td className="px-6 py-3">
                             <Badge variant="outline" className={cn("font-normal text-xs", getVendorTypeColor(vendor.type))}>
                                {vendor.type}
                             </Badge>
                          </td>
                          <td className="px-6 py-3 text-xs">
                             {vendor.email && (
                               <div className="flex items-center gap-1 text-gray-600 mb-0.5">
                                  <Mail className="w-3 h-3 text-gray-400" /> {vendor.email}
                               </div>
                             )}
                             {vendor.phone && (
                               <div className="flex items-center gap-1 text-gray-500">
                                  <Phone className="w-3 h-3 text-gray-400" /> {vendor.phone}
                               </div>
                             )}
                          </td>
                          <td className="px-6 py-3 text-right font-mono font-medium">
                             {vendor.openBalance > 0 ? (
                                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{formatCurrency(vendor.openBalance)}</span>
                             ) : (
                                <span className="text-gray-400">-</span>
                             )}
                          </td>
                          <td className="px-6 py-3 text-right font-mono text-gray-700">
                             {formatCurrency(vendor.ytdPayments)}
                          </td>
                          <td className="px-6 py-3 text-center">
                             <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                vendor.status === 'Active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                             )}>
                                {vendor.status}
                             </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                             <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => setSelectedVendor(vendor)}>
                                <MoreHorizontal className="w-4 h-4 text-gray-500" />
                             </Button>
                          </td>
                       </tr>
                    )) : (
                       <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                             <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                             <p>No vendors found matching your criteria.</p>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* --- 5. Vendor Detail Drawer --- */}
        <Sheet open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
           <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto p-0" side="right">
              {selectedVendor && (
                 <div className="flex flex-col h-full">
                    <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
                       <div className="flex items-start justify-between mb-4">
                          <div className="flex gap-4">
                             <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-700 shadow-sm">
                                {selectedVendor.displayName.substring(0,2).toUpperCase()}
                             </div>
                             <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedVendor.displayName}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                   <Badge variant="outline" className={cn(getVendorTypeColor(selectedVendor.type))}>{selectedVendor.type}</Badge>
                                   <span className="text-sm text-gray-500">{selectedVendor.companyName}</span>
                                   {selectedVendor.is1099Eligible && (
                                      <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">1099 Eligible</Badge>
                                   )}
                                </div>
                             </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)}>
                             <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                          </Button>
                       </div>
                       
                       <div className="grid grid-cols-3 gap-4 mt-6">
                          <div className="bg-white p-3 rounded border border-gray-200">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Open Balance</p>
                             <p className={cn("text-lg font-bold", selectedVendor.openBalance > 0 ? "text-red-600" : "text-gray-900")}>
                                {formatCurrency(selectedVendor.openBalance)}
                             </p>
                          </div>
                          <div className="bg-white p-3 rounded border border-gray-200">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">YTD Payments</p>
                             <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedVendor.ytdPayments)}</p>
                          </div>
                          <div className="bg-white p-3 rounded border border-gray-200">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Credit Available</p>
                             <p className="text-lg font-bold text-gray-400">N/A</p>
                          </div>
                       </div>
                    </div>

                    <div className="flex-1 bg-white">
                       <Tabs defaultValue="overview" className="w-full h-full flex flex-col" onValueChange={setActiveTab}>
                          <div className="px-6 border-b border-gray-200">
                             <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0">
                                <TabsTrigger 
                                   value="overview" 
                                   className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none px-0 pb-3 pt-3 border-b-2 border-transparent"
                                >
                                   Overview
                                </TabsTrigger>
                                <TabsTrigger 
                                   value="bills" 
                                   className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none px-0 pb-3 pt-3 border-b-2 border-transparent"
                                >
                                   Bills & Expenses
                                </TabsTrigger>
                                <TabsTrigger 
                                   value="payments" 
                                   className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none px-0 pb-3 pt-3 border-b-2 border-transparent"
                                >
                                   Payments
                                </TabsTrigger>
                                <TabsTrigger 
                                   value="documents" 
                                   className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none px-0 pb-3 pt-3 border-b-2 border-transparent"
                                >
                                   Documents
                                </TabsTrigger>
                                <TabsTrigger 
                                   value="tax" 
                                   className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none px-0 pb-3 pt-3 border-b-2 border-transparent"
                                >
                                   1099 & Tax
                                </TabsTrigger>
                             </TabsList>
                          </div>

                          <div className="flex-1 overflow-y-auto p-6">
                             <TabsContent value="overview" className="space-y-6 m-0">
                                <div className="grid grid-cols-2 gap-8">
                                   <div className="space-y-4">
                                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                         <User className="w-4 h-4 text-gray-400" /> Contact Information
                                      </h3>
                                      <div className="space-y-3 text-sm">
                                         <div className="grid grid-cols-[100px_1fr]">
                                            <span className="text-gray-500">Name</span>
                                            <span className="font-medium text-gray-900">{selectedVendor.firstName} {selectedVendor.lastName || '-'}</span>
                                         </div>
                                         <div className="grid grid-cols-[100px_1fr]">
                                            <span className="text-gray-500">Email</span>
                                            <span className="font-medium text-blue-600 hover:underline cursor-pointer">{selectedVendor.email || '-'}</span>
                                         </div>
                                         <div className="grid grid-cols-[100px_1fr]">
                                            <span className="text-gray-500">Phone</span>
                                            <span className="font-medium text-gray-900">{selectedVendor.phone || '-'}</span>
                                         </div>
                                         <div className="grid grid-cols-[100px_1fr]">
                                            <span className="text-gray-500">Website</span>
                                            <span className="font-medium text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                                               www.example.com <ExternalLink className="w-3 h-3" />
                                            </span>
                                         </div>
                                      </div>
                                   </div>

                                   <div className="space-y-4">
                                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                         <MapPin className="w-4 h-4 text-gray-400" /> Address
                                      </h3>
                                      <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">
                                         <div className="font-medium text-gray-900 mb-1">Billing Address</div>
                                         <div>{selectedVendor.address.split(',')[0]}</div>
                                         <div>{selectedVendor.address.split(',').slice(1).join(',')}</div>
                                      </div>
                                   </div>
                                </div>
                                
                                <div className="pt-6 border-t border-gray-200">
                                   <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-4">
                                      <CreditCard className="w-4 h-4 text-gray-400" /> Financial Details
                                   </h3>
                                   <div className="grid grid-cols-2 gap-6 text-sm">
                                      <div className="space-y-3">
                                         <div className="grid grid-cols-[140px_1fr]">
                                            <span className="text-gray-500">Terms</span>
                                            <span className="font-medium text-gray-900">{selectedVendor.paymentTerms}</span>
                                         </div>
                                         <div className="grid grid-cols-[140px_1fr]">
                                            <span className="text-gray-500">Default Account</span>
                                            <span className="font-medium text-gray-900">5000 - Cost of Goods Sold</span>
                                         </div>
                                      </div>
                                      <div className="space-y-3">
                                         <div className="grid grid-cols-[140px_1fr]">
                                            <span className="text-gray-500">Tax ID</span>
                                            <span className="font-medium text-gray-900 font-mono">{selectedVendor.taxId || 'Not provided'}</span>
                                         </div>
                                         <div className="grid grid-cols-[140px_1fr]">
                                            <span className="text-gray-500">Opening Balance</span>
                                            <span className="font-medium text-gray-900">$0.00</span>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </TabsContent>

                             <TabsContent value="bills" className="m-0">
                                <div className="flex justify-between items-center mb-4">
                                   <h3 className="text-sm font-bold text-gray-900">Open Bills</h3>
                                   <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs">
                                      <Plus className="w-3 h-3 mr-1" /> Create Bill
                                   </Button>
                                </div>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                   <table className="w-full text-left text-sm">
                                      <thead className="bg-gray-50 border-b border-gray-200">
                                         <tr>
                                            <th className="px-4 py-2 font-medium text-gray-500 text-xs">Date</th>
                                            <th className="px-4 py-2 font-medium text-gray-500 text-xs">Bill #</th>
                                            <th className="px-4 py-2 font-medium text-gray-500 text-xs">Due Date</th>
                                            <th className="px-4 py-2 font-medium text-gray-500 text-xs text-right">Amount</th>
                                            <th className="px-4 py-2 font-medium text-gray-500 text-xs text-right">Balance</th>
                                         </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                         {selectedVendor.openBalance > 0 ? (
                                            <tr className="hover:bg-gray-50">
                                               <td className="px-4 py-2 text-gray-600">Dec 01, 2025</td>
                                               <td className="px-4 py-2 text-blue-600 cursor-pointer font-medium">INV-2025-001</td>
                                               <td className="px-4 py-2 text-gray-600">Dec 31, 2025</td>
                                               <td className="px-4 py-2 text-right font-mono">{formatCurrency(selectedVendor.openBalance)}</td>
                                               <td className="px-4 py-2 text-right font-mono font-bold text-red-600">{formatCurrency(selectedVendor.openBalance)}</td>
                                            </tr>
                                         ) : (
                                            <tr>
                                               <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">No open bills</td>
                                            </tr>
                                         )}
                                      </tbody>
                                   </table>
                                </div>
                             </TabsContent>

                             <TabsContent value="payments" className="m-0">
                                <div className="text-center py-8 text-gray-500 italic border border-dashed border-gray-200 rounded bg-gray-50">
                                   No recent payments found.
                                </div>
                             </TabsContent>

                             <TabsContent value="documents" className="m-0 space-y-4">
                                <div className="flex justify-between items-center">
                                   <h3 className="text-sm font-bold text-gray-900">Vendor Documents</h3>
                                   <Button size="sm" variant="outline" className="h-8 text-xs">
                                      <Upload className="w-3 h-3 mr-1" /> Upload
                                   </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                   {[
                                      { name: 'W-9 Form (2025).pdf', date: 'Jan 12, 2025', size: '245 KB', type: 'Tax Form' },
                                      { name: 'Certificate of Insurance.pdf', date: 'Jan 12, 2025', size: '1.2 MB', type: 'Insurance' }
                                   ].map((doc, i) => (
                                      <div key={i} className="flex items-start p-3 border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer group bg-white">
                                         <FileText className="w-8 h-8 text-red-500 mr-3 shrink-0" />
                                         <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate group-hover:text-emerald-700">{doc.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                               <Badge variant="secondary" className="text-[10px] h-4 px-1">{doc.type}</Badge>
                                               <span className="text-xs text-gray-400">{doc.size} • {doc.date}</span>
                                            </div>
                                         </div>
                                      </div>
                                   ))}
                                </div>
                             </TabsContent>

                             <TabsContent value="tax" className="m-0 space-y-6">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                   <div className="flex items-start gap-3">
                                      <FileCheck className="w-5 h-5 text-yellow-600 mt-0.5" />
                                      <div>
                                         <h4 className="text-sm font-bold text-yellow-800">1099 Eligibility Status</h4>
                                         <p className="text-sm text-yellow-700 mt-1">
                                            This vendor is marked as <span className="font-bold">1099 Eligible</span>. 
                                            Total payments YTD: <span className="font-mono font-bold">{formatCurrency(selectedVendor.ytdPayments)}</span>.
                                         </p>
                                      </div>
                                   </div>
                                </div>

                                <div className="space-y-4">
                                   <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                      <span className="text-sm font-medium text-gray-700">Tax Identification Number (TIN)</span>
                                      <span className="text-sm font-mono text-gray-900">{selectedVendor.taxId || 'Missing'}</span>
                                   </div>
                                   <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                      <span className="text-sm font-medium text-gray-700">Federal Tax Classification</span>
                                      <span className="text-sm text-gray-900">Individual/Sole Proprietor</span>
                                   </div>
                                   <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                      <span className="text-sm font-medium text-gray-700">W-9 on File?</span>
                                      <span className="flex items-center text-sm text-green-600 font-medium">
                                         <CheckCircle2 className="w-4 h-4 mr-1" /> Yes (Verified Jan 2025)
                                      </span>
                                   </div>
                                </div>
                             </TabsContent>
                          </div>
                       </Tabs>
                    </div>
                 </div>
              )}
           </SheetContent>
        </Sheet>

        {/* --- 6. Add/Edit Vendor Modal --- */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
           <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                 <DialogTitle>Add New Vendor</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-6 py-4">
                 {/* -- Left Column -- */}
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-gray-700">Company Name <span className="text-red-500">*</span></label>
                       <input className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="e.g. Acme Construction" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-700">First Name</label>
                          <input className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-700">Last Name</label>
                          <input className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-gray-700">Vendor Type</label>
                       <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm">
                          <option>Contractor</option>
                          <option>Subcontractor</option>
                          <option>Supplier</option>
                          <option>Professional Services</option>
                          <option>Utility</option>
                          <option>Government</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-gray-700">Email</label>
                       <input className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" type="email" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-700">Phone</label>
                          <input className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-700">Mobile</label>
                          <input className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
                       </div>
                    </div>
                 </div>

                 {/* -- Right Column -- */}
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-medium text-gray-700">Billing Address</label>
                       <textarea className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm resize-none" placeholder="Street, City, State, Zip" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-700">Payment Terms</label>
                          <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm">
                             <option>Net 30</option>
                             <option>Net 15</option>
                             <option>Due on Receipt</option>
                             <option>Net 60</option>
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-700">Tax ID / SSN</label>
                          <input className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" placeholder="XX-XXXXXXX" />
                       </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                       <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Track for 1099</label>
                          <Switch />
                       </div>
                       <div className="flex items-center justify-between">
                           <label className="text-sm font-medium text-gray-700">W-9 on File</label>
                           <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4" />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Default Expense Account</label>
                        <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm">
                             <option>5000 - Cost of Goods Sold</option>
                             <option>6100 - Advertising</option>
                             <option>6200 - Professional Fees</option>
                          </select>
                    </div>
                 </div>
              </div>

              <DialogFooter>
                 <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                 <Button className="bg-[#2F855A] hover:bg-[#276749] text-white" onClick={handleSaveVendor}>
                    Save Vendor
                 </Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default VendorsPage;