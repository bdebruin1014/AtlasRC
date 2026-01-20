import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, ChevronLeft, Plus, Edit2, Trash2, Download, Upload, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  getMunicipalities,
  getMunicipalityFees,
  createMunicipality,
  updateMunicipalityFee
} from '@/services/pricingService';

const MunicipalityFeesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditFeeDialog, setShowEditFeeDialog] = useState(false);
  const [editingFee, setEditingFee] = useState(null);

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
      setMunicipalities(data || []);
      if (data && data.length > 0 && !selectedMunicipality) {
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
      const feeData = await getMunicipalityFees(municipalityId);
      setFees(feeData);
    } catch (error) {
      console.error('Error loading fees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load fee schedule',
        variant: 'destructive'
      });
    }
  };

  const handleAddMunicipality = async (formData) => {
    try {
      await createMunicipality(formData);
      toast({
        title: 'Success',
        description: 'Municipality added successfully'
      });
      setShowAddDialog(false);
      loadMunicipalities();
    } catch (error) {
      console.error('Error adding municipality:', error);
      toast({
        title: 'Error',
        description: 'Failed to add municipality',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateFee = async (feeType, newAmount) => {
    try {
      await updateMunicipalityFee(selectedMunicipality.id, feeType, parseFloat(newAmount));
      toast({
        title: 'Success',
        description: 'Fee updated successfully'
      });
      setShowEditFeeDialog(false);
      loadFees(selectedMunicipality.id);
    } catch (error) {
      console.error('Error updating fee:', error);
      toast({
        title: 'Error',
        description: 'Failed to update fee',
        variant: 'destructive'
      });
    }
  };

  const feeDefinitions = [
    { key: 'water_tap', label: 'Water Tap Fee', description: 'Connection to municipal water' },
    { key: 'sewer_tap', label: 'Sewer Tap Fee', description: 'Connection to municipal sewer' },
    { key: 'building_permit', label: 'Building Permit', description: 'Permit to construct' },
    { key: 'electrical_permit', label: 'Electrical Permit', description: 'Electrical work permit' },
    { key: 'plumbing_permit', label: 'Plumbing Permit', description: 'Plumbing work permit' },
    { key: 'mechanical_permit', label: 'Mechanical Permit', description: 'HVAC work permit' },
    { key: 'impact_fee', label: 'Impact Fee', description: 'Municipal impact fee' },
    { key: 'school_fee', label: 'School Fee', description: 'School system fee' },
    { key: 'park_fee', label: 'Park Fee', description: 'Parks and recreation fee' },
    { key: 'fire_inspection', label: 'Fire Inspection', description: 'Fire marshal inspection' },
    { key: 'other_fees', label: 'Other Fees', description: 'Miscellaneous municipal fees' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pricing')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-7 h-7 text-green-600" />
              Municipality Fee Schedules
            </h1>
            <p className="text-gray-500 mt-1">
              Manage tap fees, permits, and soft costs by jurisdiction
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Municipality
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Municipalities</p>
                <p className="text-2xl font-bold">{municipalities.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Charlotte Metro</p>
                <p className="text-2xl font-bold">
                  {municipalities.filter(m => m.market === 'charlotte').length}
                </p>
              </div>
              <Badge>NC</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Greenville Metro</p>
                <p className="text-2xl font-bold">
                  {municipalities.filter(m => m.market === 'greenville').length}
                </p>
              </div>
              <Badge>SC</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Fee Categories</p>
                <p className="text-2xl font-bold">{feeDefinitions.length}</p>
              </div>
              <Badge variant="outline">Types</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Municipality List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Municipalities</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {municipalities.map(muni => (
                <div
                  key={muni.id}
                  className={`p-3 cursor-pointer border-l-4 transition-colors ${
                    selectedMunicipality?.id === muni.id
                      ? 'bg-green-50 border-green-600'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedMunicipality(muni)}
                >
                  <div className="font-semibold text-sm">{muni.municipality_name}</div>
                  <div className="text-xs text-gray-500">
                    {muni.county} County, {muni.state}
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs capitalize">
                    {muni.market}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Schedule */}
        <Card className="lg:col-span-3">
          {selectedMunicipality ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedMunicipality.municipality_name} Fee Schedule</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedMunicipality.county} County, {selectedMunicipality.state} • {selectedMunicipality.market.toUpperCase()} Market
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Effective: {fees?.effective_date || 'Current'}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feeDefinitions.map(def => {
                    const amount = fees?.[def.key] || 0;
                    return (
                      <div
                        key={def.key}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{def.label}</div>
                          <div className="text-xs text-gray-500">{def.description}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right min-w-[120px]">
                            <span className="text-lg font-bold">${amount.toLocaleString()}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingFee({ type: def.key, label: def.label, amount });
                              setShowEditFeeDialog(true);
                            }}
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Total */}
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-lg">Total Municipal Fees</div>
                      <div className="text-2xl font-bold text-green-700">
                        ${Object.values(fees || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Typical total for Category 5 (Soft Costs) - actual may vary by project
                    </p>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Select a municipality to view fee schedule</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Add Municipality Dialog */}
      <AddMunicipalityDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={handleAddMunicipality}
      />

      {/* Edit Fee Dialog */}
      {editingFee && (
        <EditFeeDialog
          open={showEditFeeDialog}
          onClose={() => {
            setShowEditFeeDialog(false);
            setEditingFee(null);
          }}
          fee={editingFee}
          onSave={(amount) => handleUpdateFee(editingFee.type, amount)}
        />
      )}
    </div>
  );
};

// Add Municipality Dialog Component
const AddMunicipalityDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    municipality_name: '',
    county: '',
    state: 'NC',
    market: 'charlotte'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ municipality_name: '', county: '', state: 'NC', market: 'charlotte' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Municipality</DialogTitle>
          <DialogDescription>
            Add a new municipality to track fee schedules
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Municipality Name *</Label>
              <Input
                id="name"
                value={formData.municipality_name}
                onChange={(e) => setFormData({ ...formData, municipality_name: e.target.value })}
                placeholder="e.g., Charlotte"
                required
              />
            </div>
            <div>
              <Label htmlFor="county">County *</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                placeholder="e.g., Mecklenburg"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <select
                id="state"
                className="w-full border rounded-md p-2"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              >
                <option value="NC">North Carolina</option>
                <option value="SC">South Carolina</option>
              </select>
            </div>
            <div>
              <Label htmlFor="market">Market *</Label>
              <select
                id="market"
                className="w-full border rounded-md p-2"
                value={formData.market}
                onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                required
              >
                <option value="charlotte">Charlotte Metro</option>
                <option value="greenville">Greenville Metro</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Municipality</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Fee Dialog Component
const EditFeeDialog = ({ open, onClose, fee, onSave }) => {
  const [amount, setAmount] = useState(fee.amount);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {fee.label}</DialogTitle>
          <DialogDescription>
            Update the fee amount for this municipality
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="amount">Amount ($) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MunicipalityFeesPage;
