import React, { useContext } from 'react';
import { TransactionEntryContext } from '@/contexts/TransactionEntryContext';
import BillEntryModal from './BillEntryModal';
import JournalEntryForm from './JournalEntryForm';

export const TransactionModalContainer = () => {
  const { activeModal, closeModal, selectedEntity } = useContext(TransactionEntryContext);

  if (!activeModal) return null;

  return (
    <>
      {activeModal === 'bill' && (
        <BillEntryModal isOpen={true} onClose={closeModal} entityId={selectedEntity} />
      )}
      {activeModal === 'invoice' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Invoice</h2>
            <p className="text-gray-600 mb-4">Invoice entry form - Real form implementation coming</p>
            <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      )}
      {activeModal === 'payment' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Payment</h2>
            <p className="text-gray-600 mb-4">Payment entry form - Real form implementation coming</p>
            <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      )}
      {activeModal === 'journalEntry' && (
        <JournalEntryForm isOpen={true} onClose={closeModal} entityId={selectedEntity} />
      )}
    </>
  );
};

export default TransactionModalContainer;
