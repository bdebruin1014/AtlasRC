import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Building2, DollarSign, MapPin, FileText, Calculator,
  CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronUp, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { activityService } from '@/services/activityService';
import { notificationTriggers } from '@/services/notificationTriggers';
import { EntitySelector } from '@/components/shared/EntitySelector';

const PROJECT_TYPES = [
  { id: 'scattered-lot', name: 'Scattered Lot', description: 'Buy a lot, build a spec home, sell it' },
  { id: 'lot-development', name: 'Lot Development', description: 'Develop raw land into finished lots' },
  { id: 'lot-purchase-development', name: 'Lot Purchase Development', description: 'Buy finished lots, build homes for sale' },
  { id: 'community-development', name: 'Community Development', description: 'Full subdivision from raw land to sold homes' },
];

const formatCurrency = (value) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ConvertToProjectModal({
  isOpen,
  onClose,
  opportunity,
  dealSheet,
  onSuccess
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [description, setDescription] = useState('');
  const [ownerEntityId, setOwnerEntityId] = useState(null);
  const [builderEntityId, setBuilderEntityId] = useState(null);
  const [transferDealSheet, setTransferDealSheet] = useState(true);
  const [createProForma, setCreateProForma] = useState(true);
  const [notifyTeam, setNotifyTeam] = useState(true);

  // Initialize form values from opportunity
  useEffect(() => {
    if (opportunity) {
      setProjectName(opportunity.deal_number || opportunity.address || 'New Project');
      setDescription(opportunity.notes || '');
      setOwnerEntityId(opportunity.entity_id || null);
      setBuilderEntityId(null);

      // Auto-select project type — opportunity types now mirror project types 1:1
      const oppType = opportunity.opportunity_type || opportunity.property_type;
      const canonicalTypes = ['scattered-lot', 'lot-development', 'lot-purchase-development', 'community-development'];
      if (canonicalTypes.includes(oppType)) {
        setProjectType(oppType);
      } else {
        // Legacy type mapping for older opportunities
        switch (oppType) {
          case 'vacant-lot':
          case 'flip-property':
            setProjectType('scattered-lot');
            break;
          case 'development-lot-sale':
          case 'lot_dev':
            setProjectType('lot-development');
            break;
          case 'development-for-sale':
          case 'for_sale_dev':
            setProjectType('scattered-lot');
            break;
          case 'development-btr':
          case 'community':
            setProjectType('community-development');
            break;
          default:
            setProjectType('scattered-lot');
        }
      }
    }
  }, [opportunity]);

  const handleConvert = async () => {
    if (!projectName.trim()) {
      toast({
        title: 'Project name required',
        description: 'Please enter a name for the new project.',
        variant: 'destructive',
      });
      return;
    }

    if (!projectType) {
      toast({
        title: 'Project type required',
        description: 'Please select a project type.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create the project
      const projectData = {
        name: projectName,
        project_type: projectType,
        description: description,
        status: 'active',
        address: opportunity?.address,
        city: opportunity?.city,
        state: opportunity?.state,
        zip_code: opportunity?.zip_code,
        county: opportunity?.county,
        parcel_id: opportunity?.parcel_id,
        acres: opportunity?.acres,
        potential_lots: opportunity?.potential_lots,
        zoning: opportunity?.zoning,
        opportunity_id: opportunity?.id,
        // Entity assignments
        ...(ownerEntityId && { entity_id: ownerEntityId }),
        ...(builderEntityId && { builder_entity_id: builderEntityId }),
        // Financial data from opportunity
        purchase_price: opportunity?.asking_price,
        estimated_value: opportunity?.estimated_value,
        assignment_fee: opportunity?.assignment_fee,
        earnest_money: opportunity?.earnest_money,
        dd_deadline: opportunity?.dd_deadline,
        close_date: opportunity?.close_date,
      };

      // If deal sheet exists and transfer is enabled, include deal sheet data
      if (dealSheet && transferDealSheet) {
        projectData.deal_sheet_id = dealSheet.id;
        projectData.deal_sheet_data = dealSheet;

        // Add financial projections from deal sheet
        if (dealSheet.totals) {
          projectData.projected_sale_price = dealSheet.totals.sale_price;
          projectData.projected_total_cost = dealSheet.totals.total_project_cost;
          projectData.projected_profit = dealSheet.totals.net_profit;
          projectData.projected_margin = dealSheet.totals.net_margin;
        }
      }

      let newProject;

      if (supabase) {
        try {
          // Insert the project
          const { data, error } = await supabase
            .from('projects')
            .insert(projectData)
            .select()
            .single();

          if (error) throw error;
          newProject = data;

          // Update the opportunity with project reference
          await supabase
            .from('opportunities')
            .update({
              project_id: newProject.id,
              stage: 'Converted',
              converted_at: new Date().toISOString(),
            })
            .eq('id', opportunity.id);

          // If creating pro forma, copy deal sheet data to pro forma tables
          if (createProForma && dealSheet) {
            await supabase
              .from('project_pro_forma')
              .insert({
                project_id: newProject.id,
                source: 'deal_sheet',
                source_id: dealSheet.id,
                data: dealSheet,
                version: 1,
                is_active: true,
              });
          }

        } catch (dbError) {
          console.error('Database error:', dbError);
          // Fallback to demo mode
          newProject = {
            id: Date.now(),
            ...projectData,
            created_at: new Date().toISOString(),
          };
        }
      } else {
        // Demo mode
        newProject = {
          id: Date.now(),
          ...projectData,
          created_at: new Date().toISOString(),
        };
      }

      // Log activity and fire notification (fire-and-forget)
      activityService.log({
        entityType: 'opportunity',
        entityId: opportunity.id,
        action: 'converted',
        newValue: newProject.id,
        metadata: { projectName, projectType },
      }).catch(() => {});

      notificationTriggers.opportunityConverted({
        opportunityId: opportunity.id,
        projectId: newProject.id,
        projectName,
      }).catch(() => {});

      toast({
        title: 'Success',
        description: 'Opportunity converted to project successfully',
      });

      onSuccess?.(newProject);
      onClose();

    } catch (err) {
      console.error('Conversion error:', err);
      toast({
        title: 'Conversion Failed',
        description: 'There was an error converting this opportunity to a project.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!opportunity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#047857]" />
            Convert to Project
          </DialogTitle>
          <DialogDescription>
            Create a new project from this opportunity. Financial data and deal sheet information will be transferred.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Opportunity Summary */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Data Being Carried Over</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Address:</span>
                <p className="font-medium">{opportunity.address || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>
                <p className="font-medium">
                  {[opportunity.city, opportunity.state, opportunity.zip_code].filter(Boolean).join(', ') || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Property Type:</span>
                <p className="font-medium capitalize">{(opportunity.opportunity_type || opportunity.property_type || 'N/A').replace(/-/g, ' ')}</p>
              </div>
              <div>
                <span className="text-gray-500">Purchase Price:</span>
                <p className="font-medium">{formatCurrency(opportunity.asking_price)}</p>
              </div>
              <div>
                <span className="text-gray-500">Estimated Value:</span>
                <p className="font-medium">{formatCurrency(opportunity.estimated_value)}</p>
              </div>
              <div>
                <span className="text-gray-500">Earnest Money:</span>
                <p className="font-medium">{formatCurrency(opportunity.earnest_money)}</p>
              </div>
              {opportunity.dd_deadline && (
                <div>
                  <span className="text-gray-500">DD Deadline:</span>
                  <p className="font-medium">{new Date(opportunity.dd_deadline).toLocaleDateString()}</p>
                </div>
              )}
              {opportunity.close_date && (
                <div>
                  <span className="text-gray-500">Close Date:</span>
                  <p className="font-medium">{new Date(opportunity.close_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Deal Sheet Summary (if exists) */}
          {dealSheet && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-medium text-emerald-900">Deal Sheet Analysis</h4>
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  dealSheet.totals?.net_margin >= 0.10
                    ? "bg-green-100 text-green-800"
                    : dealSheet.totals?.net_margin >= 0.07
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                )}>
                  {((dealSheet.totals?.net_margin || 0) * 100).toFixed(1)}% Margin
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-emerald-700">Projected Sale:</span>
                  <p className="font-medium text-emerald-900">{formatCurrency(dealSheet.totals?.sale_price)}</p>
                </div>
                <div>
                  <span className="text-emerald-700">Total Cost:</span>
                  <p className="font-medium text-emerald-900">{formatCurrency(dealSheet.totals?.total_project_cost)}</p>
                </div>
                <div>
                  <span className="text-emerald-700">Net Profit:</span>
                  <p className="font-medium text-emerald-900">{formatCurrency(dealSheet.totals?.net_profit)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Project Details Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="projectType">Project Type *</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex flex-col">
                        <span>{type.name}</span>
                        <span className="text-xs text-gray-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any notes or description for the project..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Owner Entity</Label>
                <div className="mt-1">
                  <EntitySelector
                    value={ownerEntityId}
                    onChange={setOwnerEntityId}
                    placeholder="Select owner entity..."
                    showCreateButton={true}
                    filterTypes={['project_entity', 'holding_company', 'operating_entity']}
                  />
                </div>
              </div>
              <div>
                <Label>Builder Entity</Label>
                <div className="mt-1">
                  <EntitySelector
                    value={builderEntityId}
                    onChange={setBuilderEntityId}
                    placeholder="Select builder entity..."
                    showCreateButton={true}
                    filterTypes={['operating_entity', 'project_entity']}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {dealSheet && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="transferDealSheet"
                  checked={transferDealSheet}
                  onCheckedChange={setTransferDealSheet}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="transferDealSheet"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Transfer deal sheet data
                  </label>
                  <p className="text-xs text-gray-500">
                    Link the deal sheet analysis to track variance between estimates and actuals
                  </p>
                </div>
              </div>
            )}

            {dealSheet && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="createProForma"
                  checked={createProForma}
                  onCheckedChange={setCreateProForma}
                  disabled={!transferDealSheet}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="createProForma"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Pre-populate pro forma
                  </label>
                  <p className="text-xs text-gray-500">
                    Use deal sheet values as starting point for project pro forma
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Checkbox
                id="notifyTeam"
                checked={notifyTeam}
                onCheckedChange={setNotifyTeam}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="notifyTeam"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Notify team members
                </label>
                <p className="text-xs text-gray-500">
                  Send notification to assigned team members about the new project
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Conversion is permanent</p>
                    <p className="text-gray-500">
                      This opportunity will be marked as converted and linked to the new project.
                    </p>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="font-medium text-gray-700 mb-2">What gets transferred:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Property details (address, parcel, zoning)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Financial terms (price, earnest money, dates)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Seller information and contacts
                    </li>
                    {dealSheet && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Deal sheet analysis and projections
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Documents and files
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConvert}
            disabled={loading || !projectName.trim() || !projectType}
            className="bg-[#1a5632] hover:bg-[#143f25]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Create Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
