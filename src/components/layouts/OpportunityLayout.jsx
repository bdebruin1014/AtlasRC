import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import OpportunitySidebar from '@/components/OpportunitySidebar';

const OpportunityLayout = () => {
  const { opportunityId, section = 'overview', subsection = 'basic-info' } = useParams();

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar - Opportunity Navigation */}
      <OpportunitySidebar 
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

export default OpportunityLayout;
