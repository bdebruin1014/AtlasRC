// src/components/chat/ChatButton.jsx
// Floating chat button to toggle the team chat panel

import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import TeamChat from './TeamChat';
import { getUnreadCounts } from '@/services/chatService';

const ChatButton = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    // Refresh unread count periodically
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    const { data } = await getUnreadCounts();
    if (data) {
      const total = Object.values(data).reduce((sum, count) => sum + count, 0);
      setTotalUnread(total);
    }
  };

  return (
    <>
      {/* Chat Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <TeamChat
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          currentUser={currentUser}
        />
      </div>

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-40",
            "bg-emerald-600 hover:bg-emerald-700 text-white",
            "flex items-center justify-center transition-all",
            "hover:scale-105"
          )}
        >
          <MessageSquare className="w-6 h-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-medium">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>
      )}
    </>
  );
};

export default ChatButton;
