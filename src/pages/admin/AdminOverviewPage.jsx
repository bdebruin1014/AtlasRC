import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, FileText, Users, Settings, Shield, ChevronRight, Hammer, FolderKanban, Target, Calculator } from 'lucide-react';

const AdminOverviewPage = () => {
  const navigate = useNavigate();
  const sections = [
    {
      title: 'Module Admin',
      icon: Home,
      items: [
        { label: 'Construction Admin', path: '/construction/admin' },
        { label: 'Projects Admin', path: '/projects/admin' },
        { label: 'Opportunities Admin', path: '/opportunities/admin' },
        { label: 'Accounting Admin', path: '/accounting/admin' },
      ]
    },
    {
      title: 'Organization',
      icon: Users,
      items: [
        { label: 'Organization Settings', path: '/admin/organization' },
        { label: 'User Management', path: '/admin/users' },
        { label: 'Team Management', path: '/admin/team' },
        { label: 'Teams', path: '/admin/teams' },
        { label: 'Permissions Matrix', path: '/admin/permissions' },
      ]
    },
    {
      title: 'Configuration',
      icon: Settings,
      items: [
        { label: 'General Settings', path: '/admin/settings' },
        { label: 'Integrations', path: '/admin/integrations' },
        { label: 'Tags', path: '/admin/tags' },
        { label: 'Custom Fields', path: '/admin/custom-fields' },
      ]
    },
    {
      title: 'System',
      icon: Shield,
      items: [
        { label: 'Activity Log', path: '/admin/activity-log' },
        { label: 'Audit Logs', path: '/admin/audit-logs' },
        { label: 'User Analytics', path: '/admin/analytics' },
        { label: 'Bulk Actions', path: '/admin/bulk-actions' },
      ]
    },
  ];
  return (
    <div className="p-6 bg-gray-50 min-h-full overflow-auto">
      <div className="mb-6"><h1 className="text-xl font-semibold text-gray-900">Admin Settings</h1></div>
      <div className="grid grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <section.icon className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700">{section.title}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {section.items.map((item) => (
                <button key={item.path} onClick={() => navigate(item.path)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left">
                  <span className="text-sm text-gray-900">{item.label}</span>
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
export default AdminOverviewPage;
