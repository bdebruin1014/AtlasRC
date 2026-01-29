import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  FileText,
  Building2,
  Users,
  Calendar,
  Download,
  Upload,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock checklist templates
const checklistTemplates = [
  { id: 1, name: 'Land Acquisition', categories: 8, items: 45 },
  { id: 2, name: 'Multifamily Acquisition', categories: 10, items: 62 },
  { id: 3, name: 'Commercial Property', categories: 9, items: 55 },
  { id: 4, name: 'Development Deal', categories: 12, items: 78 }
];

// Mock active checklists
const initialChecklists = [
  {
    id: 1,
    projectName: 'Oak Street Industrial',
    template: 'Commercial Property',
    status: 'In Progress',
    startDate: '2024-01-05',
    dueDate: '2024-01-30',
    completedItems: 38,
    totalItems: 55,
    assignee: 'Sarah Chen',
    categories: [
      {
        name: 'Legal & Title',
        items: [
          { id: 1, task: 'Order preliminary title report', status: 'completed', dueDate: '2024-01-08', notes: 'Received 1/10' },
          { id: 2, task: 'Review title exceptions', status: 'completed', dueDate: '2024-01-12', notes: '' },
          { id: 3, task: 'Order ALTA survey', status: 'completed', dueDate: '2024-01-10', notes: 'In progress' },
          { id: 4, task: 'Review existing leases', status: 'in_progress', dueDate: '2024-01-15', notes: '3 of 5 reviewed' },
          { id: 5, task: 'Verify zoning compliance', status: 'pending', dueDate: '2024-01-18', notes: '' },
          { id: 6, task: 'Review CC&Rs/easements', status: 'pending', dueDate: '2024-01-20', notes: '' }
        ]
      },
      {
        name: 'Environmental',
        items: [
          { id: 7, task: 'Order Phase I ESA', status: 'completed', dueDate: '2024-01-08', notes: 'Completed 1/15' },
          { id: 8, task: 'Review Phase I findings', status: 'completed', dueDate: '2024-01-18', notes: 'No RECs identified' },
          { id: 9, task: 'Order Phase II (if needed)', status: 'not_required', dueDate: '2024-01-22', notes: 'Not required per Phase I' }
        ]
      },
      {
        name: 'Physical Inspection',
        items: [
          { id: 10, task: 'Schedule property inspection', status: 'completed', dueDate: '2024-01-10', notes: '' },
          { id: 11, task: 'Complete property inspection', status: 'completed', dueDate: '2024-01-12', notes: 'Minor roof repairs noted' },
          { id: 12, task: 'Review inspection report', status: 'completed', dueDate: '2024-01-15', notes: '' },
          { id: 13, task: 'Obtain repair estimates', status: 'in_progress', dueDate: '2024-01-20', notes: 'Awaiting roof quote' }
        ]
      },
      {
        name: 'Financial',
        items: [
          { id: 14, task: 'Review rent roll', status: 'completed', dueDate: '2024-01-10', notes: '92% occupied' },
          { id: 15, task: 'Analyze T-12 financials', status: 'completed', dueDate: '2024-01-12', notes: '' },
          { id: 16, task: 'Review operating expenses', status: 'completed', dueDate: '2024-01-14', notes: '' },
          { id: 17, task: 'Verify CAM reconciliations', status: 'in_progress', dueDate: '2024-01-18', notes: '' },
          { id: 18, task: 'Review tenant estoppels', status: 'pending', dueDate: '2024-01-22', notes: '' }
        ]
      }
    ]
  },
  {
    id: 2,
    projectName: 'Sunset Land Development',
    template: 'Land Acquisition',
    status: 'In Progress',
    startDate: '2023-12-15',
    dueDate: '2024-01-25',
    completedItems: 42,
    totalItems: 45,
    assignee: 'Mike Johnson',
    categories: [
      {
        name: 'Entitlements',
        items: [
          { id: 1, task: 'Review existing zoning', status: 'completed', dueDate: '2023-12-18', notes: 'Zoned R-2' },
          { id: 2, task: 'Verify permitted uses', status: 'completed', dueDate: '2023-12-20', notes: '' },
          { id: 3, task: 'Review subdivision plat requirements', status: 'completed', dueDate: '2023-12-22', notes: '' },
          { id: 4, task: 'Meet with planning department', status: 'completed', dueDate: '2024-01-05', notes: '' }
        ]
      },
      {
        name: 'Utilities',
        items: [
          { id: 5, task: 'Verify water availability', status: 'completed', dueDate: '2023-12-20', notes: 'Will serve letter obtained' },
          { id: 6, task: 'Verify sewer capacity', status: 'completed', dueDate: '2023-12-20', notes: '' },
          { id: 7, task: 'Check electric service', status: 'completed', dueDate: '2023-12-22', notes: '' },
          { id: 8, task: 'Review utility extension costs', status: 'in_progress', dueDate: '2024-01-20', notes: 'Awaiting final estimate' }
        ]
      }
    ]
  }
];

export default function DueDiligenceChecklistPage() {
  const [checklists, setChecklists] = useState(initialChecklists);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const { toast } = useToast();

  const [newChecklist, setNewChecklist] = useState({
    projectName: '',
    template: '',
    dueDate: '',
    assignee: ''
  });

  const filteredChecklists = useMemo(() => {
    return checklists.filter(checklist => {
      const matchesSearch = checklist.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || checklist.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [checklists, searchTerm, statusFilter]);

  const handleAddChecklist = () => {
    const template = checklistTemplates.find(t => t.name === newChecklist.template);
    const checklist = {
      id: Math.max(...checklists.map(c => c.id)) + 1,
      ...newChecklist,
      status: 'Not Started',
      startDate: new Date().toISOString().split('T')[0],
      completedItems: 0,
      totalItems: template?.items || 50,
      categories: []
    };
    setChecklists([...checklists, checklist]);
    setIsAddDialogOpen(false);
    setNewChecklist({ projectName: '', template: '', dueDate: '', assignee: '' });
    toast({
      title: "Checklist Created",
      description: `Due diligence checklist for ${checklist.projectName} has been created.`
    });
  };

  const handleItemToggle = (checklistId, categoryName, itemId) => {
    setChecklists(checklists.map(checklist => {
      if (checklist.id === checklistId) {
        const updatedCategories = checklist.categories.map(category => {
          if (category.name === categoryName) {
            const updatedItems = category.items.map(item => {
              if (item.id === itemId) {
                const newStatus = item.status === 'completed' ? 'pending' : 'completed';
                return { ...item, status: newStatus };
              }
              return item;
            });
            return { ...category, items: updatedItems };
          }
          return category;
        });

        const completedCount = updatedCategories.reduce((sum, cat) =>
          sum + cat.items.filter(i => i.status === 'completed').length, 0
        );

        return {
          ...checklist,
          categories: updatedCategories,
          completedItems: completedCount
        };
      }
      return checklist;
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Not Started': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'On Hold': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getItemStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'not_required':
        return <Circle className="h-5 w-5 text-gray-300" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const calculateCategoryProgress = (category) => {
    const completed = category.items.filter(i => i.status === 'completed' || i.status === 'not_required').length;
    return Math.round((completed / category.items.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Due Diligence Checklist Manager</h1>
          <p className="text-muted-foreground">Track and manage due diligence activities for acquisitions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Checklist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Due Diligence Checklist</DialogTitle>
              <DialogDescription>Start a new due diligence process for a project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  value={newChecklist.projectName}
                  onChange={(e) => setNewChecklist({ ...newChecklist, projectName: e.target.value })}
                  placeholder="Oak Street Acquisition"
                />
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select
                  value={newChecklist.template}
                  onValueChange={(value) => setNewChecklist({ ...newChecklist, template: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {checklistTemplates.map(template => (
                      <SelectItem key={template.id} value={template.name}>
                        {template.name} ({template.items} items)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newChecklist.dueDate}
                  onChange={(e) => setNewChecklist({ ...newChecklist, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Input
                  value={newChecklist.assignee}
                  onChange={(e) => setNewChecklist({ ...newChecklist, assignee: e.target.value })}
                  placeholder="Team member name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddChecklist} disabled={!newChecklist.projectName || !newChecklist.template}>
                Create Checklist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Checklists</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checklists.filter(c => c.status === 'In Progress').length}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checklists.reduce((sum, c) => sum + c.completedItems, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              of {checklists.reduce((sum, c) => sum + c.totalItems, 0)} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Checklists</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Templates</CardTitle>
          <CardDescription>Standard due diligence checklists by property type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {checklistTemplates.map(template => (
              <div key={template.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-muted-foreground">
                  {template.categories} categories • {template.items} items
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Checklists */}
      <div className="space-y-4">
        {filteredChecklists.map(checklist => (
          <Card key={checklist.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{checklist.projectName}</CardTitle>
                    <Badge className={getStatusColor(checklist.status)}>{checklist.status}</Badge>
                  </div>
                  <CardDescription>
                    {checklist.template} • Assigned to {checklist.assignee} • Due {checklist.dueDate}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {Math.round((checklist.completedItems / checklist.totalItems) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {checklist.completedItems}/{checklist.totalItems} complete
                  </div>
                </div>
              </div>
              <Progress
                value={(checklist.completedItems / checklist.totalItems) * 100}
                className="mt-4"
              />
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-2">
                {checklist.categories.map((category, catIndex) => (
                  <AccordionItem key={catIndex} value={category.name} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-medium">{category.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {category.items.filter(i => i.status === 'completed').length}/{category.items.length}
                          </span>
                          <Progress
                            value={calculateCategoryProgress(category)}
                            className="w-24 h-2"
                          />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {category.items.map(item => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-2 rounded hover:bg-muted/50"
                          >
                            <button
                              onClick={() => handleItemToggle(checklist.id, category.name, item.id)}
                              className="mt-0.5"
                            >
                              {getItemStatusIcon(item.status)}
                            </button>
                            <div className="flex-1">
                              <div className={`font-medium ${item.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                {item.task}
                              </div>
                              {item.notes && (
                                <div className="text-sm text-muted-foreground">{item.notes}</div>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Due: {item.dueDate}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
