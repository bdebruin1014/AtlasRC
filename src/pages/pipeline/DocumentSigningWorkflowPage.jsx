import React, { useState, useMemo } from 'react';
import {
  FileText, CheckCircle, Clock, AlertTriangle, Send, Download,
  Eye, Edit, User, Users, Calendar, PenTool, RefreshCw, Plus,
  Mail, Building, XCircle, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockDocuments = [
  {
    id: 'DOC-2024-0089',
    name: 'Purchase and Sale Agreement',
    deal: 'Metro Industrial Complex',
    type: 'PSA',
    status: 'pending_signatures',
    createdDate: '2024-01-20',
    sentDate: '2024-01-21',
    dueDate: '2024-01-28',
    createdBy: 'Legal Team',
    signers: [
      { name: 'Sarah Johnson', role: 'Authorized Signer - Buyer', email: 'sjohnson@atlas.com', status: 'signed', signedDate: '2024-01-22' },
      { name: 'Mike Chen', role: 'CEO - Buyer', email: 'mchen@atlas.com', status: 'signed', signedDate: '2024-01-22' },
      { name: 'Robert Martinez', role: 'Seller - Industrial Holdings', email: 'rmartinez@industrial.com', status: 'pending', signedDate: null },
      { name: 'Maria Santos', role: 'Escrow Agent - First American', email: 'msantos@firstam.com', status: 'awaiting', signedDate: null }
    ],
    version: '2.1',
    pages: 45,
    fileSize: '2.4 MB',
    notes: 'Final version with negotiated terms. Awaiting seller signature.',
    history: [
      { action: 'Created', user: 'Legal Team', date: '2024-01-20', version: '1.0' },
      { action: 'Revised', user: 'Legal Team', date: '2024-01-21', version: '2.0', notes: 'Updated closing date and prorations' },
      { action: 'Sent for signature', user: 'Sarah Johnson', date: '2024-01-21', version: '2.1' },
      { action: 'Signed', user: 'Sarah Johnson', date: '2024-01-22', version: '2.1' },
      { action: 'Signed', user: 'Mike Chen', date: '2024-01-22', version: '2.1' }
    ]
  },
  {
    id: 'DOC-2024-0088',
    name: 'Letter of Intent',
    deal: 'Lakeside Business Park',
    type: 'LOI',
    status: 'completed',
    createdDate: '2024-01-15',
    sentDate: '2024-01-16',
    completedDate: '2024-01-18',
    dueDate: '2024-01-20',
    createdBy: 'John Smith',
    signers: [
      { name: 'Sarah Johnson', role: 'Authorized Signer - Buyer', email: 'sjohnson@atlas.com', status: 'signed', signedDate: '2024-01-17' },
      { name: 'Jennifer Adams', role: 'Seller - Lakeside Dev', email: 'jadams@lakeside.com', status: 'signed', signedDate: '2024-01-18' }
    ],
    version: '3.0',
    pages: 8,
    fileSize: '485 KB',
    notes: 'Fully executed LOI.',
    history: []
  },
  {
    id: 'DOC-2024-0087',
    name: 'Confidentiality Agreement',
    deal: 'Harbor View Apartments',
    type: 'CA',
    status: 'draft',
    createdDate: '2024-01-22',
    sentDate: null,
    dueDate: null,
    createdBy: 'John Smith',
    signers: [
      { name: 'Sarah Johnson', role: 'Authorized Signer', email: 'sjohnson@atlas.com', status: 'awaiting', signedDate: null },
      { name: 'David Chen', role: 'Seller - Pacific Coast', email: 'dchen@pacificcoast.com', status: 'awaiting', signedDate: null }
    ],
    version: '1.0',
    pages: 5,
    fileSize: '215 KB',
    notes: 'Standard CA template. Ready for review.',
    history: []
  },
  {
    id: 'DOC-2024-0086',
    name: 'Loan Commitment Letter',
    deal: 'Metro Industrial Complex',
    type: 'Finance',
    status: 'pending_signatures',
    createdDate: '2024-01-19',
    sentDate: '2024-01-20',
    dueDate: '2024-01-25',
    createdBy: 'Wells Fargo',
    signers: [
      { name: 'James Wilson', role: 'Lender - Wells Fargo', email: 'jwilson@wellsfargo.com', status: 'signed', signedDate: '2024-01-20' },
      { name: 'Mike Chen', role: 'Borrower - Atlas', email: 'mchen@atlas.com', status: 'pending', signedDate: null }
    ],
    version: '1.0',
    pages: 12,
    fileSize: '890 KB',
    notes: 'Commitment for $21.35M senior loan at 6.5%.',
    history: []
  },
  {
    id: 'DOC-2024-0085',
    name: 'Assignment Agreement',
    deal: 'Metro Industrial Complex',
    type: 'Legal',
    status: 'expired',
    createdDate: '2024-01-10',
    sentDate: '2024-01-11',
    dueDate: '2024-01-18',
    createdBy: 'Legal Team',
    signers: [
      { name: 'Sarah Johnson', role: 'Assignor', email: 'sjohnson@atlas.com', status: 'signed', signedDate: '2024-01-12' },
      { name: 'External Party', role: 'Assignee', email: 'external@company.com', status: 'expired', signedDate: null }
    ],
    version: '1.0',
    pages: 6,
    fileSize: '340 KB',
    notes: 'Expired - party did not sign within deadline.',
    history: []
  }
];

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  pending_signatures: { label: 'Pending Signatures', color: 'bg-blue-100 text-blue-800', icon: PenTool },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800', icon: XCircle },
  voided: { label: 'Voided', color: 'bg-gray-100 text-gray-800', icon: XCircle }
};

const signerStatusConfig = {
  signed: { label: 'Signed', color: 'text-green-600', icon: CheckCircle },
  pending: { label: 'Pending', color: 'text-yellow-600', icon: Clock },
  awaiting: { label: 'Awaiting', color: 'text-gray-400', icon: Clock },
  declined: { label: 'Declined', color: 'text-red-600', icon: XCircle },
  expired: { label: 'Expired', color: 'text-red-600', icon: AlertTriangle }
};

const typeColors = {
  PSA: 'bg-purple-100 text-purple-800',
  LOI: 'bg-blue-100 text-blue-800',
  CA: 'bg-green-100 text-green-800',
  Finance: 'bg-orange-100 text-orange-800',
  Legal: 'bg-gray-100 text-gray-800'
};

export default function DocumentSigningWorkflowPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(mockDocuments[0]);

  const filteredDocs = useMemo(() => {
    return mockDocuments.filter(doc => {
      const matchesFilter = filter === 'all' || doc.status === filter ||
        (filter === 'active' && ['draft', 'pending_review', 'pending_signatures'].includes(doc.status));
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.deal.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const stats = useMemo(() => ({
    active: mockDocuments.filter(d => ['draft', 'pending_review', 'pending_signatures'].includes(d.status)).length,
    pendingSignatures: mockDocuments.filter(d => d.status === 'pending_signatures').length,
    completed: mockDocuments.filter(d => d.status === 'completed').length,
    awaitingMe: mockDocuments.filter(d => d.signers.some(s => s.email.includes('atlas') && s.status === 'pending')).length
  }), []);

  const getSignerProgress = (signers) => {
    const signed = signers.filter(s => s.status === 'signed').length;
    return Math.round((signed / signers.length) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Signing</h1>
          <p className="text-gray-600">Track and manage document signatures</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-600">Active Documents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><PenTool className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingSignatures}</p>
              <p className="text-sm text-gray-600">Pending Signatures</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><Clock className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.awaitingMe}</p>
              <p className="text-sm text-gray-600">Awaiting My Signature</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search documents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'pending_signatures', 'completed'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : statusConfig[f]?.label || f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedDoc?.id === doc.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.deal}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[doc.status].color)}>{statusConfig[doc.status].label}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("px-2 py-0.5 rounded text-xs", typeColors[doc.type])}>{doc.type}</span>
                <span className="text-xs text-gray-500">v{doc.version}</span>
              </div>
              {doc.status === 'pending_signatures' && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${getSignerProgress(doc.signers)}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{doc.signers.filter(s => s.status === 'signed').length}/{doc.signers.length}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedDoc && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedDoc.name}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedDoc.status].color)}>{statusConfig[selectedDoc.status].label}</span>
                    </div>
                    <p className="text-gray-600 flex items-center gap-1"><Building className="w-4 h-4" />{selectedDoc.deal}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" />View</Button>
                    <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Download</Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div><p className="text-gray-500">Type</p><span className={cn("px-2 py-0.5 rounded text-xs", typeColors[selectedDoc.type])}>{selectedDoc.type}</span></div>
                  <div><p className="text-gray-500">Version</p><p className="font-medium">{selectedDoc.version}</p></div>
                  <div><p className="text-gray-500">Pages</p><p className="font-medium">{selectedDoc.pages}</p></div>
                  <div><p className="text-gray-500">Size</p><p className="font-medium">{selectedDoc.fileSize}</p></div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Signers</h3>
                  {selectedDoc.status === 'pending_signatures' && (
                    <Button size="sm" variant="outline"><RefreshCw className="w-4 h-4 mr-1" />Send Reminder</Button>
                  )}
                </div>
                <div className="space-y-3">
                  {selectedDoc.signers.map((signer, idx) => {
                    const StatusIcon = signerStatusConfig[signer.status].icon;
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{signer.name}</p>
                            <p className="text-sm text-gray-500">{signer.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {signer.signedDate && <span className="text-xs text-gray-500">{signer.signedDate}</span>}
                          <div className={cn("flex items-center gap-1", signerStatusConfig[signer.status].color)}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm">{signerStatusConfig[signer.status].label}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">{selectedDoc.createdDate}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-500">Sent</p>
                    <p className="font-medium">{selectedDoc.sentDate || '-'}</p>
                  </div>
                  <div className={cn("p-3 rounded-lg text-center", selectedDoc.status === 'expired' ? "bg-red-50" : "bg-gray-50")}>
                    <p className="text-gray-500">Due</p>
                    <p className="font-medium">{selectedDoc.dueDate || '-'}</p>
                  </div>
                </div>
              </div>

              {selectedDoc.notes && (
                <div className="p-6 bg-yellow-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-700">{selectedDoc.notes}</p>
                </div>
              )}

              {selectedDoc.status === 'draft' && (
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button variant="outline"><Edit className="w-4 h-4 mr-2" />Edit</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700"><Send className="w-4 h-4 mr-2" />Send for Signature</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
