import React from 'react';
import { Calendar } from 'lucide-react';

export default function OpportunityTimeline() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
      <div className="bg-white border rounded-lg p-12 text-center">
        <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 font-medium">Timeline View</p>
        <p className="text-gray-400 text-sm mt-2">
          Visual timeline of milestones and events coming soon
        </p>
      </div>
    </div>
  );
}
