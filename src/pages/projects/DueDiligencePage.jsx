// src/pages/projects/DueDiligencePage.jsx
// Due Diligence tracking page with categories and checklist

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClipboardCheck, Plus, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDueDiligenceItems, createDueDiligenceItem, updateDueDiligenceItem, DD_CATEGORIES } from '@/services/dueDiligenceService';

const DueDiligencePage = () => {
  const { projectId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ category: '', title: '', description: '', priority: 'medium', due_date: '' });

  useEffect(() => {
    loadItems();
  }, [projectId]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getDueDiligenceItems(projectId);
      setItems(data);
      const expanded = {};
      DD_CATEGORIES.forEach(cat => { expanded[cat.id] = true; });
      setExpandedCategories(expanded);
    } catch (err) {
      console.error('Error loading due diligence items:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await updateDueDiligenceItem(itemId, {
        status: newStatus,
        completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
      });
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: newStatus } : i));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.category) return;
    try {
      const created = await createDueDiligenceItem(projectId, newItem);
      setItems(prev => [...prev, created]);
      setNewItem({ category: '', title: '', description: '', priority: 'medium', due_date: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error creating item:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = { low: 'bg-gray-100 text-gray-700', medium: 'bg-blue-100 text-blue-700', high: 'bg-amber-100 text-amber-700', critical: 'bg-red-100 text-red-700' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[priority] || colors.medium}`}>{priority}</span>;
  };

  const summary = {
    total: items.length,
    completed: items.filter(i => i.status === 'completed').length,
    pending: items.filter(i => i.status === 'pending').length,
    overdue: items.filter(i => i.status !== 'completed' && i.due_date && new Date(i.due_date) < new Date()).length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Due Diligence</h1>
          <p className="text-sm text-gray-500">{summary.completed}/{summary.total} items completed</p>
        </div>
        <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-900">{summary.total}</p><p className="text-xs text-gray-500">Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{summary.completed}</p><p className="text-xs text-gray-500">Completed</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{summary.pending}</p><p className="text-xs text-gray-500">Pending</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{summary.overdue}</p><p className="text-xs text-gray-500">Overdue</p></CardContent></Card>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <select value={newItem.category} onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
                <option value="">Select Category</option>
                {DD_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <input type="text" placeholder="Title" value={newItem.title} onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder="Description" value={newItem.description} onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
              <input type="date" value={newItem.due_date} onChange={(e) => setNewItem(prev => ({ ...prev, due_date: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button size="sm" className="bg-[#2F855A] hover:bg-[#276749]" onClick={handleAddItem}>Add</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <div className="space-y-4">
        {DD_CATEGORIES.map(cat => {
          const catItems = items.filter(i => i.category === cat.id);
          if (catItems.length === 0) return null;
          const completed = catItems.filter(i => i.status === 'completed').length;

          return (
            <Card key={cat.id}>
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
              >
                <div className="flex items-center gap-3">
                  {expandedCategories[cat.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-medium text-gray-900">{cat.label}</span>
                  <Badge variant="outline" className="text-xs">{completed}/{catItems.length}</Badge>
                </div>
              </button>
              {expandedCategories[cat.id] && (
                <CardContent className="pt-0 pb-3">
                  <div className="space-y-2">
                    {catItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg">
                        <button onClick={() => handleStatusChange(item.id, item.status === 'completed' ? 'pending' : 'completed')}>
                          {getStatusIcon(item.status)}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.title}</p>
                          {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                        </div>
                        {getPriorityBadge(item.priority)}
                        {item.due_date && <span className="text-xs text-gray-500">{item.due_date}</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DueDiligencePage;
