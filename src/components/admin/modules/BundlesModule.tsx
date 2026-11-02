import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Coins,
  Sparkles,
  Tag,
  DollarSign,
  ArrowUpDown,
  X,
  Layers
} from 'lucide-react';
import { SupabaseService } from '../../../utils/supabaseClient';
import { Language } from '../../../types';
import { BundleItem } from '../types';

interface BundlesModuleProps {
  language: Language;
}

const DEFAULT_BUNDLES: BundleItem[] = [
  {
    id: 'starter',
    name_en: 'Starter Creator',
    name_my: 'စတင်သူအထုပ်',
    credits: 1000,
    bonus_credits: 0,
    price: 10.00,
    currency: 'USD',
    is_active: true,
    sort_order: 1,
    badge_text: 'POPULAR FOR BEGINNERS'
  },
  {
    id: 'creator_pro',
    name_en: 'Creator Pro',
    name_my: 'ဖန်တီးသူပရိုအထုပ်',
    credits: 5000,
    bonus_credits: 500,
    price: 50.00,
    currency: 'USD',
    is_active: true,
    sort_order: 2,
    badge_text: '+10% BONUS CREDITS'
  },
  {
    id: 'master',
    name_en: 'Studio Master',
    name_my: 'စတူဒီယိုမာစတာအထုပ်',
    credits: 12000,
    bonus_credits: 2400,
    price: 100.00,
    currency: 'USD',
    is_active: true,
    sort_order: 3,
    badge_text: '+20% MAXIMUM VALUE'
  }
];

export const BundlesModule: React.FC<BundlesModuleProps> = ({ language }) => {
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<BundleItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [bundleId, setBundleId] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameMy, setNameMy] = useState('');
  const [credits, setCredits] = useState<number>(1000);
  const [bonusCredits, setBonusCredits] = useState<number>(0);
  const [price, setPrice] = useState<number>(10);
  const [currency, setCurrency] = useState('USD');
  const [validDays, setValidDays] = useState<number | ''>('');
  const [badgeText, setBadgeText] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const loadBundles = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await SupabaseService.fetchAdminBundles();
      if (data && data.length > 0) {
        setBundles(data);
      } else {
        // Fallback to default presets if database table is empty
        setBundles(DEFAULT_BUNDLES);
      }
    } catch {
      setBundles(DEFAULT_BUNDLES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBundles();
  }, []);

  const handleOpenCreate = () => {
    setEditingBundle(null);
    setBundleId(`bundle_${Date.now().toString(36)}`);
    setNameEn('');
    setNameMy('');
    setCredits(2000);
    setBonusCredits(200);
    setPrice(20);
    setCurrency('USD');
    setValidDays('');
    setBadgeText('');
    setSortOrder(bundles.length + 1);
    setIsActive(true);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (bundle: BundleItem) => {
    setEditingBundle(bundle);
    setBundleId(bundle.id);
    setNameEn(bundle.name_en);
    setNameMy(bundle.name_my);
    setCredits(bundle.credits);
    setBonusCredits(bundle.bonus_credits || 0);
    setPrice(bundle.price);
    setCurrency(bundle.currency || 'USD');
    setValidDays(bundle.valid_days ?? '');
    setBadgeText(bundle.badge_text || '');
    setSortOrder(bundle.sort_order);
    setIsActive(bundle.is_active);
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) {
      setFeedback({ type: 'error', message: 'English name is required.' });
      return;
    }
    if (credits <= 0) {
      setFeedback({ type: 'error', message: 'Credits must be greater than 0.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const payload: BundleItem = {
      id: bundleId.trim().toLowerCase(),
      name_en: nameEn.trim(),
      name_my: nameMy.trim() || nameEn.trim(),
      credits: Number(credits),
      bonus_credits: Number(bonusCredits) || 0,
      price: Number(price),
      currency: currency.trim().toUpperCase(),
      valid_days: validDays === '' ? null : Number(validDays),
      badge_text: badgeText.trim() || null,
      sort_order: Number(sortOrder) || 1,
      is_active: isActive
    };

    try {
      if (editingBundle) {
        const res = await SupabaseService.updateBundle(editingBundle.id, payload);
        if (res.success) {
          setFeedback({
            type: 'success',
            message: language === 'my' ? 'Bundle အချက်အလက်များကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ' : 'Bundle updated successfully.'
          });
          setIsEditorOpen(false);
          await loadBundles();
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to update bundle' });
        }
      } else {
        const res = await SupabaseService.createBundle(payload);
        if (res.success) {
          setFeedback({
            type: 'success',
            message: language === 'my' ? 'Bundle အသစ်ကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ' : 'New bundle created successfully.'
          });
          setIsEditorOpen(false);
          await loadBundles();
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to create bundle' });
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (bundle: BundleItem) => {
    const nextState = !bundle.is_active;
    const res = await SupabaseService.updateBundle(bundle.id, { is_active: nextState });
    if (res.success) {
      setBundles(prev => prev.map(b => b.id === bundle.id ? { ...b, is_active: nextState } : b));
    }
  };

  const handleDelete = async (bundle: BundleItem) => {
    if (!window.confirm(language === 'my' ? `ဤ Bundle (${bundle.name_en}) ကို ဖျက်ရန် သေချာပါသလား?` : `Are you sure you want to delete bundle "${bundle.name_en}"?`)) {
      return;
    }
    const res = await SupabaseService.deleteBundle(bundle.id);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: language === 'my' ? 'Bundle ကို ဖျက်ပြီးပါပြီ' : 'Bundle deleted successfully.'
      });
      await loadBundles();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to delete bundle' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              {language === 'my' ? 'Credit ဝယ်ယူမှု အထုပ်များ စီမံခန့်ခွဲမှု' : 'Credit Purchase Bundles'}
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'my'
              ? 'အသုံးပြုသူများ ဝယ်ယူနိုင်မည့် Credit အထုပ်များ၊ ဘောနပ်စ်နှင့် ဈေးနှုန်း သတ်မှတ်ချက်များ'
              : 'Configure public credit packages, promotional bonus allocations, badges, and pricing tiers.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadBundles}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {language === 'my' ? 'ပြန်လည်ရယူမည်' : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            {language === 'my' ? 'Bundle အသစ်ထည့်မည်' : 'Add New Bundle'}
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

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bundles.map((bundle) => {
          const totalCredits = bundle.credits + (bundle.bonus_credits || 0);
          const unitCost = bundle.price > 0 && totalCredits > 0 ? (bundle.price / totalCredits).toFixed(4) : '0';

          return (
            <div
              key={bundle.id}
              className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                bundle.is_active
                  ? 'bg-[#0c1017] border-white/10 hover:border-emerald-500/40 shadow-xl'
                  : 'bg-zinc-950/40 border-white/5 opacity-60'
              }`}
            >
              {/* Header Badges */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5 uppercase">
                    Order #{bundle.sort_order}
                  </span>
                  {bundle.badge_text && (
                    <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                      {bundle.badge_text}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(bundle)}
                    className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    title="Edit Bundle"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(bundle)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="Delete Bundle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Package Names & Pricing */}
              <div className="space-y-2 mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{bundle.name_en}</span>
                </h3>
                <div className="text-xs text-zinc-400 font-sans">
                  {bundle.name_my}
                </div>

                <div className="pt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white font-mono">
                    ${bundle.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-zinc-400 uppercase font-mono">
                    {bundle.currency || 'USD'}
                  </span>
                </div>
              </div>

              {/* Credits Breakdown */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 mb-4 text-xs font-mono">
                <div className="flex justify-between text-zinc-300">
                  <span>Base Credits:</span>
                  <span className="text-white font-bold">{bundle.credits.toLocaleString()}</span>
                </div>
                {bundle.bonus_credits > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Bonus Credits:
                    </span>
                    <span className="font-bold">+{bundle.bonus_credits.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-white/5 flex justify-between text-cyan-300 font-bold">
                  <span>Total Delivery:</span>
                  <span>{totalCredits.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-zinc-500 text-right pt-0.5">
                  ${unitCost} / credit
                </div>
              </div>

              {/* Bottom Status & Toggle */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className={bundle.is_active ? 'text-emerald-400' : 'text-zinc-500'}>
                  {bundle.is_active ? '● Public Active' : '○ Disabled'}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleActive(bundle)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    bundle.is_active
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  {bundle.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#0c1017] border border-white/10 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {editingBundle ? 'Edit Credit Bundle' : 'Create Credit Bundle'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Bundle Identifier (ID)</label>
                <input
                  type="text"
                  value={bundleId}
                  disabled={!!editingBundle}
                  onChange={(e) => setBundleId(e.target.value)}
                  required
                  placeholder="starter, creator_pro, etc."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    required
                    placeholder="Creator Pro"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Name (Myanmar)</label>
                  <input
                    type="text"
                    value={nameMy}
                    onChange={(e) => setNameMy(e.target.value)}
                    placeholder="ဖန်တီးသူပရို"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-400 font-medium mb-1">Base Credits</label>
                  <input
                    type="number"
                    min={1}
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    required
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-emerald-400 font-medium mb-1">Bonus Credits</label>
                  <input
                    type="number"
                    min={0}
                    value={bonusCredits}
                    onChange={(e) => setBonusCredits(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Currency</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    required
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="+10% BONUS"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded bg-zinc-900 border-white/10 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-zinc-300">Active (Visible in store)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Bundle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
