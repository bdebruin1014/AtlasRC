import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layout, Calculator, ArrowUpCircle,
  CalendarDays, Building2,
  ChevronRight, ChevronLeft,
} from 'lucide-react';

const sections = [
  {
    title: 'Plans & Pricing',
    icon: Layout,
    items: [
      { label: 'Floor Plans', description: 'Home plan library', path: '/construction/admin/floor-plans', icon: Layout },
      { label: 'Plan Pricing', description: 'Sticks & bricks cost matrix', path: '/construction/admin/plans', icon: Calculator },
      { label: 'Upgrade Packages', description: 'Upgrade tiers & pricing', path: '/construction/admin/upgrades', icon: ArrowUpCircle },
    ],
  },
  {
    title: 'Scheduling',
    icon: CalendarDays,
    items: [
      { label: 'Schedule Templates', description: 'Construction schedules by plan', path: '/construction/admin/schedule-templates', icon: CalendarDays },
    ],
  },
  {
    title: 'Fees & Jurisdictions',
    icon: Building2,
    items: [
      { label: 'Municipality Fees', description: 'Fee schedules by jurisdiction', path: '/construction/admin/municipalities', icon: Building2 },
    ],
  },
];

const ConstructionAdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-50 min-h-full overflow-auto">
      <div className="mb-6">
        <Link
          to="/construction"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Houses
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Construction Admin</h1>
        <p className="text-sm text-gray-500">Manage plans, templates, and configuration</p>
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
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-emerald-600" />
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

export default ConstructionAdminPage;
