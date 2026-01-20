import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, Download, Upload, Search, Filter, Send, Eye, Trash2,
  CheckCircle, Clock, AlertCircle, FolderOpen, Share2, Plus,
  File, FileSpreadsheet, FileImage, MoreVertical, Calendar, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InvestorDocumentsPage = () => {
  const { investorId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);

  const documents = [
    // Subscription Documents
    {
      id: 'doc-001',
      name: 'Subscription Agreement - Highland Park',
      category: 'subscription',
      type: 'pdf',
      deal: 'Highland Park Lofts',
      status: 'executed',
      signedDate: '2023-06-10',
      size: '2.4 MB',
      sharedWithInvestor: true,
      viewedByInvestor: '2024-12-15',
    },
    {
      id: 'doc-002',
      name: 'Operating Agreement - Highland Park',
      category: 'subscription',
      type: 'pdf',
      deal: 'Highland Park Lofts',
      status: 'executed',
      signedDate: '2023-06-10',
      size: '4.1 MB',
      sharedWithInvestor: true,
      viewedByInvestor: '2024-12-15',
    },
    {
      id: 'doc-003',
      name: 'PPM - Cedar Mill Phase 2',
      category: 'subscription',
      type: 'pdf',
      deal: 'Cedar Mill Phase 2',
      status: 'pending_signature',
      size: '8.2 MB',
      sharedWithInvestor: true,
      viewedByInvestor: null,
    },
    // Tax Documents
    {
      id: 'doc-004',
      name: 'K-1 2023 - Highland Park',
      category: 'tax',
      type: 'pdf',
      deal: 'Highland Park Lofts',
      taxYear: '2023',
      status: 'final',
      uploadDate: '2024-03-01',
      size: '156 KB',
      sharedWithInvestor: true,
      viewedByInvestor: '2024-03-15',
    },
    {
      id: 'doc-005',
      name: 'K-1 2023 - Riverside Commons',
      category: 'tax',
      type: 'pdf',
      deal: 'Riverside Commons',
      taxYear: '2023',
      status: 'final',
      uploadDate: '2024-03-05',
      size: '148 KB',
      sharedWithInvestor: true,
      viewedByInvestor: '2024-03-20',
    },
    {
      id: 'doc-006',
      name: 'K-1 2024 (Estimate) - Highland Park',
      category: 'tax',
      type: 'pdf',
      deal: 'Highland Park Lofts',
      taxYear: '2024',
      status: 'draft',
      uploadDate: '2024-12-20',
      size: '142 KB',
      sharedWithInvestor: false,
    },
    // Investor Reports
    {
      id: 'doc-007',
      name: 'Q4 2024 Investor Report',
      category: 'report',
      type: 'pdf',
      deal: 'Highland Park Lofts',
      reportPeriod: 'Q4 2024',
      status: 'published',
      uploadDate: '2024-12-28',
      size: '3.2 MB',
      sharedWithInvestor: true,
      viewedByInvestor: null,
    },
    {
      id: 'doc-008',
      name: 'Q3 2024 Investor Report',
      category: 'report',
      type: 'pdf',
      deal: 'Highland Park Lofts',
      reportPeriod: 'Q3 2024',
      status: 'published',
      uploadDate: '2024-10-01',
      size: '2.8 MB',
      sharedWithInvestor: true,
      viewedByInvestor: '2024-10-05',
    },
    // Shared Documents
    {
      id: 'doc-009',
      name: 'Site Photos - December 2024',
      category: 'shared',
      type: 'zip',
      deal: 'Cedar Mill Phase 2',
      uploadDate: '2024-12-20',
      size: '45 MB',
      sharedWithInvestor: true,
      sharedDate: '2024-12-20',
      sharedBy: 'Sarah Johnson',
      viewedByInvestor: '2024-12-21',
    },
    {
      id: 'doc-010',
      name: 'Construction Budget Update',
      category: 'shared',
      type: 'xlsx',
      deal: 'Highland Park Lofts',
      uploadDate: '2024-12-15',
      size: '856 KB',
      sharedWithInvestor: true,
      sharedDate: '2024-12-15',
      sharedBy: 'Mike Roberts',
      viewedByInvestor: null,
    },
    // Compliance
    {
      id: 'doc-011',
      name: 'W-9 Form',
      category: 'compliance',
      type: 'pdf',
      status: 'on_file',
      uploadDate: '2024-01-15',
      size: '89 KB',
      sharedWithInvestor: false,
    },
    {
      id: 'doc-012',
      name: 'Accreditation Letter',
      category: 'compliance',
      type: 'pdf',
      status: 'on_file',
      expiryDate: '2025-06-15',
      uploadDate: '2024-06-15',
      size: '245 KB',
      sharedWithInvestor: false,
    },
  ];

  const categories = [
    { value: 'all', label: 'All Documents', count: documents.length },
    { value: 'subscription', label: 'Subscription Docs', count: documents.filter(d => d.category === 'subscription').length },
    { value: 'tax', label: 'Tax Documents', count: documents.filter(d => d.category === 'tax').length },
    { value: 'report', label: 'Investor Reports', count: documents.filter(d => d.category === 'report').length },
    { value: 'shared', label: 'Shared Documents', count: documents.filter(d => d.category === 'shared').length },
    { value: 'compliance', label: 'Compliance', count: documents.filter(d => d.category === 'compliance').length },
  ];

  const getFileIcon = (type) => ({
    pdf: FileText,
    xlsx: FileSpreadsheet,
    xls: FileSpreadsheet,
    zip: FolderOpen,
    jpg: FileImage,
    png: FileImage,
  }[type] || File);

  const getStatusConfig = (status) => ({
    executed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Executed' },
    pending_signature: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending Signature' },
    final: { bg: 'bg-green-100', text: 'text-green-700', label: 'Final' },
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
    published: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Published' },
    on_file: { bg: 'bg-green-100', text: 'text-green-700', label: 'On File' },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status });

  const filteredDocs = documents.filter(doc => {
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleDocSelect = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-sm text-gray-500">Manage and share documents with this investor</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Upload</Button>
          <Button 
            className="bg-[#047857] hover:bg-[#065f46]"
            onClick={() => setShowShareModal(true)}
            disabled={selectedDocs.length === 0}
          >
            <Send className="w-4 h-4 mr-2" />Share Selected ({selectedDocs.length})
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              categoryFilter === cat.value 
                ? "bg-[#047857] text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {cat.label} <span className="ml-1 opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search documents..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {selectedDocs.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setSelectedDocs([])}>
            Clear Selection
          </Button>
        )}
      </div>

      {/* Documents Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="w-10 px-4 py-3">
                <input 
                  type="checkbox" 
                  className="rounded"
                  checked={selectedDocs.length === filteredDocs.length && filteredDocs.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDocs(filteredDocs.map(d => d.id));
                    } else {
                      setSelectedDocs([]);
                    }
                  }}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Document</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Deal</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Shared</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Viewed</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredDocs.map(doc => {
              const FileIcon = getFileIcon(doc.type);
              const statusConfig = getStatusConfig(doc.status);
              return (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleDocSelect(doc.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.size} • {doc.uploadDate || doc.signedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.deal || '—'}</td>
                  <td className="px-4 py-3">
                    {doc.status && (
                      <span className={cn("px-2 py-1 rounded text-xs font-medium", statusConfig.bg, statusConfig.text)}>
                        {statusConfig.label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {doc.sharedWithInvestor ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Shared</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not shared</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {doc.viewedByInvestor ? (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        {doc.viewedByInvestor}
                      </div>
                    ) : doc.sharedWithInvestor ? (
                      <span className="text-sm text-amber-600">Not viewed</span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-gray-200 rounded" title="Preview">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded" title="Download">
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                      {!doc.sharedWithInvestor && (
                        <button className="p-1 hover:bg-gray-200 rounded" title="Share">
                          <Send className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Share Modal Placeholder */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Share Documents</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share {selectedDocs.length} document(s) with this investor. They will receive a notification and can access via the Investor Portal.
            </p>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm">Send email notification</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm">Send portal notification</span>
              </label>
              <div>
                <label className="text-sm text-gray-600">Add a message (optional)</label>
                <textarea className="w-full border rounded-md px-3 py-2 mt-1 min-h-[80px]" placeholder="Enter a message..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowShareModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowShareModal(false)}>
                <Send className="w-4 h-4 mr-2" />Share Documents
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorDocumentsPage;
