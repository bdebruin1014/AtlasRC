import React, { useState } from 'react';
import { 
  Settings, Plus, Edit2, Trash2, Save, X, DollarSign,
  AlertCircle, Copy, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const DEFAULT_SOFT_COST_ITEMS = [
  { id: 1, item_code: 'PERMIT', item_name: 'Permitting & Plan Submittal', default_amount: 2500, display_order: 1, is_municipality_fee: false },
  { id: 2, item_code: 'ARCH', item_name: 'Architectural Fees', default_amount: 1500, display_order: 2, is_municipality_fee: false },
  { id: 3, item_code: 'ENG', item_name: 'Engineering', default_amount: 2000, display_order: 3, is_municipality_fee: false },
  { id: 4, item_code: 'SURVEY', item_name: 'Survey', default_amount: 1000, display_order: 4, is_municipality_fee: false },
  { id: 5, item_code: 'INS', item_name: 'Construction Insurance', default_amount: 1200, display_order: 5, is_municipality_fee: false },
  { id: 6, item_code: 'BLUE', item_name: 'Blueprints & Misc Supplies', default_amount: 800, display_order: 6, is_municipality_fee: false },
  { id: 7, item_code: 'WATER_TAP', item_name: 'Water Tap Fee', default_amount: 2500, display_order: 7, is_municipality_fee: true, fee_type: 'water_tap' },
  { id: 8, item_code: 'SEWER_TAP', item_name: 'Sewer Tap Fee', default_amount: 2500, display_order: 8, is_municipality_fee: true, fee_type: 'sewer_tap' },
  { id: 9, item_code: 'OTHER', item_name: 'Other Soft Costs', default_amount: 1000, display_order: 9, is_municipality_fee: false }
];

const MINIMUM_SOFT_COST = 15000;

const SoftCostTemplatesPage = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([
    {
      id: 1,
      template_name: 'Default Soft Cost Template',
      is_default: true,
      line_items: DEFAULT_SOFT_COST_ITEMS
    }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);

  const calculateTotal = (lineItems) => {
    return lineItems.reduce((sum, item) => sum + (parseFloat(item.default_amount) || 0), 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const handleUpdateItem = (itemId, field, value) => {
    const updatedTemplate = {
      ...selectedTemplate,
      line_items: selectedTemplate.line_items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    };
    setSelectedTemplate(updatedTemplate);
    setTemplates(templates.map(t => 
      t.id === selectedTemplate.id ? updatedTemplate : t
    ));
  };

  const handleSaveItem = () => {
    setEditingItem(null);
    toast({
      title: 'Success',
      description: 'Line item updated successfully'
    });
  };

  const total = calculateTotal(selectedTemplate.line_items);
  const meetsMinimum = total >= MINIMUM_SOFT_COST;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Soft Cost Templates</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage default soft cost line items for project budgeting
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Duplicate Template
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>
      </div>

      {/* Minimum Warning */}
      <div className={cn(
        "mb-6 p-4 rounded-lg border flex items-start gap-3",
        meetsMinimum 
          ? "bg-green-50 border-green-200" 
          : "bg-amber-50 border-amber-200"
      )}>
        <AlertCircle className={cn(
          "w-5 h-5 flex-shrink-0 mt-0.5",
          meetsMinimum ? "text-green-600" : "text-amber-600"
        )} />
        <div className="flex-1">
          <p className={cn(
            "font-semibold text-sm",
            meetsMinimum ? "text-green-900" : "text-amber-900"
          )}>
            {meetsMinimum 
              ? `Template meets minimum requirement (${formatCurrency(total)})` 
              : `Warning: Template below ${formatCurrency(MINIMUM_SOFT_COST)} minimum`
            }
          </p>
          <p className={cn(
            "text-xs mt-1",
            meetsMinimum ? "text-green-700" : "text-amber-700"
          )}>
            Soft costs must total at least ${MINIMUM_SOFT_COST.toLocaleString()} per project
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Template List Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Templates</CardTitle>
              <CardDescription>Manage soft cost templates</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {templates.map(template => (
                <div
                  key={template.id}
                  className={cn(
                    "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                    selectedTemplate?.id === template.id && "bg-green-50 border-l-4 border-l-green-600"
                  )}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.template_name}</h3>
                      {template.is_default && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
                          Default
                        </span>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {template.line_items.length} line items
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(calculateTotal(template.line_items))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedTemplate.template_name}</CardTitle>
                  <CardDescription className="mt-1">
                    Configure default amounts for soft cost line items
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    meetsMinimum ? "text-green-600" : "text-amber-600"
                  )}>
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedTemplate.line_items
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((item, idx) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 rounded-lg border transition-colors",
                        item.is_municipality_fee 
                          ? "bg-blue-50 border-blue-200" 
                          : "bg-gray-50 border-gray-200 hover:border-green-300"
                      )}
                    >
                      {editingItem === item.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 block mb-1">
                                Item Name
                              </label>
                              <Input
                                value={item.item_name}
                                onChange={(e) => handleUpdateItem(item.id, 'item_name', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 block mb-1">
                                Item Code
                              </label>
                              <Input
                                value={item.item_code}
                                onChange={(e) => handleUpdateItem(item.id, 'item_code', e.target.value.toUpperCase())}
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">
                              Default Amount
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.default_amount}
                              onChange={(e) => handleUpdateItem(item.id, 'default_amount', parseFloat(e.target.value))}
                              className="text-sm"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)}>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveItem}>
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded">
                                {item.item_code}
                              </span>
                              <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                              {item.is_municipality_fee && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  Municipality Fee
                                </span>
                              )}
                            </div>
                            {item.is_municipality_fee && (
                              <p className="text-xs text-blue-600 ml-16">
                                Automatically populated from municipality fee schedule
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Default Amount</p>
                              <p className="text-lg font-bold text-green-700">
                                {formatCurrency(item.default_amount)}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingItem(item.id)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              {!item.is_municipality_fee && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {/* Add Item Button */}
                {showAddItem ? (
                  <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Add New Line Item</p>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <Input placeholder="Item Code" className="text-sm" />
                      <Input placeholder="Item Name" className="text-sm col-span-2" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Default Amount" className="text-sm flex-1" />
                      <Button size="sm">
                        <Save className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddItem(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => setShowAddItem(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Line Item
                  </Button>
                )}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Template Summary</h4>
                    <p className="text-sm text-gray-500">Total soft costs configuration</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Line Items</p>
                    <p className="text-lg font-bold text-gray-900">{selectedTemplate.line_items.length}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-blue-700 font-medium">Municipality Fees</p>
                    <p className="text-xl font-bold text-blue-900 mt-1">
                      {selectedTemplate.line_items.filter(i => i.is_municipality_fee).length}
                    </p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-700 font-medium">Fixed Cost Items</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {selectedTemplate.line_items.filter(i => !i.is_municipality_fee).length}
                    </p>
                  </div>
                  <div className={cn(
                    "rounded-lg p-4",
                    meetsMinimum ? "bg-green-50" : "bg-amber-50"
                  )}>
                    <p className={cn(
                      "text-xs font-medium",
                      meetsMinimum ? "text-green-700" : "text-amber-700"
                    )}>
                      Total Amount
                    </p>
                    <p className={cn(
                      "text-xl font-bold mt-1",
                      meetsMinimum ? "text-green-900" : "text-amber-900"
                    )}>
                      {formatCurrency(total)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SoftCostTemplatesPage;
