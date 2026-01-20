import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AccountingProvider, useAccounting } from '@/context/AccountingContext';
import AccountingSidebar from '@/components/AccountingSidebar';

const EntityContent = () => {
  const { entity, loading, error } = useAccounting();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading Entity Profile...</p>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-50 p-6">
        <div className="max-w-md text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Entity Not Found</h2>
          <p className="text-gray-500 mb-6">{error || "The requested entity could not be found or you do not have access."}</p>
          <Button onClick={() => navigate('/accounting')} className="w-full bg-emerald-600 hover:bg-emerald-700">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Entity List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{entity.name} | Accounting</title>
      </Helmet>
      <div className="flex h-full w-full bg-[#EDF2F7] overflow-hidden">
        <AccountingSidebar />
        <div className="flex-1 h-full overflow-hidden flex flex-col min-w-0 relative">
          <div className="h-full overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

const EntityAccountingPage = () => {
  return (
    <AccountingProvider>
      <EntityContent />
    </AccountingProvider>
  );
};

export default EntityAccountingPage;