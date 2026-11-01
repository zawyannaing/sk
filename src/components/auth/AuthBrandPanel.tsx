import React from 'react';
import { Sparkles, Image as ImageIcon, Video, Users, Zap, ShieldCheck } from 'lucide-react';
import { authCopy } from './authCopy';

interface AuthBrandPanelProps {
  language: 'en' | 'my';
}

export const AuthBrandPanel: React.FC<AuthBrandPanelProps> = ({ language }) => {
  const brand = authCopy[language].brand;

  const featureIcons = [
    <Sparkles key="matrix" className="w-4 h-4 text-emerald-400" />,
    <ImageIcon key="photo" className="w-4 h-4 text-cyan-400" />,
    <Video key="video" className="w-4 h-4 text-teal-400" />,
    <Users key="community" className="w-4 h-4 text-emerald-400" />
  ];

  return (
    <div className="relative flex flex-col justify-between h-full p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-[#0c101a] via-[#080b12] to-[#05070a] border-r border-white/5">
      {/* Cyberpunk Radial Glows */}
      <div className="absolute top-0 -left-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Top Branding Section */}
      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono tracking-wider">
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          <span>{brand.badge}</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <span className="text-xl tracking-tighter">S</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-serif">
              {brand.title}
            </h2>
          </div>
          <p className="text-sm font-medium text-emerald-400/90 font-mono">
            {brand.subtitle}
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
            {brand.description}
          </p>
        </div>

        {/* Feature List */}
        <div className="pt-2 space-y-3">
          {brand.features.map((feat, idx) => (
            <div
              key={feat.title}
              className="group p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-900/80 border border-white/10 shrink-0 group-hover:border-emerald-500/40">
                  {featureIcons[idx % featureIcons.length]}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                    {feat.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    {feat.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Credits Banner */}
      <div className="relative z-10 pt-6">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 backdrop-blur-md shadow-lg shadow-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-300">
                {brand.dailyCredits}
              </p>
              <p className="text-[10px] text-emerald-500/70 font-mono mt-0.5">
                NO CREDIT CARD REQUIRED • INSTANT ACCESS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
