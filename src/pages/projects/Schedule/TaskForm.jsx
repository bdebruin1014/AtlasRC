// src/pages/projects/Schedule/TaskForm.jsx
// Modal form for creating/editing schedule tasks with dependency management

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPENDENCY_TYPES, TASK_STATUSES } from '@/services/scheduleService';

const TaskForm = ({ open, task, phases, tasks, onSave, onClose }) => {
  const isEditing = !!task;

  const [form, setForm] = useState({
    name: task?.name || '',
    description: task?.description || '',
    phase_id: task?.phase_id || (phases[0]?.id || ''),
    category: task?.category || '',
    duration_days: task?.duration_days || 1,
    duration_type: task?.duration_type || 'calculated',
    predecessor_id: task?.predecessor_id || '',
    predecessor_type: task?.predecessor_type || 'FS',
    lag_days: task?.lag_days || 0,
    is_date_fixed: task?.is_date_fixed || false,
    fixed_date: task?.fixed_date || '',
    is_milestone: task?.is_milestone || false,
    is_critical_path: task?.is_critical_path || false,
    assigned_to_name: task?.assigned_to_name || '',
    status: task?.status || 'not_started',
    percent_complete: task?.percent_complete || 0,
    sort_order: task?.sort_order || tasks.length + 1,
  });

  // Available predecessors (exclude self to prevent circular deps)
  const availablePredecessors = useMemo(() => {
    return tasks.filter(t => t.id !== task?.id);
  }, [tasks, task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phase_id) return;

    const taskData = {
      ...form,
      duration_days: parseInt(form.duration_days) || 1,
      lag_days: parseInt(form.lag_days) || 0,
      percent_complete: parseFloat(form.percent_complete) || 0,
      predecessor_id: form.predecessor_id || null,
      predecessor_type: form.predecessor_id ? form.predecessor_type : null,
      fixed_date: form.is_date_fixed ? form.fixed_date : null,
    };

    onSave(taskData);
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const getDependencyHelp = (type) => {
    const dep = DEPENDENCY_TYPES.find(d => d.value === type);
    return dep?.desc || '';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Add Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="task-name">Task Name *</Label>
                <Input
                  id="task-name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. Foundation Pour"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Phase *</Label>
                <Select value={form.phase_id} onValueChange={(v) => update('phase_id', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {phases.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="task-duration">Duration (Days) *</Label>
                <Input
                  id="task-duration"
                  type="number"
                  min={1}
                  value={form.duration_days}
                  onChange={(e) => update('duration_days', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Category and Assignment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => update('category', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acquisition">Acquisition</SelectItem>
                    <SelectItem value="due_diligence">Due Diligence</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="permits">Permits</SelectItem>
                    <SelectItem value="sitework">Site Work</SelectItem>
                    <SelectItem value="foundation">Foundation</SelectItem>
                    <SelectItem value="framing">Framing</SelectItem>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                    <SelectItem value="exterior">Exterior</SelectItem>
                    <SelectItem value="interior">Interior</SelectItem>
                    <SelectItem value="closeout">Closeout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-assigned">Assigned To</Label>
                <Input
                  id="task-assigned"
                  value={form.assigned_to_name}
                  onChange={(e) => update('assigned_to_name', e.target.value)}
                  placeholder="Name..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Scheduling Method */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Scheduling Method</p>

              {/* Fixed Date Toggle */}
              <div className="flex items-start gap-2 mb-3">
                <input
                  type="checkbox"
                  id="is-fixed"
                  checked={form.is_date_fixed}
                  onChange={(e) => update('is_date_fixed', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-[#2F855A] focus:ring-[#2F855A]"
                />
                <div>
                  <Label htmlFor="is-fixed" className="text-sm font-normal cursor-pointer">Fixed Date</Label>
                  <p className="text-xs text-gray-500">Task starts on a specific date regardless of dependencies</p>
                </div>
              </div>

              {form.is_date_fixed && (
                <div className="ml-6 mb-3">
                  <Label htmlFor="fixed-date">Fixed Start Date</Label>
                  <Input
                    id="fixed-date"
                    type="date"
                    value={form.fixed_date}
                    onChange={(e) => update('fixed_date', e.target.value)}
                    className="mt-1 w-48"
                  />
                </div>
              )}

              {/* Dependency */}
              {!form.is_date_fixed && (
                <div className="space-y-3">
                  <div>
                    <Label>Predecessor Task</Label>
                    <Select value={form.predecessor_id} onValueChange={(v) => update('predecessor_id', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="None (project start)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (starts at project start)</SelectItem>
                        {availablePredecessors.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {form.predecessor_id && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Dependency Type</Label>
                        <Select value={form.predecessor_type} onValueChange={(v) => update('predecessor_type', v)}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {DEPENDENCY_TYPES.map(d => (
                              <SelectItem key={d.value} value={d.value}>{d.label} ({d.value})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">{getDependencyHelp(form.predecessor_type)}</p>
                      </div>
                      <div>
                        <Label htmlFor="lag-days">Lag Days</Label>
                        <Input
                          id="lag-days"
                          type="number"
                          value={form.lag_days}
                          onChange={(e) => update('lag_days', e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Negative = lead time</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status & Progress (for editing) */}
            {isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => {
                    update('status', v);
                    if (v === 'completed') update('percent_complete', 100);
                    else if (v === 'not_started') update('percent_complete', 0);
                  }}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="task-pct">% Complete</Label>
                  <Input
                    id="task-pct"
                    type="number"
                    min={0}
                    max={100}
                    value={form.percent_complete}
                    onChange={(e) => update('percent_complete', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Flags */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-milestone"
                  checked={form.is_milestone}
                  onChange={(e) => update('is_milestone', e.target.checked)}
                  className="rounded border-gray-300 text-[#2F855A] focus:ring-[#2F855A]"
                />
                <Label htmlFor="is-milestone" className="text-sm font-normal cursor-pointer">Milestone</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-critical"
                  checked={form.is_critical_path}
                  onChange={(e) => update('is_critical_path', e.target.checked)}
                  className="rounded border-gray-300 text-[#2F855A] focus:ring-[#2F855A]"
                />
                <Label htmlFor="is-critical" className="text-sm font-normal cursor-pointer">Critical Path</Label>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="task-desc">Notes</Label>
              <Input
                id="task-desc"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Optional notes..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#2F855A] hover:bg-[#276749]" disabled={!form.name || !form.phase_id}>
              {isEditing ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
