import React, { useState, useRef } from 'react';
import BusinessSidebar from '../../components/business/BusinessSidebar';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useAdStore } from '../../stores/adStore';
import { useUiStore } from '../../stores/uiStore';
import { uploadApi } from '../../services/api';
import { 
  Megaphone, 
  Plus, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Pause, 
  Play,
  Upload,
  Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function BusinessAdsPage() {
  const { campaigns, performanceTrends, isCreateModalOpen, setCreateModalOpen, createCampaign, toggleCampaignStatus, fetchCampaigns, isLoading } = useAdStore();
  const { showToast } = useUiStore();

  React.useEffect(() => {
    fetchCampaigns();
  }, []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('Tech & Office Workers in Kigali');
  const [budgetRwf, setBudgetRwf] = useState('150000');
  const [creativeFile, setCreativeFile] = useState(null);
  const [creativePreview, setCreativePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const audiences = [
    "Tech & Office Workers in Kigali",
    "SME Leaders & Business Owners in Rwanda",
    "University Students & Youth (Kigali, Huye, Musanze)",
    "General Public Nationwide",
    "Rwandan Diaspora"
  ];

  const handleCreativeSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      showToast("Creative exceeds 25 MB limit", "warning");
      return;
    }
    setCreativeFile(file);
    setCreativePreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setCreativeFile(null);
    setCreativePreview(null);
    setIsUploading(false);
    setCreateModalOpen(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !budgetRwf) {
      showToast("Please enter title and budget", "warning");
      return;
    }

    let finalCreativeUrl = "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80";
    if (creativeFile) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadApi.uploadFile(creativeFile);
        const rawUrl = uploadResult.url || '';
        finalCreativeUrl = rawUrl.startsWith('http') ? rawUrl : `http://localhost:8000${rawUrl}`;
      } catch (err) {
        console.error("Ad creative upload failed:", err);
        showToast("Failed to upload creative banner", "error");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    createCampaign({
      title: title.trim(),
      description: description.trim(),
      audience,
      budgetRwf,
      creativeUrl: finalCreativeUrl
    });

    showToast("Ad campaign launched!", "success");
    handleClose();
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
      <BusinessSidebar />

      {/* New Ad Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleClose}
        title="Create Targeted Ad Campaign"
        description="Reach thousands of active Muraho users across Rwanda."
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
          <Input
            label="Campaign Title"
            placeholder="e.g. Specialty Rwandan Arabica Coffee Promo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Campaign Description / Offer"
            placeholder="Promote special discounts, new releases, or contact links..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Target Audience
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {audiences.map((aud) => (
                <option key={aud} value={aud}>{aud}</option>
              ))}
            </select>
          </div>

          <Input
            label="Campaign Budget (RWF)"
            type="number"
            placeholder="150000"
            value={budgetRwf}
            onChange={(e) => setBudgetRwf(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Creative Banner Image
            </label>
            <div 
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 dark:hover:border-teal-600 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {creativePreview ? (
                <div className="flex items-center gap-3 w-full">
                  <img src={creativePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {creativeFile ? creativeFile.name : 'Selected creative'}
                    </p>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5">Click to choose another photo</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Click to choose local creative photo</p>
                  <p className="text-[11px] text-slate-400">JPEG, PNG, WebP (up to 25 MB)</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleCreativeSelect}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isUploading}>
              {isUploading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </span>
              ) : (
                "Launch Campaign"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-bg-dark p-3.5 sm:p-6 lg:p-8 select-none pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-brand-700 dark:text-teal-400" />
                Advertising Manager
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Run in-feed sponsored channel updates and conversational lead-generation ads.
              </p>
            </div>

            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setCreateModalOpen(true)}
              className="self-start sm:self-auto"
            >
              Create Campaign
            </Button>
          </div>

          {/* Performance Trends Chart */}
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">Impressions & Clicks Performance</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400">Total reach across public channels and search feeds</p>
              </div>
            </div>

            <div className="h-56 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="impressions" name="Impressions" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="clicks" name="Clicks" stroke="#14B8A6" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Campaign List Cards */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">Campaign History & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{camp.title}</h4>
                      <Badge variant={camp.status === 'Active' ? 'success' : 'default'} size="sm">
                        {camp.status}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-500 mb-2.5 truncate">{camp.audience}</p>

                    <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl mb-2.5 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Impressions</span>
                        <strong className="text-xs font-bold text-slate-800 dark:text-slate-200">{camp.impressions?.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Clicks</span>
                        <strong className="text-xs font-bold text-slate-800 dark:text-slate-200">{camp.clicks?.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">CTR</span>
                        <strong className="text-xs font-bold text-emerald-600">{camp.ctr}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Budget</span>
                      <span className="text-xs font-bold text-brand-700 dark:text-teal-400">{camp.budgetRwf?.toLocaleString()} RWF</span>
                    </div>

                    <button
                      onClick={() => toggleCampaignStatus(camp.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95"
                    >
                      {camp.status === 'Active' ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-500" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-500" /> Resume
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
