import React from 'react';
import BusinessSidebar from '../../components/business/BusinessSidebar';
import { useBusinessStore } from '../../stores/businessStore';
import { 
  MessageSquare, 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';

export default function BusinessDashboardPage() {
  const { profile, analytics, customerInbox, products } = useBusinessStore();

  const metrics = [
    { label: "Total Messages", value: analytics.overview.totalMessages?.toLocaleString(), change: "+14.2%", icon: MessageSquare, color: "text-brand-600 bg-teal-50 dark:bg-brand-950/60" },
    { label: "Active Inquiries", value: analytics.overview.activeConversations, change: "+8.5%", icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/60" },
    { label: "Response Rate", value: `${analytics.overview.responseRate}%`, change: "+1.2%", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60" },
    { label: "Avg Response Time", value: analytics.overview.averageResponseTime, change: "-18%", icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/60" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
      <BusinessSidebar />

      <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-bg-dark p-3.5 sm:p-6 lg:p-8 select-none pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                {profile.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time commerce inbox, customer engagement, and analytics in Rwanda.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-semibold px-3 py-1 bg-teal-100 text-teal-800 dark:bg-brand-950 dark:text-teal-300 rounded-full">
                AI Auto-Responder Active
              </span>
            </div>
          </div>

          {/* 4 Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">{m.label}</span>
                    <div className={`p-1.5 sm:p-2 rounded-xl ${m.color}`}>
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                      {m.value}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-600 flex items-center">
                      <ArrowUpRight className="w-3 h-3" /> {m.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Daily Message Volume Area Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">Weekly Inbound Traffic</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">Total customer interactions across Kigali</p>
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-teal-600 bg-teal-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full">
                  Last 7 Days
                </span>
              </div>

              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyActivity}>
                    <defs>
                      <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} />
                    <YAxis stroke="#94A3B8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="messages" stroke="#0F766E" strokeWidth={2.5} fillOpacity={1} fill="url(#msgGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Peak Hours Bar Chart */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">Peak Customer Hours</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mb-3">CAT Timezone (Kigali)</p>

              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="hour" stroke="#94A3B8" fontSize={9} />
                    <YAxis stroke="#94A3B8" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="volume" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Inquiries Preview */}
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Recent Customer Inquiries</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {customerInbox.slice(0, 3).map((item) => (
                <div key={item.id} className="py-2.5 sm:py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.customerName}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{item.lastMessage}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
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
