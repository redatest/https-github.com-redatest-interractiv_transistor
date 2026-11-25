import React from 'react';
import { Lang, tr } from '../types';
import { KirchhoffSimParams, KirchhoffSimReadout } from '../utils/kirchhoffPhysics';

interface Props {
  params: KirchhoffSimParams;
  sim: KirchhoffSimReadout;
  lang: Lang;
}

export const KirchhoffSchematicScope: React.FC<Props> = ({ params, sim, lang }) => {
  const top = params.topology;
  const formatOhm = (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}kΩ` : `${val}Ω`);

  // Build exact KVL & KCL equations text for live verification
  let kvlEqText = '';
  if (top === 'series-2r' || top === 'led-series-kvl' || top === 'internal-resistance') {
    const firstDrop = top === 'internal-resistance' ? sim.uInternal : sim.u1;
    const secondDrop = top === 'internal-resistance' ? sim.uLoad : sim.u2;
    kvlEqText = `+${params.e1.toFixed(2)}V − ${firstDrop.toFixed(2)}V − ${secondDrop.toFixed(2)}V = ${sim.kvlLoop1ResidualV.toFixed(2)}V`;
  } else if (top === 'series-3r') {
    kvlEqText = `+${params.e1.toFixed(2)}V − ${sim.u1.toFixed(2)}V − ${sim.u2.toFixed(2)}V − ${sim.u3.toFixed(2)}V = ${sim.kvlLoop1ResidualV.toFixed(2)}V`;
  } else if (top === 'dual-sources') {
    const signStr = params.secondSourceOpposing ? `− ${params.e2.toFixed(2)}V` : `+ ${params.e2.toFixed(2)}V`;
    kvlEqText = `+${params.e1.toFixed(2)}V ${signStr} − (${sim.u1.toFixed(2)}V + ${sim.u2.toFixed(2)}V) = ${sim.kvlLoop1ResidualV.toFixed(2)}V`;
  } else if (top === 'two-mesh-millman') {
    kvlEqText = `M1: +${params.e1.toFixed(2)} − ${sim.u1.toFixed(2)} − ${sim.u3.toFixed(2)} = ${sim.kvlLoop1ResidualV.toFixed(2)}V  |  M2: +${params.e2.toFixed(2)} − ${sim.u2.toFixed(2)} − ${sim.u3.toFixed(2)} = ${sim.kvlLoop2ResidualV.toFixed(2)}V`;
  } else if (top === 'wheatstone-bridge') {
    kvlEqText = `M_G: +${params.e1.toFixed(2)} − ${sim.u1.toFixed(2)} − ${sim.u2.toFixed(2)} = ${sim.kvlLoop1ResidualV.toFixed(2)}V  |  ΔV_AB = ${(sim.vA - sim.vB).toFixed(2)}V`;
  } else if (top === 'thevenin-equiv') {
    kvlEqText = `E_th (${sim.eTh.toFixed(2)}V) − R_th·I_L (${sim.u3.toFixed(2)}V) − V_L (${sim.uLoad.toFixed(2)}V) = ${sim.kvlLoop1ResidualV.toFixed(2)}V`;
  } else {
    kvlEqText = `M1: +${params.e1.toFixed(2)}V − ${sim.u1.toFixed(2)}V − ${sim.vOut.toFixed(2)}V = ${sim.kvlLoop1ResidualV.toFixed(2)}V`;
  }

  let kclEqText = '';
  if (top === 'loaded-divider') {
    kclEqText = `Nœud A : I₁ (${sim.i1MA.toFixed(2)}) = I₂ (${sim.i2MA.toFixed(2)}) + I_L (${sim.iLoadMA.toFixed(2)}) mA`;
  } else if (top === 'thevenin-equiv') {
    kclEqText = `R_th = ${sim.rTh.toFixed(0)} Ω · I_N = ${sim.iNortonMA.toFixed(2)} mA · I_L = ${sim.iLoadMA.toFixed(2)} mA`;
  } else if (top === 'parallel-2' || top === 'led-parallel-trap') {
    kclEqText = `Nœud A : I_tot (${sim.iTotalMA.toFixed(2)}) = I₁ (${sim.i1MA.toFixed(2)}) + I₂ (${sim.i2MA.toFixed(2)}) mA`;
  } else if (top === 'parallel-3') {
    kclEqText = `Nœud A : I_tot (${sim.iTotalMA.toFixed(2)}) = ${sim.i1MA.toFixed(1)} + ${sim.i2MA.toFixed(1)} + ${sim.i3MA.toFixed(1)} mA`;
  } else if (top === 'two-mesh-millman') {
    kclEqText = `Nœud A : I₁ (${sim.i1MA.toFixed(2)}) + I₂ (${sim.i2MA.toFixed(2)}) = I₃ (${sim.i3MA.toFixed(2)}) mA`;
  } else {
    kclEqText = `Série : I = ${sim.iTotalMA.toFixed(2)} mA constant dans toute la maille`;
  }

  // Bar data for visual distribution
  const maxV = Math.max(params.e1, params.e2, 5);
  const bars =
    top === 'thevenin-equiv'
      ? [
          { label: 'E_th (vide)', val: sim.eTh, unit: 'V', color: 'bg-emerald-500', pct: Math.min(100, (sim.eTh / maxV) * 100) },
          { label: 'R_th · I_L', val: sim.u3, unit: 'V', color: 'bg-amber-500', pct: Math.min(100, (sim.u3 / maxV) * 100) },
          { label: 'V_L (A–B)', val: sim.uLoad, unit: 'V', color: 'bg-sky-500', pct: Math.min(100, (sim.uLoad / maxV) * 100) },
        ]
      : [
          { label: top === 'internal-resistance' ? 'U(r_i)' : 'U₁', val: top === 'internal-resistance' ? sim.uInternal : Math.abs(sim.u1), unit: 'V', color: 'bg-amber-500', pct: Math.min(100, ((top === 'internal-resistance' ? sim.uInternal : Math.abs(sim.u1)) / maxV) * 100) },
          { label: top === 'internal-resistance' ? 'V_bornes' : 'U₂ / V_A', val: top === 'internal-resistance' ? sim.uLoad : Math.abs(sim.u2), unit: 'V', color: 'bg-sky-500', pct: Math.min(100, ((top === 'internal-resistance' ? sim.uLoad : Math.abs(sim.u2)) / maxV) * 100) },
          ...(top === 'series-3r' || top === 'two-mesh-millman'
            ? [{ label: 'U₃', val: Math.abs(sim.u3), unit: 'V', color: 'bg-emerald-500', pct: Math.min(100, (Math.abs(sim.u3) / maxV) * 100) }]
            : []),
        ];

  return (
    <div className="flex flex-col gap-3">
      <div className="schematic-grid rounded-xl border border-stone-300 dark:border-stone-700 p-4">
        <div className="flex items-center justify-between text-xs font-mono-num text-stone-600 dark:text-stone-300 mb-2">
          <span>{tr(lang, 'Schéma IEEE & Sens Conventionnels', 'المخطط القياسي واتجاهات الجهد والتيار', 'IEEE Schematic & Loop Orientation')}</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
            V_A = {sim.vA.toFixed(2)} V
          </span>
        </div>

        {/* Clean IEEE Schematic SVG */}
        <svg viewBox="0 0 480 215" className="w-full h-auto" direction="ltr">
          <defs>
            <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#d97706" />
            </marker>
            <marker id="arrowSky" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#0284c7" />
            </marker>
            <marker id="arrowEmerald" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#059669" />
            </marker>
          </defs>

          {/* Left Voltage Source E1 */}
          <line x1="65" y1="35" x2="65" y2="85" stroke="#475569" strokeWidth="2.2" />
          <line x1="65" y1="125" x2="65" y2="180" stroke="#475569" strokeWidth="2.2" />
          <circle cx="65" cy="105" r="20" fill="#ffffff" stroke="#d97706" strokeWidth="2.2" />
          <text x="65" y="99" textAnchor="middle" fontSize="11" fontWeight="800" fill="#d97706">+</text>
          <text x="65" y="117" textAnchor="middle" fontSize="12" fontWeight="800" fill="#475569">−</text>
          <text x="36" y="108" textAnchor="end" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#b45309">
            E₁={params.e1.toFixed(1)}V
          </text>

          {/* Top rail & R1 */}
          <line x1="65" y1="35" x2="140" y2="35" stroke="#475569" strokeWidth="2.2" />
          <rect x="140" y="25" width="60" height="20" rx="2" fill="#fffbeb" stroke="#d97706" strokeWidth="2" />
          <text x="170" y="38" textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#92400e">
            {top === 'internal-resistance' ? `r_i ${params.rInternal}Ω` : `R₁ ${formatOhm(params.r1)}`}
          </text>
          <text x="170" y="17" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#0284c7">
            U₁ = {(top === 'internal-resistance' ? sim.uInternal : sim.u1).toFixed(2)}V
          </text>

          {/* Wire from R1 to Junction A */}
          <line x1="200" y1="35" x2="275" y2="35" stroke="#475569" strokeWidth="2.2" markerEnd="url(#arrowAmber)" />
          <circle cx="275" cy="35" r="4.5" fill="#0284c7" />
          <text x="275" y="21" textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#0284c7">
            A ({sim.vA.toFixed(2)}V)
          </text>

          {/* Center vertical branch (R2 or R3) */}
          <line x1="275" y1="35" x2="275" y2="80" stroke="#475569" strokeWidth="2.2" />
          <rect x="263" y="80" width="24" height="54" rx="2" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
          <text x="295" y="102" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#0369a1">
            {top === 'two-mesh-millman' ? `R₃ ${formatOhm(params.r3)}` : `R₂ ${formatOhm(params.r2)}`}
          </text>
          <text x="295" y="115" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#059669">
            {top === 'two-mesh-millman' ? `${sim.i3MA.toFixed(1)}mA` : `${sim.u2.toFixed(2)}V`}
          </text>
          <line x1="275" y1="134" x2="275" y2="180" stroke="#475569" strokeWidth="2.2" />

          {/* Optional Right Mesh / Load / Second Source */}
          {(top === 'loaded-divider' || top === 'parallel-2' || top === 'parallel-3' || top === 'two-mesh-millman' || top === 'dual-sources' || top === 'wheatstone-bridge' || top === 'led-parallel-trap' || top === 'thevenin-equiv') && (
            <g>
              <line x1="275" y1="35" x2="410" y2="35" stroke="#475569" strokeWidth="2.2" />
              {top === 'two-mesh-millman' && (
                <>
                  <rect x="315" y="25" width="55" height="20" rx="2" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
                  <text x="342" y="38" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#0369a1">
                    R₂ {formatOhm(params.r2)}
                  </text>
                </>
              )}
              <line x1="410" y1="35" x2="410" y2="80" stroke="#475569" strokeWidth="2.2" />
              {top === 'dual-sources' || top === 'two-mesh-millman' ? (
                <>
                  <circle cx="410" cy="105" r="20" fill="#ffffff" stroke="#0284c7" strokeWidth="2.2" />
                  <text x="410" y="99" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0284c7">
                    {top === 'dual-sources' && !params.secondSourceOpposing ? '−' : '+'}
                  </text>
                  <text x="410" y="117" textAnchor="middle" fontSize="12" fontWeight="800" fill="#475569">
                    {top === 'dual-sources' && !params.secondSourceOpposing ? '+' : '−'}
                  </text>
                  <text x="435" y="108" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#0369a1">
                    E₂={params.e2.toFixed(1)}V
                  </text>
                </>
              ) : (
                <>
                  <rect x="398" y="80" width="24" height="54" rx="2" fill="#fff7ed" stroke="#ea580c" strokeWidth="2" />
                  <text x="428" y="104" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#c2410c">
                    {top === 'loaded-divider' || top === 'thevenin-equiv' ? `R_L` : top === 'wheatstone-bridge' ? `B (${sim.vB.toFixed(1)}V)` : `R_br`}
                  </text>
                  <text x="428" y="117" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#ea580c">
                    {top === 'loaded-divider' || top === 'thevenin-equiv' ? `${sim.iLoadMA.toFixed(1)}mA` : `${sim.i2MA.toFixed(1)}mA`}
                  </text>
                </>
              )}
              <line x1="410" y1="125" x2="410" y2="180" stroke="#475569" strokeWidth="2.2" />
              <line x1="275" y1="180" x2="410" y2="180" stroke="#475569" strokeWidth="2.2" />

              {/* Mesh 2 Loop Arrow */}
              <path
                d="M 320 148 A 26 26 0 1 1 368 148"
                fill="none"
                stroke="#059669"
                strokeWidth="1.6"
                strokeDasharray="3 3"
                markerEnd="url(#arrowEmerald)"
              />
              <text x="344" y="138" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#059669">
                M2
              </text>
            </g>
          )}

          {/* Ground Return Rail */}
          <line x1="65" y1="180" x2="275" y2="180" stroke="#475569" strokeWidth="2.2" />
          <line x1="160" y1="180" x2="160" y2="195" stroke="#475569" strokeWidth="2" />
          <line x1="148" y1="195" x2="172" y2="195" stroke="#475569" strokeWidth="2" />
          <line x1="152" y1="200" x2="168" y2="200" stroke="#475569" strokeWidth="2" />
          <line x1="156" y1="205" x2="164" y2="205" stroke="#475569" strokeWidth="2" />

          {/* Mesh 1 Loop Arrow */}
          <path
            d="M 140 135 A 30 30 0 1 1 200 135"
            fill="none"
            stroke="#0284c7"
            strokeWidth="1.6"
            strokeDasharray="3 3"
            markerEnd="url(#arrowSky)"
          />
          <text x="170" y="122" textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#0284c7">
            M1 ({sim.i1MA.toFixed(1)}mA)
          </text>
        </svg>

        {/* Live Equation Proof Box */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-mono-num">
          <div className="rounded-lg bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 p-2.5">
            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
              {tr(lang, 'Vérification Maille (KVL)', 'تحقق قانون الحلقات (KVL)', 'KVL Loop Check')}
            </div>
            <div className="text-stone-800 dark:text-stone-200 mt-1 break-words" dir="ltr">
              {kvlEqText}
            </div>
          </div>
          <div className="rounded-lg bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 p-2.5">
            <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400">
              {tr(lang, 'Vérification Nœud (KCL)', 'تحقق قانون العقد (KCL)', 'KCL Node Check')}
            </div>
            <div className="text-stone-800 dark:text-stone-200 mt-1 break-words" dir="ltr">
              {kclEqText}
            </div>
          </div>
        </div>
      </div>

      {/* Voltage Drop Distribution Meter */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-3.5">
        <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2.5">
          {tr(lang, 'Répartition des tensions dans la boucle', 'توزع هبوطات الجهد داخل الحلقة', 'Voltage Drop Distribution Across Loop')}
        </div>
        <div className="flex flex-col gap-2">
          {bars.map((b) => (
            <div key={b.label} className="flex items-center gap-3 text-xs font-mono-num">
              <span className="w-20 text-stone-600 dark:text-stone-400 shrink-0">{b.label}</span>
              <div className="flex-1 h-2.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <div className={`h-full ${b.color} transition-all duration-200`} style={{ width: `${b.pct}%` }} />
              </div>
              <span className="w-16 text-end font-bold text-stone-800 dark:text-stone-200">
                {b.val.toFixed(2)} {b.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
