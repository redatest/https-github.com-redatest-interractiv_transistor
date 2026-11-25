import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Droplets,
  GraduationCap,
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Columns2,
  Maximize2,
} from 'lucide-react';
import { ChapterDef, Lang, tr } from '../types';
import {
  computeKirchhoffSimulation,
  createDefaultKirchhoffParams,
  KirchhoffFaultMode,
  KirchhoffSimParams,
} from '../utils/kirchhoffPhysics';
import { playPageFlip, playRelayClick, playTickSound } from '../utils/sound';
import { KirchhoffBoard3D } from './KirchhoffBoard3D';
import { KirchhoffSchematicScope } from './KirchhoffSchematicScope';
import { KirchhoffAnalogyView } from './KirchhoffAnalogyView';
import { VoltageCalculationCard } from './VoltageCalculationCard';
import { computeKirchhoffVoltageSteps } from '../utils/voltageCalculations';
import { ExampleOperationBox } from './ExampleOperationBox';

interface Props {
  chapters: ChapterDef[];
  activeChapterId: number;
  activeExampleId?: string;
  onSelectChapter: (chapterId: number, exampleId?: string) => void;
  lang: Lang;
  teacherMode: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

type StageView = 'board3d' | 'schematic' | 'analogy';

function buildKirchhoffParamsForChapter(chapterId: number, exampleId?: string): KirchhoffSimParams {
  const ex = exampleId ?? '';
  switch (chapterId) {
    case 1:
      return createDefaultKirchhoffParams({
        chapterId: 1,
        exampleId: ex || 'kvl-2r-loop',
        topology: ex === 'kvl-3r-loop' ? 'series-3r' : 'series-2r',
        e1: ex === 'kvl-3r-loop' ? 12.0 : 9.0,
        r1: 1000,
        r2: 2000,
        r3: 1500,
      });
    case 2:
      return createDefaultKirchhoffParams({
        chapterId: 2,
        exampleId: ex || 'divider-loaded',
        topology: 'loaded-divider',
        e1: 10.0,
        r1: ex === 'divider-stiff' ? 220 : 10000,
        r2: ex === 'divider-stiff' ? 220 : 10000,
        rLoad: ex === 'divider-stiff' ? 2200 : 1000,
        loadConnected: true,
      });
    case 3:
      return createDefaultKirchhoffParams({
        chapterId: 3,
        exampleId: ex || 'dual-opposing',
        topology: 'dual-sources',
        e1: 12.0,
        e2: ex === 'dual-aiding' ? 4.5 : 9.0,
        secondSourceOpposing: ex !== 'dual-aiding',
        r1: 470,
        r2: 470,
      });
    case 4:
      return createDefaultKirchhoffParams({
        chapterId: 4,
        exampleId: ex || 'kcl-2-branches',
        topology: ex === 'kcl-3-branches' ? 'parallel-3' : 'parallel-2',
        e1: 9.0,
        r1: 1000,
        r2: 2000,
        r3: 1500,
      });
    case 5:
      return createDefaultKirchhoffParams({
        chapterId: 5,
        exampleId: ex || 'led-parallel-trap',
        topology: ex === 'led-kvl-series' ? 'led-series-kvl' : 'led-parallel-trap',
        e1: ex === 'led-kvl-series' ? 9.0 : 5.0,
        r1: ex === 'led-kvl-series' ? 470 : 150,
        r2: 150,
        vfLed1: 1.9,
        vfLed2: 3.1,
        separateLedResistors: false,
        loadConnected: false,
      });
    case 6:
      return createDefaultKirchhoffParams({
        chapterId: 6,
        exampleId: ex || 'two-mesh-millman',
        topology: ex === 'wheatstone-bridge' ? 'wheatstone-bridge' : 'two-mesh-millman',
        e1: 10.0,
        e2: 4.0,
        r1: 1000,
        r2: 1000,
        r3: 1000,
        rLoad: 1500,
        loadConnected: false,
      });
    case 7:
      return createDefaultKirchhoffParams({
        chapterId: 7,
        exampleId: ex || 'ri-battery-sag',
        topology: 'internal-resistance',
        e1: 9.0,
        rInternal: 4.0,
        rLoad: 12.0,
        loadConnected: true,
      });
    case 8:
      return createDefaultKirchhoffParams({
        chapterId: 8,
        exampleId: ex || 'fault-series-lab',
        topology: ex === 'fault-parallel-lab' ? 'parallel-2' : 'series-2r',
        e1: 9.0,
        r1: 1000,
        r2: 2000,
        faultMode: 'open',
      });
    case 9:
      return createDefaultKirchhoffParams({
        chapterId: 9,
        exampleId: ex || 'thevenin-divider',
        topology: 'thevenin-equiv',
        e1: 12.0,
        e2: 6.0,
        r1: 2000,
        r2: 2000,
        rLoad: 1000,
        loadConnected: true,
        showTheveninEquivalent: false,
      });
    default:
      return createDefaultKirchhoffParams({ chapterId });
  }
}

export const KirchhoffWorkspace: React.FC<Props> = ({
  chapters,
  activeChapterId,
  activeExampleId,
  onSelectChapter,
  lang,
  teacherMode,
  muted,
  onToggleMute,
}) => {
  const chapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId) ?? chapters[0],
    [chapters, activeChapterId]
  );

  const [stageView, setStageView] = useState<StageView>('board3d');
  const [wideReading, setWideReading] = useState<boolean>(false);
  const [params, setParams] = useState<KirchhoffSimParams>(() =>
    buildKirchhoffParamsForChapter(chapter.id, activeExampleId ?? chapter.examples[0]?.id)
  );
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [quizRevealed, setQuizRevealed] = useState(false);

  useEffect(() => {
    const firstEx = activeExampleId ?? chapter.examples[0]?.id;
    setParams(buildKirchhoffParamsForChapter(chapter.id, firstEx));
    setSelectedChoice(null);
    setQuizRevealed(false);
  }, [chapter.id, activeExampleId]);

  const sim = useMemo(() => computeKirchhoffSimulation(params), [params]);

  const handleSelectExample = (exId: string) => {
    playPageFlip(muted);
    onSelectChapter(chapter.id, exId);
    setParams(buildKirchhoffParamsForChapter(chapter.id, exId));
  };

  const handleCycleFault = () => {
    const nextOrder: Record<KirchhoffFaultMode, KirchhoffFaultMode> = {
      none: 'open',
      open: 'short',
      short: 'none',
    };
    const next = nextOrder[params.faultMode];
    playRelayClick(muted, next !== 'none');
    setParams((p) => ({ ...p, faultMode: next }));
  };

  const statusText = lang === 'fr' ? sim.statusFr : lang === 'en' ? sim.statusEn : sim.statusAr;
  const warningText = lang === 'fr' ? sim.warningFr : lang === 'en' ? sim.warningEn : sim.warningAr;

  const renderControls = () => {
    const top = params.topology;
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Source E1 always available */}
          <label className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between font-mono-num">
              <span className="text-stone-600 dark:text-stone-400">
                {tr(lang, 'Source E₁', 'المصدر E₁', 'Supply E₁')}
              </span>
              <span className="font-bold text-amber-700 dark:text-amber-400">{params.e1.toFixed(1)} V</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="0.5"
              value={params.e1}
              onChange={(e) => setParams((p) => ({ ...p, e1: Number(e.target.value) }))}
              className="accent-emerald-600 cursor-pointer"
            />
          </label>

          {/* Secondary source E2 for Dual-Sources, 2-Mesh Millman & Dual-Mesh Thévenin */}
          {(top === 'dual-sources' ||
            top === 'two-mesh-millman' ||
            (top === 'thevenin-equiv' && params.exampleId === 'thevenin-dual-mesh')) && (
            <label className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between font-mono-num">
                <span className="text-stone-600 dark:text-stone-400">
                  {tr(lang, 'Source E₂', 'المصدر E₂', 'Source E₂')}
                </span>
                <span className="font-bold text-sky-700 dark:text-sky-400">{params.e2.toFixed(1)} V</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={params.e2}
                onChange={(e) => setParams((p) => ({ ...p, e2: Number(e.target.value) }))}
                className="accent-sky-600 cursor-pointer"
              />
            </label>
          )}

          {/* Internal resistance ri */}
          {top === 'internal-resistance' && (
            <label className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between font-mono-num">
                <span className="text-stone-600 dark:text-stone-400">
                  {tr(lang, 'Résistance interne r_i', 'المقاومة الداخلية r_i', 'Internal r_i')}
                </span>
                <span className="font-bold text-rose-700 dark:text-rose-400">{params.rInternal.toFixed(1)} Ω</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="20"
                step="0.2"
                value={params.rInternal}
                onChange={(e) => setParams((p) => ({ ...p, rInternal: Number(e.target.value) }))}
                className="accent-rose-600 cursor-pointer"
              />
            </label>
          )}

          {/* R1 (except internal-resistance) */}
          {top !== 'internal-resistance' && (
            <label className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between font-mono-num">
                <span className="text-stone-600 dark:text-stone-400">R₁</span>
                <span className="font-bold">{params.r1} Ω</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="50"
                value={params.r1}
                onChange={(e) => setParams((p) => ({ ...p, r1: Number(e.target.value) }))}
                className="accent-emerald-600 cursor-pointer"
              />
            </label>
          )}

          {/* R2 */}
          {top !== 'led-series-kvl' && top !== 'internal-resistance' && (
            <label className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between font-mono-num">
                <span className="text-stone-600 dark:text-stone-400">R₂</span>
                <span className="font-bold">{params.r2} Ω</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="50"
                value={params.r2}
                onChange={(e) => setParams((p) => ({ ...p, r2: Number(e.target.value) }))}
                className="accent-emerald-600 cursor-pointer"
              />
            </label>
          )}

          {/* R3 */}
          {(top === 'series-3r' || top === 'parallel-3' || top === 'two-mesh-millman' || top === 'wheatstone-bridge') && (
            <label className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between font-mono-num">
                <span className="text-stone-600 dark:text-stone-400">R₃</span>
                <span className="font-bold">{params.r3} Ω</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="50"
                value={params.r3}
                onChange={(e) => setParams((p) => ({ ...p, r3: Number(e.target.value) }))}
                className="accent-emerald-600 cursor-pointer"
              />
            </label>
          )}

          {/* Load / Bridge Sensor R_L */}
          {(top === 'loaded-divider' ||
            top === 'wheatstone-bridge' ||
            top === 'internal-resistance' ||
            top === 'thevenin-equiv') && (
            <label className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between font-mono-num">
                <span className="text-stone-600 dark:text-stone-400">
                  {top === 'wheatstone-bridge' ? tr(lang, 'Capteur R_L', 'الحساس R_L', 'Sensor R_L') : tr(lang, 'Charge R_L', 'مقاومة الحمل R_L', 'Load R_L')}
                </span>
                <span className="font-bold text-orange-700 dark:text-orange-400">{params.rLoad} Ω</span>
              </div>
              <input
                type="range"
                min={top === 'internal-resistance' ? 2 : 100}
                max={top === 'internal-resistance' ? 100 : 10000}
                step={top === 'internal-resistance' ? 1 : 50}
                value={params.rLoad}
                onChange={(e) => setParams((p) => ({ ...p, rLoad: Number(e.target.value) }))}
                className="accent-orange-600 cursor-pointer"
              />
            </label>
          )}
        </div>

        {/* Context Action Switches */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {top === 'dual-sources' && (
            <button
              type="button"
              onClick={() => {
                playRelayClick(muted, !params.secondSourceOpposing);
                setParams((p) => ({ ...p, secondSourceOpposing: !p.secondSourceOpposing }));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                params.secondSourceOpposing
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-sky-600 text-white border-sky-600'
              }`}
            >
              {params.secondSourceOpposing
                ? tr(lang, 'Polarité E₂ : Opposition (−E₂)', 'قطبية E₂: متعاكسة (−E₂)', 'E₂ Polarity: Opposing (−E₂)')
                : tr(lang, 'Polarité E₂ : Additive (+E₂)', 'قطبية E₂: متعاضدة (+E₂)', 'E₂ Polarity: Aiding (+E₂)')}
            </button>
          )}

          {(top === 'loaded-divider' ||
            top === 'internal-resistance' ||
            top === 'led-series-kvl' ||
            top === 'thevenin-equiv') && (
            <button
              type="button"
              onClick={() => {
                playRelayClick(muted, !params.loadConnected);
                setParams((p) => ({ ...p, loadConnected: !p.loadConnected }));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                params.loadConnected
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              {top === 'led-series-kvl'
                ? params.loadConnected
                  ? tr(lang, '2 LEDs en série (∑V_F = 5,0 V)', 'مصباحان على التوالي (5V)', '2 LEDs in Series (5.0 V)')
                  : tr(lang, '1 seule LED (V_F = 1,9 V)', 'مصباح واحد فقط (1.9V)', 'Single LED (1.9 V)')
                : params.loadConnected
                ? tr(lang, 'Charge R_L : Branchée', 'الحمل R_L: موصول', 'Load R_L: Connected')
                : tr(lang, 'Charge R_L : À vide (V_AB = E_th)', 'دون حمل (مفصول)', 'No-Load (Open Circuit)')}
            </button>
          )}

          {top === 'thevenin-equiv' && (
            <button
              type="button"
              onClick={() => {
                playRelayClick(muted, !params.showTheveninEquivalent);
                setParams((p) => ({ ...p, showTheveninEquivalent: !p.showTheveninEquivalent }));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                params.showTheveninEquivalent
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-amber-600 text-white border-amber-600'
              }`}
            >
              {params.showTheveninEquivalent
                ? tr(lang, 'Vue : Modèle Thévenin (E_th, R_th)', 'العرض: نموذج ثيفينان المكافئ', 'View: Thévenin Model (E_th, R_th)')
                : tr(lang, 'Basculer → Modèle Thévenin', 'التحويل ← نموذج ثيفينان', 'Switch → Thévenin Equivalent')}
            </button>
          )}

          {top === 'led-parallel-trap' && (
            <button
              type="button"
              onClick={() => {
                playRelayClick(muted, !params.separateLedResistors);
                setParams((p) => ({ ...p, separateLedResistors: !p.separateLedResistors }));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                params.separateLedResistors
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-rose-600 text-white border-rose-600'
              }`}
            >
              {params.separateLedResistors
                ? tr(lang, '2 résistances séparées (Correct)', 'مقاومتان منفصلتان (سليم)', 'Separate Resistors (Fixed)')
                : tr(lang, '1 seule R₁ partagée (Piège !)', 'مقاومة واحدة مشتركة (فخ!)', 'Single Shared R₁ (Trap!)')}
            </button>
          )}

          {(top === 'series-2r' || top === 'series-3r' || top === 'parallel-2' || top === 'parallel-3' || top === 'internal-resistance') && (
            <div className="flex items-center gap-1 rounded-lg border border-stone-300 dark:border-stone-700 p-0.5 bg-stone-100 dark:bg-stone-900 text-xs">
              {(['none', 'open', 'short'] as const).map((fm) => (
                <button
                  key={fm}
                  type="button"
                  onClick={() => {
                    playRelayClick(muted, fm !== 'none');
                    setParams((p) => ({ ...p, faultMode: fm }));
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    params.faultMode === fm
                      ? fm === 'none'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                      : 'text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {fm === 'none'
                    ? tr(lang, 'Normal', 'سليم', 'Normal')
                    : fm === 'open'
                    ? tr(lang, 'Ouvert', 'قطع', 'Open')
                    : tr(lang, 'Court-circuit', 'قصر', 'Short')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Chapter Horizontal Stepper */}
      <nav aria-label={tr(lang, 'Navigation des chapitres', 'التنقل بين الفصول', 'Chapter navigation')} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {chapters.map((c) => {
            const active = c.id === chapter.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  playPageFlip(muted);
                  onSelectChapter(c.id, c.examples[0]?.id);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
                  active
                    ? 'bg-emerald-700 text-white border-emerald-700 dark:bg-emerald-500 dark:text-stone-950 dark:border-emerald-500 font-semibold'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                }`}
              >
                <span className="font-mono-num opacity-75">0{c.id}</span>
                <span>{c.title[lang].split(':')[0]}</span>
              </button>
            );
          })}
        </div>

        {!teacherMode && (
          <button
            type="button"
            onClick={() => setWideReading((w) => !w)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 w-fit transition-colors ${
              wideReading
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            {wideReading ? <Columns2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>
              {wideReading
                ? tr(lang, 'Côte à côte', 'عرض مزدوج', 'Side-by-side')
                : tr(lang, 'Lecture large', 'قراءة موسّعة', 'Wide Reading')}
            </span>
          </button>
        )}
      </nav>

      {/* Teacher Mode Banner */}
      {teacherMode && (
        <div className="rounded-xl border border-emerald-400/70 bg-emerald-50 dark:bg-emerald-950/30 p-4 flex items-start gap-3">
          <GraduationCap className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              {tr(lang, 'Note Pédagogique Enseignant', 'ملاحظة توجيهية للمعلّم', 'Teacher Guide Note')}
            </div>
            <p className="text-sm text-stone-800 dark:text-stone-200 mt-1">{chapter.teacherNote[lang]}</p>
          </div>
        </div>
      )}

      {/* Main 2-Zone Sandbox Grid */}
      <div className={`grid grid-cols-1 ${teacherMode || wideReading ? '' : 'lg:grid-cols-12'} gap-8 items-start`}>
        {/* LEFT COLUMN: Theory, Formula, Examples, Quiz */}
        <section className={`${wideReading ? 'w-full max-w-5xl mx-auto' : 'lg:col-span-6'} flex flex-col gap-6`}>
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-6">
            <div className="text-xs font-mono-num text-emerald-700 dark:text-emerald-400">
              {chapter.pageRef} · {tr(lang, `Chapitre ${chapter.id} / ${chapters.length}`, `الفصل ${chapter.id} / ${chapters.length}`, `Chapter ${chapter.id} / ${chapters.length}`)}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mt-1">
              {chapter.title[lang]}
            </h1>
            <p className="text-[15px] text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
              {chapter.subtitle[lang]}
            </p>

            {/* Analogy Callout */}
            <div className="mt-4 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/50 p-4">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 shrink-0" />
                <span>{chapter.analogyTitle[lang]}</span>
              </div>
              <p className="text-sm text-stone-700 dark:text-stone-300 mt-1.5 leading-relaxed">
                {chapter.analogyText[lang]}
              </p>
            </div>

            {/* Theory Points */}
            <ul className="mt-5 space-y-3 text-[15px] text-stone-700 dark:text-stone-200">
              {chapter.theory.map((item, idx) => (
                <li key={idx} className="flex gap-3 leading-7">
                  <span className="font-mono-num text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1.5">
                    {idx + 1}.
                  </span>
                  <span>{item[lang]}</span>
                </li>
              ))}
            </ul>

            {/* Formula Box */}
            <div className="mt-5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 p-3.5">
              <div className="font-mono-num text-sm font-bold text-stone-900 dark:text-stone-100" dir="ltr">
                {chapter.formula}
              </div>
              <div className="mt-2.5 grid grid-cols-1 gap-1.5 text-xs">
                {chapter.formulaVars.map((v) => (
                  <div key={v.symbol} className="flex items-center justify-between gap-2 text-stone-600 dark:text-stone-400">
                    <span className="font-mono-num font-bold text-emerald-700 dark:text-emerald-400">{v.symbol}</span>
                    <span className="flex-1">{v.meaning[lang]}</span>
                    <span className="font-mono-num">{v.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chapter Practical Examples */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
              {tr(lang, 'Montages du chapitre', 'تطبيقات هذا الفصل', 'Chapter Examples')}
            </h2>
            <div className="flex flex-col gap-2">
              {chapter.examples.map((ex) => {
                const isSelected = (activeExampleId ?? chapter.examples[0]?.id) === ex.id;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => handleSelectExample(ex.id)}
                    className={`w-full text-start p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/25'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {ex.title[lang]}
                      </span>
                      <span className="text-xs font-mono-num text-emerald-700 dark:text-emerald-400">{ex.pageRef}</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">{ex.summary[lang]}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {(() => {
            const activeExId = activeExampleId ?? chapter.examples[0]?.id;
            const ex = chapter.examples.find((e) => e.id === activeExId) || chapter.examples[0];
            return ex ? <ExampleOperationBox example={ex} lang={lang} accent="emerald" /> : null;
          })()}

          {/* Step-by-step Voltage Calculation Breakdown */}
          <VoltageCalculationCard
            report={computeKirchhoffVoltageSteps(params, sim, lang)}
            lang={lang}
            accent="emerald"
          />

          {/* Interactive POEC Prediction Quiz */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>{tr(lang, 'Défi Prédiction', 'تحدّي التوقّع', 'Prediction Challenge')}</span>
            </div>
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mt-2">
              {chapter.prediction.question[lang]}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {chapter.prediction.options.map((opt, idx) => {
                const picked = selectedChoice === idx;
                const isRight = idx === chapter.prediction.correctIndex;
                let style = 'border-stone-200 dark:border-stone-800 hover:border-stone-400';
                if (quizRevealed) {
                  if (isRight) style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
                  else if (picked) style = 'border-rose-500 bg-rose-50 dark:bg-rose-950/30';
                } else if (picked) {
                  style = 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20';
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedChoice(idx);
                      setQuizRevealed(true);
                      playTickSound(muted, idx === chapter.prediction.correctIndex ? 960 : 320, 0.06);
                    }}
                    className={`w-full text-start p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${style}`}
                  >
                    {opt[lang]}
                  </button>
                );
              })}
            </div>
            {quizRevealed && (
              <div className="mt-3 p-3 rounded-lg bg-stone-100 dark:bg-stone-800/80 text-xs text-stone-800 dark:text-stone-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{chapter.prediction.explanation[lang]}</span>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Sticky Interactive Workbench */}
        <section className={`${wideReading ? 'w-full max-w-5xl mx-auto' : 'lg:col-span-6 lg:sticky lg:top-20'} flex flex-col gap-4`}>
          {/* Stage View Switcher + Sound Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-200/75 dark:bg-stone-800/80">
              {(
                [
                  { id: 'board3d', fr: 'Platine 3D', ar: 'اللوحة 3D', en: '3D PCB' },
                  { id: 'schematic', fr: 'Schéma & Bilan', ar: 'المخطط والميزان', en: 'Schematic & KVL' },
                  { id: 'analogy', fr: 'Analogie', ar: 'التشبيه المائي', en: 'Analogy' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStageView(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    stageView === tab.id
                      ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  {tab[lang]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setParams(buildKirchhoffParamsForChapter(chapter.id, activeExampleId))}
                className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 cursor-pointer"
                title={tr(lang, 'Réinitialiser', 'إعادة ضبط', 'Reset')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onToggleMute}
                className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 cursor-pointer"
                title={muted ? tr(lang, 'Activer le son', 'تشغيل الصوت', 'Unmute') : tr(lang, 'Couper le son', 'كتم الصوت', 'Mute')}
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Stage View Content */}
          {stageView === 'board3d' && (
            <KirchhoffBoard3D params={params} sim={sim} lang={lang} onQuickAction={handleCycleFault} />
          )}
          {stageView === 'schematic' && <KirchhoffSchematicScope params={params} sim={sim} lang={lang} />}
          {stageView === 'analogy' && <KirchhoffAnalogyView params={params} sim={sim} lang={lang} />}

          {/* Interactive Controls Panel */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>{tr(lang, 'Banc de réglage en direct', 'لوحة التحكم الحية', 'Live Parameter Controls')}</span>
            </div>
            {renderControls()}
          </div>

          {/* 4 Live KVL/KCL Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-3">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                {params.topology === 'thevenin-equiv'
                  ? tr(lang, 'Tension V_AB (Charge)', 'الجهد V_AB (الحمل)', 'Load V_AB')
                  : tr(lang, 'Potentiel V_A', 'جهد العقدة V_A', 'Node V_A')}
              </div>
              <div className="font-mono-num text-lg font-bold text-sky-700 dark:text-sky-400 mt-0.5">
                {sim.vA.toFixed(2)} V
              </div>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-3">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                {params.topology === 'thevenin-equiv'
                  ? tr(lang, 'Courant charge I_L', 'تيار الحمل I_L', 'Load Current I_L')
                  : tr(lang, 'Courant principal', 'التيار الرئيسي', 'Main Current')}
              </div>
              <div className="font-mono-num text-lg font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                {sim.iTotalMA.toFixed(2)} mA
              </div>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-3">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                {params.topology === 'thevenin-equiv'
                  ? tr(lang, 'Équivalent E_th · R_th', 'مكافئ ثيفينان E_th · R_th', 'Thévenin E_th · R_th')
                  : tr(lang, 'Bilan ∑U (KVL)', 'ميزان الحلقات ∑U', 'KVL Residual')}
              </div>
              <div className="font-mono-num text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {params.topology === 'thevenin-equiv'
                  ? `${(sim.eTh ?? 0).toFixed(2)} V / ${Math.round(sim.rTh ?? 0)} Ω`
                  : `${sim.kvlLoop1ResidualV.toFixed(2)} V`}
              </div>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-3">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                {tr(lang, 'Puissance P_tot', 'القدرة الكلية', 'Total Power')}
              </div>
              <div className="font-mono-num text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                {sim.totalPowerMW.toFixed(1)} mW
              </div>
            </div>
          </div>

          {/* Live Status & Warning Strip */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-3.5 text-xs flex flex-col gap-2">
            <div className="font-medium text-stone-800 dark:text-stone-100">{statusText}</div>
            {warningText && (
              <div className="flex items-start gap-2 text-rose-700 dark:text-rose-400 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{warningText}</span>
              </div>
            )}
          </div>

          {/* Chapter Next / Previous Footer */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={chapter.id <= 1}
              onClick={() => onSelectChapter(chapter.id - 1)}
              className="px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              <span>{tr(lang, 'Précédent', 'السابق', 'Previous')}</span>
            </button>
            <button
              type="button"
              disabled={chapter.id >= chapters.length}
              onClick={() => onSelectChapter(chapter.id + 1)}
              className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <span>{tr(lang, 'Chapitre suivant', 'الفصل التالي', 'Next Chapter')}</span>
              <ChevronRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
