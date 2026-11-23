import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Droplets,
  Eye,
  EyeOff,
  Hand,
  Lightbulb,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CatalogCircuit, Lang, tr } from '../types';

type StageView = 'board3d' | 'schematic' | 'analogy';
import {
  computeCatalogSimulation,
  createDefaultSimParams,
  fingerResistance,
  getLieDetector2State,
  getLieDetector5TState,
  SimParams,
} from '../utils/physics';
import { playPageFlip, playRelayClick, playTickSound } from '../utils/sound';
import { InteractiveBoard3D } from './InteractiveBoard3D';
import { LiveSchematicScope } from './LiveSchematicScope';
import { WaterValveAnalogy } from './WaterValveAnalogy';

interface Props {
  circuits: CatalogCircuit[];
  activeCircuitId: string;
  onSelectCircuit: (circuitId: string) => void;
  onBackToCatalog: () => void;
  lang: Lang;
  muted: boolean;
  onToggleMute: () => void;
}

function buildInitialParams(circuitId: string): SimParams {
  switch (circuitId) {
    case 'courtesy-light':
      return createDefaultSimParams({
        catalogId: circuitId,
        doorOpen: true,
        capTriggered: false,
        capCharge: 0,
        capValueUF: 47,
      });
    case 'lie-detector-1':
      return createDefaultSimParams({
        catalogId: circuitId,
        pressure: 72,
        skinMoisture: 'dry',
      });
    case 'lie-detector-2':
      return createDefaultSimParams({
        catalogId: circuitId,
        pressure: 45,
        skinMoisture: 'dry',
        vr1Threshold: 50,
      });
    case 'lie-detector-staircase':
      return createDefaultSimParams({
        catalogId: circuitId,
        pressure: 62,
        skinMoisture: 'dry',
      });
    case 'lie-detector-4':
      return createDefaultSimParams({
        catalogId: circuitId,
        pressure: 72,
        skinMoisture: 'dry',
      });
    case 'lie-detector-5t':
      return createDefaultSimParams({
        catalogId: circuitId,
        pressure: 65,
        skinMoisture: 'dry',
        pot100k: 75,
      });
    case 'schmitt-trigger':
      return createDefaultSimParams({
        catalogId: circuitId,
        luxLevel: 65,
        schmittState: false,
      });
    case 'night-light':
      return createDefaultSimParams({
        catalogId: circuitId,
        luxLevel: 28,
        supplySelect6or9: 9,
      });
    case 'led-on-1v5':
      return createDefaultSimParams({
        catalogId: circuitId,
        cellVoltage: 1.5,
        pumpPhase: 'B',
      });
    case 'self-bias-ce':
      return createDefaultSimParams({
        catalogId: circuitId,
        rbSlider: 67,
        acSignalOn: true,
        acAmplitude: 2.0,
      });
    default:
      return createDefaultSimParams({ catalogId: circuitId });
  }
}

export const CatalogLabView: React.FC<Props> = ({
  circuits,
  activeCircuitId,
  onSelectCircuit,
  onBackToCatalog,
  lang,
  muted,
  onToggleMute,
}) => {
  const index = Math.max(
    0,
    circuits.findIndex((c) => c.id === activeCircuitId)
  );
  const circuit = circuits[index] ?? circuits[0];

  const [stageView, setStageView] = useState<StageView>('board3d');
  const [params, setParams] = useState<SimParams>(() => buildInitialParams(circuit.id));
  const [pumpAuto, setPumpAuto] = useState<boolean>(true);

  useEffect(() => {
    setParams(buildInitialParams(circuit.id));
    setPumpAuto(true);
  }, [circuit.id]);

  const sim = useMemo(() => computeCatalogSimulation(params), [params]);

  // Courtesy light capacitor fade timer (door closed -> fills capCharge 0 -> 1)
  useEffect(() => {
    if (circuit.id !== 'courtesy-light') return;
    if (params.doorOpen || !params.capTriggered || params.capCharge >= 1) return;
    const step = 0.025 * (100 / Math.max(10, params.capValueUF));
    const timer = window.setInterval(() => {
      setParams((prev) => {
        if (prev.doorOpen || !prev.capTriggered || prev.capCharge >= 1) return prev;
        return { ...prev, capCharge: Math.min(1, prev.capCharge + step) };
      });
    }, 60);
    return () => window.clearInterval(timer);
  }, [circuit.id, params.doorOpen, params.capTriggered, params.capCharge, params.capValueUF]);

  // Oscillators, chaser, ticking bomb, bike flasher, lie-detector-1 speaker pulse
  useEffect(() => {
    const isOsc =
      circuit.id === 'robot-man' ||
      circuit.id === 'three-led-chaser' ||
      circuit.id === 'ticking-bomb' ||
      circuit.id === 'bike-flasher-air' ||
      (circuit.id === 'lie-detector-1' && sim.conducting);
    if (!isOsc) return;

    const isSiren = circuit.id === 'ticking-bomb' && params.sirenMode === 'siren';
    const intervalMs =
      circuit.id === 'lie-detector-1'
        ? Math.max(140, Math.min(580, Math.round(95000 / Math.max(130, sim.freqHz ?? 200))))
        : isSiren
        ? 140
        : Math.max(180, Math.min(950, params.oscSpeedR * 26));

    const timer = window.setInterval(() => {
      setParams((prev) => {
        const nextPhase = (prev.oscPhase + 1) % 6;
        if (circuit.id === 'ticking-bomb') {
          if (prev.sirenMode === 'siren') {
            playTickSound(muted, 480 + (nextPhase % 3) * 180, 0.08);
          } else {
            playTickSound(muted, nextPhase % 2 === 0 ? 960 : 720, 0.035);
          }
        } else if (circuit.id === 'lie-detector-1' && sim.freqHz) {
          playTickSound(muted, Math.min(1800, sim.freqHz), 0.038);
        }
        return { ...prev, oscPhase: nextPhase };
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [circuit.id, params.oscSpeedR, params.sirenMode, muted, sim.conducting, sim.freqHz]);

  // 1.5V charge pump auto-cycle unless user switches to manual hold
  useEffect(() => {
    if (circuit.id !== 'led-on-1v5' || !pumpAuto) return;
    const timer = window.setInterval(() => {
      setParams((prev) => ({
        ...prev,
        pumpPhase: prev.pumpPhase === 'A' ? 'B' : 'A',
      }));
    }, 950);
    return () => window.clearInterval(timer);
  }, [circuit.id, pumpAuto]);

  // Sound triggered LED decay timer
  useEffect(() => {
    if (circuit.id !== 'sound-triggered-led' || !params.clapActive) return;
    const timer = window.setTimeout(() => {
      setParams((prev) => ({ ...prev, clapActive: false }));
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [circuit.id, params.clapActive]);

  const handleSelectPrev = () => {
    const prevIdx = (index - 1 + circuits.length) % circuits.length;
    playPageFlip(muted);
    onSelectCircuit(circuits[prevIdx].id);
  };

  const handleSelectNext = () => {
    const nextIdx = (index + 1) % circuits.length;
    playPageFlip(muted);
    onSelectCircuit(circuits[nextIdx].id);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'latch-on') {
      playRelayClick(muted, true);
      setParams((p) => ({ ...p, latchedOn: true }));
    } else if (action === 'latch-off') {
      playRelayClick(muted, false);
      setParams((p) => ({ ...p, latchedOn: false }));
    }
  };

  const warningText =
    lang === 'fr' ? sim.warningFr : lang === 'en' ? sim.warningEn : sim.warningAr;
  const statusText =
    lang === 'fr' ? sim.statusFr : lang === 'en' ? sim.statusEn : sim.statusAr;

  const formatGain = (b: number) => {
    if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(0)}M×`;
    if (b >= 1000) return `${(b / 1000).toFixed(0)}k×`;
    return `${Math.round(b)}×`;
  };

  const renderControls = () => {
    const cid = circuit.id;

    if (
      cid === 'worlds-simplest' ||
      cid === 'second-simplest' ||
      cid === 'lie-detector-1' ||
      cid === 'lie-detector-staircase' ||
      cid === 'lie-detector-4'
    ) {
      const rfKOhm = Math.round(fingerResistance(params.pressure, params.skinMoisture ?? 'dry') / 1000);
      return (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="cat-pressure" className="font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-1.5">
                <Hand className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{tr(lang, 'Pression des doigts sur la piste', 'قوة ضغط الأصابع على المسار', 'Finger pressure on pads')}</span>
              </label>
              <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
                {params.pressure}% · {tr(lang, 'R_peau', 'مقاومة الجلد', 'R_skin')} ≈ {rfKOhm} kΩ
              </span>
            </div>
            <input
              id="cat-pressure"
              type="range"
              min={0}
              max={100}
              value={params.pressure}
              onChange={(e) => setParams((p) => ({ ...p, pressure: Number(e.target.value) }))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {tr(lang, 'État de la peau :', 'حالة الجلد:', 'Skin state:')}
              </span>
              {(['dry', 'wet'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, skinMoisture: m }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                    (params.skinMoisture ?? 'dry') === m
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {m === 'dry'
                    ? tr(lang, 'Peau sèche', 'جلد جاف', 'Dry skin')
                    : tr(lang, 'Peau humide (÷4 R)', 'جلد رطب', 'Wet skin (÷4 R)')}
                </button>
              ))}
            </div>

            {cid === 'worlds-simplest' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  {tr(lang, 'Alimentation :', 'التغذية:', 'Supply:')}
                </span>
                {([6, 9] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setParams((p) => ({ ...p, supplySelect6or9: v }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                      (params.supplySelect6or9 ?? 9) === v
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    {v} V
                  </button>
                ))}
              </div>
            )}

            {cid === 'lie-detector-1' && (
              <div className="text-xs font-mono-num text-stone-600 dark:text-stone-300">
                {sim.conducting
                  ? `${Math.round(sim.freqHz ?? 0)} Hz (${tr(lang, '≤ 300 kΩ actif', 'نشط ≤ 300kΩ', '≤ 300 kΩ active')})`
                  : tr(lang, 'Seuil détection ≤ 300 kΩ (pressez plus fort)', 'حد الالتقاط ≤ 300kΩ (اضغط أقوى)', 'Detection threshold ≤ 300 kΩ (press harder)')}
              </div>
            )}

            {cid === 'lie-detector-staircase' && (
              <div className="text-xs font-mono-num text-stone-600 dark:text-stone-300">
                {tr(lang, 'Paliers actifs :', 'العتبات المضاءة:', 'Active steps:')} {sim.staircaseLeds} / 4 (0.6 · 1.2 · 1.8 · 2.4 V)
              </div>
            )}

            {cid === 'lie-detector-4' && (
              <div className="text-xs font-mono-num text-stone-600 dark:text-stone-300">
                {tr(lang, 'Paliers actifs (sans diodes) :', 'العتبات المضاءة (بدون دايودات):', 'Active steps (no diodes):')} {sim.staircaseLeds} / 3 (0.95 · 1.55 · 2.15 V)
              </div>
            )}
          </div>
        </div>
      );
    }

    if (cid === 'lie-detector-2') {
      const { rf, vr1Pct, vr1KOhm, rTrip, isFalse } = getLieDetector2State(params);
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="cat-ld2-pressure" className="font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-1.5">
                  <Hand className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{tr(lang, 'Pression / Stress sur les sondes', 'ضغط الأصابع / التوتر', 'Probe pressure / stress')}</span>
                </label>
                <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
                  {params.pressure}% · {(rf / 1000).toFixed(0)} kΩ
                </span>
              </div>
              <input
                id="cat-ld2-pressure"
                type="range"
                min={0}
                max={100}
                value={params.pressure}
                onChange={(e) => {
                  const nextP = Number(e.target.value);
                  setParams((p) => {
                    const prevState = getLieDetector2State(p).isFalse;
                    const nextParams = { ...p, pressure: nextP };
                    const nextState = getLieDetector2State(nextParams).isFalse;
                    if (prevState !== nextState) playRelayClick(muted, nextState);
                    return nextParams;
                  });
                }}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="cat-ld2-vr1" className="font-semibold text-stone-700 dark:text-stone-200">
                  {tr(lang, 'Calibrage VR1 (Pot. 47 kΩ) :', 'معايرة المقاوم VR1 (47kΩ):', 'VR1 calibration (47 kΩ Pot):')}
                </label>
                <span className="font-mono-num font-bold text-sky-700 dark:text-sky-400">
                  {vr1KOhm.toFixed(1)} kΩ (≤ {(rTrip / 1000).toFixed(0)} kΩ)
                </span>
              </div>
              <input
                id="cat-ld2-vr1"
                type="range"
                min={0}
                max={100}
                value={vr1Pct}
                onChange={(e) => {
                  const nextVr1 = Number(e.target.value);
                  setParams((p) => {
                    const prevState = getLieDetector2State(p).isFalse;
                    const nextParams = { ...p, vr1Threshold: nextVr1 };
                    const nextState = getLieDetector2State(nextParams).isFalse;
                    if (prevState !== nextState) playRelayClick(muted, nextState);
                    return nextParams;
                  });
                }}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {tr(lang, 'État de la peau :', 'حالة الجلد:', 'Skin state:')}
              </span>
              {(['dry', 'wet'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() =>
                    setParams((p) => {
                      const prevState = getLieDetector2State(p).isFalse;
                      const nextParams = { ...p, skinMoisture: m };
                      const nextState = getLieDetector2State(nextParams).isFalse;
                      if (prevState !== nextState) playRelayClick(muted, nextState);
                      return nextParams;
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                    (params.skinMoisture ?? 'dry') === m
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {m === 'dry'
                    ? tr(lang, 'Peau sèche', 'جلد جاف', 'Dry skin')
                    : tr(lang, 'Peau humide (÷4 R)', 'جلد رطب', 'Wet skin (÷4 R)')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs font-mono-num font-bold">
              <span className={!isFalse ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-600'}>
                ● L1 TRUE
              </span>
              <span className="text-stone-300 dark:text-stone-700">/</span>
              <span className={isFalse ? 'text-rose-600 dark:text-rose-400' : 'text-stone-400 dark:text-stone-600'}>
                ● L2 FALSE
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (cid === 'lie-detector-5t') {
      const { rf, potPct, vEmitQ1, vWiper, leds } = getLieDetector5TState(params);
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="cat-ld5t-pressure" className="font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-1.5">
                  <Hand className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{tr(lang, 'Pression sur les touch pads', 'الضغط على لوحي اللمس', 'Pressure on touch pads')}</span>
                </label>
                <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
                  {params.pressure}% · {(rf / 1000).toFixed(0)} kΩ
                </span>
              </div>
              <input
                id="cat-ld5t-pressure"
                type="range"
                min={0}
                max={100}
                value={params.pressure}
                onChange={(e) => setParams((p) => ({ ...p, pressure: Number(e.target.value) }))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="cat-ld5t-pot" className="font-semibold text-stone-700 dark:text-stone-200">
                  {tr(lang, 'Potentiomètre 100 kΩ (Émetteur Q1) :', 'المقاوم المتغير 100kΩ (باعث Q1):', '100 kΩ Potentiometer (Q1 Emitter):')}
                </label>
                <span className="font-mono-num font-bold text-sky-700 dark:text-sky-400">
                  {potPct}% · {tr(lang, 'V_curseur', 'V_wiper', 'V_wiper')} {vWiper.toFixed(2)} V
                </span>
              </div>
              <input
                id="cat-ld5t-pot"
                type="range"
                min={10}
                max={100}
                value={potPct}
                onChange={(e) => setParams((p) => ({ ...p, pot100k: Number(e.target.value) }))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {tr(lang, 'État de la peau :', 'حالة الجلد:', 'Skin state:')}
              </span>
              {(['dry', 'wet'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, skinMoisture: m }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                    (params.skinMoisture ?? 'dry') === m
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {m === 'dry'
                    ? tr(lang, 'Peau sèche', 'جلد جاف', 'Dry skin')
                    : tr(lang, 'Peau humide (÷4 R)', 'جلد رطب', 'Wet skin (÷4 R)')}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono-num font-semibold text-stone-600 dark:text-stone-300">
              V_E(Q1)={vEmitQ1.toFixed(2)}V · {leds}/4 LEDs (Q2..Q5) · 6×1N4148
            </div>
          </div>
        </div>
      );
    }

    if (cid === 'eight-million-gain' || cid === 'mains-hum') {
      return (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="cat-prox" className="font-semibold text-stone-700 dark:text-stone-200">
                {cid === 'mains-hum'
                  ? tr(lang, 'Distance antenne ↔ câble secteur', 'المسافة بين الهوائي وسلك الكهرباء', 'Antenna ↔ mains cable distance')
                  : tr(lang, 'Distance objet chargé / main ↔ sonde', 'بُعد اليد / الشحنة الساكنة عن المجسّ', 'Charged object / hand ↔ probe distance')}
              </label>
              <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
                {params.proximityCm} cm
              </span>
            </div>
            <input
              id="cat-prox"
              type="range"
              min={1}
              max={15}
              value={params.proximityCm}
              onChange={(e) => setParams((p) => ({ ...p, proximityCm: Number(e.target.value) }))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {cid === 'mains-hum' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {tr(lang, 'Réseau secteur :', 'تردد الشبكة:', 'Mains frequency:')}
              </span>
              {([50, 60] as const).map((hz) => (
                <button
                  key={hz}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, mainsFreqHz: hz }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                    (params.mainsFreqHz ?? 50) === hz
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {hz} Hz
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (cid === 'plant-watering') {
      return (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="cat-soil" className="font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
                <span>{tr(lang, 'Humidité du substrat', 'رطوبة التربة', 'Soil moisture')}</span>
              </label>
              <span className="font-mono-num font-bold text-sky-700 dark:text-sky-400">
                {params.pressure}%
              </span>
            </div>
            <input
              id="cat-soil"
              type="range"
              min={0}
              max={100}
              value={params.pressure}
              onChange={(e) => setParams((p) => ({ ...p, pressure: Number(e.target.value) }))}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
              {tr(lang, 'Minéralité / Engrais :', 'أملاح التربة:', 'Minerals / Fertilizer:')}
            </span>
            {(
              [
                { id: 'pure', fr: 'Eau distillée (peu conductrice)', ar: 'ماء مقطّر', en: 'Distilled water (low conductivity)' },
                { id: 'normal', fr: 'Terre normale', ar: 'تربة عادية', en: 'Normal soil' },
                { id: 'fertilizer', fr: 'Sol riche en engrais', ar: 'تربة غنية بالأسمدة', en: 'Fertilizer-rich soil' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setParams((p) => ({ ...p, salinity: s.id }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                  (params.salinity ?? 'normal') === s.id
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                }`}
              >
                {s[lang]}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (cid === 'simplest-tester') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {tr(lang, 'Type :', 'النوع:', 'Type:')}
              </span>
              {(['NPN', 'PNP'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, transistorType: t }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-bold border cursor-pointer whitespace-nowrap shrink-0 ${
                    params.transistorType === t
                      ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 border-stone-900 dark:border-amber-500'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, batteryReversed: !p.batteryReversed }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                params.batteryReversed
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
              }`}
            >
              {params.batteryReversed
                ? tr(lang, 'Pile 9 V inversée (−/+)', 'البطارية معكوسة (−/+)', '9 V Battery reversed (−/+)')
                : tr(lang, 'Inverser la pile 9 V (+/−)', 'عكس البطارية (+/−)', 'Reverse 9 V battery (+/−)')}
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {tr(lang, 'Injection panne :', 'محاكاة عطل:', 'Fault injection:')}
              </span>
              {(
                [
                  { id: 'ok', fr: 'Bon', ar: 'سليم', en: 'Good' },
                  { id: 'short', fr: 'Court-circuit C–E', ar: 'قصر C–E', en: 'C–E Short' },
                  { id: 'open', fr: 'Coupé', ar: 'مقطوع', en: 'Open' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, testerFault: f.id }))}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                    (params.testerFault ?? 'ok') === f.id
                      ? f.id === 'ok'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {f[lang]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="cat-tester-p" className="font-semibold text-stone-700 dark:text-stone-200">
                {tr(lang, 'Pression doigt sur la base :', 'ضغط الإصبع على القاعدة:', 'Finger pressure on base:')}
              </label>
              <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">{params.pressure}%</span>
            </div>
            <input
              id="cat-tester-p"
              type="range"
              min={0}
              max={100}
              value={params.pressure}
              onChange={(e) => setParams((p) => ({ ...p, pressure: Number(e.target.value) }))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>
        </div>
      );
    }

    if (cid === 'logic-probe') {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 me-1">
            {tr(lang, 'Pointe de test :', 'ملامسة المجسّ:', 'Test probe tip:')}
          </span>
          {(
            [
              { id: 'FLOAT', fr: 'En l’air (0 mA)', ar: 'عائم (0 mA)', en: 'Floating (0 mA)' },
              { id: 'LOW', fr: 'LOW (0 V → Verte)', ar: 'LOW (0V ← خضراء)', en: 'LOW (0 V → Green)' },
              { id: 'HIGH', fr: 'HIGH (+5 V → Rouge)', ar: 'HIGH (+5V ← حمراء)', en: 'HIGH (+5 V → Red)' },
            ] as const
          ).map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setParams((p) => ({ ...p, logicInput: l.id }))}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                params.logicInput === l.id
                  ? l.id === 'HIGH'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : l.id === 'LOW'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
              }`}
            >
              {l[lang]}
            </button>
          ))}
        </div>
      );
    }

    if (cid === 'courtesy-light') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playRelayClick(muted, true);
                setParams((p) => ({ ...p, doorOpen: true, capTriggered: false, capCharge: 0 }));
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                params.doorOpen
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700'
              }`}
            >
              {tr(lang, 'Ouvrir portière (Vider C)', 'فتح الباب (تفريغ المكثف)', 'Open door (Discharge C)')}
            </button>
            <button
              type="button"
              onClick={() => {
                playRelayClick(muted, false);
                setParams((p) => ({ ...p, doorOpen: false, capTriggered: true, capCharge: 0 }));
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                !params.doorOpen && params.capTriggered && params.capCharge < 0.98
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 border-transparent'
              }`}
            >
              {tr(lang, 'Fermer portière (Lancer temporisation)', 'إغلاق الباب (بدء التأخير)', 'Close door (Start fade timer)')}
            </button>
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, doorOpen: false, capTriggered: false, capCharge: 1 }))}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 cursor-pointer whitespace-nowrap shrink-0"
            >
              {tr(lang, 'Extinction complète', 'إطفاء فوري', 'Turn off completely')}
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="cat-cap-uf" className="font-semibold text-stone-700 dark:text-stone-200">
                {tr(lang, 'Capacité du condensateur C :', 'سعة المكثف C:', 'Capacitance C:')}
              </label>
              <span className="font-mono-num font-bold text-sky-700 dark:text-sky-400">
                {params.capValueUF} µF ({Math.round((params.doorOpen ? 0 : params.capCharge) * 100)}% {tr(lang, 'chargé', 'مشحون', 'charged')})
              </span>
            </div>
            <input
              id="cat-cap-uf"
              type="range"
              min={10}
              max={470}
              step={5}
              value={params.capValueUF}
              onChange={(e) => setParams((p) => ({ ...p, capValueUF: Number(e.target.value) }))}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>
        </div>
      );
    }

    if (cid === 'touch-switch-globe') {
      return (
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickAction('latch-on')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
              params.latchedOn
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700'
            }`}
          >
            {tr(lang, 'Toucher pastille ON (Verrouiller)', 'لمس زر ON (تثبيت)', 'Touch ON pad (Latch)')}
          </button>
          <button
            type="button"
            onClick={() => handleQuickAction('latch-off')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
              !params.latchedOn
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700'
            }`}
          >
            {tr(lang, 'Toucher pastille OFF (Couper)', 'لمس زر OFF (إطفاء)', 'Touch OFF pad (Reset)')}
          </button>
        </div>
      );
    }

    if (cid === 'night-light' || cid === 'schmitt-trigger') {
      const isNight = cid === 'night-light';
      return (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="cat-lux" className="font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>{tr(lang, 'Luminosité ambiante (LDR)', 'شدة الإضاءة (LDR)', 'Ambient light (LDR)')}</span>
              </label>
              <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
                {params.luxLevel}% {isNight ? '(≤ 40% ON)' : '(≤ 30% ON · ≥ 55% OFF)'}
              </span>
            </div>
            <input
              id="cat-lux"
              type="range"
              min={0}
              max={100}
              value={params.luxLevel}
              onChange={(e) => {
                const nextLux = Number(e.target.value);
                setParams((p) => {
                  if (isNight) {
                    const wasOn = p.luxLevel <= 40;
                    const nowOn = nextLux <= 40;
                    if (wasOn !== nowOn) playRelayClick(muted, nowOn);
                    return { ...p, luxLevel: nextLux };
                  }
                  let nextSchmitt = p.schmittState;
                  if (nextLux <= 30) nextSchmitt = true;
                  else if (nextLux >= 55) nextSchmitt = false;
                  if (nextSchmitt !== p.schmittState) playRelayClick(muted, nextSchmitt);
                  return { ...p, luxLevel: nextLux, schmittState: nextSchmitt };
                });
              }}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {isNight && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {tr(lang, 'Tension relais :', 'جهد التغذية:', 'Relay supply:')}
              </span>
              {([6, 12] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, supplySelect6or9: v === 6 ? 6 : 9 }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                    (v === 6 ? params.supplySelect6or9 === 6 : params.supplySelect6or9 !== 6)
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {v} V
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (cid === 'sound-triggered-led') {
      return (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playTickSound(muted, 640, 0.05);
              setParams((p) => ({ ...p, clapActive: true }));
            }}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
          >
            {tr(lang, 'Clapper des mains ! (Impulsion micro)', 'تصفيق! (نبضة ميكروفون)', 'Clap hands! (Mic pulse)')}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
              {tr(lang, 'Gain préampli :', 'حساسية المكبّر:', 'Preamp gain:')}
            </span>
            {([1, 2, 3] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setParams((p) => ({ ...p, micGain: g }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                  (params.micGain ?? 2) === g
                    ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 border-transparent'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                }`}
              >
                ×{g}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (cid === 'robot-man' || cid === 'three-led-chaser' || cid === 'ticking-bomb') {
      return (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="cat-osc-r" className="font-semibold text-stone-700 dark:text-stone-200">
                {tr(lang, 'Résistance de base R (Cadence) :', 'مقاومة التوقيت R:', 'Timing resistor R (Rate):')}
              </label>
              <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
                {params.oscSpeedR.toFixed(1)} kΩ {sim.freqHz ? `· ${sim.freqHz.toFixed(1)} Hz` : ''}
              </span>
            </div>
            <input
              id="cat-osc-r"
              type="range"
              min={4.7}
              max={47}
              step={0.5}
              value={params.oscSpeedR}
              onChange={(e) => setParams((p) => ({ ...p, oscSpeedR: Number(e.target.value) }))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {cid === 'three-led-chaser' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {tr(lang, 'Sens de rotation :', 'اتجاه الدوران:', 'Rotation direction:')}
              </span>
              <button
                type="button"
                onClick={() => setParams((p) => ({ ...p, chaserReverse: !p.chaserReverse }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                  params.chaserReverse
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                }`}
              >
                {params.chaserReverse
                  ? tr(lang, 'Sens inversé (3 → 2 → 1)', 'اتجاه عكسي (3→2→1)', 'Reversed (3 → 2 → 1)')
                  : tr(lang, 'Sens horaire (1 → 2 → 3)', 'اتجاه طبيعي (1→2→3)', 'Clockwise (1 → 2 → 3)')}
              </button>
            </div>
          )}

          {cid === 'ticking-bomb' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {tr(lang, 'Mode acoustique :', 'الوضع الصوتي:', 'Sound mode:')}
              </span>
              {(
                [
                  { id: 'tick', fr: 'Tic-Tac rythmé', ar: 'نبضات متقطعة', en: 'Rhythmic tick-tock' },
                  { id: 'siren', fr: 'Sirène continue', ar: 'صفّارة مستمرة', en: 'Continuous siren' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, sirenMode: m.id }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                    (params.sirenMode ?? 'tick') === m.id
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {m[lang]}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (cid === 'led-on-1v5' || cid === 'bike-flasher-air' || cid === 'led-torch-1v5') {
      return (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="cat-cellv" className="font-semibold text-stone-700 dark:text-stone-200">
                {tr(lang, 'Tension de la pile 1,5 V (même usée) :', 'جهد البطارية (حتى عند ضعفها):', '1.5 V cell voltage (even drained):')}
              </label>
              <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
                {params.cellVoltage.toFixed(2)} V
              </span>
            </div>
            <input
              id="cat-cellv"
              type="range"
              min={0.8}
              max={1.5}
              step={0.05}
              value={params.cellVoltage}
              onChange={(e) => setParams((p) => ({ ...p, cellVoltage: Number(e.target.value) }))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {cid === 'led-on-1v5' ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPumpAuto((a) => !a)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 cursor-pointer whitespace-nowrap shrink-0"
              >
                {pumpAuto
                  ? tr(lang, 'Mettre en pause (pas à pas)', 'إيقاف مؤقت للفحص', 'Pause (step by step)')
                  : tr(lang, 'Reprendre cycle auto', 'استئناف التبديل التلقائي', 'Resume auto cycle')}
              </button>
              {(['A', 'B'] as const).map((ph) => (
                <button
                  key={ph}
                  type="button"
                  onClick={() => {
                    setPumpAuto(false);
                    setParams((p) => ({ ...p, pumpPhase: ph }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                    params.pumpPhase === ph
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {ph === 'A'
                    ? tr(lang, 'Phase A : Charge 1 µF', 'الطور A: شحن 1µF', 'Phase A: Charge 1 µF')
                    : tr(lang, 'Phase B : Décharge série (~2,5 V)', 'الطور B: تفريغ متوالٍ (~2.5V)', 'Phase B: Series discharge (~2.5 V)')}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, openCircuitFault: !p.openCircuitFault }))}
              className={`w-fit px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                params.openCircuitFault
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                {params.openCircuitFault
                  ? tr(lang, 'Rebrancher les LEDs (supprimer défaut)', 'إعادة توصيل الـ LED', 'Reconnect LEDs (clear fault)')
                  : tr(lang, 'Débrancher LED : test surtension à vide', 'فصل الـ LED: اختبار ارتفاع الجهد الخطر', 'Disconnect LED: open-circuit spike test')}
              </span>
            </button>
          )}
        </div>
      );
    }

    if (cid === 'solar-charger') {
      const sun = params.sunIntensity ?? 90;
      const panelV = 8 + (sun / 100) * 10;
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="cat-batt" className="font-semibold text-stone-700 dark:text-stone-200">
                  {tr(lang, 'Tension batterie 12 V :', 'جهد البطارية 12V:', '12 V Battery voltage:')}
                </label>
                <span className="font-mono-num font-bold text-emerald-700 dark:text-emerald-400">
                  {params.battVoltage.toFixed(1)} V (12.5 ↔ 13.7 V)
                </span>
              </div>
              <input
                id="cat-batt"
                type="range"
                min={11.0}
                max={14.5}
                step={0.1}
                value={params.battVoltage}
                onChange={(e) => {
                  const nextVolt = Number(e.target.value);
                  setParams((p) => {
                    let nextDiv = p.solarDiverted;
                    if (!p.solarDiverted && nextVolt >= 13.7) {
                      nextDiv = true;
                      playRelayClick(muted, true);
                    } else if (p.solarDiverted && nextVolt <= 12.5) {
                      nextDiv = false;
                      playRelayClick(muted, false);
                    }
                    return { ...p, battVoltage: nextVolt, solarDiverted: nextDiv };
                  });
                }}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="cat-sun" className="font-semibold text-stone-700 dark:text-stone-200">
                  {tr(lang, 'Ensoleillement panneau :', 'شدة الإشعاع الشمسي:', 'Solar panel irradiance:')}
                </label>
                <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
                  {sun}% ({panelV.toFixed(1)} V)
                </span>
              </div>
              <input
                id="cat-sun"
                type="range"
                min={20}
                max={100}
                value={sun}
                onChange={(e) => setParams((p) => ({ ...p, sunIntensity: Number(e.target.value) }))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, dummyLoadEnabled: !p.dummyLoadEnabled }))}
            className={`w-fit px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
              params.dummyLoadEnabled
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
            }`}
          >
            {params.dummyLoadEnabled
              ? tr(lang, 'Charge factice 100 Ω 5W : Branchée', 'مقاومة التفريغ 100Ω 5W: متصلة', '100 Ω 5W Dummy load: Connected')
              : tr(lang, 'Charge factice 100 Ω 5W : Débranchée', 'مقاومة التفريغ 100Ω 5W: مفصولة', '100 Ω 5W Dummy load: Disconnected')}
          </button>
        </div>
      );
    }

    if (cid === 'constant-current-source') {
      return (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="cat-supv" className="font-semibold text-stone-700 dark:text-stone-200">
                {tr(lang, 'Tension d’alimentation +V :', 'جهد التغذية +V:', 'Supply voltage +V:')}
              </label>
              <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
                {params.supplyV.toFixed(1)} V
              </span>
            </div>
            <input
              id="cat-supv"
              type="range"
              min={6.0}
              max={15.0}
              step={0.5}
              value={params.supplyV}
              onChange={(e) => setParams((p) => ({ ...p, supplyV: Number(e.target.value) }))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">R_sense :</span>
              {[120, 47, 22].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, rSense: r }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                    params.rSense === r
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {r} Ω ({Math.round((0.62 / r) * 1000)} mA)
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {tr(lang, 'Charge LED série :', 'عدد المصابيح:', 'Series LED load:')}
              </span>
              {([1, 2, 3] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, ledSeriesCount: cnt }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                    (params.ledSeriesCount ?? 1) === cnt
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {cnt} LED{cnt > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (cid === 'motor-speed-control') {
      return (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="cat-pwm" className="font-semibold text-stone-700 dark:text-stone-200">
                {tr(lang, 'Rapport cyclique PWM :', 'نسبة نبضات PWM:', 'PWM duty cycle:')}
              </label>
              <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
                {params.pwmDuty}%
              </span>
            </div>
            <input
              id="cat-pwm"
              type="range"
              min={10}
              max={100}
              step={5}
              value={params.pwmDuty}
              onChange={(e) => setParams((p) => ({ ...p, pwmDuty: Number(e.target.value) }))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
              {tr(lang, 'Charge mécanique :', 'الحمل الميكانيكي:', 'Mechanical load:')}
            </span>
            {(
              [
                { id: 'free', fr: 'À vide (démarrage 12%)', ar: 'حر (بدون حمل)', en: 'No load (12% start)' },
                { id: 'heavy', fr: 'Charge lourde (seuil 25%)', ar: 'حمل ثقيل (عتبة 25%)', en: 'Heavy load (25% threshold)' },
              ] as const
            ).map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setParams((p) => ({ ...p, motorLoad: l.id }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                  (params.motorLoad ?? 'free') === l.id
                    ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 border-transparent'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                }`}
              >
                {l[lang]}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (cid === 'self-bias-ce') {
      const rbK = Math.round((100000 * Math.pow(100, params.rbSlider / 100)) / 1000);
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="cat-rb" className="font-semibold text-stone-700 dark:text-stone-200">
                  {tr(lang, 'Résistance de polarisation R_B :', 'مقاومة التحيّز R_B:', 'Bias resistor R_B:')}
                </label>
                <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
                  {rbK >= 1000 ? `${(rbK / 1000).toFixed(2)} MΩ` : `${rbK} kΩ`}
                </span>
              </div>
              <input
                id="cat-rb"
                type="range"
                min={0}
                max={100}
                value={params.rbSlider}
                onChange={(e) => setParams((p) => ({ ...p, rbSlider: Number(e.target.value) }))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="cat-acamp" className="font-semibold text-stone-700 dark:text-stone-200">
                  {tr(lang, 'Amplitude signal AC d’entrée :', 'سعة موجة الدخل AC:', 'Input AC signal amplitude:')}
                </label>
                <span className="font-mono-num font-bold text-sky-700 dark:text-sky-400">
                  ±{(params.acAmplitude ?? 2.0).toFixed(1)} V
                </span>
              </div>
              <input
                id="cat-acamp"
                type="range"
                min={0.4}
                max={3.0}
                step={0.1}
                value={params.acAmplitude ?? 2.0}
                onChange={(e) => setParams((p) => ({ ...p, acAmplitude: Number(e.target.value) }))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, rbSlider: 67 }))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 cursor-pointer whitespace-nowrap shrink-0"
            >
              {tr(lang, 'Auto-centrer Q à 2,50 V (2,2 MΩ)', 'ضبط نقطة التشغيل Q عند 2.50V', 'Auto-center Q at 2.50 V (2.2 MΩ)')}
            </button>
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, acSignalOn: !p.acSignalOn }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                params.acSignalOn
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
              }`}
            >
              {params.acSignalOn
                ? tr(lang, 'Signal AC : Actif', 'موجة AC: نشطة', 'AC Signal: On')
                : tr(lang, 'Signal AC : Coupé', 'موجة AC: موقفة', 'AC Signal: Off')}
            </button>
          </div>
        </div>
      );
    }

    if (cid === 'multimeter-tester') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {tr(lang, 'Boîtier mystère :', 'الترانزستور المجهول:', 'Mystery package:')}
              </span>
              {(
                [
                  { id: 'npn_ebc', fr: '#1 NPN (E-B-C)', ar: '#1 NPN (E-B-C)', en: '#1 NPN (E-B-C)' },
                  { id: 'pnp_bce', fr: '#2 PNP (B-C-E)', ar: '#2 PNP (B-C-E)', en: '#2 PNP (B-C-E)' },
                  { id: 'faulty', fr: '#3 Défectueux (C-C)', ar: '#3 تالف (قصر)', en: '#3 Faulty (Short)' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, mysteryType: m.id }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                    (params.mysteryType ?? 'npn_ebc') === m.id
                      ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 border-transparent'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {m[lang]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {tr(lang, 'Calibre :', 'التدريج:', 'Range:')}
              </span>
              {(['x10', 'x10k'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() =>
                    setParams((p) => ({
                      ...p,
                      meterRange: r,
                      fingerCB: r === 'x10' ? false : p.fingerCB,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-bold border cursor-pointer whitespace-nowrap shrink-0 ${
                    (params.meterRange ?? 'x10') === r
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {r === 'x10' ? '×10 Ω' : '×10k Ω'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                {tr(lang, 'Sonde NOIRE (+) :', 'المجس الأسود (+):', 'BLACK Probe (+):')}
              </span>
              {([1, 2, 3] as const).map((pin) => (
                <button
                  key={pin}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, blackPin: pin }))}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono-num font-bold border cursor-pointer whitespace-nowrap shrink-0 ${
                    (params.blackPin ?? 2) === pin
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  P{pin}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {tr(lang, 'Sonde ROUGE (−) :', 'المجس الأحمر (−):', 'RED Probe (−):')}
              </span>
              {([1, 2, 3] as const).map((pin) => (
                <button
                  key={pin}
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, redPin: pin }))}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono-num font-bold border cursor-pointer whitespace-nowrap shrink-0 ${
                    (params.redPin ?? 1) === pin
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  P{pin}
                </button>
              ))}
            </div>

            {(params.meterRange ?? 'x10') === 'x10k' && (
              <button
                type="button"
                onClick={() => setParams((p) => ({ ...p, fingerCB: !p.fingerCB }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 ${
                  params.fingerCB
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                }`}
              >
                {params.fingerCB
                  ? tr(lang, 'Doigt sur C + B : APPUYÉ', 'الإصبع على C + B: مضغوط', 'Finger on C + B: PRESSED')
                  : tr(lang, 'Poser doigt entre C et B', 'وضع الإصبع بين C و B', 'Place finger between C & B')}
              </button>
            )}

            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, revealPins: !p.revealPins }))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              {params.revealPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>
                {params.revealPins
                  ? tr(lang, 'Masquer brochage', 'إخفاء الأطراف', 'Hide pinout')
                  : tr(lang, 'Révéler brochage réel', 'كشف الأطراف الحقيقية', 'Reveal true pinout')}
              </span>
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Compact Independent Catalog Lab Top Strip */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 px-4 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{tr(lang, 'Catalogue', 'العودة للدليل', 'Catalog')}</span>
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-num text-stone-500 dark:text-stone-400">
              <span>p. {circuit.page}</span>
              <span aria-hidden="true">·</span>
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
            onClick={handleSelectPrev}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer shrink-0"
            aria-label={tr(lang, 'Circuit précédent', 'الدارة السابقة', 'Previous circuit')}
          >
            {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <span className="text-xs font-mono-num font-bold text-stone-700 dark:text-stone-200 px-1 whitespace-nowrap shrink-0">
            {index + 1} / {circuits.length}
          </span>
          <button
            type="button"
            onClick={handleSelectNext}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer shrink-0"
            aria-label={tr(lang, 'Circuit suivant', 'الدارة التالية', 'Next circuit')}
          >
            {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setParams(buildInitialParams(circuit.id))}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer shrink-0"
            title={tr(lang, 'Réinitialiser ce montage', 'إعادة ضبط الدارة', 'Reset this circuit')}
            aria-label={tr(lang, 'Réinitialiser', 'إعادة ضبط', 'Reset')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer shrink-0"
            aria-label={muted ? tr(lang, 'Activer le son', 'تشغيل الصوت', 'Unmute') : tr(lang, 'Couper le son', 'كتم الصوت', 'Mute')}
          >
            {muted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Standalone 3-Tab Stage Switcher (Platine 3D / Schéma & Oscillo / Analogie ONLY) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/75 dark:bg-stone-800/80 rounded-lg w-fit">
          {(
            [
              { id: 'board3d', fr: 'Platine 3D', ar: 'اللوحة ثلاثية الأبعاد', en: '3D Board' },
              { id: 'schematic', fr: 'Schéma & Oscillo', ar: 'المخطط والراسم', en: 'Schematic & Scope' },
              { id: 'analogy', fr: 'Analogie', ar: 'التشبيه المائي', en: 'Analogy' },
            ] as const
          ).map((tab) => {
            const active = stageView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStageView(tab.id)}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white dark:bg-stone-950 text-stone-950 dark:text-stone-50 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {tab[lang]}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300 max-w-2xl">
          {circuit.concept[lang]}
        </p>
      </div>

      {/* Extra-Wide Full-Width Stage */}
      <div className="w-full">
        {stageView === 'board3d' && (
          <InteractiveBoard3D
            params={params}
            sim={sim}
            lang={lang}
            wide
            onQuickAction={handleQuickAction}
          />
        )}
        {stageView === 'schematic' && (
          <LiveSchematicScope params={params} sim={sim} lang={lang} />
        )}
        {stageView === 'analogy' && (
          <WaterValveAnalogy
            params={params}
            sim={sim}
            lang={lang}
            analogyTitle={circuit.analogyTitle[lang]}
            analogyText={circuit.analogyText[lang]}
          />
        )}
      </div>

      {/* Dual-Coded Fault / Safety Warning Banner */}
      {warningText && (
        <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 flex items-center gap-3 text-xs font-semibold text-rose-800 dark:text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{warningText}</span>
        </div>
      )}

      {/* Circuit-Specific Advanced Controls Deck + Live Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <section className="lg:col-span-7 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-4 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2 border-b border-stone-200/70 dark:border-stone-800 pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{tr(lang, 'Banc de réglages du montage', 'لوحة التحكم المتقدمة بالدارة', 'Circuit Control Panel')}</span>
            </h2>
            <span className="text-xs font-medium text-stone-700 dark:text-stone-200 truncate">
              {statusText}
            </span>
          </div>
          {renderControls()}
        </section>

        <section className="lg:col-span-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-4 flex flex-col justify-between gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 border-b border-stone-200/70 dark:border-stone-800 pb-2.5">
            {tr(lang, 'Mesures électriques en direct', 'القياسات الكهربائية الحية', 'Live Electrical Measurements')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5">
            <div className="rounded-lg bg-stone-50 dark:bg-stone-950/60 border border-stone-200/70 dark:border-stone-800 p-2.5">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">I_B (Base)</div>
              <div className="text-sm font-mono-num font-bold text-sky-700 dark:text-sky-400 mt-0.5">
                {sim.ibUA.toFixed(1)} µA
              </div>
            </div>
            <div className="rounded-lg bg-stone-50 dark:bg-stone-950/60 border border-stone-200/70 dark:border-stone-800 p-2.5">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                {tr(lang, 'I_C (Charge)', 'I_C (الحِمل)', 'I_C (Load)')}
              </div>
              <div className="text-sm font-mono-num font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                {sim.icMA.toFixed(1)} mA
              </div>
            </div>
            <div className="rounded-lg bg-stone-50 dark:bg-stone-950/60 border border-stone-200/70 dark:border-stone-800 p-2.5">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">V_C / V_CE</div>
              <div className="text-sm font-mono-num font-bold text-rose-700 dark:text-rose-400 mt-0.5">
                {sim.vc.toFixed(2)} V
              </div>
            </div>
            <div className="rounded-lg bg-stone-50 dark:bg-stone-950/60 border border-stone-200/70 dark:border-stone-800 p-2.5">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                {sim.powerW !== undefined
                  ? tr(lang, 'Dissipation', 'الاستطاعة', 'Dissipation')
                  : sim.powerMW !== undefined
                  ? tr(lang, 'Puissance', 'القدرة', 'Power')
                  : sim.freqHz !== undefined
                  ? tr(lang, 'Fréquence', 'التردد', 'Frequency')
                  : tr(lang, 'Gain β', 'الكسب β', 'Gain β')}
              </div>
              <div className="text-sm font-mono-num font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {sim.powerW !== undefined
                  ? `${sim.powerW.toFixed(2)} W`
                  : sim.powerMW !== undefined
                  ? `${sim.powerMW.toFixed(0)} mW`
                  : sim.freqHz !== undefined
                  ? sim.freqHz >= 1000
                    ? `${(sim.freqHz / 1000).toFixed(0)} kHz`
                    : `${sim.freqHz.toFixed(1)} Hz`
                  : formatGain(sim.betaEff)}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
