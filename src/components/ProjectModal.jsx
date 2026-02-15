import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PROJECT_TYPE_CONFIG } from '@/lib/constants';

const PROJECT_TYPES = [
  { value: 'scattered-lot', label: 'Scattered Lot' },
  { value: 'lot-development', label: 'Lot Development' },
  { value: 'lot-purchase-development', label: 'Lot Purchase Development' },
  { value: 'community-development', label: 'Community Development' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

const ProjectModal = ({ open, onClose, project, onSave, isLoading, preselectedType }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: 'SC',
    zip_code: '',
    entity_name: '',
    project_type: 'scattered-lot',
    status: 'active',
    start_date: '',
    target_completion_date: '',
    actual_completion_date: '',
    budget: '',
    units_to_develop: '1',
    budget_type: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        address: project.address || '',
        city: project.city || '',
        state: project.state || 'SC',
        zip_code: project.zip_code || '',
        entity_name: project.entity?.name || '',
        project_type: project.project_type || 'scattered-lot',
        status: project.status || 'active',
        start_date: project.start_date || '',
        target_completion_date: project.target_completion_date || '',
        actual_completion_date: project.actual_completion_date || '',
        budget: project.budget || '',
        units_to_develop: project.units_to_develop || '1',
        budget_type: project.budget_type || '',
        notes: project.notes || '',
      });
    } else {
      const typeKey = preselectedType || 'scattered-lot';
      const typeConfig = PROJECT_TYPE_CONFIG[typeKey];
      setFormData({
        name: '',
        address: '',
        city: '',
        state: 'SC',
        zip_code: '',
        entity_name: '',
        project_type: typeKey,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        target_completion_date: '',
        actual_completion_date: '',
        budget: '',
        units_to_develop: typeKey === 'scattered-lot' ? '1' : '',
        budget_type: typeConfig?.budgetType || '',
        notes: '',
      });
    }
  }, [project, open, preselectedType]);

  const validate = () => {
    const errs = {};
    if (!formData.name || formData.name.length < 2) errs.name = 'Project name required (min 2 chars)';
    if (!formData.project_type) errs.project_type = 'Project type required';
    if (!formData.status) errs.status = 'Status required';
    if (formData.start_date && formData.target_completion_date && new Date(formData.target_completion_date) < new Date(formData.start_date)) {
      errs.target_completion_date = 'Target completion must be after start date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Auto-set budget_type when project_type changes
      if (field === 'project_type') {
        const config = PROJECT_TYPE_CONFIG[value];
        if (config) {
          next.budget_type = config.budgetType;
          if (value === 'scattered-lot') next.units_to_develop = '1';
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const { entity_name, ...dataToSave } = formData;
    await onSave({
      ...dataToSave,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      units_to_develop: formData.units_to_develop ? parseInt(formData.units_to_develop) : 1,
    });
  };

  const selectedTypeConfig = PROJECT_TYPE_CONFIG[formData.project_type];
  const showUnits = formData.project_type !== 'scattered-lot';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : `New ${selectedTypeConfig?.label || 'Project'}`}
          </DialogTitle>
          {!project && selectedTypeConfig && (
            <p className="text-sm text-gray-500 mt-1">{selectedTypeConfig.description}</p>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFORMATION */}
          <div>
            <h4 className="font-medium mb-2">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project Name *</Label>
                <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} required minLength={2} placeholder="e.g. Driftwood, Ambleside Phase 1" />
                {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
              </div>
              <div>
                <Label>Address</Label>
                <Input value={formData.address} onChange={e => handleChange('address', e.target.value)} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={formData.city} onChange={e => handleChange('city', e.target.value)} placeholder="Greenville" />
              </div>
              <div>
                <Label>State</Label>
                <Input value={formData.state} onChange={e => handleChange('state', e.target.value)} />
              </div>
              <div>
                <Label>Zip</Label>
                <Input value={formData.zip_code} onChange={e => handleChange('zip_code', e.target.value)} />
              </div>
              <div>
                <Label>Entity Name</Label>
                <Input
                  value={formData.entity_name || ''}
                  onChange={e => handleChange('entity_name', e.target.value)}
                  placeholder="e.g. Red Cedar Homes LLC"
                />
              </div>
            </div>
          </div>

          {/* PROJECT CLASSIFICATION */}
          <div>
            <h4 className="font-medium mb-2">Project Classification</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project Type *</Label>
                <Select value={formData.project_type} onValueChange={v => handleChange('project_type', v)} required>
                  <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_type && <div className="text-xs text-red-500 mt-1">{errors.project_type}</div>}
              </div>
              <div>
                <Label>Status *</Label>
                <Select value={formData.status} onValueChange={v => handleChange('status', v)} required>
                  <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <div className="text-xs text-red-500 mt-1">{errors.status}</div>}
              </div>
            </div>
          </div>

          {/* UNITS (for multi-lot project types) */}
          {showUnits && (
            <div>
              <h4 className="font-medium mb-2">Development Scale</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    {formData.project_type === 'lot-development' ? 'Number of Lots' :
                     formData.project_type === 'lot-purchase-development' ? 'Number of Homes' :
                     'Total Units / Lots'}
                  </Label>
                  <Input
                    type="number"
                    value={formData.units_to_develop}
                    onChange={e => handleChange('units_to_develop', e.target.value)}
                    min={1}
                    placeholder="e.g. 48"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TIMELINE */}
          <div>
            <h4 className="font-medium mb-2">Timeline</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                  onChange={e => handleChange('start_date', e.target.value)}
                />
                {errors.start_date && <div className="text-xs text-red-500 mt-1">{errors.start_date}</div>}
              </div>
              <div>
                <Label>Target Completion</Label>
                <Input
                  type="date"
                  value={formData.target_completion_date ? formData.target_completion_date.split('T')[0] : ''}
                  onChange={e => handleChange('target_completion_date', e.target.value)}
                />
                {errors.target_completion_date && <div className="text-xs text-red-500 mt-1">{errors.target_completion_date}</div>}
              </div>
              <div>
                <Label>Actual Completion</Label>
                <Input
                  type="date"
                  value={formData.actual_completion_date ? formData.actual_completion_date.split('T')[0] : ''}
                  onChange={e => handleChange('actual_completion_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* FINANCIAL */}
          <div>
            <h4 className="font-medium mb-2">Financial</h4>
            <div>
              <Label>Total Budget</Label>
              <Input type="number" value={formData.budget} onChange={e => handleChange('budget', e.target.value)} min={0} placeholder="0.00" />
              {errors.budget && <div className="text-xs text-red-500 mt-1">{errors.budget}</div>}
            </div>
          </div>

          {/* PROJECT NOTES */}
          <div>
            <h4 className="font-medium mb-2">Project Notes</h4>
            <Textarea value={formData.notes} onChange={e => handleChange('notes', e.target.value)} rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#047857] hover:bg-[#065f46]">
              {isLoading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;
