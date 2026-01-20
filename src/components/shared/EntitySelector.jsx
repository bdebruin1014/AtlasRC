import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ENTITY_TYPES = [
  { value: 'project_entity', label: 'Project Entity (SPE)' },
  { value: 'holding_company', label: 'Holding Company' },
  { value: 'operating_entity', label: 'Operating Entity' },
  { value: 'individual', label: 'Individual' },
  { value: 'trust', label: 'Trust' },
  { value: 'passive_investment', label: 'Passive Investment' },
];

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
];

export function EntitySelector({ 
  value, 
  onChange, 
  required = false,
  placeholder = "Select entity...",
  showCreateButton = true,
  filterTypes = null, // Array of entity types to show, null for all
  excludeIds = [], // Entity IDs to exclude from list
  className = "",
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch entities
  const { data: entities = [], isLoading } = useQuery({
    queryKey: ['entities', filterTypes],
    queryFn: async () => {
      let query = supabase
        .from('entities')
        .select('id, name, entity_type, parent_id, tax_id')
        .eq('is_active', true)
        .order('name');
      
      if (filterTypes && filterTypes.length > 0) {
        query = query.in('entity_type', filterTypes);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Filter entities based on search and exclusions
  const filteredEntities = entities.filter(entity => {
    if (excludeIds.includes(entity.id)) return false;
    if (!searchQuery) return true;
    return entity.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Group entities by type for display
  const groupedEntities = filteredEntities.reduce((acc, entity) => {
    const type = entity.entity_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(entity);
    return acc;
  }, {});

  // Create entity mutation
  const createEntityMutation = useMutation({
    mutationFn: async (newEntity) => {
      const { data, error } = await supabase
        .from('entities')
        .insert([{
          ...newEntity,
          is_active: true,
          quick_created: true,
          quick_created_from: 'entity_selector',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      onChange(data.id);
      setIsCreateModalOpen(false);
      toast({
        title: "Entity Created",
        description: `${data.name} has been created successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const selectedEntity = entities.find(e => e.id === value);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={isLoading ? "Loading..." : placeholder}>
              {selectedEntity && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEntity.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({ENTITY_TYPES.find(t => t.value === selectedEntity.entity_type)?.label || selectedEntity.entity_type})
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {Object.entries(groupedEntities).map(([type, typeEntities]) => (
              <div key={type}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                  {ENTITY_TYPES.find(t => t.value === type)?.label || type}
                </div>
                {typeEntities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{entity.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
            {filteredEntities.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No entities found
              </div>
            )}
          </SelectContent>
        </Select>
        
        {showCreateButton && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" title="Create New Entity">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <QuickEntityCreateForm
                onSubmit={(data) => createEntityMutation.mutate(data)}
                onCancel={() => setIsCreateModalOpen(false)}
                isLoading={createEntityMutation.isPending}
                parentEntities={entities.filter(e => 
                  ['holding_company', 'operating_entity'].includes(e.entity_type)
                )}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

// Quick Entity Create Form Component
function QuickEntityCreateForm({ onSubmit, onCancel, isLoading, parentEntities }) {
  const [formData, setFormData] = useState({
    name: '',
    entity_type: 'project_entity',
    parent_id: null,
    tax_id: '',
    state_of_formation: '',
    formation_date: '',
    registered_agent: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create New Entity</DialogTitle>
        <DialogDescription>
          Quickly create a new entity. You can complete additional details later in Accounting.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        {/* Entity Name */}
        <div className="grid gap-2">
          <Label htmlFor="name" className="required">Entity Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g., Oak Ridge Development LLC"
            required
          />
        </div>

        {/* Entity Type */}
        <div className="grid gap-2">
          <Label htmlFor="entity_type" className="required">Entity Type</Label>
          <Select 
            value={formData.entity_type} 
            onValueChange={(v) => updateField('entity_type', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Parent Entity */}
        <div className="grid gap-2">
          <Label htmlFor="parent_id">Parent Entity</Label>
          <Select 
            value={formData.parent_id || ''} 
            onValueChange={(v) => updateField('parent_id', v || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent entity (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {parentEntities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tax ID */}
        <div className="grid gap-2">
          <Label htmlFor="tax_id">Tax ID (EIN)</Label>
          <Input
            id="tax_id"
            value={formData.tax_id}
            onChange={(e) => updateField('tax_id', e.target.value)}
            placeholder="XX-XXXXXXX"
          />
        </div>

        {/* Two columns for State and Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="state_of_formation">State of Formation</Label>
            <Select 
              value={formData.state_of_formation} 
              onValueChange={(v) => updateField('state_of_formation', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="formation_date">Formation Date</Label>
            <Input
              id="formation_date"
              type="date"
              value={formData.formation_date}
              onChange={(e) => updateField('formation_date', e.target.value)}
            />
          </div>
        </div>

        {/* Registered Agent */}
        <div className="grid gap-2">
          <Label htmlFor="registered_agent">Registered Agent</Label>
          <Input
            id="registered_agent"
            value={formData.registered_agent}
            onChange={(e) => updateField('registered_agent', e.target.value)}
            placeholder="Registered agent name and address"
          />
        </div>

        {/* Notes */}
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Additional notes..."
            rows={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.name}>
          {isLoading ? 'Creating...' : 'Create Entity'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default EntitySelector;
