import React, { useState } from 'react';
import BusinessSidebar from '../../components/business/BusinessSidebar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useBusinessStore } from '../../stores/businessStore';
import { useUiStore } from '../../stores/uiStore';
import { Bot, Plus, Trash2, Sparkles, CheckCircle2, MessageSquare, Zap } from 'lucide-react';

export default function BusinessAiPage() {
  const { profile, toggleAiSupport, addFaq, deleteFaq } = useBusinessStore();
  const { showToast } = useUiStore();

  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [testQuery, setTestQuery] = useState('');
  const [testResponse, setTestResponse] = useState('');

  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    addFaq({ question: newQuestion.trim(), answer: newAnswer.trim() });
    showToast("Knowledge Base FAQ added!", "success");
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleTestBot = (e) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    const queryLower = testQuery.toLowerCase();
    const matchedFaq = profile.aiSupport?.faqs?.find(f => 
      f.question.toLowerCase().includes(queryLower) || queryLower.includes('momo') || queryLower.includes('payment') || queryLower.includes('shipping') || queryLower.includes('delivery')
    );

    if (matchedFaq) {
      setTestResponse(matchedFaq.answer);
    } else {
      setTestResponse("Muraho! I have forwarded your inquiry directly to our human customer team in Kigali. We will respond shortly!");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
      <BusinessSidebar />

      <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-bg-dark p-3.5 sm:p-6 lg:p-8 select-none pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-brand-700 dark:text-teal-400" />
                AI Customer Support Suite
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your automated 24/7 business responder and Rwandan knowledge base.
              </p>
            </div>

            {/* AI Toggle Switch */}
            <div className="flex items-center gap-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 p-2 px-3.5 rounded-2xl shadow-xs self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Assistant</span>
              <button
                type="button"
                onClick={toggleAiSupport}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  profile.aiSupport?.enabled ? 'bg-brand-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
              </button>
            </div>
          </div>

          {/* AI Status Card */}
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-md flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> High-Confidence Automation
              </div>
              <h3 className="text-base sm:text-lg font-bold">Smart Human Handoff Active</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                The bot handles routine inquiries (MoMo codes, business hours, delivery rates) and automatically tags your team when an escalation is detected.
              </p>
            </div>
            <Zap className="w-10 h-10 text-teal-400 opacity-60 hidden sm:block flex-shrink-0 ml-4" />
          </div>

          {/* Knowledge Base FAQs */}
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-700 dark:text-teal-400" />
              Business Knowledge Base & FAQs
            </h3>

            {/* List of existing FAQs */}
            <div className="space-y-2.5">
              {profile.aiSupport?.faqs?.map((faq) => (
                <div
                  key={faq.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{faq.question}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{faq.answer}</p>
                  </div>
                  <button
                    onClick={() => deleteFaq(faq.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 flex-shrink-0"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add FAQ Form */}
            <form onSubmit={handleAddFaq} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Add New FAQ</h4>
              <Input
                label="Customer Question"
                placeholder="e.g. Do you accept Airtel Money or MoMo?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                required
              />
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  AI Answer
                </label>
                <textarea
                  rows={2}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Official automated response to provide customers..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm" icon={Plus}>
                  Add to Knowledge Base
                </Button>
              </div>
            </form>
          </div>

          {/* Live Simulator Playground */}
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-700 dark:text-teal-400" />
              Live AI Chat Simulator
            </h3>
            <p className="text-xs text-slate-400">Test how your bot responds to typical customer messages.</p>

            <form onSubmit={handleTestBot} className="flex gap-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="e.g. 'What payment methods do you accept?'"
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Button type="submit" variant="primary" size="sm">
                Test
              </Button>
            </form>

            {testResponse && (
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-brand-950/40 border border-teal-200 dark:border-brand-800/40 text-xs">
                <span className="font-bold text-teal-800 dark:text-teal-300 block mb-1">Bot Simulation Output:</span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{testResponse}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
