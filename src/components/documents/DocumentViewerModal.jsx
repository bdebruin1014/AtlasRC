// src/components/documents/DocumentViewerModal.jsx
// Modal for viewing document details, activity, and actions

import React, { useState, useEffect } from 'react';
import { 
  X, File, FileText, FileImage, FileSpreadsheet, Edit, Trash2,
  Download, ExternalLink, Clock, User, Tag, FolderOpen, Save,
  Eye, RefreshCw, Share2, History, AlertCircle, Loader2, Check,
  Calendar, HardDrive, Link
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  getDocument, 
  updateDocument, 
  deleteFile, 
  getEditLink, 
  getViewLink,
  getDocumentActivity 
} from '@/services/documentService';

const CATEGORIES = [
  { id: 'Contracts', label: 'Contracts' },
  { id: 'Legal', label: 'Legal' },
  { id: 'Financial', label: 'Financial' },
  { id: 'Correspondence', label: 'Correspondence' },
  { id: 'Photos', label: 'Photos' },
  { id: 'Reports', label: 'Reports' },
  { id: 'Miscellaneous', label: 'Miscellaneous' },
];

const ACTION_LABELS = {
  file_uploaded: 'File uploaded',
  file_downloaded: 'File downloaded',
  file_deleted: 'File deleted',
  file_moved: 'File moved',
  document_updated: 'Document updated',
  edit_link_created: 'Edit link created',
  view_link_created: 'View link created',
  created_from_template: 'Created from template',
  folder_created: 'Folder created',
};

const DocumentViewerModal = ({
  isOpen,
  onClose,
  document: initialDocument,
  onUpdate = () => {},
  onDelete = () => {}
}) => {
  const [document, setDocument] = useState(initialDocument);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && initialDocument) {
      setDocument(initialDocument);
      setEditData({
        name: initialDocument.name,
        description: initialDocument.description || '',
        category: initialDocument.category,
        tags: initialDocument.tags || [],
      });
      loadActivity();
    }
  }, [isOpen, initialDocument]);

  const loadActivity = async () => {
    if (!initialDocument?.id) return;
    setActivityLoading(true);
    const { data } = await getDocumentActivity(initialDocument.id);
    if (data) setActivity(data);
    setActivityLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await updateDocument(document.id, editData);
      if (error) throw error;
      
      setDocument(data);
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    }
    
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    setActionLoading('delete');
    const { success } = await deleteFile(document.id);
    
    if (success) {
      onDelete();
      onClose();
    } else {
      setError('Failed to delete document');
    }
    
    setActionLoading(null);
  };

  const handleOpenInSharePoint = () => {
    if (document.sharepoint_web_url) {
      window.open(document.sharepoint_web_url, '_blank');
    }
  };

  const handleGetEditLink = async () => {
    setActionLoading('edit');
    const { url, expiresAt } = await getEditLink(document.id);
    
    if (url) {
      window.open(url, '_blank');
      loadActivity(); // Refresh activity log
    }
    
    setActionLoading(null);
  };

  const handleCopyShareLink = async () => {
    setActionLoading('share');
    const { url } = await getViewLink(document.id);
    
    if (url) {
      await navigator.clipboard.writeText(url);
      // Show toast or notification
      alert('Link copied to clipboard');
    }
    
    setActionLoading(null);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return FileImage;
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return FileSpreadsheet;
    if (fileType?.includes('pdf') || fileType?.includes('word') || fileType?.includes('document')) return FileText;
    return File;
  };

  const toggleTag = (tag) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  if (!isOpen || !document) return null;

  const FileIcon = getFileIcon(document.file_type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold truncate max-w-[400px]">{document.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{document.category}</span>
                <span className="text-xs text-gray-500">{formatFileSize(document.file_size)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('details')}
              className={cn(
                "py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === 'details' 
                  ? "border-emerald-600 text-emerald-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={cn(
                "py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === 'activity' 
                  ? "border-emerald-600 text-emerald-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Activity ({activity.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenInSharePoint}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in SharePoint
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGetEditLink}
                  disabled={actionLoading === 'edit'}
                >
                  {actionLoading === 'edit' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Edit className="w-4 h-4 mr-2" />
                  )}
                  Edit (8hr Link)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyShareLink}
                  disabled={actionLoading === 'share'}
                >
                  {actionLoading === 'share' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4 mr-2" />
                  )}
                  Share Link
                </Button>
              </div>

              {/* Details Form */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-gray-900">{document.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                  {isEditing ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Add a description..."
                    />
                  ) : (
                    <p className="text-gray-600">{document.description || '—'}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                  {isEditing ? (
                    <select
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{document.category}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tags</label>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-1">
                      {['Draft', 'Final', 'Signed', 'Pending Review', 'Confidential', 'Important'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "px-2 py-1 text-xs rounded-full border transition-colors",
                            editData.tags?.includes(tag)
                              ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                              : "bg-gray-50 border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {document.tags?.length > 0 ? document.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                        >
                          {tag}
                        </span>
                      )) : (
                        <span className="text-gray-400">No tags</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium">File Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Size:</span>
                    <span>{formatFileSize(document.file_size)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Type:</span>
                    <span>{document.file_type || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Created:</span>
                    <span>{new Date(document.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Modified:</span>
                    <span>{new Date(document.updated_at || document.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {document.sharepoint_path && (
                  <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                    <Link className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-gray-500 text-sm">SharePoint Path:</span>
                      <p className="text-xs text-gray-600 break-all">{document.sharepoint_path}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : activity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No activity recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.map((item, index) => (
                    <div 
                      key={item.id || index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border">
                        <History className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">
                            {item.users?.raw_user_meta_data?.full_name || item.users?.email || 'System'}
                          </span>
                          {' '}
                          {ACTION_LABELS[item.action] || item.action}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                        {item.details && Object.keys(item.details).length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {JSON.stringify(item.details)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={actionLoading === 'delete'}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {actionLoading === 'delete' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </Button>
                <Button onClick={onClose}>
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
