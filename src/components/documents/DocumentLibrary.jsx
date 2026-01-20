// src/components/documents/DocumentLibrary.jsx
// Embeddable document library component for any entity

import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, File, FileText, FileImage, FileSpreadsheet, FileVideo,
  Upload, Download, Edit, Trash2, MoreVertical, Search, Filter,
  Grid, List, ExternalLink, Clock, Eye, Plus, FolderPlus, RefreshCw,
  ChevronRight, ChevronDown, Loader2, AlertCircle, Check
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

const CATEGORIES = [
  { id: 'all', label: 'All Documents', icon: FolderOpen },
  { id: 'Contracts', label: 'Contracts', icon: FileText },
  { id: 'Legal', label: 'Legal', icon: FileText },
  { id: 'Financial', label: 'Financial', icon: FileSpreadsheet },
  { id: 'Correspondence', label: 'Correspondence', icon: FileText },
  { id: 'Photos', label: 'Photos', icon: FileImage },
  { id: 'Reports', label: 'Reports', icon: FileText },
  { id: 'Miscellaneous', label: 'Miscellaneous', icon: File },
];

const DocumentLibrary = ({
  entityType,
  entityId,
  entityName,
  showHeader = true,
  showCategories = true,
  showUpload = true,
  compact = false,
  maxHeight = null,
  onDocumentSelect = null,
}) => {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(['all']);

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

  const filteredDocuments = documents.filter(doc => {
    // Category filter
    if (category !== 'all' && doc.category !== category) return false;
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        doc.name?.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        doc.tags?.some(t => t.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

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

  const handleOpenEdit = async (doc, e) => {
    e?.stopPropagation();
    setActionLoading(doc.id);
    const { url } = await getEditLink(doc.id);
    if (url) {
      window.open(url, '_blank');
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
      setSelectedDocument(doc);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (fileType) => {
    return FILE_ICONS[fileType] || FILE_ICONS.default;
  };

  const getCategoryCount = (cat) => {
    if (cat === 'all') return documents.length;
    return documents.filter(d => d.category === cat).length;
  };

  return (
    <div className={cn("flex flex-col", maxHeight && `max-h-[${maxHeight}]`)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Documents</h3>
            {stats && (
              <p className="text-sm text-gray-500">
                {stats.total} files • {formatFileSize(stats.totalSize)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadDocuments}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            {showUpload && (
              <Button 
                size="sm"
                onClick={() => setShowUploadModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 transition-colors",
              viewMode === 'list' ? "bg-gray-100" : "hover:bg-gray-50"
            )}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 transition-colors",
              viewMode === 'grid' ? "bg-gray-100" : "hover:bg-gray-50"
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Category Sidebar */}
        {showCategories && (
          <div className="w-48 flex-shrink-0 border-r pr-4">
            <div className="space-y-1">
              {CATEGORIES.map(cat => {
                const count = getCategoryCount(cat.id);
                const Icon = cat.icon;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                      category === cat.id 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{cat.label}</span>
                    </div>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      category === cat.id ? "bg-emerald-200" : "bg-gray-100"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Document List/Grid */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No documents found</p>
              {showUpload && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First Document
                </Button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase w-24">Category</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase w-20">Size</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase w-28">Modified</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDocuments.map(doc => {
                  const FileIcon = getFileIcon(doc.file_type);
                  
                  return (
                    <tr 
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <FileIcon className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[300px]">{doc.name}</p>
                            {doc.description && (
                              <p className="text-xs text-gray-500 truncate max-w-[300px]">{doc.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">{doc.category}</span>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        {formatFileSize(doc.file_size)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        {new Date(doc.updated_at || doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={(e) => handleOpenView(doc, e)}
                            className="p-1.5 hover:bg-gray-100 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => handleOpenEdit(doc, e)}
                            className="p-1.5 hover:bg-gray-100 rounded"
                            title="Edit in SharePoint"
                            disabled={actionLoading === doc.id}
                          >
                            {actionLoading === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Edit className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleDelete(doc.id, e)}
                            className="p-1.5 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            // Grid View
            <div className="grid grid-cols-4 gap-4">
              {filteredDocuments.map(doc => {
                const FileIcon = getFileIcon(doc.file_type);
                
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleDocumentClick(doc)}
                    className="border rounded-lg p-4 hover:border-emerald-500 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-center truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 text-center mt-1">{formatFileSize(doc.file_size)}</p>
                    <div className="flex justify-center gap-1 mt-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenView(doc, e)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => handleOpenEdit(doc, e)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        className="p-1.5 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
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
