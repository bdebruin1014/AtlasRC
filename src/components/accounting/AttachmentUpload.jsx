import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Download, Eye, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const fileTypeIcons = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileText,
  xlsx: FileText,
  png: Image,
  jpg: Image,
  jpeg: Image,
  gif: Image,
  default: File,
};

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return fileTypeIcons[ext] || fileTypeIcons.default;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const AttachmentUpload = ({
  attachments = [],
  onAttachmentsChange,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif',
  entityType = 'document', // bill, invoice, journal_entry, expense, etc.
  entityId = null,
  readOnly = false,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Check max files limit
    if (attachments.length + fileArray.length > maxFiles) {
      toast({
        variant: 'destructive',
        title: 'Too Many Files',
        description: `Maximum ${maxFiles} files allowed.`,
      });
      return;
    }

    // Validate each file
    const validFiles = [];
    for (const file of fileArray) {
      if (file.size > maxFileSize) {
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: `${file.name} exceeds ${formatFileSize(maxFileSize)} limit.`,
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      // Simulate upload delay (replace with actual upload logic)
      await new Promise(resolve => setTimeout(resolve, 800));

      const newAttachments = validFiles.map(file => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file), // In production, this would be the Supabase storage URL
        // In a real implementation, you would upload to Supabase storage here:
        // const { data, error } = await supabase.storage
        //   .from('attachments')
        //   .upload(`${entityType}/${entityId}/${file.name}`, file);
      }));

      onAttachmentsChange([...attachments, ...newAttachments]);

      toast({
        title: 'Files Uploaded',
        description: `${validFiles.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Failed to upload files.',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (readOnly) return;
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!readOnly) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = (attachmentId) => {
    const updated = attachments.filter(a => a.id !== attachmentId);
    onAttachmentsChange(updated);
    toast({
      title: 'Attachment Removed',
      description: 'File has been removed.',
    });
  };

  const handleDownload = (attachment) => {
    // In production, this would download from Supabase storage
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (attachment) => {
    // Open in new tab for preview
    window.open(attachment.url, '_blank');
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      {!readOnly && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            uploading && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes}
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">Uploading files...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                Max {maxFiles} files, {formatFileSize(maxFileSize)} each
              </p>
            </div>
          )}
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Attachments ({attachments.length})
          </p>
          <div className="divide-y border rounded-lg overflow-hidden">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.name);
              return (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 bg-white hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-gray-100 rounded">
                      <FileIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(attachment);
                      }}
                      title="Preview"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(attachment);
                      }}
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                    </Button>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(attachment.id);
                        }}
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State for Read Only */}
      {readOnly && attachments.length === 0 && (
        <div className="text-center py-4 text-sm text-gray-500">
          No attachments
        </div>
      )}
    </div>
  );
};

export default AttachmentUpload;
