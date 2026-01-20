import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/datepicker';
import { useEntities } from '@/hooks/useEntities';

const PROJECT_TYPES = [
  { value: 'lot-development', label: 'Lot Development' },
  { value: 'build-to-rent', label: 'Build to Rent' },
  { value: 'for-sale-development', label: 'For Sale Development' },
  { value: 'scattered-lot', label: 'Scattered Lot' },
  { value: 'fix-flip', label: 'Fix & Flip' },
  { value: 'brrr', label: 'BRRR' },
  { value: 'spec-build', label: 'Spec Build' },
];
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

const ProjectModal = ({ open, onClose, project, onSave, isLoading }) => {
  const { entities } = useEntities();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    entity_id: '',
    project_type: '',
    status: 'active',
    start_date: '',
    target_completion_date: '',
    actual_completion_date: '',
    budget: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        address: project.address || '',
        city: project.city || '',
        state: project.state || '',
        zip_code: project.zip_code || '',
        entity_id: project.entity_id || '',
        project_type: project.project_type || '',
        status: project.status || 'active',
        start_date: project.start_date || '',
        target_completion_date: project.target_completion_date || '',
        actual_completion_date: project.actual_completion_date || '',
        budget: project.budget || '',
        notes: project.notes || '',
      });
    }
  }, [project, open]);

  const validate = () => {
    const errs = {};
    if (!formData.name || formData.name.length < 3) errs.name = 'Project name required (min 3 chars)';
    if (!formData.entity_id) errs.entity_id = 'Entity owner required';
    if (!formData.project_type) errs.project_type = 'Project type required';
    if (!formData.status) errs.status = 'Status required';
    if (!formData.start_date) errs.start_date = 'Start date required';
    if (!formData.target_completion_date) errs.target_completion_date = 'Target completion required';
    if (formData.start_date && formData.target_completion_date && new Date(formData.target_completion_date) < new Date(formData.start_date)) errs.target_completion_date = 'Target completion must be after start date';
    if (formData.actual_completion_date && formData.start_date && new Date(formData.actual_completion_date) < new Date(formData.start_date)) errs.actual_completion_date = 'Actual completion must be after start date';
    if (!formData.budget || isNaN(formData.budget) || Number(formData.budget) <= 0) errs.budget = 'Budget required and must be positive';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave({
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'New Project'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFORMATION */}
          <div>
            <h4 className="font-medium mb-2">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project Name *</Label>
                <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} required minLength={3} />
                {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
              </div>
              <div>
                <Label>Address</Label>
                <Input value={formData.address} onChange={e => handleChange('address', e.target.value)} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={formData.city} onChange={e => handleChange('city', e.target.value)} />
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
                <Label>Entity Owner *</Label>
                <Select value={formData.entity_id} onValueChange={v => handleChange('entity_id', v)} required>
                  <SelectTrigger><SelectValue placeholder="Select Entity" /></SelectTrigger>
                  <SelectContent>
                    {entities.map(ent => (
                      <SelectItem key={ent.id} value={ent.id}>{ent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.entity_id && <div className="text-xs text-red-500 mt-1">{errors.entity_id}</div>}
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

          {/* TIMELINE */}
          <div>
            <h4 className="font-medium mb-2">Timeline</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Start Date *</Label>
                <DatePicker value={formData.start_date} onChange={date => handleChange('start_date', date)} required />
                {errors.start_date && <div className="text-xs text-red-500 mt-1">{errors.start_date}</div>}
              </div>
              <div>
                <Label>Target Completion *</Label>
                <DatePicker value={formData.target_completion_date} onChange={date => handleChange('target_completion_date', date)} required />
                {errors.target_completion_date && <div className="text-xs text-red-500 mt-1">{errors.target_completion_date}</div>}
              </div>
              <div>
                <Label>Actual Completion</Label>
                <DatePicker value={formData.actual_completion_date} onChange={date => handleChange('actual_completion_date', date)} />
                {errors.actual_completion_date && <div className="text-xs text-red-500 mt-1">{errors.actual_completion_date}</div>}
              </div>
            </div>
          </div>

          {/* FINANCIAL */}
          <div>
            <h4 className="font-medium mb-2">Financial</h4>
            <div>
              <Label>Total Budget *</Label>
              <Input type="number" value={formData.budget} onChange={e => handleChange('budget', e.target.value)} required min={0} />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;
