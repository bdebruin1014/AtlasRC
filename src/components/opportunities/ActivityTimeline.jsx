import React, { useState } from 'react';
import {
  Clock,
  User,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  DollarSign,
  MapPin,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  Send,
  Paperclip,
  Building2,
  TrendingUp,
  UserPlus,
  ArrowRight,
  Eye,
  Download,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';

const ActivityTimeline = ({ opportunityId, opportunityName = 'Opportunity' }) => {
  const [filter, setFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [newActivityType, setNewActivityType] = useState('note');
  const [newActivityContent, setNewActivityContent] = useState('');

  // Mock activity data
  const activities = [
    {
      id: 1,
      type: 'status_change',
      title: 'Stage Updated',
      description: 'Moved from "Analysis" to "LOI Submitted"',
      user: 'Sarah Johnson',
      date: '2025-01-25T14:30:00',
      metadata: { from: 'Analysis', to: 'LOI Submitted' }
    },
    {
      id: 2,
      type: 'note',
      title: 'Meeting Notes',
      description: 'Met with seller to discuss terms. They are motivated but want to close within 45 days. Agreed to preliminary pricing of $425K subject to DD. Will need to verify zoning and check for any liens.',
      user: 'John Smith',
      date: '2025-01-25T10:15:00',
      metadata: {}
    },
    {
      id: 3,
      type: 'document',
      title: 'Document Uploaded',
      description: 'Purchase Agreement Draft v2.pdf',
      user: 'Emily Chen',
      date: '2025-01-24T16:45:00',
      metadata: { fileName: 'Purchase Agreement Draft v2.pdf', fileSize: '2.4 MB' }
    },
    {
      id: 4,
      type: 'call',
      title: 'Phone Call',
      description: 'Called seller agent to discuss LOI terms. They countered on price - asking $450K. Will need team approval to proceed.',
      user: 'Sarah Johnson',
      date: '2025-01-24T11:30:00',
      metadata: { duration: '18 min', contact: 'Mike Wilson (Seller Agent)' }
    },
    {
      id: 5,
      type: 'email',
      title: 'Email Sent',
      description: 'LOI submitted to seller for review',
      user: 'John Smith',
      date: '2025-01-23T15:00:00',
      metadata: { to: 'seller@example.com', subject: 'Letter of Intent - 123 Oak Street' }
    },
    {
      id: 6,
      type: 'site_visit',
      title: 'Site Visit',
      description: 'Completed initial property inspection. Foundation appears solid, roof needs replacement within 2 years. Good overall condition for rehab.',
      user: 'David Wilson',
      date: '2025-01-22T09:00:00',
      metadata: { duration: '2 hours', photos: 12 }
    },
    {
      id: 7,
      type: 'financial',
      title: 'Financial Update',
      description: 'Updated pro forma with new construction estimates',
      user: 'Emily Chen',
      date: '2025-01-21T14:20:00',
      metadata: { estimatedROI: '22%', constructionBudget: 85000 }
    },
    {
      id: 8,
      type: 'task_completed',
      title: 'Task Completed',
      description: 'Title search completed - no liens found',
      user: 'Sarah Johnson',
      date: '2025-01-20T11:00:00',
      metadata: { taskName: 'Complete Title Search' }
    },
    {
      id: 9,
      type: 'assignment',
      title: 'Assigned',
      description: 'Opportunity assigned to Sarah Johnson',
      user: 'Michael Chen',
      date: '2025-01-19T09:30:00',
      metadata: { assignee: 'Sarah Johnson', role: 'Lead Acquisitions' }
    },
    {
      id: 10,
      type: 'created',
      title: 'Opportunity Created',
      description: 'New opportunity added from lead source: Direct Mail Campaign',
      user: 'System',
      date: '2025-01-18T08:00:00',
      metadata: { source: 'Direct Mail Campaign' }
    },
  ];

  const activityTypes = {
    all: { label: 'All Activities', icon: Clock, color: 'text-gray-600' },
    note: { label: 'Notes', icon: MessageSquare, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    call: { label: 'Calls', icon: Phone, color: 'text-green-600', bgColor: 'bg-green-100' },
    email: { label: 'Emails', icon: Mail, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    document: { label: 'Documents', icon: FileText, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    site_visit: { label: 'Site Visits', icon: MapPin, color: 'text-teal-600', bgColor: 'bg-teal-100' },
    financial: { label: 'Financial', icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    status_change: { label: 'Status Changes', icon: TrendingUp, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    task_completed: { label: 'Tasks', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
    assignment: { label: 'Assignments', icon: UserPlus, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
    created: { label: 'Created', icon: Plus, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  };

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter);

  const toggleExpanded = (id) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleAddActivity = () => {
    if (newActivityContent.trim()) {
      // In a real app, this would call an API
      console.log('Adding activity:', { type: newActivityType, content: newActivityContent });
      setNewActivityContent('');
      setShowNewActivity(false);
    }
  };

  const renderActivityIcon = (type) => {
    const typeInfo = activityTypes[type] || activityTypes.note;
    const IconComponent = typeInfo.icon;
    return (
      <div className={`w-8 h-8 rounded-full ${typeInfo.bgColor} flex items-center justify-center`}>
        <IconComponent className={`w-4 h-4 ${typeInfo.color}`} />
      </div>
    );
  };

  const renderActivityMetadata = (activity) => {
    const { type, metadata } = activity;

    switch (type) {
      case 'call':
        return (
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {metadata.duration}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {metadata.contact}
            </span>
          </div>
        );
      case 'email':
        return (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
            <p className="text-gray-600">
              <span className="font-medium">To:</span> {metadata.to}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Subject:</span> {metadata.subject}
            </p>
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center gap-3 mt-2 p-2 bg-gray-50 rounded">
            <FileText className="w-8 h-8 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{metadata.fileName}</p>
              <p className="text-xs text-gray-500">{metadata.fileSize}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 text-gray-400 hover:text-blue-600">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-blue-600">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      case 'site_visit':
        return (
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {metadata.duration}
            </span>
            <span className="flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {metadata.photos} photos
            </span>
          </div>
        );
      case 'financial':
        return (
          <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-gray-50 rounded text-sm">
            <div>
              <p className="text-gray-500">Estimated ROI</p>
              <p className="font-medium text-green-600">{metadata.estimatedROI}</p>
            </div>
            <div>
              <p className="text-gray-500">Construction Budget</p>
              <p className="font-medium text-gray-700">${metadata.constructionBudget?.toLocaleString()}</p>
            </div>
          </div>
        );
      case 'status_change':
        return (
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">{metadata.from}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{metadata.to}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Activity Timeline
          </h3>
          <button
            onClick={() => setShowNewActivity(!showNewActivity)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Activity
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['all', 'note', 'call', 'email', 'document', 'site_visit', 'status_change'].map((type) => {
            const typeInfo = activityTypes[type];
            const IconComponent = typeInfo.icon;
            const count = type === 'all' ? activities.length : activities.filter(a => a.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === type
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                {typeInfo.label}
                <span className="ml-1 text-xs bg-white px-1.5 rounded-full">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Activity Form */}
      {showNewActivity && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <select
              value={newActivityType}
              onChange={(e) => setNewActivityType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="note">Note</option>
              <option value="call">Phone Call</option>
              <option value="email">Email</option>
              <option value="site_visit">Site Visit</option>
            </select>
          </div>
          <div className="flex gap-3">
            <textarea
              value={newActivityContent}
              onChange={(e) => setNewActivityContent(e.target.value)}
              placeholder="Add your activity details..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-white rounded-lg">
              <Paperclip className="w-4 h-4" />
              Attach File
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewActivity(false)}
                className="px-4 py-1.5 text-gray-600 hover:bg-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddActivity}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="p-4">
        <div className="space-y-0">
          {filteredActivities.map((activity, idx) => {
            const isExpanded = expandedItems.has(activity.id);
            const isLast = idx === filteredActivities.length - 1;

            return (
              <div key={activity.id} className="relative flex gap-4">
                {/* Timeline Line */}
                {!isLast && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
                )}

                {/* Icon */}
                <div className="flex-shrink-0 z-10">
                  {renderActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span title={formatFullDate(activity.date)}>{formatDate(activity.date)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleExpanded(activity.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className={`text-sm text-gray-600 mt-1 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                    {activity.description}
                  </p>

                  {isExpanded && renderActivityMetadata(activity)}
                </div>
              </div>
            );
          })}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No activities found for this filter</p>
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredActivities.length > 0 && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Load More Activities
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
