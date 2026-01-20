import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, ArrowRight, Building2, Calendar, 
  Search, Plus, Filter
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Mock Data (Duplicated for independence) ---

const ENTITY_DATA = {
  1: {
    id: 1,
    name: 'AtlasDev',
    type: 'Corporation',
    fiscalYearEnd: 'December 31',
    projects: [
      { id: 101, name: 'Highland Park Lofts', location: 'Los Angeles, CA', status: 'Construction', budget: 4500000, spent: 2925000, completion: 65 },
      { id: 102, name: 'Riverside Commercial', location: 'Austin, TX', status: 'Planning', budget: 12200000, spent: 1830000, completion: 15 },
      { id: 103, name: 'The Addington', location: 'Seattle, WA', status: 'Permitting', budget: 8100000, spent: 2430000, completion: 30 },
      { id: 104, name: 'Oakwood Residencies', location: 'Nashville, TN', status: 'Construction', budget: 3200000, spent: 2720000, completion: 85 },
    ]
  },
  2: {
    id: 2,
    name: 'Sunset Development LLC',
    type: 'LLC',
    fiscalYearEnd: 'December 31',
    projects: [
       { id: 201, name: 'Sunset Blvd Retail', location: 'Hollywood, CA', status: 'Planning', budget: 5500000, spent: 125000, completion: 5 },
    ]
  }
};

const DEFAULT_ENTITY = {
  name: 'Unknown Entity',
  type: 'N/A',
  fiscalYearEnd: 'N/A',
  projects: []
};

const formatCurrency = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const EntityProjectsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const entity = ENTITY_DATA[entityId] || { ...DEFAULT_ENTITY, name: `Entity #${entityId}` };

  return (
    <>
      <Helmet>
        <title>Projects - {entity.name} | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#F7FAFC] overflow-hidden">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
          <div className="max-w-[1600px] mx-auto">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                   <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(`/accounting/${entityId}/dashboard`)}
                      className="text-gray-500 hover:text-gray-900 -ml-2"
                   >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                   </Button>
                </div>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                      <Building2 className="w-6 h-6" />
                   </div>
                   <div>
                      <h1 className="text-2xl font-bold text-gray-900 leading-none">{entity.name} Projects</h1>
                      <p className="text-sm text-gray-500 mt-1">Manage and track all active development projects</p>
                   </div>
                </div>
                <Button className="bg-[#2F855A] hover:bg-[#276749] text-white">
                   <Plus className="w-4 h-4 mr-2" /> Create New Project
                </Button>
             </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
           <div className="max-w-[1600px] mx-auto space-y-6">
              
             {/* Search and Filter Toolbar */}
             <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative w-96">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                     type="text" 
                     placeholder="Search projects by name..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                   />
                </div>
                <div className="flex items-center gap-3">
                   <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" /> Filter
                   </Button>
                   <Button variant="outline" size="sm">
                      Export List
                   </Button>
                </div>
             </div>

             {/* Projects Table */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                          <tr>
                             <th className="px-6 py-4">Project Name</th>
                             <th className="px-6 py-4">Location</th>
                             <th className="px-6 py-4">Status</th>
                             <th className="px-6 py-4 text-right">Budget</th>
                             <th className="px-6 py-4 text-right">Spent</th>
                             <th className="px-6 py-4 text-right">Progress</th>
                             <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {entity.projects.length > 0 ? entity.projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((project) => (
                             <tr key={project.id} className="hover:bg-gray-50/60 transition-colors group">
                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                   <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                      <Building2 className="w-5 h-5" />
                                   </div>
                                   <div className="flex flex-col">
                                     <span>{project.name}</span>
                                     <span className="text-xs text-gray-400 font-normal">ID: #{project.id}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{project.location}</td>
                                <td className="px-6 py-4">
                                   <Badge variant="secondary" className={cn(
                                      "font-normal border px-2.5 py-0.5",
                                      project.status === 'Construction' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                      project.status === 'Planning' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                      "bg-gray-50 text-gray-600 border-gray-100"
                                   )}>
                                      {project.status}
                                   </Badge>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-gray-600">{formatCurrency(project.budget)}</td>
                                <td className="px-6 py-4 text-right font-mono text-gray-600">{formatCurrency(project.spent)}</td>
                                <td className="px-6 py-4 text-right w-48">
                                   <div className="flex items-center justify-end gap-2">
                                      <span className="text-xs text-gray-500 w-8 text-right">{project.completion}%</span>
                                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                                         <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${project.completion}%` }}></div>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-emerald-600" onClick={() => navigate(`/project/${project.id}`)}>
                                      <ArrowRight className="w-4 h-4" />
                                   </Button>
                                </td>
                             </tr>
                          )) : (
                             <tr>
                                <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                                   <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                   <p className="text-lg font-medium text-gray-900">No projects found</p>
                                   <p className="mb-6">Get started by creating your first project for this entity.</p>
                                   <Button variant="outline" className="text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50">Create Project</Button>
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
             </div>

           </div>
        </div>
      </div>
    </>
  );
};

export default EntityProjectsPage;