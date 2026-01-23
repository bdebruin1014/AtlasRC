// src/components/documents/DocumentLibrary.jsx
// Document library with folder grouping and SharePoint container integration

import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderOpen, Folder, File, FileText, FileImage, FileSpreadsheet, FileVideo,
  Upload, Download, Edit, Trash2, Search, Eye, RefreshCw, Scan,
  ChevronRight, ChevronDown, Loader2, Plus, FileSignature, HelpCircle,
  MoreHorizontal, ExternalLink, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentViewerModal from './DocumentViewerModal';
import {
  getDocumentsForEntity,
  deleteFile,
  getEditLink,
  getViewLink,
  getDocumentStats
} from '@/services/documentService';

// File type icons mapping
const FILE_ICONS = {
  'application/pdf': FileText,
  'application/msword': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'image/jpeg': FileImage,
  'image/png': FileImage,
  'image/gif': FileImage,
  'video/mp4': FileVideo,
  'video/quicktime': FileVideo,
  default: File
};

// Default document packages/folders for real estate
const DEFAULT_PACKAGES = [
  { id: 'all', name: 'All Documents', icon: FolderOpen },
  { id: 'title-docs', name: 'Title Documents', icon: Folder },
  { id: 'closing-purchaser', name: 'Closing - Purchaser', icon: Folder },
  { id: 'closing-seller', name: 'Closing - Seller', icon: Folder },
  { id: 'contracts', name: 'Contracts and Addendums', icon: Folder },
  { id: 'lender-docs', name: 'Lender Documents', icon: Folder },
  { id: 'invoices', name: 'Invoices and Payoffs', icon: Folder },
  { id: 'correspondence', name: 'Correspondence', icon: Folder },
  { id: 'photos', name: 'Photos', icon: Folder },
  { id: 'reports', name: 'Reports', icon: Folder },
  { id: 'miscellaneous', name: 'Miscellaneous', icon: Folder },
];

const DocumentLibrary = ({
  entityType,
  entityId,
  entityName,
  showHeader = true,
  showUpload = true,
  onDocumentSelect = null,
}) => {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [packageSearch, setPackageSearch] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('all');
  const [groupBy, setGroupBy] = useState('Package');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(['all']);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, [entityType, entityId]);

  const loadDocuments = async () => {
    setLoading(true);
    const { data, error } = await getDocumentsForEntity(entityType, entityId);
    if (!error && data) {
      setDocuments(data);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const { data } = await getDocumentStats(entityType, entityId);
    if (data) setStats(data);
  };

  // Filter packages by search
  const filteredPackages = useMemo(() => {
    if (!packageSearch) return DEFAULT_PACKAGES;
    return DEFAULT_PACKAGES.filter(p =>
      p.name.toLowerCase().includes(packageSearch.toLowerCase())
    );
  }, [packageSearch]);

  // Get document count per package
  const getPackageCount = (packageId) => {
    if (packageId === 'all') return documents.length;
    return documents.filter(d => d.package === packageId || d.category === packageId).length;
  };

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Package filter
    if (selectedPackage !== 'all') {
      filtered = filtered.filter(d =>
        d.package === selectedPackage || d.category === selectedPackage
      );
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(d =>
        d.name?.toLowerCase().includes(searchLower) ||
        d.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      if (sortBy === 'updated_at' || sortBy === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (sortDir === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [documents, selectedPackage, search, sortBy, sortDir]);

  const handleDelete = async (docId, e) => {
    e?.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;

    setActionLoading(docId);
    const { success } = await deleteFile(docId);
    if (success) {
      setDocuments(docs => docs.filter(d => d.id !== docId));
      loadStats();
    }
    setActionLoading(null);
  };

  const handleOpenView = async (doc, e) => {
    e?.stopPropagation();
    if (doc.sharepoint_web_url) {
      window.open(doc.sharepoint_web_url, '_blank');
    } else {
      const { url } = await getViewLink(doc.id);
      if (url) window.open(url, '_blank');
    }
  };

  const handleDocumentClick = (doc) => {
    if (onDocumentSelect) {
      onDocumentSelect(doc);
    } else {
      handleOpenView(doc);
    }
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(f => f !== folderId)
        : [...prev, folderId]
    );
  };

  const toggleDocSelection = (docId) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(d => d !== docId)
        : [...prev, docId]
    );
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now = new Date();
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // If same year, show month day format
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${time}`;
    }
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${time}`;
  };

  const getFileIcon = (doc) => {
    const Icon = FILE_ICONS[doc.file_type] || FILE_ICONS.default;
    return Icon;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-4 py-1.5 border rounded text-sm w-48 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <Button variant="outline" size="sm" onClick={loadDocuments}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-2 text-sm">
          <Folder className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">All Documents</span>
          {selectedPackage !== 'all' && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">
                {DEFAULT_PACKAGES.find(p => p.id === selectedPackage)?.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 px-6 py-3 border-b">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => {/* Generate contract */}}
        >
          <FileSignature className="w-4 h-4" />
          Generate
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => {/* Scan document */}}
        >
          <Scan className="w-4 h-4" />
          Scan
        </Button>
        {showUpload && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Package/Folder Tree */}
        <div className="w-64 border-r flex flex-col bg-gray-50">
          {/* Grouping Dropdown */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <span>Grouping documents by</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="font-medium text-gray-900 bg-transparent border-none focus:ring-0 cursor-pointer"
              >
                <option value="Package">Package</option>
                <option value="Category">Category</option>
                <option value="Date">Date</option>
              </select>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>

            {/* Package Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={packageSearch}
                onChange={(e) => setPackageSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Folder Tree */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredPackages.map(pkg => {
              const Icon = pkg.icon;
              const count = getPackageCount(pkg.id);
              const isSelected = selectedPackage === pkg.id;
              const isExpanded = expandedFolders.includes(pkg.id);

              return (
                <div key={pkg.id}>
                  <button
                    onClick={() => {
                      setSelectedPackage(pkg.id);
                      if (pkg.id !== 'all') {
                        toggleFolder(pkg.id);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors",
                      isSelected
                        ? "bg-emerald-100 text-emerald-800"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    {pkg.id !== 'all' && (
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 text-gray-400 transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    )}
                    <Icon className={cn(
                      "w-4 h-4",
                      isSelected ? "text-emerald-600" : "text-amber-500"
                    )} />
                    <span className="flex-1 text-left truncate">{pkg.name}</span>
                    {count > 0 && (
                      <span className="text-xs text-gray-500">{count}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 flex flex-col min-w-0">
          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
              <FolderOpen className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No documents found</p>
              <p className="text-sm text-gray-400 mt-1">Upload documents to get started</p>
              {showUpload && (
                <Button
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="border-b">
                    <th
                      className="text-left px-4 py-3 text-xs font-medium text-emerald-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        NAME
                        {sortBy === 'name' && (
                          <span className="text-gray-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      TYPE
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-48 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('updated_at')}
                    >
                      <div className="flex items-center gap-1">
                        MODIFIED
                        {sortBy === 'updated_at' && (
                          <span className="text-gray-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocs(filteredDocuments.map(d => d.id));
                          } else {
                            setSelectedDocs([]);
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocuments.map(doc => {
                    const FileIcon = getFileIcon(doc);
                    const isSelected = selectedDocs.includes(doc.id);

                    return (
                      <tr
                        key={doc.id}
                        className={cn(
                          "hover:bg-gray-50 transition-colors",
                          isSelected && "bg-emerald-50"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => handleDocumentClick(doc)}
                          >
                            <div className="w-5 h-5 flex items-center justify-center">
                              <Folder className="w-5 h-5 text-amber-500" />
                            </div>
                            <span className="text-emerald-600 hover:underline text-sm font-medium">
                              {doc.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {doc.file_type?.split('/').pop()?.toUpperCase() || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(doc.updated_at || doc.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDocSelection(doc.id)}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        entityType={entityType}
        entityId={entityId}
        entityName={entityName}
        onSuccess={() => {
          setShowUploadModal(false);
          loadDocuments();
          loadStats();
        }}
      />

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewerModal
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          document={selectedDocument}
          onUpdate={() => {
            loadDocuments();
            loadStats();
          }}
        />
      )}
    </div>
  );
};

export default DocumentLibrary;
