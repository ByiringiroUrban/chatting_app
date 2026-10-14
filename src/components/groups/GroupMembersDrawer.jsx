import React from 'react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useGroupStore } from '../../stores/groupStore';
import { useUiStore } from '../../stores/uiStore';
import { ShieldCheck, UserMinus, UserPlus, LogOut } from 'lucide-react';

export default function GroupMembersDrawer() {
  const { isMemberDrawerOpen, setMemberDrawerOpen, activeGroupId, groups, removeMember } = useGroupStore();
  const { showToast } = useUiStore();

  const group = groups.find(g => g.id === activeGroupId);
  if (!group) return null;

  const handleRemove = (memberId, memberName) => {
    removeMember(group.id, memberId);
    showToast(`Removed ${memberName} from group`, "info");
  };

  const handleLeaveGroup = () => {
    setMemberDrawerOpen(false);
    showToast(`You left ${group.name}`, "warning");
  };

  return (
    <Modal
      isOpen={isMemberDrawerOpen}
      onClose={() => setMemberDrawerOpen(false)}
      title="Group Details & Members"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-slate-800">
        <Avatar src={group.avatar} alt={group.name} size="xl" className="mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{group.name}</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">{group.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="brand">{group.members?.length || 0} Members</Badge>
          <span className="text-[11px] text-slate-400">Created {group.createdAt}</span>
        </div>
      </div>

      {/* Member List */}
      <div className="py-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Participants
          </h4>
        </div>

        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
          {group.members?.map((member) => {
            const isAdmin = member.role === 'admin';
            const isMe = member.id === 'user_me';

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar src={member.avatar} alt={member.name} size="sm" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {member.name} {isMe && "(You)"}
                    </p>
                    <p className="text-[10px] text-slate-400">{isAdmin ? "Group Admin" : "Member"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <Badge variant="success" size="sm">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </Badge>
                  )}
                  {!isMe && (
                    <button
                      onClick={() => handleRemove(member.id, member.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Remove Member"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer controls: Leave group */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <button
          onClick={handleLeaveGroup}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Leave Group
        </button>

        <Button variant="secondary" size="sm" onClick={() => setMemberDrawerOpen(false)}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
