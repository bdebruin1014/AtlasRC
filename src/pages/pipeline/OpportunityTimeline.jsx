import React, { useState } from 'react';
import { Calendar, Plus, Clock, CheckCircle, AlertTriangle, Circle, Flag, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function OpportunityTimeline() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewMode, setViewMode] = useState('timeline');

  const [milestones, setMilestones] = useState([
    {
      id: '1',
      title: 'Initial Contact',
      date: '2024-12-15',
      type: 'milestone',
      status: 'complete',
      description: 'First letter sent to property owner',
      category: 'Prospecting',
    },
    {
      id: '2',
      title: 'Seller Response',
      date: '2024-12-28',
      type: 'milestone',
      status: 'complete',
      description: 'Seller responded to outreach, interested in discussing sale',
      category: 'Contacted',
    },
    {
      id: '3',
      title: 'Property Analysis Complete',
      date: '2025-01-05',
      type: 'milestone',
      status: 'complete',
      description: 'Completed initial property analysis and determined value range',
      category: 'Qualified',
    },
    {
      id: '4',
      title: 'Contract Sent',
      date: '2025-01-10',
      type: 'milestone',
      status: 'complete',
      description: 'Purchase agreement sent for signatures',
      category: 'Negotiating',
    },
    {
      id: '5',
      title: 'Contract Executed',
      date: '2025-01-11',
      type: 'milestone',
      status: 'complete',
      description: 'All parties signed the purchase agreement',
      category: 'Under Contract',
    },
    {
      id: '6',
      title: 'Due Diligence Deadline',
      date: '2025-02-10',
      type: 'deadline',
      status: 'upcoming',
      description: '30-day due diligence period ends',
      category: 'Under Contract',
    },
    {
      id: '7',
      title: 'Closing Date',
      date: '2025-02-28',
      type: 'deadline',
      status: 'upcoming',
      description: 'Scheduled closing date',
      category: 'Under Contract',
    },
  ]);

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    date: '',
    type: 'milestone',
    description: '',
    category: 'Under Contract',
  });

  const categories = ['Prospecting', 'Contacted', 'Qualified', 'Negotiating', 'Under Contract', 'Closed'];

  const handleAddMilestone = () => {
    if (!newMilestone.title || !newMilestone.date) {
      toast({ title: 'Error', description: 'Title and date are required', variant: 'destructive' });
      return;
    }

    const milestone = {
      id: String(Date.now()),
      ...newMilestone,
      status: new Date(newMilestone.date) <= new Date() ? 'complete' : 'upcoming',
    };

    setMilestones(prev => [...prev, milestone].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setShowAddDialog(false);
    setNewMilestone({ title: '', date: '', type: 'milestone', description: '', category: 'Under Contract' });
    toast({ title: 'Milestone Added', description: 'Timeline has been updated.' });
  };

  const handleToggleStatus = (id) => {
    setMilestones(prev => prev.map(m =>
      m.id === id ? { ...m, status: m.status === 'complete' ? 'upcoming' : 'complete' } : m
    ));
  };

  const handleDeleteMilestone = (id) => {
    if (!confirm('Delete this milestone?')) return;
    setMilestones(prev => prev.filter(m => m.id !== id));
    toast({ title: 'Deleted', description: 'Milestone has been removed.' });
  };

  const getStatusIcon = (status, type) => {
    if (status === 'complete') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (type === 'deadline') return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntil = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days ago`;
    if (diff === 0) return 'Today';
    return `${diff} days`;
  };

  // Calculate upcoming deadlines
  const upcomingDeadlines = milestones
    .filter(m => m.status !== 'complete' && m.type === 'deadline')
    .slice(0, 3);

  const completedCount = milestones.filter(m => m.status === 'complete').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
          <p className="text-sm text-gray-500">Track milestones and important dates</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Milestone
          </Button>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-medium text-orange-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Upcoming Deadlines
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {upcomingDeadlines.map(deadline => (
              <div key={deadline.id} className="bg-white rounded-lg p-3 border border-orange-200">
                <p className="font-medium text-sm">{deadline.title}</p>
                <p className="text-xs text-gray-500">{formatDate(deadline.date)}</p>
                <p className="text-xs text-orange-600 font-medium mt-1">{getDaysUntil(deadline.date)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Total Milestones</p>
          <p className="text-2xl font-bold text-gray-900">{milestones.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">{milestones.length - completedCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Progress</p>
          <p className="text-2xl font-bold text-emerald-600">{Math.round((completedCount / milestones.length) * 100)}%</p>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' ? (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {milestones.map((milestone, idx) => (
              <div key={milestone.id} className="relative flex items-start gap-4 ml-2">
                {/* Icon/dot */}
                <button
                  onClick={() => handleToggleStatus(milestone.id)}
                  className={cn(
                    "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-colors",
                    milestone.status === 'complete' ? "border-green-500" : milestone.type === 'deadline' ? "border-orange-400" : "border-gray-300"
                  )}
                >
                  {getStatusIcon(milestone.status, milestone.type)}
                </button>

                {/* Content */}
                <div className={cn(
                  "flex-1 bg-white border rounded-lg p-4 hover:shadow-md transition-shadow",
                  milestone.status === 'complete' && "bg-gray-50"
                )}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          "font-semibold",
                          milestone.status === 'complete' && "text-gray-500"
                        )}>
                          {milestone.title}
                        </h4>
                        {milestone.type === 'deadline' && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Flag className="w-3 h-3 mr-1" /> Deadline
                          </Badge>
                        )}
                        <Badge className={milestone.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {milestone.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(milestone.date)}
                        </span>
                        {milestone.status !== 'complete' && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {getDaysUntil(milestone.date)}
                          </span>
                        )}
                        <Badge variant="outline">{milestone.category}</Badge>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mt-2">{milestone.description}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteMilestone(milestone.id)}>
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Milestone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {milestones.map((milestone) => (
                <tr key={milestone.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleStatus(milestone.id)}>
                      {getStatusIcon(milestone.status, milestone.type)}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{milestone.title}</div>
                    {milestone.description && (
                      <div className="text-xs text-gray-500">{milestone.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{formatDate(milestone.date)}</div>
                    {milestone.status !== 'complete' && (
                      <div className="text-xs text-gray-500">{getDaysUntil(milestone.date)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={milestone.type === 'deadline' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}>
                      {milestone.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{milestone.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteMilestone(milestone.id)}>
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {milestones.length === 0 && (
        <div className="bg-white border rounded-lg p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium">No milestones yet</p>
          <p className="text-gray-400 text-sm mt-2">Add milestones and deadlines to track progress</p>
        </div>
      )}

      {/* Add Milestone Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>Add a new milestone or deadline to the timeline</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                placeholder="e.g., Contract Signed"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={newMilestone.type} onValueChange={(v) => setNewMilestone({ ...newMilestone, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={newMilestone.category} onValueChange={(v) => setNewMilestone({ ...newMilestone, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                placeholder="Additional details..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddMilestone} className="bg-[#047857] hover:bg-[#065f46]">
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
