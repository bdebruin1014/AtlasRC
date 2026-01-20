import React from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, FileText, Calendar, DollarSign, Users, TrendingUp, Building2, AlertCircle } from 'lucide-react';

const PresetReportsPage = () => {
  const { category = 'general' } = useParams();
  const titles = { general: 'General Reports', development: 'Development Reports', accounting: 'Accounting Reports', construction: 'Construction Reports', investors: 'Investor Reports', contacts: 'Contacts Reports', tasks: 'Tasks Reports' };
  const reports = [
    { id: 'open-projects', title: 'Open Projects', description: 'Projects created within a date range.', icon: FileText },
    { id: 'source-of-business', title: 'Source of Business', description: 'Referral volumes within a date range.', icon: Users },
    { id: 'project-status', title: 'Project Status', description: 'Cancelled, Closed, & Opened Projects', icon: BarChart3 },
    { id: 'closing-projects', title: 'Closing Projects', description: 'Projects closing within a date range.', icon: Building2 },
    { id: 'critical-issues', title: 'Critical Issues', description: 'Projects with outstanding critical issues.', icon: AlertCircle },
    { id: 'loan-commitments', title: 'Loan Commitments', description: 'Projects with loan commitments.', icon: DollarSign },
    { id: 'calendar', title: 'Calendar', description: 'List of appointments.', icon: Calendar },
    { id: 'commissions', title: 'Commissions', description: 'Projects with earned commission.', icon: DollarSign },
  ];
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-gray-500" />
        <h1 className="text-lg font-semibold text-gray-900">{titles[category] || 'Reports'}</h1>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {reports.map((report) => (
          <button key={report.id} className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:border-[#047857] hover:shadow-sm transition-all group">
            <report.icon className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-[#047857]" />
            <h3 className="text-sm font-medium text-[#047857] mb-1">{report.title}</h3>
            <p className="text-xs text-gray-500">{report.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
export default PresetReportsPage;
