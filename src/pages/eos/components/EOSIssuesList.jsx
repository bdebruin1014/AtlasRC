import React, { useState } from 'react';
import { Plus, Search, AlertTriangle, CheckCircle, Clock, X, Edit2, Trash2, ChevronUp, ChevronDown, GripVertical, MessageSquare, User, Calendar, Filter, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EOSIssuesList = ({ program }) => {
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterType, setFilterType] = useState('short'); // 'short', 'long', 'all', 'solved'
  const [searchQuery, setSearchQuery] = useState('');

  const [issues, setIssues] = useState([
    // Short-term (L10) issues
    { id: 1, issue: 'CRM data migration taking longer than expected', type: 'short', priority: 1, owner: 'Lisa Chen', created: '2024-12-20', category: 'Operations', status: 'open', notes: 'Need to discuss timeline adjustment', solvedDate: null },
    { id: 2, issue: 'Cash flow timing with large project payments', type: 'short', priority: 2, owner: 'Bryan VanRock', created: '2024-12-18', category: 'Finance', status: 'open', notes: '', solvedDate: null },
    { id: 3, issue: 'Subcontractor no-shows on Unit 5', type: 'short', priority: 3, owner: 'Mike Johnson', created: '2024-12-22', category: 'Construction', status: 'open', notes: '', solvedDate: null },
    { id: 4, issue: 'Marketing lead quality declining', type: 'short', priority: 4, owner: 'Sarah Mitchell', created: '2024-12-15', category: 'Sales', status: 'open', notes: 'May need to review lead sources', solvedDate: null },
    { id: 5, issue: 'Permit delays on Highland project', type: 'short', priority: 5, owner: 'Tom Wilson', created: '2024-12-19', category: 'Construction', status: 'open', notes: '', solvedDate: null },
    
    // Long-term (VTO) issues
    { id: 6, issue: 'Need better subcontractor vetting process', type: 'long', priority: 1, owner: null, created: '2024-11-01', category: 'Operations', status: 'open', notes: 'Assigned as Q1 rock', solvedDate: null },
    { id: 7, issue: 'Office space constraints for growth', type: 'long', priority: 2, owner: null, created: '2024-10-15', category: 'Admin', status: 'open', notes: '', solvedDate: null },
    { id: 8, issue: 'Succession planning for key roles', type: 'long', priority: 3, owner: null, created: '2024-09-20', category: 'People', status: 'open', notes: '', solvedDate: null },
    
    // Solved issues
    { id: 9, issue: 'Need to hire additional project manager', type: 'short', priority: null, owner: 'Sarah Mitchell', created: '2024-11-15', category: 'People', status: 'solved', notes: 'Converted to rock', solvedDate: '2024-12-01' },
    { id: 10, issue: 'Accounting software integration issues', type: 'short', priority: null, owner: 'Lisa Chen', created: '2024-11-20', category: 'Operations', status: 'solved', notes: 'Resolved by IT', solvedDate: '2024-12-10' },
  ]);

  const [newIssue, setNewIssue] = useState({
    issue: '',
    type: 'short',
    category: '',
    notes: '',
  });

  const categories = ['Operations', 'Finance', 'Sales', 'Construction', 'People', 'Admin', 'Marketing', 'Other'];

  const filteredIssues = issues.filter(issue => {
    const matchesType = filterType === 'all' || 
                        filterType === 'solved' ? issue.status === 'solved' : 
                        issue.type === filterType && issue.status === 'open';
    const matchesSearch = issue.issue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  }).sort((a, b) => {
    if (a.priority === null) return 1;
    if (b.priority === null) return -1;
    return a.priority - b.priority;
  });

  const shortTermCount = issues.filter(i => i.type === 'short' && i.status === 'open').length;
  const longTermCount = issues.filter(i => i.type === 'long' && i.status === 'open').length;
  const solvedCount = issues.filter(i => i.status === 'solved').length;

  const movePriority = (issueId, direction) => {
    setIssues(prev => {
      const issueIndex = prev.findIndex(i => i.id === issueId);
      const issue = prev[issueIndex];
      const sameTypeIssues = prev.filter(i => i.type === issue.type && i.status === 'open');
      
      if (direction === 'up' && issue.priority > 1) {
        const swapIssue = sameTypeIssues.find(i => i.priority === issue.priority - 1);
        if (swapIssue) {
          return prev.map(i => {
            if (i.id === issue.id) return { ...i, priority: i.priority - 1 };
            if (i.id === swapIssue.id) return { ...i, priority: i.priority + 1 };
            return i;
          });
        }
      } else if (direction === 'down') {
        const swapIssue = sameTypeIssues.find(i => i.priority === issue.priority + 1);
        if (swapIssue) {
          return prev.map(i => {
            if (i.id === issue.id) return { ...i, priority: i.priority + 1 };
            if (i.id === swapIssue.id) return { ...i, priority: i.priority - 1 };
            return i;
          });
        }
      }
      return prev;
    });
  };

  const solveIssue = (issueId) => {
    setIssues(prev => prev.map(i => 
      i.id === issueId ? { ...i, status: 'solved', solvedDate: new Date().toISOString().split('T')[0], priority: null } : i
    ));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Issues List</h1>
          <p className="text-sm text-gray-500">Track and solve issues using IDS</p>
        </div>
        <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setShowNewIssueModal(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Issue
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-amber-500">
          <p className="text-2xl font-bold">{shortTermCount}</p>
          <p className="text-sm text-gray-500">Short-Term (L10)</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-purple-500">
          <p className="text-2xl font-bold">{longTermCount}</p>
          <p className="text-sm text-gray-500">Long-Term (V/TO)</p>
        </div>
        <div className="bg-white border rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-2xl font-bold text-green-600">{solvedCount}</p>
          <p className="text-sm text-gray-500">Solved</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-2xl font-bold">{shortTermCount + longTermCount}</p>
          <p className="text-sm text-gray-500">Total Open</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search issues..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterType('short')}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium", filterType === 'short' ? "bg-amber-100 text-amber-700" : "bg-gray-100 hover:bg-gray-200")}
            >
              Short-Term ({shortTermCount})
            </button>
            <button 
              onClick={() => setFilterType('long')}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium", filterType === 'long' ? "bg-purple-100 text-purple-700" : "bg-gray-100 hover:bg-gray-200")}
            >
              Long-Term ({longTermCount})
            </button>
            <button 
              onClick={() => setFilterType('solved')}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium", filterType === 'solved' ? "bg-green-100 text-green-700" : "bg-gray-100 hover:bg-gray-200")}
            >
              Solved ({solvedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No issues found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredIssues.map((issue, idx) => (
              <div key={issue.id} className={cn("p-4 hover:bg-gray-50", issue.status === 'solved' && "bg-gray-50")}>
                <div className="flex items-start gap-4">
                  {issue.status === 'open' && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-8 h-8 bg-[#047857] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {issue.priority}
                      </span>
                      <div className="flex flex-col">
                        <button 
                          onClick={() => movePriority(issue.id, 'up')}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"
                          disabled={issue.priority === 1}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => movePriority(issue.id, 'down')}
                          className="p-0.5 hover:bg-gray-200 rounded"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {issue.status === 'solved' && (
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={cn("font-medium", issue.status === 'solved' && "text-gray-500 line-through")}>{issue.issue}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className={cn(
                            "px-2 py-0.5 rounded",
                            issue.type === 'short' ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"
                          )}>
                            {issue.type === 'short' ? 'L10' : 'V/TO'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-gray-100">{issue.category}</span>
                          {issue.owner && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />{issue.owner}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{issue.created}
                          </span>
                        </div>
                        {issue.notes && (
                          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />{issue.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {issue.status === 'open' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setSelectedIssue(issue)}>
                              IDS
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => solveIssue(issue.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {issue.status === 'solved' && (
                          <span className="text-xs text-green-600">Solved {issue.solvedDate}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* IDS Explanation */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-3">IDS - Identify, Discuss, Solve</h3>
        <div className="grid grid-cols-3 gap-6 text-sm text-blue-700">
          <div>
            <p className="font-medium mb-1">1. Identify</p>
            <p>Get to the root of the issue. Ask &quot;Why?&quot; 3-5 times until you find the real problem.</p>
          </div>
          <div>
            <p className="font-medium mb-1">2. Discuss</p>
            <p>Everyone contributes. Share perspectives. No tangents - stay focused on the issue.</p>
          </div>
          <div>
            <p className="font-medium mb-1">3. Solve</p>
            <p>Decide on a solution. Assign a to-do with owner and due date. Move on.</p>
          </div>
        </div>
      </div>

      {/* New Issue Modal */}
      {showNewIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Add Issue</h3>
              <button onClick={() => setShowNewIssueModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Issue *</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2"
                  rows={3}
                  value={newIssue.issue}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, issue: e.target.value }))}
                  placeholder="Describe the issue..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Type</label>
                  <select 
                    className="w-full border rounded-md px-3 py-2"
                    value={newIssue.type}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="short">Short-Term (L10)</option>
                    <option value="long">Long-Term (V/TO)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <select 
                    className="w-full border rounded-md px-3 py-2"
                    value={newIssue.category}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">Select...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <Input 
                  value={newIssue.notes}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowNewIssueModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Add Issue</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EOSIssuesList;
