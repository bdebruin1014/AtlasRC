import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Building2, ChevronRight, ChevronDown, MoreHorizontal,
  Edit, Trash2, FileText, List, GitBranch, Download, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { cn, formatCurrency } from '@/lib/utils';
import { entityService } from '@/services/entityService';

interface Entity {
  id: string;
  name: string;
  type: 'holding' | 'operating' | 'project';
  parentId: string | null;
  taxId?: string;
  projectCount: number;
  totalAssets: number;
  createdAt: string;
  children?: Entity[];
}

// Default mock data for fallback
const defaultEntities: Entity[] = [
  {
    id: '1',
    name: 'Olive Brynn LLC',
    type: 'holding',
    parentId: null,
    taxId: '12-3456789',
    projectCount: 0,
    totalAssets: 5200000,
    createdAt: '2019-03-01',
    children: [
      {
        id: '2',
        name: 'VanRock Holdings LLC',
        type: 'operating',
        parentId: '1',
        taxId: '23-4567890',
        projectCount: 5,
        totalAssets: 3800000,
        createdAt: '2020-01-15',
        children: [
          {
            id: '3',
            name: 'Red Cedar Homes',
            type: 'operating',
            parentId: '2',
            projectCount: 2,
            totalAssets: 1200000,
            createdAt: '2022-06-01',
          },
          {
            id: '4',
            name: 'Ambleside Development LLC',
            type: 'project',
            parentId: '2',
            taxId: '34-5678901',
            projectCount: 1,
            totalAssets: 2100000,
            createdAt: '2023-03-15',
          },
          {
            id: '5',
            name: 'Driftwood JV LLC',
            type: 'project',
            parentId: '2',
            taxId: '45-6789012',
            projectCount: 1,
            totalAssets: 850000,
            createdAt: '2023-09-01',
          },
        ],
      },
    ],
  },
];

const TYPE_CONFIG = {
  holding: { label: 'Holding', color: 'bg-purple-100 text-purple-800' },
  operating: { label: 'Operating', color: 'bg-blue-100 text-blue-800' },
  project: { label: 'Project', color: 'bg-green-100 text-green-800' },
};

const EntitiesList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1', '2']));
  const [deleteEntity, setDeleteEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<Entity[]>(defaultEntities);
  const [deleting, setDeleting] = useState(false);

  // Load entities from service
  useEffect(() => {
    const loadEntities = async () => {
      try {
        // Load hierarchy to get tree structure
        const hierarchyData = await entityService.getHierarchy();
        if (hierarchyData && hierarchyData.length > 0) {
          // Map service data to component format
          const mapEntity = (e: any): Entity => ({
            id: e.id,
            name: e.name,
            type: e.type || 'operating',
            parentId: e.parent_entity_id || null,
            taxId: e.tax_id,
            projectCount: e.project_count || 0,
            totalAssets: e.total_assets || 0,
            createdAt: e.created_at,
            children: e.children?.map(mapEntity),
          });
          setEntities(hierarchyData.map(mapEntity));
        }
      } catch (error) {
        console.warn('Using default entities data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEntities();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const flattenEntities = (entities: Entity[]): Entity[] => {
    const result: Entity[] = [];
    const flatten = (items: Entity[]) => {
      items.forEach((item) => {
        result.push(item);
        if (item.children) {
          flatten(item.children);
        }
      });
    };
    flatten(entities);
    return result;
  };

  const allEntities = flattenEntities(entities);

  const filteredEntities = allEntities.filter((entity) => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entity.taxId && entity.taxId.includes(searchTerm));
    const matchesType = typeFilter === 'all' || entity.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDelete = async () => {
    if (!deleteEntity) return;
    setDeleting(true);
    try {
      await entityService.delete(deleteEntity.id);
      // Reload entities after deletion
      const hierarchyData = await entityService.getHierarchy();
      if (hierarchyData && hierarchyData.length > 0) {
        const mapEntity = (e: any): Entity => ({
          id: e.id,
          name: e.name,
          type: e.type || 'operating',
          parentId: e.parent_entity_id || null,
          taxId: e.tax_id,
          projectCount: e.project_count || 0,
          totalAssets: e.total_assets || 0,
          createdAt: e.created_at,
          children: e.children?.map(mapEntity),
        });
        setEntities(hierarchyData.map(mapEntity));
      }
      toast({
        title: 'Entity deleted',
        description: `${deleteEntity.name} has been deleted`,
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete entity',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteEntity(null);
    }
  };

  const renderTreeNode = (entity: Entity, depth: number = 0) => {
    const hasChildren = entity.children && entity.children.length > 0;
    const isExpanded = expandedIds.has(entity.id);
    const config = TYPE_CONFIG[entity.type];

    return (
      <div key={entity.id}>
        <div
          className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
          style={{ paddingLeft: `${16 + depth * 24}px` }}
          onClick={() => navigate(`/entities/${entity.id}`)}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(entity.id);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <Building2 className="w-5 h-5 text-gray-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{entity.name}</span>
                <Badge className={config.color}>{config.label}</Badge>
              </div>
              {entity.taxId && (
                <span className="text-sm text-gray-500">EIN: {entity.taxId}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-500">Projects</p>
              <p className="font-medium">{entity.projectCount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Assets</p>
              <p className="font-medium">{formatCurrency(entity.totalAssets, { compact: true })}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/entities/${entity.id}/edit`);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/accounting/entities/${entity.id}/ledger`);
                }}>
                  <FileText className="w-4 h-4 mr-2" />
                  View Ledger
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteEntity(entity);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {entity.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entities</h1>
          <p className="text-gray-500">
            {allEntities.length} entities • {formatCurrency(
              allEntities.reduce((sum, e) => sum + e.totalAssets, 0),
              { compact: true }
            )} total assets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => navigate('/entities/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Entity
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="holding">Holding</SelectItem>
            <SelectItem value="operating">Operating</SelectItem>
            <SelectItem value="project">Project</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 bg-white border rounded-md p-1">
          <Button
            variant={viewMode === 'tree' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('tree')}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Tree
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4 mr-2" />
            Table
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Entities</p>
            <p className="text-2xl font-bold text-gray-900">{allEntities.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Holding Companies</p>
            <p className="text-2xl font-bold text-purple-600">
              {allEntities.filter((e) => e.type === 'holding').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Operating Companies</p>
            <p className="text-2xl font-bold text-blue-600">
              {allEntities.filter((e) => e.type === 'operating').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Project Entities</p>
            <p className="text-2xl font-bold text-green-600">
              {allEntities.filter((e) => e.type === 'project').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entity List */}
      <Card className="bg-white">
        {viewMode === 'tree' ? (
          <div>
            {searchTerm || typeFilter !== 'all' ? (
              // Flat filtered list
              filteredEntities.length > 0 ? (
                filteredEntities.map((entity) => {
                  const config = TYPE_CONFIG[entity.type];
                  return (
                    <div
                      key={entity.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                      onClick={() => navigate(`/entities/${entity.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{entity.name}</span>
                            <Badge className={config.color}>{config.label}</Badge>
                          </div>
                          {entity.taxId && (
                            <span className="text-sm text-gray-500">EIN: {entity.taxId}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No entities found matching your criteria
                </div>
              )
            ) : (
              // Tree view
              entities.map((entity) => renderTreeNode(entity))
            )}
          </div>
        ) : (
          // Table view
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">Name</th>
                  <th className="text-left p-4 font-medium text-gray-600">Type</th>
                  <th className="text-left p-4 font-medium text-gray-600">Parent</th>
                  <th className="text-left p-4 font-medium text-gray-600">Projects</th>
                  <th className="text-left p-4 font-medium text-gray-600">Assets</th>
                  <th className="text-left p-4 font-medium text-gray-600">Created</th>
                  <th className="text-right p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntities.map((entity) => {
                  const config = TYPE_CONFIG[entity.type];
                  const parent = allEntities.find((e) => e.id === entity.parentId);
                  return (
                    <tr
                      key={entity.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/entities/${entity.id}`)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{entity.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={config.color}>{config.label}</Badge>
                      </td>
                      <td className="p-4 text-gray-600">
                        {parent ? parent.name : '-'}
                      </td>
                      <td className="p-4 text-gray-600">{entity.projectCount}</td>
                      <td className="p-4 text-gray-600">
                        {formatCurrency(entity.totalAssets, { compact: true })}
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(entity.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/entities/${entity.id}/edit`);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteEntity(entity);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEntity} onOpenChange={() => setDeleteEntity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteEntity?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EntitiesList;
