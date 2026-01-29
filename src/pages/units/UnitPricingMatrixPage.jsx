import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  Calculator,
  DollarSign,
  Ruler,
  TrendingUp,
  TrendingDown,
  Percent,
  Home,
  Building2,
  MapPin,
  Copy,
  History,
  AlertCircle
} from 'lucide-react';

const UnitPricingMatrixPage = () => {
  const [showTierModal, setShowTierModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [pricingMode, setPricingMode] = useState('sale');

  const [tierData, setTierData] = useState({
    name: '',
    unitType: 'lot',
    minSize: '',
    maxSize: '',
    basePrice: '',
    pricePerUnit: '',
    premiumFeatures: []
  });

  const [adjustmentData, setAdjustmentData] = useState({
    name: '',
    type: 'premium',
    calculationType: 'fixed',
    value: '',
    applicableTiers: []
  });

  const salePricingTiers = [
    {
      id: 1,
      name: 'Standard Lot',
      unitType: 'lot',
      minSqFt: 5000,
      maxSqFt: 7499,
      basePrice: 75000,
      pricePerSqFt: 12,
      unitCount: 80,
      soldCount: 45,
      avgSalePrice: 86500,
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      name: 'Premium Lot',
      unitType: 'lot',
      minSqFt: 7500,
      maxSqFt: 9999,
      basePrice: 100000,
      pricePerSqFt: 14,
      unitCount: 50,
      soldCount: 28,
      avgSalePrice: 122000,
      lastUpdated: '2024-01-15'
    },
    {
      id: 3,
      name: 'Estate Lot',
      unitType: 'lot',
      minSqFt: 10000,
      maxSqFt: 20000,
      basePrice: 140000,
      pricePerSqFt: 16,
      unitCount: 20,
      soldCount: 8,
      avgSalePrice: 185000,
      lastUpdated: '2024-01-15'
    },
    {
      id: 4,
      name: 'Model A Home',
      unitType: 'home',
      minSqFt: 1800,
      maxSqFt: 2200,
      basePrice: 350000,
      pricePerSqFt: 175,
      unitCount: 15,
      soldCount: 6,
      avgSalePrice: 385000,
      lastUpdated: '2024-02-01'
    },
    {
      id: 5,
      name: 'Model B Home',
      unitType: 'home',
      minSqFt: 2400,
      maxSqFt: 3000,
      basePrice: 425000,
      pricePerSqFt: 185,
      unitCount: 12,
      soldCount: 4,
      avgSalePrice: 498000,
      lastUpdated: '2024-02-01'
    }
  ];

  const rentalPricingTiers = [
    {
      id: 1,
      name: 'Studio',
      unitType: 'rental',
      minSqFt: 400,
      maxSqFt: 550,
      baseRent: 1100,
      rentPerSqFt: 2.5,
      unitCount: 20,
      leasedCount: 18,
      avgRent: 1175,
      lastUpdated: '2024-01-01'
    },
    {
      id: 2,
      name: '1 Bedroom',
      unitType: 'rental',
      minSqFt: 650,
      maxSqFt: 850,
      baseRent: 1350,
      rentPerSqFt: 2.0,
      unitCount: 40,
      leasedCount: 35,
      avgRent: 1485,
      lastUpdated: '2024-01-01'
    },
    {
      id: 3,
      name: '2 Bedroom',
      unitType: 'rental',
      minSqFt: 950,
      maxSqFt: 1200,
      baseRent: 1750,
      rentPerSqFt: 1.75,
      unitCount: 35,
      leasedCount: 30,
      avgRent: 1920,
      lastUpdated: '2024-01-01'
    },
    {
      id: 4,
      name: '3 Bedroom',
      unitType: 'rental',
      minSqFt: 1300,
      maxSqFt: 1600,
      baseRent: 2200,
      rentPerSqFt: 1.6,
      unitCount: 15,
      leasedCount: 12,
      avgRent: 2450,
      lastUpdated: '2024-01-01'
    }
  ];

  const priceAdjustments = [
    { id: 1, name: 'Corner Lot Premium', type: 'premium', calculationType: 'percentage', value: 5, applicableTo: ['Standard Lot', 'Premium Lot', 'Estate Lot'] },
    { id: 2, name: 'View Premium', type: 'premium', calculationType: 'fixed', value: 15000, applicableTo: ['Premium Lot', 'Estate Lot'] },
    { id: 3, name: 'Cul-de-sac Premium', type: 'premium', calculationType: 'percentage', value: 3, applicableTo: ['Standard Lot', 'Premium Lot'] },
    { id: 4, name: 'Waterfront Premium', type: 'premium', calculationType: 'percentage', value: 20, applicableTo: ['Estate Lot'] },
    { id: 5, name: 'Quick Close Discount', type: 'discount', calculationType: 'percentage', value: 2, applicableTo: ['All'] },
    { id: 6, name: 'Upgraded Finishes', type: 'premium', calculationType: 'fixed', value: 25000, applicableTo: ['Model A Home', 'Model B Home'] }
  ];

  const rentalAdjustments = [
    { id: 1, name: 'Top Floor Premium', type: 'premium', calculationType: 'fixed', value: 75, applicableTo: ['All'] },
    { id: 2, name: 'View Premium', type: 'premium', calculationType: 'fixed', value: 100, applicableTo: ['1 Bedroom', '2 Bedroom', '3 Bedroom'] },
    { id: 3, name: 'Garage Parking', type: 'premium', calculationType: 'fixed', value: 150, applicableTo: ['All'] },
    { id: 4, name: 'In-Unit Laundry', type: 'premium', calculationType: 'fixed', value: 50, applicableTo: ['All'] },
    { id: 5, name: 'Long-term Lease Discount', type: 'discount', calculationType: 'percentage', value: 3, applicableTo: ['All'] }
  ];

  const currentTiers = pricingMode === 'sale' ? salePricingTiers : rentalPricingTiers;
  const currentAdjustments = pricingMode === 'sale' ? priceAdjustments : rentalAdjustments;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lot': return <MapPin className="w-4 h-4" />;
      case 'home': return <Home className="w-4 h-4" />;
      case 'rental': return <Building2 className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const handleEditTier = (tier) => {
    setEditingTier(tier);
    setTierData({
      name: tier.name,
      unitType: tier.unitType,
      minSize: tier.minSqFt,
      maxSize: tier.maxSqFt,
      basePrice: pricingMode === 'sale' ? tier.basePrice : tier.baseRent,
      pricePerUnit: pricingMode === 'sale' ? tier.pricePerSqFt : tier.rentPerSqFt,
      premiumFeatures: []
    });
    setShowTierModal(true);
  };

  const handleAddTier = () => {
    setEditingTier(null);
    setTierData({
      name: '',
      unitType: 'lot',
      minSize: '',
      maxSize: '',
      basePrice: '',
      pricePerUnit: '',
      premiumFeatures: []
    });
    setShowTierModal(true);
  };

  const calculatePrice = (tier, sqFt) => {
    if (pricingMode === 'sale') {
      return tier.basePrice + (sqFt * tier.pricePerSqFt);
    } else {
      return tier.baseRent + (sqFt * tier.rentPerSqFt);
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Unit Pricing Matrix</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Unit Pricing & Rent Matrix</h1>
          <p className="text-gray-600 mt-2">Define pricing tiers and adjustments for all unit types</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <History className="w-4 h-4 mr-2" />
            Price History
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-lg font-semibold">Pricing Mode</Label>
              <p className="text-sm text-gray-500">Switch between sale pricing and rental rates</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant={pricingMode === 'sale' ? 'default' : 'outline'}
                onClick={() => setPricingMode('sale')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Sale Pricing
              </Button>
              <Button
                variant={pricingMode === 'rental' ? 'default' : 'outline'}
                onClick={() => setPricingMode('rental')}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Rental Rates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tiers" className="w-full">
        <TabsList>
          <TabsTrigger value="tiers">
            <Ruler className="w-4 h-4 mr-2" />
            {pricingMode === 'sale' ? 'Price' : 'Rent'} Tiers ({currentTiers.length})
          </TabsTrigger>
          <TabsTrigger value="adjustments">
            <Percent className="w-4 h-4 mr-2" />
            Adjustments ({currentAdjustments.length})
          </TabsTrigger>
          <TabsTrigger value="calculator">
            <Calculator className="w-4 h-4 mr-2" />
            Price Calculator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{pricingMode === 'sale' ? 'Sale Price' : 'Rental Rate'} Tiers</CardTitle>
                  <CardDescription>
                    Define base {pricingMode === 'sale' ? 'prices' : 'rents'} by unit size
                  </CardDescription>
                </div>
                <Button onClick={handleAddTier}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size Range (sq ft)</TableHead>
                    <TableHead>Base {pricingMode === 'sale' ? 'Price' : 'Rent'}</TableHead>
                    <TableHead>Per Sq Ft</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>{pricingMode === 'sale' ? 'Sold' : 'Leased'}</TableHead>
                    <TableHead>Avg {pricingMode === 'sale' ? 'Sale' : 'Rent'}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell className="font-medium">{tier.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(tier.unitType)}
                          <span className="capitalize">{tier.unitType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tier.minSqFt.toLocaleString()} - {tier.maxSqFt.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${pricingMode === 'sale'
                          ? tier.basePrice.toLocaleString()
                          : tier.baseRent.toLocaleString()
                        }{pricingMode === 'rental' && '/mo'}
                      </TableCell>
                      <TableCell>
                        ${pricingMode === 'sale' ? tier.pricePerSqFt : tier.rentPerSqFt}
                      </TableCell>
                      <TableCell>{tier.unitCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {pricingMode === 'sale' ? tier.soldCount : tier.leasedCount}
                          <span className="text-gray-400">
                            ({Math.round(((pricingMode === 'sale' ? tier.soldCount : tier.leasedCount) / tier.unitCount) * 100)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          ${pricingMode === 'sale'
                            ? tier.avgSalePrice.toLocaleString()
                            : tier.avgRent.toLocaleString()
                          }
                          {tier.avgSalePrice > (pricingMode === 'sale' ? tier.basePrice : tier.baseRent) ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditTier(tier)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{pricingMode === 'sale' ? 'Price' : 'Rent'} Adjustments</CardTitle>
                  <CardDescription>Premiums and discounts that modify base pricing</CardDescription>
                </div>
                <Button onClick={() => setShowAdjustmentModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Adjustment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adjustment Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Applicable Tiers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAdjustments.map((adj) => (
                    <TableRow key={adj.id}>
                      <TableCell className="font-medium">{adj.name}</TableCell>
                      <TableCell>
                        <Badge className={adj.type === 'premium' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {adj.type === 'premium' ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {adj.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{adj.calculationType}</TableCell>
                      <TableCell>
                        {adj.calculationType === 'percentage'
                          ? `${adj.value}%`
                          : `$${adj.value.toLocaleString()}${pricingMode === 'rental' ? '/mo' : ''}`
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {adj.applicableTo.map((tier, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tier}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                {pricingMode === 'sale' ? 'Price' : 'Rent'} Calculator
              </CardTitle>
              <CardDescription>Calculate final pricing with adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <Label>Select Tier</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a pricing tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentTiers.map((tier) => (
                          <SelectItem key={tier.id} value={tier.id.toString()}>
                            {tier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unit Size (sq ft)</Label>
                    <Input type="number" placeholder="e.g., 6500" />
                  </div>
                  <div>
                    <Label>Apply Adjustments</Label>
                    <div className="space-y-2 mt-2">
                      {currentAdjustments.slice(0, 4).map((adj) => (
                        <div key={adj.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span>{adj.name}</span>
                          </div>
                          <span className={adj.type === 'premium' ? 'text-green-600' : 'text-red-600'}>
                            {adj.type === 'premium' ? '+' : '-'}
                            {adj.calculationType === 'percentage'
                              ? `${adj.value}%`
                              : `$${adj.value.toLocaleString()}`
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">{pricingMode === 'sale' ? 'Price' : 'Rent'} Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base {pricingMode === 'sale' ? 'Price' : 'Rent'}</span>
                      <span>$75,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size Premium (6,500 sq ft × $12)</span>
                      <span>$78,000</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Corner Lot Premium (+5%)</span>
                      <span>+$7,650</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Final {pricingMode === 'sale' ? 'Price' : 'Rent'}</span>
                        <span>$160,650{pricingMode === 'rental' && '/mo'}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        ${pricingMode === 'sale' ? '24.72' : '24.72'}/sq ft
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                    Apply This {pricingMode === 'sale' ? 'Price' : 'Rent'} to Unit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Tier Modal */}
      <Dialog open={showTierModal} onOpenChange={setShowTierModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Edit' : 'Add'} Pricing Tier</DialogTitle>
            <DialogDescription>
              Define a {pricingMode === 'sale' ? 'price' : 'rent'} tier based on unit size
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tier Name</Label>
              <Input
                placeholder="e.g., Standard Lot, 2 Bedroom"
                value={tierData.name}
                onChange={(e) => setTierData({...tierData, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Unit Type</Label>
              <Select
                value={tierData.unitType}
                onValueChange={(value) => setTierData({...tierData, unitType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lot">Lot</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="rental">Rental Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Min Size (sq ft)</Label>
                <Input
                  type="number"
                  value={tierData.minSize}
                  onChange={(e) => setTierData({...tierData, minSize: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Max Size (sq ft)</Label>
                <Input
                  type="number"
                  value={tierData.maxSize}
                  onChange={(e) => setTierData({...tierData, maxSize: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Base {pricingMode === 'sale' ? 'Price' : 'Rent'} ($)</Label>
                <Input
                  type="number"
                  value={tierData.basePrice}
                  onChange={(e) => setTierData({...tierData, basePrice: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Per Sq Ft ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={tierData.pricePerUnit}
                  onChange={(e) => setTierData({...tierData, pricePerUnit: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTierModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              {editingTier ? 'Save Changes' : 'Add Tier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Adjustment Modal */}
      <Dialog open={showAdjustmentModal} onOpenChange={setShowAdjustmentModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add {pricingMode === 'sale' ? 'Price' : 'Rent'} Adjustment</DialogTitle>
            <DialogDescription>
              Create a premium or discount that can be applied to units
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Adjustment Name</Label>
              <Input
                placeholder="e.g., Corner Lot Premium, View Premium"
                value={adjustmentData.name}
                onChange={(e) => setAdjustmentData({...adjustmentData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={adjustmentData.type}
                  onValueChange={(value) => setAdjustmentData({...adjustmentData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium (+)</SelectItem>
                    <SelectItem value="discount">Discount (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Calculation</Label>
                <Select
                  value={adjustmentData.calculationType}
                  onValueChange={(value) => setAdjustmentData({...adjustmentData, calculationType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Value</Label>
              <Input
                type="number"
                step={adjustmentData.calculationType === 'percentage' ? '0.1' : '1'}
                placeholder={adjustmentData.calculationType === 'percentage' ? '5' : '10000'}
                value={adjustmentData.value}
                onChange={(e) => setAdjustmentData({...adjustmentData, value: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustmentModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Add Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitPricingMatrixPage;
