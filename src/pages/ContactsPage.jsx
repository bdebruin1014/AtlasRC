// src/pages/ContactsPage.jsx
// Enhanced Contacts Management - Qualia-style

import React, { useState, useEffect } from 'react';
import {
  Building2, Users, User, ChevronDown, ChevronRight, Search, Plus,
  Phone, Mail, MapPin, MoreHorizontal, Filter, X, Edit, Trash2,
  Briefcase, Home, UserCheck, Building, Landmark, Wrench, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  COMPANY_CATEGORIES, EMPLOYEE_ROLES, PROJECT_CONTACT_ROLES,
  getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany,
  getEmployees, createEmployee, getAllBuyers, getAllSellers,
} from '@/services/contactsService';

const ContactsPage = () => {
  const [activeSection, setActiveSection] = useState('companies');
  const [activeType, setActiveType] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({ CLOSING: true });
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [companyForm, setCompanyForm] = useState({ name: '', company_type: '', phone: '', email: '', address: '', city: '', state: '', zip_code: '', notes: '' });
  const [employeeForm, setEmployeeForm] = useState({ first_name: '', last_name: '', job_title: '', email: '', work_phone: '', cell_phone: '', company_id: '' });

  useEffect(() => { loadData(); }, [activeSection, activeType]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeSection === 'companies') {
        const filters = activeType ? { type: activeType } : {};
        if (searchTerm) filters.search = searchTerm;
        setCompanies(await getCompanies(filters) || []);
      } else if (activeSection === 'employees') {
        setEmployees(await getEmployees(searchTerm ? { search: searchTerm } : {}) || []);
      } else if (activeSection === 'buyers') { setBuyers(await getAllBuyers() || []); }
      else if (activeSection === 'sellers') { setSellers(await getAllSellers() || []); }
    } catch (error) { console.error('Error loading data:', error); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { setSearchTerm(e.target.value); setTimeout(() => loadData(), 300); };
  const toggleCategory = (category) => { setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] })); };
  const selectType = (category, type) => { setActiveSection('companies'); setActiveType(type); };
  const viewCompanyDetails = async (companyId) => { setSelectedCompany(await getCompanyById(companyId)); };

  const handleSaveCompany = async () => {
    if (editingCompany) await updateCompany(editingCompany.id, companyForm);
    else await createCompany(companyForm);
    setShowCompanyModal(false); setCompanyForm({ name: '', company_type: '', phone: '', email: '', address: '', city: '', state: '', zip_code: '', notes: '' });
    setEditingCompany(null); loadData();
  };

  const handleSaveEmployee = async () => {
    await createEmployee(employeeForm);
    setShowEmployeeModal(false); setEmployeeForm({ first_name: '', last_name: '', job_title: '', email: '', work_phone: '', cell_phone: '', company_id: '' });
    if (selectedCompany) viewCompanyDetails(selectedCompany.id); loadData();
  };

  const openNewCompanyModal = (type = null) => { setEditingCompany(null); setCompanyForm({ name: '', company_type: type || '', phone: '', email: '', address: '', city: '', state: '', zip_code: '', notes: '' }); setShowCompanyModal(true); };
  const openNewEmployeeModal = (companyId = null) => { setEditingEmployee(null); setEmployeeForm({ first_name: '', last_name: '', job_title: '', email: '', work_phone: '', cell_phone: '', company_id: companyId || '' }); setShowEmployeeModal(true); };

  const getCategoryIcon = (category) => ({ CLOSING: FileText, PAYOFFS: Landmark, SERVICES: Wrench, GOVERNMENT: Building, OTHER: Building2 }[category] || Building2);
  const getTypeLabel = (type) => { for (const cat of Object.values(COMPANY_CATEGORIES)) { const found = cat.types.find(t => t.value === type); if (found) return found.label; } return type; };

  const renderSidebar = () => (
    <div className="w-64 bg-slate-800 text-white h-full overflow-y-auto">
      <div className="p-3 border-b border-slate-700">
        <button className={cn("flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left", activeSection === 'companies' && !activeType ? "bg-slate-700" : "hover:bg-slate-700")} onClick={() => { setActiveSection('companies'); setActiveType(null); setSelectedCompany(null); }}>
          <Building2 className="w-4 h-4" /><span className="font-medium">Companies</span>
        </button>
      </div>
      <div className="py-2">
        {Object.entries(COMPANY_CATEGORIES).map(([key, category]) => {
          const Icon = getCategoryIcon(key);
          return (
            <div key={key}>
              <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-700" onClick={() => toggleCategory(key)}>
                {expandedCategories[key] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <Icon className="w-4 h-4" /><span>{category.label}</span>
              </button>
              {expandedCategories[key] && (
                <div className="ml-6 border-l border-slate-600">
                  {category.types.map((type) => (
                    <button key={type.value} className={cn("block w-full px-4 py-1.5 text-sm text-left hover:bg-slate-700", activeType === type.value && "bg-slate-700 text-emerald-400")} onClick={() => selectType(key, type.value)}>{type.label}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-slate-700">
        <button className={cn("flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left", activeSection === 'employees' ? "bg-slate-700" : "hover:bg-slate-700")} onClick={() => { setActiveSection('employees'); setActiveType(null); setSelectedCompany(null); }}>
          <Users className="w-4 h-4" /><span className="font-medium">Employees</span>
        </button>
      </div>
      <div className="p-3 border-t border-slate-700">
        <div className="px-3 py-2 text-sm font-medium text-slate-400">Other Contacts</div>
        <button className={cn("flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-sm", activeSection === 'buyers' ? "bg-slate-700" : "hover:bg-slate-700")} onClick={() => { setActiveSection('buyers'); setActiveType(null); setSelectedCompany(null); }}><UserCheck className="w-4 h-4" /><span>Buyers</span></button>
        <button className={cn("flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-sm", activeSection === 'sellers' ? "bg-slate-700" : "hover:bg-slate-700")} onClick={() => { setActiveSection('sellers'); setActiveType(null); setSelectedCompany(null); }}><Home className="w-4 h-4" /><span>Sellers</span></button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (selectedCompany) return renderCompanyDetail();
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{activeSection === 'companies' ? (activeType ? getTypeLabel(activeType) : 'All Companies') : activeSection === 'employees' ? 'All Employees' : activeSection === 'buyers' ? 'Buyers' : 'Sellers'}</h1>
          <div className="flex items-center gap-3">
            {activeSection === 'companies' && <Button onClick={() => openNewCompanyModal(activeType)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />New Company</Button>}
            {activeSection === 'employees' && <Button onClick={() => openNewEmployeeModal()} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />New Employee</Button>}
          </div>
        </div>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
        </div>
        {loading ? <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div> : (
          <>
            {activeSection === 'companies' && renderCompaniesTable()}
            {activeSection === 'employees' && renderEmployeesTable()}
            {activeSection === 'buyers' && renderBuyersTable()}
            {activeSection === 'sellers' && renderSellersTable()}
          </>
        )}
      </div>
    );
  };

  const renderCompaniesTable = () => (
    <Card><CardContent className="p-0">
      <table className="w-full">
        <thead className="bg-gray-50 border-b"><tr><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Name</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Type</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Address</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Phone</th><th className="w-20"></th></tr></thead>
        <tbody className="divide-y">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => viewCompanyDetails(company.id)}>
              <td className="px-4 py-3 font-medium">{company.name}</td>
              <td className="px-4 py-3"><Badge variant="outline">{getTypeLabel(company.company_type)}</Badge></td>
              <td className="px-4 py-3 text-sm text-gray-600">{company.address ? `${company.address}, ${company.city}, ${company.state} ${company.zip_code}` : <span className="text-gray-400">Not set</span>}</td>
              <td className="px-4 py-3 text-sm">{company.phone || <span className="text-gray-400">Not set</span>}</td>
              <td className="px-4 py-3">
                <DropdownMenu><DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}><Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingCompany(company); setCompanyForm(company); setShowCompanyModal(true); }}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); deleteCompany(company.id).then(loadData); }}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
          {companies.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500"><Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No companies found</p><Button variant="outline" className="mt-4" onClick={() => openNewCompanyModal(activeType)}>Add Company</Button></td></tr>}
        </tbody>
      </table>
    </CardContent></Card>
  );

  const renderEmployeesTable = () => (
    <Card><CardContent className="p-0">
      <table className="w-full">
        <thead className="bg-gray-50 border-b"><tr><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Name</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Job Title</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Company</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Phone</th></tr></thead>
        <tbody className="divide-y">
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{emp.first_name} {emp.last_name}</td>
              <td className="px-4 py-3 text-sm">{emp.job_title || <span className="text-gray-400">Not set</span>}</td>
              <td className="px-4 py-3 text-sm">{emp.company?.name ? <button className="text-emerald-600 hover:underline" onClick={() => viewCompanyDetails(emp.company.id)}>{emp.company.name}</button> : <span className="text-gray-400">Not set</span>}</td>
              <td className="px-4 py-3 text-sm">{emp.email || <span className="text-gray-400">Not set</span>}</td>
              <td className="px-4 py-3 text-sm">{emp.work_phone || emp.cell_phone || <span className="text-gray-400">Not set</span>}</td>
            </tr>
          ))}
          {employees.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500"><Users className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No employees found</p></td></tr>}
        </tbody>
      </table>
    </CardContent></Card>
  );

  const renderBuyersTable = () => (
    <Card><CardContent className="p-0">
      <table className="w-full">
        <thead className="bg-gray-50 border-b"><tr><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Name</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Project</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Phone</th></tr></thead>
        <tbody className="divide-y">
          {buyers.map((buyer) => (<tr key={buyer.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{buyer.contact?.first_name} {buyer.contact?.last_name}</td><td className="px-4 py-3 text-sm text-emerald-600">{buyer.project?.name}</td><td className="px-4 py-3 text-sm">{buyer.contact?.email || <span className="text-gray-400">Not set</span>}</td><td className="px-4 py-3 text-sm">{buyer.contact?.phone || <span className="text-gray-400">Not set</span>}</td></tr>))}
          {buyers.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500"><UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No buyers found</p></td></tr>}
        </tbody>
      </table>
    </CardContent></Card>
  );

  const renderSellersTable = () => (
    <Card><CardContent className="p-0">
      <table className="w-full">
        <thead className="bg-gray-50 border-b"><tr><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Name</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Project</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Phone</th></tr></thead>
        <tbody className="divide-y">
          {sellers.map((seller) => (<tr key={seller.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{seller.contact?.first_name} {seller.contact?.last_name}</td><td className="px-4 py-3 text-sm text-emerald-600">{seller.project?.name}</td><td className="px-4 py-3 text-sm">{seller.contact?.email || <span className="text-gray-400">Not set</span>}</td><td className="px-4 py-3 text-sm">{seller.contact?.phone || <span className="text-gray-400">Not set</span>}</td></tr>))}
          {sellers.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500"><Home className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No sellers found</p></td></tr>}
        </tbody>
      </table>
    </CardContent></Card>
  );

  const renderCompanyDetail = () => (
    <div className="flex-1 p-6 overflow-auto">
      <div className="mb-6">
        <button className="text-sm text-gray-500 hover:text-gray-700 mb-2" onClick={() => setSelectedCompany(null)}>← Back to Companies</button>
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">{selectedCompany.name}</h1><Badge variant="outline" className="mt-1">{getTypeLabel(selectedCompany.company_type)}</Badge></div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEditingCompany(selectedCompany); setCompanyForm(selectedCompany); setShowCompanyModal(true); }}><Edit className="w-4 h-4 mr-2" />Edit</Button>
            <Button onClick={() => openNewEmployeeModal(selectedCompany.id)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />Add Employee</Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card><CardHeader><CardTitle className="text-lg">Contact Info</CardTitle></CardHeader><CardContent className="space-y-3">
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span>{selectedCompany.phone || 'Not set'}</span></div>
          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span>{selectedCompany.email || 'Not set'}</span></div>
          <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-400 mt-1" /><span>{selectedCompany.address ? <>{selectedCompany.address}<br/>{selectedCompany.city}, {selectedCompany.state} {selectedCompany.zip_code}</> : 'Not set'}</span></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Notes</CardTitle></CardHeader><CardContent><p className="text-gray-600">{selectedCompany.notes || 'No notes'}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-lg">Employees from {selectedCompany.name}</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Name</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Job Title</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Work Phone</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Cell Phone</th></tr></thead>
          <tbody className="divide-y">
            {selectedCompany.employees?.map((emp) => (<tr key={emp.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{emp.first_name} {emp.last_name}</td><td className="px-4 py-3 text-sm">{emp.job_title || '-'}</td><td className="px-4 py-3 text-sm">{emp.email || '-'}</td><td className="px-4 py-3 text-sm">{emp.work_phone || '-'}</td><td className="px-4 py-3 text-sm">{emp.cell_phone || '-'}</td></tr>))}
            {(!selectedCompany.employees || selectedCompany.employees.length === 0) && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No employees yet</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-40px)] overflow-hidden">
      {renderSidebar()}
      {renderContent()}
      <Dialog open={showCompanyModal} onOpenChange={setShowCompanyModal}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editingCompany ? 'Edit Company' : 'New Company'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="block text-sm font-medium mb-1">Company Name *</label><input type="text" value={companyForm.name} onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="Enter company name" /></div>
            <div><label className="block text-sm font-medium mb-1">Type *</label><select value={companyForm.company_type} onChange={(e) => setCompanyForm(prev => ({ ...prev, company_type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg"><option value="">Select type...</option>{Object.entries(COMPANY_CATEGORIES).map(([key, cat]) => (<optgroup key={key} label={cat.label}>{cat.types.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}</optgroup>))}</select></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={companyForm.phone} onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={companyForm.email} onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div></div>
            <div><label className="block text-sm font-medium mb-1">Address</label><input type="text" value={companyForm.address} onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="grid grid-cols-3 gap-4"><div><label className="block text-sm font-medium mb-1">City</label><input type="text" value={companyForm.city} onChange={(e) => setCompanyForm(prev => ({ ...prev, city: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">State</label><input type="text" value={companyForm.state} onChange={(e) => setCompanyForm(prev => ({ ...prev, state: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">ZIP</label><input type="text" value={companyForm.zip_code} onChange={(e) => setCompanyForm(prev => ({ ...prev, zip_code: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div></div>
            <div><label className="block text-sm font-medium mb-1">Notes</label><textarea value={companyForm.notes} onChange={(e) => setCompanyForm(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCompanyModal(false)}>Cancel</Button><Button onClick={handleSaveCompany} className="bg-emerald-600 hover:bg-emerald-700">{editingCompany ? 'Save Changes' : 'Create Company'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editingEmployee ? 'Edit Employee' : 'New Employee'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">First Name *</label><input type="text" value={employeeForm.first_name} onChange={(e) => setEmployeeForm(prev => ({ ...prev, first_name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">Last Name *</label><input type="text" value={employeeForm.last_name} onChange={(e) => setEmployeeForm(prev => ({ ...prev, last_name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div></div>
            <div><label className="block text-sm font-medium mb-1">Company</label><select value={employeeForm.company_id} onChange={(e) => setEmployeeForm(prev => ({ ...prev, company_id: e.target.value }))} className="w-full px-3 py-2 border rounded-lg"><option value="">Select company...</option>{companies.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
            <div><label className="block text-sm font-medium mb-1">Job Title</label><select value={employeeForm.job_title} onChange={(e) => setEmployeeForm(prev => ({ ...prev, job_title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg"><option value="">Select role...</option>{EMPLOYEE_ROLES.map(role => (<option key={role.value} value={role.value}>{role.label}</option>))}</select></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Work Phone</label><input type="tel" value={employeeForm.work_phone} onChange={(e) => setEmployeeForm(prev => ({ ...prev, work_phone: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">Cell Phone</label><input type="tel" value={employeeForm.cell_phone} onChange={(e) => setEmployeeForm(prev => ({ ...prev, cell_phone: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowEmployeeModal(false)}>Cancel</Button><Button onClick={handleSaveEmployee} className="bg-emerald-600 hover:bg-emerald-700">{editingEmployee ? 'Save Changes' : 'Add Employee'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsPage;
