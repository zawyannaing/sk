import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Coins,
  History,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  AlertCircle,
  RefreshCw,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { AdminUserRecord, CreditLedgerItem, UserStatus } from '../types';
import { adminCopy } from '../adminCopy';
import { Language } from '../../../types';
import { SupabaseService } from '../../../utils/supabaseClient';

interface UsersModuleProps {
  language: Language;
}

export const UsersModule: React.FC<UsersModuleProps> = ({ language }) => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // Modals state
  const [selectedUserForAdjust, setSelectedUserForAdjust] = useState<AdminUserRecord | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('admin_adjust');
  const [adjustNote, setAdjustNote] = useState<string>('');
  const [adjustLoading, setAdjustLoading] = useState<boolean>(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const [selectedUserForLedger, setSelectedUserForLedger] = useState<AdminUserRecord | null>(null);
  const [ledgerItems, setLedgerItems] = useState<CreditLedgerItem[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState<boolean>(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const copy = adminCopy[language].users;
  const adjustCopy = adminCopy[language].adjustModal;
  const ledgerCopy = adminCopy[language].ledgerModal;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await SupabaseService.fetchAdminUsersList({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        page,
        pageSize
      });

      if (res.error) {
        showToast(res.error, 'error');
      } else {
        const mapped: AdminUserRecord[] = (res.users || []).map((row: any) => {
          const verifiedBal =
            row.user_credit_balances?.[0]?.balance ??
            (typeof row.credits === 'number' ? row.credits : row.credit_balance ?? 0);
          const totalTx = row.user_credit_balances?.[0]?.total_transactions ?? 0;

          return {
            id: row.id,
            name: row.display_name || row.name || row.email?.split('@')[0] || 'User',
            username: row.username || 'user',
            email: row.email,
            avatar: row.avatar_url || row.avatar || '',
            role: row.role === 'admin' ? 'admin' : 'user',
            status: (row.status as UserStatus) || 'active',
            createdAt: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : '2026-01-01',
            lastSeenAt: row.last_seen_at ? new Date(row.last_seen_at).toISOString().slice(0, 10) : undefined,
            verifiedBalance: verifiedBal,
            totalTransactions: totalTx,
            credits: verifiedBal
          };
        });

        setUsers(mapped);
        setTotalUsers(res.total || mapped.length);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm, roleFilter, statusFilter, page]);

  // Adjust credits submission
  const handleCommitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAdjust) return;

    const amt = parseInt(adjustAmount, 10);
    if (isNaN(amt) || amt === 0) {
      setAdjustError('Please specify a non-zero credit amount to add or deduct.');
      return;
    }

    if (!adjustNote.trim()) {
      setAdjustError('A detailed audit note is mandatory for all manual ledger adjustments.');
      return;
    }

    setAdjustLoading(true);
    setAdjustError(null);

    try {
      const res = await SupabaseService.adminAdjustUserCredits(
        selectedUserForAdjust.id,
        amt,
        adjustReason,
        adjustNote.trim()
      );

      if (res.error || !res.success) {
        setAdjustError(res.error || 'Failed to adjust user credits');
      } else {
        showToast(copy.adjustSuccess, 'success');
        setSelectedUserForAdjust(null);
        setAdjustAmount('');
        setAdjustNote('');
        loadUsers();
      }
    } catch (err: any) {
      setAdjustError(err?.message || 'Network error');
    } finally {
      setAdjustLoading(false);
    }
  };

  // Open ledger drawer
  const handleOpenLedger = async (user: AdminUserRecord) => {
    setSelectedUserForLedger(user);
    setLedgerLoading(true);
    try {
      const res = await SupabaseService.fetchUserLedger(user.id, 50);
      setLedgerItems(res.ledger || []);
    } finally {
      setLedgerLoading(false);
    }
  };

  // Status modification (Suspend / Ban / Unban)
  const handleUpdateStatus = async (user: AdminUserRecord, nextStatus: UserStatus) => {
    const confirmPrompt = `Are you sure you want to change ${user.name}'s status to "${nextStatus}"?`;
    if (!window.confirm(confirmPrompt)) return;

    try {
      const res = await SupabaseService.updateUserStatus(user.id, nextStatus);
      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast(copy.statusChangeSuccess, 'success');
        loadUsers();
      }
    } catch {
      showToast('Error updating status', 'error');
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    if (users.length === 0) return;
    const headers = ['ID', 'Email', 'Display Name', 'Username', 'Role', 'Status', 'Verified Balance', 'Created At'];
    const rows = users.map((u) => [
      u.id,
      u.email,
      `"${u.name.replace(/"/g, '""')}"`,
      u.username,
      u.role,
      u.status,
      u.verifiedBalance ?? 0,
      u.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `showai_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-950/50'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-serif">{copy.title}</h2>
          <p className="text-xs text-zinc-400 mt-1">{copy.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer w-fit"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>{copy.exportCsvBtn}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-[#0d111a] border border-white/5 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder={copy.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">{copy.filterAllRoles}</option>
            <option value="admin">{copy.filterRoleAdmin}</option>
            <option value="user">{copy.filterRoleUser}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">{copy.filterAllStatus}</option>
            <option value="active">{copy.filterStatusActive}</option>
            <option value="suspended">{copy.filterStatusSuspended}</option>
            <option value="banned">{copy.filterStatusBanned}</option>
          </select>

          <button
            type="button"
            onClick={loadUsers}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl bg-[#0a0d14] border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e121b] border-b border-white/5 text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">{copy.colUser}</th>
                <th className="py-3 px-4">{copy.colRole}</th>
                <th className="py-3 px-4">{copy.colStatus}</th>
                <th className="py-3 px-4">{copy.colBalance}</th>
                <th className="py-3 px-4">{copy.colJoined}</th>
                <th className="py-3 px-4 text-right">{copy.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                    <span>Loading verified database records...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono">
                    {copy.noUsersFound}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0 overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{u.name[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-white truncate">{u.name}</p>
                          <p className="text-[11px] font-mono text-zinc-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
                          <Crown className="w-3 h-3" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-mono">
                          Creator
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.status === 'active' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                          Active
                        </span>
                      )}
                      {u.status === 'suspended' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
                          Suspended
                        </span>
                      )}
                      {u.status === 'banned' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold">
                          Banned
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{(u.verifiedBalance ?? 0).toLocaleString()}</span>
                        <span className="text-[10px] text-zinc-500 font-normal">CR</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">{u.createdAt}</td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForAdjust(u);
                            setAdjustAmount('');
                            setAdjustNote('');
                            setAdjustError(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors text-[11px] font-semibold"
                        >
                          {copy.adjustCreditsBtn}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenLedger(u)}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors"
                          title={copy.viewLedgerBtn}
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        {/* Status Toggle Actions */}
                        {u.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(u, 'suspended')}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                            title="Suspend User"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(u, 'active')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                            title="Activate User"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-[#0c1017] border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>
            {copy.paginationShowing} {Math.min(totalUsers, (page - 1) * pageSize + 1)} {copy.paginationTo}{' '}
            {Math.min(totalUsers, page * pageSize)} {copy.paginationOf} {totalUsers} {copy.paginationUsers}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="text-zinc-300 font-bold">{page}</span>
            <button
              type="button"
              disabled={page * pageSize >= totalUsers}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Adjust Credits Modal */}
      {selectedUserForAdjust && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#0d111a] border border-white/10 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white">{adjustCopy.title}</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Target: <span className="text-emerald-400 font-semibold">{selectedUserForAdjust.name}</span> (
                  {selectedUserForAdjust.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForAdjust(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adjustError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleCommitAdjust} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-zinc-300 uppercase">
                  {adjustCopy.amountLabel}
                </label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder={adjustCopy.amountPlaceholder}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-zinc-300 uppercase">
                  {adjustCopy.reasonLabel}
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="admin_adjust">{adjustCopy.reasonAdminAdjust}</option>
                  <option value="refund">{adjustCopy.reasonRefund}</option>
                  <option value="promo">{adjustCopy.reasonPromo}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-zinc-300 uppercase">
                  {adjustCopy.noteLabel}
                </label>
                <textarea
                  required
                  rows={2}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder={adjustCopy.notePlaceholder}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedUserForAdjust(null)}
                  className="flex-1 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  {adjustCopy.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={adjustLoading}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {adjustLoading ? adjustCopy.processing : adjustCopy.submitBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger History Modal */}
      {selectedUserForLedger && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-3xl bg-[#0d111a] border border-white/10 p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white">{ledgerCopy.title}</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  User: <span className="text-emerald-400 font-semibold">{selectedUserForLedger.name}</span> (
                  {selectedUserForLedger.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForLedger(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {ledgerLoading ? (
                <div className="py-12 text-center text-zinc-500 font-mono">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                  <span>Loading immutable ledger...</span>
                </div>
              ) : ledgerItems.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                  {ledgerCopy.empty}
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {ledgerItems.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-zinc-500">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono">
                            {item.reason}
                          </span>
                        </div>
                        <p className="text-zinc-300 mt-0.5">{item.note || 'Transaction entry'}</p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            item.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.amount > 0 ? `+${item.amount}` : item.amount} CR
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 text-right">
              <button
                type="button"
                onClick={() => setSelectedUserForLedger(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-white text-xs font-semibold hover:bg-white/[0.1]"
              >
                {ledgerCopy.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
