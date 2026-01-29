import React, { useState, useMemo } from 'react';
import {
  Building, Truck, Computer, Wrench, DollarSign, Calendar, Filter,
  Search, Plus, Edit, Trash2, Eye, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle, Clock, TrendingDown, Package, X, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const mockAssets = [
  {
    id: 'FA-001',
    name: 'Downtown Tower - Building',
    category: 'Buildings',
    subcategory: 'Commercial Property',
    location: 'Downtown Tower',
    acquisitionDate: '2019-03-15',
    acquisitionCost: 15500000.00,
    usefulLife: 39,
    salvageValue: 1550000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 1987179.49,
    netBookValue: 13512820.51,
    status: 'active',
    serialNumber: 'N/A',
    vendor: 'Previous Owner',
    poNumber: 'ACQ-2019-001',
    condition: 'good',
    lastInspection: '2023-12-15',
    insurancePolicy: 'POL-2024-DWT',
    notes: 'Primary commercial property asset'
  },
  {
    id: 'FA-002',
    name: 'Riverside Plaza - Building',
    category: 'Buildings',
    subcategory: 'Mixed-Use Property',
    location: 'Riverside Plaza',
    acquisitionDate: '2021-06-01',
    acquisitionCost: 22000000.00,
    usefulLife: 39,
    salvageValue: 2200000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 1448717.95,
    netBookValue: 20551282.05,
    status: 'active',
    serialNumber: 'N/A',
    vendor: 'RSP Developers',
    poNumber: 'ACQ-2021-002',
    condition: 'excellent',
    lastInspection: '2024-01-10',
    insurancePolicy: 'POL-2024-RSP',
    notes: 'Flagship mixed-use development'
  },
  {
    id: 'FA-003',
    name: 'HVAC System - Downtown Tower',
    category: 'Building Improvements',
    subcategory: 'HVAC Equipment',
    location: 'Downtown Tower',
    acquisitionDate: '2022-08-15',
    acquisitionCost: 485000.00,
    usefulLife: 15,
    salvageValue: 25000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 51111.11,
    netBookValue: 433888.89,
    status: 'active',
    serialNumber: 'HVAC-DWT-2022-A',
    vendor: 'HVAC Solutions Inc.',
    poNumber: 'PO-2022-0156',
    condition: 'excellent',
    lastInspection: '2024-01-05',
    insurancePolicy: 'POL-2024-DWT',
    notes: 'New rooftop units installed'
  },
  {
    id: 'FA-004',
    name: 'Elevator System - Riverside',
    category: 'Building Improvements',
    subcategory: 'Elevator Equipment',
    location: 'Riverside Plaza',
    acquisitionDate: '2021-06-01',
    acquisitionCost: 750000.00,
    usefulLife: 20,
    salvageValue: 50000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 91250.00,
    netBookValue: 658750.00,
    status: 'active',
    serialNumber: 'ELV-RSP-001-004',
    vendor: 'Otis Elevator',
    poNumber: 'ACQ-2021-002',
    condition: 'good',
    lastInspection: '2023-11-20',
    insurancePolicy: 'POL-2024-RSP',
    notes: '4 elevator system'
  },
  {
    id: 'FA-005',
    name: 'Company Vehicles Fleet',
    category: 'Vehicles',
    subcategory: 'Company Cars',
    location: 'Corporate HQ',
    acquisitionDate: '2023-01-10',
    acquisitionCost: 185000.00,
    usefulLife: 5,
    salvageValue: 35000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 30000.00,
    netBookValue: 155000.00,
    status: 'active',
    serialNumber: 'Various',
    vendor: 'Auto Fleet Inc.',
    poNumber: 'PO-2023-0012',
    condition: 'good',
    lastInspection: '2024-01-15',
    insurancePolicy: 'POL-2024-FLEET',
    notes: '5 company vehicles'
  },
  {
    id: 'FA-006',
    name: 'Office Furniture - HQ',
    category: 'Furniture & Fixtures',
    subcategory: 'Office Furniture',
    location: 'Corporate HQ',
    acquisitionDate: '2022-03-01',
    acquisitionCost: 125000.00,
    usefulLife: 7,
    salvageValue: 5000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 32857.14,
    netBookValue: 92142.86,
    status: 'active',
    serialNumber: 'N/A',
    vendor: 'Office Designs Co.',
    poNumber: 'PO-2022-0089',
    condition: 'good',
    lastInspection: 'N/A',
    insurancePolicy: 'POL-2024-HQ',
    notes: 'Executive and common area furniture'
  },
  {
    id: 'FA-007',
    name: 'Server Infrastructure',
    category: 'IT Equipment',
    subcategory: 'Servers',
    location: 'Corporate HQ',
    acquisitionDate: '2023-06-15',
    acquisitionCost: 95000.00,
    usefulLife: 5,
    salvageValue: 5000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 10500.00,
    netBookValue: 84500.00,
    status: 'active',
    serialNumber: 'SRV-2023-001-010',
    vendor: 'Dell Technologies',
    poNumber: 'PO-2023-0145',
    condition: 'excellent',
    lastInspection: '2024-01-20',
    insurancePolicy: 'POL-2024-IT',
    notes: 'Primary datacenter equipment'
  },
  {
    id: 'FA-008',
    name: 'Old Parking Structure',
    category: 'Buildings',
    subcategory: 'Parking Facility',
    location: 'Downtown Tower',
    acquisitionDate: '2015-08-01',
    acquisitionCost: 2500000.00,
    usefulLife: 30,
    salvageValue: 250000.00,
    depreciationMethod: 'Straight-Line',
    accumulatedDepreciation: 2500000.00,
    netBookValue: 0,
    status: 'disposed',
    serialNumber: 'N/A',
    vendor: 'Original Construction',
    poNumber: 'N/A',
    condition: 'disposed',
    lastInspection: 'N/A',
    insurancePolicy: 'N/A',
    notes: 'Demolished for new development',
    disposalDate: '2023-10-01',
    disposalAmount: 150000.00,
    disposalMethod: 'Demolition Sale'
  }
];

const categoryIcons = {
  'Buildings': Building,
  'Building Improvements': Wrench,
  'Vehicles': Truck,
  'Furniture & Fixtures': Package,
  'IT Equipment': Computer
};

const conditionConfig = {
  excellent: { label: 'Excellent', color: 'bg-green-100 text-green-800' },
  good: { label: 'Good', color: 'bg-blue-100 text-blue-800' },
  fair: { label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
  poor: { label: 'Poor', color: 'bg-red-100 text-red-800' },
  disposed: { label: 'Disposed', color: 'bg-gray-100 text-gray-800' }
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  disposed: { label: 'Disposed', color: 'bg-gray-100 text-gray-800' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
};

const depreciationMethods = [
  { value: 'Straight-Line', label: 'Straight-Line' },
  { value: 'Double-Declining', label: 'Double Declining Balance' },
  { value: 'Sum-of-Years', label: 'Sum of Years Digits' },
  { value: 'Units-of-Production', label: 'Units of Production' },
  { value: 'MACRS', label: 'MACRS (Tax)' },
];

const assetCategories = [
  { value: 'Buildings', label: 'Buildings', defaultLife: 39 },
  { value: 'Building Improvements', label: 'Building Improvements', defaultLife: 15 },
  { value: 'Vehicles', label: 'Vehicles', defaultLife: 5 },
  { value: 'Furniture & Fixtures', label: 'Furniture & Fixtures', defaultLife: 7 },
  { value: 'IT Equipment', label: 'IT Equipment', defaultLife: 5 },
  { value: 'Machinery', label: 'Machinery & Equipment', defaultLife: 7 },
  { value: 'Land', label: 'Land', defaultLife: 0 },
  { value: 'Leasehold Improvements', label: 'Leasehold Improvements', defaultLife: 15 },
];

const mockLocations = [
  'Corporate HQ',
  'Downtown Tower',
  'Riverside Plaza',
  'Warehouse A',
  'Branch Office',
];

// Asset Entry/Edit Modal Component
const AssetModal = ({ isOpen, onClose, asset, onSave }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEdit = !!asset;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    location: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionCost: '',
    usefulLife: '',
    salvageValue: '',
    depreciationMethod: 'Straight-Line',
    serialNumber: '',
    vendor: '',
    poNumber: '',
    condition: 'good',
    insurancePolicy: '',
    notes: '',
  });

  React.useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        category: asset.category || '',
        subcategory: asset.subcategory || '',
        location: asset.location || '',
        acquisitionDate: asset.acquisitionDate || '',
        acquisitionCost: asset.acquisitionCost?.toString() || '',
        usefulLife: asset.usefulLife?.toString() || '',
        salvageValue: asset.salvageValue?.toString() || '',
        depreciationMethod: asset.depreciationMethod || 'Straight-Line',
        serialNumber: asset.serialNumber || '',
        vendor: asset.vendor || '',
        poNumber: asset.poNumber || '',
        condition: asset.condition || 'good',
        insurancePolicy: asset.insurancePolicy || '',
        notes: asset.notes || '',
      });
    } else {
      setFormData({
        name: '',
        category: '',
        subcategory: '',
        location: '',
        acquisitionDate: new Date().toISOString().split('T')[0],
        acquisitionCost: '',
        usefulLife: '',
        salvageValue: '',
        depreciationMethod: 'Straight-Line',
        serialNumber: '',
        vendor: '',
        poNumber: '',
        condition: 'good',
        insurancePolicy: '',
        notes: '',
      });
    }
  }, [asset, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-set useful life when category changes
      if (field === 'category') {
        const cat = assetCategories.find(c => c.value === value);
        if (cat && cat.defaultLife > 0) {
          updated.usefulLife = cat.defaultLife.toString();
        }
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.acquisitionCost) {
      toast({
        variant: 'destructive',
        title: 'Missing Required Fields',
        description: 'Please fill in asset name, category, and acquisition cost.',
      });
      return;
    }

    setLoading(true);
    try {
      const assetData = {
        id: asset?.id || `FA-${String(Date.now()).slice(-6)}`,
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        location: formData.location,
        acquisitionDate: formData.acquisitionDate,
        acquisitionCost: parseFloat(formData.acquisitionCost) || 0,
        usefulLife: parseInt(formData.usefulLife) || 0,
        salvageValue: parseFloat(formData.salvageValue) || 0,
        depreciationMethod: formData.depreciationMethod,
        accumulatedDepreciation: asset?.accumulatedDepreciation || 0,
        netBookValue: asset?.netBookValue || (parseFloat(formData.acquisitionCost) || 0),
        status: 'active',
        serialNumber: formData.serialNumber,
        vendor: formData.vendor,
        poNumber: formData.poNumber,
        condition: formData.condition,
        lastInspection: asset?.lastInspection || null,
        insurancePolicy: formData.insurancePolicy,
        notes: formData.notes,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      onSave(assetData, isEdit);
      toast({
        title: 'Success',
        description: `Asset ${isEdit ? 'updated' : 'created'} successfully.`,
      });
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save asset.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 grid gap-2">
                <Label htmlFor="name">Asset Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Office Building - Main St"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  placeholder="e.g., Commercial Property"
                  value={formData.subcategory}
                  onChange={(e) => handleChange('subcategory', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Location</Label>
                <Select value={formData.location} onValueChange={(v) => handleChange('location', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLocations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Condition</Label>
                <Select value={formData.condition} onValueChange={(v) => handleChange('condition', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Financial Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="acquisitionDate">Acquisition Date *</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={formData.acquisitionDate}
                  onChange={(e) => handleChange('acquisitionDate', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="acquisitionCost">Acquisition Cost *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="acquisitionCost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={formData.acquisitionCost}
                    onChange={(e) => handleChange('acquisitionCost', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usefulLife">Useful Life (Years)</Label>
                <Input
                  id="usefulLife"
                  type="number"
                  placeholder="e.g., 39"
                  value={formData.usefulLife}
                  onChange={(e) => handleChange('usefulLife', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salvageValue">Salvage Value</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="salvageValue"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={formData.salvageValue}
                    onChange={(e) => handleChange('salvageValue', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-span-2 grid gap-2">
                <Label>Depreciation Method</Label>
                <Select value={formData.depreciationMethod} onValueChange={(v) => handleChange('depreciationMethod', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {depreciationMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Additional Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  placeholder="e.g., SN-12345"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vendor">Vendor/Supplier</Label>
                <Input
                  id="vendor"
                  placeholder="e.g., Equipment Co."
                  value={formData.vendor}
                  onChange={(e) => handleChange('vendor', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="poNumber">PO Number</Label>
                <Input
                  id="poNumber"
                  placeholder="e.g., PO-2024-001"
                  value={formData.poNumber}
                  onChange={(e) => handleChange('poNumber', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="insurancePolicy">Insurance Policy</Label>
                <Input
                  id="insurancePolicy"
                  placeholder="e.g., POL-2024-001"
                  value={formData.insurancePolicy}
                  onChange={(e) => handleChange('insurancePolicy', e.target.value)}
                />
              </div>
              <div className="col-span-2 grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this asset..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : isEdit ? 'Update Asset' : 'Add Asset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Disposal Modal Component
const DisposalModal = ({ isOpen, onClose, asset, onDispose }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    disposalDate: new Date().toISOString().split('T')[0],
    disposalAmount: '',
    disposalMethod: 'Sale',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!formData.disposalDate) {
      toast({
        variant: 'destructive',
        title: 'Missing Date',
        description: 'Please enter a disposal date.',
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onDispose({
        ...asset,
        status: 'disposed',
        condition: 'disposed',
        disposalDate: formData.disposalDate,
        disposalAmount: parseFloat(formData.disposalAmount) || 0,
        disposalMethod: formData.disposalMethod,
        notes: asset.notes + '\n\nDisposal Notes: ' + formData.notes,
      });
      toast({
        title: 'Asset Disposed',
        description: `${asset.name} has been marked as disposed.`,
      });
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to dispose asset.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dispose Asset</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-medium text-yellow-800">You are disposing:</p>
            <p className="text-yellow-700">{asset?.name}</p>
            <p className="text-sm text-yellow-600 mt-1">
              Net Book Value: ${asset?.netBookValue?.toLocaleString()}
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Disposal Date *</Label>
              <Input
                type="date"
                value={formData.disposalDate}
                onChange={(e) => setFormData(prev => ({ ...prev, disposalDate: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Disposal Amount (Proceeds)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-9"
                  value={formData.disposalAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, disposalAmount: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Disposal Method</Label>
              <Select
                value={formData.disposalMethod}
                onValueChange={(v) => setFormData(prev => ({ ...prev, disposalMethod: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sale">Sale</SelectItem>
                  <SelectItem value="Trade-In">Trade-In</SelectItem>
                  <SelectItem value="Donation">Donation</SelectItem>
                  <SelectItem value="Scrapped">Scrapped</SelectItem>
                  <SelectItem value="Theft/Loss">Theft/Loss</SelectItem>
                  <SelectItem value="Demolition Sale">Demolition Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Reason for disposal, buyer info, etc."
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} variant="destructive">
            {loading ? 'Processing...' : 'Dispose Asset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function FixedAssetManagementPage() {
  const { toast } = useToast();
  const [assets, setAssets] = useState(mockAssets);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(mockAssets[0]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showDisposalModal, setShowDisposalModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowAssetModal(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowAssetModal(true);
  };

  const handleSaveAsset = (assetData, isEdit) => {
    if (isEdit) {
      setAssets(prev => prev.map(a => a.id === assetData.id ? assetData : a));
      setSelectedAsset(assetData);
    } else {
      setAssets(prev => [assetData, ...prev]);
      setSelectedAsset(assetData);
    }
  };

  const handleDisposeAsset = (disposedAsset) => {
    setAssets(prev => prev.map(a => a.id === disposedAsset.id ? disposedAsset : a));
    setSelectedAsset(disposedAsset);
  };

  const handleDeleteAsset = (asset) => {
    if (confirm(`Are you sure you want to delete "${asset.name}"? This cannot be undone.`)) {
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(assets.find(a => a.id !== asset.id) || null);
      }
      toast({
        title: 'Asset Deleted',
        description: `${asset.name} has been removed.`,
      });
    }
  };

  const handleRunDepreciation = () => {
    toast({
      title: 'Depreciation Calculated',
      description: 'Monthly depreciation has been recorded for all active assets.',
    });
  };

  const categories = useMemo(() => {
    const cats = [...new Set(assets.map(a => a.category))];
    return ['all', ...cats];
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesStatus = filter === 'all' || asset.status === filter;
      const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [assets, filter, categoryFilter, searchTerm]);

  const stats = useMemo(() => {
    const activeAssets = assets.filter(a => a.status === 'active');
    return {
      totalAssets: activeAssets.length,
      totalCost: activeAssets.reduce((sum, a) => sum + a.acquisitionCost, 0),
      totalNBV: activeAssets.reduce((sum, a) => sum + a.netBookValue, 0),
      totalDepreciation: activeAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0)
    };
  }, [assets]);

  const assetsByCategory = useMemo(() => {
    const cats = {};
    assets.filter(a => a.status === 'active').forEach(asset => {
      if (!cats[asset.category]) {
        cats[asset.category] = { count: 0, cost: 0, nbv: 0 };
      }
      cats[asset.category].count++;
      cats[asset.category].cost += asset.acquisitionCost;
      cats[asset.category].nbv += asset.netBookValue;
    });
    return Object.entries(cats).sort((a, b) => b[1].nbv - a[1].nbv);
  }, [assets]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fixed Asset Management</h1>
          <p className="text-gray-600">Track and manage company fixed assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRunDepreciation}><TrendingDown className="w-4 h-4 mr-2" />Run Depreciation</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddAsset}><Plus className="w-4 h-4 mr-2" />Add Asset</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Package className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
              <p className="text-sm text-gray-600">Active Assets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalCost / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">Total Cost</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Building className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalNBV / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">Net Book Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><TrendingDown className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalDepreciation / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">Accum. Depreciation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {assetsByCategory.slice(0, 4).map(([category, data]) => {
          const Icon = categoryIcons[category] || Package;
          return (
            <div key={category} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">{category}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">${(data.nbv / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-gray-500">{data.count} assets</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search assets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {['all', 'active', 'disposed'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : statusConfig[f]?.label || f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2 max-h-[500px] overflow-y-auto">
          {filteredAssets.map((asset) => {
            const Icon = categoryIcons[asset.category] || Package;
            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={cn(
                  "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                  selectedAsset?.id === asset.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{asset.name}</p>
                    <p className="text-sm text-gray-500">{asset.id} • {asset.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-gray-900">${(asset.netBookValue / 1000).toFixed(0)}K NBV</span>
                      <span className={cn("px-2 py-0.5 rounded text-xs", statusConfig[asset.status].color)}>{statusConfig[asset.status].label}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="col-span-2">
          {selectedAsset && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedAsset.name}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", statusConfig[selectedAsset.status].color)}>{statusConfig[selectedAsset.status].label}</span>
                    </div>
                    <p className="text-gray-600">{selectedAsset.id} • {selectedAsset.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditAsset(selectedAsset)}><Edit className="w-4 h-4" /></Button>
                    {selectedAsset.status === 'active' && (
                      <>
                        <Button variant="outline" size="sm" className="text-orange-600" onClick={() => setShowDisposalModal(true)}>Dispose</Button>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteAsset(selectedAsset)}><Trash2 className="w-4 h-4" /></Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Acquisition Cost</p>
                    <p className="text-xl font-bold text-blue-600">${selectedAsset.acquisitionCost.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Accum. Depreciation</p>
                    <p className="text-xl font-bold text-orange-600">${selectedAsset.accumulatedDepreciation.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Net Book Value</p>
                    <p className="text-xl font-bold text-green-600">${selectedAsset.netBookValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Asset Details</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Location</p><p className="font-medium">{selectedAsset.location}</p></div>
                  <div><p className="text-gray-500">Subcategory</p><p className="font-medium">{selectedAsset.subcategory}</p></div>
                  <div><p className="text-gray-500">Condition</p><span className={cn("px-2 py-0.5 rounded text-xs", conditionConfig[selectedAsset.condition]?.color)}>{conditionConfig[selectedAsset.condition]?.label}</span></div>
                  <div><p className="text-gray-500">Acquisition Date</p><p className="font-medium">{selectedAsset.acquisitionDate}</p></div>
                  <div><p className="text-gray-500">Serial Number</p><p className="font-medium">{selectedAsset.serialNumber}</p></div>
                  <div><p className="text-gray-500">Vendor</p><p className="font-medium">{selectedAsset.vendor}</p></div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Depreciation Information</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Method</p><p className="font-medium">{selectedAsset.depreciationMethod}</p></div>
                  <div><p className="text-gray-500">Useful Life</p><p className="font-medium">{selectedAsset.usefulLife} years</p></div>
                  <div><p className="text-gray-500">Salvage Value</p><p className="font-medium">${selectedAsset.salvageValue.toLocaleString()}</p></div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Depreciation Progress</span>
                    <span className="font-medium">{((selectedAsset.accumulatedDepreciation / (selectedAsset.acquisitionCost - selectedAsset.salvageValue)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, (selectedAsset.accumulatedDepreciation / (selectedAsset.acquisitionCost - selectedAsset.salvageValue)) * 100)}%` }} />
                  </div>
                </div>
              </div>

              {selectedAsset.status === 'disposed' && (
                <div className="p-6 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-4">Disposal Information</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><p className="text-gray-500">Disposal Date</p><p className="font-medium">{selectedAsset.disposalDate}</p></div>
                    <div><p className="text-gray-500">Disposal Amount</p><p className="font-medium">${selectedAsset.disposalAmount?.toLocaleString()}</p></div>
                    <div><p className="text-gray-500">Method</p><p className="font-medium">{selectedAsset.disposalMethod}</p></div>
                  </div>
                </div>
              )}

              {selectedAsset.notes && (
                <div className="p-6 bg-yellow-50 border-t border-yellow-100">
                  <p className="text-sm text-yellow-800"><strong>Notes:</strong> {selectedAsset.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Asset Modal */}
      <AssetModal
        isOpen={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        asset={editingAsset}
        onSave={handleSaveAsset}
      />

      {/* Disposal Modal */}
      <DisposalModal
        isOpen={showDisposalModal}
        onClose={() => setShowDisposalModal(false)}
        asset={selectedAsset}
        onDispose={handleDisposeAsset}
      />
    </div>
  );
}
