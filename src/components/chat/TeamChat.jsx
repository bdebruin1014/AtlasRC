// src/components/chat/TeamChat.jsx
// Team chat panel with direct messages, channels, tasks, and notes

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Users, Send, Search, Plus, ChevronDown, ChevronRight,
  Circle, MoreHorizontal, Settings, Hash, User, Check, Clock, X,
  Paperclip, Smile, AtSign, Loader2, Bell, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getTeamMembers,
  getChannels,
  getDirectMessages,
  getOrCreateDirectMessage,
  createChannel,
  getMessages,
  sendMessage,
  subscribeToChannel,
  markAsRead,
  getUnreadCounts,
  getTasks,
  updateTaskStatus
} from '@/services/chatService';

// Status colors
const STATUS_COLORS = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-gray-400'
};

const TeamChat = ({ isOpen, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState('all'); // all, messages, channels
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['dms', 'tasks', 'notes', 'channels']);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [creatingChannel, setCreatingChannel] = useState(false);
  const messagesEndRef = useRef(null);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Subscribe to channel messages
  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
      const unsubscribe = subscribeToChannel(selectedChannel.id, (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      });
      return () => unsubscribe();
    }
  }, [selectedChannel]);

  const loadData = async () => {
    setLoading(true);
    const [membersRes, channelsRes, dmsRes, unreadRes, tasksRes] = await Promise.all([
      getTeamMembers(),
      getChannels(),
      getDirectMessages(),
      getUnreadCounts(),
      getTasks(currentUser?.id)
    ]);

    if (membersRes.data) setTeamMembers(membersRes.data);
    if (channelsRes.data) setChannels(channelsRes.data);
    if (dmsRes.data) setDirectMessages(dmsRes.data);
    if (unreadRes.data) setUnreadCounts(unreadRes.data);
    if (tasksRes.data) setTasks(tasksRes.data);

    setLoading(false);
  };

  const loadMessages = async (channelId) => {
    const { data } = await getMessages(channelId);
    if (data) {
      setMessages(data);
      scrollToBottom();
      markAsRead(channelId);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel) return;

    setSendingMessage(true);
    const { data, error } = await sendMessage(selectedChannel.id, messageInput.trim());
    if (!error && data) {
      setMessages(prev => [...prev, data]);
      setMessageInput('');
      scrollToBottom();
    }
    setSendingMessage(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const formatMessageTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOtherUser = (dm) => {
    const members = dm.chat_channel_members || [];
    const other = members.find(m => m.user_id !== currentUser?.id);
    return other?.team_members || { display_name: 'Unknown', status: 'offline' };
  };

  // Start a DM with a team member
  const handleStartDM = async (member) => {
    setLoading(true);
    const { data: dmChannel, error } = await getOrCreateDirectMessage(member.user_id);
    if (!error && dmChannel) {
      setSelectedChannel({
        ...dmChannel,
        name: member.display_name,
        type: 'dm',
        otherUser: member
      });
    } else {
      // Fallback for demo mode or error
      setSelectedChannel({
        id: `dm-${member.user_id}`,
        name: member.display_name,
        type: 'dm',
        otherUser: member
      });
    }
    setLoading(false);
  };

  // Create a new group channel
  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    setCreatingChannel(true);
    const { data: channel, error } = await createChannel(newChannelName.trim());
    if (!error && channel) {
      setChannels(prev => [...prev, channel]);
      setSelectedChannel(channel);
      setNewChannelName('');
      setShowCreateChannel(false);
    }
    setCreatingChannel(false);
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900">CHAT</h3>
        <div className="flex items-center gap-2">
          <button className="text-sm text-gray-600 hover:text-gray-900">All</button>
          <span className="text-gray-300">|</span>
          <button className="text-sm text-gray-600 hover:text-gray-900">Messages</button>
          <span className="text-gray-300">|</span>
          <button className="text-sm text-gray-600 hover:text-gray-900">Channels</button>
          <button onClick={onClose} className="ml-2 p-1 hover:bg-gray-200 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedChannel ? (
          // Chat View
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedChannel(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <span className="font-medium">{selectedChannel.name || 'Direct Message'}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, idx) => {
                const isOwn = msg.user_id === currentUser?.id;
                const sender = msg.team_members || { display_name: 'Unknown' };

                return (
                  <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0",
                      isOwn ? "bg-emerald-500" : "bg-blue-500"
                    )}>
                      {sender.display_name?.charAt(0) || '?'}
                    </div>
                    <div className={cn("max-w-[70%]", isOwn && "text-right")}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{sender.display_name}</span>
                        <span className="text-xs text-gray-400">{formatMessageTime(msg.created_at)}</span>
                      </div>
                      <div className={cn(
                        "px-3 py-2 rounded-lg text-sm",
                        isOwn ? "bg-emerald-100 text-emerald-900" : "bg-gray-100"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={sendingMessage}
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // List View
          <>
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  className="pl-9 text-sm"
                />
              </div>
            </div>

            {/* Direct Messages Section */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('dms')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
              >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DIRECT MESSAGES
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-gray-400 transition-transform",
                  !expandedSections.includes('dms') && "-rotate-90"
                )} />
              </button>

              {expandedSections.includes('dms') && (
                <div className="pb-2">
                  {teamMembers.filter(m => m.user_id !== currentUser?.id).map(member => {
                    const isOnline = member.status === 'online';
                    return (
                      <button
                        key={member.id}
                        onClick={() => handleStartDM(member)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                      >
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                            {member.display_name?.charAt(0) || '?'}
                          </div>
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                            STATUS_COLORS[member.status] || STATUS_COLORS.offline
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.display_name}
                          </p>
                          {isOnline && (
                            <p className="text-xs text-emerald-600">Online</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {teamMembers.filter(m => m.user_id !== currentUser?.id).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No other team members</p>
                  )}
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('tasks')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    TASKS
                  </span>
                  <span className="text-xs text-gray-400">{tasks.filter(t => t.status !== 'completed').length} / {tasks.length}</span>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-gray-400 transition-transform",
                  !expandedSections.includes('tasks') && "-rotate-90"
                )} />
              </button>

              {expandedSections.includes('tasks') && (
                <div className="px-3 pb-3">
                  <p className="text-xs text-gray-500 mb-2">Order tasks that are assigned to you</p>
                  {tasks.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">No tasks assigned</p>
                  ) : (
                    <div className="space-y-2">
                      {tasks.filter(t => t.status !== 'completed').map(task => (
                        <label key={task.id} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={task.status === 'completed'}
                            onChange={() => updateTaskStatus(task.id, 'completed')}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600"
                          />
                          <span className="text-sm text-gray-700">{task.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('notes')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
              >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  NOTES
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-gray-400 transition-transform",
                  !expandedSections.includes('notes') && "-rotate-90"
                )} />
              </button>

              {expandedSections.includes('notes') && (
                <div className="px-3 pb-3">
                  <textarea
                    placeholder="Add a note..."
                    className="w-full text-sm border rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Channels Section */}
            <div>
              <button
                onClick={() => toggleSection('channels')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
              >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  CHANNELS
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateChannel(true);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Create new channel"
                  >
                    <Plus className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-gray-400 transition-transform",
                    !expandedSections.includes('channels') && "-rotate-90"
                  )} />
                </div>
              </button>

              {expandedSections.includes('channels') && (
                <div className="pb-2">
                  {/* Create Channel Form */}
                  {showCreateChannel && (
                    <div className="px-3 pb-3 pt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <Input
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          placeholder="Channel name"
                          className="flex-1 h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateChannel();
                            if (e.key === 'Escape') {
                              setShowCreateChannel(false);
                              setNewChannelName('');
                            }
                          }}
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowCreateChannel(false);
                            setNewChannelName('');
                          }}
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCreateChannel}
                          disabled={!newChannelName.trim() || creatingChannel}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                        >
                          {creatingChannel ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Create'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {channels.map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left"
                    >
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{channel.name}</span>
                      {unreadCounts[channel.id] > 0 && (
                        <span className="ml-auto bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {unreadCounts[channel.id]}
                        </span>
                      )}
                    </button>
                  ))}
                  {channels.length === 0 && !showCreateChannel && (
                    <p className="text-xs text-gray-400 text-center py-2">
                      No channels yet.{' '}
                      <button
                        onClick={() => setShowCreateChannel(true)}
                        className="text-emerald-600 hover:underline"
                      >
                        Create one
                      </button>
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamChat;
