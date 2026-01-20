import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Building2, Search, Plus, Filter, MoreHorizontal, 
  FileText, Briefcase, Users, DollarSign, Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const EntitiesListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Mock Entities Data
  const [entities] = useState([
    {
      id: 1,
      name: "Atlas Development Group, LLC",
      type: "LLC",
      ein: "82-3392811",
      state: "California",
      formationDate: "2018-04-12",
      status: "Active",
      members: 3,
      assets: 12,
      manager: "John Smith"
    },
    {
      id: 2,
      name: "Atlas Construction Services, Inc.",
      type: "C-Corp",
      ein: "93-1102933",
      state: "Nevada",
      formationDate: "2019-01-15",
      status: "Active",
      members: 5,
      assets: 4,
      manager: "Sarah Johnson"
    },
    {
      id: 3,
      name: "ADG Oakwood Project, LP",
      type: "LP",
      ein: "44-2291002",
      state: "Delaware",
      formationDate: "2023-06-01",
      status: "Active",
      members: 12,
      assets: 1,
      manager: "Atlas Development Group, LLC"
    },
    {
      id: 4,
      name: "Highland Park Ventures, LLC",
      type: "LLC",
      ein: "22-9938110",
      state: "Texas",
      formationDate: "2022-11-20",
      status: "Active",
      members: 4,
      assets: 2,
      manager: "Mike Ross"
    },
    {
      id: 5,
      name: "Lakeside Development Partners",
      type: "Joint Venture",
      ein: "55-1129330",
      state: "Florida",
      formationDate: "2021-03-10",
      status: "Dissolved",
      members: 2,
      assets: 0,
      manager: "Jane Doe"
    }
  ]);

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          entity.ein.includes(searchQuery);
    const matchesType = typeFilter === 'All' || entity.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <Helmet>
        <title>Entities Management | AtlasDev</title>
      </Helmet>

      <div className="flex flex-col h-full w-full bg-[#F7FAFC]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
          <div className="max-w-[1600px] mx-auto">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700">
                      <Building2 className="w-6 h-6" />
                   </div>
                   <div>
                      <h1 className="text-2xl font-bold text-gray-900 leading-none">Legal Entities</h1>
                      <p className="text-sm text-gray-500 mt-1">Manage corporate structures, EINs, and formations</p>
                   </div>
                </div>
                <Button className="bg-[#2F855A] hover:bg-[#276749] text-white">
                   <Plus className="w-4 h-4 mr-2" /> New Entity
                </Button>
             </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
           <div className="max-w-[1600px] mx-auto space-y-6">
              
             {/* Search Toolbar */}
             <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative w-96">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                     type="text" 
                     placeholder="Search by name or EIN..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                   />
                </div>
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <select 
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="All">All Types</option>
                        <option value="LLC">LLC</option>
                        <option value="C-Corp">C-Corp</option>
                        <option value="LP">LP</option>
                        <option value="Joint Venture">Joint Venture</option>
                      </select>
                      <Filter className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                   </div>
                   <Button variant="outline" size="sm">
                      Export List
                   </Button>
                </div>
             </div>

             {/* Entities Grid */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                       <tr>
                          <th className="px-6 py-4">Entity Name</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4">EIN / Tax ID</th>
                          <th className="px-6 py-4">State / Formation</th>
                          <th className="px-6 py-4">Manager</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {filteredEntities.map((entity) => (
                          <tr key={entity.id} className="hover:bg-gray-50/60 transition-colors group">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                      {entity.name.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="font-semibold text-gray-900">{entity.name}</p>
                                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                         <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {entity.assets} Assets</span>
                                         <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                         <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {entity.members} Members</span>
                                      </div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-gray-600">
                                <Badge variant="outline" className="font-normal bg-gray-50">{entity.type}</Badge>
                             </td>
                             <td className="px-6 py-4 font-mono text-gray-600">{entity.ein}</td>
                             <td className="px-6 py-4 text-gray-600">
                                <div className="flex flex-col">
                                   <span className="font-medium text-gray-900">{entity.state}</span>
                                   <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                      <Calendar className="w-3 h-3" /> {entity.formationDate}
                                   </span>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-gray-600">{entity.manager}</td>
                             <td className="px-6 py-4">
                                <Badge className={cn(
                                   "font-normal",
                                   entity.status === 'Active' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                                )}>
                                   {entity.status}
                                </Badge>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                         <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                      </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => navigate(`/accounting/${entity.id}/dashboard`)}>
                                         <DollarSign className="w-4 h-4 mr-2" /> View Accounting
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                         <FileText className="w-4 h-4 mr-2" /> Documents
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                         Archive Entity
                                      </DropdownMenuItem>
                                   </DropdownMenuContent>
                                </DropdownMenu>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {filteredEntities.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                       <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                       <p className="text-lg font-medium text-gray-900">No entities found</p>
                       <p>Try adjusting your search filters.</p>
                    </div>
                 )}
             </div>
           </div>
        </div>
      </div>
    </>
  );
};

export default EntitiesListPage;