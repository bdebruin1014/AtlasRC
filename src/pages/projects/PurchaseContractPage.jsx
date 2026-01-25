// src/pages/projects/PurchaseContractPage.jsx
// Purchase Contract module with upload and review UI

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Upload, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ContractUploadModal from '@/components/ContractUploadModal';
import ContractReviewForm from '@/components/ContractReviewForm';
import { getPurchaseContract, updatePurchaseContract, retryContractParsing } from '@/services/contractParsingService';

const PurchaseContractPage = () => {
  const { projectId } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadContract();
  }, [projectId]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseContract(projectId);
      setContract(data);
    } catch (err) {
      console.error('Error loading contract:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (result) => {
    setContract({
      ...result.parsedData,
      document_url: result.documentUrl,
      parsing_status: result.parsing_status,
    });
    setShowUploadModal(false);
  };

  const handleSave = async (formData) => {
    try {
      if (contract?.id) {
        await updatePurchaseContract(contract.id, formData);
      }
      setContract(prev => ({ ...prev, ...formData }));
    } catch (err) {
      console.error('Error saving contract:', err);
    }
  };

  const handleRetryParse = async () => {
    try {
      if (contract?.id) {
        const result = await retryContractParsing(contract.id);
        setContract(prev => ({ ...prev, ...result }));
      }
    } catch (err) {
      console.error('Error retrying parse:', err);
    }
  };

  const getStatusBadge = () => {
    if (!contract) return null;
    const statusConfig = {
      draft: { icon: Clock, color: 'text-gray-600 bg-gray-100', label: 'Draft' },
      pending: { icon: Clock, color: 'text-amber-700 bg-amber-100', label: 'Pending' },
      executed: { icon: CheckCircle, color: 'text-green-700 bg-green-100', label: 'Executed' },
      expired: { icon: AlertCircle, color: 'text-red-700 bg-red-100', label: 'Expired' },
      terminated: { icon: AlertCircle, color: 'text-red-700 bg-red-100', label: 'Terminated' },
    };
    const config = statusConfig[contract.status] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" /> {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Contract</h1>
          <p className="text-sm text-gray-500">Upload, parse, and manage your purchase contract</p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-2" /> Upload Contract
          </Button>
        </div>
      </div>

      {!contract ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Contract Uploaded</h3>
              <p className="text-gray-500 mb-4">Upload a purchase contract PDF to get started. AI will parse key terms and dates.</p>
              <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowUploadModal(true)}>
                <Upload className="w-4 h-4 mr-2" /> Upload Contract
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ContractReviewForm
          contractData={contract}
          onSave={handleSave}
          onRetryParse={handleRetryParse}
        />
      )}

      <ContractUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        projectId={projectId}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default PurchaseContractPage;
