import React, { useState } from 'react';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CreateChannelModal from '../../components/channels/CreateChannelModal';
import ChannelSubscriptionModal from '../../components/channels/ChannelSubscriptionModal';
import { useChannelStore } from '../../stores/channelStore';
import { useUiStore } from '../../stores/uiStore';
import { 
  Radio, 
  Plus, 
  Users, 
  Check, 
  Lock, 
  Eye, 
  Share2, 
  TrendingUp, 
  Sparkles,
  ArrowLeft 
} from 'lucide-react';

export default function ChannelsPage() {
  const { 
    channels, 
    activeChannelId, 
    setActiveChannelId, 
    toggleSubscribe, 
    setCreateModalOpen, 
    addReactionToPost 
  } = useChannelStore();

  const { showToast } = useUiStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [mobileShowFeed, setMobileShowFeed] = useState(false);

  const categories = ["All", "Technology", "AI & Innovation", "Business", "Startups", "Education", "Sports"];

  const filteredChannels = channels.filter(c => 
    activeCategory === 'All' || c.category === activeCategory
  );

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];

  const handleSelectChannel = (id) => {
    setActiveChannelId(id);
    setMobileShowFeed(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://muraho.rw/channels/${activeChannel.handle}`);
    showToast("Channel link copied to clipboard!", "info");
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-50 dark:bg-bg-dark select-none pb-16 md:pb-0">
      <CreateChannelModal />
      <ChannelSubscriptionModal />

      {/* Channels Directory Sidebar (hidden on mobile when reading channel feed) */}
      <div className={`w-full md:w-80 lg:w-96 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col h-full flex-shrink-0 ${
        mobileShowFeed ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Radio className="w-5 h-5 text-brand-700 dark:text-teal-400" /> Channels
            </h1>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setCreateModalOpen(true)}
            >
              New
            </Button>
          </div>

          {/* Categories pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors active:scale-95 ${
                  activeCategory === cat
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => handleSelectChannel(channel.id)}
              className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-slate-800 ${
                activeChannelId === channel.id
                  ? 'bg-teal-50/70 dark:bg-brand-950/40'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <Avatar src={channel.avatar} alt={channel.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1">
                    {channel.name}
                    {channel.isPremium && <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {channel.subscribers?.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{channel.description}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={channel.isPremium ? "warning" : "default"} size="sm">
                    {channel.category}
                  </Badge>
                  {channel.isSubscribed && (
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Following
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channel Post Feed & Profile Header */}
      <div className={`flex-1 flex flex-col h-full bg-slate-100/50 dark:bg-bg-darker overflow-y-auto ${
        !mobileShowFeed ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Mobile Back Button Bar */}
        <div className="md:hidden flex items-center gap-2 px-3 py-2 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setMobileShowFeed(false)}
            className="p-1 text-slate-600 dark:text-slate-300 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">
            {activeChannel.name}
          </span>
        </div>

        {/* Channel Banner Header */}
        <div className="bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar src={activeChannel.avatar} alt={activeChannel.name} size="lg" className="sm:w-16 sm:h-16 flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 truncate">{activeChannel.name}</h2>
                {activeChannel.isPremium && <Badge variant="warning">Premium</Badge>}
              </div>
              <p className="text-xs text-slate-500">{activeChannel.handle} • {activeChannel.subscribers?.toLocaleString()} subscribers</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 max-w-xl">{activeChannel.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button variant="ghost" size="sm" icon={Share2} onClick={handleShare}>
              Share
            </Button>
            <Button
              variant={activeChannel.isSubscribed ? "secondary" : "primary"}
              size="md"
              onClick={() => toggleSubscribe(activeChannel.id)}
            >
              {activeChannel.isSubscribed ? "Following" : activeChannel.isPremium ? `Subscribe (${activeChannel.priceMonthly?.toLocaleString()} RWF)` : "Follow"}
            </Button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="max-w-2xl mx-auto w-full p-3 sm:p-6 space-y-4">
          {activeChannel.posts?.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs"
            >
              {post.isLocked ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{post.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">{post.previewText}</p>
                  <Button variant="primary" size="sm" onClick={() => toggleSubscribe(activeChannel.id)}>
                    Unlock Premium Content ({activeChannel.priceMonthly?.toLocaleString()} RWF)
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{activeChannel.name}</span>
                    <span>{post.timestamp}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    {post.content}
                  </p>

                  {post.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden mb-4">
                      <img src={post.mediaUrl} alt={post.title} className="w-full max-h-72 sm:max-h-80 object-cover" />
                    </div>
                  )}

                  {/* Post Footer with reactions & views */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.reactions?.map((r, idx) => (
                        <button
                          key={idx}
                          onClick={() => addReactionToPost(activeChannel.id, post.id, r.emoji)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-90 transition-transform"
                        >
                          <span>{r.emoji}</span>
                          <span className="font-bold text-[10px]">{r.count}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{post.views} views</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
