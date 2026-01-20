import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, MoreVertical, FileText, 
  Eye, Send, CheckCircle, Clock, Folder, File, FileSignature, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DealDocumentsPage = () => {
  const { dealId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const documents = [
    {
      id: 'doc-001',
      name: 'Private Placement Memorandum',
      type: 'ppm',
      category: 'offering',
      uploadedAt: '2024-11-15',
      uploadedBy: 'Bryan de Bruin',
      fileSize: '2.4 MB',
      requiresSignature: false,
    },
    {
      id: 'doc-002',
      name: 'Subscription Agreement',
      type: 'subscription_agreement',
      category: 'offering',
      uploadedAt: '2024-11-15',
      uploadedBy: 'Bryan de Bruin',
      fileSize: '856 KB',
      requiresSignature: true,
      signatureCount: 12,
      signedCount: 10,
    },
    {
      id: 'doc-003',
      name: 'Operating Agreement',
      type: 'operating_agreement',
      category: 'legal',
      uploadedAt: '2024-11-15',
      uploadedBy: 'Bryan de Bruin',
      fileSize: '1.2 MB',
      requiresSignature: true,
      signatureCount: 12,
      signedCount: 12,
    },
    {
      id: 'doc-004',
      name: 'Property Due Diligence Report',
      type: 'due_diligence',
      category: 'diligence',
      uploadedAt: '2024-11-20',
      uploadedBy: 'Bryan de Bruin',
      fileSize: '4.8 MB',
      requiresSignature: false,
    },
    {
      id: 'doc-005',
      name: 'Appraisal Report',
      type: 'due_diligence',
      category: 'diligence',
      uploadedAt: '2024-11-22',
      uploadedBy: 'Bryan de Bruin',
      fileSize: '3.2 MB',
      requiresSignature: false,
    },
    {
      id: 'doc-006',
      name: 'Phase I Environmental',
      type: 'due_diligence',
      category: 'diligence',
      uploadedAt: '2024-11-25',
      uploadedBy: 'Bryan de Bruin',
      fileSize: '5.6 MB',
      requiresSignature: false,
    },
    {
      id: 'doc-007',
      name: 'Q4 2024 Investor Update',
      type: 'investor_report',
      category: 'reports',
      uploadedAt: '2025-01-05',
      uploadedBy: 'Bryan de Bruin',
      fileSize: '1.8 MB',
      requiresSignature: false,
    },
  ];

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'offering', label: 'Offering Documents' },
    { value: 'legal', label: 'Legal' },
    { value: 'diligence', label: 'Due Diligence' },
    { value: 'reports', label: 'Reports' },
    { value: 'tax', label: 'Tax Documents' },
  ];

  const getTypeIcon = (type) => {
    const icons = {
      ppm: FileText,
      subscription_agreement: FileSignature,
      operating_agreement: File,
      due_diligence: Folder,
      investor_report: FileText,
      k1: FileText,
    };
    return icons[type] || File;
  };

  const getTypeLabel = (type) => ({
    ppm: 'PPM',
    subscription_agreement: 'Subscription Agreement',
    operating_agreement: 'Operating Agreement',
    due_diligence: 'Due Diligence',
    investor_report: 'Investor Report',
    k1: 'K-1',
  }[type] || type);

  const filteredDocs = documents.filter(doc => {
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by category
  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    const cat = categories.find(c => c.value === doc.category)?.label || doc.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-sm text-gray-500">Manage deal documents, PPMs, and investor reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Send className="w-4 h-4 mr-2" />Send for Signature</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]"><Upload className="w-4 h-4 mr-2" />Upload</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{documents.length}</p>
          <p className="text-sm text-gray-500">Total Documents</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">{documents.filter(d => d.requiresSignature && d.signedCount === d.signatureCount).length}</p>
          <p className="text-sm text-gray-500">Fully Executed</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold text-amber-600">{documents.filter(d => d.requiresSignature && d.signedCount < d.signatureCount).length}</p>
          <p className="text-sm text-gray-500">Pending Signatures</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{documents.filter(d => d.category === 'reports').length}</p>
          <p className="text-sm text-gray-500">Reports</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search documents..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" />Download All</Button>
      </div>

      {/* Documents by Category */}
      <div className="space-y-6">
        {Object.entries(groupedDocs).map(([category, docs]) => (
          <div key={category} className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
              <Folder className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{category}</span>
              <span className="text-xs text-gray-500">({docs.length})</span>
            </div>
            <div className="divide-y">
              {docs.map(doc => {
                const Icon = getTypeIcon(doc.type);
                return (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{getTypeLabel(doc.type)}</span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                          <span>•</span>
                          <span>Uploaded {doc.uploadedAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {doc.requiresSignature && (
                        <div className="flex items-center gap-2 text-sm">
                          {doc.signedCount === doc.signatureCount ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Clock className="w-4 h-4" />
                              {doc.signedCount}/{doc.signatureCount}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {Object.keys(groupedDocs).length === 0 && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-1">No documents found</h3>
          <p className="text-sm text-gray-500 mb-4">Upload your first document</p>
          <Button className="bg-[#047857] hover:bg-[#065f46]"><Upload className="w-4 h-4 mr-2" />Upload Document</Button>
        </div>
      )}
    </div>
  );
};

export default DealDocumentsPage;
