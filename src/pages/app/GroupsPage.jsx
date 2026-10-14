import React, { useState } from 'react';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CreateGroupModal from '../../components/groups/CreateGroupModal';
import GroupMembersDrawer from '../../components/groups/GroupMembersDrawer';
import { useGroupStore } from '../../stores/groupStore';
import { useChatStore } from '../../stores/chatStore';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export default function GroupsPage() {
  const { groups, setCreateModalOpen, setActiveGroupId, setMemberDrawerOpen } = useGroupStore();
  const { setActiveChatId } = useChatStore();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenGroupChat = (group) => {
    setActiveGroupId(group.id);
    setActiveChatId('conv_2'); // open group chat
    navigate('/app/chats');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-bg-dark overflow-y-auto p-4 sm:p-6 lg:p-8 select-none">
      <CreateGroupModal />
      <GroupMembersDrawer />

      {/* Header bar */}
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-700 dark:text-teal-400" />
              Community Groups
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Connect with developer communities, founders, student hubs, and business circles in Rwanda.
            </p>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Group
          </Button>
        </div>

        {/* Search input */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups by title or interest..."
            className="w-full max-w-md bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
          />
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((group) => {
            const myMembership = group.members?.find(m => m.id === 'user_me');
            const isAdmin = myMembership?.role === 'admin';

            return (
              <div
                key={group.id}
                className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <Avatar src={group.avatar} alt={group.name} size="lg" />
                    {isAdmin && (
                      <Badge variant="success" size="sm">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">
                    {group.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {group.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{group.members?.length || 0} members</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveGroupId(group.id);
                        setMemberDrawerOpen(true);
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleOpenGroupChat(group)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-teal-400 hover:underline px-2 py-1"
                    >
                      Open Chat <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
