import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  ChevronLeft, Settings, Target, BarChart3, AlertTriangle, Calendar, Users, 
  FileText, Compass, Mountain, CheckSquare, Clock, BookOpen, TrendingUp,
  Layers, UserCheck, Repeat, Star, ChevronDown, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const EOSDetailLayout = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(['vision', 'traction', 'meetings']);

  // Mock program data - would come from context/API
  const program = {
    id: programId,
    name: 'VanRock Holdings EOS',
    entityName: 'VanRock Holdings LLC',
    phase: 'Traction',
    currentQuarter: 'Q1 2025',
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const navSections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Compass,
      path: `/eos/${programId}`,
      items: null,
    },
    {
      id: 'vision',
      label: 'Vision',
      icon: Mountain,
      items: [
        { id: 'vto', label: 'V/TO', path: `/eos/${programId}/vto`, icon: FileText },
        { id: 'core-values', label: 'Core Values', path: `/eos/${programId}/core-values`, icon: Star },
        { id: 'core-focus', label: 'Core Focus', path: `/eos/${programId}/core-focus`, icon: Target },
        { id: 'ten-year', label: '10-Year Target', path: `/eos/${programId}/ten-year`, icon: TrendingUp },
        { id: 'three-year', label: '3-Year Picture', path: `/eos/${programId}/three-year`, icon: Layers },
        { id: 'one-year', label: '1-Year Plan', path: `/eos/${programId}/one-year`, icon: Calendar },
      ],
    },
    {
      id: 'traction',
      label: 'Traction',
      icon: Target,
      items: [
        { id: 'rocks', label: 'Rocks', path: `/eos/${programId}/rocks`, icon: Mountain },
        { id: 'scorecard', label: 'Scorecard', path: `/eos/${programId}/scorecard`, icon: BarChart3 },
        { id: 'issues', label: 'Issues List', path: `/eos/${programId}/issues`, icon: AlertTriangle },
        { id: 'todos', label: 'To-Dos', path: `/eos/${programId}/todos`, icon: CheckSquare },
      ],
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: Calendar,
      items: [
        { id: 'l10', label: 'Level 10 (Weekly)', path: `/eos/${programId}/l10`, icon: Clock },
        { id: 'quarterly', label: 'Quarterly Sessions', path: `/eos/${programId}/quarterly`, icon: Repeat },
        { id: 'annual', label: 'Annual Planning', path: `/eos/${programId}/annual`, icon: Calendar },
      ],
    },
    {
      id: 'people',
      label: 'People',
      icon: Users,
      items: [
        { id: 'accountability', label: 'Accountability Chart', path: `/eos/${programId}/accountability`, icon: Users },
        { id: 'people-analyzer', label: 'People Analyzer', path: `/eos/${programId}/people-analyzer`, icon: UserCheck },
      ],
    },
    {
      id: 'process',
      label: 'Process',
      icon: Layers,
      path: `/eos/${programId}/process`,
      items: null,
    },
    {
      id: 'guide',
      label: 'EOS Guide',
      icon: BookOpen,
      path: `/eos/${programId}/guide`,
      items: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: `/eos/${programId}/settings`,
      items: null,
    },
  ];

  const isActive = (path) => location.pathname === path;
  const isParentActive = (items) => items?.some(item => location.pathname === item.path);

  return (
    <div className="min-h-screen flex">
      {/* Black Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <button 
            onClick={() => navigate('/eos')}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Programs
          </button>
          <h2 className="font-semibold truncate">{program.name}</h2>
          <p className="text-xs text-gray-400">{program.entityName}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded">{program.phase}</span>
            <span className="text-xs text-gray-400">{program.currentQuarter}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navSections.map((section) => (
            <div key={section.id} className="mb-1">
              {section.items ? (
                <>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 text-sm",
                      isParentActive(section.items) ? "text-white bg-gray-800" : "text-gray-300 hover:text-white hover:bg-gray-800"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <section.icon className="w-4 h-4" />
                      <span>{section.label}</span>
                    </div>
                    {expandedSections.includes(section.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.includes(section.id) && (
                    <div className="ml-4 border-l border-gray-700">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => navigate(item.path)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 text-sm",
                            isActive(item.path) 
                              ? "text-white bg-[#047857]" 
                              : "text-gray-400 hover:text-white hover:bg-gray-800"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => navigate(section.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 text-sm",
                    isActive(section.path) 
                      ? "text-white bg-[#047857]" 
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-500">
            <p>EOS® Implementation</p>
            <p className="mt-1">Powered by AtlasDev</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default EOSDetailLayout;
