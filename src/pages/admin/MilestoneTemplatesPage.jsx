import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Flag, CheckCircle, Edit2, Copy, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getTemplates, MODULES } from '@/services/workflowTemplateService';

const MilestoneTemplatesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const all = await getTemplates();
      // Only show templates that have milestones
      const withMilestones = all.filter(t => (t.milestones?.length || 0) > 0);
      setTemplates(withMilestones);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const getModuleColor = (mod) => {
    const colors = {
      opportunities: 'bg-blue-100 text-blue-700',
      projects: 'bg-green-100 text-green-700',
      construction: 'bg-orange-100 text-orange-700',
      accounting: 'bg-purple-100 text-purple-700',
    };
    return colors[mod] || 'bg-gray-100 text-gray-700';
  };

  const totalMilestones = templates.reduce((sum, t) => sum + (t.milestones?.length || 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Milestone Templates</h1>
          <p className="text-sm text-gray-500">
            Milestones are managed within Workflow Templates.{' '}
            <button
              onClick={() => navigate('/admin/task-templates')}
              className="text-[#047857] hover:underline font-medium"
            >
              Go to Workflow Templates
            </button>
          </p>
        </div>
        <Button
          className="bg-[#047857] hover:bg-[#065f46]"
          onClick={() => navigate('/admin/task-templates')}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Workflow Template
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{templates.length}</p>
          <p className="text-sm text-gray-500">Templates with Milestones</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{totalMilestones}</p>
          <p className="text-sm text-gray-500">Total Milestones</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">
            {templates.filter(t => (t.milestones || []).some(m => m.is_critical)).length}
          </p>
          <p className="text-sm text-gray-500">With Critical Milestones</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
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
          <div className="divide-y">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : templates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Flag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>No workflow templates with milestones yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/admin/task-templates')}
                >
                  Create Workflow Template
                </Button>
              </div>
            ) : (
              templates
                .filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-gray-50",
                      selectedTemplate?.id === t.id && "bg-green-50 border-l-4 border-l-[#047857]"
                    )}
                    onClick={() => setSelectedTemplate(t)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Flag className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{t.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={cn("px-2 py-0.5 rounded text-xs", getModuleColor(t.module))}>
                              {MODULES.find(m => m.id === t.module)?.label || t.module}
                            </span>
                            <span className="text-xs text-gray-400">
                              {t.milestones?.length || 0} milestones
                            </span>
                            <span className="text-xs text-gray-400">
                              {t.tasks?.length || 0} tasks
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="col-span-1">
          {selectedTemplate ? (
            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b">
                <h3 className="font-semibold">{selectedTemplate.name}</h3>
                <p className="text-xs text-gray-500">{selectedTemplate.milestones?.length || 0} milestones</p>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto">
                <p className="text-sm font-medium mb-3">Milestones</p>
                <div className="space-y-2">
                  {(selectedTemplate.milestones || [])
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    .map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          {m.is_critical ? (
                            <Flag className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-gray-300" />
                          )}
                          <div>
                            <span className="font-medium">{m.name}</span>
                            <span className="text-gray-400 text-xs ml-2">+{m.offset_days || 0}d</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="p-4 border-t bg-gray-50 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate('/admin/task-templates')}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit in Workflows
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
              <Flag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select a template to preview milestones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneTemplatesPage;
