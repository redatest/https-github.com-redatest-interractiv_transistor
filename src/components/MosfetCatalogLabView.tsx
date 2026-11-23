import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Droplets,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CatalogCircuit, Lang, tr } from '../types';
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

interface Props {
  circuits: CatalogCircuit[];
  activeCircuitId: string;
  onSelectCircuit: (circuitId: string) => void;
  onBackToCatalog: () => void;
  lang: Lang;
  muted: boolean;
  onToggleMute: () => void;
}

type StageView = 'board3d' | 'schematic' | 'analogy';

function buildInitialCatalogParams(circuitId: string): MosfetSimParams {
  switch (circuitId) {
    case 'mos-floating-touch':
      return createDefaultMosfetParams({ catalogId: circuitId, pullDown1M: false, gateLatched: false });
    case 'mos-5v-trap':
      return createDefaultMosfetParams({ catalogId: circuitId, fetModel: 'irf540n', vgs: 5.0, loadCurrentA: 8.0 });
    case 'mos-pmos-highside':
      return createDefaultMosfetParams({ catalogId: circuitId, fetPolarity: 'PMOS', highSideSwitchOn: true });
    case 'mos-reverse-polarity':
      return createDefaultMosfetParams({ catalogId: circuitId, fetPolarity: 'PMOS', batteryReversed: false, loadCurrentA: 4.0 });
    case 'mos-cmos-inverter':
      return createDefaultMosfetParams({ catalogId: circuitId, cmosVin: 0.0, deadTimeEnabled: true });
    case 'mos-night-switch':
      return createDefaultMosfetParams({ catalogId: circuitId, luxLevel: 25 });
    case 'mos-audio-pwm':
      return createDefaultMosfetParams({ catalogId: circuitId, rgOhms: 100, pwmFreqKHz: 25, pwmDuty: 65 });
    case 'mos-flyback-clamp':
      return createDefaultMosfetParams({ catalogId: circuitId, flybackInstalled: false, reverseBodyTest: false });
    case 'mos-boost-12v':
      return createDefaultMosfetParams({ catalogId: circuitId, boostVin: 5.0, boostDuty: 58 });
    case 'mos-hbridge-drive':
      return createDefaultMosfetParams({ catalogId: circuitId, hbridgeState: 'FWD' });
    case 'mos-dc-load':
      return createDefaultMosfetParams({ catalogId: circuitId, targetCurrentA: 1.5, vdd: 12.0 });
    case 'mos-multimeter-tester':
      return createDefaultMosfetParams({ catalogId: circuitId, testerType: 'nmos_gds', testerGateCharged: false, blackPin: 2, redPin: 3 });
    default:
      return createDefaultMosfetParams({ catalogId: circuitId });
  }
}

export const MosfetCatalogLabView: React.FC<Props> = ({
  circuits,
  activeCircuitId,
  onSelectCircuit,
  onBackToCatalog,
  lang,
  muted,
  onToggleMute,
}) => {
  const index = Math.max(0, circuits.findIndex((c) => c.id === activeCircuitId));
  const circuit = circuits[index] ?? circuits[0];

  const [stageView, setStageView] = useState<StageView>('board3d');
  const [params, setParams] = useState<MosfetSimParams>(() => buildInitialCatalogParams(circuit.id));

  useEffect(() => {
    setParams(buildInitialCatalogParams(circuit.id));
  }, [circuit.id]);

  const sim = useMemo(() => computeMosfetSimulation(params), [params]);

  const statusText = lang === 'fr' ? sim.statusFr : lang === 'en' ? sim.statusEn : sim.statusAr;
  const warningText = lang === 'fr' ? sim.warningFr : lang === 'en' ? sim.warningEn : sim.warningAr;

  const handleQuickAction = (action: string) => {
    if (action === 'touch-gate') {
      playTickSound(muted, 920, 0.04);
      setParams((p) => ({ ...p, fingerTouchGate: true, gateLatched: true }));
      window.setTimeout(() => setParams((p) => ({ ...p, fingerTouchGate: false })), 900);
    } else if (action === 'pulse') {
      playRelayClick(muted, !sim.conducting);
      setParams((p) => ({ ...p, vgs: p.vgs > 1 ? 0 : 5 }));
    }
  };

  const renderControls = () => {
    const cid = circuit.id;
    if (cid === 'mos-floating-touch') {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleQuickAction('touch-gate')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
          >
            {tr(lang, 'Effleurer pastille +5 V (Charger C_iss)', 'لمس +5V لشحن البوابة', 'Tap +5 V pad (Charge C_iss)')}
          </button>
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, gateLatched: false, fingerTouchGate: false }))}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-stone-300 dark:border-stone-700 cursor-pointer"
          >
            {tr(lang, 'Effleurer pastille GND (0 V)', 'لمس الأرضي 0V للإطفاء', 'Tap GND pad (0 V)')}
          </button>
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, pullDown1M: !p.pullDown1M }))}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
              params.pullDown1M ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600'
            }`}
          >
            {params.pullDown1M ? '1 MΩ Pull-Down ON' : '1 MΩ Pull-Down OFF'}
          </button>
        </div>
      );
    }

    if (cid === 'mos-5v-trap') {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {(['irf540n', 'irlz44n'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setParams((p) => ({ ...p, fetModel: m }))}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  params.fetModel === m
                    ? 'bg-stone-900 text-white dark:bg-sky-400 dark:text-stone-950 border-transparent'
                    : 'border-stone-300 dark:border-stone-700'
                }`}
              >
                {FET_SPECS[m].name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold">
                <span>V_GS</span>
                <span className="font-mono-num text-sky-600 dark:text-sky-400">{params.vgs.toFixed(1)} V</span>
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
            <label className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold">
                <span>I_load</span>
                <span className="font-mono-num text-amber-600 dark:text-amber-400">{params.loadCurrentA.toFixed(1)} A</span>
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

    if (cid === 'mos-pmos-highside') {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playRelayClick(muted, !params.highSideSwitchOn);
              setParams((p) => ({ ...p, highSideSwitchOn: !p.highSideSwitchOn }));
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
              params.highSideSwitchOn ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-stone-200 dark:bg-stone-800 border-transparent'
            }`}
          >
            {params.highSideSwitchOn
              ? tr(lang, 'Grille tirée à 0 V (P-MOS ON)', 'البوابة عند 0V (P-MOS شغّال)', 'Gate pulled to 0 V (P-MOS ON)')
              : tr(lang, 'Grille remontée à +12 V (P-MOS OFF)', 'البوابة عند +12V (P-MOS مقطوع)', 'Gate pulled to +12 V (P-MOS OFF)')}
          </button>
        </div>
      );
    }

    if (cid === 'mos-reverse-polarity') {
      return (
        <button
          type="button"
          onClick={() => {
            playRelayClick(muted, params.batteryReversed);
            setParams((p) => ({ ...p, batteryReversed: !p.batteryReversed }));
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
            params.batteryReversed ? 'bg-rose-600 text-white border-rose-600' : 'bg-emerald-600 text-white border-emerald-600'
          }`}
        >
          {params.batteryReversed
            ? tr(lang, 'Batterie INVERSÉE (−12 V) · Rétablir', 'البطارية معكوسة (−12V) · إصلاح', 'Battery REVERSED (−12 V) · Fix')
            : tr(lang, 'Batterie NORMALE (+12 V) · Inverser', 'البطارية صحيحة (+12V) · عكس', 'Battery NORMAL (+12 V) · Reverse')}
        </button>
      );
    }

    if (cid === 'mos-cmos-inverter') {
      return (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between font-semibold">
              <span>{tr(lang, 'Entrée logique V_in', 'دخل البوابة المنطقية V_in', 'Logic Input V_in')}</span>
              <span className="font-mono-num text-sky-600 dark:text-sky-400">{params.cmosVin.toFixed(1)} V</span>
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
            className={`w-fit px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
              params.deadTimeEnabled ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600'
            }`}
          >
            {params.deadTimeEnabled ? 'Dead-Time ON' : 'Dead-Time OFF'}
          </button>
        </div>
      );
    }

    if (cid === 'mos-night-switch') {
      return (
        <label className="flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between font-semibold">
            <span>{tr(lang, 'Luminosité ambiante (LDR)', 'شدة الإضاءة (LDR)', 'Ambient light (LDR)')}</span>
            <span className="font-mono-num text-amber-600 dark:text-amber-400">{params.luxLevel}% (≤ 40% ON)</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={params.luxLevel}
            onChange={(e) => setParams((p) => ({ ...p, luxLevel: Number(e.target.value) }))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </label>
      );
    }

    if (cid === 'mos-audio-pwm') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className="flex flex-col gap-1">
            <div className="flex justify-between font-semibold">
              <span>R_G</span>
              <span className="font-mono-num">{params.rgOhms} Ω</span>
            </div>
            <input type="range" min={10} max={2200} step={10} value={params.rgOhms} onChange={(e) => setParams((p) => ({ ...p, rgOhms: Number(e.target.value) }))} className="w-full accent-sky-600 cursor-pointer" />
          </label>
          <label className="flex flex-col gap-1">
            <div className="flex justify-between font-semibold">
              <span>f_PWM</span>
              <span className="font-mono-num">{params.pwmFreqKHz} kHz</span>
            </div>
            <input type="range" min={1} max={100} value={params.pwmFreqKHz} onChange={(e) => setParams((p) => ({ ...p, pwmFreqKHz: Number(e.target.value) }))} className="w-full accent-amber-600 cursor-pointer" />
          </label>
          <label className="flex flex-col gap-1">
            <div className="flex justify-between font-semibold">
              <span>PWM</span>
              <span className="font-mono-num">{params.pwmDuty}%</span>
            </div>
            <input type="range" min={10} max={95} step={5} value={params.pwmDuty} onChange={(e) => setParams((p) => ({ ...p, pwmDuty: Number(e.target.value) }))} className="w-full accent-emerald-600 cursor-pointer" />
          </label>
        </div>
      );
    }

    if (cid === 'mos-flyback-clamp') {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              playRelayClick(muted, !params.flybackInstalled);
              setParams((p) => ({ ...p, flybackInstalled: !p.flybackInstalled }));
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
              params.flybackInstalled ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600'
            }`}
          >
            {params.flybackInstalled
              ? tr(lang, 'Diode 1N5819 : ACTIVE (Pic 12,7 V)', 'دايود 1N5819: مركّب (12.7V)', '1N5819 Flyback: ACTIVE (12.7 V)')
              : tr(lang, 'Sans diode : SURTENSION +96 V !', 'بدون دايود: قفزة +96V!', 'No Diode: +96 V SPIKE!')}
          </button>
        </div>
      );
    }

    if (cid === 'mos-boost-12v') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex flex-col gap-1">
            <div className="flex justify-between font-semibold">
              <span>V_in</span>
              <span className="font-mono-num">{params.boostVin.toFixed(1)} V</span>
            </div>
            <input type="range" min={3.3} max={6.0} step={0.1} value={params.boostVin} onChange={(e) => setParams((p) => ({ ...p, boostVin: Number(e.target.value) }))} className="w-full accent-amber-600 cursor-pointer" />
          </label>
          <label className="flex flex-col gap-1">
            <div className="flex justify-between font-semibold">
              <span>Duty D</span>
              <span className="font-mono-num">{params.boostDuty}%</span>
            </div>
            <input type="range" min={5} max={76} value={params.boostDuty} onChange={(e) => setParams((p) => ({ ...p, boostDuty: Number(e.target.value) }))} className="w-full accent-sky-600 cursor-pointer" />
          </label>
        </div>
      );
    }

    if (cid === 'mos-hbridge-drive') {
      return (
        <div className="flex flex-wrap gap-2">
          {(['FWD', 'REV', 'BRAKE', 'COAST'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                playRelayClick(muted, st === 'FWD' || st === 'REV');
                setParams((p) => ({ ...p, hbridgeState: st }));
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
                params.hbridgeState === st
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'border-stone-300 dark:border-stone-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      );
    }

    if (cid === 'mos-dc-load') {
      return (
        <label className="flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between font-semibold">
            <span>{tr(lang, 'Courant constant cible I_D', 'التيار الثابت المطلوب I_D', 'Target Sink Current I_D')}</span>
            <span className="font-mono-num text-amber-600 dark:text-amber-400">{params.targetCurrentA.toFixed(2)} A</span>
          </div>
          <input type="range" min={0.2} max={3.5} step={0.1} value={params.targetCurrentA} onChange={(e) => setParams((p) => ({ ...p, targetCurrentA: Number(e.target.value) }))} className="w-full accent-amber-600 cursor-pointer" />
        </label>
      );
    }

    // mos-multimeter-tester
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'nmos_gds', label: 'N-MOS (G-D-S)' },
              { id: 'pmos_gds', label: 'P-MOS (G-D-S)' },
              { id: 'shorted_gate', label: tr(lang, 'MOSFET HS (Percé)', 'موسفيت تالف', 'Blown MOSFET') },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setParams((p) => ({ ...p, testerType: t.id, testerGateCharged: false }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                params.testerType === t.id ? 'bg-stone-900 text-white dark:bg-sky-400 dark:text-stone-950 border-transparent' : 'border-stone-300 dark:border-stone-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span>{tr(lang, 'Noir (+):', 'أسود (+):', 'Black (+):')}</span>
            {([1, 2, 3] as const).map((pin) => (
              <button
                key={pin}
                type="button"
                onClick={() => setParams((p) => ({ ...p, blackPin: pin }))}
                className={`px-2 py-1 rounded border font-mono-num cursor-pointer ${params.blackPin === pin ? 'bg-stone-900 text-white' : 'border-stone-300 dark:border-stone-700'}`}
              >
                {pin === 1 ? 'G' : pin === 2 ? 'D' : 'S'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span>{tr(lang, 'Rouge (−):', 'أحمر (−):', 'Red (−):')}</span>
            {([1, 2, 3] as const).map((pin) => (
              <button
                key={pin}
                type="button"
                onClick={() => setParams((p) => ({ ...p, redPin: pin }))}
                className={`px-2 py-1 rounded border font-mono-num cursor-pointer ${params.redPin === pin ? 'bg-rose-600 text-white' : 'border-stone-300 dark:border-stone-700'}`}
              >
                {pin === 1 ? 'G' : pin === 2 ? 'D' : 'S'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              playTickSound(muted, 900, 0.04);
              setParams((p) => ({ ...p, testerGateCharged: !p.testerGateCharged }));
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold border cursor-pointer ${
              params.testerGateCharged ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-sky-600 text-white border-sky-600'
            }`}
          >
            {params.testerGateCharged
              ? tr(lang, 'Décharger Grille (G↔S)', 'تفريغ البوابة (G↔S)', 'Discharge Gate (G↔S)')
              : tr(lang, 'Toucher Grille (+ sur G)', 'شحن البوابة (+ على G)', 'Tap Gate (+ on G)')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Strip */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 px-4 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{tr(lang, 'Catalogue MOSFET', 'دليل الموسفيت', 'MOSFET Catalog')}</span>
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-num text-stone-500 dark:text-stone-400">
              <span>{circuit.transistors.join(' + ')}</span>
              <span aria-hidden="true">·</span>
              <span>{circuit.supply}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{circuit.parts.join(' · ')}</span>
            </div>
            <h1 className="text-lg font-bold text-stone-900 dark:text-stone-50 truncate mt-0.5">
              {circuit.titleBi[lang]}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              const prevIdx = (index - 1 + circuits.length) % circuits.length;
              playPageFlip(muted);
              onSelectCircuit(circuits[prevIdx].id);
            }}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 cursor-pointer"
          >
            {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <span className="text-xs font-mono-num font-bold px-1">
            {index + 1} / {circuits.length}
          </span>
          <button
            type="button"
            onClick={() => {
              const nextIdx = (index + 1) % circuits.length;
              playPageFlip(muted);
              onSelectCircuit(circuits[nextIdx].id);
            }}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 cursor-pointer"
          >
            {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setParams(buildInitialCatalogParams(circuit.id))}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
          </button>
        </div>
      </div>

      {/* Stage Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-200/75 dark:bg-stone-800/80 rounded-lg w-fit">
        {(
          [
            { id: 'board3d', icon: Cpu, fr: 'Platine 3D', ar: 'اللوحة 3D', en: '3D Board' },
            { id: 'schematic', icon: AlertTriangle, fr: 'Schéma & Oscillo', ar: 'المخطط والراسم', en: 'Schematic & Scope' },
            { id: 'analogy', icon: Droplets, fr: 'Analogie', ar: 'التشبيه المائي', en: 'Analogy' },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStageView(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                stageView === tab.id ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab[lang]}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Stage */}
      {stageView === 'board3d' && <MosfetBoard3D params={params} sim={sim} lang={lang} onQuickAction={handleQuickAction} />}
      {stageView === 'schematic' && <MosfetSchematicScope params={params} sim={sim} lang={lang} />}
      {stageView === 'analogy' && <MosfetAnalogyView params={params} sim={sim} lang={lang} />}

      {/* Circuit Explanation + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5 flex flex-col gap-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            {tr(lang, 'Principe du montage', 'مبدأ الدارة', 'Circuit Principle')}
          </div>
          <p className="text-[15px] text-stone-700 dark:text-stone-200 leading-7">{circuit.concept[lang]}</p>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5 flex flex-col gap-4">
          {renderControls()}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
            <div>
              <div className="text-stone-500">V_GS / I_G</div>
              <div className="font-mono-num font-bold text-sky-700 dark:text-sky-400" dir="ltr">
                {sim.vgs.toFixed(1)} V · {sim.igNA.toFixed(1)} nA
              </div>
            </div>
            <div>
              <div className="text-stone-500">R_DS(on)</div>
              <div className="font-mono-num font-bold" dir="ltr">
                {sim.rdsOhms >= 100 ? '∞' : sim.rdsOhms < 1 ? `${(sim.rdsOhms * 1000).toFixed(0)} mΩ` : `${sim.rdsOhms.toFixed(2)} Ω`}
              </div>
            </div>
            <div>
              <div className="text-stone-500">I_D</div>
              <div className="font-mono-num font-bold text-emerald-700 dark:text-emerald-400" dir="ltr">
                {sim.idA.toFixed(2)} A
              </div>
            </div>
            <div>
              <div className="text-stone-500">{tr(lang, 'Pertes / T°', 'القدرة / الحرارة', 'Heat / Temp')}</div>
              <div className="font-mono-num font-bold text-amber-700 dark:text-amber-400" dir="ltr">
                {sim.powerW.toFixed(2)} W · {Math.round(sim.tempC)} °C
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/60 px-4 py-3 text-xs flex flex-col gap-1">
        <div className="font-semibold">{statusText}</div>
        {warningText && (
          <div className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{warningText}</span>
          </div>
        )}
      </div>
    </div>
  );
};
