import React from 'react';
import { BookOpenCheck } from 'lucide-react';
import { BookExample, Lang, tr } from '../types';

interface Props {
  example: BookExample;
  lang: Lang;
  accent?: 'amber' | 'sky' | 'emerald';
}

export const ExampleOperationBox: React.FC<Props> = ({
  example,
  lang,
  accent = 'amber',
}) => {
  const palette =
    accent === 'sky'
      ? {
          wrap: 'border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/20',
          heading: 'text-sky-800 dark:text-sky-300',
          badge: 'bg-sky-100 dark:bg-sky-900/50 text-sky-900 dark:text-sky-200 border-sky-200 dark:border-sky-800',
        }
      : accent === 'emerald'
      ? {
          wrap: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20',
          heading: 'text-emerald-800 dark:text-emerald-300',
          badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
        }
      : {
          wrap: 'border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20',
          heading: 'text-amber-800 dark:text-amber-300',
          badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800',
        };

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-2.5 ${palette.wrap}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${palette.heading}`}>
          <BookOpenCheck className="w-4 h-4 shrink-0" />
          <span>
            {tr(
              lang,
              'Fonctionnement détaillé du circuit',
              'شرح مفصّل لآلية عمل الدارة',
              'Detailed Circuit Operation'
            )}
          </span>
        </div>
        <span className="text-[11px] font-mono-num text-stone-600 dark:text-stone-400">
          {example.title[lang]} · {example.pageRef}
        </span>
      </div>

      <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
        {example.howItWorks[lang]}
      </p>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {example.components.map((comp) => (
          <span
            key={comp}
            className={`px-2 py-0.5 rounded border text-[11px] font-mono-num ${palette.badge}`}
          >
            {comp}
          </span>
        ))}
      </div>
    </div>
  );
};
