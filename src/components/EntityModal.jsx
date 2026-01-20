import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const ENTITY_TYPES = [
  { value: 'holding', label: 'Holding Company' },
  { value: 'operating', label: 'Operating Company' },
  { value: 'project', label: 'Project LLC' },
];

const EntityModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  entities = [], // For parent entity dropdown
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'operating',
    parent_entity_id: '',
    tax_id: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          type: initialData.type || 'operating',
          parent_entity_id: initialData.parent_entity_id || '',
          tax_id: initialData.tax_id || '',
          notes: initialData.notes || '',
        });
      } else {
        setFormData({
          name: '',
          type: 'operating',
          parent_entity_id: '',
          tax_id: '',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Entity name is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Entity type is required';
    }

    // Validate tax_id format if provided (basic EIN format: XX-XXXXXXX)
    if (formData.tax_id && !/^\d{2}-\d{7}$/.test(formData.tax_id.trim())) {
      newErrors.tax_id = 'Tax ID should be in format XX-XXXXXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Prepare data for submission
    const submitData = {
      ...formData,
      name: formData.name.trim(),
      parent_entity_id: formData.parent_entity_id || null,
      tax_id: formData.tax_id.trim() || null,
      notes: formData.notes.trim() || null,
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'operating',
      parent_entity_id: '',
      tax_id: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  // Filter out current entity from parent options (can't be own parent)
  const availableParents = entities.filter(e => 
    !initialData || e.id !== initialData.id
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {initialData ? 'Edit Entity' : 'Add New Entity'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Entity Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-200">
              Entity Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., VanRock Holdings LLC"
              className="bg-slate-800 border-slate-600 text-white"
            />
            {errors.name && (
              <p className="text-red-400 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Entity Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-slate-200">
              Entity Type <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange('type', value)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {ENTITY_TYPES.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="text-white hover:bg-slate-700"
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-400 text-sm">{errors.type}</p>
            )}
          </div>

          {/* Parent Entity */}
          <div className="space-y-2">
            <Label htmlFor="parent_entity_id" className="text-slate-200">
              Parent Entity
            </Label>
            <Select
              value={formData.parent_entity_id}
              onValueChange={(value) => handleChange('parent_entity_id', value)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="None (Top Level)" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="" className="text-white hover:bg-slate-700">
                  None (Top Level)
                </SelectItem>
                {availableParents.map((entity) => (
                  <SelectItem
                    key={entity.id}
                    value={entity.id}
                    className="text-white hover:bg-slate-700"
                  >
                    {entity.name} ({entity.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-slate-400 text-xs">
              Select a parent to create a hierarchy (e.g., Project LLC under Operating Company)
            </p>
          </div>

          {/* Tax ID */}
          <div className="space-y-2">
            <Label htmlFor="tax_id" className="text-slate-200">
              Tax ID / EIN
            </Label>
            <Input
              id="tax_id"
              value={formData.tax_id}
              onChange={(e) => handleChange('tax_id', e.target.value)}
              placeholder="XX-XXXXXXX"
              className="bg-slate-800 border-slate-600 text-white"
            />
            {errors.tax_id && (
              <p className="text-red-400 text-sm">{errors.tax_id}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-200">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this entity..."
              className="bg-slate-800 border-slate-600 text-white min-h-[80px]"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : initialData ? (
                'Update Entity'
              ) : (
                'Create Entity'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EntityModal;
