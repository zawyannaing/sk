import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Clock,
  User,
  Activity,
  Layers
} from 'lucide-react';
import { SupabaseService } from '../../../utils/supabaseClient';
import { Language } from '../../../types';
import { AuditLogItem } from '../types';

interface ExtendedAuditItem extends AuditLogItem {
  actor_email?: string;
}

interface AuditLogModuleProps {
  language: Language;
}

const ACTION_OPTIONS = [
  { value: 'all', label: 'All Audit Actions' },
  { value: 'admin_adjust_credits', label: 'Admin Adjust Credits' },
  { value: 'approve_topup', label: 'Approve Top-Up' },
  { value: 'reject_topup', label: 'Reject Top-Up' },
  { value: 'rotate_provider_secret_meta', label: 'Rotate Secret Key' },
  { value: 'update_setting', label: 'Update Site Setting' },
  { value: 'grant_daily_credits', label: 'Daily Free Credits' }
];

export const AuditLogModule: React.FC<AuditLogModuleProps> = ({ language }) => {
  const [logs, setLogs] = useState<ExtendedAuditItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const data = await SupabaseService.fetchAuditLogs({
        action: selectedAction !== 'all' ? selectedAction : undefined,
        limit: 100
      });
      setLogs(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [selectedAction]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      (log.actor_email && log.actor_email.toLowerCase().includes(q)) ||
      log.target_type.toLowerCase().includes(q) ||
      (log.target_id && log.target_id.toLowerCase().includes(q))
    );
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Actor', 'Target Type', 'Target ID'];
    const rows = filteredLogs.map(l => [
      l.created_at,
      l.action,
      l.actor_email || l.actor_id || 'System',
      l.target_type,
      l.target_id || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(cell => `"${cell}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `showai_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              {language === 'my' ? 'Audit စာရင်းမှတ်တမ်း' : 'Immutable System Audit Logs'}
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'my'
              ? 'စီမံခန့်ခွဲသူများ၏ လုပ်ဆောင်ချက်များ၊ Credit ဖြည့်စွက်မှုများနှင့် ပြင်ဆင်မှု အသေးစိတ် သမိုင်းမှတ်တမ်း'
              : 'Tamper-evident audit trail protected by database triggers. All credit mutations and configuration changes are permanently recorded.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAuditLogs}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {language === 'my' ? 'ပြန်လည်ရယူမည်' : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs font-medium border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            {language === 'my' ? 'CSV ထုတ်ယူမည်' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, actor email, target..."
            className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full sm:w-auto bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0b0f17]/60 backdrop-blur-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900/70 border-b border-white/5 text-zinc-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="py-3 px-4 w-10"></th>
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-4">Action Event</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-300 font-sans">
            {filteredLogs.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 text-zinc-500">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      <span className="text-emerald-400">{item.action}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-zinc-200 font-medium">{item.actor_email || 'System'}</div>
                      {item.actor_id && (
                        <div className="text-[10px] text-zinc-500 font-mono">{item.actor_id.slice(0, 8)}...</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="text-cyan-400">{item.target_type}</span>
                      {item.target_id && (
                        <span className="text-zinc-400"> ({item.target_id})</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/5">
                        {isExpanded ? 'Hide Payload' : 'View Payload'}
                      </span>
                    </td>
                  </tr>

                  {/* Expandable JSON Payload Diff */}
                  {isExpanded && (
                    <tr className="bg-black/40">
                      <td colSpan={6} className="p-4 border-y border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
                          {/* Before State */}
                          <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 space-y-1">
                            <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                              Before State:
                            </span>
                            <pre className="text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                              {item.before ? JSON.stringify(item.before, null, 2) : '(none)'}
                            </pre>
                          </div>

                          {/* After State */}
                          <div className="p-3 rounded-xl bg-zinc-900/80 border border-emerald-500/20 space-y-1">
                            <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
                              After State:
                            </span>
                            <pre className="text-emerald-300/90 overflow-x-auto whitespace-pre-wrap">
                              {item.after ? JSON.stringify(item.after, null, 2) : '(none)'}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500">
                  No audit log entries found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
