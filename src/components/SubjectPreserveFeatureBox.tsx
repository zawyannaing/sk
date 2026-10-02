import React from 'react';
import { Key } from 'lucide-react';
import { AppMode, MatrixSelection } from '../types';

interface SubjectPreserveFeatureBoxProps {
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
  isMyanmar?: boolean;
  className?: string;
  currentMode?: AppMode;
}

export const SubjectPreserveFeatureBox: React.FC<SubjectPreserveFeatureBoxProps> = ({
  selection,
  onUpdateSelection,
  isMyanmar = true,
  className = '',
  currentMode
}) => {
  // Option behavior:
  // Checked (isChecked = true) => Change person style (changePersonStyle = true, preserveSubject100Percent = false)
  // Unchecked (isChecked = false) => Do NOT change person style (changePersonStyle = false, preserveSubject100Percent = true)
  const isChecked = selection.changePersonStyle ?? (selection.preserveSubject100Percent === false);
  const isClothesSwap = currentMode === 'clothes-swap';

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    onUpdateSelection({
      changePersonStyle: checked,
      preserveSubject100Percent: !checked
    });
  };

  return (
    <div className={`rounded-xl border-2 transition-all p-3.5 shadow-lg ${
      isChecked
        ? 'border-amber-400/90 bg-slate-950/90 shadow-amber-950/20 hover:bg-slate-900/90'
        : 'border-sky-400/90 bg-slate-950/90 shadow-sky-950/30 hover:bg-slate-900/90'
    } ${className}`}>
      <div className="flex items-start gap-3">
        {/* Left Icon */}
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 mt-0.5 shadow-sm transition-colors ${
          isChecked
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
            : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
        }`}>
          <Key className="h-5 w-5 animate-pulse" />
        </div>

        {/* Content & Checkbox */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <label htmlFor="preserve-subject-checkbox" className="text-xs font-bold text-slate-100 cursor-pointer leading-snug hover:text-cyan-200 transition-colors">
              {isClothesSwap
                ? (isMyanmar
                    ? 'ဝတ်စုံနှင့် ပုံစံများ အသစ်ပြောင်းလဲရန်အတွက် [ အမှန်ခြစ်ပါ ]'
                    : 'Change person outfit & style [ Check to modify ]')
                : (isMyanmar
                    ? 'လူပုံစံ၊ အဝတ်အစားနှင့် ကိုယ်ဟန် ပြောင်းလဲရန်အတွက် [ အမှန်ခြစ်ပါ ]'
                    : 'Change person style, outfit & pose [ Check to modify ]')}
            </label>

            {/* Checkbox */}
            <div className="flex items-center shrink-0 pt-0.5">
              <input
                id="preserve-subject-checkbox"
                type="checkbox"
                checked={isChecked}
                onChange={handleToggle}
                className="h-5 w-5 rounded border-sky-400 bg-slate-900 text-amber-400 focus:ring-2 focus:ring-amber-400 focus:ring-offset-0 cursor-pointer accent-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Functional Indicator Badge / Description */}
          <div className={`text-[11px] p-2.5 rounded-lg border leading-relaxed transition-all ${
            isChecked
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-100'
              : 'bg-sky-950/70 border-sky-500/40 text-sky-200'
          }`}>
            {isChecked ? (
              <div className="space-y-1">
                <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <span>✨</span>
                  <span>
                    {isMyanmar
                      ? 'လူပုံစံ ပြောင်းမည် (အမှန်ခြစ်ထားသည်):'
                      : 'Change Person Style Active (Checked):'}
                  </span>
                </p>
                <p className="text-[10.5px] text-amber-100/90 pl-1 leading-relaxed">
                  {isMyanmar
                    ? 'မူရင်းထည့်ပုံထဲမှ လူ၊ မျက်နှာ၊ အဝတ်အစား၊ ကိုယ်ဟန် နှင့် အသွင်အပြင်များကို လွတ်လပ်စွာ ပြောင်းလဲ ဖန်တီးပေးပါမည်။'
                    : 'Checked: Allows modifying original person details, face, clothing, posture, and background freely.'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>
                    {isMyanmar
                      ? 'လူပုံစံ လုံးဝ မပြောင်းပါ (အမှန်ခြစ်ဖြုတ်ထားသည်):'
                      : 'Keep Person 100% Unchanged (Unchecked):'}
                  </span>
                </p>
                <p className="text-[10.5px] text-sky-100/90 pl-1 leading-relaxed">
                  {isMyanmar
                    ? 'မူရင်းပုံထဲမှ လူ၊ မျက်နှာ၊ အဝတ်အစား၊ ခန္ဓာကိုယ်နှင့် ကိုယ်ဟန် (Pose) တို့ကို လုံးဝ ၁၀၀% အတိအကျ မပြောင်းဘဲ ထိန်းသိမ်းပေးပါမည်။'
                    : 'Unchecked: Keeps original person, face, clothing, body shape, and pose 100% exactly preserved.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

