import React from 'react';
import { Calculator } from 'lucide-react';
import { Lang, tr } from '../types';
import { VoltageCalcReport } from '../utils/voltageCalculations';

interface Props {
  report: VoltageCalcReport;
  lang: Lang;
  accent?: 'amber' | 'sky' | 'emerald';
}

export const VoltageCalculationCard: React.FC<Props> = ({
  report,
  lang,
  accent = 'amber',
}) => {
  const borderClass =
    accent === 'sky'
      ? 'border-sky-500/40 bg-sky-50/50 dark:bg-sky-950/20'
      : accent === 'emerald'
      ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
      : 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20';

  const titleColor =
    accent === 'sky'
      ? 'text-sky-800 dark:text-sky-300'
      : accent === 'emerald'
      ? 'text-emerald-800 dark:text-emerald-300'
      : 'text-amber-800 dark:text-amber-300';

  const resultBadgeTone = (tone?: 'amber' | 'sky' | 'emerald' | 'rose') => {
    switch (tone) {
      case 'sky':
        return 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
      case 'rose':
        return 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800';
      case 'amber':
      default:
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
    }
  };

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 ${borderClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${titleColor}`}>
          <Calculator className="w-3.5 h-3.5 shrink-0" />
          <span>{report.headerTitle}</span>
        </div>
        <span className="text-[11px] font-mono-num text-stone-500 dark:text-stone-400">
          {tr(lang, 'Calcul en direct', 'حساب مباشر', 'Live Math')}
        </span>
      </div>

      {/* Step-by-step voltage equations */}
      <div className="flex flex-col gap-2">
        {report.steps.map((step, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-stone-200/80 dark:border-stone-800 bg-white/95 dark:bg-stone-900/85 p-3 flex flex-col gap-1.5"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                {step.label}
              </span>
              <span
                className={`px-2 py-0.5 rounded border text-xs font-mono-num font-bold shrink-0 ${resultBadgeTone(step.tone)}`}
                dir="ltr"
              >
                {step.result}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs font-mono-num" dir="ltr">
              <span className="text-stone-500 dark:text-stone-400">{step.formula}</span>
              <span className="text-stone-800 dark:text-stone-200 font-medium">{step.substitution}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Overall KVL Loop Conservation Summary */}
      <div
        className="rounded-lg bg-stone-900/90 dark:bg-stone-950 text-stone-100 px-3 py-2 text-xs font-mono-num font-semibold text-center"
        dir="ltr"
      >
        {report.summaryEquation}
      </div>
    </div>
  );
};
