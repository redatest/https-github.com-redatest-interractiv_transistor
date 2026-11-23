import React, { useMemo, useState } from 'react';
import { Calculator, CheckCircle2, HelpCircle, RefreshCw } from 'lucide-react';
import { Lang, tr } from '../types';
import { computeKirchhoffSimulation, createDefaultKirchhoffParams } from '../utils/kirchhoffPhysics';

interface Props {
  lang: Lang;
}

interface PuzzleItem {
  id: number;
  law: 'KVL' | 'KCL';
  prompt: { fr: string; ar: string; en: string };
  unit: 'V' | 'mA';
  answer: number;
  choices: number[];
  hint: { fr: string; ar: string; en: string };
}

const PUZZLES: PuzzleItem[] = [
  {
    id: 1,
    law: 'KVL',
    prompt: {
      fr: 'Maille fermée : pile E = 12,0 V, U₁ = 4,5 V, U₃ = 2,5 V. Que vaut la chute inconnue U₂ ?',
      ar: 'حلقة مغلقة: البطارية E = 12.0V، و U₁ = 4.5V، و U₃ = 2.5V. ما قيمة الهبوط المجهول U₂؟',
      en: 'Closed loop: E = 12.0 V, U₁ = 4.5 V, U₃ = 2.5 V. What is unknown drop U₂?',
    },
    unit: 'V',
    answer: 5.0,
    choices: [3.5, 5.0, 7.0, 9.5],
    hint: {
      fr: 'KVL : 12,0 − 4,5 − 2,5 = 5,0 V.',
      ar: 'قانون الحلقات: 12.0 − 4.5 − 2.5 = 5.0V.',
      en: 'KVL: 12.0 − 4.5 − 2.5 = 5.0 V.',
    },
  },
  {
    id: 2,
    law: 'KCL',
    prompt: {
      fr: 'Au nœud A : 45 mA et 15 mA entrent ; 22 mA sortent par la branche 1. Quel courant sort par la branche 2 ?',
      ar: 'عند العقدة A: يدخل 45mA و 15mA، ويخرج 22mA من الفرع الأول. كم يخرج من الفرع الثاني؟',
      en: 'At Node A: 45 mA and 15 mA enter; 22 mA leave through branch 1. How much leaves via branch 2?',
    },
    unit: 'mA',
    answer: 38,
    choices: [8, 30, 38, 60],
    hint: {
      fr: 'KCL : Entrants = 45 + 15 = 60 mA, donc Sortant₂ = 60 − 22 = 38 mA.',
      ar: 'قانون العقد: الداخل = 45 + 15 = 60mA، إذن الخارج₂ = 60 − 22 = 38mA.',
      en: 'KCL: Inflow = 45 + 15 = 60 mA, so Out₂ = 60 − 22 = 38 mA.',
    },
  },
  {
    id: 3,
    law: 'KVL',
    prompt: {
      fr: 'Maille LED : source 9,0 V, LED bleue V_F = 3,2 V, résistance R = 290 Ω. Quel est le courant I ?',
      ar: 'حلقة LED: مصدر 9.0V، مصباح أزرق V_F = 3.2V، مقاومة 290Ω. كم قيمة التيار؟',
      en: 'LED loop: 9.0 V supply, blue LED V_F = 3.2 V, R = 290 Ω. What is loop current I?',
    },
    unit: 'mA',
    answer: 20,
    choices: [11, 20, 31, 42],
    hint: {
      fr: 'U_R = 9,0 − 3,2 = 5,8 V → I = 5,8 / 290 Ω = 0,020 A = 20 mA.',
      ar: 'جهد المقاومة = 9.0 − 3.2 = 5.8V ← التيار = 5.8 / 290 = 20mA.',
      en: 'U_R = 9.0 − 3.2 = 5.8 V → I = 5.8 / 290 Ω = 20 mA.',
    },
  },
  {
    id: 4,
    law: 'KVL',
    prompt: {
      fr: 'Deux sources en opposition : E₁ = 15 V et E₂ = 9 V avec R_tot = 300 Ω. Quelle est l’intensité du courant ?',
      ar: 'مصدران متعاكسان: E₁ = 15V و E₂ = 9V مع مقاومة كلية 300Ω. كم شدة التيار؟',
      en: 'Opposing sources: E₁ = 15 V and E₂ = 9 V with R_tot = 300 Ω. What is current magnitude?',
    },
    unit: 'mA',
    answer: 20,
    choices: [20, 50, 80, 12],
    hint: {
      fr: 'E_net = 15 − 9 = 6 V → I = 6 V / 300 Ω = 20 mA.',
      ar: 'الجهد المحصل = 15 − 9 = 6V ← التيار = 6 / 300 = 20mA.',
      en: 'E_net = 15 − 9 = 6 V → I = 6 V / 300 Ω = 20 mA.',
    },
  },
];

export const KirchhoffToolsView: React.FC<Props> = ({ lang }) => {
  // Tool 1: Live 2-Mesh / Millman Universal Solver
  const [e1, setE1] = useState(12.0);
  const [e2, setE2] = useState(5.0);
  const [r1, setR1] = useState(1000);
  const [r2, setR2] = useState(2000);
  const [r3, setR3] = useState(1500);

  const solverSim = useMemo(
    () =>
      computeKirchhoffSimulation(
        createDefaultKirchhoffParams({
          topology: 'two-mesh-millman',
          e1,
          e2,
          r1,
          r2,
          r3,
        })
      ),
    [e1, e2, r1, r2, r3]
  );

  // Tool 2: Unknown Finder KVL/KCL Challenge
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [pickedChoice, setPickedChoice] = useState<number | null>(null);
  const puzzle = PUZZLES[puzzleIdx];

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
        <p className="text-xs font-mono-num text-emerald-700 dark:text-emerald-400">
          {tr(lang, 'Filière Mailles & Nœuds · Outils d’analyse', 'مسار كيرشوف · أدوات الحل والتدريب', 'Kirchhoff Track · Analysis Bench')}
        </p>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mt-1">
          {tr(lang, 'Résolveur 2 Mailles & Défi « Trouve l’inconnue »', 'حلّال الشبكات وتحدّي إيجاد المجهول', '2-Mesh Nodal Solver & KVL/KCL Puzzle Bench')}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* TOOL 1: Universal 2-Mesh Millman Solver */}
        <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-50">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>{tr(lang, 'Résolveur Universel 2 Mailles (Millman)', 'حلّال الحلقات المزدوجة (ميلمان)', 'Universal 2-Mesh Solver (Millman)')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex flex-col gap-1">
              <div className="flex justify-between font-mono-num">
                <span>E₁</span>
                <span className="font-bold text-amber-600">{e1.toFixed(1)} V</span>
              </div>
              <input type="range" min="0" max="24" step="0.5" value={e1} onChange={(e) => setE1(Number(e.target.value))} className="accent-emerald-600 cursor-pointer" />
            </label>
            <label className="flex flex-col gap-1">
              <div className="flex justify-between font-mono-num">
                <span>E₂</span>
                <span className="font-bold text-sky-600">{e2.toFixed(1)} V</span>
              </div>
              <input type="range" min="0" max="24" step="0.5" value={e2} onChange={(e) => setE2(Number(e.target.value))} className="accent-sky-600 cursor-pointer" />
            </label>
            <label className="flex flex-col gap-1">
              <div className="flex justify-between font-mono-num">
                <span>R₁ (branche E₁)</span>
                <span className="font-bold">{r1} Ω</span>
              </div>
              <input type="range" min="100" max="10000" step="100" value={r1} onChange={(e) => setR1(Number(e.target.value))} className="accent-emerald-600 cursor-pointer" />
            </label>
            <label className="flex flex-col gap-1">
              <div className="flex justify-between font-mono-num">
                <span>R₂ (branche E₂)</span>
                <span className="font-bold">{r2} Ω</span>
              </div>
              <input type="range" min="100" max="10000" step="100" value={r2} onChange={(e) => setR2(Number(e.target.value))} className="accent-emerald-600 cursor-pointer" />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <div className="flex justify-between font-mono-num">
                <span>R₃ (branche centrale vers GND)</span>
                <span className="font-bold text-orange-600">{r3} Ω</span>
              </div>
              <input type="range" min="100" max="10000" step="100" value={r3} onChange={(e) => setR3(Number(e.target.value))} className="accent-orange-600 cursor-pointer" />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-stone-200 dark:border-stone-800 font-mono-num text-xs">
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
              <div className="text-stone-500">V_A</div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{solverSim.vA.toFixed(2)} V</div>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
              <div className="text-stone-500">I₁</div>
              <div className="text-base font-bold text-amber-600">{solverSim.i1MA.toFixed(2)} mA</div>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
              <div className="text-stone-500">I₂</div>
              <div className="text-base font-bold text-sky-600">{solverSim.i2MA.toFixed(2)} mA</div>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
              <div className="text-stone-500">I₃</div>
              <div className="text-base font-bold text-orange-600">{solverSim.i3MA.toFixed(2)} mA</div>
            </div>
          </div>

          <div className="rounded-lg bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/50 p-3 text-xs font-mono-num text-stone-800 dark:text-stone-200" dir="ltr">
            KCL: I₁ + I₂ = {(solverSim.i1MA + solverSim.i2MA).toFixed(2)} mA = I₃ ({solverSim.i3MA.toFixed(2)} mA) · Résidu = {solverSim.kclNodeResidualMA.toFixed(2)} mA
          </div>
        </section>

        {/* TOOL 2: Find the Unknown KVL/KCL Challenge */}
        <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-50">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{tr(lang, 'Défi « Trouve l’inconnue »', 'تحدّي «أوجد المجهول»', 'Find the Unknown Challenge')}</span>
            </div>
            <span className="text-xs font-mono-num px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold">
              {puzzle.law} · #{puzzleIdx + 1}/{PUZZLES.length}
            </span>
          </div>

          <p className="text-sm text-stone-800 dark:text-stone-100 leading-relaxed">
            {puzzle.prompt[lang]}
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {puzzle.choices.map((val) => {
              const picked = pickedChoice === val;
              const isCorrect = val === puzzle.answer;
              let cls = 'border-stone-300 dark:border-stone-700 hover:border-emerald-500';
              if (pickedChoice !== null) {
                if (isCorrect) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300';
                else if (picked) cls = 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300';
              }
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPickedChoice(val)}
                  className={`p-3 rounded-lg border font-mono-num text-sm font-bold cursor-pointer transition-colors ${cls}`}
                >
                  {val} {puzzle.unit}
                </button>
              );
            })}
          </div>

          {pickedChoice !== null && (
            <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800 text-xs flex items-start gap-2 text-stone-800 dark:text-stone-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{puzzle.hint[lang]}</span>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => {
                setPuzzleIdx((prev) => (prev + 1) % PUZZLES.length);
                setPickedChoice(null);
              }}
              className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{tr(lang, 'Problème suivant', 'التمرين التالي', 'Next Puzzle')}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
