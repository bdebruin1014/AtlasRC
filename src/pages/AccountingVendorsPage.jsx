import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, Plus, Search, Filter, MoreVertical, 
  Mail, Phone, FileText, ExternalLink, Edit2,
  Building2, User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const VendorsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('entity_id', entityId)
          .order('name');
        
        if (error) throw error;
        setVendors(data || []);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        toast({ variant: "destructive", title: "Error", description: "Failed to load vendors." });
      } finally {
        setLoading(false);
      }
    };
    if (entityId) fetchVendors();
  }, [entityId]);

  const handleCreateVendor = async () => {
    if (!newVendorName) return;
    try {
      const { data, error } = await supabase.from('vendors').insert([{
        entity_id: entityId,
        name: newVendorName,
        email: newVendorEmail,
        phone: newVendorPhone,
        is_active: true,
        vendor_type: 'Company' // default
      }]).select().single();

      if (error) throw error;

      setVendors([...vendors, data]);
      setIsAddModalOpen(false);
      setNewVendorName('');
      setNewVendorEmail('');
      setNewVendorPhone('');
      toast({ title: "Vendor Created", description: `${data.name} added successfully.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Vendors | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#F7FAFC] overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
           <div className="max-w-[1600px] mx-auto">
              <div className="flex items-center justify-between mb-4">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/accounting/entity/${entityId}/dashboard`)}
                    className="text-gray-500 hover:text-gray-900 -ml-2"
                 >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                 </Button>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                       <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                       <h1 className="text-2xl font-bold text-gray-900 leading-none">Vendors</h1>
                       <p className="text-sm text-gray-500 mt-1">Manage suppliers and contractors</p>
                    </div>
                 </div>
                 <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> New Vendor
                 </Button>
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
           <div className="max-w-[1600px] mx-auto space-y-6">
              
              {/* Toolbar */}
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                 <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                       type="text" 
                       placeholder="Search vendors..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                 </div>
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                    <Button variant="outline" size="sm">Export List</Button>
                 </div>
              </div>

              {/* Vendors List */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x md:divide-gray-100 bg-gray-50">
                    {/* Just grid layout logic placeholder, simpler to use list for now */}
                 </div>
                 
                 <div className="divide-y divide-gray-100">
                    {filteredVendors.length === 0 ? (
                       <div className="p-12 text-center text-gray-500">No vendors found.</div>
                    ) : (
                       filteredVendors.map(vendor => (
                          <div key={vendor.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                             <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold">
                                   {vendor.name.charAt(0)}
                                </div>
                                <div>
                                   <h3 className="font-bold text-gray-900">{vendor.name}</h3>
                                   <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                      {vendor.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {vendor.email}</span>}
                                      {vendor.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {vendor.phone}</span>}
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                   <p className="text-xs text-gray-400 uppercase font-medium">Open Balance</p>
                                   <p className="font-mono font-medium text-gray-900">
                                      ${Number(vendor.open_balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                   </p>
                                </div>
                                <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                         <MoreVertical className="w-4 h-4 text-gray-400" />
                                      </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end">
                                      <DropdownMenuItem>View Details</DropdownMenuItem>
                                      <DropdownMenuItem>Create Bill</DropdownMenuItem>
                                      <DropdownMenuItem>Pay Vendor</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                                   </DropdownMenuContent>
                                </DropdownMenu>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>

           </div>
        </div>

        {/* Add Vendor Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
           <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto flex flex-col">
              <DialogHeader>
                 <DialogTitle>Add New Vendor</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="grid gap-2">
                    <Label>Vendor Name</Label>
                    <Input value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} placeholder="Company or Name" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                       <Label>Email</Label>
                       <Input value={newVendorEmail} onChange={(e) => setNewVendorEmail(e.target.value)} placeholder="Email Address" />
                    </div>
                    <div className="grid gap-2">
                       <Label>Phone</Label>
                       <Input value={newVendorPhone} onChange={(e) => setNewVendorPhone(e.target.value)} placeholder="Phone Number" />
                    </div>
                 </div>
                 <div className="grid gap-2">
                    <Label>Address</Label>
                    <Textarea placeholder="Mailing Address" className="resize-none" />
                 </div>
              </div>
              <DialogFooter>
                 <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                 <Button onClick={handleCreateVendor} className="bg-emerald-600 hover:bg-emerald-700">Create Vendor</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>

      </div>
    </>
  );
};

export default VendorsPage;