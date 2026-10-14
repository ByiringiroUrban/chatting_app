import React from 'react';
import BusinessSidebar from '../../components/business/BusinessSidebar';
import { useBusinessStore } from '../../stores/businessStore';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle2, 
  PieChart as PieIcon 
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
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export default function BusinessAnalyticsPage() {
  const { analytics } = useBusinessStore();

  const COLORS = ['#0F766E', '#14B8A6', '#F59E0B', '#6366F1'];

  return (
    <div className="flex h-full w-full overflow-hidden">
      <BusinessSidebar />

      <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-bg-dark p-4 sm:p-6 lg:p-8 select-none">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-brand-700 dark:text-teal-400" />
              Advanced Analytics & Reports
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Detailed performance metrics, message volumes, customer satisfaction, and channel conversions.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
              <span className="text-xs text-slate-400">Total Conversations</span>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">4,892</p>
              <span className="text-[11px] text-emerald-600 font-semibold">+12% vs last month</span>
            </div>
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
              <span className="text-xs text-slate-400">Resolved Successfully</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">94.2%</p>
              <span className="text-[11px] text-slate-400 font-medium">168 this week</span>
            </div>
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
              <span className="text-xs text-slate-400">Avg Resolution Time</span>
              <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">4.2 min</p>
              <span className="text-[11px] text-emerald-600 font-semibold">18% faster with AI</span>
            </div>
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
              <span className="text-xs text-slate-400">Customer Rating</span>
              <p className="text-2xl font-black text-amber-500 mt-1">4.9 / 5.0</p>
              <span className="text-[11px] text-slate-400 font-medium">From 480 ratings</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Conversion Source Breakdown */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Customer Acquisition Channels</h3>
              <p className="text-[11px] text-slate-400 mb-4">Traffic sources driving new sales inquiries</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.channelConversion}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.channelConversion.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resolved vs Unresolved Weekly */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Inquiries vs Resolutions</h3>
              <p className="text-[11px] text-slate-400 mb-4">Weekly team productivity breakdown</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="customers" name="New Inquiries" fill="#0F766E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" name="Resolved" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
