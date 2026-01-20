import React from 'react';
import { ClipboardList } from 'lucide-react';

export default function OpportunityFeasibility() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Feasibility Study</h2>
      <div className="bg-white border rounded-lg p-12 text-center">
        <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 font-medium">Feasibility Analysis</p>
        <p className="text-gray-400 text-sm mt-2">
          Detailed feasibility study tools coming soon
        </p>
      </div>
    </div>
  );
}
