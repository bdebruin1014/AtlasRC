import React from 'react';
import { useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';

const AdminPage = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const section = pathParts[1] || 'admin';
  const subsection = pathParts[2] || '';
  const titles = {
    'organization': { 'users': 'Users', 'permissions': 'Permission Groups' },
    'security': { 'account': 'Account Security', 'activity': 'Activity Log' },
    'preferences': { 'basic': 'Basic Preferences', 'integrations': 'Integrations' },
    'workflows': { 'types': 'Workflow Types', 'templates': 'Project Templates' },
    'documents': { 'custom': 'Custom Documents', 'packages': 'Document Packages' },
    'reports': { 'packages': 'Report Packages', 'k1': 'K-1 Reporting' },
  };
  const title = titles[section]?.[subsection] || 'Admin Settings';
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Settings className="w-5 h-5 text-gray-500" />
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500">This section is under development.</p>
        </div>
      </div>
    </div>
  );
};
export default AdminPage;
