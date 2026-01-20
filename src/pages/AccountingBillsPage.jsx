import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, FileText, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';

// Internal Components
import BillsList from '@/components/accounting/BillsList';
import BillEntryModal from '@/components/accounting/BillEntryModal';
import BillDetailDrawer from '@/components/accounting/BillDetailDrawer';

const BillsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Drawer & Modal State
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Handlers
  const handleSelectBill = (bill) => {
    const normalizedBill = {
      ...bill,
      vendorName: bill.vendors?.name || 'Unknown Vendor',
      date: bill.bill_date,
      dueDate: bill.due_date,
      amount: bill.total_amount,
      balance: bill.balance_due,
      billNumber: bill.bill_number,
      project: 'Project A', 
      description: bill.memo || bill.description || 'No description',
      status: bill.status
    };
    
    setSelectedBill(normalizedBill);
    setIsDrawerOpen(true);
  };

  const handlePayBill = (bill) => {
    toast({ title: "Payment Initiated", description: `Starting payment flow for ${bill.billNumber}` });
    // Future: Logic to open payment modal
  };

  const handleVoidBill = (bill) => {
    toast({ title: "Void Bill", description: `Voiding bill ${bill.billNumber}...` });
  };

  const handleEditBill = (bill) => {
    toast({ title: "Edit Bill", description: "Edit mode not implemented in this view." });
  };

  return (
    <>
      <Helmet>
        <title>Bills | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#F7FAFC] overflow-hidden">
        
        {/* --- Header --- */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
           <div className="max-w-[1600px] mx-auto">
              <div className="flex items-center justify-between">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/accounting/entity/${entityId}/dashboard`)}
                    className="text-gray-500 hover:text-gray-900 -ml-2"
                 >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                 </Button>
              </div>
              <div className="flex items-center justify-between mt-4">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                       <FileText className="w-6 h-6" />
                    </div>
                    <div>
                       <h1 className="text-2xl font-bold text-gray-900 leading-none">Bills</h1>
                       <p className="text-sm text-gray-500 mt-1">Manage vendor invoices and payables</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-gray-600">
                       <Upload className="w-4 h-4 mr-2" /> Import Bills
                    </Button>
                 </div>
              </div>
           </div>
        </div>

        {/* --- Main Content --- */}
        <div className="flex-1 overflow-y-auto p-6">
           <div className="max-w-[1600px] mx-auto space-y-6">
              
              <BillsList 
                entityId={entityId} 
                onSelectBill={handleSelectBill}
                onNewBill={() => setIsEntryModalOpen(true)}
              />

           </div>
        </div>

        {/* --- Modals & Drawers --- */}
        <BillEntryModal 
          open={isEntryModalOpen} 
          onClose={() => setIsEntryModalOpen(false)} 
        />

        <BillDetailDrawer 
          bill={selectedBill}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onPay={handlePayBill}
          onVoid={handleVoidBill}
          onEdit={handleEditBill}
        />

      </div>
    </>
  );
};

export default BillsPage;