import React from 'react';
import { FileText } from 'lucide-react';

export default function OpportunityContracts() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Contracts</h2>
      <div className="bg-white border rounded-lg p-12 text-center">
        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 font-medium">Contract Management</p>
        <p className="text-gray-400 text-sm mt-2">
          Contract templates and e-signature integration coming soon
        </p>
      </div>
    </div>
  );
}
