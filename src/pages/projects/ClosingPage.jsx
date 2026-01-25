// src/pages/projects/ClosingPage.jsx
// Closing management page with categories and checklist

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckSquare, Plus, CheckCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getClosingItems, createClosingItem, updateClosingItem, CLOSING_CATEGORIES } from '@/services/closingService';

const ClosingPage = () => {
  const { projectId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ category: '', title: '', responsible_party: '', due_date: '' });

  useEffect(() => { loadItems(); }, [projectId]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getClosingItems(projectId);
      setItems(data);
      const expanded = {};
      CLOSING_CATEGORIES.forEach(cat => { expanded[cat.id] = true; });
      setExpandedCategories(expanded);
    } catch (err) {
      console.error('Error loading closing items:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await updateClosingItem(itemId, {
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
      const created = await createClosingItem(projectId, newItem);
      setItems(prev => [...prev, created]);
      setNewItem({ category: '', title: '', responsible_party: '', due_date: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error creating item:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-amber-600" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const summary = {
    total: items.length,
    completed: items.filter(i => i.status === 'completed').length,
  };

  const progressPct = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F855A]" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Closing Checklist</h1>
          <p className="text-sm text-gray-500">{summary.completed}/{summary.total} items completed ({progressPct}%)</p>
        </div>
        <Button className="bg-[#2F855A] hover:bg-[#276749]" onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-[#2F855A] h-3 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <select value={newItem.category} onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
                <option value="">Select Category</option>
                {CLOSING_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <input type="text" placeholder="Title" value={newItem.title} onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder="Responsible Party" value={newItem.responsible_party} onChange={(e) => setNewItem(prev => ({ ...prev, responsible_party: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
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
        {CLOSING_CATEGORIES.map(cat => {
          const catItems = items.filter(i => i.category === cat.id);
          if (catItems.length === 0) return null;
          const completed = catItems.filter(i => i.status === 'completed').length;

          return (
            <Card key={cat.id}>
              <button onClick={() => toggleCategory(cat.id)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg">
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
                        </div>
                        {item.responsible_party && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.responsible_party}</span>}
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

export default ClosingPage;
