import React from 'react';
import { CheckCircle2, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const stages = [
  { id: 'prospect', label: 'Prospect', color: '#6B7280' },
  { id: 'initial-review', label: 'Initial Review', color: '#3B82F6' },
  { id: 'due-diligence', label: 'Due Diligence', color: '#F59E0B' },
  { id: 'negotiation', label: 'Negotiation', color: '#8B5CF6' },
  { id: 'under-contract', label: 'Under Contract', color: '#10B981' },
  { id: 'closed-won', label: 'Closed Won', color: '#047857' },
  { id: 'closed-lost', label: 'Closed Lost', color: '#EF4444' },
];

export default function OpportunityStageTracker({ opportunity }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Stage Tracker</h2>
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-8">
          {stages.slice(0, -1).map((stage, index) => {
            const isActive = stage.id === opportunity.stage;
            const isPast = stages.findIndex(s => s.id === opportunity.stage) > index;
            return (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium",
                      isPast ? "bg-[#047857]" : isActive ? "bg-amber-500" : "bg-gray-300"
                    )}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>
                  <p
                    className={cn(
                      "text-xs mt-2 text-center",
                      isActive ? "font-semibold text-gray-900" : "text-gray-500"
                    )}
                  >
                    {stage.label}
                  </p>
                </div>
                {index < stages.length - 2 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2",
                      isPast ? "bg-[#047857]" : "bg-gray-200"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Current Stage: Due Diligence</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">DD Deadline</span>
              </div>
              <p className="text-lg font-semibold">January 15, 2025</p>
              <p className="text-sm text-amber-600">18 days remaining</p>
            </div>
            <div className="p-4 bg-gray-50 border rounded-lg">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Target className="w-4 h-4" />
                <span className="font-medium">Next Milestone</span>
              </div>
              <p className="text-lg font-semibold">Environmental Report</p>
              <p className="text-sm text-gray-500">Due: Jan 10, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
