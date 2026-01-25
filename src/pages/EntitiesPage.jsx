import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2, ChevronRight, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import EntityModal from '@/components/EntityModal';
import entityService from '@/services/entityService';

const TYPE_COLORS = {
  holding: 'bg-purple-600',
  operating: 'bg-blue-600',
  project: 'bg-green-600',
};

const TYPE_LABELS = {
  holding: 'Holding',
  operating: 'Operating',
  project: 'Project LLC',
};

// Mock data for when Supabase isn't connected
const MOCK_ENTITIES = [
  { id: '1', name: 'Atlas Holdings LLC', type: 'holding', tax_id: '12-3456789', parent_id: null },
  { id: '2', name: 'Atlas Development Corp', type: 'operating', tax_id: '23-4567890', parent_id: '1' },
  { id: '3', name: 'Highland Park Development LLC', type: 'project', tax_id: '34-5678901', parent_id: '2' },
  { id: '4', name: 'Riverside Estates LLC', type: 'project', tax_id: '45-6789012', parent_id: '2' },
  { id: '5', name: 'Metro Construction LLC', type: 'operating', tax_id: '56-7890123', parent_id: '1' },
];

const MOCK_HIERARCHY = [
  {
    id: '1', name: 'Atlas Holdings LLC', type: 'holding', tax_id: '12-3456789',
    children: [
      {
        id: '2', name: 'Atlas Development Corp', type: 'operating', tax_id: '23-4567890',
        children: [
          { id: '3', name: 'Highland Park Development LLC', type: 'project', tax_id: '34-5678901', children: [] },
          { id: '4', name: 'Riverside Estates LLC', type: 'project', tax_id: '45-6789012', children: [] },
        ]
      },
      { id: '5', name: 'Metro Construction LLC', type: 'operating', tax_id: '56-7890123', children: [] },
    ]
  }
];

const EntitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [deleteEntity, setDeleteEntity] = useState(null);
  const [expandedEntities, setExpandedEntities] = useState(new Set());

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch entities with fallback to mock data
  const { data: entities = MOCK_ENTITIES, isLoading, error } = useQuery({
    queryKey: ['entities'],
    queryFn: async () => {
      try {
        const data = await entityService.getAll();
        return data && data.length > 0 ? data : MOCK_ENTITIES;
      } catch (e) {
        console.warn('Using mock entity data:', e.message);
        return MOCK_ENTITIES;
      }
    },
    retry: false,
  });

  // Fetch hierarchy for tree view with fallback
  const { data: hierarchy = MOCK_HIERARCHY } = useQuery({
    queryKey: ['entities', 'hierarchy'],
    queryFn: async () => {
      try {
        const data = await entityService.getHierarchy();
        return data && data.length > 0 ? data : MOCK_HIERARCHY;
      } catch (e) {
        console.warn('Using mock hierarchy data:', e.message);
        return MOCK_HIERARCHY;
      }
    },
    retry: false,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: entityService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      setIsModalOpen(false);
      toast({
        title: 'Entity created',
        description: 'The entity has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create entity.',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => entityService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      setEditingEntity(null);
      setIsModalOpen(false);
      toast({
        title: 'Entity updated',
        description: 'The entity has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update entity.',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: entityService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      setDeleteEntity(null);
      toast({
        title: 'Entity deleted',
        description: 'The entity has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete entity.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (formData) => {
    if (editingEntity) {
      updateMutation.mutate({ id: editingEntity.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (entity) => {
    setEditingEntity(entity);
    setIsModalOpen(true);
  };

  const handleDelete = async (entity) => {
    // Check if entity can be deleted
    const { canDelete, reason } = await entityService.canDelete(entity.id);
    if (!canDelete) {
      toast({
        title: 'Cannot delete entity',
        description: reason,
        variant: 'destructive',
      });
      return;
    }
    setDeleteEntity(entity);
  };

  const confirmDelete = () => {
    if (deleteEntity) {
      deleteMutation.mutate(deleteEntity.id);
    }
  };

  const toggleExpand = (entityId) => {
    setExpandedEntities(prev => {
      const next = new Set(prev);
      if (next.has(entityId)) {
        next.delete(entityId);
      } else {
        next.add(entityId);
      }
      return next;
    });
  };

  // Filter entities by search
  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entity.tax_id && entity.tax_id.includes(searchTerm))
  );

  // Render entity tree node
  const renderEntityNode = (entity, depth = 0) => {
    const hasChildren = entity.children && entity.children.length > 0;
    const isExpanded = expandedEntities.has(entity.id);

    return (
      <div key={entity.id}>
        <div
          className={`flex items-center justify-between p-3 hover:bg-slate-800/50 border-b border-slate-700`}
          style={{ marginLeft: depth * 24 }}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(entity.id)}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <ChevronRight
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            <Building2 className="h-5 w-5 text-slate-400" />
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{entity.name}</span>
                <Badge className={`${TYPE_COLORS[entity.type]} text-white text-xs`}>
                  {TYPE_LABELS[entity.type]}
                </Badge>
              </div>
              {entity.tax_id && (
                <span className="text-slate-400 text-sm">EIN: {entity.tax_id}</span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem
                onClick={() => handleEdit(entity)}
                className="text-slate-200 hover:bg-slate-700"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(entity)}
                className="text-red-400 hover:bg-slate-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {entity.children.map(child => renderEntityNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Entities</h1>
          <p className="text-slate-400">
            Manage your company hierarchy and legal entities
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingEntity(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Entity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{entities.length}</div>
          <div className="text-slate-400 text-sm">Total Entities</div>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">
            {entities.filter(e => e.type === 'holding').length}
          </div>
          <div className="text-slate-400 text-sm">Holding Companies</div>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">
            {entities.filter(e => e.type === 'operating').length}
          </div>
          <div className="text-slate-400 text-sm">Operating Companies</div>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {entities.filter(e => e.type === 'project').length}
          </div>
          <div className="text-slate-400 text-sm">Project LLCs</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search entities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-slate-800 border-slate-600 text-white"
        />
      </div>

      {/* Entity List */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">
            Loading entities...
          </div>
        ) : searchTerm ? (
          // Flat list when searching
          filteredEntities.length > 0 ? (
            filteredEntities.map(entity => (
              <div
                key={entity.id}
                className="flex items-center justify-between p-3 hover:bg-slate-800/50 border-b border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{entity.name}</span>
                      <Badge className={`${TYPE_COLORS[entity.type]} text-white text-xs`}>
                        {TYPE_LABELS[entity.type]}
                      </Badge>
                    </div>
                    {entity.tax_id && (
                      <span className="text-slate-400 text-sm">EIN: {entity.tax_id}</span>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                    <DropdownMenuItem
                      onClick={() => handleEdit(entity)}
                      className="text-slate-200 hover:bg-slate-700"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(entity)}
                      className="text-red-400 hover:bg-slate-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400">
              No entities found matching "{searchTerm}"
            </div>
          )
        ) : (
          // Tree view when not searching
          hierarchy.length > 0 ? (
            hierarchy.map(entity => renderEntityNode(entity))
          ) : (
            <div className="p-8 text-center text-slate-400">
              No entities yet. Click "Add Entity" to create one.
            </div>
          )
        )}
      </div>

      {/* Entity Modal */}
      <EntityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntity(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingEntity}
        entities={entities}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEntity} onOpenChange={() => setDeleteEntity(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Entity</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete "{deleteEntity?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EntitiesPage;
