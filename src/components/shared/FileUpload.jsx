import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  Loader2,
  Download,
  Trash2 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const FILE_ICONS = {
  'image': Image,
  'application/pdf': FileText,
  'default': File,
};

const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) return FILE_ICONS['image'];
  if (mimeType === 'application/pdf') return FILE_ICONS['application/pdf'];
  return FILE_ICONS['default'];
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUpload({
  value = [], // Array of file objects { id, name, url, size, type }
  onChange,
  bucket = 'documents',
  path = '',
  maxFiles = 10,
  maxSize = 25 * 1024 * 1024, // 25MB
  accept = {},
  label,
  required = false,
  disabled = false,
  className,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles) => {
    if (disabled) return;
    if (value.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const newFiles = [];
    
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        newFiles.push({
          id: data.path,
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
          type: file.type,
          path: data.path,
        });

        setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }

    onChange([...value, ...newFiles]);
    setUploading(false);
    setUploadProgress(0);
  }, [value, onChange, bucket, path, maxFiles, disabled, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept,
    disabled: disabled || uploading,
  });

  const removeFile = async (fileToRemove) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileToRemove.path]);

      if (error) throw error;

      onChange(value.filter(f => f.id !== fileToRemove.id));
      toast({
        title: "File removed",
        description: `${fileToRemove.name} has been removed`,
      });
    } catch (error) {
      toast({
        title: "Remove failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <label className={cn(
          "text-sm font-medium",
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
        )}>
          {label}
        </label>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "hover:border-primary hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-2">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
            <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? (
                "Drop files here..."
              ) : (
                <>
                  Drag & drop files here, or <span className="text-primary">browse</span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {maxFiles} files, {formatFileSize(maxSize)} each
            </p>
          </>
        )}
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file) => {
            const FileIcon = getFileIcon(file.type);
            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(file.url, '_blank')}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file)}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
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
