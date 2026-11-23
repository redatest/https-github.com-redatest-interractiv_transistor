import React from 'react';
import { Lang, tr } from '../types';
import { MosfetSimParams, MosfetSimReadout } from '../utils/mosfetPhysics';

interface Props {
  params: MosfetSimParams;
  sim: MosfetSimReadout;
  lang: Lang;
}

export const MosfetSchematicScope: React.FC<Props> = ({ params, sim, lang }) => {
  const cid = params.catalogId;
  const isPMOS =
    params.fetPolarity === 'PMOS' ||
    params.exampleId === 'pmos-reverse-polarity' ||
    params.exampleId === 'pmos-highside' ||
    cid === 'mos-pmos-highside' ||
    cid === 'mos-reverse-polarity';
  const isCMOS = params.chapterId === 4 || cid === 'mos-cmos-inverter';
  const isBoost = params.chapterId === 7 || cid === 'mos-boost-12v';
  const isHBridge =
    params.chapterId === 8 &&
    (params.exampleId === 'h-bridge-motor' || params.exampleId === 'hbridge-motor' || cid === 'mos-hbridge-drive');
  const isPWMOrMiller = params.chapterId === 5 || cid === 'mos-audio-pwm';
  const isFlyback = params.chapterId === 6 || cid === 'mos-flyback-clamp';

  const chWidth = sim.conducting ? (sim.region === 'ohmic' ? 5 : 2.5) : 1.5;

  // Transfer curve I_D vs V_GS (for Ch1/Ch2) or Miller/PWM/Spike/Boost oscilloscope curve
  const scopeTitle = isCMOS
    ? tr(lang, 'Courbe transfert & Shoot-Through', 'منحنى النقل وتيار القصر', 'Transfer & Shoot-Through Scope')
    : isPWMOrMiller
    ? tr(lang, 'Charge Grille V_GS(t) & Plateau Miller', 'شحن البوابة وهضبة ميلر', 'Gate V_GS(t) & Miller Plateau')
    : isFlyback
    ? tr(lang, 'Tension Drain V_DS à la coupure', 'جهد المصرف عند الفصل', 'Drain Voltage V_DS Turn-off Spike')
    : isBoost
    ? tr(lang, 'Onde V_out élévateur Boost', 'موجة الخرج Boost', 'Boost Converter V_out Waveform')
    : tr(lang, 'Courbe R_DS(on) vs V_GS', 'منحنى R_DS(on) مقابل V_GS', 'Channel R_DS(on) vs V_GS Curve');

  // Generate dynamic oscilloscope SVG path (x from 10..230, y from 20..150)
  const buildWavePath = () => {
    if (isPWMOrMiller) {
      // Miller plateau shape modulated by R_G
      const slope = Math.min(48, Math.max(8, params.rgOhms / 22));
      const x1 = 42 + slope * 0.4;
      const x2 = x1 + slope * 0.9;
      const x3 = x2 + slope * 0.5;
      return `M 12 140 H 42 L ${x1.toFixed(0)} 82 H ${x2.toFixed(0)} L ${x3.toFixed(0)} 34 H 228`;
    }
    if (isFlyback) {
      if (!params.flybackInstalled && !params.reverseBodyTest) {
        return 'M 12 135 H 92 V 18 L 116 112 L 130 98 H 228';
      }
      return 'M 12 135 H 92 V 104 H 136 L 146 112 H 228';
    }
    if (isCMOS) {
      const midX = 12 + (params.cmosVin / 5) * 212;
      return `M 12 36 H 76 L 122 142 H 228 M ${midX.toFixed(0)} 24 V 150`;
    }
    if (isBoost) {
      const amp = Math.min(95, (sim.vout / 24) * 95);
      const yLevel = 142 - amp;
      return `M 12 142 Q 55 ${yLevel + 18}, 100 ${yLevel} T 228 ${yLevel}`;
    }
    // Default Transfer / R_DS saturation curve
    const vthX = 12 + (sim.vth / 12) * 212;
    const curX = 12 + (Math.min(12, Math.abs(sim.vgs)) / 12) * 212;
    const curY = sim.conducting ? Math.max(30, 142 - (sim.idA / Math.max(0.5, params.loadCurrentA + 1)) * 105) : 142;
    return `M 12 142 H ${vthX.toFixed(0)} Q ${(vthX + 26).toFixed(0)} 110, 150 38 H 228 M ${curX.toFixed(0)} 148 V ${curY.toFixed(0)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left: IEEE MOSFET Schematic */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/75 p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono-num text-stone-500 dark:text-stone-400">
          <span>{tr(lang, 'Schéma IEEE Normalisé', 'المخطط المعياري IEEE', 'Standard IEEE Schematic')}</span>
          <span className="font-bold text-sky-700 dark:text-sky-400">
            {isHBridge ? '4×MOS H-BRIDGE' : isCMOS ? 'CMOS PAIR' : isPMOS ? 'P-MOS ENH' : 'N-MOS ENH'}
          </span>
        </div>

        <div className="schematic-grid rounded-lg border border-stone-200 dark:border-stone-800 p-3 flex items-center justify-center">
          <svg viewBox="0 0 260 190" className="w-full max-w-[270px] h-auto" direction="ltr">
            {/* Supply & Ground */}
            <line x1="150" y1="16" x2="150" y2="38" stroke="#f59e0b" strokeWidth="2.5" />
            <text x="150" y="12" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#d97706">
              +{isCMOS ? '5.0' : params.vdd.toFixed(0)}V
            </text>

            {/* Load resistor / inductor above Drain */}
            <rect
              x="139"
              y="38"
              width="22"
              height="34"
              rx="3"
              fill={sim.conducting ? '#fef3c7' : 'none'}
              stroke="#d97706"
              strokeWidth="2"
            />
            <text x="172" y="59" fontSize="10" fontFamily="monospace" fill="#64748b">
              {isBoost ? 'L' : 'LOAD'}
            </text>

            {/* Drain Wire */}
            <line x1="150" y1="72" x2="150" y2="96" stroke={sim.conducting ? '#f59e0b' : '#64748b'} strokeWidth="2.5" />
            <text x="160" y="88" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#d97706">D</text>

            {/* MOSFET Circle */}
            <circle cx="136" cy="116" r="32" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* Insulated Gate vertical plate + oxide gap */}
            <line x1="60" y1="128" x2="112" y2="128" stroke="#0284c7" strokeWidth="2.5" />
            <line x1="112" y1="96" x2="112" y2="136" stroke="#0284c7" strokeWidth="3" />
            <text x="54" y="132" textAnchor="end" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#0284c7">G</text>
            <text x="72" y="118" fontSize="9.5" fontFamily="monospace" fill="#0284c7">
              {sim.vgs.toFixed(1)}V
            </text>

            {/* Broken Enhancement Channel Segments (3 segments = normally OFF) */}
            <line x1="123" y1="95" x2="123" y2="105" stroke={sim.conducting ? '#10b981' : '#64748b'} strokeWidth={chWidth} />
            <line x1="123" y1="111" x2="123" y2="121" stroke={sim.conducting ? '#10b981' : '#64748b'} strokeWidth={chWidth} />
            <line x1="123" y1="127" x2="123" y2="137" stroke={sim.conducting ? '#10b981' : '#64748b'} strokeWidth={chWidth} />

            {/* Induced inversion channel highlight when V_GS > V_th */}
            {sim.conducting && (
              <line x1="118" y1="96" x2="118" y2="136" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 2" />
            )}

            {/* Drain, Body & Source leads inside circle */}
            <line x1="123" y1="98" x2="150" y2="98" stroke="#64748b" strokeWidth="2" />
            <line x1="123" y1="116" x2="150" y2="116" stroke="#64748b" strokeWidth="2" />
            <line x1="123" y1="134" x2="150" y2="134" stroke="#64748b" strokeWidth="2" />

            {/* Arrow on substrate indicating N-MOS (points in) vs P-MOS (points out) */}
            {isPMOS ? (
              <polygon points="145,116 135,111 135,121" fill="#0284c7" />
            ) : (
              <polygon points="126,116 136,111 136,121" fill="#f59e0b" />
            )}

            {/* Source wire + Internal Body Diode */}
            <line x1="150" y1="116" x2="150" y2="168" stroke="#64748b" strokeWidth="2.5" />
            <text x="160" y="148" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#64748b">S</text>

            {/* Body Diode alongside D-S */}
            <line x1="150" y1="134" x2="184" y2="134" stroke="#94a3b8" strokeWidth="1.3" />
            <line x1="150" y1="98" x2="184" y2="98" stroke="#94a3b8" strokeWidth="1.3" />
            <line x1="184" y1="98" x2="184" y2="134" stroke={sim.bodyDiodeActive ? '#f43f5e' : '#94a3b8'} strokeWidth="1.5" />
            <polygon
              points={isPMOS ? '184,122 178,110 190,110' : '184,110 178,122 190,122'}
              fill={sim.bodyDiodeActive ? '#f43f5e' : '#94a3b8'}
            />
            <text x="194" y="120" fontSize="8.5" fontFamily="monospace" fill={sim.bodyDiodeActive ? '#f43f5e' : '#94a3b8'}>
              D_body
            </text>

            {/* Ground symbol */}
            <line x1="138" y1="168" x2="162" y2="168" stroke="#64748b" strokeWidth="2.5" />
            <line x1="142" y1="174" x2="158" y2="174" stroke="#64748b" strokeWidth="2" />
            <line x1="146" y1="180" x2="154" y2="180" stroke="#64748b" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Right: Live Characteristic / Oscilloscope */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-950 p-4 flex flex-col gap-2 text-stone-100">
        <div className="flex items-center justify-between text-xs font-mono-num">
          <span className="text-sky-400 font-semibold">{scopeTitle}</span>
          <span className="text-stone-400">SiO₂ · C_iss</span>
        </div>

        <svg viewBox="0 0 240 165" className="w-full h-auto bg-stone-900/80 rounded-lg border border-stone-800" direction="ltr">
          {/* Grid lines */}
          {[40, 75, 110, 142].map((y) => (
            <line key={y} x1="10" y1={y} x2="230" y2={y} stroke="#1e293b" strokeWidth="1" />
          ))}
          {[65, 120, 175].map((x) => (
            <line key={x} x1={x} y1="15" x2={x} y2="150" stroke="#1e293b" strokeWidth="1" />
          ))}

          {/* Signal Path */}
          <path
            d={buildWavePath()}
            fill="none"
            stroke={sim.shootThrough || sim.spikeV > 40 ? '#fb7185' : '#38bdf8'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Threshold / Operating readout label */}
          <text x="16" y="25" fontSize="9.5" fontFamily="monospace" fill="#fbbf24">
            {isPWMOrMiller
              ? `R_G=${params.rgOhms}Ω · f=${params.pwmFreqKHz}kHz`
              : isFlyback
              ? `V_DS(peak) = ${sim.spikeV.toFixed(0)} V`
              : isBoost
              ? `V_out = ${sim.vout.toFixed(1)} V (D=${params.boostDuty}%)`
              : `V_th=${sim.vth.toFixed(1)}V · I_D=${sim.idA.toFixed(2)}A`}
          </text>
        </svg>

        <div className="text-xs text-stone-300 font-mono-num flex items-center justify-between pt-1">
          <span>I_G = {sim.igNA.toFixed(1)} nA</span>
          <span className={sim.region === 'breakdown' ? 'text-rose-400 font-bold' : sim.region === 'linear' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
            {sim.region.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
