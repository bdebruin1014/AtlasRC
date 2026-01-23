import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Copy, Building2, Layers, CheckSquare, Calendar,
  Calculator, Target, Trash2, FolderTree, Users, ChevronRight, ChevronDown,
  Save, X, GripVertical, AlertTriangle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  getOrganizationTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  addTemplateFolder,
  deleteTemplateFolder,
  addTemplatePhase,
  addTemplateMilestone,
  addTemplateTask,
  addTemplateTeamRole,
  PROJECT_TYPES
} from '@/services/projectTemplateService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ProjectTemplatesPage = () => {
  const { user, organization } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // Form state for new template
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    project_type: '',
    estimated_duration_days: 120,
  });

  useEffect(() => {
    loadTemplates();
  }, [organization]);

  const loadTemplates = async () => {
    if (!organization?.id) {
      // Use demo data if no organization
      setTemplates([
        { id: '1', name: 'Single Family Spec Build', project_type: 'spec-home', description: 'Standard spec home construction template', is_default: true, estimated_duration_days: 180 },
        { id: '2', name: 'Lot Development Project', project_type: 'lot-development', description: 'Horizontal land development template', is_default: false, estimated_duration_days: 365 },
        { id: '3', name: 'Fix & Flip', project_type: 'fix-flip', description: 'Quick renovation and sale template', is_default: false, estimated_duration_days: 90 },
        { id: '4', name: 'Build-to-Rent Community', project_type: 'btr-community', description: 'BTR development and lease-up template', is_default: false, estimated_duration_days: 540 },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await getOrganizationTemplates(organization.id);
      if (!error && data) {
        setTemplates(data);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template);
    if (template.id && !template.folders) {
      // Load full template details
      const { data } = await getTemplateById(template.id);
      if (data) {
        setSelectedTemplate(data);
      }
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !organization?.id) return;

    setSaving(true);
    try {
      const { data, error } = await createTemplate(organization.id, newTemplate);
      if (!error && data) {
        setTemplates([...templates, data]);
        setNewTemplate({ name: '', description: '', project_type: '', estimated_duration_days: 120 });
        setShowEditor(false);
        setSelectedTemplate(data);
      }
    } catch (err) {
      console.error('Error creating template:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const { success } = await deleteTemplate(templateToDelete.id);
      if (success) {
        setTemplates(templates.filter(t => t.id !== templateToDelete.id));
        if (selectedTemplate?.id === templateToDelete.id) {
          setSelectedTemplate(null);
        }
      }
    } catch (err) {
      console.error('Error deleting template:', err);
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleDuplicateTemplate = async (template) => {
    if (!organization?.id) return;

    setSaving(true);
    try {
      const { data, error } = await createTemplate(organization.id, {
        ...template,
        name: `${template.name} (Copy)`,
        is_default: false,
      });
      if (!error && data) {
        setTemplates([...templates, data]);
      }
    } catch (err) {
      console.error('Error duplicating template:', err);
    } finally {
      setSaving(false);
    }
  };

  const getTypeInfo = (typeId) => {
    const type = Object.values(PROJECT_TYPES).find(t => t.id === typeId);
    return type || { name: typeId, color: 'bg-gray-500', icon: '📁' };
  };

  const getTypeColor = (typeId) => {
    const colors = {
      'spec-home': 'bg-blue-100 text-blue-700',
      'custom-home': 'bg-indigo-100 text-indigo-700',
      'lot-development': 'bg-green-100 text-green-700',
      'btr-community': 'bg-purple-100 text-purple-700',
      'bts-community': 'bg-amber-100 text-amber-700',
      'fix-flip': 'bg-orange-100 text-orange-700',
    };
    return colors[typeId] || 'bg-gray-100 text-gray-700';
  };

  const filteredTemplates = templates.filter(t =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.project_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Project Templates</h1>
          <p className="text-sm text-gray-500">Create and manage project templates with folders, schedules, budgets, and teams</p>
        </div>
        <Button
          className="bg-[#047857] hover:bg-[#065f46]"
          onClick={() => {
            setNewTemplate({ name: '', description: '', project_type: '', estimated_duration_days: 120 });
            setShowEditor(true);
            setEditingTemplate(null);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{templates.length}</p>
          <p className="text-sm text-gray-500">Templates</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{Object.keys(PROJECT_TYPES).length}</p>
          <p className="text-sm text-gray-500">Project Types</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{templates.filter(t => t.is_default).length}</p>
          <p className="text-sm text-gray-500">Default Templates</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">6</p>
          <p className="text-sm text-gray-500">Module Types</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Template List */}
        <div className="col-span-2 bg-white border rounded-lg">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No templates found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowEditor(true)}
              >
                <Plus className="w-4 h-4 mr-2" />Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredTemplates.map((template) => {
                const typeInfo = getTypeInfo(template.project_type);
                return (
                  <div
                    key={template.id}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                      selectedTemplate?.id === template.id && "bg-green-50 border-l-4 border-l-[#047857]"
                    )}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                          {typeInfo.icon || '📁'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{template.name}</h3>
                            {template.is_default && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{template.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={cn("px-2 py-0.5 rounded text-xs", getTypeColor(template.project_type))}>
                              {typeInfo.name}
                            </span>
                            {template.estimated_duration_days && (
                              <span className="text-xs text-gray-400">
                                ~{template.estimated_duration_days} days
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateTemplate(template);
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTemplateToDelete(template);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Template Details / Editor */}
        <div className="col-span-1">
          {showEditor ? (
            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">
                  {editingTemplate ? 'Edit Template' : 'New Template'}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowEditor(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Template Name</label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="e.g., Standard Spec Home"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Input
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    placeholder="Brief description..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Project Type</label>
                  <select
                    value={newTemplate.project_type}
                    onChange={(e) => setNewTemplate({ ...newTemplate, project_type: e.target.value })}
                    className="w-full mt-1 border rounded-lg p-2"
                  >
                    <option value="">Select type...</option>
                    {Object.values(PROJECT_TYPES).map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estimated Duration (days)</label>
                  <Input
                    type="number"
                    value={newTemplate.estimated_duration_days}
                    onChange={(e) => setNewTemplate({ ...newTemplate, estimated_duration_days: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="p-4 border-t bg-gray-50 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#047857] hover:bg-[#065f46]"
                  onClick={handleCreateTemplate}
                  disabled={saving || !newTemplate.name}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Template
                </Button>
              </div>
            </div>
          ) : selectedTemplate ? (
            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b">
                <h3 className="font-semibold">{selectedTemplate.name}</h3>
                <p className="text-xs text-gray-500">{getTypeInfo(selectedTemplate.project_type).name}</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b">
                {['overview', 'folders', 'schedule', 'budget', 'team'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-2 text-xs font-medium capitalize",
                      activeTab === tab
                        ? "border-b-2 border-[#047857] text-[#047857]"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Description</p>
                      <p className="text-sm mt-1">{selectedTemplate.description || 'No description'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                      <p className="text-sm mt-1">{selectedTemplate.estimated_duration_days || '—'} days</p>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Template Contents</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <FolderTree className="w-4 h-4 text-gray-400" />
                          <span>{selectedTemplate.folders?.length || 0} Folders</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Layers className="w-4 h-4 text-gray-400" />
                          <span>{selectedTemplate.phases?.length || 0} Phases</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-gray-400" />
                          <span>{selectedTemplate.milestones?.length || 0} Milestones</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckSquare className="w-4 h-4 text-gray-400" />
                          <span>{selectedTemplate.tasks?.length || 0} Tasks</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calculator className="w-4 h-4 text-gray-400" />
                          <span>{selectedTemplate.budgetItems?.length || 0} Budget Items</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{selectedTemplate.teamRoles?.length || 0} Team Roles</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'folders' && (
                  <FolderEditor
                    template={selectedTemplate}
                    onUpdate={(folders) => setSelectedTemplate({ ...selectedTemplate, folders })}
                  />
                )}

                {activeTab === 'schedule' && (
                  <ScheduleEditor
                    template={selectedTemplate}
                    onUpdate={(data) => setSelectedTemplate({ ...selectedTemplate, ...data })}
                  />
                )}

                {activeTab === 'budget' && (
                  <BudgetEditor
                    template={selectedTemplate}
                    onUpdate={(data) => setSelectedTemplate({ ...selectedTemplate, ...data })}
                  />
                )}

                {activeTab === 'team' && (
                  <TeamEditor
                    template={selectedTemplate}
                    onUpdate={(teamRoles) => setSelectedTemplate({ ...selectedTemplate, teamRoles })}
                  />
                )}
              </div>

              <div className="p-4 border-t bg-gray-50 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEditingTemplate(selectedTemplate);
                    setNewTemplate({
                      name: selectedTemplate.name,
                      description: selectedTemplate.description,
                      project_type: selectedTemplate.project_type,
                      estimated_duration_days: selectedTemplate.estimated_duration_days,
                    });
                    setShowEditor(true);
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-1" />Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDuplicateTemplate(selectedTemplate)}
                >
                  <Copy className="w-4 h-4 mr-1" />Duplicate
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select a template to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">How Project Templates Work</h4>
        <p className="text-sm text-blue-700">
          Project templates define the folder structure, schedule phases, budget categories, task lists, and team roles for new projects.
          When creating a project or converting an opportunity, select a template to automatically set up the entire project structure.
          Templates can also be applied to SharePoint to create the matching folder hierarchy.
        </p>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Folder Editor Component
const FolderEditor = ({ template, onUpdate }) => {
  const [folders, setFolders] = useState(template.folders || []);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentId, setParentId] = useState(null);

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;

    const { data, error } = await addTemplateFolder(template.id, {
      name: newFolderName,
      parent_folder_id: parentId,
      sort_order: folders.length,
    });

    if (!error && data) {
      setFolders([...folders, data]);
      onUpdate([...folders, data]);
      setNewFolderName('');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    const { success } = await deleteTemplateFolder(folderId);
    if (success) {
      const updated = folders.filter(f => f.id !== folderId);
      setFolders(updated);
      onUpdate(updated);
    }
  };

  const renderFolderTree = (parentId = null, level = 0) => {
    const children = folders.filter(f => f.parent_folder_id === parentId);
    return children.map((folder) => (
      <div key={folder.id} style={{ marginLeft: level * 16 }}>
        <div className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded group">
          <FolderTree className="w-4 h-4 text-amber-500" />
          <span className="text-sm flex-1">{folder.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100"
            onClick={() => handleDeleteFolder(folder.id)}
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </Button>
        </div>
        {renderFolderTree(folder.id, level + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
        {folders.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No folders defined</p>
        ) : (
          renderFolderTree()
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Folder name..."
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
        />
        <Button size="sm" onClick={handleAddFolder}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Schedule Editor Component
const ScheduleEditor = ({ template, onUpdate }) => {
  const [phases, setPhases] = useState(template.phases || []);
  const [milestones, setMilestones] = useState(template.milestones || []);
  const [newPhase, setNewPhase] = useState({ name: '', duration_days: 30 });

  const handleAddPhase = async () => {
    if (!newPhase.name.trim()) return;

    const { data, error } = await addTemplatePhase(template.id, {
      ...newPhase,
      sort_order: phases.length,
    });

    if (!error && data) {
      setPhases([...phases, data]);
      onUpdate({ phases: [...phases, data], milestones });
      setNewPhase({ name: '', duration_days: 30 });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Phases</p>
        <div className="border rounded-lg divide-y max-h-32 overflow-y-auto">
          {phases.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No phases defined</p>
          ) : (
            phases.map((phase) => (
              <div key={phase.id} className="flex items-center gap-2 p-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <span className="text-sm flex-1">{phase.name}</span>
                <span className="text-xs text-gray-400">{phase.duration_days}d</span>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            value={newPhase.name}
            onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
            placeholder="Phase name..."
            className="flex-1"
          />
          <Input
            type="number"
            value={newPhase.duration_days}
            onChange={(e) => setNewPhase({ ...newPhase, duration_days: parseInt(e.target.value) })}
            className="w-16"
          />
          <Button size="sm" onClick={handleAddPhase}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Milestones</p>
        <div className="border rounded-lg divide-y max-h-32 overflow-y-auto">
          {milestones.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No milestones defined</p>
          ) : (
            milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-2 p-2">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-sm flex-1">{milestone.name}</span>
                {milestone.is_critical && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">Critical</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Budget Editor Component
const BudgetEditor = ({ template, onUpdate }) => {
  const categories = template.budgetCategories || [];
  const items = template.budgetItems || [];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Budget Categories</p>
        <div className="border rounded-lg divide-y max-h-32 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No categories defined</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2 p-2">
                <Calculator className="w-4 h-4 text-purple-500" />
                <span className="text-sm flex-1">{cat.code} - {cat.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Line Items ({items.length})</p>
        <div className="border rounded-lg divide-y max-h-32 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No items defined</p>
          ) : (
            items.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2">
                <span className="text-sm">{item.name}</span>
                <span className="text-xs text-gray-400">
                  {item.unit_cost ? `$${item.unit_cost}/${item.unit}` : '—'}
                </span>
              </div>
            ))
          )}
          {items.length > 5 && (
            <p className="text-xs text-gray-400 text-center py-2">+{items.length - 5} more items</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Team Editor Component
const TeamEditor = ({ template, onUpdate }) => {
  const [roles, setRoles] = useState(template.teamRoles || []);
  const [newRole, setNewRole] = useState({ role_name: '', role_type: 'internal' });

  const handleAddRole = async () => {
    if (!newRole.role_name.trim()) return;

    const { data, error } = await addTemplateTeamRole(template.id, {
      ...newRole,
      sort_order: roles.length,
    });

    if (!error && data) {
      setRoles([...roles, data]);
      onUpdate([...roles, data]);
      setNewRole({ role_name: '', role_type: 'internal' });
    }
  };

  const getRoleTypeColor = (type) => {
    const colors = {
      'internal': 'bg-blue-100 text-blue-700',
      'external': 'bg-green-100 text-green-700',
      'consultant': 'bg-purple-100 text-purple-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
        {roles.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No team roles defined</p>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="flex items-center gap-2 p-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm flex-1">{role.role_name}</span>
              <span className={cn("px-1.5 py-0.5 rounded text-xs", getRoleTypeColor(role.role_type))}>
                {role.role_type}
              </span>
              {role.is_required && (
                <span className="text-xs text-red-500">Required</span>
              )}
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={newRole.role_name}
          onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
          placeholder="Role name..."
          className="flex-1"
        />
        <select
          value={newRole.role_type}
          onChange={(e) => setNewRole({ ...newRole, role_type: e.target.value })}
          className="border rounded-lg px-2"
        >
          <option value="internal">Internal</option>
          <option value="external">External</option>
          <option value="consultant">Consultant</option>
        </select>
        <Button size="sm" onClick={handleAddRole}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectTemplatesPage;
