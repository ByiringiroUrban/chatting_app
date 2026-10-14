import React, { useEffect } from 'react';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';
import CreateGroupModal from '../../components/groups/CreateGroupModal';
import GroupMembersDrawer from '../../components/groups/GroupMembersDrawer';
import { useChatStore } from '../../stores/chatStore';
import { useMobileNavStore } from '../../stores/mobileNavStore';

export default function ChatsPage() {
  const { activeChatId, setActiveChatId } = useChatStore();
  const { isChatOpenOnMobile, setChatOpenOnMobile } = useMobileNavStore();

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    setChatOpenOnMobile(true);
  };

  const handleBackToChatList = () => {
    setChatOpenOnMobile(false);
  };

  // Reset mobile chat state if unmounted
  useEffect(() => {
    return () => {
      setChatOpenOnMobile(false);
    };
  }, [setChatOpenOnMobile]);

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      {/* Group Modals & Drawers */}
      <CreateGroupModal />
      <GroupMembersDrawer />

      {/* Conversations Sidebar (Full width on mobile when no chat is open; fixed width on desktop) */}
      <div 
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 h-full ${
          isChatOpenOnMobile ? 'hidden md:block' : 'block'
        }`}
      >
        <ChatList onSelectChat={handleSelectChat} />
      </div>

      {/* Main Chat Area (Full width on mobile when chat is open; flex-1 on desktop) */}
      <div 
        className={`flex-1 h-full min-w-0 ${
          !isChatOpenOnMobile ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ChatWindow onBack={handleBackToChatList} />
      </div>
    </div>
  );
}
