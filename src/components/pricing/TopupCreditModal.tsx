import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Sparkles,
  CheckCircle2,
  X,
  CreditCard,
  Copy,
  Check,
  Upload,
  Clock,
  ShieldCheck,
  Gift,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { SupabaseService, TopupRequest } from '../../utils/supabaseClient';
import { Language, UserProfile } from '../../types';

export interface TopupPackage {
  id: 'starter' | 'creator' | 'master';
  nameEn: string;
  nameMm: string;
  credits: number;
  costUsd: number;
  mmkApprox: string;
  bonus?: string;
  popular?: boolean;
  descEn: string;
  descMm: string;
}

export const TOPUP_PACKAGES: TopupPackage[] = [
  {
    id: 'starter',
    nameEn: 'Starter Creator',
    nameMm: 'စတင်အသုံးပြုသူ Package',
    credits: 1000,
    costUsd: 10,
    mmkApprox: '40,000 Ks',
    descEn: '200 Standard Photos or 1,000 Video Prompts',
    descMm: 'Standard ဓာတ်ပုံ ၂၀၀ သို့မဟုတ် Video Prompt ၁,၀၀၀'
  },
  {
    id: 'creator',
    nameEn: 'Creator Pro',
    nameMm: 'Creator Pro (လူကြိုက်အများဆုံး)',
    credits: 5500,
    costUsd: 50,
    mmkApprox: '200,000 Ks',
    bonus: '+10% Bonus (500 Free CR)',
    popular: true,
    descEn: '1,100 Standard or ~680 2K HD Renders',
    descMm: 'Standard ဓာတ်ပုံ ၁,၁၀၀ သို့မဟုတ် 2K HD ၆၈၀ ပုံ'
  },
  {
    id: 'master',
    nameEn: 'Studio Master',
    nameMm: 'Studio Master (တန်ဖိုးအရှိဆုံး)',
    credits: 12000,
    costUsd: 100,
    mmkApprox: '400,000 Ks',
    bonus: '+20% Extra Bonus (2,000 Free CR)',
    descEn: '2,400 Photos or ~1,000 4K UHD Masterworks',
    descMm: 'Standard ဓာတ်ပုံ ၂,၄၀၀ သို့မဟုတ် 4K UHD ၁,၀၀၀ ပုံ'
  }
];

export const PAYMENT_METHODS = [
  {
    id: 'kpay',
    name: 'KBZPay (KPay)',
    accountNumber: '09798888888',
    accountName: 'U Zaw Yan Naing',
    badge: 'Instant QR'
  },
  {
    id: 'wave',
    name: 'WavePay',
    accountNumber: '09798888888',
    accountName: 'U Zaw Yan Naing',
    badge: 'Fast Transfer'
  },
  {
    id: 'kbz_bank',
    name: 'KBZ Bank (Mobile Banking)',
    accountNumber: '052-101-088012345',
    accountName: 'U Zaw Yan Naing',
    badge: 'Direct Account'
  },
  {
    id: 'aya_bank',
    name: 'AYA Bank',
    accountNumber: '008-020-001098765',
    accountName: 'U Zaw Yan Naing',
    badge: 'Direct Account'
  }
];

interface TopupCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser?: UserProfile | null;
  onUserUpdate?: (user: UserProfile) => void;
  initialPackageId?: 'starter' | 'creator' | 'master';
}

export const TopupCreditModal: React.FC<TopupCreditModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUser,
  onUserUpdate,
  initialPackageId = 'creator'
}) => {
  const isMm = language === 'my';
  const [selectedPkgId, setSelectedPkgId] = useState<'starter' | 'creator' | 'master'>(initialPackageId);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('kpay');
  const [transferRef, setTransferRef] = useState<string>('');
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoFeedback, setPromoFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userRequests, setUserRequests] = useState<TopupRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);

  const selectedPkg = TOPUP_PACKAGES.find((p) => p.id === selectedPkgId) || TOPUP_PACKAGES[1];
  const activeMethod = PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod) || PAYMENT_METHODS[0];

  // Load user's top-up requests on open
  useEffect(() => {
    if (!isOpen) return;
    const session = SupabaseService.getSession();

    const fetchHistory = async () => {
      setIsLoadingRequests(true);
      try {
        const reqs = await SupabaseService.fetchTopupRequests(session?.user?.id);
        setUserRequests(reqs || []);
      } catch {
        // silent fail
      } finally {
        setIsLoadingRequests(false);
      }
    };
    fetchHistory();

    const handleRefresh = () => fetchHistory();
    window.addEventListener('showai-credits-updated', handleRefresh);
    window.addEventListener('showai-topup-submitted', handleRefresh);
    return () => {
      window.removeEventListener('showai-credits-updated', handleRefresh);
      window.removeEventListener('showai-topup-submitted', handleRefresh);
    };
  }, [isOpen]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Submit Top-Up Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitFeedback(null);

    const session = SupabaseService.getSession();
    if (!session?.user?.id) {
      window.dispatchEvent(new CustomEvent('open-supabase-auth', { detail: { mode: 'signin' } }));
      return;
    }

    if (!transferRef.trim()) {
      setSubmitFeedback({
        type: 'error',
        message: isMm
          ? 'ကျေးဇူးပြု၍ ငွေလွှဲပြေစာ အမှတ် (Transaction ID / Reference) ထည့်သွင်းပေးပါရန်။'
          : 'Please enter your payment Transaction ID or reference number.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await SupabaseService.submitTopupRequest(
        selectedPkg.id,
        selectedPkg.nameEn,
        selectedPkg.credits,
        selectedPkg.costUsd,
        activeMethod.name,
        transferRef.trim()
      );

      if (res.success && res.request) {
        setSubmitFeedback({
          type: 'success',
          message: isMm
            ? '🎉 ငွေလွှဲတောင်းဆိုမှု အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ။ Admin Panel မှ ၅-၁၅ မိနစ်အတွင်း စိစစ်အတည်ပြုပြီးပါက Credits များ အလိုအလျောက် သွင်းပေးပါမည်။'
            : '🎉 Top-up request submitted! Admin will verify and credit your balance within 5-15 minutes.'
        });
        setTransferRef('');
        // Append to local requests list
        setUserRequests((prev) => [res.request!, ...prev]);
      } else {
        setSubmitFeedback({
          type: 'error',
          message: res.error || (isMm ? 'တောင်းဆိုမှု တင်သွင်းခြင်း မအောင်မြင်ပါ' : 'Failed to submit top-up request')
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redeem Promo Code
  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    setPromoFeedback(null);
    const session = SupabaseService.getSession();
    if (!session?.user?.id) {
      window.dispatchEvent(new CustomEvent('open-supabase-auth', { detail: { mode: 'signin' } }));
      return;
    }

    try {
      const res = await SupabaseService.redeemPromoCode(promoCodeInput.trim().toUpperCase());
      if (res.success && res.creditsGranted) {
        setPromoFeedback({
          type: 'success',
          message: isMm
            ? `ဂုဏ်ယူပါသည်! Promo Code မှ Credit +${res.creditsGranted.toLocaleString()} ရရှိပြီးပါပြီ!`
            : `Success! Granted +${res.creditsGranted.toLocaleString()} Free Credits!`
        });
        setPromoCodeInput('');
        if (currentUser && onUserUpdate) {
          onUserUpdate({
            ...currentUser,
            credits: (currentUser.credits || 0) + res.creditsGranted
          });
        }
      } else {
        setPromoFeedback({
          type: 'error',
          message: res.error || (isMm ? 'Promo Code မမှန်ကန်ပါ သို့မဟုတ် သက်တမ်းကုန်ဆုံးပါပြီ' : 'Invalid or expired promo code')
        });
      }
    } catch {
      setPromoFeedback({
        type: 'error',
        message: isMm ? 'စနစ်ချို့ယွင်းချက် ဖြစ်ပေါ်ပါသည်' : 'Network error redeeming promo code'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl rounded-3xl bg-[#0d121c] border border-emerald-500/30 p-5 sm:p-7 shadow-2xl my-8 overflow-hidden text-left"
        >
          {/* Top Radial Glow Accent */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>{isMm ? 'User Credit ဖြည့်သွင်းခြင်း & ငွေလွှဲစနစ်' : 'Credit Top-Up & Payment Hub'}</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  {isMm
                    ? 'KPay, WavePay, Banking ဖြင့် အလွယ်တကူ ဝယ်ယူနိုင်ပြီး Admin Panel မှ ချက်ချင်း အတည်ပြုပေးပါသည်'
                    : 'Instant Top-Up via KPay, WavePay & Bank Transfer. Verified and credited by Admin.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback Banners */}
          {submitFeedback && (
            <div
              className={`mb-4 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs leading-relaxed ${
                submitFeedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
              }`}
            >
              {submitFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{submitFeedback.message}</span>
            </div>
          )}

          {/* Step 1: Select Package */}
          <div className="space-y-2 mb-5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              1. {isMm ? 'Credit Package ရွေးချယ်ပါ' : 'Select Credit Package'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TOPUP_PACKAGES.map((pkg) => {
                const isSelected = selectedPkgId === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold text-[9px] uppercase tracking-wider shadow">
                        Popular
                      </span>
                    )}
                    <div>
                      <span className="text-xs font-bold text-white block">{pkg.nameEn}</span>
                      <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">
                        +{pkg.credits.toLocaleString()} CR
                      </span>
                      {pkg.bonus && (
                        <span className="text-[10px] text-teal-300 font-semibold block mt-0.5">
                          {pkg.bonus}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">{pkg.mmkApprox}</span>
                      <span className="text-[10px] text-zinc-400">(${pkg.costUsd} USD)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Payment Method Accounts & 1-Click Copy */}
          <div className="space-y-2 mb-5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              2. {isMm ? 'ငွေလွှဲမည့် အကောင့် ရွေးချယ်၍ လွှဲပြောင်းပါ' : 'Select Payment Account & Transfer'}
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPaymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                        : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold block truncate">{method.name}</span>
                    <span className="text-[9px] text-emerald-400/90 font-mono block mt-0.5">
                      {method.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Account Info Card */}
            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">
                  {activeMethod.name} Transfer Account:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-emerald-300">
                    {activeMethod.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeMethod.accountNumber, 'num')}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition"
                    title="Copy Account Number"
                  >
                    {copiedKey === 'num' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[11px] text-zinc-300">
                  Account Name: <strong>{activeMethod.accountName}</strong>
                </span>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                <span className="text-[10px] text-zinc-400 block">Amount to Transfer:</span>
                <span className="text-base font-black text-amber-300 font-mono">
                  {selectedPkg.mmkApprox}
                </span>
                <span className="text-[10px] text-zinc-400 block">(${selectedPkg.costUsd} USD)</span>
              </div>
            </div>
          </div>

          {/* Step 3: Transaction ID Input & Submission */}
          <form onSubmit={handleSubmitOrder} className="space-y-3 mb-6">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              3. {isMm ? 'ငွေလွှဲပြေစာ အမှတ် (Transaction Reference / Slip ID) ထည့်ပါ' : 'Enter Payment Reference ID'}
            </label>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={transferRef}
                onChange={(e) => setTransferRef(e.target.value)}
                placeholder={isMm ? 'ဥပမာ - 0987123456 (ငွေလွှဲ အမှတ် နောက်ဆုံး ၆ လုံး သို့မဟုတ် Ref ID)' : 'e.g. 0987123456 or last 6 digits of transfer'}
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500 transition"
                required
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                {isSubmitting ? (
                  <span>{isMm ? 'တင်သွင်းနေပါသည်...' : 'Submitting...'}</span>
                ) : (
                  <>
                    <span>{isMm ? 'ငွေလွှဲ အတည်ပြုချက် တင်မည်' : 'Submit Top-Up Order'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {isMm
                  ? 'လွှဲပြီးပါက Admin Panel တွင် Pending အဖြစ် ချက်ချင်းပေါ်လာပြီး စိစစ်အတည်ပြုပေးပါမည်။'
                  : 'Submitted orders appear immediately as Pending in the Admin Panel for approval.'}
              </span>
            </p>
          </form>

          {/* Optional: Redeem Promo Code */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isMm ? 'Promo Code ရွေးနုတ်ရန် ရှိပါက' : 'Have a Promo Code?'}</span>
              </span>
            </div>

            <form onSubmit={handleRedeemPromo} className="flex gap-2">
              <input
                type="text"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME500"
                className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs uppercase placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
              >
                {isMm ? 'ရွေးနုတ်မည်' : 'Redeem'}
              </button>
            </form>

            {promoFeedback && (
              <p
                className={`text-[11px] mt-2 font-medium ${
                  promoFeedback.type === 'success' ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {promoFeedback.message}
              </p>
            )}
          </div>

          {/* User's Recent Top-Up Status List */}
          {userRequests.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{isMm ? 'သင်၏ ငွေလွှဲတောင်းဆိုမှု အခြေအနေများ' : 'Your Top-Up Request Status'}</span>
              </h4>

              <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                {userRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{req.package_name}</span>
                      <span className="text-[10px] text-zinc-400 block font-mono">
                        Ref: {req.payment_ref} • {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">
                        +{req.credits?.toLocaleString()} CR
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : req.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TopupCreditModal;
