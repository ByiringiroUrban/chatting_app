import React, { useState } from 'react';
import BusinessSidebar from '../../components/business/BusinessSidebar';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useBusinessStore } from '../../stores/businessStore';
import { useUiStore } from '../../stores/uiStore';
import { 
  Inbox, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  FileText,
  ArrowLeft 
} from 'lucide-react';

export default function BusinessInboxPage() {
  const { customerInbox, updateCustomerStatus, updateCustomerNote } = useBusinessStore();
  const { showToast } = useUiStore();

  const [selectedCustomerId, setSelectedCustomerId] = useState(customerInbox[0]?.id);
  const [filterStatus, setFilterStatus] = useState('All');
  const [replyText, setReplyText] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const selectedCustomer = customerInbox.find(c => c.id === selectedCustomerId) || customerInbox[0];

  const filteredInbox = customerInbox.filter(item => 
    filterStatus === 'All' || item.status === filterStatus
  );

  const handleSelectCustomer = (id) => {
    setSelectedCustomerId(id);
    setMobileShowDetail(true);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    showToast(`Reply dispatched to ${selectedCustomer.customerName}!`, "success");
    setReplyText('');
  };

  const handleSaveNote = () => {
    if (!noteDraft.trim()) return;
    updateCustomerNote(selectedCustomer.id, noteDraft);
    showToast("Customer internal note updated!", "success");
    setNoteDraft('');
  };

  const statusColors = {
    Open: "bg-teal-50 text-brand-700 dark:bg-brand-950/60 dark:text-teal-300 border-teal-200",
    Pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200",
    Resolved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200"
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
      <BusinessSidebar />

      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-50 dark:bg-bg-dark select-none pb-16 md:pb-0">
        
        {/* Customer Ticket List: Hidden on mobile when viewing detail */}
        <div className={`w-full md:w-80 lg:w-96 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col h-full flex-shrink-0 ${
          mobileShowDetail ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
              <Inbox className="w-5 h-5 text-brand-700 dark:text-teal-400" /> Customer Inbox
            </h2>

            {/* Status filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['All', 'Open', 'Pending', 'Resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap active:scale-95 transition-all ${
                    filterStatus === st
                      ? 'bg-brand-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredInbox.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectCustomer(item.id)}
                className={`p-3.5 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-slate-800 ${
                  selectedCustomerId === item.id
                    ? 'bg-teal-50/70 dark:bg-brand-950/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar src={item.avatar} alt={item.customerName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.customerName}</h4>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.lastMessage}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">{item.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Ticket Detail: Fullscreen on mobile with back button */}
        <div className={`flex-1 flex flex-col h-full bg-slate-50 dark:bg-bg-dark overflow-y-auto p-3.5 sm:p-6 ${
          !mobileShowDetail ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedCustomer ? (
            <div className="max-w-3xl mx-auto w-full space-y-4">
              
              {/* Mobile Back to Tickets Button */}
              <button
                onClick={() => setMobileShowDetail(false)}
                className="md:hidden inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-teal-400 py-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Inquiries
              </button>

              {/* Customer Header */}
              <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={selectedCustomer.avatar} alt={selectedCustomer.customerName} size="lg" />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">{selectedCustomer.customerName}</h3>
                    <p className="text-xs text-slate-400 truncate">{selectedCustomer.customerPhone} • Assigned: {selectedCustomer.assignedTo}</p>
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Open', 'Pending', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      onClick={() => updateCustomerStatus(selectedCustomer.id, st)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                        selectedCustomer.status === st
                          ? 'border-brand-600 bg-brand-600 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Thread Preview */}
              <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">Customer Inquiry</span>
                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  “{selectedCustomer.lastMessage}”
                </p>

                {/* Quick Reply Form */}
                <form onSubmit={handleSendReply} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official customer reply..."
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <Button type="submit" variant="primary" size="md">
                    <Send className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Reply</span>
                  </Button>
                </form>
              </div>

              {/* Customer Internal Notes */}
              <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Internal Team Notes
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mb-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 p-3 rounded-xl leading-relaxed">
                  {selectedCustomer.notes || "No notes yet recorded for this client."}
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Add an update to customer notes..."
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <Button variant="secondary" size="sm" onClick={handleSaveNote}>
                    Save
                  </Button>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center p-8 text-slate-400">Select an inquiry from the inbox.</div>
          )}
        </div>

      </div>
    </div>
  );
}
