import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  MessageSquare, Send, Mail, Phone, Paperclip, Image, FileText,
  Clock, CheckCircle, AlertCircle, User, Building2, Plus, Search,
  MoreVertical, Reply, Forward, Archive, Trash2, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InvestorPortalPage = () => {
  const { investorId } = useParams();
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedConversation, setSelectedConversation] = useState('conv-001');
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 'conv-001',
      subject: 'Q4 Distribution Update',
      deal: 'Highland Park Lofts',
      lastMessage: 'Thank you for the update. When should we expect the distribution?',
      lastMessageFrom: 'investor',
      timestamp: '2024-12-28 10:30 AM',
      unread: true,
      starred: false,
    },
    {
      id: 'conv-002',
      subject: 'Capital Call - Cedar Mill Phase 2',
      deal: 'Cedar Mill Phase 2',
      lastMessage: 'Your capital call has been scheduled for January 15, 2025.',
      lastMessageFrom: 'admin',
      timestamp: '2024-12-26 3:15 PM',
      unread: false,
      starred: true,
    },
    {
      id: 'conv-003',
      subject: 'K-1 Tax Documents Available',
      deal: null,
      lastMessage: 'Your 2023 K-1 documents are now available in your portal.',
      lastMessageFrom: 'admin',
      timestamp: '2024-12-20 9:00 AM',
      unread: false,
      starred: false,
    },
    {
      id: 'conv-004',
      subject: 'Investment Inquiry - New Development',
      deal: null,
      lastMessage: 'I am interested in learning more about the upcoming development opportunity.',
      lastMessageFrom: 'investor',
      timestamp: '2024-12-15 2:45 PM',
      unread: false,
      starred: false,
    },
  ];

  const messages = [
    {
      id: 'msg-001',
      conversationId: 'conv-001',
      from: 'admin',
      sender: 'Sarah Johnson',
      content: 'Hello John,\n\nI wanted to provide you with an update on the Q4 2024 distribution for Highland Park Lofts.\n\nThe distribution has been approved by the board and is scheduled to be processed on January 5, 2025. You should see the funds in your account within 2-3 business days after processing.\n\nYour estimated distribution amount is $4,200 based on your 4.2% ownership.\n\nPlease let me know if you have any questions.',
      timestamp: '2024-12-27 2:30 PM',
      attachments: [],
    },
    {
      id: 'msg-002',
      conversationId: 'conv-001',
      from: 'investor',
      sender: 'John Smith',
      content: 'Thank you for the update. When should we expect the distribution?',
      timestamp: '2024-12-28 10:30 AM',
      attachments: [],
    },
  ];

  const selectedMessages = messages.filter(m => m.conversationId === selectedConversation);
  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // Would send message here
    setNewMessage('');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Investor Portal</h1>
          <p className="text-sm text-gray-500">Messages and communications with this investor</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Mail className="w-4 h-4 mr-2" />Send Email</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]">
            <Plus className="w-4 h-4 mr-2" />New Message
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('messages')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === 'messages' 
              ? "border-[#047857] text-[#047857]" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Portal Messages
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === 'emails' 
              ? "border-[#047857] text-[#047857]" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <Mail className="w-4 h-4 inline mr-2" />
          Email History
        </button>
      </div>

      {activeTab === 'messages' && (
        <div className="bg-white border rounded-lg flex h-[calc(100vh-320px)] min-h-[500px]">
          {/* Conversation List */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search messages..." className="pl-9" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={cn(
                    "p-3 border-b cursor-pointer hover:bg-gray-50",
                    selectedConversation === conv.id && "bg-blue-50 border-l-2 border-l-blue-500"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {conv.unread && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                        <p className={cn("font-medium text-sm truncate", conv.unread && "font-semibold")}>
                          {conv.subject}
                        </p>
                      </div>
                      {conv.deal && (
                        <p className="text-xs text-blue-600 mt-0.5">{conv.deal}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1 truncate">{conv.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2">
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {conv.timestamp.split(' ')[0]}
                      </span>
                      {conv.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col">
            {/* Thread Header */}
            {currentConversation && (
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{currentConversation.subject}</h3>
                    {currentConversation.deal && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Building2 className="w-4 h-4" />{currentConversation.deal}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded" title="Star">
                      <Star className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded" title="Archive">
                      <Archive className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.from === 'admin' ? "justify-start" : "justify-end"
                  )}
                >
                  <div className={cn(
                    "max-w-[70%] rounded-lg p-4",
                    msg.from === 'admin' 
                      ? "bg-gray-100" 
                      : "bg-blue-500 text-white"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        msg.from === 'admin' ? "bg-[#047857]" : "bg-blue-600"
                      )}>
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        msg.from === 'admin' ? "text-gray-700" : "text-white"
                      )}>
                        {msg.sender}
                      </span>
                      <span className={cn(
                        "text-xs",
                        msg.from === 'admin' ? "text-gray-400" : "text-blue-100"
                      )}>
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm whitespace-pre-line",
                      msg.from === 'admin' ? "text-gray-700" : "text-white"
                    )}>
                      {msg.content}
                    </p>
                    {msg.attachments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        {/* Attachments would go here */}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Compose */}
            <div className="p-4 border-t">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    className="w-full border rounded-lg px-4 py-3 min-h-[80px] resize-none"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button className="p-1 hover:bg-gray-100 rounded" title="Attach file">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title="Attach image">
                      <Image className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <Button 
                  className="bg-[#047857] hover:bg-[#065f46]"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'emails' && (
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Email History</h3>
            <p className="text-sm text-gray-500">All emails sent to and received from this investor</p>
          </div>
          <div className="divide-y">
            {[
              { id: 1, subject: 'Q4 2024 Distribution Notice', to: 'john.smith@email.com', date: '2024-12-20', status: 'delivered', opened: true },
              { id: 2, subject: 'Cedar Mill Phase 2 - Capital Call Notice', to: 'john.smith@email.com', date: '2024-12-15', status: 'delivered', opened: true },
              { id: 3, subject: 'K-1 Tax Documents Now Available', to: 'john.smith@email.com', date: '2024-03-01', status: 'delivered', opened: true },
              { id: 4, subject: 'Welcome to Highland Park Lofts', to: 'john.smith@email.com', date: '2023-06-15', status: 'delivered', opened: true },
            ].map(email => (
              <div key={email.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{email.subject}</p>
                    <p className="text-sm text-gray-500">To: {email.to}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{email.date}</p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">Delivered</span>
                      {email.opened && (
                        <>
                          <span className="text-gray-300 mx-1">•</span>
                          <span className="text-xs text-blue-600">Opened</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-200 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorPortalPage;
