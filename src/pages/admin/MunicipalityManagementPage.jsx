import React, { useState, useEffect } from 'react';
import { 
  MapPin, Plus, Edit2, Trash2, Save, X, DollarSign,
  Building, Search, Filter, Upload, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { getMunicipalities, getMunicipalityFees, createMunicipality } from '@/services/pricingService';
import { cn } from '@/lib/utils';

const FEE_TYPES = [
  { id: 'water_tap', name: 'Water Tap Fee', description: 'Connection to municipal water' },
  { id: 'water_sdf', name: 'Water System Development Fee', description: 'Water infrastructure' },
  { id: 'sewer_tap', name: 'Sewer Tap Fee', description: 'Connection to municipal sewer' },
  { id: 'sewer_sdf', name: 'Sewer System Development Fee', description: 'Sewer infrastructure' },
  { id: 'building_permit', name: 'Building Permit', description: 'Construction permit fees' },
  { id: 'impact_fee', name: 'Impact Fee', description: 'Development impact fees' },
  { id: 'meter_charge', name: 'Meter Charge', description: 'Utility meter installation' },
  { id: 'arc_review', name: 'Architectural Review Fee', description: 'Plan review fees' }
];

const MunicipalityManagementPage = () => {
  const { toast } = useToast();
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [newMunicipality, setNewMunicipality] = useState({
    municipality_code: '',
    municipality_name: '',
    county: '',
    state: 'NC'
  });

  useEffect(() => {
    loadMunicipalities();
  }, []);

  useEffect(() => {
    if (selectedMunicipality) {
      loadFees(selectedMunicipality.id);
    }
  }, [selectedMunicipality]);

  const loadMunicipalities = async () => {
    try {
      setLoading(true);
      const data = await getMunicipalities();
      setMunicipalities(data);
      if (data.length > 0 && !selectedMunicipality) {
        setSelectedMunicipality(data[0]);
      }
    } catch (error) {
      console.error('Error loading municipalities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load municipalities',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFees = async (municipalityId) => {
    try {
      const data = await getMunicipalityFees(municipalityId);
      setFees(data);
    } catch (error) {
      console.error('Error loading fees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load fee schedule',
        variant: 'destructive'
      });
    }
  };

  const handleAddMunicipality = async () => {
    try {
      if (!newMunicipality.municipality_name || !newMunicipality.county) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const municipality = await createMunicipality(newMunicipality);
      setMunicipalities([...municipalities, municipality]);
      setShowAddModal(false);
      setNewMunicipality({ municipality_code: '', municipality_name: '', county: '', state: 'NC' });
      
      toast({
        title: 'Success',
        description: 'Municipality added successfully'
      });
    } catch (error) {
      console.error('Error adding municipality:', error);
      toast({
        title: 'Error',
        description: 'Failed to add municipality',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const filteredMunicipalities = municipalities.filter(m =>
    m.municipality_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.county.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateTotalFees = () => {
    return fees.reduce((sum, fee) => sum + (parseFloat(fee.base_amount) || 0), 0);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading municipalities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Municipality Fee Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure tap fees, permits, and other jurisdiction-specific costs
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Municipality
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Municipality List */}
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Municipalities</CardTitle>
                <span className="text-sm text-gray-500">{municipalities.length} Total</span>
              </div>
              <div className="mt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search municipalities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredMunicipalities.map(municipality => (
                  <div
                    key={municipality.id}
                    className={cn(
                      "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                      selectedMunicipality?.id === municipality.id && "bg-green-50 border-l-4 border-l-green-600"
                    )}
                    onClick={() => setSelectedMunicipality(municipality)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{municipality.municipality_name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {municipality.county} County, {municipality.state}
                        </p>
                        {municipality.municipality_code && (
                          <p className="text-xs text-gray-400 mt-1">
                            Code: {municipality.municipality_code}
                          </p>
                        )}
                      </div>
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}

                {filteredMunicipalities.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No municipalities found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fee Schedule */}
        <div className="col-span-8">
          {selectedMunicipality ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Fee Schedule</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedMunicipality.municipality_name} • {selectedMunicipality.county} County, {selectedMunicipality.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Fees</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculateTotalFees())}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {FEE_TYPES.map(feeType => {
                    const existingFee = fees.find(f => f.fee_type === feeType.id);
                    const isEditing = editingFee === feeType.id;

                    return (
                      <div
                        key={feeType.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-green-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <h4 className="font-semibold text-gray-900">{feeType.name}</h4>
                            </div>
                            <p className="text-sm text-gray-500 ml-6">{feeType.description}</p>
                            
                            {isEditing ? (
                              <div className="mt-3 ml-6 flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Enter amount"
                                  defaultValue={existingFee?.base_amount || ''}
                                  className="w-40"
                                />
                                <select className="border rounded-md px-3 py-2">
                                  <option value="fixed">Fixed</option>
                                  <option value="per_sqft">Per Sq Ft</option>
                                  <option value="percentage">Percentage</option>
                                </select>
                                <Button size="sm" variant="ghost">
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setEditingFee(null)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="mt-2 ml-6 flex items-center justify-between">
                                <div>
                                  {existingFee ? (
                                    <>
                                      <span className="text-lg font-bold text-green-700">
                                        {formatCurrency(existingFee.base_amount)}
                                      </span>
                                      <span className="text-sm text-gray-500 ml-2">
                                        ({existingFee.calculation_method})
                                      </span>
                                      {existingFee.notes && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {existingFee.notes}
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-sm text-gray-400 italic">Not configured</span>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingFee(feeType.id)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fee History */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Fee History</h4>
                  <p className="text-sm text-gray-500">
                    Historical fee changes will appear here when fees are updated
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Municipality
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Choose a municipality from the list to view and manage its fee schedule
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Municipality
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Municipality Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Municipality</DialogTitle>
            <DialogDescription>
              Add a new jurisdiction to configure fee schedules
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Municipality Name *
              </label>
              <Input
                placeholder="e.g., City of Charlotte"
                value={newMunicipality.municipality_name}
                onChange={(e) => setNewMunicipality({
                  ...newMunicipality,
                  municipality_name: e.target.value
                })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Municipality Code
              </label>
              <Input
                placeholder="e.g., CLT"
                value={newMunicipality.municipality_code}
                onChange={(e) => setNewMunicipality({
                  ...newMunicipality,
                  municipality_code: e.target.value.toUpperCase()
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  County *
                </label>
                <Input
                  placeholder="e.g., Mecklenburg"
                  value={newMunicipality.county}
                  onChange={(e) => setNewMunicipality({
                    ...newMunicipality,
                    county: e.target.value
                  })}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  State *
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={newMunicipality.state}
                  onChange={(e) => setNewMunicipality({
                    ...newMunicipality,
                    state: e.target.value
                  })}
                >
                  <option value="NC">North Carolina</option>
                  <option value="SC">South Carolina</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMunicipality} className="bg-green-600 hover:bg-green-700">
              Add Municipality
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MunicipalityManagementPage;
