import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function OpportunityTasks() {
  const tasks = [
    { task: 'Order Phase I Environmental', status: 'complete', due: 'Dec 20' },
    { task: 'Review title commitment', status: 'complete', due: 'Dec 22' },
    { task: 'Survey ordered', status: 'in-progress', due: 'Jan 5' },
    { task: 'Geotechnical study', status: 'in-progress', due: 'Jan 8' },
    { task: 'Traffic impact analysis', status: 'pending', due: 'Jan 10' },
    { task: 'Utility availability letters', status: 'pending', due: 'Jan 12' },
    { task: 'Preliminary site plan', status: 'pending', due: 'Jan 14' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Tasks & Checklist</h2>
        <Button className="bg-[#047857] hover:bg-[#065f46]">Add Task</Button>
      </div>
      <div className="space-y-3">
        {tasks.map((item, i) => (
          <div
            key={i}
            className="bg-white border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  item.status === 'complete'
                    ? "bg-green-100"
                    : item.status === 'in-progress'
                    ? "bg-blue-100"
                    : "bg-gray-100"
                )}
              >
                {item.status === 'complete' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : item.status === 'in-progress' ? (
                  <Clock className="w-4 h-4 text-blue-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <span
                className={item.status === 'complete' ? 'line-through text-gray-400' : ''}
              >
                {item.task}
              </span>
            </div>
            <span className="text-sm text-gray-500">{item.due}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
