import React, { useState, useMemo } from 'react';
import {
  Zap, Link, Settings, CheckCircle, Clock, AlertTriangle,
  ArrowRight, Play, Pause, Building, FileText, Target,
  ChevronRight, ChevronDown, Edit, Plus, Calendar, User, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/*
 * WORKFLOW TASK INTEGRATION - MODULE EVENT TO TASK CONNECTIONS
 *
 * This page manages the connections between:
 * 1. Module Events (contract executed, permit approved, etc.)
 * 2. Task Templates (scattered lot acquisition tasks, etc.)
 * 3. Task Generation Rules (auto-create tasks when events fire)
 *
 * Example Flow:
 * 1. User closes a contract in Opportunities module
 * 2. System fires "contract_executed" event
 * 3. This page's rules trigger task generation
 * 4. Tasks created with responsible parties from project contacts
 * 5. Tasks linked to milestones with calculated due dates
 */

const mockModuleEvents = [
  {
    module: 'Opportunities',
    events: [
      { id: 'contract_executed', name: 'Contract Executed', description: 'Purchase contract is fully executed', isActive: true, templatesCount: 2, lastFired: '2024-02-01' },
      { id: 'due_diligence_complete', name: 'Due Diligence Complete', description: 'All DD items reviewed and approved', isActive: true, templatesCount: 1, lastFired: '2024-01-28' },
      { id: 'closing_complete', name: 'Closing Complete', description: 'Property closing is finalized', isActive: true, templatesCount: 1, lastFired: '2024-01-15' },
    ]
  },
  {
    module: 'Permitting',
    events: [
      { id: 'permit_submitted', name: 'Permit Submitted', description: 'Permit application submitted to municipality', isActive: true, templatesCount: 1, lastFired: null },
      { id: 'permit_approved', name: 'Permit Approved', description: 'Building permit approved and issued', isActive: true, templatesCount: 2, lastFired: null },
    ]
  },
  {
    module: 'Construction',
    events: [
      { id: 'construction_start', name: 'Construction Start', description: 'Ground broken, construction begins', isActive: true, templatesCount: 1, lastFired: null },
      { id: 'framing_complete', name: 'Framing Complete', description: 'Framing and rough-ins passed inspection', isActive: true, templatesCount: 1, lastFired: null },
      { id: 'co_issued', name: 'Certificate of Occupancy', description: 'CO issued, unit ready for occupancy', isActive: true, templatesCount: 1, lastFired: null },
    ]
  },
  {
    module: 'Sales',
    events: [
      { id: 'listing_active', name: 'Listing Activated', description: 'Property listed on MLS', isActive: true, templatesCount: 1, lastFired: '2024-01-20' },
      { id: 'under_contract', name: 'Unit Under Contract', description: 'Sales contract executed with buyer', isActive: true, templatesCount: 1, lastFired: '2024-01-25' },
      { id: 'sale_closed', name: 'Sale Closed', description: 'Closing complete, ownership transferred', isActive: true, templatesCount: 1, lastFired: '2024-01-30' },
    ]
  },
];

const mockRecentTriggers = [
  { id: 1, event: 'contract_executed', project: 'Oakwood Lot 15', triggeredAt: '2024-02-01 14:30', tasksGenerated: 7, status: 'completed' },
  { id: 2, event: 'sale_closed', project: 'Riverside Unit 1', triggeredAt: '2024-01-30 11:00', tasksGenerated: 3, status: 'completed' },
  { id: 3, event: 'due_diligence_complete', project: 'Oakwood Lot 15', triggeredAt: '2024-01-28 09:15', tasksGenerated: 2, status: 'completed' },
  { id: 4, event: 'under_contract', project: 'Riverside Unit 2', triggeredAt: '2024-01-25 16:45', tasksGenerated: 4, status: 'completed' },
  { id: 5, event: 'listing_active', project: 'Riverside Unit 3', triggeredAt: '2024-01-20 10:00', tasksGenerated: 2, status: 'completed' },
];

const mockEventTemplateConnections = [
  {
    eventId: 'contract_executed',
    templates: [
      { id: 't1', name: 'Scattered Lot - Standard Acquisition', projectType: 'scattered_lot', tasksCount: 7, isActive: true },
      { id: 't2', name: 'Subdivision - Phase Acquisition', projectType: 'subdivision', tasksCount: 5, isActive: true },
    ]
  },
  {
    eventId: 'permit_approved',
    templates: [
      { id: 't3', name: 'Construction Start Checklist', projectType: 'scattered_lot', tasksCount: 4, isActive: true },
      { id: 't4', name: 'Multifamily Permit Follow-up', projectType: 'multifamily', tasksCount: 6, isActive: true },
    ]
  },
];

const moduleColors = {
  'Opportunities': 'bg-blue-500',
  'Permitting': 'bg-purple-500',
  'Construction': 'bg-orange-500',
  'Sales': 'bg-pink-500',
};

export default function WorkflowTaskIntegrationPage() {
  const [activeTab, setActiveTab] = useState('events');
  const [expandedModules, setExpandedModules] = useState(['Opportunities', 'Construction']);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const stats = useMemo(() => ({
    totalEvents: mockModuleEvents.flatMap(m => m.events).length,
    activeEvents: mockModuleEvents.flatMap(m => m.events).filter(e => e.isActive).length,
    totalTemplatesConnected: mockModuleEvents.flatMap(m => m.events).reduce((sum, e) => sum + e.templatesCount, 0),
    recentTriggers: mockRecentTriggers.length,
    tasksGeneratedThisMonth: mockRecentTriggers.reduce((sum, t) => sum + t.tasksGenerated, 0),
  }), []);

  const toggleModule = (module) => {
    setExpandedModules(prev =>
      prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Link className="w-6 h-6 text-purple-600" />
            Workflow Task Integration
          </h1>
          <p className="text-gray-600">Configure how module events automatically generate tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Settings className="w-4 h-4 mr-2" />Settings</Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />Add Connection
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-purple-900">How Workflow Integration Works</h3>
            <p className="text-sm text-purple-800 mt-1">
              When events occur in modules (like closing a contract), the system automatically fires a trigger.
              Connected templates then generate tasks with pre-configured responsible parties, due dates calculated
              from the trigger date, and links to project milestones.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Total Events</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Play className="w-4 h-4" />
            <span className="text-sm">Active Events</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.activeEvents}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Templates Connected</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.totalTemplatesConnected}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Recent Triggers</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.recentTriggers}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Tasks Generated</span>
          </div>
          <p className="text-2xl font-bold text-teal-600">{stats.tasksGeneratedThisMonth}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['events', 'recent', 'connections'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px",
              activeTab === tab
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === 'events' && 'Module Events'}
            {tab === 'recent' && 'Recent Triggers'}
            {tab === 'connections' && 'Event-Template Connections'}
          </button>
        ))}
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {mockModuleEvents.map((module) => {
            const isExpanded = expandedModules.includes(module.module);
            return (
              <div key={module.module} className="bg-white rounded-lg border overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleModule(module.module)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <div className={cn("w-3 h-3 rounded-full", moduleColors[module.module])} />
                    <span className="font-semibold">{module.module}</span>
                    <span className="text-sm text-gray-500">({module.events.length} events)</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {module.events.filter(e => e.isActive).length} active
                  </span>
                </div>

                {isExpanded && (
                  <div className="border-t">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="p-3 text-left">Event</th>
                          <th className="p-3 text-left">Description</th>
                          <th className="p-3 text-center">Templates</th>
                          <th className="p-3 text-left">Last Fired</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {module.events.map((event) => (
                          <tr key={event.id} className="border-t hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-purple-500" />
                                <span className="font-medium">{event.name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-sm text-gray-600">{event.description}</td>
                            <td className="p-3 text-center">
                              <span className={cn(
                                "font-medium",
                                event.templatesCount > 0 ? "text-blue-600" : "text-gray-400"
                              )}>
                                {event.templatesCount}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-gray-500">
                              {event.lastFired || 'Never'}
                            </td>
                            <td className="p-3 text-center">
                              {event.isActive ? (
                                <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 flex items-center gap-1 w-fit mx-auto">
                                  <Play className="w-3 h-3" />Active
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 flex items-center gap-1 w-fit mx-auto">
                                  <Pause className="w-3 h-3" />Inactive
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setSelectedEvent(event)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Link className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Triggers Tab */}
      {activeTab === 'recent' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Event</th>
                <th className="p-4">Project</th>
                <th className="p-4">Tasks Generated</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentTriggers.map((trigger) => (
                <tr key={trigger.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{trigger.triggeredAt}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <span className="font-medium capitalize">{trigger.event.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{trigger.project}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-blue-600">{trigger.tasksGenerated} tasks</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                      {trigger.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button size="sm" variant="outline">View Tasks</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Event-Template Connections</h3>
            <p className="text-sm text-yellow-800">
              Each event can be connected to multiple templates. When an event fires, all connected templates
              will generate tasks for projects matching the template's project type.
            </p>
          </div>

          {mockEventTemplateConnections.map((connection) => {
            const allEvents = mockModuleEvents.flatMap(m => m.events);
            const event = allEvents.find(e => e.id === connection.eventId);

            return (
              <div key={connection.eventId} className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{event?.name || connection.eventId}</h3>
                    <p className="text-sm text-gray-500">{event?.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Triggers these templates:</span>
                </div>

                <div className="space-y-2">
                  {connection.templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-gray-500">
                            {template.tasksCount} tasks • {template.projectType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {template.isActive ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">Active</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">Inactive</span>
                        )}
                        <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button size="sm" variant="outline" className="mt-3">
                  <Plus className="w-3 h-3 mr-1" />Add Template
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Event Configuration</h3>
              <button onClick={() => setSelectedEvent(null)}>×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Event Name</label>
                <Input value={selectedEvent.name} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows={2}
                  defaultValue={selectedEvent.description}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {selectedEvent.isActive ? 'Event will trigger task generation' : 'Event is disabled'}
                  </span>
                  <input type="checkbox" defaultChecked={selectedEvent.isActive} className="rounded" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Connected Templates ({selectedEvent.templatesCount})</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    This event is connected to {selectedEvent.templatesCount} task template(s).
                    View the Connections tab to manage template associations.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
