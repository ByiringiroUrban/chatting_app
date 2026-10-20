import React from 'react';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import StatusViewerModal from '../../components/status/StatusViewerModal';
import CreateStatusModal from '../../components/status/CreateStatusModal';
import { useStatusStore } from '../../stores/statusStore';
import { Plus, Eye, Sparkles } from 'lucide-react';

export default function StatusPage() {
  const { statuses, fetchStatuses, openStatusViewer, setCreateModalOpen, isLoading } = useStatusStore();

  React.useEffect(() => {
    fetchStatuses();
  }, []);

  const myStatus = statuses.find(s => s.isMe);
  const otherStatuses = statuses.filter(s => !s.isMe);

  const recentUpdates = otherStatuses.filter(s => s.hasUnseen);
  const viewedUpdates = otherStatuses.filter(s => !s.hasUnseen);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-bg-dark overflow-y-auto p-4 sm:p-6 lg:p-8 select-none">
      <StatusViewerModal />
      <CreateStatusModal />

      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-700 dark:text-teal-400" />
              Status Stories
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Photos, updates, and thoughts that disappear after 24 hours.
            </p>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            Add My Status
          </Button>
        </div>

        {/* My Status Card */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs mb-6">
          <div className="flex items-center justify-between">
            <div
              onClick={() => myStatus && myStatus.items?.length > 0 && openStatusViewer(myStatus.id)}
              className="flex items-center gap-3.5 cursor-pointer flex-1"
            >
              <div className="relative">
                <Avatar
                  src={myStatus?.userAvatar}
                  alt="My Status"
                  size="lg"
                  hasStatusRing={true}
                  hasUnseenStatus={true}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateModalOpen(true);
                  }}
                  className="absolute bottom-0 right-0 p-1 bg-brand-600 text-white rounded-full shadow-sm hover:scale-110 active:scale-95 transition-transform"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">My Status</h3>
                <p className="text-xs text-slate-500">
                  {myStatus?.items?.length 
                    ? `${myStatus.timestamp} • ${myStatus.items[0]?.views || 0} views`
                    : "Tap to add your daily status update"}
                </p>
              </div>
            </div>

            {myStatus?.items?.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Eye className="w-4 h-4 text-teal-600" />
                <span>{myStatus.items[0]?.views || 0}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Updates Section */}
        {recentUpdates.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 ml-1">
              Recent Updates
            </h2>
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs overflow-hidden">
              {recentUpdates.map((status) => (
                <div
                  key={status.id}
                  onClick={() => openStatusViewer(status.id)}
                  className="flex items-center gap-3.5 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <Avatar
                    src={status.userAvatar}
                    alt={status.userName}
                    size="md"
                    hasStatusRing={true}
                    hasUnseenStatus={true}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{status.userName}</h4>
                    <p className="text-[11px] text-slate-500">{status.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Viewed Updates Section */}
        {viewedUpdates.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">
              Viewed Updates
            </h2>
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs overflow-hidden opacity-85">
              {viewedUpdates.map((status) => (
                <div
                  key={status.id}
                  onClick={() => openStatusViewer(status.id)}
                  className="flex items-center gap-3.5 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <Avatar
                    src={status.userAvatar}
                    alt={status.userName}
                    size="md"
                    hasStatusRing={true}
                    hasUnseenStatus={false}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{status.userName}</h4>
                    <p className="text-[11px] text-slate-400">{status.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
