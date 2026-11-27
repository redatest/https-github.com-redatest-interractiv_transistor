import React, { useEffect, useMemo, useState } from 'react';
import { Lang, tr } from '../types';
import { SimParams } from '../utils/physics';
import { AmpResult, ampParamsFromSim, computeAmplifier } from '../utils/amplifier';
import { PcbShell, usePcbTilt } from './PcbShell';

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

/** Symbole de transistor : pattes collecteur/émetteur en x+4 (haut/bas), base à gauche. PNP : émetteur en haut. */
const Npn: React.FC<{ x: number; y: number; label: string; pnp?: boolean }> = ({ x, y, label, pnp }) => {
  // Diagonale côté haut : (-8,-5) → (4,-15) ; côté bas : (-8,5) → (4,15)
  const arrow = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const tx = x1 + dx * 0.88;
    const ty = y1 + dy * 0.88;
    const px = -uy;
    const py = ux;
    return `${tx},${ty} ${tx - 7 * ux + 3.2 * px},${ty - 7 * uy + 3.2 * py} ${tx - 7 * ux - 3.2 * px},${ty - 7 * uy - 3.2 * py}`;
  };
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="22" fill="#111827" stroke="#9ca3af" strokeWidth="2" />
      <line x1="-8" y1="-12" x2="-8" y2="12" stroke="#e5e7eb" strokeWidth="3.2" />
      <polyline points="-8,-5 4,-15 4,-22" fill="none" stroke="#e5e7eb" strokeWidth="2.2" />
      <polyline points="-8,5 4,15 4,22" fill="none" stroke="#e5e7eb" strokeWidth="2.2" />
      {pnp ? (
        // émetteur en haut, flèche vers la base
        <polygon points={arrow(4, -15, -8, -5)} fill="#e5e7eb" />
      ) : (
        // émetteur en bas, flèche vers l'extérieur
        <polygon points={arrow(-8, 5, 4, 15)} fill="#e5e7eb" />
      )}
      <text x="30" y="4" textAnchor="start" fontSize="10" fill="#fef3c7" fontWeight="700">{label}</text>
    </g>
  );
};

export const AmplifierBoard: React.FC<ViewProps> = ({ params, lang }) => {
  const amp = useAmp(params);
  const tilt = usePcbTilt({ rx: 10, rz: 0 }, { rxMin: 4, rxMax: 34, rzMax: 18 });
  const phase = usePhase(3500);
  const preamp = amp.mode === 'preamp';
  const inverted = amp.avSmallSignal < 0;
  const vinMax = Math.max(1e-6, Math.max(...amp.vin.map(Math.abs)));
  const voutMax = Math.max(1e-6, Math.max(...amp.vout.map(Math.abs)));
  const wInX = 48;
  const outX = preamp ? 500 : 420;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono-num">
        <span className="px-2 py-1 rounded-md bg-stone-900 text-amber-300">
          A_v {inverted ? '−' : '+'}{Math.abs(amp.avMeasured).toFixed(1)} · {amp.gainDb.toFixed(1)} dB
        </span>
        <span className="px-2 py-1 rounded-md bg-stone-900 text-sky-300">V_in {fmtV(params.ampVinMV !== undefined ? params.ampVinMV / 1000 : Math.max(...amp.vin))}</span>
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
            <svg viewBox="0 0 560 300" className="w-full h-auto" direction="ltr">
              {/* Rails */}
              <line x1="30" y1="34" x2="540" y2="34" stroke="#d4af37" strokeWidth="5" opacity="0.85" />
              <text x="34" y="26" fontSize="11" fill="#fde68a" fontWeight="700">+{amp.vcc} V</text>
              <line x1="30" y1="272" x2="540" y2="272" stroke="#6fd7a6" strokeWidth="5" opacity="0.7" />
              <text x="34" y="289" fontSize="11" fill="#d1fae5" fontWeight="700">0 V</text>

              {!preamp && (
                <g>
                  {/* R_C */}
                  <line x1="290" y1="34" x2="290" y2="68" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  <Res x={290} y={90} label="R_C" value={fmtR(amp.rcOhm)} />
                  <line x1="290" y1="112" x2="290" y2="148" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  {/* Transistor */}
                  <Npn x={286} y={165} label="BC547" />
                  {/* Émetteur */}
                  <line x1="290" y1="187" x2="290" y2={amp.reOhm > 0 ? 205 : 272} stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  {amp.reOhm > 0 && (
                    <g>
                      <Res x={290} y={227} label="R_E" value={fmtR(amp.reOhm)} />
                      <line x1="290" y1="249" x2="290" y2="272" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                    </g>
                  )}
                  {/* Base */}
                  <line x1="116" y1="165" x2="264" y2="165" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  <rect x="140" y="152" width="8" height="26" fill="#38bdf8" opacity="0.85" />
                  <rect x="154" y="152" width="8" height="26" fill="#38bdf8" opacity="0.85" />
                  <text x="151" y="146" textAnchor="middle" fontSize="9" fill="#bae6fd">C</text>
                  <text x="116" y="214" fontSize="9.5" fill="#d1fae5">{tr(lang, 'R_B fixe le repos : I_C = ', 'R_B تحدد الراحة: I_C = ', 'R_B sets rest: I_C = ')}{(amp.icA * 1e6).toFixed(0)} µA</text>
                  {/* Collecteur → sortie */}
                  <line x1="290" y1="112" x2="290" y2="125" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  <line x1="290" y1="128" x2="400" y2="128" stroke="#f59e0b" strokeWidth="4" opacity="0.85" />
                  <text x="296" y="122" fontSize="10" fill="#fde68a">V_C = {amp.vc0.toFixed(2)} V</text>
                </g>
              )}

              {preamp && (
                <g>
                  {/* Q1 */}
                  <line x1="150" y1="34" x2="150" y2="62" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  <Res x={150} y={84} label="12k" value="" />
                  <line x1="150" y1="106" x2="150" y2="143" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  <Npn x={146} y={165} label="Q1" />
                  <line x1="150" y1="187" x2="150" y2="205" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  <Res x={150} y={227} label="R_E" value={fmtR(amp.reOhm)} />
                  <line x1="150" y1="249" x2="150" y2="272" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  <line x1="72" y1="165" x2="124" y2="165" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  {/* Q1 collecteur -> base Q2 */}
                  <line x1="150" y1="143" x2="150" y2="118" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  <polyline points="150,118 250,118 250,138 328,138" fill="none" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  {/* Q2 PNP */}
                  <Npn x={346} y={160} label="Q2" pnp />
                  <line x1="350" y1="138" x2="350" y2="34" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  <line x1="350" y1="182" x2="350" y2="215" stroke="#f59e0b" strokeWidth="4" opacity="0.85" />
                  <Res x={350} y={237} label="10k" value="" />
                  <line x1="350" y1="259" x2="350" y2="272" stroke="#6fd7a6" strokeWidth="4" opacity="0.8" />
                  {/* Contre-réaction R_F : sortie -> émetteur Q1 */}
                  <line x1="350" y1="200" x2="150" y2="200" stroke="#a78bfa" strokeWidth="3.5" strokeDasharray="6 4" opacity="0.95" />
                  <Res x={250} y={200} label="R_F" value={fmtR(amp.rfOhm)} horizontal />
                  <text x="250" y="236" textAnchor="middle" fontSize="9" fill="#ddd6fe">{tr(lang, 'contre-réaction', 'تغذية عكسية', 'feedback')}</text>
                  <line x1="350" y1="200" x2="470" y2="200" stroke="#f59e0b" strokeWidth="4" opacity="0.85" />
                </g>
              )}

              {/* Entrée */}
              <circle cx={preamp ? 72 : 116} cy="165" r="5" fill="#38bdf8" />
              <text x={preamp ? 36 : 60} y="150" fontSize="10" fill="#bae6fd" fontWeight="700">V_in</text>
              <path
                d={wavePath(amp.vin, wInX - 28, 56, 195, 18 / vinMax, phase, 1.5)}
                transform={preamp ? 'translate(-6 0)' : 'translate(0 0)'}
                fill="none" stroke="#38bdf8" strokeWidth="2.4" strokeLinejoin="round"
              />
              {/* Sortie */}
              <circle cx={outX - (preamp ? 30 : 20)} cy={preamp ? 200 : 128} r="5" fill="#f59e0b" />
              <text x={outX - (preamp ? 52 : 42)} y={preamp ? 186 : 112} fontSize="10" fill="#fde68a" fontWeight="700">V_out</text>
              <path
                d={wavePath(amp.vout, outX - (preamp ? 24 : 14), 54, preamp ? 224 : 152, 22 / voutMax, phase, 1.5)}
                fill="none" stroke={amp.clipped ? '#ef4444' : '#f59e0b'} strokeWidth="2.6" strokeLinejoin="round"
              />
              <text x={preamp ? 548 : 540} y={preamp ? 166 : 196} textAnchor="end" fontSize="9.5" fill="#fef3c7">
                {tr(lang, 'amplitude réelle : ', 'السعة الفعلية: ', 'real amplitude: ')}{fmtV(amp.voutPeakV)}
              </text>
              {preamp && (
                <text x="136" y="122" textAnchor="end" fontSize="8.5" fill="#d1fae5">
                  {tr(lang, 'polarisation simplifiée', 'تحيّز مبسّط', 'simplified bias')}
                </text>
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
