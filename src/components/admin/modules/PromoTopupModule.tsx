import React, { useState, useEffect } from 'react';
import {
  Gift,
  Receipt,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Coins,
  Calendar,
  ExternalLink,
  Eye,
  X,
  Sparkles,
  Search,
  Filter,
  Check,
  Clock,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { SupabaseService } from '../../../utils/supabaseClient';
import { Language } from '../../../types';
import { PromoCodeItem, PromoRedemptionItem, TopupRequestItem } from '../types';

interface PromoTopupModuleProps {
  language: Language;
}

export const PromoTopupModule: React.FC<PromoTopupModuleProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<'topup' | 'promo'>('topup');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ---- TOP-UP REQUESTS STATE ----
  const [topupRequests, setTopupRequests] = useState<TopupRequestItem[]>([]);
  const [topupFilter, setTopupFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSlip, setSelectedSlip] = useState<{ url: string | null; request: TopupRequestItem } | null>(null);
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [targetRejectRequest, setTargetRejectRequest] = useState<TopupRequestItem | null>(null);

  // ---- PROMO CODES STATE ----
  const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>([]);
  const [isPromoEditorOpen, setIsPromoEditorOpen] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoCredits, setNewPromoCredits] = useState<number>(500);
  const [newPromoMaxUses, setNewPromoMaxUses] = useState<number>(50);
  const [newPromoExpiry, setNewPromoExpiry] = useState<string>('');
  const [isSavingPromo, setIsSavingPromo] = useState(false);
  const [redemptionsModalCode, setRedemptionsModalCode] = useState<string | null>(null);
  const [redemptionsList, setRedemptionsList] = useState<PromoRedemptionItem[]>([]);
  const [isLoadingRedemptions, setIsLoadingRedemptions] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [requests, promos] = await Promise.all([
        SupabaseService.fetchAdminTopupRequests(topupFilter),
        SupabaseService.fetchAdminPromoCodes()
      ]);
      setTopupRequests(requests || []);
      setPromoCodes(promos || []);
    } catch {
      setFeedback({
        type: 'error',
        message: language === 'my' ? 'ဒေတာများ ရယူရာတွင် ချို့ယွင်းချက် ဖြစ်ပေါ်ပါသည်' : 'Error loading topup & promo data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('showai-topup-submitted', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('showai-topup-submitted', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [topupFilter]);

  // View slip signed image or transaction reference
  const handleViewSlip = async (req: TopupRequestItem) => {
    const rawPath = req.slip_image_path || (req as any).payment_ref || '';
    const signedUrl = await SupabaseService.getSlipSignedUrl(rawPath);
    setSelectedSlip({
      url: signedUrl || rawPath,
      request: req
    });
  };

  // Approve Top-Up
  const handleApproveTopup = async (req: TopupRequestItem) => {
    setActionProcessingId(req.id);
    setFeedback(null);
    try {
      const res = await SupabaseService.approveTopupRequest(req.id, reviewNote.trim() || 'Verified payment transfer');
      if (res.success) {
        setFeedback({
          type: 'success',
          message: language === 'my'
            ? `ငွေလွှဲပြေစာကို အတည်ပြုပြီးပါပြီ။ Credit ပေါင်း ${res.credits || ''} ဖြည့်သွင်းပြီးပါပြီ။`
            : `Top-up request approved! Granted ${res.credits || 'specified'} credits.`
        });
        setReviewNote('');
        setSelectedSlip(null);
        await loadData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to approve request' });
      }
    } finally {
      setActionProcessingId(null);
    }
  };

  // Open Reject Modal
  const handleOpenReject = (req: TopupRequestItem) => {
    setTargetRejectRequest(req);
    setReviewNote('');
    setIsRejectModalOpen(true);
  };

  // Submit Rejection
  const handleConfirmReject = async () => {
    if (!targetRejectRequest) return;
    if (!reviewNote.trim()) {
      setFeedback({ type: 'error', message: 'Rejection reason note is required.' });
      return;
    }

    setActionProcessingId(targetRejectRequest.id);
    try {
      const res = await SupabaseService.rejectTopupRequest(targetRejectRequest.id, reviewNote.trim());
      if (res.success) {
        setFeedback({
          type: 'success',
          message: language === 'my' ? 'ငွေလွှဲတောင်းဆိုမှုကို ပယ်ချပြီးပါပြီ' : 'Top-up request rejected.'
        });
        setIsRejectModalOpen(false);
        setTargetRejectRequest(null);
        setReviewNote('');
        setSelectedSlip(null);
        await loadData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to reject request' });
      }
    } finally {
      setActionProcessingId(null);
    }
  };

  // Create Promo Code
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) {
      setFeedback({ type: 'error', message: 'Promo code string is required.' });
      return;
    }
    if (newPromoCredits <= 0) {
      setFeedback({ type: 'error', message: 'Credits must be greater than zero.' });
      return;
    }

    setIsSavingPromo(true);
    setFeedback(null);
    try {
      const res = await SupabaseService.createPromoCode({
        code: newPromoCode.trim().toUpperCase(),
        credits: Number(newPromoCredits),
        max_uses: Number(newPromoMaxUses),
        expires_at: newPromoExpiry ? new Date(newPromoExpiry).toISOString() : null,
        is_active: true
      });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: language === 'my' ? 'Promo Code အသစ် အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ' : 'Promo code created successfully.'
        });
        setIsPromoEditorOpen(false);
        setNewPromoCode('');
        await loadData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to create promo code' });
      }
    } finally {
      setIsSavingPromo(false);
    }
  };

  // Toggle Promo Active
  const handleTogglePromo = async (code: string, currentActive: boolean) => {
    const res = await SupabaseService.togglePromoCode(code, !currentActive);
    if (res.success) {
      setPromoCodes(prev => prev.map(p => p.code === code ? { ...p, is_active: !currentActive } : p));
    }
  };

  // Delete Promo
  const handleDeletePromo = async (code: string) => {
    if (!window.confirm(`Delete promo code "${code}"?`)) return;
    const res = await SupabaseService.deletePromoCode(code);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Promo code deleted.' });
      await loadData();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to delete' });
    }
  };

  // View Redemptions
  const handleViewRedemptions = async (code: string) => {
    setRedemptionsModalCode(code);
    setIsLoadingRedemptions(true);
    try {
      const list = await SupabaseService.fetchPromoRedemptions(code);
      setRedemptionsList(list);
    } finally {
      setIsLoadingRedemptions(false);
    }
  };

  const pendingCount = topupRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              {language === 'my' ? 'ငွေလွှဲပြေစာများနှင့် Promo Codes' : 'Top-Up Slips & Promo Codes'}
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'my'
              ? 'ဘဏ်/KBZPay ငွေလွှဲပြေစာများ အတည်ပြုခြင်းနှင့် ပရိုမိုးရှင်းကုဒ်များ စီမံခန့်ခွဲခြင်း'
              : 'Review bank & KBZPay payment slips with signed URL verification, and generate promotional credit codes.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {language === 'my' ? 'ပြန်လည်ရယူမည်' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-zinc-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('topup')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all relative ${
            activeTab === 'topup'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{language === 'my' ? 'ငွေလွှဲတောင်းဆိုမှုများ' : 'Top-Up Slip Queue'}</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('promo')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'promo'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>{language === 'my' ? 'Promo Codes စီမံခန့်ခွဲမှု' : 'Promo Codes'}</span>
        </button>
      </div>

      {/* TAB 1: TOP-UP SLIP REVIEW QUEUE */}
      {activeTab === 'topup' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-xl border border-white/5">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setTopupFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                    topupFilter === st
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="text-xs text-zinc-400 font-mono">
              Total: {topupRequests.length} request(s)
            </div>
          </div>

          {/* Requests Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0b0f17]/60 backdrop-blur-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/70 border-b border-white/5 text-zinc-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Bundle</th>
                  <th className="py-3 px-4">Method & Amount</th>
                  <th className="py-3 px-4">Payment Slip</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300 font-sans">
                {topupRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{req.user_email || 'Unknown User'}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{req.user_id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-emerald-400">{req.bundle_name || req.bundle_id}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="capitalize text-white">{req.payment_method}</div>
                      {req.amount_paid && (
                        <div className="text-[11px] text-zinc-400">
                          {req.amount_paid.toLocaleString()} {req.currency || 'MMK'}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleViewSlip(req)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-[11px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>View Slip</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : req.status === 'rejected'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                      {new Date(req.created_at).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApproveTopup(req)}
                            disabled={actionProcessingId === req.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px] transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenReject(req)}
                            disabled={actionProcessingId === req.id}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-[11px] transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">
                          {req.admin_note ? `"${req.admin_note}"` : 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {topupRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No top-up requests found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROMO CODES MANAGEMENT */}
      {activeTab === 'promo' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              Promo codes grant instant credits when redeemed by creators. Each code is locked to 1 redemption per user.
            </p>
            <button
              type="button"
              onClick={() => setIsPromoEditorOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" />
              {language === 'my' ? 'Promo Code အသစ်ထုတ်မည်' : 'Create Promo Code'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0b0f17]/60 backdrop-blur-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/70 border-b border-white/5 text-zinc-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Credits Granted</th>
                  <th className="py-3 px-4">Redemptions</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300 font-sans">
                {promoCodes.map((promo) => (
                  <tr key={promo.code} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 tracking-wider">
                      {promo.code}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      +{promo.credits.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-white">{promo.used_count}</span>
                      <span className="text-zinc-500"> / {promo.max_uses}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                      {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : 'Never'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          promo.is_active
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {promo.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewRedemptions(promo.code)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors"
                        >
                          Redemptions
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePromo(promo.code, promo.is_active)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors"
                        >
                          {promo.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePromo(promo.code)}
                          className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {promoCodes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      No promo codes created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: SLIP VIEWER & DIRECT APPROVAL */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-xl w-full bg-[#0c1017] border border-white/10 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Payment Slip Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlip(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Image Preview or Reference Card */}
            <div className="w-full max-h-96 rounded-xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center p-4">
              {selectedSlip.url && (selectedSlip.url.startsWith('http') || selectedSlip.url.startsWith('data:') || selectedSlip.url.startsWith('/')) ? (
                <img
                  src={selectedSlip.url}
                  alt="Payment Transfer Slip"
                  className="max-h-96 w-auto object-contain rounded-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fb = document.createElement('div');
                      fb.className = 'py-6 text-center space-y-2';
                      fb.innerHTML = `<div class="text-xs text-zinc-400">Transaction ID / Reference:</div><div class="px-3 py-2 bg-zinc-800/80 rounded-lg text-emerald-400 font-mono font-bold text-sm select-all">${selectedSlip.url}</div>`;
                      parent.appendChild(fb);
                    }
                  }}
                />
              ) : (
                <div className="py-6 text-center space-y-2.5 w-full">
                  <div className="text-xs text-zinc-400 font-medium">Payment Transaction ID / Reference:</div>
                  <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 font-mono font-bold text-sm select-all tracking-wider inline-block">
                    {selectedSlip.url || selectedSlip.request.slip_image_path || (selectedSlip.request as any).payment_ref || 'No Reference Provided'}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Verify this transaction code in your KBZPay / WavePay merchant app.
                  </p>
                </div>
              )}
            </div>

            {/* Details & Actions */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-zinc-300">
                <span>User:</span>
                <span className="text-white font-bold">{selectedSlip.request.user_email}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Bundle:</span>
                <span className="text-emerald-400 font-bold">{selectedSlip.request.bundle_name || selectedSlip.request.bundle_id}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Payment Method:</span>
                <span className="text-white capitalize">{selectedSlip.request.payment_method}</span>
              </div>
              {selectedSlip.request.amount_paid && (
                <div className="flex justify-between text-zinc-300">
                  <span>Amount Paid:</span>
                  <span className="text-white font-bold">{selectedSlip.request.amount_paid.toLocaleString()} {selectedSlip.request.currency || 'MMK'}</span>
                </div>
              )}
              {Boolean((selectedSlip.request as any).credits || (selectedSlip.request as any).credits_granted) && (
                <div className="flex justify-between text-zinc-300">
                  <span>Credits to Add:</span>
                  <span className="text-emerald-400 font-bold">+{(selectedSlip.request as any).credits || (selectedSlip.request as any).credits_granted} Credits</span>
                </div>
              )}
            </div>

            {selectedSlip.request.status === 'pending' && (
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenReject(selectedSlip.request)}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition-colors"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveTopup(selectedSlip.request)}
                  disabled={actionProcessingId === selectedSlip.request.id}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {actionProcessingId === selectedSlip.request.id ? 'Approving...' : 'Approve & Credit Balance'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: REJECT REASON MODAL */}
      {isRejectModalOpen && targetRejectRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#0c1017] border border-white/10 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Reject Top-Up Request</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Provide an audit explanation for rejecting this transfer slip (e.g. invalid transaction ID, wrong amount, unreadable slip).
            </p>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Rejection Reason Note (Required)
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                required
                placeholder="e.g. Transaction reference ID does not match bank records..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionProcessingId === targetRejectRequest.id}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {actionProcessingId === targetRejectRequest.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE PROMO CODE MODAL */}
      {isPromoEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#0c1017] border border-white/10 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Create Promo Code</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPromoEditorOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. SHOWAI2026, THINGYAN_SPECIAL"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-400 font-medium mb-1">Credits Granted</label>
                  <input
                    type="number"
                    min={1}
                    value={newPromoCredits}
                    onChange={(e) => setNewPromoCredits(Number(e.target.value))}
                    required
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    min={1}
                    value={newPromoMaxUses}
                    onChange={(e) => setNewPromoMaxUses(Number(e.target.value))}
                    required
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={newPromoExpiry}
                  onChange={(e) => setNewPromoExpiry(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromoEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPromo}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold disabled:opacity-50"
                >
                  {isSavingPromo ? 'Creating...' : 'Create Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PROMO REDEMPTIONS LIST */}
      {redemptionsModalCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-lg w-full bg-[#0c1017] border border-white/10 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Redemptions: {redemptionsModalCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRedemptionsModalCode(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {isLoadingRedemptions ? (
                <div className="py-8 text-center text-zinc-500 text-xs font-mono">Loading redemption records...</div>
              ) : redemptionsList.length > 0 ? (
                redemptionsList.map((red) => (
                  <div key={red.id} className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{red.user_email}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {new Date(red.redeemed_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400">
                      +{red.credits_granted} credits
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-zinc-500 text-xs">No redemptions recorded for this code yet.</div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setRedemptionsModalCode(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
