import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, FileText, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import ProjectInvoicesList from '@/components/accounting/ProjectInvoicesList';
import ProjectInvoiceForm from '@/components/accounting/ProjectInvoiceForm';
import InvoicePaymentForm from '@/components/accounting/InvoicePaymentForm';

const InvoicesPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <>
      <Helmet><title>Invoices | Finance</title></Helmet>
      <div className="flex flex-col h-full w-full bg-[#F7FAFC] overflow-hidden">
         {/* Header */}
         <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
            <div className="max-w-[1600px] mx-auto">
               <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/accounting/entity/${entityId}/dashboard`)} className="-ml-2">
                     <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                  </Button>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                        <FileText className="w-6 h-6" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900">Invoices (AR)</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage customer billing</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="outline" onClick={() => setIsPaymentOpen(true)}>Receive Payment</Button>
                     <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setIsNewInvoiceOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> New Invoice
                     </Button>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
               <ProjectInvoicesList 
                  key={refreshKey}
                  entityId={entityId} 
                  onNewInvoice={() => setIsNewInvoiceOpen(true)}
                  onSelectInvoice={(inv) => console.log('View', inv)}
               />
            </div>
         </div>

         {/* Create Modal */}
         <Dialog open={isNewInvoiceOpen} onOpenChange={setIsNewInvoiceOpen}>
            <DialogContent className="sm:max-w-[1000px] p-0 max-h-[90vh] overflow-y-auto">
               <ProjectInvoiceForm 
                  entityId={entityId} 
                  onCancel={() => setIsNewInvoiceOpen(false)}
                  onSuccess={() => { setIsNewInvoiceOpen(false); handleRefresh(); }}
               />
            </DialogContent>
         </Dialog>

         {/* Payment Modal */}
         <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
            <DialogContent className="sm:max-w-[600px]">
               <InvoicePaymentForm 
                  entityId={entityId}
                  onCancel={() => setIsPaymentOpen(false)}
                  onSuccess={() => { setIsPaymentOpen(false); handleRefresh(); }}
               />
            </DialogContent>
         </Dialog>
      </div>
    </>
  );
};

export default InvoicesPage;