import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useStatusStore } from '../../stores/statusStore';
import { useUiStore } from '../../stores/uiStore';
import { Type, Image, Sparkles } from 'lucide-react';

export default function CreateStatusModal() {
  const { isCreateModalOpen, setCreateModalOpen, addStatus } = useStatusStore();
  const { showToast } = useUiStore();

  const [statusType, setStatusType] = useState('text'); // 'text' | 'image'
  const [textContent, setTextContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('from-teal-600 to-emerald-800');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  const gradients = [
    { label: "Teal Forest", value: "from-teal-600 to-emerald-800" },
    { label: "Midnight Blue", value: "from-blue-600 to-indigo-900" },
    { label: "Sunset Rose", value: "from-rose-600 to-purple-800" },
    { label: "Amber Dawn", value: "from-amber-600 to-orange-800" },
  ];

  const handlePost = (e) => {
    e.preventDefault();
    if (statusType === 'text') {
      if (!textContent.trim()) {
        showToast("Please enter status text", "warning");
        return;
      }
      addStatus({
        type: 'text',
        text: textContent.trim(),
        backgroundColor: selectedGradient
      });
    } else {
      addStatus({
        type: 'image',
        mediaUrl: imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        caption: caption.trim() || undefined
      });
    }

    showToast("Status published!", "success");
    setTextContent('');
    setCaption('');
    setImageUrl('');
    setCreateModalOpen(false);
  };

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={() => setCreateModalOpen(false)}
      title="Create New Status Update"
      description="Status updates vanish after 24 hours."
    >
      <form onSubmit={handlePost} className="flex flex-col gap-4">
        {/* Type toggle */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setStatusType('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              statusType === 'text' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-teal-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" /> Text Status
          </button>
          <button
            type="button"
            onClick={() => setStatusType('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              statusType === 'image' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-teal-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Image className="w-4 h-4" /> Photo Status
          </button>
        </div>

        {statusType === 'text' ? (
          <div className="flex flex-col gap-3">
            {/* Gradient Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Background:</span>
              <div className="flex items-center gap-2">
                {gradients.map((g) => (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => setSelectedGradient(g.value)}
                    className={`w-7 h-7 rounded-full bg-gradient-to-tr ${g.value} border-2 ${
                      selectedGradient === g.value ? 'border-white ring-2 ring-brand-500' : 'border-transparent'
                    }`}
                    title={g.label}
                  />
                ))}
              </div>
            </div>

            {/* Live Preview Box */}
            <div className={`w-full h-36 rounded-2xl p-4 flex items-center justify-center bg-gradient-to-tr ${selectedGradient} text-white text-center shadow-inner`}>
              <p className="font-bold text-base line-clamp-3">
                {textContent || "Type your status message below..."}
              </p>
            </div>

            <textarea
              rows={3}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="What's on your mind today?"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Input
              label="Photo URL (Demo)"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Input
              label="Caption"
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Share Status
          </Button>
        </div>
      </form>
    </Modal>
  );
}
