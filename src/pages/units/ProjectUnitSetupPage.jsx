import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Settings,
  Layers,
  Home,
  Building2,
  Map,
  Grid3X3,
  Save,
  Trash2,
  Edit2,
  Copy,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Ruler,
  Hash
} from 'lucide-react';

const ProjectUnitSetupPage = () => {
  const [projectType, setProjectType] = useState('subdivision');
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);

  const [projectConfig, setProjectConfig] = useState({
    name: 'Oakwood Estates',
    type: 'subdivision',
    totalUnits: 150,
    totalAcres: 75.5,
    phases: 3,
    unitTypes: ['lot'],
    pricingMethod: 'tier',
    hasRentals: false
  });

  const [phaseData, setPhaseData] = useState({
    name: '',
    unitCount: '',
    startDate: '',
    targetCompletion: '',
    description: ''
  });

  const [tierData, setTierData] = useState({
    name: '',
    minSize: '',
    maxSize: '',
    basePrice: '',
    pricePerSqFt: ''
  });

  const phases = [
    {
      id: 1,
      name: 'Phase 1 - North Section',
      unitCount: 50,
      unitsAvailable: 12,
      unitsSold: 35,
      unitsReserved: 3,
      startDate: '2024-01-15',
      targetCompletion: '2024-06-30',
      status: 'active',
      revenue: 8750000,
      projectedRevenue: 12500000
    },
    {
      id: 2,
      name: 'Phase 2 - Central Section',
      unitCount: 60,
      unitsAvailable: 45,
      unitsSold: 10,
      unitsReserved: 5,
      startDate: '2024-04-01',
      targetCompletion: '2024-10-31',
      status: 'active',
      revenue: 2500000,
      projectedRevenue: 15000000
    },
    {
      id: 3,
      name: 'Phase 3 - South Section',
      unitCount: 40,
      unitsAvailable: 40,
      unitsSold: 0,
      unitsReserved: 0,
      startDate: '2024-08-01',
      targetCompletion: '2025-02-28',
      status: 'planned',
      revenue: 0,
      projectedRevenue: 10000000
    }
  ];

  const sizeTiers = [
    { id: 1, name: 'Standard', minSqFt: 5000, maxSqFt: 7499, basePrice: 85000, pricePerSqFt: 12, unitCount: 80 },
    { id: 2, name: 'Premium', minSqFt: 7500, maxSqFt: 9999, basePrice: 110000, pricePerSqFt: 14, unitCount: 50 },
    { id: 3, name: 'Estate', minSqFt: 10000, maxSqFt: 15000, basePrice: 150000, pricePerSqFt: 16, unitCount: 20 }
  ];

  const projectTypes = [
    { value: 'subdivision', label: 'Land Subdivision', description: 'Lots for sale', icon: Grid3X3 },
    { value: 'build_to_sell', label: 'Build to Sell', description: 'Homes/units for sale', icon: Home },
    { value: 'build_to_rent', label: 'Build to Rent', description: 'Rental units', icon: Building2 },
    { value: 'mixed', label: 'Mixed Use', description: 'Combination of types', icon: Layers }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'planned': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalStats = {
    totalUnits: phases.reduce((acc, p) => acc + p.unitCount, 0),
    sold: phases.reduce((acc, p) => acc + p.unitsSold, 0),
    available: phases.reduce((acc, p) => acc + p.unitsAvailable, 0),
    reserved: phases.reduce((acc, p) => acc + p.unitsReserved, 0),
    revenue: phases.reduce((acc, p) => acc + p.revenue, 0),
    projectedRevenue: phases.reduce((acc, p) => acc + p.projectedRevenue, 0)
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Project Unit Setup</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Project Unit Setup</h1>
          <p className="text-gray-600 mt-2">Configure project units, phases, and pricing tiers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Copy from Template
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Project Configuration
          </CardTitle>
          <CardDescription>Define the basic structure of your project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Project Name</Label>
                <Input
                  value={projectConfig.name}
                  onChange={(e) => setProjectConfig({...projectConfig, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Project Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {projectTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <div
                        key={type.value}
                        onClick={() => setProjectConfig({...projectConfig, type: type.value})}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          projectConfig.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className={`w-6 h-6 ${
                            projectConfig.type === type.value ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{type.label}</p>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Total Units/Lots</Label>
                  <Input
                    type="number"
                    value={projectConfig.totalUnits}
                    onChange={(e) => setProjectConfig({...projectConfig, totalUnits: parseInt(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Total Acreage</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={projectConfig.totalAcres}
                    onChange={(e) => setProjectConfig({...projectConfig, totalAcres: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Pricing Method</Label>
                <Select
                  value={projectConfig.pricingMethod}
                  onValueChange={(value) => setProjectConfig({...projectConfig, pricingMethod: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tier">Size Tier Pricing</SelectItem>
                    <SelectItem value="individual">Individual Unit Pricing</SelectItem>
                    <SelectItem value="per_sqft">Price Per Square Foot</SelectItem>
                    <SelectItem value="flat">Flat Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Include Rental Units</Label>
                  <p className="text-sm text-gray-500">Track lease-up alongside sales</p>
                </div>
                <Switch
                  checked={projectConfig.hasRentals}
                  onCheckedChange={(checked) => setProjectConfig({...projectConfig, hasRentals: checked})}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Total Units</p>
            <p className="text-2xl font-bold">{totalStats.totalUnits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Sold</p>
            <p className="text-2xl font-bold text-green-600">{totalStats.sold}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Reserved</p>
            <p className="text-2xl font-bold text-yellow-600">{totalStats.reserved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-2xl font-bold text-blue-600">{totalStats.available}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-2xl font-bold">${(totalStats.revenue / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Projected</p>
            <p className="text-2xl font-bold text-gray-400">${(totalStats.projectedRevenue / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="phases" className="w-full">
        <TabsList>
          <TabsTrigger value="phases">
            <Layers className="w-4 h-4 mr-2" />
            Phases ({phases.length})
          </TabsTrigger>
          <TabsTrigger value="tiers">
            <Ruler className="w-4 h-4 mr-2" />
            Size Tiers ({sizeTiers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phases">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Phases</CardTitle>
                  <CardDescription>Define release phases for your units</CardDescription>
                </div>
                <Button onClick={() => setShowPhaseModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Phase
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {phases.map((phase) => (
                  <div key={phase.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Hash className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {phase.name}
                            <Badge className={getStatusBadge(phase.status)}>{phase.status}</Badge>
                          </h3>
                          <p className="text-sm text-gray-500">
                            {phase.startDate} - {phase.targetCompletion}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{phase.unitCount}</p>
                        <p className="text-xs text-gray-500">Total Units</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{phase.unitsSold}</p>
                        <p className="text-xs text-gray-500">Sold</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{phase.unitsReserved}</p>
                        <p className="text-xs text-gray-500">Reserved</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{phase.unitsAvailable}</p>
                        <p className="text-xs text-gray-500">Available</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">${(phase.revenue / 1000000).toFixed(2)}M</p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-400">${(phase.projectedRevenue / 1000000).toFixed(2)}M</p>
                        <p className="text-xs text-gray-500">Projected</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Sales Progress</span>
                        <span>{Math.round((phase.unitsSold / phase.unitCount) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(phase.unitsSold / phase.unitCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Size Tiers & Pricing</CardTitle>
                  <CardDescription>Define pricing tiers based on unit/lot size</CardDescription>
                </div>
                <Button onClick={() => setShowTierModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sizeTiers.map((tier) => (
                  <div key={tier.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Ruler className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{tier.name}</h3>
                          <p className="text-sm text-gray-500">
                            {tier.minSqFt.toLocaleString()} - {tier.maxSqFt.toLocaleString()} sq ft
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-8 text-center">
                        <div>
                          <p className="text-lg font-bold">${tier.basePrice.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Base Price</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold">${tier.pricePerSqFt}</p>
                          <p className="text-xs text-gray-500">Per Sq Ft</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold">{tier.unitCount}</p>
                          <p className="text-xs text-gray-500">Units</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Phase Modal */}
      <Dialog open={showPhaseModal} onOpenChange={setShowPhaseModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Project Phase</DialogTitle>
            <DialogDescription>Define a new release phase for this project</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Phase Name</Label>
              <Input
                placeholder="e.g., Phase 1 - North Section"
                value={phaseData.name}
                onChange={(e) => setPhaseData({...phaseData, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Number of Units</Label>
              <Input
                type="number"
                placeholder="50"
                value={phaseData.unitCount}
                onChange={(e) => setPhaseData({...phaseData, unitCount: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={phaseData.startDate}
                  onChange={(e) => setPhaseData({...phaseData, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Target Completion</Label>
                <Input
                  type="date"
                  value={phaseData.targetCompletion}
                  onChange={(e) => setPhaseData({...phaseData, targetCompletion: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Additional details about this phase..."
                value={phaseData.description}
                onChange={(e) => setPhaseData({...phaseData, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhaseModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Add Phase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tier Modal */}
      <Dialog open={showTierModal} onOpenChange={setShowTierModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Size Tier</DialogTitle>
            <DialogDescription>Define a pricing tier based on unit/lot size</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tier Name</Label>
              <Input
                placeholder="e.g., Standard, Premium, Estate"
                value={tierData.name}
                onChange={(e) => setTierData({...tierData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Min Size (sq ft)</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={tierData.minSize}
                  onChange={(e) => setTierData({...tierData, minSize: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Max Size (sq ft)</Label>
                <Input
                  type="number"
                  placeholder="7500"
                  value={tierData.maxSize}
                  onChange={(e) => setTierData({...tierData, maxSize: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Base Price ($)</Label>
                <Input
                  type="number"
                  placeholder="85000"
                  value={tierData.basePrice}
                  onChange={(e) => setTierData({...tierData, basePrice: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Price Per Sq Ft ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="12.00"
                  value={tierData.pricePerSqFt}
                  onChange={(e) => setTierData({...tierData, pricePerSqFt: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTierModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Add Tier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectUnitSetupPage;
