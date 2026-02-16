import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban, Calculator, LineChart, CheckSquare, Flag,
  ChevronRight, ChevronLeft, Users,
} from 'lucide-react';

const sections = [
  {
    title: 'Templates',
    icon: FolderKanban,
    items: [
      { label: 'Project Templates', description: 'Default project configurations', path: '/admin/project-templates', icon: FolderKanban },
      { label: 'Budget Templates', description: 'Budget category templates', path: '/admin/budget-templates', icon: Calculator },
      { label: 'Proforma Templates', description: 'Financial projection templates', path: '/admin/proforma-templates', icon: LineChart },
    ],
  },
  {
    title: 'Workflows',
    icon: CheckSquare,
    items: [
      { label: 'Workflow Templates', description: 'Task workflows and milestones', path: '/admin/task-templates', icon: CheckSquare },
      { label: 'Milestone Templates', description: 'Project milestone definitions', path: '/admin/milestone-templates', icon: Flag },
    ],
  },
  {
    title: 'Team',
    icon: Users,
    items: [
      { label: 'Resource Allocation', description: 'Team workload and assignments', path: '/projects/resources', icon: Users },
    ],
  },
];

const ProjectsAdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-50 min-h-full overflow-auto">
      <div className="mb-6">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Projects Admin</h1>
        <p className="text-sm text-gray-500">Manage project templates, workflows, and team resources</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <section.icon className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700">{section.title}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {section.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsAdminPage;
