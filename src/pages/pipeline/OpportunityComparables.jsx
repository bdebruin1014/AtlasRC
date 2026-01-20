import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function OpportunityComparables() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparable Sales</h2>
      <div className="bg-white border rounded-lg p-12 text-center">
        <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 font-medium">Comparables Analysis</p>
        <p className="text-gray-400 text-sm mt-2">
          Integration with property data sources coming soon
        </p>
      </div>
    </div>
  );
}
