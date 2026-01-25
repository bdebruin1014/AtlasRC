import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2, GitBranch, ChevronRight, ChevronDown, Users, Percent,
  ArrowUp, ArrowDown, ExternalLink, DollarSign, TrendingUp, Plus, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { entityRelationshipService } from '@/services/entityRelationshipService';
import { entityService } from '@/services/entityService';
import { useToast } from '@/components/ui/use-toast';

const EntityOwnershipPage = () => {
  const { entityId } = useParams();
  const { toast } = useToast();
  const [expandedNodes, setExpandedNodes] = useState(['parent', 'current', 'children', 'siblings', 'investors']);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addingRelationship, setAddingRelationship] = useState(false);
  const [availableEntities, setAvailableEntities] = useState([]);
  const [availableOwnership, setAvailableOwnership] = useState(100);
  const [newRelationship, setNewRelationship] = useState({
    parentEntityId: '',
    ownershipPercentage: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Mock entity data - in real app would come from context/API
  const currentEntity = {
    id: entityId,
    name: 'Highland Park Development LLC',
    type: 'project',
    ein: '**-***9012',
    state: 'SC',
    ownership: 100,
  };

  // Ownership chain going UP (who owns this entity)
  const ownershipChain = [
    {
      id: 'owner-1',
      name: 'Bryan de Bruin',
      type: 'individual',
      ownership: 100,
      ownershipOf: 'Olive Brynn LLC',
      level: 'Beneficial Owner',
    },
    {
      id: 'ent-olive',
      name: 'Olive Brynn LLC',
      type: 'holding',
      ein: '**-***7832',
      state: 'SC',
      ownership: 50,
      ownershipOf: 'VanRock Holdings LLC',
      level: 'Ultimate Parent',
    },
    {
      id: 'ent-vanrock',
      name: 'VanRock Holdings LLC',
      type: 'holding',
      ein: '**-***4521',
      state: 'SC',
      ownership: 100,
      ownershipOf: 'Highland Park Development LLC',
      level: 'Direct Parent',
    },
  ];

  // What this entity owns (subsidiaries)
  const subsidiaries = [
    // Highland Park doesn't own anything, but other entities might
  ];

  // Sibling entities (same parent)
  const siblings = [
    {
      id: 'ent-riverside',
      name: 'Riverside Commons LLC',
      type: 'project',
      ein: '**-***3456',
      state: 'SC',
      ownership: 100,
    },
    {
      id: 'ent-cedar',
      name: 'Cedar Mill Phase 2 LLC',
      type: 'project',
      ein: '**-***7890',
      state: 'SC',
      ownership: 85,
    },
    {
      id: 'ent-propman',
      name: 'VanRock Property Management LLC',
      type: 'operating',
      ein: '**-***2345',
      state: 'SC',
      ownership: 100,
    },
  ];

  // Investors in this entity (if any)
  const investors = [
    { id: 'inv-001', name: 'John Smith', type: 'individual', ownership: 4.2, invested: 200000 },
    { id: 'inv-002', name: 'Jane Doe', type: 'trust', entityName: 'Doe Family Trust', ownership: 3.1, invested: 150000 },
    { id: 'inv-003', name: 'Acme Investments LLC', type: 'llc', ownership: 8.5, invested: 400000 },
  ];

  // Load available entities for adding relationships
  useEffect(() => {
    const loadAvailableData = async () => {
      try {
        // Load all entities for dropdown
        const allEntities = await entityService.getAll();
        if (allEntities) {
          setAvailableEntities(allEntities.filter(e => e.id !== entityId));
        }

        // Load available ownership percentage
        const { data: available } = await entityRelationshipService.getAvailableOwnership(entityId);
        setAvailableOwnership(available ?? 100);
      } catch (error) {
        console.error('Error loading entity data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAvailableData();
  }, [entityId]);

  const handleAddRelationship = async () => {
    if (!newRelationship.parentEntityId || !newRelationship.ownershipPercentage) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const percentage = parseFloat(newRelationship.ownershipPercentage);
    if (percentage > availableOwnership) {
      toast({ title: 'Error', description: `Only ${availableOwnership}% ownership is available`, variant: 'destructive' });
      return;
    }

    setAddingRelationship(true);
    try {
      const { data, error } = await entityRelationshipService.create({
        parent_entity_id: newRelationship.parentEntityId,
        child_entity_id: entityId,
        ownership_percentage: percentage,
        relationship_type: 'ownership',
        effective_date: newRelationship.effectiveDate,
        notes: newRelationship.notes,
      });

      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Ownership relationship added' });
        setShowAddDialog(false);
        setNewRelationship({ parentEntityId: '', ownershipPercentage: '', effectiveDate: new Date().toISOString().split('T')[0], notes: '' });
        // Refresh available ownership
        const { data: available } = await entityRelationshipService.getAvailableOwnership(entityId);
        setAvailableOwnership(available ?? 100);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add relationship', variant: 'destructive' });
    } finally {
      setAddingRelationship(false);
    }
  };

  const getTypeConfig = (type) => ({
    holding: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', label: 'Holding' },
    project: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: 'Project SPV' },
    operating: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', label: 'Operating' },
    individual: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', label: 'Individual' },
    trust: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', label: 'Trust' },
    llc: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', label: 'LLC' },
  }[type] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', label: type });

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const toggleSection = (section) => {
    setExpandedNodes(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ownership Structure</h1>
          <p className="text-sm text-gray-500">View the ownership hierarchy for {currentEntity.name}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/accounting/hierarchy">
            <Button variant="outline">
              <GitBranch className="w-4 h-4 mr-2" />View Full Hierarchy
            </Button>
          </Link>
          <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />Add Owner
          </Button>
        </div>
      </div>

      {/* Current Entity Card */}
      <div className="mb-8">
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{currentEntity.name}</h2>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">Current Entity</span>
              </div>
              <p className="text-sm text-gray-500">EIN: {currentEntity.ein} • {currentEntity.state}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Entity Type</p>
              <p className="font-semibold">{getTypeConfig(currentEntity.type).label}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Ownership Chain (Parents) */}
        <div className="bg-white border rounded-lg">
          <div 
            className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection('parent')}
          >
            <div className="flex items-center gap-2">
              <ArrowUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold">Ownership Chain</h3>
              <span className="text-xs text-gray-500">(Who owns this entity)</span>
            </div>
            {expandedNodes.includes('parent') ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
          {expandedNodes.includes('parent') && (
            <div className="p-4">
              <div className="relative">
                {ownershipChain.map((owner, idx) => {
                  const typeConfig = getTypeConfig(owner.type);
                  const isLast = idx === ownershipChain.length - 1;
                  return (
                    <div key={owner.id} className="relative">
                      {/* Connecting line */}
                      {!isLast && (
                        <div className="absolute left-6 top-14 w-0.5 h-8 bg-gray-300" />
                      )}
                      <div className={cn(
                        "flex items-center gap-4 p-3 rounded-lg border-2 mb-2",
                        typeConfig.border, typeConfig.bg
                      )}>
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Building2 className={cn("w-5 h-5", typeConfig.text)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{owner.name}</p>
                            <span className={cn("px-1.5 py-0.5 rounded text-xs", typeConfig.bg, typeConfig.text)}>
                              {typeConfig.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{owner.level}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Percent className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold">{owner.ownership}%</span>
                          </div>
                          <p className="text-xs text-gray-500">of {owner.ownershipOf}</p>
                        </div>
                      </div>
                      {!isLast && (
                        <div className="flex justify-center mb-2">
                          <ArrowDown className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sibling Entities */}
        <div className="bg-white border rounded-lg">
          <div 
            className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection('siblings')}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Sibling Entities</h3>
              <span className="text-xs text-gray-500">(Same parent)</span>
            </div>
            {expandedNodes.includes('siblings') ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
          {expandedNodes.includes('siblings') && (
            <div className="divide-y">
              {siblings.map(sibling => {
                const typeConfig = getTypeConfig(sibling.type);
                return (
                  <Link 
                    key={sibling.id}
                    to={`/accounting/${sibling.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50"
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", typeConfig.bg)}>
                      <Building2 className={cn("w-4 h-4", typeConfig.text)} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{sibling.name}</p>
                      <p className="text-xs text-gray-500">{sibling.ein}</p>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded text-xs", typeConfig.bg, typeConfig.text)}>
                      {typeConfig.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Investors in this Entity */}
        <div className="col-span-2 bg-white border rounded-lg">
          <div 
            className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection('investors')}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Investors in this Entity</h3>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{investors.length} investors</span>
            </div>
            {expandedNodes.includes('investors') ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
          {expandedNodes.includes('investors') && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Investor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Invested</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ownership %</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {investors.map(inv => {
                    const typeConfig = getTypeConfig(inv.type);
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{inv.name}</p>
                          {inv.entityName && <p className="text-xs text-gray-500">{inv.entityName}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("px-2 py-0.5 rounded text-xs", typeConfig.bg, typeConfig.text)}>
                            {typeConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(inv.invested)}</td>
                        <td className="px-4 py-3 text-right font-medium">{inv.ownership}%</td>
                        <td className="px-4 py-3">
                          <Link to={`/investors/${inv.id}`} className="p-1 hover:bg-gray-200 rounded">
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="2" className="px-4 py-3 font-semibold">Total LP Investors</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(investors.reduce((s, i) => s + i.invested, 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {investors.reduce((s, i) => s + i.ownership, 0).toFixed(1)}%
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ownership Summary */}
      <div className="mt-6 bg-gray-50 border rounded-lg p-4">
        <h4 className="font-semibold mb-3">Beneficial Ownership Summary</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-sm text-gray-500">Ultimate Beneficial Owner</p>
            <p className="font-semibold">Bryan de Bruin</p>
            <p className="text-xs text-gray-400">via Olive Brynn LLC → VanRock Holdings</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-sm text-gray-500">Effective Ownership</p>
            <p className="font-semibold">50%</p>
            <p className="text-xs text-gray-400">(100% × 50% × 100%)</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-sm text-gray-500">LP Investor Ownership</p>
            <p className="font-semibold">{investors.reduce((s, i) => s + i.ownership, 0).toFixed(1)}%</p>
            <p className="text-xs text-gray-400">{investors.length} investors</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-sm text-gray-500">Available Ownership</p>
            <p className="font-semibold">{availableOwnership.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">Not yet allocated</p>
          </div>
        </div>
      </div>

      {/* Add Ownership Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Ownership Relationship</DialogTitle>
            <DialogDescription>
              Add a new owner for this entity. Available ownership: {availableOwnership.toFixed(1)}%
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Owner Entity *</Label>
              <Select
                value={newRelationship.parentEntityId}
                onValueChange={(v) => setNewRelationship(prev => ({ ...prev, parentEntityId: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select owner entity" />
                </SelectTrigger>
                <SelectContent>
                  {availableEntities.map(entity => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ownership Percentage *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={availableOwnership}
                value={newRelationship.ownershipPercentage}
                onChange={(e) => setNewRelationship(prev => ({ ...prev, ownershipPercentage: e.target.value }))}
                placeholder={`Max ${availableOwnership}%`}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={newRelationship.effectiveDate}
                onChange={(e) => setNewRelationship(prev => ({ ...prev, effectiveDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={newRelationship.notes}
                onChange={(e) => setNewRelationship(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes about this relationship"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddRelationship}
              disabled={addingRelationship}
              className="bg-[#047857] hover:bg-[#065f46]"
            >
              {addingRelationship ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Ownership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EntityOwnershipPage;
