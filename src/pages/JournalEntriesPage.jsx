import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, FileText, Plus, Download, RefreshCw 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { journalEntryService } from '@/services/journalEntryService';

// Components
import JournalEntriesList from '@/components/accounting/JournalEntriesList';
import JournalEntryForm from '@/components/accounting/JournalEntryForm';

const JournalEntriesPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // We rely on the List component to fetch, but we trigger refresh by key change
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setIsNewEntryOpen(false);
    setSelectedEntry(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleSelectEntry = (entry) => {
     // Fetch full details including lines
     journalEntryService.getById(entry.id).then(({ data }) => {
        setSelectedEntry(data);
        setIsNewEntryOpen(true); // Reuse modal for view/edit
     });
  };

  return (
    <>
      <Helmet><title>Journal Entries | Finance</title></Helmet>
      <div className="flex flex-col h-full w-full bg-[#F7FAFC] overflow-hidden">
         {/* Header */}
         <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
            <div className="max-w-[1600px] mx-auto">
               <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/accounting/entity/${entityId}/dashboard`)} className="-ml-2">
                     <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                  </Button>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <FileText className="w-6 h-6" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
                        <p className="text-sm text-gray-500 mt-1">General ledger adjustments</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
                     <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => { setSelectedEntry(null); setIsNewEntryOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" /> New Entry
                     </Button>
                  </div>
               </div>
            </div>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
               <JournalEntriesList 
                  key={refreshKey}
                  entityId={entityId} 
                  onSelectEntry={handleSelectEntry}
                  onNewEntry={() => { setSelectedEntry(null); setIsNewEntryOpen(true); }}
               />
            </div>
         </div>

         {/* Modal */}
         <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
            <DialogContent className="sm:max-w-[1100px] p-0 overflow-hidden max-h-[90vh]">
               <JournalEntryForm 
                  entityId={entityId} 
                  existingEntry={selectedEntry}
                  onCancel={() => setIsNewEntryOpen(false)}
                  onSuccess={handleSuccess}
               />
            </DialogContent>
         </Dialog>
      </div>
    </>
  );
};

export default JournalEntriesPage;