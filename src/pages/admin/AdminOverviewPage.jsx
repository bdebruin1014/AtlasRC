import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Settings, Building2, FileText, Workflow, BarChart3, ChevronRight } from 'lucide-react';

const AdminOverviewPage = () => {
  const navigate = useNavigate();
  const sections = [
    { title: 'Organization', icon: Users, items: [{ label: 'Users', path: '/admin/organization/users' }, { label: 'Permission Groups', path: '/admin/organization/permissions' }] },
    { title: 'Security', icon: Shield, items: [{ label: 'Account Security', path: '/admin/security/account' }, { label: 'Activity Log', path: '/admin/security/activity' }] },
    { title: 'Preferences', icon: Settings, items: [{ label: 'Basic Preferences', path: '/admin/preferences/basic' }, { label: 'Integrations', path: '/admin/preferences/integrations' }] },
    { title: 'Workflows', icon: Workflow, items: [{ label: 'Workflow Types', path: '/admin/workflows/types' }, { label: 'Project Templates', path: '/admin/workflows/templates' }] },
    { title: 'Documents', icon: FileText, items: [{ label: 'Custom Documents', path: '/admin/documents/custom' }, { label: 'Document Packages', path: '/admin/documents/packages' }] },
    { title: 'Reports', icon: BarChart3, items: [{ label: 'Report Packages', path: '/admin/reports/packages' }, { label: 'K-1 Reporting', path: '/admin/reports/k1' }] },
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
