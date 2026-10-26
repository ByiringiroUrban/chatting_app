import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { Image, FileText, Film, Upload, X, File, Loader2 } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import { resolveBackendUrl, uploadApi } from '../../services/api';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_AUDIO = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
const ALLOWED_DOCS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-rar-compressed'
];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaAttachmentsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('image'); // 'image' | 'document' | 'video'
  const [selectedFiles, setSelectedFiles] = useState([]); // [{file, preview, type}]
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // { [index]: percent }
  const [uploadErrors, setUploadErrors] = useState([]); // [string]
  const fileInputRef = useRef(null);

  const { sendMessage } = useChatStore();
  const { showToast } = useUiStore();

  const acceptMap = {
    image: ALLOWED_IMAGE.join(','),
    document: [...ALLOWED_DOCS, ...ALLOWED_AUDIO].join(','),
    video: ALLOWED_VIDEO.join(','),
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const errors = [];
    const validFiles = [];

    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} exceeds 25 MB limit`);
        return;
      }
      
      let fileType = 'document';
      if (ALLOWED_IMAGE.includes(file.type)) fileType = 'image';
      else if (ALLOWED_VIDEO.includes(file.type)) fileType = 'video';
      else if (ALLOWED_AUDIO.includes(file.type)) fileType = 'audio';

      let preview = null;
      if (fileType === 'image') {
        preview = URL.createObjectURL(file);
      } else if (fileType === 'video') {
        preview = URL.createObjectURL(file);
      }

      validFiles.push({ file, preview, type: fileType });
    });

    setUploadErrors(errors);
    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      if (updated[index]?.preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSendAttachments = async () => {
    if (selectedFiles.length === 0) {
      showToast("Please select at least one file", "info");
      return;
    }

    setIsUploading(true);
    setUploadErrors([]);
    const errors = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const { file, type } = selectedFiles[i];
      setUploadProgress(prev => ({ ...prev, [i]: 10 }));

      try {
        // Simulate progress while uploading
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [i]: Math.min((prev[i] || 10) + 15, 90)
          }));
        }, 300);

        const result = await uploadApi.uploadFile(file);
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [i]: 100 }));

        const rawUrl = result.url || '';
        const mediaUrl = resolveBackendUrl(rawUrl);

        sendMessage({
          type,
          mediaUrl,
          fileName: result.filename || file.name,
          fileSize: formatSize(result.size || file.size),
          caption: i === 0 ? caption.trim() || undefined : undefined,
        });
      } catch (err) {
        errors.push(`Failed to upload: ${file.name}`);
        setUploadProgress(prev => ({ ...prev, [i]: -1 }));
      }
    }

    if (errors.length > 0) {
      setUploadErrors(errors);
      showToast(`${errors.length} file(s) failed to upload`, "error");
    } else {
      showToast(`${selectedFiles.length} file(s) sent!`, "success");
      handleClose();
    }

    setIsUploading(false);
  };

  const handleClose = () => {
    // Cleanup previews
    selectedFiles.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setSelectedFiles([]);
    setCaption('');
    setUploadProgress({});
    setUploadErrors([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Attach Media or File">
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

        {/* File picker area */}
        <div 
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 dark:hover:border-teal-600 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {activeTab === 'image' ? 'Click to select photos' : activeTab === 'video' ? 'Click to select videos' : 'Click to select documents'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {activeTab === 'image' ? 'JPEG, PNG, GIF, WebP' : activeTab === 'video' ? 'MP4, WebM, MOV' : 'PDF, DOCX, XLSX, PPTX, ZIP'} (up to 25 MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptMap[activeTab]}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Selected files preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{selectedFiles.length} file(s) selected</p>
            {selectedFiles.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                {/* Preview thumbnail */}
                {item.type === 'image' && item.preview ? (
                  <img src={item.preview} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : item.type === 'video' && item.preview ? (
                  <video src={item.preview} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" muted />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center flex-shrink-0">
                    <File className="w-5 h-5 text-teal-600" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-slate-800 dark:text-slate-200">{item.file.name}</p>
                  <p className="text-[10px] text-slate-400">{formatSize(item.file.size)}</p>
                  
                  {/* Upload progress bar */}
                  {uploadProgress[index] !== undefined && uploadProgress[index] > 0 && (
                    <div className="mt-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          uploadProgress[index] === -1 ? 'bg-rose-500 w-full' : 
                          uploadProgress[index] === 100 ? 'bg-emerald-500' : 'bg-brand-600'
                        }`}
                        style={{ width: uploadProgress[index] === -1 ? '100%' : `${uploadProgress[index]}%` }}
                      />
                    </div>
                  )}
                </div>

                {!isUploading && (
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Caption input */}
        {selectedFiles.length > 0 && (
          <Input
            label="Add Caption (Optional)"
            placeholder="Add a comment about this attachment..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        )}

        {/* Upload errors */}
        {uploadErrors.length > 0 && (
          <div className="text-xs text-rose-600 dark:text-rose-400 space-y-1">
            {uploadErrors.map((err, i) => (
              <p key={i} className="flex items-center gap-1"><X className="w-3 h-3" />{err}</p>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={handleClose} disabled={isUploading}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={handleSendAttachments} 
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
              </span>
            ) : (
              `Send ${selectedFiles.length || ''} Attachment${selectedFiles.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
