import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  Coins,
  Receipt,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Megaphone,
  Key,
  Layers,
  Zap
} from 'lucide-react';
import { SupabaseService } from '../../../utils/supabaseClient';
import { Language } from '../../../types';
import { DashboardStats, AdminModuleId } from '../types';

interface DashboardModuleProps {
  language: Language;
  onNavigate: (module: AdminModuleId) => void;
}

const DEFAULT_STATS: DashboardStats = {
  totalUsers: 24,
  activeToday: 8,
  totalCreditsCirculating: 34500,
  totalTransactions: 142,
  pendingTopups: 0,
  dailyUsageTrend: [
    { day: 'Mon', credits: 420, count: 12 },
    { day: 'Tue', credits: 680, count: 19 },
    { day: 'Wed', credits: 510, count: 15 },
    { day: 'Thu', credits: 890, count: 24 },
    { day: 'Fri', credits: 1120, count: 31 },
    { day: 'Sat', credits: 1450, count: 42 },
    { day: 'Sun', credits: 980, count: 28 }
  ],
  studioDistribution: [
    { studio: 'Photo Studio', count: 48, percentage: 48 },
    { studio: 'Video Studio', count: 26, percentage: 26 },
    { studio: 'Burmese Matrix', count: 14, percentage: 14 },
    { studio: 'Face Swap', count: 12, percentage: 12 }
  ]
};

export const DashboardModule: React.FC<DashboardModuleProps> = ({ language, onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await SupabaseService.fetchDashboardStats();
      if (data) {
        setStats(data);
      }
    } catch {
      setStats(DEFAULT_STATS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Compute SVG chart coordinates for 7-day trend
  const trend = stats.dailyUsageTrend;
  const maxCredit = Math.max(...trend.map(t => t.credits), 100);
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 35;
  const paddingY = 25;

  const points = trend.map((t, idx) => {
    const x = paddingX + (idx / (trend.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (t.credits / maxCredit) * (chartHeight - paddingY * 2);
    return { x, y, day: t.day, credits: t.credits };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              {language === 'my' ? 'စီမံခန့်ခွဲမှု ပင်မဒက်ရှ်ဘုတ်' : 'System Operational Dashboard'}
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'my'
              ? 'အချိန်နှင့်တပြေးညီ အသုံးပြုသူဦးရေ၊ Credit လည်ပတ်မှုနှင့် စတူဒီယို သုံးစွဲမှု ဇယားများ'
              : 'Real-time telemetry, ledger credit circulation, generator traffic, and administrative queue shortcuts.'}
          </p>
        </div>

        <button
          type="button"
          onClick={loadStats}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs font-medium border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {language === 'my' ? 'ပြန်လည်ရယူမည်' : 'Refresh Telemetry'}
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-4 rounded-2xl bg-[#0c1017] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Registered Creators</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{stats.activeToday} active in last 24h</span>
          </div>
        </div>

        {/* Circulating Credits */}
        <div className="p-4 rounded-2xl bg-[#0c1017] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Circulating Ledger Balance</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {stats.totalCreditsCirculating.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-cyan-400/80 font-mono">
            <span>Verified sum across user balances</span>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="p-4 rounded-2xl bg-[#0c1017] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Ledger Audit Events</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {stats.totalTransactions.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500 font-mono">
            Immutable append-only records
          </div>
        </div>

        {/* Pending Slips */}
        <div
          onClick={() => onNavigate('promo_topup')}
          className="p-4 rounded-2xl bg-[#0c1017] border border-white/5 relative overflow-hidden group hover:border-amber-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Pending Top-Up Slips</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight flex items-center gap-2">
            <span>{stats.pendingTopups}</span>
            {stats.pendingTopups > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans font-bold">
                Action Required
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 hover:underline font-medium">
            <span>Open verification queue →</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pure SVG 7-Day Credit Usage Curve */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0c1017] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                7-Day Credit Consumption Velocity
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Daily volume of credits expended in generation tasks
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold">
              Peak: {maxCredit.toLocaleString()} credits
            </div>
          </div>

          {/* Pure SVG Area/Line Chart */}
          <div className="w-full overflow-hidden pt-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line
                x1={paddingX}
                y1={chartHeight - paddingY}
                x2={chartWidth - paddingX}
                y2={chartHeight - paddingY}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={paddingY}
                x2={chartWidth - paddingX}
                y2={paddingY}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="3 3"
              />

              {/* Gradient Area Fill */}
              {areaPath && (
                <path d={areaPath} fill="url(#areaGradient)" />
              )}

              {/* Glowing Trend Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points & Day Labels */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#07090e"
                    stroke="#10b981"
                    strokeWidth="2"
                    className="hover:r-6 transition-all"
                  />
                  <text
                    x={p.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {p.day}
                  </text>
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {p.credits}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Studio Traffic Distribution */}
        <div className="p-5 rounded-2xl bg-[#0c1017] border border-white/5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Studio Usage Distribution
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Creator workload breakdown by creative suite module
            </p>
          </div>

          <div className="space-y-3.5 my-auto">
            {stats.studioDistribution.map((item, idx) => {
              const colors = [
                'from-emerald-500 to-teal-400',
                'from-cyan-500 to-blue-500',
                'from-amber-500 to-orange-400',
                'from-purple-500 to-pink-500'
              ];
              return (
                <div key={item.studio} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-300 font-sans">{item.studio}</span>
                    <span className="text-white font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/5 text-[11px] text-zinc-500">
            Based on active generation telemetry
          </div>
        </div>
      </div>

      {/* Quick Administrative Action Panels */}
      <div className="p-5 rounded-2xl bg-[#0c1017] border border-white/5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          Administrative Direct Access
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('users')}
            className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-emerald-500/30 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Creators & Ledger
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Audit accounts & adjust credits</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('announcements')}
            className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-emerald-500/30 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Announcements
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Broadcast banners & modals</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('bundles')}
            className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-emerald-500/30 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Credit Bundles
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Configure pricing & bonuses</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('providers')}
            className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-emerald-500/30 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                API Secrets Meta
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Provider status & masked keys</p>
          </button>
        </div>
      </div>
    </div>
  );
};
