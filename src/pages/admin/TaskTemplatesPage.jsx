import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Star, Copy, Trash2, Save, Edit2,
  ChevronDown, ChevronRight, CheckSquare, Layers, ListChecks,
  Flag, Clock, Users, X, ToggleLeft, ToggleRight, FolderKanban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  addTaskGroup,
  updateTaskGroup,
  deleteTaskGroup,
  addTask,
  updateTask,
  deleteTask,
  MODULES,
  TASK_PRIORITIES,
  TASK_CATEGORIES,
  ASSIGNABLE_ROLES,
} from '@/services/workflowTemplateService';

// ─── helpers ─────────────────────────────────────────────────────────────────

const MODULE_COLORS = {
  opportunities: 'bg-blue-100 text-blue-700',
  projects: 'bg-green-100 text-green-700',
  construction: 'bg-orange-100 text-orange-700',
  accounting: 'bg-purple-100 text-purple-700',
};

function moduleColor(mod) {
  return MODULE_COLORS[mod] || 'bg-gray-100 text-gray-600';
}

function priorityBadge(pri) {
  const p = TASK_PRIORITIES.find(p => p.id === pri);
  return p ? p.color : 'bg-gray-100 text-gray-600';
}

function categoryBadge(cat) {
  const c = TASK_CATEGORIES.find(c => c.id === cat);
  return c ? c.color : 'bg-gray-100 text-gray-600';
}

function categoryLabel(cat) {
  const c = TASK_CATEGORIES.find(c => c.id === cat);
  return c ? c.label : cat || '--';
}

function priorityLabel(pri) {
  const p = TASK_PRIORITIES.find(p => p.id === pri);
  return p ? p.label : pri || '--';
}

function roleLabel(roleId) {
  if (!roleId) return '--';
  const r = ASSIGNABLE_ROLES.find(r => typeof r === 'string' ? r === roleId : r.id === roleId);
  if (!r) return roleId;
  return typeof r === 'string' ? r : r.label;
}

// ─── New Template Form ───────────────────────────────────────────────────────

function NewTemplateForm({ onCreated, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [module, setModule] = useState('opportunities');
  const [projectType, setProjectType] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleCreate() {
    if (!name.trim()) {
      toast({ title: 'Validation', description: 'Template name is required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const created = await createTemplate({
        name: name.trim(),
        description: description.trim(),
        module,
        project_type: projectType.trim() || null,
      });
      toast({ title: 'Created', description: `Template "${created.name}" created.` });
      onCreated(created);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-b bg-green-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">New Workflow Template</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>
      <Input placeholder="Template name *" value={name} onChange={e => setName(e.target.value)} />
      <textarea
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#047857]"
        rows={2}
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white"
          value={module}
          onChange={e => setModule(e.target.value)}
        >
          {MODULES.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
        <Input placeholder="Project type (optional)" value={projectType} onChange={e => setProjectType(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="bg-[#047857] hover:bg-[#065f46]" onClick={handleCreate} disabled={saving}>
          {saving ? 'Creating...' : 'Create Template'}
        </Button>
      </div>
    </div>
  );
}

// ─── Inline Milestone Form ───────────────────────────────────────────────────

function MilestoneForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [offsetDays, setOffsetDays] = useState(initial?.offset_days ?? 0);
  const [isCritical, setIsCritical] = useState(initial?.is_critical ?? false);
  const [color, setColor] = useState(initial?.color || '#3B82F6');

  return (
    <div className="border rounded-md p-3 bg-gray-50 space-y-2">
      <Input placeholder="Milestone name *" value={name} onChange={e => setName(e.target.value)} className="text-sm" />
      <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="text-sm" />
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <label className="text-xs text-gray-500">Offset days</label>
          <Input type="number" value={offsetDays} onChange={e => setOffsetDays(Number(e.target.value))} className="text-sm" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500">Color</label>
          <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="text-sm h-9" />
        </div>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer pt-4">
          <input type="checkbox" checked={isCritical} onChange={e => setIsCritical(e.target.checked)} className="rounded" />
          Critical
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="bg-[#047857] hover:bg-[#065f46]" onClick={() => onSave({ name, description, offset_days: offsetDays, is_critical: isCritical, color })} disabled={!name.trim()}>
          Save
        </Button>
      </div>
    </div>
  );
}

// ─── Inline Task Group Form ──────────────────────────────────────────────────

function TaskGroupForm({ initial, milestones, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [milestoneId, setMilestoneId] = useState(initial?.milestone_id || '');

  return (
    <div className="border rounded-md p-3 bg-gray-50 space-y-2">
      <Input placeholder="Group name *" value={name} onChange={e => setName(e.target.value)} className="text-sm" />
      <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="text-sm" />
      <select
        className="w-full border rounded-md px-3 py-2 text-sm bg-white"
        value={milestoneId}
        onChange={e => setMilestoneId(e.target.value)}
      >
        <option value="">No milestone</option>
        {milestones.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="bg-[#047857] hover:bg-[#065f46]" onClick={() => onSave({ name, description, milestone_id: milestoneId || null })} disabled={!name.trim()}>
          Save
        </Button>
      </div>
    </div>
  );
}

// ─── Inline Task Form ────────────────────────────────────────────────────────

function TaskForm({ initial, milestones, taskGroups, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [priority, setPriority] = useState(initial?.priority || 'medium');
  const [category, setCategory] = useState(initial?.category || '');
  const [assignedRole, setAssignedRole] = useState(initial?.assigned_role || '');
  const [durationDays, setDurationDays] = useState(initial?.duration_days ?? '');
  const [offsetDays, setOffsetDays] = useState(initial?.offset_days ?? 0);
  const [isRequired, setIsRequired] = useState(initial?.is_required ?? true);
  const [groupId, setGroupId] = useState(initial?.group_id || '');
  const [milestoneId, setMilestoneId] = useState(initial?.milestone_id || '');

  return (
    <div className="border rounded-md p-3 bg-gray-50 space-y-2">
      <Input placeholder="Task title *" value={title} onChange={e => setTitle(e.target.value)} className="text-sm" />
      <textarea
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#047857]"
        rows={2}
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">Priority</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm bg-white" value={priority} onChange={e => setPriority(e.target.value)}>
            {TASK_PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Category</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm bg-white" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">None</option>
            {TASK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-gray-500">Assigned role</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm bg-white" value={assignedRole} onChange={e => setAssignedRole(e.target.value)}>
            <option value="">Unassigned</option>
            {ASSIGNABLE_ROLES.map(r => {
              const id = typeof r === 'string' ? r : r.id;
              const label = typeof r === 'string' ? r : r.label;
              return <option key={id} value={id}>{label}</option>;
            })}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Duration (days)</label>
          <Input type="number" min={0} value={durationDays} onChange={e => setDurationDays(e.target.value === '' ? '' : Number(e.target.value))} className="text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Offset (days)</label>
          <Input type="number" min={0} value={offsetDays} onChange={e => setOffsetDays(Number(e.target.value))} className="text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">Task group</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm bg-white" value={groupId} onChange={e => setGroupId(e.target.value)}>
            <option value="">No group</option>
            {taskGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Milestone</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm bg-white" value={milestoneId} onChange={e => setMilestoneId(e.target.value)}>
            <option value="">No milestone</option>
            {milestones.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
        <input type="checkbox" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} className="rounded" />
        Required task
      </label>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="bg-[#047857] hover:bg-[#065f46]" disabled={!title.trim()} onClick={() => onSave({
          title, description, priority, category: category || null,
          assigned_role: assignedRole || null,
          duration_days: durationDays === '' ? null : Number(durationDays),
          offset_days: Number(offsetDays),
          is_required: isRequired,
          group_id: groupId || null,
          milestone_id: milestoneId || null,
        })}>
          Save
        </Button>
      </div>
    </div>
  );
}

// ─── Template Detail Panel ───────────────────────────────────────────────────

function TemplateDetailPanel({ template, onUpdated, onDeleted }) {
  const { toast } = useToast();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // Editable header fields
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editModule, setEditModule] = useState('');
  const [editIsDefault, setEditIsDefault] = useState(false);
  const [headerDirty, setHeaderDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Section forms
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Collapsible sections
  const [milestonesOpen, setMilestonesOpen] = useState(true);
  const [groupsOpen, setGroupsOpen] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(true);

  // Load full template detail
  useEffect(() => {
    if (!template) return;
    let cancelled = false;
    setLoading(true);
    getTemplateById(template.id).then(d => {
      if (!cancelled) {
        setDetail(d);
        setEditName(d?.name || '');
        setEditDesc(d?.description || '');
        setEditModule(d?.module || 'opportunities');
        setEditIsDefault(d?.is_default || false);
        setHeaderDirty(false);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [template?.id]);

  async function refreshDetail() {
    const d = await getTemplateById(template.id);
    setDetail(d);
  }

  // Header changes
  useEffect(() => {
    if (!detail) return;
    const dirty = editName !== detail.name || editDesc !== detail.description || editModule !== detail.module || editIsDefault !== detail.is_default;
    setHeaderDirty(dirty);
  }, [editName, editDesc, editModule, editIsDefault, detail]);

  async function handleSaveHeader() {
    setSaving(true);
    try {
      const updated = await updateTemplate(template.id, {
        name: editName.trim(),
        description: editDesc.trim(),
        module: editModule,
        is_default: editIsDefault,
      });
      toast({ title: 'Saved', description: 'Template updated.' });
      setDetail(prev => ({ ...prev, ...updated }));
      setHeaderDirty(false);
      onUpdated(updated);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate() {
    try {
      const dup = await duplicateTemplate(template.id);
      toast({ title: 'Duplicated', description: `Created "${dup.name}".` });
      onUpdated(dup, true);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete template "${detail?.name}"? This cannot be undone.`)) return;
    try {
      await deleteTemplate(template.id);
      toast({ title: 'Deleted', description: 'Template deleted.' });
      onDeleted(template.id);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  // ─── Milestone handlers
  async function handleAddMilestone(data) {
    try {
      const ms = await addMilestone(template.id, { ...data, sort_order: (detail.milestones?.length || 0) + 1 });
      toast({ title: 'Added', description: `Milestone "${ms.name}" added.` });
      setShowMilestoneForm(false);
      await refreshDetail();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  async function handleUpdateMilestone(data) {
    try {
      await updateMilestone(editingMilestone.id, data);
      toast({ title: 'Updated', description: 'Milestone updated.' });
      setEditingMilestone(null);
      await refreshDetail();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  async function handleDeleteMilestone(ms) {
    if (!window.confirm(`Delete milestone "${ms.name}"?`)) return;
    try {
      await deleteMilestone(ms.id);
      toast({ title: 'Deleted', description: 'Milestone deleted.' });
      await refreshDetail();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  // ─── Task Group handlers
  async function handleAddGroup(data) {
    try {
      const g = await addTaskGroup(template.id, { ...data, sort_order: (detail.task_groups?.length || 0) + 1 });
      toast({ title: 'Added', description: `Group "${g.name}" added.` });
      setShowGroupForm(false);
      await refreshDetail();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  async function handleUpdateGroup(data) {
    try {
      await updateTaskGroup(editingGroup.id, data);
      toast({ title: 'Updated', description: 'Group updated.' });
      setEditingGroup(null);
      await refreshDetail();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  async function handleDeleteGroup(g) {
    if (!window.confirm(`Delete group "${g.name}"?`)) return;
    try {
      await deleteTaskGroup(g.id);
      toast({ title: 'Deleted', description: 'Group deleted.' });
      await refreshDetail();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  // ─── Task handlers
  async function handleAddTask(data) {
    try {
      const t = await addTask(template.id, { ...data, sort_order: (detail.tasks?.length || 0) + 1 });
      toast({ title: 'Added', description: `Task "${t.title}" added.` });
      setShowTaskForm(false);
      await refreshDetail();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  async function handleUpdateTask(data) {
    try {
      await updateTask(editingTask.id, data);
      toast({ title: 'Updated', description: 'Task updated.' });
      setEditingTask(null);
      await refreshDetail();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  async function handleDeleteTask(t) {
    if (!window.confirm(`Delete task "${t.title}"?`)) return;
    try {
      await deleteTask(t.id);
      toast({ title: 'Deleted', description: 'Task deleted.' });
      await refreshDetail();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  // ─── Render
  if (loading || !detail) {
    return (
      <div className="bg-white border rounded-lg p-8 text-center text-gray-400 animate-pulse">
        Loading template...
      </div>
    );
  }

  const milestones = detail.milestones || [];
  const taskGroups = detail.task_groups || [];
  const tasks = detail.tasks || [];

  return (
    <div className="bg-white border rounded-lg overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 220px)' }}>
      {/* ── Header ── */}
      <div className="p-4 border-b space-y-3">
        <Input
          value={editName}
          onChange={e => setEditName(e.target.value)}
          className="font-semibold text-base"
          placeholder="Template name"
        />
        <textarea
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#047857]"
          rows={2}
          placeholder="Description"
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white flex-1"
            value={editModule}
            onChange={e => setEditModule(e.target.value)}
          >
            {MODULES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={editIsDefault} onChange={e => setEditIsDefault(e.target.checked)} className="rounded" />
            <Star className="w-3.5 h-3.5 text-amber-500" /> Default
          </label>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className={cn("flex-1", headerDirty ? "bg-[#047857] hover:bg-[#065f46]" : "bg-gray-300 cursor-not-allowed")}
            disabled={!headerDirty || saving}
            onClick={handleSaveHeader}
          >
            <Save className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-1" />Duplicate
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Milestones Section ── */}
        <div className="border-b">
          <button
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
            onClick={() => setMilestonesOpen(o => !o)}
          >
            <span className="flex items-center gap-2 font-medium text-sm">
              <Flag className="w-4 h-4 text-amber-500" /> Milestones
              <Badge variant="secondary" className="ml-1">{milestones.length}</Badge>
            </span>
            {milestonesOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          {milestonesOpen && (
            <div className="px-4 pb-3 space-y-2">
              {milestones.map(ms => (
                editingMilestone?.id === ms.id ? (
                  <MilestoneForm
                    key={ms.id}
                    initial={ms}
                    onSave={handleUpdateMilestone}
                    onCancel={() => setEditingMilestone(null)}
                  />
                ) : (
                  <div key={ms.id} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ms.color || '#3B82F6' }} />
                      <span className="font-medium truncate">{ms.name}</span>
                      {ms.is_critical && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Critical</Badge>}
                      <span className="text-gray-400 text-xs">Day {ms.offset_days}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setEditingMilestone(ms); setShowMilestoneForm(false); }} className="p-1 hover:bg-gray-100 rounded"><Edit2 className="w-3.5 h-3.5 text-gray-400" /></button>
                      <button onClick={() => handleDeleteMilestone(ms)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                )
              ))}
              {showMilestoneForm ? (
                <MilestoneForm onSave={handleAddMilestone} onCancel={() => setShowMilestoneForm(false)} />
              ) : (
                <button
                  className="flex items-center gap-1 text-sm text-[#047857] hover:text-[#065f46] font-medium"
                  onClick={() => { setShowMilestoneForm(true); setEditingMilestone(null); }}
                >
                  <Plus className="w-4 h-4" /> Add Milestone
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Task Groups Section ── */}
        <div className="border-b">
          <button
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
            onClick={() => setGroupsOpen(o => !o)}
          >
            <span className="flex items-center gap-2 font-medium text-sm">
              <FolderKanban className="w-4 h-4 text-blue-500" /> Task Groups
              <Badge variant="secondary" className="ml-1">{taskGroups.length}</Badge>
            </span>
            {groupsOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          {groupsOpen && (
            <div className="px-4 pb-3 space-y-2">
              {taskGroups.map(g => (
                editingGroup?.id === g.id ? (
                  <TaskGroupForm
                    key={g.id}
                    initial={g}
                    milestones={milestones}
                    onSave={handleUpdateGroup}
                    onCancel={() => setEditingGroup(null)}
                  />
                ) : (
                  <div key={g.id} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <span className="font-medium truncate">{g.name}</span>
                      {g.milestone_id && (
                        <span className="text-xs text-gray-400 ml-2">
                          @ {milestones.find(m => m.id === g.milestone_id)?.name || 'milestone'}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-2">
                        {tasks.filter(t => t.group_id === g.id).length} tasks
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setEditingGroup(g); setShowGroupForm(false); }} className="p-1 hover:bg-gray-100 rounded"><Edit2 className="w-3.5 h-3.5 text-gray-400" /></button>
                      <button onClick={() => handleDeleteGroup(g)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                )
              ))}
              {showGroupForm ? (
                <TaskGroupForm milestones={milestones} onSave={handleAddGroup} onCancel={() => setShowGroupForm(false)} />
              ) : (
                <button
                  className="flex items-center gap-1 text-sm text-[#047857] hover:text-[#065f46] font-medium"
                  onClick={() => { setShowGroupForm(true); setEditingGroup(null); }}
                >
                  <Plus className="w-4 h-4" /> Add Task Group
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Tasks Section ── */}
        <div>
          <button
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
            onClick={() => setTasksOpen(o => !o)}
          >
            <span className="flex items-center gap-2 font-medium text-sm">
              <ListChecks className="w-4 h-4 text-green-600" /> Tasks
              <Badge variant="secondary" className="ml-1">{tasks.length}</Badge>
            </span>
            {tasksOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          {tasksOpen && (
            <div className="px-4 pb-3 space-y-2">
              {tasks.length === 0 && !showTaskForm && (
                <p className="text-xs text-gray-400 py-2">No tasks yet. Add your first task below.</p>
              )}
              {tasks.map(t => (
                editingTask?.id === t.id ? (
                  <TaskForm
                    key={t.id}
                    initial={t}
                    milestones={milestones}
                    taskGroups={taskGroups}
                    onSave={handleUpdateTask}
                    onCancel={() => setEditingTask(null)}
                  />
                ) : (
                  <div key={t.id} className="border rounded-md px-3 py-2 text-sm space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium">{t.title}</span>
                          {t.is_required && <span className="text-red-500 text-xs">*</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={cn('px-1.5 py-0 rounded text-[10px]', priorityBadge(t.priority))}>{priorityLabel(t.priority)}</span>
                          {t.category && <span className={cn('px-1.5 py-0 rounded text-[10px] bg-gray-100 text-gray-600')}>{categoryLabel(t.category)}</span>}
                          {t.assigned_role && (
                            <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                              <Users className="w-3 h-3" /> {roleLabel(t.assigned_role)}
                            </span>
                          )}
                          {t.duration_days != null && (
                            <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                              <Clock className="w-3 h-3" /> {t.duration_days}d
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                        <button onClick={() => { setEditingTask(t); setShowTaskForm(false); }} className="p-1 hover:bg-gray-100 rounded"><Edit2 className="w-3.5 h-3.5 text-gray-400" /></button>
                        <button onClick={() => handleDeleteTask(t)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      </div>
                    </div>
                  </div>
                )
              ))}
              {showTaskForm ? (
                <TaskForm
                  milestones={milestones}
                  taskGroups={taskGroups}
                  onSave={handleAddTask}
                  onCancel={() => setShowTaskForm(false)}
                />
              ) : (
                <button
                  className="flex items-center gap-1 text-sm text-[#047857] hover:text-[#065f46] font-medium"
                  onClick={() => { setShowTaskForm(true); setEditingTask(null); }}
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TaskTemplatesPage = () => {
  const { toast } = useToast();

  // Template list
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Stats (computed from templates list + detail cache)
  const [detailCache, setDetailCache] = useState({});

  // ─── Load templates ────────────────────────────────────────────────────────

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const data = await getTemplates();
      setTemplates(data);

      // Preload detail for each template to get task counts
      const cache = {};
      await Promise.all(data.map(async t => {
        try {
          const d = await getTemplateById(t.id);
          cache[t.id] = d;
        } catch { /* skip */ }
      }));
      setDetailCache(cache);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load templates.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  // ─── Computed ──────────────────────────────────────────────────────────────

  const filteredTemplates = templates.filter(t => {
    if (moduleFilter !== 'all' && t.module !== moduleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (t.name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  const activeCount = templates.filter(t => t.is_active).length;

  const moduleCounts = MODULES.map(m => ({
    ...m,
    count: templates.filter(t => t.module === m.id).length,
  }));

  const totalTasks = Object.values(detailCache).reduce((sum, d) => sum + (d?.tasks?.length || 0), 0);

  const selectedTemplate = templates.find(t => t.id === selectedId) || null;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleNewCreated(created) {
    setTemplates(prev => [...prev, created]);
    setShowNewForm(false);
    setSelectedId(created.id);
    // Refresh cache for the new template
    getTemplateById(created.id).then(d => {
      setDetailCache(prev => ({ ...prev, [created.id]: d }));
    });
  }

  function handleDetailUpdated(updated, isDuplicate) {
    if (isDuplicate) {
      // This is a duplicate — add it to the list
      setTemplates(prev => [...prev, updated]);
      setSelectedId(updated.id);
      getTemplateById(updated.id).then(d => {
        setDetailCache(prev => ({ ...prev, [updated.id]: d }));
      });
    } else {
      setTemplates(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
      // Refresh cache
      getTemplateById(updated.id).then(d => {
        setDetailCache(prev => ({ ...prev, [updated.id]: d }));
      });
    }
  }

  function handleDetailDeleted(id) {
    setTemplates(prev => prev.filter(t => t.id !== id));
    setDetailCache(prev => { const c = { ...prev }; delete c[id]; return c; });
    setSelectedId(null);
  }

  async function handleToggleActive(t, e) {
    e.stopPropagation();
    try {
      const updated = await updateTemplate(t.id, { is_active: !t.is_active });
      setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, ...updated } : x));
      toast({ title: updated.is_active ? 'Activated' : 'Deactivated', description: `"${t.name}" is now ${updated.is_active ? 'active' : 'inactive'}.` });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Workflow Templates</h1>
          <p className="text-sm text-gray-500">Create reusable workflows with milestones, task groups, and tasks</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowNewForm(true)}>
          <Plus className="w-4 h-4 mr-2" />New Template
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{templates.length}</p>
          <p className="text-sm text-gray-500">Total Templates</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{activeCount}</p>
          <p className="text-sm text-gray-500">Active Templates</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex flex-wrap gap-1">
            {moduleCounts.map(m => (
              <span key={m.id} className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold', moduleColor(m.id))}>
                {m.label}: {m.count}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">Across Modules</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{totalTasks}</p>
          <p className="text-sm text-gray-500">Total Tasks</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left column — template list */}
        <div className="col-span-2 bg-white border rounded-lg flex flex-col" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {/* New template form */}
          {showNewForm && (
            <NewTemplateForm onCreated={handleNewCreated} onCancel={() => setShowNewForm(false)} />
          )}

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Module filter tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto">
            <button
              className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors', moduleFilter === 'all' ? 'bg-[#047857] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              onClick={() => setModuleFilter('all')}
            >
              All
            </button>
            {MODULES.map(m => (
              <button
                key={m.id}
                className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap', moduleFilter === m.id ? 'bg-[#047857] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                onClick={() => setModuleFilter(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Template list */}
          <div className="flex-1 overflow-y-auto divide-y">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading templates...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Layers className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No templates found.</p>
              </div>
            ) : (
              filteredTemplates.map(t => {
                const d = detailCache[t.id];
                const msCount = d?.milestones?.length || 0;
                const gCount = d?.task_groups?.length || 0;
                const tCount = d?.tasks?.length || 0;
                const isSelected = selectedId === t.id;

                return (
                  <div
                    key={t.id}
                    className={cn(
                      'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                      isSelected && 'bg-green-50 border-l-4 border-l-[#047857]',
                      !t.is_active && 'opacity-60',
                    )}
                    onClick={() => setSelectedId(t.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckSquare className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{t.name}</h3>
                            {t.is_default && <Star className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" />}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={cn('px-2 py-0.5 rounded text-xs', moduleColor(t.module))}>
                              {MODULES.find(m => m.id === t.module)?.label || t.module}
                            </span>
                            {t.description && (
                              <span className="text-xs text-gray-400 truncate max-w-[200px]">{t.description}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                            <span>{msCount} milestones</span>
                            <span>{gCount} groups</span>
                            <span>{tCount} tasks</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={e => handleToggleActive(t, e)}
                        className="flex-shrink-0 pt-1"
                        title={t.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                      >
                        {t.is_active ? (
                          <ToggleRight className="w-6 h-6 text-[#047857]" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column — detail panel */}
        <div className="col-span-1">
          {selectedTemplate ? (
            <TemplateDetailPanel
              key={selectedId}
              template={selectedTemplate}
              onUpdated={handleDetailUpdated}
              onDeleted={handleDetailDeleted}
            />
          ) : (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Select a template to edit</p>
              <p className="text-sm text-gray-400 mt-1">Choose a template from the list or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskTemplatesPage;
