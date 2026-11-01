import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { PasswordScore } from './types';
import { authCopy } from './authCopy';

interface PasswordStrengthMeterProps {
  password: string;
  language: 'en' | 'my';
}

export function evaluatePassword(pwd: string, lang: 'en' | 'my'): PasswordScore {
  const copy = authCopy[lang].strength;
  const hasLength = pwd.length >= 8;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  let score = 0;
  if (hasLength) score += 1;
  if (hasLower && hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  let label = copy.weak;
  let color = 'bg-rose-500 text-rose-400 border-rose-500/30';

  if (score === 2) {
    label = copy.fair;
    color = 'bg-amber-500 text-amber-400 border-amber-500/30';
  } else if (score === 3) {
    label = copy.good;
    color = 'bg-teal-400 text-teal-300 border-teal-500/30';
  } else if (score === 4) {
    label = copy.strong;
    color = 'bg-emerald-500 text-emerald-300 border-emerald-500/30';
  }

  return {
    score,
    label,
    color,
    hasLength,
    hasLower,
    hasUpper,
    hasNumber,
    hasSpecial
  };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  language
}) => {
  const copy = authCopy[language].strength;
  const result = useMemo(() => evaluatePassword(password, language), [password, language]);

  if (!password) return null;

  return (
    <div className="space-y-2 pt-1 pb-1">
      {/* 4 Segment Progress Bar */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400 font-mono text-[11px]">Security Level</span>
        <span
          className={`font-semibold text-[11px] px-2 py-0.5 rounded-full border ${result.color}`}
        >
          {result.label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => {
          const isActive = result.score >= step;
          let barColor = 'bg-zinc-800';
          if (isActive) {
            if (result.score === 1) barColor = 'bg-rose-500';
            else if (result.score === 2) barColor = 'bg-amber-500';
            else if (result.score === 3) barColor = 'bg-teal-400';
            else if (result.score === 4) barColor = 'bg-emerald-500';
          }
          return (
            <div
              key={step}
              className={`rounded-full transition-all duration-300 ${barColor}`}
            />
          );
        })}
      </div>

      {/* Real-time Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
        <div className={`flex items-center gap-1.5 ${result.hasLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
          {result.hasLength ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-zinc-600 shrink-0" />}
          <span className="truncate">{copy.length}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${result.hasLower && result.hasUpper ? 'text-emerald-400' : 'text-zinc-500'}`}>
          {result.hasLower && result.hasUpper ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-zinc-600 shrink-0" />}
          <span className="truncate">{copy.mixed}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${result.hasNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
          {result.hasNumber ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-zinc-600 shrink-0" />}
          <span className="truncate">{copy.number}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${result.hasSpecial ? 'text-emerald-400' : 'text-zinc-500'}`}>
          {result.hasSpecial ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-zinc-600 shrink-0" />}
          <span className="truncate">{copy.special}</span>
        </div>
      </div>
    </div>
  );
};
