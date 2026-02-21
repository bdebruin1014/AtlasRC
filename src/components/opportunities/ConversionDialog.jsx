import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight, Building2, Loader2, Calendar, DollarSign, MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { EntitySelector } from '@/components/shared/EntitySelector';
import { convertOpportunity } from '@/services/convertOpportunityService';

const PROJECT_TYPES = [
  { id: 'scattered-lot', name: 'Scattered Lot' },
  { id: 'lot-development', name: 'Lot Development' },
  { id: 'lot-purchase-development', name: 'Lot Purchase Development' },
  { id: 'community-development', name: 'Community Development' },
];

/** Map an opportunity type value to the corresponding project type. */
function mapOpportunityType(oppType) {
  const mapping = {
    'lot_dev': 'lot-development',
    'lot-development': 'lot-development',
    'for_sale_dev': 'scattered-lot',
    'scattered-lot': 'scattered-lot',
    'lot-purchase-development': 'lot-purchase-development',
    'community-development': 'community-development',
    'vacant-lot': 'scattered-lot',
    'flip-property': 'scattered-lot',
    'development-lot-sale': 'lot-development',
    'development-for-sale': 'scattered-lot',
    'development-btr': 'community-development',
    'community': 'community-development',
  };
  return mapping[oppType] || 'scattered-lot';
}

const formatCurrency = (value) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ConversionDialog({
  isOpen,
  onClose,
  opportunity,
  onSuccess,
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Editable fields
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [ownerEntityId, setOwnerEntityId] = useState(null);
  const [builderEntityId, setBuilderEntityId] = useState(null);

  // Re-initialize whenever the dialog opens with a (possibly different) opportunity
  useEffect(() => {
    if (opportunity && isOpen) {
      setProjectName(
        opportunity.deal_number || opportunity.address || 'New Project',
      );
      const oppType =
        opportunity.opportunity_type || opportunity.property_type;
      setProjectType(mapOpportunityType(oppType));
      setOwnerEntityId(opportunity.entity_id || null);
      setBuilderEntityId(null);
    }
  }, [opportunity, isOpen]);

  // ── mutation ──────────────────────────────────────────────────────────
  const convertMutation = useMutation({
    mutationFn: convertOpportunity,
    onSuccess: (data) => {
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({
        queryKey: ['opportunity', opportunity?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      toast({
        title: 'Success',
        description: 'Opportunity converted to project successfully',
      });

      onSuccess?.(data);
      onClose();
    },
    onError: (err) => {
      toast({
        title: 'Conversion Failed',
        description:
          err.message || 'There was an error converting this opportunity.',
        variant: 'destructive',
      });
    },
  });

  // ── handlers ──────────────────────────────────────────────────────────
  const handleConvert = () => {
    if (!projectName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Project name is required.',
        variant: 'destructive',
      });
      return;
    }
    if (!projectType) {
      toast({
        title: 'Validation Error',
        description: 'Project type is required.',
        variant: 'destructive',
      });
      return;
    }

    convertMutation.mutate({
      opportunity_id: opportunity.id,
      project_name: projectName.trim(),
      project_type: projectType,
      owner_entity_id: ownerEntityId,
      builder_entity_id: builderEntityId,
    });
  };

  if (!opportunity) return null;

  const loading = convertMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1a5632]" />
            Convert to Project
          </DialogTitle>
          <DialogDescription>
            Create a new project from this opportunity. The following data will
            be carried over.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ── Summary of data being carried over ─────────────────────── */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Data Being Carried Over
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-gray-500">Address</span>
                  <p className="font-medium">
                    {opportunity.address || 'N/A'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {[
                      opportunity.city,
                      opportunity.state,
                      opportunity.zip_code,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-gray-500">Type</span>
                <p className="font-medium capitalize">
                  {(
                    opportunity.opportunity_type ||
                    opportunity.property_type ||
                    'N/A'
                  ).replace(/[-_]/g, ' ')}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-gray-500">Purchase Price</span>
                  <p className="font-medium">
                    {formatCurrency(opportunity.asking_price)}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-gray-500">Entity</span>
                <p className="font-medium">
                  {opportunity.entity_name || opportunity.entity_id || 'None'}
                </p>
              </div>

              {opportunity.dd_deadline && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-500">DD Deadline</span>
                    <p className="font-medium">
                      {new Date(
                        opportunity.dd_deadline,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {opportunity.close_date && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-500">Close Date</span>
                    <p className="font-medium">
                      {new Date(
                        opportunity.close_date,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Editable fields ────────────────────────────────────────── */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="convProjectName">Project Name *</Label>
              <Input
                id="convProjectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="convProjectType">Project Type *</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    filterTypes={[
                      'project_entity',
                      'holding_company',
                      'operating_entity',
                    ]}
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
                Convert
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
