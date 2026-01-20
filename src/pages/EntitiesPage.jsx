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

const EntitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [deleteEntity, setDeleteEntity] = useState(null);
  const [expandedEntities, setExpandedEntities] = useState(new Set());

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch entities
  const { data: entities = [], isLoading, error } = useQuery({
    queryKey: ['entities'],
    queryFn: entityService.getAll,
  });

  // Fetch hierarchy for tree view
  const { data: hierarchy = [] } = useQuery({
    queryKey: ['entities', 'hierarchy'],
    queryFn: entityService.getHierarchy,
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

  if (error) {
    return (
      <div className="p-6 text-red-400">
        Error loading entities: {error.message}
      </div>
    );
  }

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
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, ChevronRight, DollarSign, Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';

const mockEntities = [
  { id: 1, name: 'VanRock Holdings LLC', type: 'Holding Company', status: 'active', projects: 5, assets: 10, cash: 2300000, equity: 15200000 },
  { id: 2, name: 'Watson House LLC', type: 'Project SPE', status: 'active', projects: 1, assets: 0, cash: 125000, equity: 5500000 },
  { id: 3, name: 'Oslo Development LLC', type: 'Asset Entity', status: 'active', projects: 0, assets: 1, cash: 85000, equity: 3200000 },
  { id: 4, name: 'Carolina Affordable Housing', type: 'Nonprofit', status: 'active', projects: 2, assets: 2, cash: 320000, equity: 4500000 },
];

const typeColors = {
  'Holding Company': 'bg-blue-100 text-blue-800',
  'Project SPE': 'bg-yellow-100 text-yellow-800',
  'Asset Entity': 'bg-green-100 text-green-800',
  'Nonprofit': 'bg-purple-100 text-purple-800',
};

const EntitiesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredEntities = mockEntities.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEquity = mockEntities.reduce((sum, e) => sum + e.equity, 0);
  const totalCash = mockEntities.reduce((sum, e) => sum + e.cash, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entities</h1>
          <p className="text-gray-500">{mockEntities.length} entities • {formatCurrency(totalEquity, { compact: true })} total equity</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Entity
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Entities</p>
              <p className="text-2xl font-bold text-gray-900">{mockEntities.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Cash</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCash, { compact: true })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Equity</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEquity, { compact: true })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Entities List */}
      <Card>
        <div className="divide-y divide-gray-100">
          {filteredEntities.map(entity => (
            <div 
              key={entity.id}
              onClick={() => navigate(`/accounting/entity/${entity.id}`)}
              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{entity.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge className={cn('text-xs', typeColors[entity.type])}>
                      {entity.type}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {entity.projects} projects • {entity.assets} assets
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Cash</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(entity.cash, { compact: true })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Equity</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(entity.equity, { compact: true })}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EntitiesPage;
