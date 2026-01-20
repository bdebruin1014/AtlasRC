import React, { useContext } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionEntryContext } from '@/contexts/TransactionEntryContext';

export const QuickActionsSection = ({ selectedEntity }) => {
  const { openModal } = useContext(TransactionEntryContext);

  const actions = [
    { type: 'bill', label: '+ Add Bill', color: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' },
    { type: 'invoice', label: '+ Add Invoice', color: 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200' },
    { type: 'payment', label: '+ Add Payment', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200' },
    { type: 'journalEntry', label: '+ Journal Entry', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200' }
  ];

  return (
    <div className="p-3 border-b bg-white">
      <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">
        Quick Actions
      </div>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(action => (
          <button
            key={action.type}
            className={`${action.color} py-2 px-3 rounded text-xs font-medium transition-colors duration-150`}
            onClick={() => openModal(action.type, selectedEntity)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsSection;
