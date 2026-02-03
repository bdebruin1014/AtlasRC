// src/components/accounting/NewFolderModal.jsx
// Modal for creating new folders in SharePoint for an entity

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FolderPlus, Loader2, AlertCircle, Folder
} from 'lucide-react';
import { createFolder } from '@/services/sharepointService';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Suggested folder names for accounting entities
const SUGGESTED_FOLDERS = [
  'Financial Statements',
  'Tax Returns',
  'Bank Statements',
  'Contracts',
  'Legal Documents',
  'Insurance',
  'Audit Documents',
  'Correspondence',
  'Board Minutes',
  'Payroll',
  'Accounts Payable',
  'Accounts Receivable',
];

export default function NewFolderModal({ open, onClose, entityId, currentFolderId, driveId, currentPath }) {
  const queryClient = useQueryClient();

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        description: '',
      });
      setError(null);
    }
  }, [open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const createFolderMutation = useMutation({
    mutationFn: async (data) => {
      // Validate folder name
      const invalidChars = /[<>:"/\\|?*]/;
      if (invalidChars.test(data.name)) {
        throw new Error('Folder name contains invalid characters');
      }

      // Create folder in SharePoint
      const { data: folder, error: spError } = await createFolder(
        driveId,
        currentFolderId || 'root',
        data.name.trim()
      );

      if (spError) throw spError;

      // Save folder metadata to database
      const { error: dbError } = await supabase.from('entity_folders').insert({
        entity_id: entityId,
        folder_name: data.name.trim(),
        description: data.description || null,
        sharepoint_id: folder.id,
        sharepoint_url: folder.webUrl,
        parent_folder_id: currentFolderId,
        path: currentPath ? `${currentPath}/${data.name.trim()}` : data.name.trim(),
        created_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error('Error saving folder metadata:', dbError);
        // Don't throw - folder was created in SharePoint
      }

      return folder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entity-files', entityId]);
      queryClient.invalidateQueries(['entity-folders', entityId]);
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to create folder');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Folder name is required');
      return;
    }

    createFolderMutation.mutate(formData);
  };

  const selectSuggestion = (name) => {
    handleChange('name', name);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            New Folder
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Current Location */}
          {currentPath && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Creating folder in:</p>
              <p className="text-sm font-medium truncate">{currentPath}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Folder Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter folder name"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Cannot contain: {'< > : " / \\ | ? *'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of folder contents..."
              rows={2}
            />
          </div>

          {/* Suggested Folders */}
          {!formData.name && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Suggested Folders</Label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_FOLDERS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => selectSuggestion(name)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md",
                      "bg-muted hover:bg-muted/80 transition-colors"
                    )}
                  >
                    <Folder className="h-3 w-3" />
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFolderMutation.isPending}>
              {createFolderMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
