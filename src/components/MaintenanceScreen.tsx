import React from 'react';
import { Construction, Mail, ShieldAlert, Sparkles, LogIn } from 'lucide-react';
import { MaintenanceSettings } from './admin/types';
import { Language } from '../types';

interface MaintenanceScreenProps {
  settings: MaintenanceSettings;
  language: Language;
  onOpenLogin: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  settings,
  language,
  onOpenLogin
}) => {
  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full rounded-3xl bg-[#0c1017] border border-amber-500/30 p-8 shadow-2xl relative z-10 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/20">
          <Construction className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider">
            <span>System Maintenance Mode</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-serif">
            {language === 'my' ? 'စနစ် အဆင့်မြှင့်တင်မှု ပြုလုပ်နေပါသည်' : 'Under Scheduled Maintenance'}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
            {language === 'my'
              ? settings.notice_my || 'စနစ်ကို ပိုမိုကောင်းမွန်စေရန် ခေတ္တထိန်းသိမ်းမှု ပြုလုပ်နေပါသည်။ မကြာမီ ပြန်လည်ဖွင့်လှစ်ပါမည်။'
              : settings.notice_en || 'SHOW AI Studio is currently undergoing scheduled platform upgrades. We will be back online shortly.'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-400 flex items-center justify-center gap-2">
          <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Support: support@showai.studio</span>
        </div>

        <div className="pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onOpenLogin}
            className="text-xs text-zinc-500 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer font-mono"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Administrator Access Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
