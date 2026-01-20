import React, { useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, X, FileText, Calculator, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProjectSidebar = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(['overview', 'finance']);
  const toggle = (id) => setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const sections = [
    { id: 'overview', label: 'General', items: [{ label: 'Basic Info', path: 'overview/basic-info' }, { label: 'Properties', path: 'overview/property' }, { label: 'Contacts', path: 'overview/contacts' }] },
    { id: 'finance', label: 'Finance', items: [{ label: 'Loans', path: 'finance/loans' }, { label: 'Pro Forma', path: 'finance/pro-forma' }] },
    { id: 'documents', label: 'Documents', path: 'documents', icon: FileText, isLink: true },
  ];
  return (
    <div className="w-44 bg-[#1e2a3a] flex flex-col h-full flex-shrink-0">
      <div className="p-3 border-b border-gray-700">
        <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-2"><ChevronLeft className="w-3 h-3" />Back to Projects</button>
        <span className="text-white font-medium text-sm">Project {projectId}</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((s) => s.isLink ? (
          <NavLink key={s.id} to={`/project/${projectId}/${s.path}`} className={({ isActive }) => cn("flex items-center gap-2 px-3 py-2 text-xs", isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5")}>
            {s.icon && <s.icon className="w-3.5 h-3.5" />}{s.label}
          </NavLink>
        ) : (
          <div key={s.id}>
            <button onClick={() => toggle(s.id)} className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5">
              <span>{s.label}</span>
              <ChevronDown className={cn("w-3 h-3", expanded.includes(s.id) ? "" : "-rotate-90")} />
            </button>
            {expanded.includes(s.id) && s.items && (
              <div className="bg-black/20">
                {s.items.map((item) => (
                  <NavLink key={item.path} to={`/project/${projectId}/${item.path}`} className={({ isActive }) => cn("block px-4 py-1.5 text-xs", isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5")}>{item.label}</NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};
export default ProjectSidebar;
