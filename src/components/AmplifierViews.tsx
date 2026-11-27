import React, { useEffect, useMemo, useState } from 'react';
import { Lang, tr } from '../types';
import { SimParams } from '../utils/physics';
import { AmpResult, ampParamsFromSim, computeAmplifier } from '../utils/amplifier';
import { PcbShell, usePcbTilt } from './PcbShell';
import { TransistorTO92 } from './InteractiveBoard3D';

interface ViewProps {
  params: SimParams;
  lang: Lang;
}

function useAmp(params: SimParams): AmpResult {
  return useMemo(
    () => computeAmplifier(ampParamsFromSim(params)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.exampleId, params.ampIcUA, params.ampVinMV, params.ampRe, params.ampRf]
  );
}

/** Phase 0..1 qui avance en continu, figée si l'utilisateur préfère moins d'animations. */
function usePhase(periodMs = 4000): number {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      setPhase(((t - t0) % periodMs) / periodMs);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [periodMs]);
  return phase;
}

function fmtV(v: number): string {
  const a = Math.abs(v);
  return a < 1 ? `${(v * 1000).toFixed(a < 0.01 ? 1 : 0)} mV` : `${v.toFixed(2)} V`;
}

function fmtR(ohms: number): string {
  if (ohms >= 1000) return `${(ohms / 1000).toFixed(ohms % 1000 === 0 ? 0 : 1)} kΩ`;
  return `${ohms.toFixed(0)} Ω`;
}

function wavePath(samples: number[], x0: number, width: number, cy: number, scale: number, phase: number, cycles = 2): string {
  const n = samples.length;
  const pts: string[] = [];
  const steps = 160;
  for (let i = 0; i <= steps; i++) {
    const u = (i / steps) * cycles + phase; // position dans le motif périodique
    const idx = Math.floor((u % 1) * n) % n;
    const x = x0 + (i / steps) * width;
    const y = cy - samples[idx] * scale;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

// ---------------------------------------------------------------------------------------------
// Oscilloscope double trace : V_in (mV) et V_out (V) sur deux échelles différentes
// ---------------------------------------------------------------------------------------------
export const AmplifierScope: React.FC<ViewProps> = ({ params, lang }) => {
  const amp = useAmp(params);
  const phase = usePhase(5000);
  const vinMax = Math.max(0.001, Math.max(...amp.vin.map(Math.abs)) * 1.25);
  const head = Math.max(amp.headroomUp, amp.headroomDown, amp.voutPeakV) * 1.15;
  const w = 560;
  const x0 = 46;
  const plotW = w - x0 - 12;
  const cy1 = 62;
  const cy2 = 190;
  const h1 = 44;
  const h2 = 74;
  const inverted = amp.avSmallSignal < 0;
  const gainTxt = `${inverted ? '−' : '+'}${Math.abs(amp.avMeasured).toFixed(1)}`;

  return (
    <div className="schematic-grid rounded-xl border border-stone-200 dark:border-stone-800 p-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-num text-stone-500 dark:text-stone-400">
        <span>{tr(lang, 'OSCILLOSCOPE · ENTRÉE ET SORTIE', 'راسم الإشارة · الدخل والخرج', 'SCOPE · INPUT AND OUTPUT')}</span>
        <span className="text-sky-600 dark:text-sky-400">
          CH1 {fmtV(vinMax / 1.25)}/{tr(lang, 'crête', 'قمة', 'peak')} · CH2 {fmtV(head / 1.15)}
        </span>
      </div>

      <svg viewBox={`0 0 ${w} 270`} className="w-full h-auto" direction="ltr" role="img"
        aria-label={tr(lang, 'Signal d’entrée et signal de sortie amplifié', 'إشارة الدخل وإشارة الخرج المكبَّرة', 'Input signal and amplified output signal')}>
        {/* Grille */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line key={`gx${i}`} x1={x0 + (plotW / 8) * i} y1="8" x2={x0 + (plotW / 8) * i} y2="262" stroke="currentColor" opacity="0.08" />
        ))}
        {/* CH1 */}
        <line x1={x0} y1={cy1} x2={x0 + plotW} y2={cy1} stroke="currentColor" opacity="0.2" />
        <text x="4" y={cy1 - 28} fontSize="10" fill="#38bdf8">CH1 V_in</text>
        <text x="4" y={cy1 - 16} fontSize="9" fill="currentColor" opacity="0.6">{fmtV(vinMax / 1.25)}</text>
        <path d={wavePath(amp.vin, x0, plotW, cy1, h1 / vinMax, phase)} fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinejoin="round" />

        {/* CH2 */}
        <line x1={x0} y1={cy2} x2={x0 + plotW} y2={cy2} stroke="currentColor" opacity="0.2" />
        {/* Rails */}
        <line x1={x0} y1={cy2 - (amp.headroomUp * h2) / head} x2={x0 + plotW} y2={cy2 - (amp.headroomUp * h2) / head} stroke="#ef4444" strokeDasharray="5 4" opacity="0.65" />
        <line x1={x0} y1={cy2 + (amp.headroomDown * h2) / head} x2={x0 + plotW} y2={cy2 + (amp.headroomDown * h2) / head} stroke="#ef4444" strokeDasharray="5 4" opacity="0.65" />
        <text x={x0 + plotW - 2} y={cy2 - (amp.headroomUp * h2) / head - 3} fontSize="9" textAnchor="end" fill="#ef4444">
          {tr(lang, 'rail haut', 'حدّ التغذية العلوي', 'upper rail')}
        </text>
        <text x={x0 + plotW - 2} y={cy2 + (amp.headroomDown * h2) / head + 11} fontSize="9" textAnchor="end" fill="#ef4444">
          {tr(lang, 'rail bas / saturation', 'الحدّ السفلي / التشبّع', 'lower rail / saturation')}
        </text>
        <text x="4" y={cy2 - 28} fontSize="10" fill={amp.clipped ? '#ef4444' : '#f59e0b'}>CH2 V_out</text>
        <text x="4" y={cy2 - 16} fontSize="9" fill="currentColor" opacity="0.6">{fmtV(head / 1.15)}</text>
        <path d={wavePath(amp.vout, x0, plotW, cy2, h2 / head, phase)} fill="none" stroke={amp.clipped ? '#ef4444' : '#f59e0b'} strokeWidth="2.6" strokeLinejoin="round" />
      </svg>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-lg bg-stone-100 dark:bg-stone-900 p-2">
          <div className="text-stone-500">A_v</div>
          <div className="font-mono-num text-base font-semibold text-amber-700 dark:text-amber-400">{gainTxt}</div>
          <div className="text-stone-500">{amp.gainDb.toFixed(1)} dB</div>
        </div>
        <div className="rounded-lg bg-stone-100 dark:bg-stone-900 p-2">
          <div className="text-stone-500">{tr(lang, 'Sortie crête', 'قمة الخرج', 'Output peak')}</div>
          <div className="font-mono-num text-base font-semibold">{fmtV(amp.voutPeakV)}</div>
          <div className="text-stone-500">{inverted ? tr(lang, 'inversée (180°)', 'معكوسة (١٨٠°)', 'inverted (180°)') : tr(lang, 'en phase', 'بنفس الطور', 'in phase')}</div>
        </div>
        <div className="rounded-lg bg-stone-100 dark:bg-stone-900 p-2">
          <div className="text-stone-500">{tr(lang, 'Distorsion', 'التشوّه', 'Distortion')}</div>
          <div className={`font-mono-num text-base font-semibold ${amp.thdPercent > 5 ? 'text-rose-600 dark:text-rose-400' : ''}`}>{amp.thdPercent.toFixed(1)} %</div>
          <div className="text-stone-500">{tr(lang, 'harmoniques 2 à 9', 'التوافقيات ٢ إلى ٩', 'harmonics 2 to 9')}</div>
        </div>
        <div className="rounded-lg bg-stone-100 dark:bg-stone-900 p-2">
          <div className="text-stone-500">{tr(lang, 'Entrée max propre', 'أقصى دخل دون قصّ', 'Max input before clip')}</div>
          <div className="font-mono-num text-base font-semibold">{fmtV(amp.maxCleanVinV)}</div>
          <div className="text-stone-500">{amp.clipped ? tr(lang, 'écrêtage !', 'قصّ!', 'clipping!') : tr(lang, 'marge OK', 'الهامش كافٍ', 'headroom OK')}</div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Platine : schéma posé sur un PCB, avec formes d'onde vivantes à l'entrée et à la sortie
// ---------------------------------------------------------------------------------------------
const Res: React.FC<{ x: number; y: number; label: string; value: string; horizontal?: boolean }> = ({ x, y, label, value, horizontal }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={horizontal ? -22 : -7} y={horizontal ? -7 : -22} width={horizontal ? 44 : 14} height={horizontal ? 14 : 44} rx="3" fill="#e7cfa0" stroke="#92704a" strokeWidth="1.5" />
    <text x={horizontal ? 0 : 14} y={horizontal ? -11 : -4} textAnchor={horizontal ? 'middle' : 'start'} fontSize="10" fill="#fef3c7" fontWeight="600">{label}</text>
    <text x={horizontal ? 0 : 14} y={horizontal ? 21 : 9} textAnchor={horizontal ? 'middle' : 'start'} fontSize="9.5" fill="#d1fae5">{value}</text>
  </g>
);

const TRACE = '#6fd7a6';
const OUT_TRACE = '#f59e0b';
const W = { stroke: TRACE, strokeWidth: 4, opacity: 0.85, fill: 'none', strokeLinejoin: 'round' as const };
const WO = { ...W, stroke: OUT_TRACE };
const Dot: React.FC<{ x: number; y: number }> = ({ x, y }) => <circle cx={x} cy={y} r="4" fill={TRACE} stroke="#064e3b" strokeWidth="1" />;
const noop = () => undefined;

export const AmplifierBoard: React.FC<ViewProps> = ({ params, lang }) => {
  const amp = useAmp(params);
  const tilt = usePcbTilt({ rx: 10, rz: 0 }, { rxMin: 4, rxMax: 34, rzMax: 18 });
  const phase = usePhase(3500);
  const preamp = amp.mode === 'preamp';
  const inverted = amp.avSmallSignal < 0;
  const vinMax = Math.max(1e-6, Math.max(...amp.vin.map(Math.abs)));
  const voutMax = Math.max(1e-6, Math.max(...amp.vout.map(Math.abs)));
  const vinPeak = Math.max(...amp.vin);
  const hasRe = amp.reOhm > 0;

  // Géométrie du boîtier TO-92 (voir TransistorTO92) : pattes E, B, C à cx−26, cx, cx+26 ; pastilles à topY+74.
  const TOP = 130;
  const PAD = TOP + 74;
  const q1x = preamp ? 150 : 290;
  const q2x = 380;
  const gnd = preamp ? 300 : 272;
  const reCy = preamp ? 272 : 250;
  const vbH = preamp ? 322 : 300;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono-num">
        <span className="px-2 py-1 rounded-md bg-stone-900 text-amber-300">
          A_v {inverted ? '−' : '+'}{Math.abs(amp.avMeasured).toFixed(1)} · {amp.gainDb.toFixed(1)} dB
        </span>
        <span className="px-2 py-1 rounded-md bg-stone-900 text-sky-300">V_in {fmtV(vinPeak)}</span>
        <span className={`px-2 py-1 rounded-md bg-stone-900 ${amp.clipped ? 'text-rose-300' : 'text-emerald-300'}`}>V_out {fmtV(amp.voutPeakV)}</span>
      </div>
      <div
        {...tilt.handlers}
        style={{ perspective: '900px', touchAction: 'pan-y' }}
        className="w-full flex justify-center select-none cursor-grab active:cursor-grabbing"
        title={tr(lang, 'Glisser pour incliner · double-clic pour réinitialiser', 'اسحب للإمالة · نقرتان لإعادة الضبط', 'Drag to tilt · double-click to reset')}
      >
        <PcbShell rx={tilt.rot.rx} rz={tilt.rot.rz} transitionMs={tilt.dragging ? 0 : 250} radius={14} className="w-full max-w-[600px]">
          <div className="p-3">
            <svg viewBox={`0 0 560 ${vbH}`} className="w-full h-auto" direction="ltr">
              {/* Rails */}
              <line x1="24" y1="34" x2="540" y2="34" stroke="#d4af37" strokeWidth="5" opacity="0.85" />
              <text x="28" y="26" fontSize="11" fill="#fde68a" fontWeight="700">+{amp.vcc} V</text>
              <line x1="24" y1={gnd} x2="540" y2={gnd} stroke={TRACE} strokeWidth="5" opacity="0.7" />
              <text x="28" y={gnd - 8} fontSize="11" fill="#d1fae5" fontWeight="700">0 V</text>

              {!preamp && (
                <g>
                  {/* Collecteur : pastille C → R_C → rail */}
                  <polyline points={`${q1x + 26},${PAD} 352,${PAD} 352,112`} {...W} />
                  <line x1="352" y1="34" x2="352" y2="68" {...W} />
                  <Res x={352} y={90} label="R_C" value={fmtR(amp.rcOhm)} />
                  {/* Sortie prise sur le collecteur */}
                  <polyline points="352,150 462,150" {...WO} />
                  <Dot x={352} y={150} />
                  <text x="360" y="176" fontSize="10" fill="#fde68a">V_C = {amp.vc0.toFixed(2)} V</text>
                  {/* Émetteur */}
                  <line x1={q1x - 26} y1={PAD} x2={q1x - 26} y2={hasRe ? reCy - 22 : gnd} {...W} />
                  {hasRe && (
                    <g>
                      <Res x={q1x - 26} y={reCy} label="R_E" value={fmtR(amp.reOhm)} />
                      <line x1={q1x - 26} y1={reCy + 22} x2={q1x - 26} y2={gnd} {...W} />
                    </g>
                  )}
                  {/* Base ← condensateur de liaison ← entrée */}
                  <polyline points={`${q1x},${PAD} ${q1x},222 112,222`} {...W} />
                  <rect x="150" y="209" width="7" height="26" fill="#38bdf8" opacity="0.9" />
                  <rect x="162" y="209" width="7" height="26" fill="#38bdf8" opacity="0.9" />
                  <text x="159" y="204" textAnchor="middle" fontSize="9" fill="#bae6fd">C</text>
                  <text x="60" y="258" fontSize="9.5" fill="#d1fae5">{tr(lang, 'repos : I_C = ', 'الراحة: I_C = ', 'rest: I_C = ')}{(amp.icA * 1e6).toFixed(0)} µA</text>
                  <TransistorTO92 cx={q1x} topY={TOP} label="Q1" sub="BC547" compId="Q1" active onSelect={noop} />
                  {/* Entrée / sortie */}
                  <circle cx="112" cy="222" r="5" fill="#38bdf8" />
                  <text x="112" y="209" textAnchor="middle" fontSize="10" fill="#bae6fd" fontWeight="700">V_in</text>
                  <path d={wavePath(amp.vin, 22, 62, 222, 18 / vinMax, phase, 1.5)} fill="none" stroke="#38bdf8" strokeWidth="2.4" strokeLinejoin="round" />
                  <circle cx="462" cy="150" r="5" fill="#f59e0b" />
                  <text x="440" y="136" textAnchor="middle" fontSize="10" fill="#fde68a" fontWeight="700">V_out</text>
                  <path d={wavePath(amp.vout, 470, 60, 150, 24 / voutMax, phase, 1.5)} fill="none" stroke={amp.clipped ? '#ef4444' : '#f59e0b'} strokeWidth="2.6" strokeLinejoin="round" />
                  <text x="548" y="196" textAnchor="end" fontSize="9.5" fill="#fef3c7">{tr(lang, 'amplitude réelle : ', 'السعة الفعلية: ', 'real amplitude: ')}{fmtV(amp.voutPeakV)}</text>
                </g>
              )}

              {preamp && (
                <g>
                  {/* Q1 : émetteur → R_E → masse */}
                  <line x1={q1x - 26} y1={PAD} x2={q1x - 26} y2={reCy - 22} {...W} />
                  <Res x={q1x - 26} y={reCy} label="R_E" value={fmtR(amp.reOhm)} />
                  <line x1={q1x - 26} y1={reCy + 22} x2={q1x - 26} y2={gnd} {...W} />
                  {/* Q1 : base ← entrée */}
                  <polyline points={`${q1x},${PAD} ${q1x},222 90,222`} {...W} />
                  {/* Q1 : collecteur → 12k → +V, et vers la base de Q2 */}
                  <polyline points={`${q1x + 26},${PAD} ${q1x + 26},232 ${q2x},232 ${q2x},${PAD}`} {...W} />
                  <line x1="240" y1="34" x2="240" y2="68" {...W} />
                  <Res x={240} y={90} label="12k" value="" />
                  <line x1="240" y1="112" x2="240" y2="232" {...W} />
                  <Dot x={240} y={232} />
                  {/* Q2 PNP : émetteur → +V */}
                  <polyline points={`${q2x - 26},${PAD} ${q2x - 26},216 328,216 328,34`} {...W} />
                  <Dot x={328} y={34} />
                  {/* Q2 : collecteur → sortie, charge 10k, contre-réaction */}
                  <polyline points={`${q2x + 26},${PAD} ${q2x + 26},${gnd - 44}`} {...WO} />
                  <Res x={q2x + 26} y={gnd - 22} label="10k" value="" />
                  <polyline points={`${q2x + 26},226 470,226`} {...WO} />
                  <Dot x={q2x + 26} y={226} />
                  <polyline points={`${q2x + 26},244 ${q1x - 26},244`} stroke="#a78bfa" strokeWidth="3.5" strokeDasharray="6 4" fill="none" opacity="0.95" />
                  <Dot x={q2x + 26} y={244} />
                  <Dot x={q1x - 26} y={244} />
                  <Res x={265} y={244} label="R_F" value={fmtR(amp.rfOhm)} horizontal />
                  <text x="265" y="284" textAnchor="middle" fontSize="9" fill="#ddd6fe">{tr(lang, 'contre-réaction', 'تغذية عكسية', 'feedback')}</text>
                  <TransistorTO92 cx={q1x} topY={TOP} label="Q1" sub="BC547" compId="Q1" active onSelect={noop} />
                  <TransistorTO92 cx={q2x} topY={TOP} label="Q2" sub="BC557" compId="Q2" active isPnp onSelect={noop} />
                  {/* Entrée / sortie */}
                  <circle cx="90" cy="222" r="5" fill="#38bdf8" />
                  <text x="90" y="209" textAnchor="middle" fontSize="10" fill="#bae6fd" fontWeight="700">V_in</text>
                  <path d={wavePath(amp.vin, 12, 56, 250, 16 / vinMax, phase, 1.5)} fill="none" stroke="#38bdf8" strokeWidth="2.4" strokeLinejoin="round" />
                  <circle cx="470" cy="226" r="5" fill="#f59e0b" />
                  <text x="470" y="212" textAnchor="middle" fontSize="10" fill="#fde68a" fontWeight="700">V_out</text>
                  <path d={wavePath(amp.vout, 478, 60, 262, 22 / voutMax, phase, 1.5)} fill="none" stroke={amp.clipped ? '#ef4444' : '#f59e0b'} strokeWidth="2.6" strokeLinejoin="round" />
                  <text x="548" y="196" textAnchor="end" fontSize="9.5" fill="#fef3c7">{tr(lang, 'amplitude réelle : ', 'السعة الفعلية: ', 'real amplitude: ')}{fmtV(amp.voutPeakV)}</text>
                  <text x="28" y="60" fontSize="9" fill="#d1fae5">{tr(lang, 'polarisation simplifiée', 'تحيّز مبسّط', 'simplified bias')}</text>
                </g>
              )}
            </svg>
          </div>
        </PcbShell>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Analogie du levier : le rapport des bras est le gain (échelle logarithmique)
// ---------------------------------------------------------------------------------------------
export const AmplifierAnalogy: React.FC<ViewProps & { analogyTitle: string; analogyText: string }> = ({
  params,
  lang,
  analogyTitle,
  analogyText,
}) => {
  const amp = useAmp(params);
  const phase = usePhase(3000);
  const gain = Math.max(1.01, Math.abs(amp.avMeasured));
  const inverted = amp.avSmallSignal < 0;
  // Longueur du bras de sortie en échelle logarithmique : le gain réel est donné en chiffres.
  const arm = 36 + (190 * Math.log10(gain)) / Math.log10(500);
  const inArm = 36;
  const pivotX = inverted ? 150 : 60;
  const theta = 0.18 * Math.sin(2 * Math.PI * phase) * (amp.clipped ? 0.8 : 1);
  const deg = (theta * 180) / Math.PI;
  const left = inverted ? -inArm : 0;
  const right = inverted ? arm : inArm + arm;
  const inPt = inverted ? -inArm : inArm;
  const outPt = right;

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 flex flex-col gap-3 bg-white dark:bg-stone-900/60">
      <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">{analogyTitle}</div>
      <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{analogyText}</p>
      <svg viewBox="0 0 420 190" className="w-full h-auto" direction="ltr" role="img"
        aria-label={tr(lang, 'Levier dont le rapport des bras représente le gain', 'رافعة نسبة ذراعيها تمثل الكسب', 'Lever whose arm ratio represents the gain')}>
        <line x1="10" y1="150" x2="410" y2="150" stroke="currentColor" opacity="0.25" strokeWidth="2" />
        <polygon points={`${pivotX - 14},150 ${pivotX + 14},150 ${pivotX},128`} fill="#78716c" />
        <g transform={`translate(${pivotX} 128) rotate(${inverted ? -deg : -deg})`}>
          <line x1={left} y1="0" x2={right} y2="0" stroke="#a16207" strokeWidth="7" strokeLinecap="round" />
          <circle cx={inPt} cy="0" r="7" fill="#38bdf8" />
          <circle cx={outPt} cy="0" r="9" fill={amp.clipped ? '#ef4444' : '#f59e0b'} />
        </g>
        <text x={pivotX + inPt - 6} y="176" fontSize="11" fill="#0284c7" textAnchor="middle">{tr(lang, 'entrée', 'الدخل', 'input')}</text>
        <text x={pivotX + outPt} y="176" fontSize="11" fill="#b45309" textAnchor="middle">{tr(lang, 'sortie', 'الخرج', 'output')}</text>
        <text x="410" y="20" fontSize="12" textAnchor="end" fill="currentColor" fontWeight="700">
          A_v = {inverted ? '−' : '+'}{Math.abs(amp.avMeasured).toFixed(1)}
        </text>
        <text x="410" y="36" fontSize="9.5" textAnchor="end" fill="currentColor" opacity="0.6">
          {tr(lang, 'longueur des bras en échelle logarithmique', 'طول الذراعين بمقياس لوغاريتمي', 'arm lengths on a logarithmic scale')}
        </text>
        <text x="410" y="52" fontSize="9.5" textAnchor="end" fill="currentColor" opacity="0.6">
          {inverted
            ? tr(lang, 'bascule : l’entrée monte, la sortie descend', 'أرجوحة: يرتفع الدخل فينخفض الخرج', 'see-saw: input up, output down')
            : tr(lang, 'même sens : entrée et sortie montent ensemble', 'بنفس الاتجاه: يرتفعان معاً', 'same direction: both rise together')}
        </text>
      </svg>
    </div>
  );
};
