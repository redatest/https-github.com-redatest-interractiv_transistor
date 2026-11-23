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
  computeKirchhoffSimulation,
  createDefaultKirchhoffParams,
  KirchhoffSimParams,
} from '../utils/kirchhoffPhysics';
import { playRelayClick } from '../utils/sound';
import { KirchhoffBoard3D } from './KirchhoffBoard3D';
import { KirchhoffSchematicScope } from './KirchhoffSchematicScope';
import { KirchhoffAnalogyView } from './KirchhoffAnalogyView';

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

function buildInitialKirchhoffCatalogParams(circuitId: string): KirchhoffSimParams {
  switch (circuitId) {
    case 'kvl-series-monitor':
      return createDefaultKirchhoffParams({ catalogId: circuitId, topology: 'series-2r', e1: 9, r1: 1000, r2: 2000 });
    case 'kvl-loaded-sensor':
      return createDefaultKirchhoffParams({ catalogId: circuitId, topology: 'loaded-divider', e1: 10, r1: 4700, r2: 4700, rLoad: 1000, loadConnected: true });
    case 'kvl-dual-charger':
      return createDefaultKirchhoffParams({ catalogId: circuitId, topology: 'dual-sources', e1: 14.2, e2: 12.0, secondSourceOpposing: true, r1: 100, r2: 100 });
    case 'kcl-parallel-bus':
      return createDefaultKirchhoffParams({ catalogId: circuitId, topology: 'parallel-3', e1: 12, r1: 1000, r2: 2000, r3: 1500 });
    case 'kvl-led-limiter':
      return createDefaultKirchhoffParams({ catalogId: circuitId, topology: 'led-series-kvl', e1: 9, r1: 470, vfLed1: 1.9, loadConnected: false });
    case 'kvl-led-parallel-trap':
      return createDefaultKirchhoffParams({ catalogId: circuitId, topology: 'led-parallel-trap', e1: 5, r1: 150, r2: 150, separateLedResistors: false });
    case 'millman-dual-mesh':
      return createDefaultKirchhoffParams({ catalogId: circuitId, topology: 'two-mesh-millman', e1: 10, e2: 5, r1: 1000, r2: 1000, r3: 1500 });
    case 'wheatstone-sensor-bridge':
      return createDefaultKirchhoffParams({ catalogId: circuitId, topology: 'wheatstone-bridge', e1: 10, r1: 1000, r2: 1000, r3: 1000, rLoad: 1500, loadConnected: false });
    case 'battery-ri-tester':
      return createDefaultKirchhoffParams({ catalogId: circuitId, topology: 'internal-resistance', e1: 9, rInternal: 3.5, rLoad: 12, loadConnected: true });
    case 'fault-finder-bench':
      return createDefaultKirchhoffParams({ catalogId: circuitId, topology: 'series-2r', e1: 9, r1: 1000, r2: 2000, faultMode: 'open' });
    default:
      return createDefaultKirchhoffParams({ catalogId: circuitId });
  }
}

export const KirchhoffCatalogLabView: React.FC<Props> = ({
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
  const [params, setParams] = useState<KirchhoffSimParams>(() => buildInitialKirchhoffCatalogParams(circuit.id));

  useEffect(() => {
    setParams(buildInitialKirchhoffCatalogParams(circuit.id));
  }, [circuit.id]);

  const sim = useMemo(() => computeKirchhoffSimulation(params), [params]);
  const statusText = lang === 'fr' ? sim.statusFr : lang === 'en' ? sim.statusEn : sim.statusAr;
  const warningText = lang === 'fr' ? sim.warningFr : lang === 'en' ? sim.warningEn : sim.warningAr;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          <span>{tr(lang, 'Retour au catalogue', 'العودة للدليل', 'Back to Catalog')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={index <= 0}
            onClick={() => onSelectCircuit(circuits[index - 1].id)}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
          <span className="text-xs font-mono-num text-stone-600 dark:text-stone-300">
            #{index + 1} / {circuits.length}
          </span>
          <button
            type="button"
            disabled={index >= circuits.length - 1}
            onClick={() => onSelectCircuit(circuits[index + 1].id)}
            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-6 flex flex-col gap-4">
          <div className="text-xs font-mono-num text-emerald-700 dark:text-emerald-400">
            p. {circuit.page} · {circuit.supply} · {circuit.transistors.join(' · ')}
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            {circuit.titleBi[lang]}
          </h2>
          <p className="text-[15px] text-stone-600 dark:text-stone-300 leading-7">
            {circuit.concept[lang]}
          </p>

          <div className="rounded-lg bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/50 p-4">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 shrink-0" />
              <span>{circuit.analogyTitle[lang]}</span>
            </div>
            <p className="text-sm text-stone-700 dark:text-stone-300 mt-1.5 leading-relaxed">{circuit.analogyText[lang]}</p>
          </div>

          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
            <div className="font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              {tr(lang, 'Composants du banc', 'مكوّنات الدارة', 'Circuit Parts')}
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono-num">
              {circuit.parts.map((part) => (
                <span key={part} className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  {part}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-200/75 dark:bg-stone-800/80">
              {(
                [
                  { id: 'board3d', fr: 'Platine 3D', ar: 'اللوحة 3D', en: '3D PCB' },
                  { id: 'schematic', fr: 'Schéma & Bilan', ar: 'المخطط والميزان', en: 'Schematic & KVL' },
                  { id: 'analogy', fr: 'Analogie', ar: 'التشبيه', en: 'Analogy' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStageView(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                    stageView === tab.id
                      ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {tab[lang]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setParams(buildInitialKirchhoffCatalogParams(circuit.id))}
                className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onToggleMute}
                className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 cursor-pointer"
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {stageView === 'board3d' && <KirchhoffBoard3D params={params} sim={sim} lang={lang} />}
          {stageView === 'schematic' && <KirchhoffSchematicScope params={params} sim={sim} lang={lang} />}
          {stageView === 'analogy' && <KirchhoffAnalogyView params={params} sim={sim} lang={lang} />}

          {/* Controls */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>{tr(lang, 'Paramètres en direct', 'إعدادات المحاكاة', 'Live Controls')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex flex-col gap-1">
                <div className="flex justify-between font-mono-num">
                  <span>E₁</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{params.e1.toFixed(1)} V</span>
                </div>
                <input type="range" min="1" max="24" step="0.5" value={params.e1} onChange={(e) => setParams((p) => ({ ...p, e1: Number(e.target.value) }))} className="accent-emerald-600 cursor-pointer" />
              </label>

              {params.topology !== 'internal-resistance' ? (
                <label className="flex flex-col gap-1">
                  <div className="flex justify-between font-mono-num">
                    <span>R₁</span>
                    <span className="font-bold">{params.r1} Ω</span>
                  </div>
                  <input type="range" min="100" max="10000" step="50" value={params.r1} onChange={(e) => setParams((p) => ({ ...p, r1: Number(e.target.value) }))} className="accent-emerald-600 cursor-pointer" />
                </label>
              ) : (
                <label className="flex flex-col gap-1">
                  <div className="flex justify-between font-mono-num">
                    <span>r_i</span>
                    <span className="font-bold text-rose-600">{params.rInternal.toFixed(1)} Ω</span>
                  </div>
                  <input type="range" min="0.2" max="20" step="0.2" value={params.rInternal} onChange={(e) => setParams((p) => ({ ...p, rInternal: Number(e.target.value) }))} className="accent-rose-600 cursor-pointer" />
                </label>
              )}

              {(params.topology === 'loaded-divider' || params.topology === 'wheatstone-bridge' || params.topology === 'internal-resistance') && (
                <label className="flex flex-col gap-1">
                  <div className="flex justify-between font-mono-num">
                    <span>R_L</span>
                    <span className="font-bold text-orange-600">{params.rLoad} Ω</span>
                  </div>
                  <input type="range" min={params.topology === 'internal-resistance' ? 2 : 100} max={params.topology === 'internal-resistance' ? 100 : 10000} step={params.topology === 'internal-resistance' ? 1 : 50} value={params.rLoad} onChange={(e) => setParams((p) => ({ ...p, rLoad: Number(e.target.value) }))} className="accent-orange-600 cursor-pointer" />
                </label>
              )}

              {(params.topology === 'dual-sources' || params.topology === 'two-mesh-millman') && (
                <label className="flex flex-col gap-1">
                  <div className="flex justify-between font-mono-num">
                    <span>E₂</span>
                    <span className="font-bold text-sky-600">{params.e2.toFixed(1)} V</span>
                  </div>
                  <input type="range" min="0" max="20" step="0.5" value={params.e2} onChange={(e) => setParams((p) => ({ ...p, e2: Number(e.target.value) }))} className="accent-sky-600 cursor-pointer" />
                </label>
              )}
            </div>

            {params.topology === 'led-parallel-trap' && (
              <button
                type="button"
                onClick={() => {
                  playRelayClick(muted, !params.separateLedResistors);
                  setParams((p) => ({ ...p, separateLedResistors: !p.separateLedResistors }));
                }}
                className="w-fit px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white cursor-pointer"
              >
                {params.separateLedResistors
                  ? tr(lang, 'Séparées : OK', 'مقاومات منفصلة: سليم', 'Separate Resistors: Fixed')
                  : tr(lang, 'Activer 2 résistances séparées', 'فصل المقاومتين', 'Switch to Separate Resistors')}
              </button>
            )}
          </div>

          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-3.5 text-xs flex flex-col gap-1.5">
            <div className="font-medium text-stone-800 dark:text-stone-100">{statusText}</div>
            {warningText && (
              <div className="flex items-start gap-2 text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{warningText}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
