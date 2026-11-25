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
  computeMosfetSimulation,
  createDefaultMosfetParams,
  FET_SPECS,
  MosfetSimParams,
} from '../utils/mosfetPhysics';
import { playPageFlip, playRelayClick, playTickSound } from '../utils/sound';
import { MosfetBoard3D } from './MosfetBoard3D';
import { MosfetSchematicScope } from './MosfetSchematicScope';
import { MosfetAnalogyView } from './MosfetAnalogyView';
import { VoltageCalculationCard } from './VoltageCalculationCard';
import { computeMosfetVoltageSteps } from '../utils/voltageCalculations';
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

function buildMosfetParamsForChapter(chapterId: number, exampleId?: string): MosfetSimParams {
  const ex = exampleId ?? '';
  switch (chapterId) {
    case 1:
      return createDefaultMosfetParams({
        chapterId: 1,
        exampleId: ex || 'gate-cap-memory',
        vgs: 5.0,
        vdd: 12.0,
        pullDown1M: ex !== 'gate-cap-memory',
        gateLatched: false,
      });
    case 2:
      return createDefaultMosfetParams({
        chapterId: 2,
        exampleId: ex || 'arduino-5v-trap',
        fetModel: ex === 'saturation-ohmic' ? 'irlz44n' : 'irf540n',
        vgs: 5.0,
        loadCurrentA: 6.0,
      });
    case 3:
      return createDefaultMosfetParams({
        chapterId: 3,
        exampleId: ex || 'nmos-lowside',
        fetPolarity: ex === 'nmos-lowside' ? 'NMOS' : 'PMOS',
        batteryReversed: false,
        highSideSwitchOn: true,
      });
    case 4:
      return createDefaultMosfetParams({
        chapterId: 4,
        exampleId: ex || 'cmos-inverter',
        cmosVin: ex === 'shoot-through-trap' ? 2.5 : 0.0,
        deadTimeEnabled: ex !== 'shoot-through-trap',
      });
    case 5:
      return createDefaultMosfetParams({
        chapterId: 5,
        exampleId: ex || 'pwm-gate-drive',
        rgOhms: ex === 'motor-pwm-mosfet' ? 100 : 1000,
        pwmFreqKHz: 25,
        pwmDuty: 65,
      });
    case 6:
      return createDefaultMosfetParams({
        chapterId: 6,
        exampleId: ex || 'inductive-flyback',
        flybackInstalled: ex !== 'inductive-flyback',
        reverseBodyTest: ex === 'body-diode-conduction',
      });
    case 7:
      return createDefaultMosfetParams({
        chapterId: 7,
        exampleId: ex || 'dc-boost-converter',
        boostVin: 5.0,
        boostDuty: 58,
      });
    case 8:
      return createDefaultMosfetParams({
        chapterId: 8,
        exampleId: ex || 'h-bridge-motor',
        hbridgeState: 'FWD',
        targetCurrentA: 1.5,
      });
    default:
      return createDefaultMosfetParams({ chapterId });
  }
}

export const MosfetWorkspace: React.FC<Props> = ({
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
  const [params, setParams] = useState<MosfetSimParams>(() =>
    buildMosfetParamsForChapter(chapter.id, activeExampleId ?? chapter.examples[0]?.id)
  );
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [quizRevealed, setQuizRevealed] = useState(false);

  useEffect(() => {
    const firstEx = activeExampleId ?? chapter.examples[0]?.id;
    setParams(buildMosfetParamsForChapter(chapter.id, firstEx));
    setSelectedChoice(null);
    setQuizRevealed(false);
  }, [chapter.id, activeExampleId]);

  const sim = useMemo(() => computeMosfetSimulation(params), [params]);

  const handleSelectExample = (exId: string) => {
    playPageFlip(muted);
    onSelectChapter(chapter.id, exId);
    setParams(buildMosfetParamsForChapter(chapter.id, exId));
  };

  const handleQuickAction = (action: string) => {
    if (action === 'touch-gate') {
      playTickSound(muted, 920, 0.04);
      setParams((p) => ({ ...p, fingerTouchGate: true, gateLatched: true }));
      window.setTimeout(() => {
        setParams((p) => ({ ...p, fingerTouchGate: false }));
      }, 900);
    } else if (action === 'pulse') {
      playRelayClick(muted, !sim.conducting);
      setParams((p) => ({ ...p, vgs: p.vgs > 1 ? 0 : 5 }));
    }
  };

  const statusText = lang === 'fr' ? sim.statusFr : lang === 'en' ? sim.statusEn : sim.statusAr;
  const warningText = lang === 'fr' ? sim.warningFr : lang === 'en' ? sim.warningEn : sim.warningAr;

  const renderControls = () => {
    if (chapter.id === 1) {
      if (params.exampleId === 'gate-cap-memory') {
        return (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickAction('touch-gate')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white cursor-pointer whitespace-nowrap"
            >
              {tr(lang, 'Effleurer la Grille G (+5 V bref)', 'المس البوابة G بنبضة سريعة', 'Tap Gate G (+5 V briefly)')}
            </button>
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, gateLatched: false, fingerTouchGate: false }))}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer whitespace-nowrap"
            >
              {tr(lang, 'Décharger vers GND (0 V)', 'تفريغ البوابة للأرضي', 'Discharge Gate to GND')}
            </button>
            <button
              type="button"
              onClick={() =>
                setParams((p) => ({
                  ...p,
                  pullDown1M: !p.pullDown1M,
                  gateLatched: !p.pullDown1M ? false : p.gateLatched,
                }))
              }
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                params.pullDown1M
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-rose-600 text-white border-rose-600'
              }`}
            >
              {params.pullDown1M
                ? tr(lang, 'Pull-down 1 MΩ : INSTALLÉE', 'مقاومة 1 MΩ: مركّبة', '1 MΩ Pull-Down: INSTALLED')
                : tr(lang, 'Pull-down 1 MΩ : RETIRÉE (Flottante)', 'مقاومة 1 MΩ: مفصولة (عائمة)', '1 MΩ Pull-Down: REMOVED')}
            </button>
          </div>
        );
      }

      return (
        <label className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between font-medium">
            <span>{tr(lang, 'Tension Grille–Source V_GS', 'جهد البوابة–المصدر V_GS', 'Gate–Source Voltage V_GS')}</span>
            <span className="font-mono-num font-bold text-sky-700 dark:text-sky-400">
              {params.vgs.toFixed(1)} V · I_G = {sim.igNA.toFixed(1)} nA
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.2}
            value={params.vgs}
            onChange={(e) => setParams((p) => ({ ...p, vgs: Number(e.target.value) }))}
            className="w-full accent-sky-600 cursor-pointer"
          />
        </label>
      );
    }

    if (chapter.id === 2) {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(['irf540n', 'irlz44n'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setParams((p) => ({ ...p, fetModel: m }))}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                  params.fetModel === m
                    ? 'bg-stone-900 text-white dark:bg-sky-400 dark:text-stone-950 border-transparent'
                    : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                {FET_SPECS[m].name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span>{tr(lang, 'Signal de commande V_GS', 'جهد القيادة V_GS', 'Gate drive V_GS')}</span>
                <span className="font-mono-num text-sky-700 dark:text-sky-400">{params.vgs.toFixed(1)} V</span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={0.2}
                value={params.vgs}
                onChange={(e) => setParams((p) => ({ ...p, vgs: Number(e.target.value) }))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span>{tr(lang, 'Courant demandé par la charge', 'تيار الحمل المطلوب', 'Requested load current')}</span>
                <span className="font-mono-num text-amber-700 dark:text-amber-400">{params.loadCurrentA.toFixed(1)} A</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                step={0.5}
                value={params.loadCurrentA}
                onChange={(e) => setParams((p) => ({ ...p, loadCurrentA: Number(e.target.value) }))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </label>
          </div>
        </div>
      );
    }

    if (chapter.id === 3) {
      if (params.exampleId === 'pmos-reverse-polarity') {
        return (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                playRelayClick(muted, params.batteryReversed);
                setParams((p) => ({ ...p, batteryReversed: !p.batteryReversed }));
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                params.batteryReversed
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-emerald-600 text-white border-emerald-600'
              }`}
            >
              {params.batteryReversed
                ? tr(lang, 'Batterie INVERSÉE (−12 V) · Cliquer pour rétablir', 'البطارية معكوسة (−12V) · انقر للإصلاح', 'Battery REVERSED (−12 V) · Click to fix')
                : tr(lang, 'Batterie NORMALE (+12 V) · Simuler inversion', 'البطارية صحيحة (+12V) · تجربة العكس', 'Battery NORMAL (+12 V) · Simulate reversal')}
            </button>
          </div>
        );
      }
      return (
        <div className="flex flex-wrap items-center gap-2.5">
          {(['NMOS', 'PMOS'] as const).map((pol) => (
            <button
              key={pol}
              type="button"
              onClick={() => setParams((p) => ({ ...p, fetPolarity: pol }))}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                params.fetPolarity === pol
                  ? 'bg-stone-900 text-white dark:bg-sky-400 dark:text-stone-950 border-transparent'
                  : 'border-stone-300 dark:border-stone-700'
              }`}
            >
              {pol === 'NMOS'
                ? tr(lang, 'N-MOS (IRLZ44N Low-Side)', 'N-MOS (الطرف السالب)', 'N-MOS (IRLZ44N Low-Side)')
                : tr(lang, 'P-MOS (IRF9540 High-Side)', 'P-MOS (الطرف الموجب)', 'P-MOS (IRF9540 High-Side)')}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              playRelayClick(muted, !params.highSideSwitchOn);
              setParams((p) => ({ ...p, highSideSwitchOn: !p.highSideSwitchOn }));
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
              params.highSideSwitchOn
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-transparent'
            }`}
          >
            {params.highSideSwitchOn
              ? tr(lang, 'Commande : ON', 'التحكم: شغّال', 'Drive: ON')
              : tr(lang, 'Commande : OFF', 'التحكم: مطفأ', 'Drive: OFF')}
          </button>
        </div>
      );
    }

    if (chapter.id === 4) {
      return (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between font-medium">
              <span>{tr(lang, 'Tension d’entrée CMOS V_in', 'جهد الدخل CMOS V_in', 'CMOS Input Voltage V_in')}</span>
              <span className="font-mono-num text-sky-700 dark:text-sky-400">
                {params.cmosVin.toFixed(1)} V → V_out = {sim.vout.toFixed(1)} V
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={params.cmosVin}
              onChange={(e) => setParams((p) => ({ ...p, cmosVin: Number(e.target.value) }))}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </label>

          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, deadTimeEnabled: !p.deadTimeEnabled }))}
            className={`w-fit px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
              params.deadTimeEnabled
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-rose-600 text-white border-rose-600'
            }`}
          >
            {params.deadTimeEnabled
              ? tr(lang, 'Protection Temps Mort (Dead-Time) : ACTIVE', 'حماية Dead-Time: مفعّلة', 'Dead-Time Blanking: ENABLED')
              : tr(lang, 'Protection Temps Mort : DÉSACTIVÉE', 'حماية Dead-Time: معطّلة', 'Dead-Time Blanking: DISABLED')}
          </button>
        </div>
      );
    }

    if (chapter.id === 5) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between font-semibold">
              <span>R_G</span>
              <span className="font-mono-num text-sky-700 dark:text-sky-400">{params.rgOhms} Ω</span>
            </div>
            <input
              type="range"
              min={10}
              max={2200}
              step={10}
              value={params.rgOhms}
              onChange={(e) => setParams((p) => ({ ...p, rgOhms: Number(e.target.value) }))}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between font-semibold">
              <span>f_PWM</span>
              <span className="font-mono-num text-amber-700 dark:text-amber-400">{params.pwmFreqKHz} kHz</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={params.pwmFreqKHz}
              onChange={(e) => setParams((p) => ({ ...p, pwmFreqKHz: Number(e.target.value) }))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between font-semibold">
              <span>{tr(lang, 'Rapport cyclique', 'نسبة النبضات', 'Duty cycle')}</span>
              <span className="font-mono-num">{params.pwmDuty}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={95}
              step={5}
              value={params.pwmDuty}
              onChange={(e) => setParams((p) => ({ ...p, pwmDuty: Number(e.target.value) }))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </label>
        </div>
      );
    }

    if (chapter.id === 6) {
      return (
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              playRelayClick(muted, !params.flybackInstalled);
              setParams((p) => ({ ...p, flybackInstalled: !p.flybackInstalled, reverseBodyTest: false }));
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
              params.flybackInstalled
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-rose-600 text-white border-rose-600'
            }`}
          >
            {params.flybackInstalled
              ? tr(lang, 'Diode roue libre 1N5819 : POSÉE (Sûr)', 'دايود الحماية: مركّب (آمن)', 'Flyback Diode 1N5819: INSTALLED')
              : tr(lang, 'Sans diode roue libre (Danger +96 V !)', 'بدون دايود حماية (+96V خطر!)', 'No Flyback Diode (+96 V spike!)')}
          </button>

          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, reverseBodyTest: !p.reverseBodyTest }))}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
              params.reverseBodyTest
                ? 'bg-amber-600 text-white border-amber-600'
                : 'border-stone-300 dark:border-stone-700'
            }`}
          >
            {params.reverseBodyTest
              ? tr(lang, 'Test inverse S→D actif (Diode corps)', 'اختبار التوصيل العكسي S→D نشط', 'Reverse S→D Body Diode active')
              : tr(lang, 'Tester courant inverse (S → D)', 'اختبار مرور التيار عكسياً (S→D)', 'Test reverse current (S → D)')}
          </button>
        </div>
      );
    }

    if (chapter.id === 7) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between font-semibold">
              <span>{tr(lang, 'Tension d’entrée V_in', 'جهد الدخل V_in', 'Input voltage V_in')}</span>
              <span className="font-mono-num text-amber-700 dark:text-amber-400">{params.boostVin.toFixed(1)} V</span>
            </div>
            <input
              type="range"
              min={3.3}
              max={6.0}
              step={0.1}
              value={params.boostVin}
              onChange={(e) => setParams((p) => ({ ...p, boostVin: Number(e.target.value) }))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between font-semibold">
              <span>{tr(lang, 'Rapport cyclique Boost D', 'نسبة النبضات D', 'Boost Duty Cycle D')}</span>
              <span className="font-mono-num text-sky-700 dark:text-sky-400">
                {params.boostDuty}% → {sim.vout.toFixed(1)} V
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={76}
              step={1}
              value={params.boostDuty}
              onChange={(e) => setParams((p) => ({ ...p, boostDuty: Number(e.target.value) }))}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </label>
        </div>
      );
    }

    // Chapter 8
    if (params.exampleId === 'electronic-dc-load') {
      return (
        <label className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between font-medium">
            <span>{tr(lang, 'Consigne de courant constant I_D', 'ضبط التيار الثابت المسحوب I_D', 'Constant-Current Sink Setpoint I_D')}</span>
            <span className="font-mono-num text-amber-700 dark:text-amber-400">
              {params.targetCurrentA.toFixed(2)} A · P = {sim.powerW.toFixed(1)} W
            </span>
          </div>
          <input
            type="range"
            min={0.2}
            max={3.5}
            step={0.1}
            value={params.targetCurrentA}
            onChange={(e) => setParams((p) => ({ ...p, targetCurrentA: Number(e.target.value) }))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </label>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'FWD', fr: 'Avant (Q1+Q4)', ar: 'أمام (Q1+Q4)', en: 'Forward (Q1+Q4)' },
            { id: 'REV', fr: 'Arrière (Q3+Q2)', ar: 'خلف (Q3+Q2)', en: 'Reverse (Q3+Q2)' },
            { id: 'BRAKE', fr: 'Freinage (Q2+Q4)', ar: 'كبح (Q2+Q4)', en: 'Brake (Q2+Q4)' },
            { id: 'COAST', fr: 'Roue libre (OFF)', ar: 'توقف حر', en: 'Coast (OFF)' },
          ] as const
        ).map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => {
              playRelayClick(muted, st.id === 'FWD' || st.id === 'REV');
              setParams((p) => ({ ...p, hbridgeState: st.id }));
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
              params.hbridgeState === st.id
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
            }`}
          >
            {st[lang]}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Chapter Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist">
          {chapters.map((ch) => {
            const active = ch.id === chapter.id;
            return (
              <button
                key={ch.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  playPageFlip(muted);
                  onSelectChapter(ch.id, ch.examples[0]?.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-stone-900 text-white dark:bg-sky-400 dark:text-stone-950'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-stone-800'
                }`}
              >
                <span className="font-mono-num me-1">{ch.id}.</span>
                <span className="hidden sm:inline">{ch.title[lang].replace(/^\d+\.\s*/, '')}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!teacherMode && (
            <button
              type="button"
              onClick={() => setWideReading((w) => !w)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                wideReading
                  ? 'bg-sky-600 text-white border-sky-600'
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
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer shrink-0"
            aria-label={muted ? tr(lang, 'Activer le son', 'تشغيل الصوت', 'Unmute') : tr(lang, 'Couper le son', 'كتم الصوت', 'Mute')}
          >
            {muted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
          </button>
          <button
            type="button"
            disabled={chapter.id <= 1}
            onClick={() => {
              const prevCh = chapters.find((c) => c.id === chapter.id - 1);
              if (prevCh) {
                playPageFlip(muted);
                onSelectChapter(prevCh.id, prevCh.examples[0]?.id);
              }
            }}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 disabled:opacity-40 cursor-pointer shrink-0"
            aria-label={tr(lang, 'Précédent', 'السابق', 'Previous')}
          >
            {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            type="button"
            disabled={chapter.id >= chapters.length}
            onClick={() => {
              const nextCh = chapters.find((c) => c.id === chapter.id + 1);
              if (nextCh) {
                playPageFlip(muted);
                onSelectChapter(nextCh.id, nextCh.examples[0]?.id);
              }
            }}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 disabled:opacity-40 cursor-pointer shrink-0"
            aria-label={tr(lang, 'Suivant', 'التالي', 'Next')}
          >
            {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main 2-Zone Pedagogical Sandbox */}
      <div className={`grid grid-cols-1 ${teacherMode || wideReading ? '' : 'lg:grid-cols-12'} gap-8 items-start`}>
        {/* LEFT COLUMN: Theory, Formula, Examples, Quiz */}
        {!teacherMode && (
          <section className={`${wideReading ? 'w-full max-w-5xl mx-auto' : 'lg:col-span-6'} flex flex-col gap-6`}>
            <div>
              <div className="text-xs font-mono-num text-sky-700 dark:text-sky-400">
                {tr(lang, `MOSFET · Chapitre ${chapter.id} / ${chapters.length}`, `الموسفيت · الفصل ${chapter.id} / ${chapters.length}`, `MOSFET · Chapter ${chapter.id} / ${chapters.length}`)}
                {' · '}
                {chapter.pageRef}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mt-1">
                {chapter.title[lang]}
              </h1>
              <p className="text-[15px] text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
                {chapter.subtitle[lang]}
              </p>
            </div>

            {/* Key Law + Formula Vars */}
            <div className="rounded-xl border border-sky-500/40 bg-sky-50/60 dark:bg-sky-950/20 p-4 flex flex-col gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  {tr(lang, 'Loi fondamentale à retenir', 'القانون الأساسي', 'Key Law to Remember')}
                </div>
                <div className="font-mono-num text-base font-bold text-stone-900 dark:text-sky-200 mt-1" dir="ltr">
                  {chapter.formula}
                </div>
              </div>

              {chapter.formulaVars.length > 0 && (
                <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-sky-500/20 text-xs">
                  {chapter.formulaVars.map((v) => (
                    <div key={v.symbol} className="flex items-baseline justify-between gap-2">
                      <span className="font-mono-num font-bold text-sky-700 dark:text-sky-400 shrink-0" dir="ltr">
                        {v.symbol}
                      </span>
                      <span className="text-stone-600 dark:text-stone-300">{v.meaning[lang]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[15px] text-stone-700 dark:text-stone-200 leading-7 space-y-3">
              {chapter.theory.map((para, idx) => (
                <p key={idx}>{para[lang]}</p>
              ))}
            </div>

            {/* Practical Examples */}
            <div className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {tr(lang, 'Montages pratiques du chapitre', 'دارات هذا الفصل التطبيقية', 'Chapter Practical Circuits')}
              </h2>
              <div className="flex flex-col gap-2">
                {chapter.examples.map((ex) => {
                  const selected = params.exampleId === ex.id;
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => handleSelectExample(ex.id)}
                      className={`text-start rounded-xl border p-3.5 transition-colors cursor-pointer ${
                        selected
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 dark:border-sky-500/70'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                          {ex.title[lang]}
                        </span>
                        <span className="text-[11px] font-mono-num text-stone-500 shrink-0">
                          {ex.pageRef}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                        {ex.summary[lang]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {(() => {
              const ex = chapter.examples.find((e) => e.id === params.exampleId) || chapter.examples[0];
              return ex ? <ExampleOperationBox example={ex} lang={lang} accent="sky" /> : null;
            })()}

            {/* Step-by-step Voltage Calculation Breakdown */}
            <VoltageCalculationCard
              report={computeMosfetVoltageSteps(params, sim, lang)}
              lang={lang}
              accent="sky"
            />

            {/* Predict - Observe - Explain Quiz */}
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <HelpCircle className="w-4 h-4" />
                <span>{tr(lang, 'Prédire · Observer · Expliquer', 'توقّع · لاحظ · فسّر', 'Predict · Observe · Explain')}</span>
              </div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {chapter.prediction.question[lang]}
              </p>
              <div className="flex flex-col gap-1.5">
                {chapter.prediction.options.map((c, idx) => {
                  const chosen = selectedChoice === idx;
                  const isCorrect = idx === chapter.prediction.correctIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedChoice(idx);
                        setQuizRevealed(true);
                      }}
                      className={`text-start px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                        !quizRevealed
                          ? 'border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                          : isCorrect
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : chosen
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                          : 'border-stone-200 dark:border-stone-800 opacity-60'
                      }`}
                    >
                      {c[lang]}
                    </button>
                  );
                })}
              </div>
              {quizRevealed && (
                <div className="text-xs text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-950 rounded-lg p-3 border border-stone-200 dark:border-stone-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{chapter.prediction.explanation[lang]}</span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 text-xs text-stone-700 dark:text-amber-200 flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{chapter.teacherNote[lang]}</span>
            </div>
          </section>
        )}

        {/* RIGHT COLUMN: Interactive Workbench */}
        <section className={`${teacherMode || wideReading ? 'w-full max-w-5xl mx-auto' : 'lg:col-span-6 lg:sticky lg:top-20'} flex flex-col gap-4`}>
          {/* 3-Tab Stage Switcher + Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-1 bg-stone-200/80 dark:bg-stone-800/80 rounded-lg">
              {(
                [
                  { id: 'board3d', icon: Cpu, fr: 'Platine 3D', ar: 'اللوحة 3D', en: '3D Board' },
                  { id: 'schematic', icon: AlertTriangle, fr: 'Schéma & Oscillo', ar: 'المخطط والراسم', en: 'Schematic & Scope' },
                  { id: 'analogy', icon: Droplets, fr: 'Analogie', ar: 'التشبيه المائي', en: 'Analogy' },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = stageView === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStageView(tab.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab[lang]}</span>
                  </button>
                );
              })}
            </div>

            {teacherMode && (
              <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {chapter.title[lang]}
              </div>
            )}

            <button
              type="button"
              onClick={() => setParams(buildMosfetParamsForChapter(chapter.id, params.exampleId))}
              className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{tr(lang, 'Réinitialiser', 'إعادة ضبط', 'Reset')}</span>
            </button>
          </div>

          {stageView === 'board3d' && (
            <MosfetBoard3D params={params} sim={sim} lang={lang} onQuickAction={handleQuickAction} />
          )}
          {stageView === 'schematic' && <MosfetSchematicScope params={params} sim={sim} lang={lang} />}
          {stageView === 'analogy' && <MosfetAnalogyView params={params} sim={sim} lang={lang} />}

          {/* Controls */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/75 p-4 flex flex-col gap-3">
            {renderControls()}
          </div>

          {/* 4 Live Readout Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-3">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">V_GS / I_G</div>
              <div className="font-mono-num text-base font-bold text-sky-700 dark:text-sky-400 mt-0.5" dir="ltr">
                {sim.vgs.toFixed(1)} V · {sim.igNA.toFixed(1)} nA
              </div>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-3">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">R_DS(on)</div>
              <div className="font-mono-num text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5" dir="ltr">
                {sim.rdsOhms >= 100
                  ? '∞ (OFF)'
                  : sim.rdsOhms < 1
                  ? `${(sim.rdsOhms * 1000).toFixed(0)} mΩ`
                  : `${sim.rdsOhms.toFixed(2)} Ω`}
              </div>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-3">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">I_D / V_DS</div>
              <div className="font-mono-num text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5" dir="ltr">
                {sim.idA.toFixed(2)} A · {sim.vds.toFixed(1)} V
              </div>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-3">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                {tr(lang, 'Pertes / T°', 'الحرارة / القدرة', 'Loss / Temp')}
              </div>
              <div
                className={`font-mono-num text-base font-bold mt-0.5 ${
                  sim.tempC > 95 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'
                }`}
                dir="ltr"
              >
                {sim.powerW.toFixed(2)} W · {Math.round(sim.tempC)} °C
              </div>
            </div>
          </div>

          {/* Live Status & Warning */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/60 px-4 py-3 text-xs flex flex-col gap-1.5">
            <div className="font-semibold text-stone-800 dark:text-stone-100">{statusText}</div>
            {warningText && (
              <div className="text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{warningText}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
