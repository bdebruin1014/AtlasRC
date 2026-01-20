import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Helmet } from 'react-helmet';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-4">
      <Helmet>
        <title>Access Denied | AtlasDev</title>
      </Helmet>

      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-[#E2E8F0]">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="font-heading text-2xl text-[#212629] mb-2">
          Access Denied
        </h1>
        
        <p className="text-[#647178] mb-8">
          You do not have permission to access this resource. If you believe this is an error, please contact your system administrator.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="qualia-btn-secondary w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>

          <button 
            onClick={() => navigate('/')}
            className="qualia-btn-primary w-full sm:w-auto justify-center"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;