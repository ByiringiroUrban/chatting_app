import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { Image, FileText, Film, Upload } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

export default function MediaAttachmentsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('image'); // 'image' | 'document' | 'video'
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [fileName, setFileName] = useState('');
  const { sendMessage } = useChatStore();

  const sampleImages = [
    { label: "Design Mockup", url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80" },
    { label: "Kigali Skyline", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80" },
    { label: "Coffee Beans", url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80" },
  ];

  const handleSendAttachment = () => {
    if (activeTab === 'image') {
      sendMessage({
        type: 'image',
        mediaUrl: mediaUrl || sampleImages[0].url,
        caption: caption.trim() || undefined
      });
    } else if (activeTab === 'document') {
      sendMessage({
        type: 'document',
        fileName: fileName.trim() || "Project_Architecture_Specification.pdf",
        fileSize: "3.2 MB"
      });
    } else if (activeTab === 'video') {
      sendMessage({
        type: 'text',
        text: `[Video Attachment: ${caption || "Demo Video Review.mp4"}]`
      });
    }

    onClose();
    setCaption('');
    setMediaUrl('');
    setFileName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Attach Media or File">
      <div className="flex flex-col gap-4">
        {/* Attachment Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'image' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-teal-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Image className="w-4 h-4" /> Photos
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'document' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-teal-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Document
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'video' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-teal-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" /> Video
          </button>
        </div>

        {activeTab === 'image' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-500">Pick from sample demo photos or paste an image URL:</p>
            <div className="grid grid-cols-3 gap-2">
              {sampleImages.map((img) => (
                <div
                  key={img.label}
                  onClick={() => setMediaUrl(img.url)}
                  className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                    mediaUrl === img.url ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-20 object-cover" />
                  <p className="text-[10px] text-center py-1 bg-slate-100 dark:bg-slate-800 font-medium truncate">{img.label}</p>
                </div>
              ))}
            </div>

            <Input
              label="Or Image URL"
              placeholder="https://images.unsplash.com/..."
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />

            <Input
              label="Add Caption (Optional)"
              placeholder="Add a comment about this photo..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'document' && (
          <div className="flex flex-col gap-3">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Drag & drop documents here</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF, DOCX, XLSX, PPTX (up to 25MB)</p>
            </div>

            <Input
              label="Document Name"
              placeholder="e.g. Q4_Financial_Report.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'video' && (
          <div className="flex flex-col gap-3">
            <Input
              label="Video Title or Description"
              placeholder="e.g. Product walkthrough demo"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <p className="text-xs text-slate-500">Video streaming simulation will be attached to the chat.</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSendAttachment}>Send Attachment</Button>
        </div>
      </div>
    </Modal>
  );
}
