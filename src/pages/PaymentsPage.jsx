import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, CreditCard, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Internal
import PaymentsList from '@/components/accounting/PaymentsList';
import PaymentForm from '@/components/accounting/PaymentForm';

const PaymentsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    // Refresh logic handled inside List typically via subscription or re-render on state change if lifted
    // Here we assume PaymentsList fetches on mount or prop change. 
    // To force refresh we could use a key or context. For simplicity, just close modal.
    window.location.reload(); // Simple refresh
  };

  return (
    <>
      <Helmet>
        <title>Payments | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#F7FAFC] overflow-hidden">
        {/* Header */}
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
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                       <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                       <h1 className="text-2xl font-bold text-gray-900 leading-none">Payments</h1>
                       <p className="text-sm text-gray-500 mt-1">Vendor payments history and recording</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsPaymentModalOpen(true)}>
                       <Plus className="w-4 h-4 mr-2" /> Record Payment
                    </Button>
                 </div>
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
           <div className="max-w-[1600px] mx-auto space-y-6">
              <PaymentsList 
                 entityId={entityId} 
                 onSelectPayment={(p) => console.log('View payment', p)}
                 onNewPayment={() => setIsPaymentModalOpen(true)}
              />
           </div>
        </div>

        {/* Modal */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
           <DialogContent className="max-w-4xl p-0 overflow-hidden">
              <PaymentForm 
                 entityId={entityId} 
                 onCancel={() => setIsPaymentModalOpen(false)} 
                 onSuccess={handlePaymentSuccess}
              />
           </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default PaymentsPage;