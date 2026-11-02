import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Coins, Sparkles, CheckCircle2, Zap, ArrowRight, ShieldCheck, CreditCard, Gift, Clock } from 'lucide-react';
import { Language } from '../../types';
import { LANDING_COPY } from './landingCopy';
import { TopupCreditModal, TOPUP_PACKAGES } from '../pricing/TopupCreditModal';

interface CreditsCalculatorProps {
  language: Language;
  onLaunch?: () => void;
}

export const CreditsCalculator: React.FC<CreditsCalculatorProps> = ({ language, onLaunch }) => {
  const isMm = language === 'my';
  const copy = LANDING_COPY[language].pricing;
  const [selectedTierIndex, setSelectedTierIndex] = useState<number>(1); // default to 2K High-Res
  const [isTopupModalOpen, setIsTopupModalOpen] = useState<boolean>(false);
  const [selectedTopupPkgId, setSelectedTopupPkgId] = useState<'starter' | 'creator' | 'master'>('creator');

  const dailyCredits = 250;
  const activeTier = copy.tiers[selectedTierIndex] || copy.tiers[0];
  const maxPossible = Math.floor(dailyCredits / activeTier.credits);

  // Global trigger listener for top-up modal
  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.packageId) setSelectedTopupPkgId(e.detail.packageId);
      setIsTopupModalOpen(true);
    };
    window.addEventListener('open-topup-pricing', handler);
    return () => window.removeEventListener('open-topup-pricing', handler);
  }, []);

  return (
    <section id="pricing" className="relative py-10 sm:py-24 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Glow background accent */}
      <div
        className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-16 space-y-2.5 sm:space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium tracking-wide mb-4"
        >
          <Coins className="w-3.5 h-3.5 text-emerald-400" />
          <span>{copy.badge}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight mb-4"
        >
          {copy.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.15 }}
          className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto"
        >
          {copy.subtitle}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cost Tier Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>{copy.costTableTitle}</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400/80 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-md">
              Daily Replenish: 250 CR
            </span>
          </div>

          <div className="space-y-3">
            {copy.tiers.map((tier, idx) => {
              const isSelected = selectedTierIndex === idx;
              return (
                <motion.button
                  key={tier.resolution}
                  type="button"
                  onClick={() => setSelectedTierIndex(idx)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-mono">{idx + 1}</span>}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-100">{tier.resolution}</span>
                        {tier.badge && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                            {tier.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">{tier.useCase}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 shrink-0">
                    <span className="text-lg sm:text-xl font-mono font-black text-emerald-400">
                      {tier.credits}{' '}
                      <span className="text-xs font-normal text-slate-400">CR</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">per gen</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Simulator (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-emerald-500/30 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-slate-100">{copy.calculatorTitle}</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 mb-6">{copy.calculatorHint}</p>

            {/* Selected Tier Spotlight */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-slate-400">Selected Quality:</span>
                <span className="text-sm font-bold text-emerald-300">{activeTier.resolution}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-slate-400">Cost per Generation:</span>
                <span className="text-sm font-mono font-bold text-cyan-300">{activeTier.credits} Credits</span>
              </div>
            </div>

            {/* Big Math Visual */}
            <div className="text-center py-6 px-4 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-950 border border-emerald-500/20 mb-6">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block mb-2">
                Daily Output Capacity
              </span>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl sm:text-6xl font-black font-mono text-slate-100 tracking-tight">
                  {maxPossible}
                </span>
                <span className="text-lg font-bold text-emerald-400">
                  {selectedTierIndex === 4 ? 'prompts' : 'renders'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {dailyCredits} Credits ÷ {activeTier.credits} CR = <strong className="text-slate-200">{maxPossible} full pieces</strong> every single day
              </p>
            </div>

            {/* Daily Streak Benefit Note */}
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 mb-6 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {language === 'my'
                  ? 'နေ့စဉ် login ဝင်ရုံဖြင့် ၂၅၀ Credit အခမဲ့ အလိုအလျောက် သွင်းပေးပါသည်။ အကောင့်သစ်များ ချက်ချင်း အသုံးပြုနိုင်ပါသည်။'
                  : 'Daily replenishment resets automatically at 00:00. No credit card required to explore and create.'}
              </span>
            </div>

            {/* Launch CTA */}
            {onLaunch && (
              <button
                type="button"
                onClick={onLaunch}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{language === 'my' ? 'စတူဒီယို စတင်အသုံးပြုရန်' : 'Claim Daily Credits & Launch'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 💳 OFFICIAL TOP-UP PACKAGES & PAYMENT SECTION                       */}
      {/* =================================================================== */}
      <div className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>{isMm ? 'KBZPay • WavePay • Banking ငွေလွှဲစနစ်' : 'Instant Top-Up & Payment Options'}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isMm ? 'User Credit ဝယ်ယူဖြည့်သွင်းခြင်း' : 'Choose Your Top-Up Package'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {isMm
              ? 'အပိုဆု Credit Bonus များနှင့်အတူ မိမိစိတ်ကြိုက် Package ရွေးချယ်ပြီး Admin Panel မှ ၅-၁၅ မိနစ်အတွင်း အတည်ပြုပေးပါသည်'
              : 'Direct mobile wallet transfer with instant admin verification. High priority GPU generation on all tiers.'}
          </p>
        </div>

        {/* 3 Top-Up Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {TOPUP_PACKAGES.map((pkg) => {
            const isPopular = pkg.popular;
            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-b from-[#0f172a] to-[#090d16] border-2 border-emerald-500 shadow-2xl shadow-emerald-500/15 ring-2 ring-emerald-500/20'
                    : 'bg-[#0d121c]/90 border border-white/10 hover:border-white/20'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-[10px] font-black uppercase tracking-widest shadow-lg">
                    MOST POPULAR
                  </span>
                )}

                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    {isMm ? pkg.nameMm : pkg.nameEn}
                  </h4>
                  <div className="flex items-baseline gap-1.5 my-3">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                      +{pkg.credits.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-zinc-400">CR</span>
                  </div>

                  {pkg.bonus && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-semibold mb-3">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      <span>{pkg.bonus}</span>
                    </div>
                  )}

                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    {isMm ? pkg.descMm : pkg.descEn}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-amber-300 font-mono">
                      {pkg.mmkApprox}
                    </span>
                    <span className="text-xs text-zinc-400">(${pkg.costUsd} USD)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTopupPkgId(pkg.id);
                      setIsTopupModalOpen(true);
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer ${
                      isPopular
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-95 shadow-emerald-500/20'
                        : 'bg-white/10 hover:bg-white/15 text-white'
                    }`}
                  >
                    <span>{isMm ? 'ယခု ဖြည့်သွင်းမည်' : 'Top-Up Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Top-Up & Payment Slip Modal */}
      <TopupCreditModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        language={language}
        initialPackageId={selectedTopupPkgId}
      />
    </section>
  );
};
