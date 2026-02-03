// src/components/accounting/UploadFileModal.jsx
// Modal for uploading files to SharePoint for an entity

import React, { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Upload, File, FileText, FileImage, FileSpreadsheet, Image,
  Trash2, AlertCircle, Loader2, Check, FolderOpen, X
} from 'lucide-react';
import { uploadFile, formatFileSize } from '@/services/sharepointService';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'Financial Statements', label: 'Financial Statements' },
  { id: 'Tax Documents', label: 'Tax Documents' },
  { id: 'Bank Statements', label: 'Bank Statements' },
  { id: 'Contracts', label: 'Contracts' },
  { id: 'Legal', label: 'Legal Documents' },
  { id: 'Correspondence', label: 'Correspondence' },
  { id: 'Insurance', label: 'Insurance' },
  { id: 'Audit', label: 'Audit Documents' },
  { id: 'Reports', label: 'Reports' },
  { id: 'Other', label: 'Other' },
];

export default function UploadFileModal({ open, onClose, entityId, currentFolderId, driveId }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  // Reset when modal opens
  React.useEffect(() => {
    if (open) {
      setFiles([]);
      setError(null);
      setUploadProgress({});
    }
  }, [open]);

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
    e.target.value = '';
  };

  const addFiles = (newFiles) => {
    const filesWithMeta = newFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      category: 'Other',
      description: '',
    }));
    setFiles(prev => [...prev, ...filesWithMeta]);
    setError(null);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileMetadata = (fileId, field, value) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, [field]: value } : f
    ));
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const results = [];

      for (const fileData of files) {
        setUploadProgress(prev => ({ ...prev, [fileData.id]: 'uploading' }));

        try {
          // Upload to SharePoint
          const { data, error: uploadError } = await uploadFile(
            driveId,
            currentFolderId || 'root',
            fileData.file,
            fileData.file.name
          );

          if (uploadError) throw uploadError;

          // Save metadata to database
          await supabase.from('entity_files').insert({
            entity_id: entityId,
            file_name: fileData.file.name,
            file_size: fileData.file.size,
            file_type: fileData.file.type,
            category: fileData.category,
            description: fileData.description || null,
            sharepoint_id: data.id,
            sharepoint_url: data.webUrl,
            folder_id: currentFolderId,
            uploaded_at: new Date().toISOString(),
          });

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
        throw new Error(`${failed.length} file(s) failed to upload`);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entity-files', entityId]);
      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const getFileIcon = (file) => {
    const type = file.type;
    if (type.startsWith('image/')) return FileImage;
    if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
    if (type.includes('pdf') || type.includes('word') || type.includes('document')) return FileText;
    return File;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const isUploading = uploadMutation.isPending;
  const allComplete = files.length > 0 && files.every(f => uploadProgress[f.id] === 'success');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Files
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              files.length > 0
                ? "border-muted bg-muted/30"
                : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              <span className="text-primary font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, Word, Excel, Images up to 50MB
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Files ({files.length})</h4>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiles([])}
                    className="text-red-600 hover:text-red-700 h-7"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((fileData) => {
                  const FileIcon = getFileIcon(fileData.file);
                  const progress = uploadProgress[fileData.id];

                  return (
                    <div
                      key={fileData.id}
                      className={cn(
                        "border rounded-lg p-3",
                        progress === 'error' && "border-red-200 bg-red-50",
                        progress === 'success' && "border-green-200 bg-green-50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          {progress === 'uploading' ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : progress === 'success' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : progress === 'error' ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <FileIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm truncate">{fileData.file.name}</p>
                            {!isUploading && !progress && (
                              <button
                                onClick={() => removeFile(fileData.id)}
                                className="p-1 hover:bg-muted rounded"
                              >
                                <X className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatSize(fileData.file.size)}
                          </p>

                          {/* Metadata fields */}
                          {!isUploading && !progress && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Select
                                value={fileData.category}
                                onValueChange={(value) => updateFileMetadata(fileData.id, 'category', value)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CATEGORIES.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      {cat.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Description (optional)"
                                value={fileData.description}
                                onChange={(e) => updateFileMetadata(fileData.id, 'description', e.target.value)}
                                className="h-8 text-xs"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SharePoint Notice */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            <Image className="h-4 w-4 flex-shrink-0" />
            Files will be stored in SharePoint
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={() => uploadMutation.mutate()}
            disabled={files.length === 0 || isUploading || allComplete}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : allComplete ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length > 0 && `(${files.length})`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
