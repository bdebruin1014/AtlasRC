import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Building2, FileText, Users, Settings,
  DollarSign, Briefcase, ChevronRight, Plus, Loader2, Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';

const mockEntity = {
  id: '1',
  name: 'VanRock Holdings LLC',
  type: 'operating',
  parentEntity: { id: '0', name: 'Olive Brynn LLC' },
  taxId: '23-4567890',
  legalStructure: 'LLC',
  stateOfFormation: 'SC',
  formationDate: '2020-01-15',
  primaryContact: { id: '1', name: 'Bryan De Bruin', email: 'bryan@vanrock.com', phone: '(864) 555-0101' },
  address: {
    line1: '123 Main Street',
    line2: 'Suite 200',
    city: 'Greenville',
    state: 'SC',
    zipCode: '29601',
  },
  notes: 'Primary operating company for all real estate development activities.',
  createdAt: '2020-01-15T10:00:00Z',
  updatedAt: '2024-01-10T14:30:00Z',
  childEntities: [
    { id: '2', name: 'Red Cedar Homes', type: 'operating' },
    { id: '3', name: 'Ambleside Development LLC', type: 'project' },
    { id: '4', name: 'Driftwood JV LLC', type: 'project' },
  ],
  projects: [
    { id: '1', name: 'Watson House Development', status: 'active', budget: 2100000 },
    { id: '2', name: 'Oslo Townhomes', status: 'active', budget: 1500000 },
    { id: '3', name: 'Cedar Mill Phase 1', status: 'completed', budget: 3200000 },
  ],
  financialSummary: {
    totalRevenue: 4250000,
    totalExpenses: 3100000,
    netPosition: 1150000,
    cashBalance: 485000,
  },
};

const TYPE_CONFIG = {
  holding: { label: 'Holding Company', color: 'bg-purple-100 text-purple-800' },
  operating: { label: 'Operating Company', color: 'bg-blue-100 text-blue-800' },
  project: { label: 'Project Entity', color: 'bg-green-100 text-green-800' },
};

const EntityDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState<typeof mockEntity | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // TODO: Fetch entity from API
    setTimeout(() => {
      setEntity(mockEntity);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Entity not found</h2>
        <Button className="mt-4" onClick={() => navigate('/entities')}>
          Back to Entities
        </Button>
      </div>
    );
  }

  const config = TYPE_CONFIG[entity.type as keyof typeof TYPE_CONFIG];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/entities')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-gray-400" />
                  <h1 className="text-xl font-bold text-gray-900">{entity.name}</h1>
                  <Badge className={config.color}>{config.label}</Badge>
                </div>
                {entity.parentEntity && (
                  <p className="text-gray-500 mt-1">
                    Parent: <Link to={`/entities/${entity.parentEntity.id}`} className="text-emerald-600 hover:text-emerald-700">{entity.parentEntity.name}</Link>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/accounting/entities/${entity.id}/ledger`)}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Ledger
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/entities/${id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline">
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="financials">Financial Summary</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Entity Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Entity Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Legal Structure</p>
                      <p className="font-medium">{entity.legalStructure}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tax ID / EIN</p>
                      <p className="font-medium">{entity.taxId || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">State of Formation</p>
                      <p className="font-medium">{entity.stateOfFormation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Formation Date</p>
                      <p className="font-medium">{formatDate(entity.formationDate)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {entity.address.line1}<br />
                      {entity.address.line2 && <>{entity.address.line2}<br /></>}
                      {entity.address.city}, {entity.address.state} {entity.address.zipCode}
                    </p>
                  </div>
                  {entity.notes && (
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="text-gray-700">{entity.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Primary Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Primary Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  {entity.primaryContact ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">{entity.primaryContact.name}</p>
                          <p className="text-sm text-gray-500">{entity.primaryContact.email}</p>
                        </div>
                      </div>
                      <p className="text-gray-600">{entity.primaryContact.phone}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No primary contact set</p>
                  )}
                </CardContent>
              </Card>

              {/* Child Entities */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Child Entities</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/entities/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent>
                  {entity.childEntities.length > 0 ? (
                    <div className="space-y-2">
                      {entity.childEntities.map((child) => {
                        const childConfig = TYPE_CONFIG[child.type as keyof typeof TYPE_CONFIG];
                        return (
                          <div
                            key={child.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                            onClick={() => navigate(`/entities/${child.id}`)}
                          >
                            <div className="flex items-center gap-3">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{child.name}</span>
                              <Badge className={childConfig.color} variant="outline">
                                {childConfig.label}
                              </Badge>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No child entities</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Total Revenue</p>
                      <p className="text-xl font-bold text-green-700">
                        {formatCurrency(entity.financialSummary.totalRevenue, { compact: true })}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600">Total Expenses</p>
                      <p className="text-xl font-bold text-red-700">
                        {formatCurrency(entity.financialSummary.totalExpenses, { compact: true })}
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-emerald-600">Net Position</p>
                      <p className="text-xl font-bold text-emerald-700">
                        {formatCurrency(entity.financialSummary.netPosition, { compact: true })}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Cash Balance</p>
                      <p className="text-xl font-bold text-blue-700">
                        {formatCurrency(entity.financialSummary.cashBalance, { compact: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Projects ({entity.projects.length})</CardTitle>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('/projects/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </CardHeader>
              <CardContent>
                {entity.projects.length > 0 ? (
                  <div className="space-y-2">
                    {entity.projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Budget</p>
                          <p className="font-medium">{formatCurrency(project.budget)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No projects linked to this entity</p>
                    <Button className="mt-4" onClick={() => navigate('/projects/new')}>
                      Create First Project
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Financial Summary</CardTitle>
                <Button variant="outline" onClick={() => navigate(`/accounting/entities/${entity.id}/ledger`)}>
                  View Full Ledger
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(entity.financialSummary.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-700">
                      {formatCurrency(entity.financialSummary.totalExpenses)}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-emerald-600">Net Position</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(entity.financialSummary.netPosition)}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Cash Balance</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(entity.financialSummary.cashBalance)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-500 text-center">
                  <Link to={`/accounting/entities/${entity.id}/ledger`} className="text-emerald-600 hover:text-emerald-700">
                    View detailed transaction history →
                  </Link>
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Entity Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(entity.createdAt, { format: 'long' })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDate(entity.updatedAt, { format: 'long' })}</p>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Danger Zone</h4>
                  <Button variant="outline" className="text-red-600 hover:bg-red-50">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Entity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EntityDetail;
