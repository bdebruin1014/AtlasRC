import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Settings, Target, Calendar, Users, BarChart3, AlertTriangle, 
  FileText, Eye, Compass, Mountain, Clock, CheckSquare, TrendingUp, 
  BookOpen, Zap, Award, ChevronRight, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import sub-components
import EOSDashboard from './components/EOSDashboard';
import EOSVisionTraction from './components/EOSVisionTraction';
import EOSRocks from './components/EOSRocks';
import EOSL10Meeting from './components/EOSL10Meeting';
import EOSScorecard from './components/EOSScorecard';
import EOSIssuesList from './components/EOSIssuesList';
import EOSAccountabilityChart from './components/EOSAccountabilityChart';
import EOSAnnualPlanning from './components/EOSAnnualPlanning';
import EOSQuarterlyPlanning from './components/EOSQuarterlyPlanning';
import EOSMeetingPulse from './components/EOSMeetingPulse';
import EOSProcesses from './components/EOSProcesses';
import EOSGuide from './components/EOSGuide';

const EOSDetailPage = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock program data - would come from API
  const program = {
    id: programId || 'eos-1',
    name: 'VanRock Holdings EOS',
    entityName: 'VanRock Holdings LLC',
    status: 'active',
    implementationDate: '2024-01-15',
    currentQuarter: 'Q1 2025',
    phase: 'Traction',
    integrator: 'Bryan VanRock',
    visionary: 'Bryan VanRock',
  };

  const sidebarSections = [
    { 
      id: 'overview', 
      label: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'guide', label: 'EOS Guide', icon: BookOpen },
      ]
    },
    { 
      id: 'foundation', 
      label: 'FOUNDATION',
      items: [
        { id: 'vision', label: 'Vision/Traction Organizer', icon: Compass },
        { id: 'accountability', label: 'Accountability Chart', icon: Users },
        { id: 'processes', label: 'Core Processes', icon: Zap },
      ]
    },
    { 
      id: 'execution', 
      label: 'EXECUTION',
      items: [
        { id: 'rocks', label: 'Rocks', icon: Mountain },
        { id: 'scorecard', label: 'Scorecard', icon: TrendingUp },
        { id: 'issues', label: 'Issues List', icon: AlertTriangle },
      ]
    },
    { 
      id: 'meetings', 
      label: 'MEETING PULSE',
      items: [
        { id: 'l10', label: 'Level 10 Meeting', icon: Clock },
        { id: 'pulse', label: 'Meeting History', icon: Calendar },
      ]
    },
    { 
      id: 'planning', 
      label: 'PLANNING',
      items: [
        { id: 'quarterly', label: 'Quarterly Planning', icon: Target },
        { id: 'annual', label: 'Annual Planning', icon: Award },
      ]
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <EOSDashboard program={program} />;
      case 'guide': return <EOSGuide />;
      case 'vision': return <EOSVisionTraction program={program} />;
      case 'accountability': return <EOSAccountabilityChart program={program} />;
      case 'processes': return <EOSProcesses program={program} />;
      case 'rocks': return <EOSRocks program={program} />;
      case 'scorecard': return <EOSScorecard program={program} />;
      case 'issues': return <EOSIssuesList program={program} />;
      case 'l10': return <EOSL10Meeting program={program} />;
      case 'pulse': return <EOSMeetingPulse program={program} />;
      case 'quarterly': return <EOSQuarterlyPlanning program={program} />;
      case 'annual': return <EOSAnnualPlanning program={program} />;
      default: return <EOSDashboard program={program} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Black Sidebar */}
      <div className={cn(
        "bg-gray-900 text-white flex flex-col transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <button 
            onClick={() => navigate('/eos')}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            {!sidebarCollapsed && <span>All Programs</span>}
          </button>
          {!sidebarCollapsed && (
            <div>
              <h2 className="font-semibold text-lg truncate">{program.name}</h2>
              <p className="text-xs text-gray-400">{program.entityName}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {sidebarSections.map((section) => (
            <div key={section.id} className="mb-4">
              {!sidebarCollapsed && (
                <p className="px-4 text-xs font-semibold text-gray-500 mb-2">{section.label}</p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                      isActive 
                        ? "bg-[#047857] text-white" 
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Quick Actions */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-700">
            <Button 
              className="w-full bg-[#047857] hover:bg-[#065f46] mb-2"
              onClick={() => setActiveSection('l10')}
            >
              <Play className="w-4 h-4 mr-2" />
              Start L10 Meeting
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Next: Jan 2, 2025 at 9:00 AM
            </p>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-3 border-t border-gray-700 text-gray-400 hover:text-white flex items-center justify-center"
        >
          <ChevronRight className={cn("w-4 h-4 transition-transform", sidebarCollapsed ? "" : "rotate-180")} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default EOSDetailPage;
