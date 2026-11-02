import React, { useState, useEffect } from 'react';
import {
  Settings,
  Share2,
  Flag,
  Wrench,
  Coins,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { SupabaseService } from '../../../utils/supabaseClient';
import { Language } from '../../../types';
import { SocialLinksSettings, MaintenanceSettings, FeatureFlagsSettings } from '../types';

interface SettingsModuleProps {
  language: Language;
  initialTab?: 'socials' | 'flags' | 'maintenance' | 'credits';
}

const DEFAULT_SOCIALS: SocialLinksSettings = {
  facebook: 'https://facebook.com/showai',
  telegram: 'https://t.me/showai_community',
  tiktok: 'https://tiktok.com/@showai',
  youtube: 'https://youtube.com/@showai',
  viber: '',
  support_email: 'support@showai.art'
};

const DEFAULT_FLAGS: FeatureFlagsSettings = {
  photo_studio: true,
  video_studio: true,
  detail_burmese: true,
  community: true,
  face_swap: true,
  bg_change: true,
  edit_image: true
};

const DEFAULT_MAINTENANCE: MaintenanceSettings = {
  active: false,
  notice_en: 'SHOW AI is undergoing scheduled infrastructure upgrades. We will be back online shortly.',
  notice_my: 'SHOW AI စနစ် အဆင့်မြှင့်တင်မှုများ ပြုလုပ်နေပါသည်။ မကြာမီ ပြန်လည် အသုံးပြုနိုင်ပါမည်။'
};

interface CreditCostsConfig {
  cost_1k: number;
  cost_2k: number;
  cost_4k: number;
  cost_8k: number;
  video_prompt: number;
  daily_free_credits: number;
}

const DEFAULT_CREDIT_COSTS: CreditCostsConfig = {
  cost_1k: 5,
  cost_2k: 8,
  cost_4k: 12,
  cost_8k: 20,
  video_prompt: 1,
  daily_free_credits: 250
};

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  language,
  initialTab = 'flags'
}) => {
  const [activeTab, setActiveTab] = useState<'flags' | 'maintenance' | 'socials' | 'credits'>(initialTab);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // States
  const [socials, setSocials] = useState<SocialLinksSettings>(DEFAULT_SOCIALS);
  const [flags, setFlags] = useState<FeatureFlagsSettings>(DEFAULT_FLAGS);
  const [maintenance, setMaintenance] = useState<MaintenanceSettings>(DEFAULT_MAINTENANCE);
  const [creditCosts, setCreditCosts] = useState<CreditCostsConfig>(DEFAULT_CREDIT_COSTS);

  const loadAllSettings = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const allSettings = await SupabaseService.fetchAppSettings();
      if (allSettings) {
        if (allSettings.social_links) {
          setSocials({ ...DEFAULT_SOCIALS, ...allSettings.social_links });
        }
        if (allSettings.feature_flags) {
          setFlags({ ...DEFAULT_FLAGS, ...allSettings.feature_flags });
        }
        if (allSettings.maintenance) {
          setMaintenance({ ...DEFAULT_MAINTENANCE, ...allSettings.maintenance });
        }
        if (allSettings.credit_costs) {
          setCreditCosts({ ...DEFAULT_CREDIT_COSTS, ...allSettings.credit_costs });
        }
      }
    } catch {
      setFeedback({
        type: 'error',
        message: language === 'my' ? 'ဆက်တင်များ ရယူရာတွင် ချို့ယွင်းချက် ဖြစ်ပေါ်ပါသည်' : 'Failed to fetch settings from database'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllSettings();
  }, []);

  const handleSaveSocials = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await SupabaseService.updateAppSetting('social_links', socials, 'Public community and social media links');
      if (res.success) {
        try {
          localStorage.setItem('showai_public_social_links_v1', JSON.stringify(socials));
        } catch {}
        window.dispatchEvent(new CustomEvent('supabase-settings-refresh'));
        setFeedback({
          type: 'success',
          message: language === 'my' ? 'လူမှုကွန်ရက် လင့်ခ်များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ' : 'Social links successfully updated.'
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to save social links' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFlags = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await SupabaseService.updateAppSetting('feature_flags', flags, 'Studio-level feature visibility flags');
      if (res.success) {
        setFeedback({
          type: 'success',
          message: language === 'my' ? 'Feature Flags များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ' : 'Feature flags successfully updated.'
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to save feature flags' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMaintenance = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await SupabaseService.updateAppSetting('maintenance', maintenance, 'Global maintenance mode configuration');
      if (res.success) {
        setFeedback({
          type: 'success',
          message: language === 'my' ? 'Maintenance mode အခြေအနေကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ' : 'Maintenance settings successfully saved.'
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to update maintenance mode' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCreditCosts = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await SupabaseService.updateAppSetting('credit_costs', creditCosts, 'System generation credit costs and daily free grant');
      if (res.success) {
        setFeedback({
          type: 'success',
          message: language === 'my' ? 'Credit နှုန်းထားများကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ' : 'Credit costs configuration updated.'
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to save credit costs' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              {language === 'my' ? 'စနစ်ဆက်တင်များနှင့် Feature Flags' : 'System Configuration & Flags'}
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'my'
              ? 'လူမှုကွန်ရက်လင့်ခ်များ၊ စတူဒီယို Feature အဖွင့်/အပိတ်၊ ပြုပြင်ထိန်းသိမ်းမှု Mode နှင့် Credit နှုန်းထားများ'
              : 'Control public social links, studio feature flags, maintenance mode, and base credit costs.'}
          </p>
        </div>

        <button
          type="button"
          onClick={loadAllSettings}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs font-medium border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {language === 'my' ? 'ပြန်လည်ရယူမည်' : 'Refresh'}
        </button>
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

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('flags')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'flags'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flag className="w-4 h-4" />
          {language === 'my' ? 'Feature Flags' : 'Feature Flags'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap relative ${
            activeTab === 'maintenance'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wrench className="w-4 h-4" />
          {language === 'my' ? 'ထိန်းသိမ်းမှု Mode' : 'Maintenance Mode'}
          {maintenance.active && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-1" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('socials')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'socials'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Share2 className="w-4 h-4" />
          {language === 'my' ? 'လူမှုကွန်ရက် လင့်ခ်များ' : 'Social & Contact'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('credits')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'credits'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Coins className="w-4 h-4" />
          {language === 'my' ? 'Credit နှုန်းထားများ' : 'Credit Defaults'}
        </button>
      </div>

      {/* Tab 1: Feature Flags */}
      {activeTab === 'flags' && (
        <div className="space-y-5 bg-[#0b0f17]/60 border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
          <div>
            <h3 className="text-sm font-semibold text-white">
              {language === 'my' ? 'စတူဒီယို Features စီမံခန့်ခွဲမှု' : 'Studio Feature Toggles'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {language === 'my'
                ? 'မဖွင့်လိုသော သို့မဟုတ် ပြင်ဆင်နေဆဲ Feature များကို ချက်ချင်း ပိတ်ထားနိုင်ပါသည်။'
                : 'Instantly toggle visibility and access for studios and editing tools across the suite.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'photo_studio' as const, label: 'Photo Studio', desc: 'Main text-to-image and reference styling studio' },
              { id: 'video_studio' as const, label: 'Video Studio', desc: 'Burmese cinematic AI video generation studio' },
              { id: 'detail_burmese' as const, label: 'Burmese Detail Matrix', desc: 'Cultural Myanmar art, traditional dress, and temple presets' },
              { id: 'community' as const, label: 'Community Showcase', desc: 'Public feed of shared community generations' },
              { id: 'face_swap' as const, label: 'Face Swap Engine', desc: 'Burmese attire and portrait face replacement tool' },
              { id: 'bg_change' as const, label: 'Background Studio', desc: 'Automated background cutout and environment replacement' },
              { id: 'edit_image' as const, label: 'Image Editor & Inpainting', desc: 'Canvas inpainting and brush adjustments' }
            ].map((feature) => (
              <div
                key={feature.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  flags[feature.id]
                    ? 'bg-white/[0.03] border-white/10 hover:border-emerald-500/30'
                    : 'bg-zinc-900/40 border-white/5 opacity-70'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    {feature.label}
                    {flags[feature.id] ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">Active</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-normal">Disabled</span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">{feature.desc}</div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={flags[feature.id]}
                    onChange={(e) => setFlags({ ...flags, [feature.id]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-end">
            <button
              type="button"
              onClick={handleSaveFlags}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? (language === 'my' ? 'သိမ်းဆည်းနေပါသည်...' : 'Saving Flags...') : (language === 'my' ? 'Feature Flags အတည်ပြုသိမ်းဆည်းမည်' : 'Save Feature Flags')}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Maintenance Mode */}
      {activeTab === 'maintenance' && (
        <div className="space-y-5 bg-[#0b0f17]/60 border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">
                  {language === 'my' ? 'စနစ်တစ်ခုလုံး ပြုပြင်ထိန်းသိမ်းမှု Mode' : 'Global Maintenance Mode'}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {language === 'my'
                  ? 'ဖွင့်ထားပါက သာမန် User များကို Maintenance မျက်နှာပြင်သို့ လမ်းကြောင်းပြောင်းမည်ဖြစ်ပြီး Admin များသာ ဆက်လက်ဝင်ရောက်နိုင်မည် ဖြစ်ပါသည်။'
                  : 'When active, regular users see the maintenance screen. Admins bypass it automatically to test fixes.'}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900/60 p-2.5 rounded-xl border border-white/10">
              <span className="text-xs font-medium text-white">
                {maintenance.active ? (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    ENABLED
                  </span>
                ) : (
                  <span className="text-zinc-400">DISABLED</span>
                )}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenance.active}
                  onChange={(e) => setMaintenance({ ...maintenance, active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                {language === 'my' ? 'အင်္ဂလိပ်ဘာသာ အသိပေးစာ (Notice EN)' : 'Maintenance Notice (English)'}
              </label>
              <textarea
                value={maintenance.notice_en}
                onChange={(e) => setMaintenance({ ...maintenance, notice_en: e.target.value })}
                rows={2}
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                {language === 'my' ? 'မြန်မာဘာသာ အသိပေးစာ (Notice MY)' : 'Maintenance Notice (Myanmar)'}
              </label>
              <textarea
                value={maintenance.notice_my}
                onChange={(e) => setMaintenance({ ...maintenance, notice_my: e.target.value })}
                rows={2}
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              {language === 'my'
                ? 'သတိပေးချက်: Maintenance Mode ဖွင့်ထားသော်လည်း သင်၏ လက်ရှိ Admin Session ကြောင့် သင်သည် စတူဒီယိုများအားလုံးသို့ ဆက်လက်ဝင်ရောက် အသုံးပြုနိုင်မည် ဖြစ်ပါသည်။'
                : 'Note: As an authenticated administrator, you will continue to have unrestricted access to all studio tools to test production updates.'}
            </span>
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-end">
            <button
              type="button"
              onClick={handleSaveMaintenance}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? (language === 'my' ? 'သိမ်းဆည်းနေပါသည်...' : 'Saving...') : (language === 'my' ? 'Maintenance အခြေအနေ သိမ်းဆည်းမည်' : 'Save Maintenance Settings')}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Social & Support Links */}
      {activeTab === 'socials' && (
        <div className="space-y-5 bg-[#0b0f17]/60 border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
          <div>
            <h3 className="text-sm font-semibold text-white">
              {language === 'my' ? 'လူမှုကွန်ရက်နှင့် အထောက်အကူပြု လင့်ခ်များ' : 'Social Media & Support Links'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {language === 'my'
                ? 'Landing page နှင့် App Footer တွင် ပြသမည့် တရားဝင် ချိတ်ဆက်မှု လင့်ခ်များ'
                : 'Official URLs displayed on the landing page, navigation menus, and creator dashboard.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Facebook Page / Group</label>
              <input
                type="url"
                value={socials.facebook}
                onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Telegram Community / Channel</label>
              <input
                type="url"
                value={socials.telegram}
                onChange={(e) => setSocials({ ...socials, telegram: e.target.value })}
                placeholder="https://t.me/..."
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">TikTok Channel</label>
              <input
                type="url"
                value={socials.tiktok}
                onChange={(e) => setSocials({ ...socials, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@..."
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">YouTube Channel</label>
              <input
                type="url"
                value={socials.youtube}
                onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                placeholder="https://youtube.com/@..."
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Viber Contact / Channel (Optional)</label>
              <input
                type="text"
                value={socials.viber}
                onChange={(e) => setSocials({ ...socials, viber: e.target.value })}
                placeholder="viber://chat?number=..."
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Official Support Email</label>
              <input
                type="email"
                value={socials.support_email}
                onChange={(e) => setSocials({ ...socials, support_email: e.target.value })}
                placeholder="support@showai.art"
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSocials}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? (language === 'my' ? 'သိမ်းဆည်းနေပါသည်...' : 'Saving...') : (language === 'my' ? 'လင့်ခ်များ အတည်ပြုသိမ်းဆည်းမည်' : 'Save Social Links')}
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Credit Costs & Free Tier */}
      {activeTab === 'credits' && (
        <div className="space-y-5 bg-[#0b0f17]/60 border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
          <div>
            <h3 className="text-sm font-semibold text-white">
              {language === 'my' ? 'Credit ကုန်ကျစရိတ်နှင့် နေ့စဉ်လက်ဆောင်' : 'Credit Costs & Daily Grants'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {language === 'my'
                ? 'ပုံထွက် Resolution အလိုက် ကုန်ကျမည့် Credit ပမာဏနှင့် နေ့စဉ်အခမဲ့ ပေးအပ်မည့် ပမာဏ'
                : 'Base credit deductions per resolution and daily complimentary grant amount.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5">
              <label className="block text-xs font-medium text-emerald-400 mb-1">1K Resolution Cost</label>
              <input
                type="number"
                min={1}
                value={creditCosts.cost_1k}
                onChange={(e) => setCreditCosts({ ...creditCosts, cost_1k: Number(e.target.value) || 0 })}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Default: 5 credits</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5">
              <label className="block text-xs font-medium text-emerald-400 mb-1">2K Resolution Cost</label>
              <input
                type="number"
                min={1}
                value={creditCosts.cost_2k}
                onChange={(e) => setCreditCosts({ ...creditCosts, cost_2k: Number(e.target.value) || 0 })}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Default: 8 credits</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5">
              <label className="block text-xs font-medium text-emerald-400 mb-1">4K Resolution Cost</label>
              <input
                type="number"
                min={1}
                value={creditCosts.cost_4k}
                onChange={(e) => setCreditCosts({ ...creditCosts, cost_4k: Number(e.target.value) || 0 })}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Default: 12 credits</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5">
              <label className="block text-xs font-medium text-emerald-400 mb-1">8K Resolution Cost</label>
              <input
                type="number"
                min={1}
                value={creditCosts.cost_8k}
                onChange={(e) => setCreditCosts({ ...creditCosts, cost_8k: Number(e.target.value) || 0 })}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Default: 20 credits</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5">
              <label className="block text-xs font-medium text-cyan-400 mb-1">Video Prompt Cost</label>
              <input
                type="number"
                min={1}
                value={creditCosts.video_prompt}
                onChange={(e) => setCreditCosts({ ...creditCosts, video_prompt: Number(e.target.value) || 0 })}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Default: 1 credit</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <label className="block text-xs font-medium text-emerald-300 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Daily Free Credits Grant
              </label>
              <input
                type="number"
                min={0}
                value={creditCosts.daily_free_credits}
                onChange={(e) => setCreditCosts({ ...creditCosts, daily_free_credits: Number(e.target.value) || 0 })}
                className="w-full bg-black/60 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <span className="text-[10px] text-emerald-400/70 mt-1 block">Complimentary daily quota (250)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-end">
            <button
              type="button"
              onClick={handleSaveCreditCosts}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? (language === 'my' ? 'သိမ်းဆည်းနေပါသည်...' : 'Saving...') : (language === 'my' ? 'Credit နှုန်းထားများ သိမ်းဆည်းမည်' : 'Save Credit Configuration')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
