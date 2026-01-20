import React from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OpportunityFinancials({ opportunity, onNavigateToDealAnalyzer }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Land Cost</p>
          <p className="text-2xl font-semibold">$1,250,000</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Est. Development Cost</p>
          <p className="text-2xl font-semibold">$8,500,000</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Est. Total Project</p>
          <p className="text-2xl font-semibold">$9,750,000</p>
        </div>
      </div>
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-medium mb-4">Preliminary Pro Forma</h3>
        <p className="text-gray-500 text-sm">
          Use the Deal Analyzer for detailed proforma analysis.
        </p>
        <Button
          className="mt-4 bg-[#047857] hover:bg-[#065f46]"
          onClick={onNavigateToDealAnalyzer}
        >
          <Calculator className="w-4 h-4 mr-2" />
          Open Deal Analyzer
        </Button>
      </div>
    </div>
  );
}
