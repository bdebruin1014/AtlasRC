import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import ProjectSidebar from '@/components/ProjectSidebar';

const ProjectLayout = () => {
  const { projectId, section = 'overview', subsection = 'basic-info' } = useParams();

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar - Project Navigation */}
      <ProjectSidebar 
        currentSection={section} 
        currentSubsection={subsection} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProjectLayout;
