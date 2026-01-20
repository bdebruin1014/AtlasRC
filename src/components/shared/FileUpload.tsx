import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  FileArchive,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onUpload?: (files: File[]) => Promise<void>;
  onRemove?: (fileId: string) => void;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  disabled?: boolean;
  className?: string;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  'image': Image,
  'application/pdf': FileText,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'application/zip': FileArchive,
  'application/x-zip-compressed': FileArchive,
  'default': File
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return FILE_ICONS['image'];
  return FILE_ICONS[type] || FILE_ICONS['default'];
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export function FileUpload({
  accept,
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  onUpload,
  onRemove,
  value = [],
  onChange,
  disabled = false,
  className
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File exceeds ${formatFileSize(maxSize)} limit`;
    }
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'));
        }
        return file.type === type;
      });
      if (!isAccepted) {
        return 'File type not accepted';
      }
    }
    return null;
  };

  const processFiles = async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);

    if (maxFiles && files.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: UploadedFile[] = fileArray.map((file) => {
      const error = validateFile(file);
      return {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: error ? 0 : 0,
        status: error ? 'error' : 'uploading',
        error
      };
    });

    const validFiles = newFiles.filter(f => f.status !== 'error');
    const allFiles = [...files, ...newFiles];
    setFiles(allFiles);
    onChange?.(allFiles);

    // Simulate upload progress
    if (onUpload && validFiles.length > 0) {
      try {
        const filesToUpload = fileArray.filter((_, i) => newFiles[i].status !== 'error');

        // Simulate progress
        for (const file of validFiles) {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
            }
            setFiles(prev => prev.map(f =>
              f.id === file.id ? { ...f, progress } : f
            ));
          }, 200);
        }

        await onUpload(filesToUpload);

        // Mark as complete
        setFiles(prev => prev.map(f =>
          validFiles.find(vf => vf.id === f.id)
            ? { ...f, progress: 100, status: 'success' }
            : f
        ));
      } catch (error) {
        setFiles(prev => prev.map(f =>
          validFiles.find(vf => vf.id === f.id)
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        ));
      }
    } else {
      // Just mark valid files as complete if no onUpload handler
      setTimeout(() => {
        setFiles(prev => prev.map(f =>
          validFiles.find(vf => vf.id === f.id)
            ? { ...f, progress: 100, status: 'success' }
            : f
        ));
      }, 1000);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleRemove = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    onChange?.(files.filter(f => f.id !== fileId));
    onRemove?.(fileId);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        <Upload className={cn(
          'mx-auto h-10 w-10 mb-4',
          isDragging ? 'text-primary' : 'text-muted-foreground'
        )} />

        <p className="text-sm font-medium mb-1">
          {isDragging ? 'Drop files here' : 'Drag and drop files here'}
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          or click to browse
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          Select Files
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          {accept && `Accepted: ${accept}`}
          {maxSize && ` • Max: ${formatFileSize(maxSize)}`}
          {maxFiles && ` • Up to ${maxFiles} files`}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.type);
            return (
              <div
                key={file.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  file.status === 'error' && 'border-destructive/50 bg-destructive/5',
                  file.status === 'success' && 'border-green-200 bg-green-50',
                  file.status === 'uploading' && 'border-muted'
                )}
              >
                <FileIcon className={cn(
                  'h-8 w-8',
                  file.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
                )} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                    {file.error && (
                      <span className="text-destructive ml-2">{file.error}</span>
                    )}
                  </p>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-1 mt-2" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {file.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRemove(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
