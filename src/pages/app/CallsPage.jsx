import React, { useState } from 'react';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useCallStore } from '../../stores/callStore';
import { mockContacts } from '../../data/mockUsers';
import { 
  Phone, 
  Video, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Clock, 
  Plus 
} from 'lucide-react';

export default function CallsPage() {
  const { callHistory, startCall, receiveIncomingCall, fetchCallHistory, isLoading } = useCallStore();
  const [filter, setFilter] = useState('all'); // 'all' | 'missed'

  React.useEffect(() => {
    fetchCallHistory();
  }, []);

  const filtered = callHistory.filter(c => filter === 'all' || c.status === 'missed');

  const handleStartCall = (contact, type) => {
    startCall(contact, type);
  };

  const handleSimulateIncoming = () => {
    const contact = mockContacts[0];
    receiveIncomingCall(contact, 'video');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-bg-dark overflow-y-auto p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Phone className="w-6 h-6 text-brand-700 dark:text-teal-400" />
              Call History
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Simulated encrypted HD voice and video calls with your contacts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateIncoming}
              title="Simulate an incoming video call to test UI"
            >
              Test Incoming Call
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              filter === 'all'
                ? 'bg-brand-700 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Calls ({callHistory.length})
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              filter === 'missed'
                ? 'bg-brand-700 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Missed Calls
          </button>
        </div>

        {/* Call Logs Card */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs overflow-hidden">
          {filtered.map((call) => {
            const isMissed = call.status === 'missed';
            const isOutgoing = call.direction === 'outgoing';

            return (
              <div
                key={call.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Avatar src={call.avatar} alt={call.name} size="md" />
                  <div>
                    <h3 className={`text-xs font-bold ${isMissed ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {call.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      {isMissed ? (
                        <PhoneMissed className="w-3.5 h-3.5 text-rose-500" />
                      ) : isOutgoing ? (
                        <PhoneOutgoing className="w-3.5 h-3.5 text-teal-600" />
                      ) : (
                        <PhoneIncoming className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>{call.timestamp}</span>
                      {call.duration !== '0s' && (
                        <span>• {call.duration}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartCall({ id: call.contactId, name: call.name, avatar: call.avatar }, 'voice')}
                    className="p-2 text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-teal-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Start Voice Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStartCall({ id: call.contactId, name: call.name, avatar: call.avatar }, 'video')}
                    className="p-2 text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-teal-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Start Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
