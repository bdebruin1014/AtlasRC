// src/pages/construction/SubcontractorsPage.jsx
// Subcontractor database with insurance and lien waiver tracking

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, Plus, Search, Filter, Building2, Phone, Mail,
  Shield, AlertTriangle, CheckCircle2, FileText, Calendar,
  MoreVertical, ChevronRight, Star, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  getSubcontractors,
  getExpiringInsurance,
  createSubcontractor,
  updateSubcontractor,
} from '@/services/constructionService';

const TRADES = [
  'General', 'Concrete', 'Framing', 'Roofing', 'Electrical', 'Plumbing',
  'HVAC', 'Drywall', 'Painting', 'Flooring', 'Cabinets', 'Countertops',
  'Landscaping', 'Excavation', 'Masonry', 'Insulation', 'Windows/Doors',
  'Siding', 'Gutters', 'Fencing', 'Other'
];

const SubcontractorsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subcontractors, setSubcontractors] = useState([]);
  const [expiringInsurance, setExpiringInsurance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  const showExpiring = searchParams.get('filter') === 'expiring';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsData, expiringData] = await Promise.all([
        getSubcontractors(),
        getExpiringInsurance(30),
      ]);
      setSubcontractors(subsData || []);
      setExpiringInsurance(expiringData || []);
    } catch (error) {
      console.error('Error loading subcontractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubs = subcontractors.filter(sub => {
    const matchesSearch = 
      sub.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTrade = tradeFilter === 'all' || sub.trade === tradeFilter;
    
    return matchesSearch && matchesTrade;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInsuranceStatus = (sub) => {
    const expiring = expiringInsurance.find(ei => ei.subcontractor_id === sub.id);
    if (expiring) {
      const daysUntil = Math.ceil((new Date(expiring.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 7) return { status: 'critical', label: `Expires in ${daysUntil} days`, color: 'bg-red-100 text-red-800' };
      if (daysUntil <= 30) return { status: 'warning', label: `Expires in ${daysUntil} days`, color: 'bg-yellow-100 text-yellow-800' };
    }
    return { status: 'valid', label: 'Current', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Subcontractors
          </h1>
          <p className="text-gray-500 mt-1">{subcontractors.length} total subcontractors</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Subcontractor
        </Button>
      </div>

      {/* Expiring Insurance Alert */}
      {expiringInsurance.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800">
                  {expiringInsurance.length} insurance certificate(s) expiring within 30 days
                </p>
                <p className="text-sm text-yellow-700">
                  Review and request updated certificates from subcontractors.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-yellow-400 text-yellow-800"
                onClick={() => navigate('/construction/subcontractors?filter=expiring')}
              >
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subcontractors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={tradeFilter}
          onChange={(e) => setTradeFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Trades</option>
          {TRADES.map((trade) => (
            <option key={trade} value={trade}>{trade}</option>
          ))}
        </select>
      </div>

      {/* Subcontractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubs.map((sub) => {
          const insuranceStatus = getInsuranceStatus(sub);
          return (
            <Card 
              key={sub.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedSub(sub)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{sub.company_name}</h3>
                      <p className="text-sm text-gray-500">{sub.trade}</p>
                    </div>
                  </div>
                  {sub.is_preferred && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {sub.contact && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{sub.contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{sub.contact.phone}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Badge className={insuranceStatus.color}>
                    <Shield className="w-3 h-3 mr-1" />
                    {insuranceStatus.label}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/construction/subcontractors/${sub.id}`);
                  }}>
                    Details <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSubs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No subcontractors found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Subcontractor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Subcontractor Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Subcontractor</DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            try {
              await createSubcontractor({
                company_name: formData.get('company_name'),
                trade: formData.get('trade'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                is_preferred: formData.get('is_preferred') === 'on',
              });
              setShowAddModal(false);
              loadData();
            } catch (error) {
              console.error('Error creating subcontractor:', error);
            }
          }}>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <input
                  name="company_name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Trade *</label>
                <select
                  name="trade"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TRADES.map((trade) => (
                    <option key={trade} value={trade}>{trade}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  name="address"
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="flex items-center gap-2">
                <input name="is_preferred" type="checkbox" className="rounded" />
                <span className="text-sm">Mark as Preferred Subcontractor</span>
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Subcontractor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubcontractorsPage;
