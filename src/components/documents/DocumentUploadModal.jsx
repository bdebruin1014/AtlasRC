// src/components/documents/DocumentUploadModal.jsx
// Modal for uploading documents with category and metadata

import React, { useState, useRef, useCallback } from 'react';
import { 
  X, Upload, File, FileText, FileImage, FileSpreadsheet, 
  Trash2, AlertCircle, Loader2, Check, FolderOpen,
  Plus, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/services/documentService';

const CATEGORIES = [
  { id: 'Contracts', label: 'Contracts' },
  { id: 'Legal', label: 'Legal' },
  { id: 'Financial', label: 'Financial' },
  { id: 'Correspondence', label: 'Correspondence' },
  { id: 'Photos', label: 'Photos' },
  { id: 'Reports', label: 'Reports' },
  { id: 'Miscellaneous', label: 'Miscellaneous' },
];

const COMMON_TAGS = [
  'Draft', 'Final', 'Signed', 'Pending Review', 'Confidential', 
  'Internal', 'Client Facing', 'Archive', 'Important'
];

const DocumentUploadModal = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  defaultCategory = 'Miscellaneous',
  onSuccess = () => {}
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Form state for metadata
  const [metadata, setMetadata] = useState({});

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
    e.target.value = ''; // Reset input
  };

  const addFiles = (newFiles) => {
    const filesWithId = newFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      category: defaultCategory,
      description: '',
      tags: [],
    }));
    
    setFiles(prev => [...prev, ...filesWithId]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileMetadata = (fileId, field, value) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, [field]: value } : f
    ));
  };

  const toggleTag = (fileId, tag) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== fileId) return f;
      const tags = f.tags.includes(tag)
        ? f.tags.filter(t => t !== tag)
        : [...f.tags, tag];
      return { ...f, tags };
    }));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    const results = [];
    
    for (const fileData of files) {
      setUploadProgress(prev => ({ ...prev, [fileData.id]: 'uploading' }));
      
      try {
        const { data, error } = await uploadFile({
          entityType,
          entityId,
          category: fileData.category,
          file: fileData.file,
          fileName: fileData.file.name,
          description: fileData.description,
          tags: fileData.tags,
        });

        if (error) throw error;
        
        setUploadProgress(prev => ({ ...prev, [fileData.id]: 'success' }));
        results.push({ success: true, file: fileData.file.name });
      } catch (err) {
        console.error('Upload error:', err);
        setUploadProgress(prev => ({ ...prev, [fileData.id]: 'error' }));
        results.push({ success: false, file: fileData.file.name, error: err.message });
      }
    }

    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      setError(`${failed.length} file(s) failed to upload`);
    } else {
      setTimeout(() => {
        onSuccess();
        setFiles([]);
        setUploadProgress({});
      }, 1000);
    }

    setUploading(false);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return FileImage;
    if (file.type.includes('spreadsheet') || file.type.includes('excel')) return FileSpreadsheet;
    if (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Upload Documents</h2>
              {entityName && (
                <p className="text-sm text-gray-500">{entityName}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              files.length > 0 ? "border-gray-200 bg-gray-50" : "border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              <span className="text-emerald-600 font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-400 mt-1">PDF, Word, Excel, Images up to 50MB</p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Files to Upload ({files.length})</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setFiles([])}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              </div>

              {files.map((fileData) => {
                const FileIcon = getFileIcon(fileData.file);
                const progress = uploadProgress[fileData.id];
                
                return (
                  <div 
                    key={fileData.id}
                    className={cn(
                      "border rounded-lg p-4",
                      progress === 'error' && "border-red-200 bg-red-50",
                      progress === 'success' && "border-emerald-200 bg-emerald-50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* File Icon */}
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {progress === 'uploading' ? (
                          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                        ) : progress === 'success' ? (
                          <Check className="w-5 h-5 text-emerald-600" />
                        ) : progress === 'error' ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <FileIcon className="w-5 h-5 text-gray-500" />
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{fileData.file.name}</p>
                          {!uploading && (
                            <button
                              onClick={() => removeFile(fileData.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{formatFileSize(fileData.file.size)}</p>

                        {/* Metadata */}
                        {!uploading && progress !== 'success' && (
                          <div className="mt-3 space-y-3">
                            {/* Category */}
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Category</label>
                              <select
                                value={fileData.category}
                                onChange={(e) => updateFileMetadata(fileData.id, 'category', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                {CATEGORIES.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                              </select>
                            </div>

                            {/* Description */}
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Description (optional)</label>
                              <input
                                type="text"
                                value={fileData.description}
                                onChange={(e) => updateFileMetadata(fileData.id, 'description', e.target.value)}
                                placeholder="Brief description..."
                                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            {/* Tags */}
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Tags</label>
                              <div className="flex flex-wrap gap-1">
                                {COMMON_TAGS.map(tag => (
                                  <button
                                    key={tag}
                                    onClick={() => toggleTag(fileData.id, tag)}
                                    className={cn(
                                      "px-2 py-0.5 text-xs rounded-full border transition-colors",
                                      fileData.tags.includes(tag)
                                        ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                                    )}
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Files will be stored in SharePoint
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {files.length > 0 && `(${files.length})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
