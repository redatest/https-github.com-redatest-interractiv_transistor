import React, { useState } from 'react';
import { Lang, tr } from '../types';
import { KirchhoffSimParams, KirchhoffSimReadout } from '../utils/kirchhoffPhysics';

interface Props {
  params: KirchhoffSimParams;
  sim: KirchhoffSimReadout;
  lang: Lang;
  onQuickAction?: (action: string) => void;
}

const PART_INFO: Record<string, { name: string; fr: string; ar: string; en: string }> = {
  e1: {
    name: 'Source E₁',
    fr: 'Élève le potentiel de 0 V à +E₁ dans le sens conventionnel (− vers +) pour alimenter les mailles.',
    ar: 'يرفع الجهد من 0V إلى +E₁ لإمداد الحلقات بالطاقة الكهربائية.',
    en: 'Lifts loop potential from 0 V up to +E₁ to drive current around the meshes.',
  },
  e2: {
    name: 'Source E₂',
    fr: 'Seconde source de tension : s’additionne (+E₂) ou s’oppose (−E₂) selon son orientation dans la maille.',
    ar: 'مصدر جهد ثانٍ: يُجمع (+E₂) أو يُطرح (−E₂) في معادلة الحلقة حسب قطبيته.',
    en: 'Second EMF source: adds (+E₂) or opposes (−E₂) in the KVL equation depending on polarity.',
  },
  nodeA: {
    name: 'Nœud A (KCL)',
    fr: 'Jonction de cuivre reliant ≥ 3 branches : ∑ I_entrants = ∑ I_sortants à chaque instant.',
    ar: 'نقطة لحام تربط 3 فروع أو أكثر: مجموع التيارات الداخلة يساوي الخارجة دائماً.',
    en: 'Copper junction connecting ≥ 3 branches: ∑ I_in = ∑ I_out at every instant.',
  },
  r1: {
    name: 'Résistance R₁',
    fr: 'Provoque une chute de potentiel U₁ = R₁ · I₁ proportionnelle à sa valeur et au courant traversant.',
    ar: 'تُحدِث هبوط جهد U₁ = R₁ · I₁ يتناسب طرداً مع مقاومتها وتيارها.',
    en: 'Drops potential U₁ = R₁ · I₁ proportional to its resistance and branch current.',
  },
  r2: {
    name: 'Résistance R₂',
    fr: 'Branche aval ou parallèle : sa tension U₂ fixe souvent le potentiel du nœud intermédiaire.',
    ar: 'فرع سفلي أو متوازٍ: يحدّد هبوط الجهد عليها U₂ قيمة الجهد عند العقدة الوسطى.',
    en: 'Lower or parallel branch resistor whose drop sets midpoint node voltage.',
  },
  r3: {
    name: 'Résistance R₃ / R_L',
    fr: 'Charge ou troisième branche : prélève du courant sur le nœud et modifie l’équilibre global.',
    ar: 'حمل أو فرع ثالث يسحب تياراً من العقدة ويؤثر في توازن الشبكة.',
    en: 'Load or third branch drawing current from the node and shifting the balance.',
  },
  bridge: {
    name: 'Pont ΔV_AB',
    fr: 'Mesure la différence V_A − V_B entre les deux bras du pont de Wheatstone (0,00 V à l’équilibre).',
    ar: 'يقيس فرق الجهد V_A − V_B بين ذراعي جسر ويتستون (0.00V عند التوازن).',
    en: 'Measures differential voltage V_A − V_B across the Wheatstone bridge (0.00 V at null).',
  },
};

type PotentialTone = 'high' | 'ctrl' | 'load' | 'return' | 'danger' | 'idle';

const POTENTIAL_STYLES: Record<PotentialTone, { border: string; text: string; symbol: string }> = {
  high: { border: '#fbbf24', text: '#fef08a', symbol: '▲' },
  ctrl: { border: '#38bdf8', text: '#bae6fd', symbol: '●' },
  load: { border: '#fb923c', text: '#fed7aa', symbol: '▸' },
  return: { border: '#2dd4bf', text: '#99f6e4', symbol: '▼' },
  danger: { border: '#fb7185', text: '#fecdd3', symbol: '⚡' },
  idle: { border: '#64748b', text: '#cbd5e1', symbol: '○' },
};

const VoltageNodeBadge: React.FC<{ x: number; y: number; text: string; tone: PotentialTone }> = ({
  x,
  y,
  text,
  tone,
}) => {
  const cfg = POTENTIAL_STYLES[tone];
  const label = `${cfg.symbol} ${text}`;
  const w = Math.max(42, label.length * 5.0 + 10);
  return (
    <g className="pointer-events-none">
      <rect
        x={x - w / 2}
        y={y - 7.5}
        width={w}
        height="15"
        rx="3.5"
        fill="#09111a"
        fillOpacity="0.93"
        stroke={cfg.border}
        strokeWidth="1.2"
      />
      <text
        x={x}
        y={y + 2.8}
        textAnchor="middle"
        fill={cfg.text}
        fontSize="7.6"
        fontFamily="monospace"
        fontWeight="700"
      >
        {label}
      </text>
    </g>
  );
};

const PcbResistor: React.FC<{
  x: number;
  y: number;
  vertical?: boolean;
  label: string;
  subLabel?: string;
  selected?: boolean;
  fault?: 'none' | 'open' | 'short';
  onClick?: () => void;
}> = ({ x, y, vertical = false, label, subLabel, selected, fault = 'none', onClick }) => {
  const bodyW = vertical ? 18 : 48;
  const bodyH = vertical ? 48 : 18;
  return (
    <g
      className="cursor-pointer"
      onClick={onClick}
      transform={`translate(${x}, ${y})`}
    >
      {/* Leads */}
      {vertical ? (
        <>
          <line x1="0" y1="-34" x2="0" y2="-24" stroke="#cbd5e1" strokeWidth="2.8" />
          <line x1="0" y1="24" x2="0" y2="34" stroke="#cbd5e1" strokeWidth="2.8" />
        </>
      ) : (
        <>
          <line x1="-34" y1="0" x2="-24" y2="0" stroke="#cbd5e1" strokeWidth="2.8" />
          <line x1="24" y1="0" x2="34" y2="0" stroke="#cbd5e1" strokeWidth="2.8" />
        </>
      )}

      {/* Ceramic Body */}
      <rect
        x={-bodyW / 2}
        y={-bodyH / 2}
        width={bodyW}
        height={bodyH}
        rx="5"
        fill={fault === 'open' ? '#451a1a' : '#e7d2ad'}
        stroke={selected ? '#fbbf24' : fault !== 'none' ? '#fb7185' : '#85643a'}
        strokeWidth={selected ? 2 : 1.2}
      />

      {/* Color bands */}
      {fault === 'open' ? (
        <g stroke="#fb7185" strokeWidth="2.2">
          <line x1="-6" y1="-6" x2="6" y2="6" />
          <line x1="6" y1="-6" x2="-6" y2="6" />
        </g>
      ) : vertical ? (
        <>
          <rect x={-bodyW / 2} y="-14" width={bodyW} height="4" fill="#92400e" />
          <rect x={-bodyW / 2} y="-5" width={bodyW} height="4" fill="#1e293b" />
          <rect x={-bodyW / 2} y="4" width={bodyW} height="4" fill="#dc2626" />
          <rect x={-bodyW / 2} y="13" width={bodyW} height="3.5" fill="#d97706" />
        </>
      ) : (
        <>
          <rect x="-15" y={-bodyH / 2} width="4" height={bodyH} fill="#92400e" />
          <rect x="-6" y={-bodyH / 2} width="4" height={bodyH} fill="#1e293b" />
          <rect x="3" y={-bodyH / 2} width="4" height={bodyH} fill="#dc2626" />
          <rect x="13" y={-bodyH / 2} width="3.5" height={bodyH} fill="#d97706" />
        </>
      )}

      {/* Short jumper wire visual */}
      {fault === 'short' && (
        <path
          d={vertical ? 'M 10,-28 C 22,-18 22,18 10,28' : 'M -28,-10 C -18,-22 18,-22 28,-10'}
          fill="none"
          stroke="#fb7185"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      )}

      {/* Silkscreen label */}
      <text
        x={vertical ? 15 : 0}
        y={vertical ? -2 : -13}
        textAnchor={vertical ? 'start' : 'middle'}
        fill="#f8fafc"
        fontSize="8.5"
        fontFamily="monospace"
        fontWeight="700"
      >
        {label}
      </text>
      {subLabel && (
        <text
          x={vertical ? 15 : 0}
          y={vertical ? 9 : 21}
          textAnchor={vertical ? 'start' : 'middle'}
          fill="#fef08a"
          fontSize="7.6"
          fontFamily="monospace"
          fontWeight="600"
        >
          {subLabel}
        </text>
      )}
    </g>
  );
};

const PcbBattery: React.FC<{
  x: number;
  y: number;
  label: string;
  voltage: number;
  flipped?: boolean;
  selected?: boolean;
  onClick?: () => void;
}> = ({ x, y, label, voltage, flipped = false, selected, onClick }) => (
  <g className="cursor-pointer" onClick={onClick} transform={`translate(${x}, ${y})`}>
    <rect
      x="-22"
      y="-32"
      width="44"
      height="64"
      rx="6"
      fill="#1e293b"
      stroke={selected ? '#fbbf24' : '#475569'}
      strokeWidth={selected ? 2 : 1.3}
    />
    <rect
      x="-22"
      y={flipped ? 10 : -32}
      width="44"
      height="22"
      rx="5"
      fill="#b45309"
      fillOpacity="0.88"
    />
    <text
      x="0"
      y={flipped ? 24 : -18}
      textAnchor="middle"
      fill="#fef3c7"
      fontSize="9"
      fontFamily="monospace"
      fontWeight="800"
    >
      +
    </text>
    <text
      x="0"
      y={flipped ? -18 : 24}
      textAnchor="middle"
      fill="#cbd5e1"
      fontSize="10"
      fontFamily="monospace"
      fontWeight="800"
    >
      −
    </text>
    <text
      x="0"
      y="0"
      textAnchor="middle"
      fill="#f8fafc"
      fontSize="8.5"
      fontFamily="monospace"
      fontWeight="700"
    >
      {label}
    </text>
    <text
      x="0"
      y="10"
      textAnchor="middle"
      fill="#fbbf24"
      fontSize="8"
      fontFamily="monospace"
      fontWeight="700"
    >
      {voltage.toFixed(1)}V
    </text>
  </g>
);

const PcbLed: React.FC<{
  x: number;
  y: number;
  color: 'red' | 'blue' | 'amber';
  lit: boolean;
  label: string;
  currentMA: number;
}> = ({ x, y, color, lit, label, currentMA }) => {
  const palette =
    color === 'blue'
      ? { off: '#1e3a8a', on: '#38bdf8', glow: 'rgba(56,189,248,0.85)' }
      : color === 'amber'
      ? { off: '#78350f', on: '#fbbf24', glow: 'rgba(251,191,36,0.85)' }
      : { off: '#7f1d1d', on: '#ef4444', glow: 'rgba(239,68,68,0.85)' };

  return (
    <g transform={`translate(${x}, ${y})`}>
      {lit && (
        <circle
          cx="0"
          cy="0"
          r="19"
          fill={palette.glow}
          opacity="0.42"
        />
      )}
      <line x1="0" y1="-20" x2="0" y2="-11" stroke="#cbd5e1" strokeWidth="2.4" />
      <line x1="0" y1="11" x2="0" y2="20" stroke="#cbd5e1" strokeWidth="2.4" />
      <circle
        cx="0"
        cy="0"
        r="11"
        fill={lit ? palette.on : palette.off}
        stroke="#e2e8f0"
        strokeWidth="1.5"
      />
      <circle cx="-3" cy="-3" r="3" fill="#ffffff" opacity={lit ? 0.85 : 0.25} />
      <text
        x="15"
        y="-2"
        fill="#f8fafc"
        fontSize="8"
        fontFamily="monospace"
        fontWeight="700"
      >
        {label}
      </text>
      <text
        x="15"
        y="9"
        fill={lit ? '#fef08a' : '#94a3b8'}
        fontSize="7.4"
        fontFamily="monospace"
        fontWeight="700"
      >
        {currentMA.toFixed(1)}mA
      </text>
    </g>
  );
};

export const KirchhoffBoard3D: React.FC<Props> = ({ params, sim, lang, onQuickAction }) => {
  const [selectedPart, setSelectedPart] = useState<string>('nodeA');
  const inspector = PART_INFO[selectedPart] ?? PART_INFO.nodeA;

  const absI = Math.max(Math.abs(sim.iTotalMA), Math.abs(sim.i1MA), Math.abs(sim.i2MA));
  const flowSpeed = `${Math.max(0.35, 1.35 - Math.min(0.85, absI * 0.025)).toFixed(2)}s`;
  const hasFlow = Math.abs(sim.iTotalMA) > 0.05 || Math.abs(sim.i1MA) > 0.05 || Math.abs(sim.i2MA) > 0.05;

  const formatOhm = (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}kΩ` : `${val}Ω`);

  const top = params.topology;
  const isTwoMesh = top === 'two-mesh-millman';
  const isBridge = top === 'wheatstone-bridge';
  const isParallel = top === 'parallel-2' || top === 'parallel-3' || top === 'led-parallel-trap';
  const isLoadedDiv = top === 'loaded-divider';
  const isDualSources = top === 'dual-sources';
  const isInternalRi = top === 'internal-resistance';
  const isLedSeries = top === 'led-series-kvl';

  return (
    <div className="flex flex-col gap-3">
      <div
        className="workbench-mat rounded-xl border border-stone-300 dark:border-stone-700 p-4 sm:p-5 relative overflow-hidden"
        style={{ ['--flow-speed' as string]: flowSpeed }}
      >
        {/* Top Overlay Pill */}
        <div className="flex items-center justify-between gap-2 mb-3 text-xs">
          <span className="font-mono-num px-2.5 py-1 rounded bg-stone-900/75 text-emerald-300 border border-emerald-500/35">
            {tr(lang, 'Platine 3D Kirchhoff · Potentiels & Flux', 'لوحة كيرشوف ثلاثية الأبعاد · الجهود والتيار', '3D Kirchhoff PCB · Potentials & Flow')}
          </span>
          <span className="font-mono-num px-2.5 py-1 rounded bg-stone-900/75 text-stone-200 border border-stone-700">
            ∑U = {sim.kvlLoop1ResidualV.toFixed(2)} V · ∑I = {sim.kclNodeResidualMA.toFixed(2)} mA
          </span>
        </div>

        {/* 3D Tilted Emerald PCB */}
        <div className="relative mx-auto max-w-2xl" style={{ perspective: '950px' }}>
          <div
            className="rounded-2xl border-2 border-emerald-300/60 bg-gradient-to-br from-[#1f8a5e] via-[#18734d] to-[#125d3e] shadow-[0_22px_34px_rgba(8,26,20,0.45)] p-3 sm:p-4 transition-transform duration-300"
            style={{ transform: 'rotateX(10deg)' }}
          >
            <svg
              viewBox="0 0 520 260"
              className="w-full h-auto select-none"
              direction="ltr"
              role="img"
              aria-label={tr(lang, 'Platine PCB interactive Kirchhoff', 'لوحة كيرشوف التفاعلية', 'Interactive Kirchhoff PCB')}
            >
              {/* PCB Corner Mounting Holes */}
              {[
                [14, 14],
                [506, 14],
                [14, 246],
                [506, 246],
              ].map(([cx, cy], idx) => (
                <g key={idx}>
                  <circle cx={cx} cy={cy} r="5.5" fill="#0d3d29" stroke="#f59e0b" strokeWidth="1.4" />
                  <circle cx={cx} cy={cy} r="2.2" fill="#2a6b70" />
                </g>
              ))}

              {/* Silkscreen Title */}
              <text x="28" y="20" fill="#a7f3d0" fontSize="8.5" fontFamily="monospace" fontWeight="700" opacity="0.85">
                KIRCHHOFF LAB REV-K3 · {top.toUpperCase()}
              </text>

              {/* ================= 1. SINGLE-LOOP FAMILY (series-2r, series-3r, led-series-kvl, internal-resistance) ================= */}
              {!isTwoMesh && !isBridge && !isParallel && !isLoadedDiv && !isDualSources && (
                <g>
                  {/* Copper Base Traces */}
                  <path
                    d="M 85 95 L 85 52 L 435 52 L 435 208 L 85 208 L 85 165"
                    fill="none"
                    stroke="#0d4a31"
                    strokeWidth="7"
                    strokeLinejoin="round"
                  />

                  {/* Live Color-Pulsing Traces */}
                  {/* Supply high rail from Battery+ to R1 */}
                  <path
                    d="M 85 95 L 85 52 L 190 52"
                    fill="none"
                    className={
                      sim.overloadWarning
                        ? 'flow-pulse-danger'
                        : hasFlow
                        ? 'flow-pulse-high'
                        : 'potential-pulse-high'
                    }
                    stroke="#fbbf24"
                    strokeWidth="3.6"
                    strokeLinejoin="round"
                  />

                  {/* Mid trace R1 -> R2 */}
                  <path
                    d="M 260 52 L 435 52 L 435 95"
                    fill="none"
                    className={
                      sim.faultActive === 'open'
                        ? ''
                        : sim.overloadWarning
                        ? 'flow-pulse-danger'
                        : hasFlow
                        ? 'flow-pulse-load'
                        : ''
                    }
                    stroke={sim.faultActive === 'open' ? '#64748b' : '#fb923c'}
                    strokeWidth="3.4"
                    strokeLinejoin="round"
                    strokeDasharray={sim.faultActive === 'open' ? '4 4' : undefined}
                  />

                  {/* Return trace to GND */}
                  <path
                    d="M 435 165 L 435 208 L 85 208 L 85 165"
                    fill="none"
                    className={
                      sim.faultActive === 'open'
                        ? ''
                        : hasFlow
                        ? 'flow-pulse-return'
                        : ''
                    }
                    stroke={sim.faultActive === 'open' ? '#475569' : '#2dd4bf'}
                    strokeWidth="3.4"
                    strokeLinejoin="round"
                  />

                  {/* KVL Loop Indicator */}
                  <rect
                    x="150"
                    y="82"
                    width="220"
                    height="96"
                    rx="16"
                    fill="none"
                    stroke="#a7f3d0"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                    opacity="0.55"
                  />
                  <text x="260" y="132" textAnchor="middle" fill="#d1fae5" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                    ↻ Maille M1 · ∑U = {sim.kvlLoop1ResidualV.toFixed(2)}V
                  </text>
                  <text x="260" y="147" textAnchor="middle" fill="#fde68a" fontSize="8.5" fontFamily="monospace" fontWeight="700">
                    I = {sim.iTotalMA.toFixed(2)} mA
                  </text>

                  {/* Battery E1 */}
                  <PcbBattery
                    x={85}
                    y={130}
                    label={isInternalRi ? 'E (r_i)' : 'E₁'}
                    voltage={params.e1}
                    selected={selectedPart === 'e1'}
                    onClick={() => setSelectedPart('e1')}
                  />

                  {/* Internal Resistance r_i badge or R1 */}
                  {isInternalRi ? (
                    <PcbResistor
                      x={225}
                      y={52}
                      label={`r_i ${params.rInternal.toFixed(1)}Ω`}
                      subLabel={`-${sim.uInternal.toFixed(2)}V`}
                      selected={selectedPart === 'r1'}
                      onClick={() => setSelectedPart('r1')}
                    />
                  ) : (
                    <PcbResistor
                      x={225}
                      y={52}
                      label={`R₁ ${formatOhm(params.r1)}`}
                      subLabel={`-${sim.u1.toFixed(2)}V`}
                      selected={selectedPart === 'r1'}
                      onClick={() => setSelectedPart('r1')}
                    />
                  )}

                  {/* Extra R2 on top for series-3r */}
                  {top === 'series-3r' && (
                    <PcbResistor
                      x={355}
                      y={52}
                      label={`R₂ ${formatOhm(params.r2)}`}
                      subLabel={`-${sim.u2.toFixed(2)}V`}
                      selected={selectedPart === 'r2'}
                      onClick={() => setSelectedPart('r2')}
                    />
                  )}

                  {/* Right Vertical Dipôle: LED(s) or R2/R3/RL */}
                  {isLedSeries ? (
                    <PcbLed
                      x={435}
                      y={130}
                      color="red"
                      lit={sim.led1Lit}
                      label={`LED (${(params.vfLed1 + (params.loadConnected ? params.vfLed2 : 0)).toFixed(1)}V)`}
                      currentMA={sim.iTotalMA}
                    />
                  ) : isInternalRi ? (
                    <PcbResistor
                      x={435}
                      y={130}
                      vertical
                      label={params.loadConnected ? `R_L ${formatOhm(params.rLoad)}` : 'OUVERT'}
                      subLabel={`${sim.uLoad.toFixed(2)}V`}
                      fault={params.faultMode === 'short' ? 'short' : !params.loadConnected ? 'open' : 'none'}
                      selected={selectedPart === 'r3'}
                      onClick={() => setSelectedPart('r3')}
                    />
                  ) : (
                    <PcbResistor
                      x={435}
                      y={130}
                      vertical
                      label={top === 'series-3r' ? `R₃ ${formatOhm(params.r3)}` : `R₂ ${formatOhm(params.r2)}`}
                      subLabel={`-${(top === 'series-3r' ? sim.u3 : sim.u2).toFixed(2)}V`}
                      fault={params.faultMode}
                      selected={selectedPart === 'r2'}
                      onClick={() => setSelectedPart('r2')}
                    />
                  )}

                  {/* Live Voltage Potential Nodes */}
                  <VoltageNodeBadge x={125} y={34} text={`+${sim.vPlus.toFixed(2)}V`} tone="high" />
                  <VoltageNodeBadge
                    x={435}
                    y={34}
                    text={`V_A ${sim.vOut.toFixed(2)}V`}
                    tone={sim.faultActive === 'open' ? 'danger' : 'ctrl'}
                  />
                  <VoltageNodeBadge x={260} y={224} text="GND 0.00V" tone="return" />
                </g>
              )}

              {/* ================= 2. DUAL SOURCES IN ONE LOOP ================= */}
              {isDualSources && (
                <g>
                  <path
                    d="M 85 95 L 85 52 L 435 52 L 435 95 M 435 165 L 435 208 L 85 208 L 85 165"
                    fill="none"
                    stroke="#0d4a31"
                    strokeWidth="7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 85 95 L 85 52 L 435 52 L 435 95"
                    fill="none"
                    className={
                      !hasFlow
                        ? 'potential-pulse-high'
                        : sim.iTotalMA < 0
                        ? 'flow-pulse-load-rev'
                        : 'flow-pulse-high'
                    }
                    stroke="#fbbf24"
                    strokeWidth="3.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 435 165 L 435 208 L 85 208 L 85 165"
                    fill="none"
                    className={
                      !hasFlow
                        ? ''
                        : sim.iTotalMA < 0
                        ? 'flow-pulse-return-rev'
                        : 'flow-pulse-return'
                    }
                    stroke="#2dd4bf"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />

                  <PcbBattery
                    x={85}
                    y={130}
                    label="E₁"
                    voltage={params.e1}
                    selected={selectedPart === 'e1'}
                    onClick={() => setSelectedPart('e1')}
                  />
                  <PcbBattery
                    x={435}
                    y={130}
                    label="E₂"
                    voltage={params.e2}
                    flipped={!params.secondSourceOpposing}
                    selected={selectedPart === 'e2'}
                    onClick={() => setSelectedPart('e2')}
                  />
                  <PcbResistor
                    x={260}
                    y={52}
                    label={`R₁ ${formatOhm(params.r1)}`}
                    subLabel={`${sim.u1 >= 0 ? '-' : '+'}${Math.abs(sim.u1).toFixed(2)}V`}
                    selected={selectedPart === 'r1'}
                    onClick={() => setSelectedPart('r1')}
                  />
                  <PcbResistor
                    x={260}
                    y={208}
                    label={`R₂ ${formatOhm(params.r2)}`}
                    subLabel={`${sim.u2 >= 0 ? '-' : '+'}${Math.abs(sim.u2).toFixed(2)}V`}
                    selected={selectedPart === 'r2'}
                    onClick={() => setSelectedPart('r2')}
                  />

                  <text x="260" y="124" textAnchor="middle" fill="#fef08a" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                    {sim.iTotalMA >= 0 ? '↻ I horaire' : '↺ I inversé (E₂ domine)'} : {sim.iTotalMA.toFixed(2)} mA
                  </text>
                  <text x="260" y="141" textAnchor="middle" fill="#a7f3d0" fontSize="8.3" fontFamily="monospace">
                    {params.secondSourceOpposing ? 'Opposition (+ face à +)' : 'Série additive (+ vers −)'}
                  </text>

                  <VoltageNodeBadge x={115} y={32} text={`+${params.e1.toFixed(1)}V`} tone="high" />
                  <VoltageNodeBadge
                    x={405}
                    y={32}
                    text={params.secondSourceOpposing ? `+${params.e2.toFixed(1)}V` : `-${params.e2.toFixed(1)}V`}
                    tone={sim.iTotalMA < 0 ? 'load' : 'ctrl'}
                  />
                  <VoltageNodeBadge x={120} y={232} text="0.00V" tone="return" />
                </g>
              )}

              {/* ================= 3. LOADED DIVIDER ================= */}
              {isLoadedDiv && (
                <g>
                  <path
                    d="M 80 95 L 80 52 L 300 52 L 300 208 L 80 208 L 80 165"
                    fill="none"
                    stroke="#0d4a31"
                    strokeWidth="7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 300 52 L 440 52 L 440 208 L 300 208"
                    fill="none"
                    stroke="#0d4a31"
                    strokeWidth="7"
                    strokeLinejoin="round"
                  />

                  {/* Main current I1 */}
                  <path
                    d="M 80 95 L 80 52 L 300 52"
                    fill="none"
                    className="flow-pulse-high"
                    stroke="#fbbf24"
                    strokeWidth="3.6"
                  />
                  {/* Branch R2 current I2 */}
                  <path
                    d="M 300 52 L 300 208"
                    fill="none"
                    className="flow-pulse-ctrl"
                    stroke="#38bdf8"
                    strokeWidth="3.2"
                  />
                  {/* Branch RL current IL */}
                  <path
                    d="M 300 52 L 440 52 L 440 208 L 300 208"
                    fill="none"
                    className={params.loadConnected ? 'flow-pulse-load' : ''}
                    stroke={params.loadConnected ? '#fb923c' : '#475569'}
                    strokeWidth="3.2"
                    strokeDasharray={params.loadConnected ? undefined : '4 4'}
                  />
                  {/* Return GND */}
                  <path
                    d="M 300 208 L 80 208 L 80 165"
                    fill="none"
                    className="flow-pulse-return"
                    stroke="#2dd4bf"
                    strokeWidth="3.6"
                  />

                  <PcbBattery
                    x={80}
                    y={130}
                    label="E₁"
                    voltage={params.e1}
                    selected={selectedPart === 'e1'}
                    onClick={() => setSelectedPart('e1')}
                  />
                  <PcbResistor
                    x={190}
                    y={52}
                    label={`R₁ ${formatOhm(params.r1)}`}
                    subLabel={`-${sim.u1.toFixed(2)}V`}
                    selected={selectedPart === 'r1'}
                    onClick={() => setSelectedPart('r1')}
                  />
                  <PcbResistor
                    x={300}
                    y={130}
                    vertical
                    label={`R₂ ${formatOhm(params.r2)}`}
                    subLabel={`${sim.i2MA.toFixed(1)}mA`}
                    selected={selectedPart === 'r2'}
                    onClick={() => setSelectedPart('r2')}
                  />
                  <PcbResistor
                    x={440}
                    y={130}
                    vertical
                    label={params.loadConnected ? `R_L ${formatOhm(params.rLoad)}` : 'À VIDE'}
                    subLabel={params.loadConnected ? `${sim.iLoadMA.toFixed(1)}mA` : '0.0mA'}
                    fault={params.loadConnected ? 'none' : 'open'}
                    selected={selectedPart === 'r3'}
                    onClick={() => setSelectedPart('r3')}
                  />

                  {/* Copper Junction Node A */}
                  <circle
                    cx="300"
                    cy="52"
                    r="7"
                    fill="#fbbf24"
                    stroke="#09111a"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onClick={() => setSelectedPart('nodeA')}
                  />
                  <VoltageNodeBadge x={300} y={26} text={`Nœud A: ${sim.vOut.toFixed(2)}V`} tone="ctrl" />
                  <VoltageNodeBadge x={190} y={77} text={`I₁ ${sim.i1MA.toFixed(1)}mA`} tone="high" />
                  <VoltageNodeBadge x={190} y={226} text="GND 0.00V" tone="return" />
                </g>
              )}

              {/* ================= 4. PARALLEL KCL (2 or 3 branches + LED parallel trap) ================= */}
              {isParallel && (
                <g>
                  {/* Bus backbone */}
                  <path
                    d="M 80 95 L 80 52 L 420 52 M 420 208 L 80 208 L 80 165"
                    fill="none"
                    stroke="#0d4a31"
                    strokeWidth="7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 80 95 L 80 52 L 220 52"
                    fill="none"
                    className={sim.overloadWarning ? 'flow-pulse-danger' : hasFlow ? 'flow-pulse-high' : 'potential-pulse-high'}
                    stroke="#fbbf24"
                    strokeWidth="3.8"
                  />
                  <path
                    d="M 220 52 L 420 52"
                    fill="none"
                    className={hasFlow ? 'flow-pulse-ctrl' : ''}
                    stroke="#38bdf8"
                    strokeWidth="3.2"
                  />

                  {/* Branch 1 */}
                  <line
                    x1="220"
                    y1="52"
                    x2="220"
                    y2="208"
                    className={sim.i1MA > 0.05 ? 'flow-pulse-load' : ''}
                    stroke={sim.i1MA > 0.05 ? '#fb923c' : '#475569'}
                    strokeWidth="3.2"
                  />

                  {/* Branch 2 */}
                  <line
                    x1="330"
                    y1="52"
                    x2="330"
                    y2="208"
                    className={sim.i2MA > 0.05 ? 'flow-pulse-ctrl' : ''}
                    stroke={sim.i2MA > 0.05 ? '#38bdf8' : '#475569'}
                    strokeWidth="3.2"
                  />

                  {/* Branch 3 (for parallel-3) */}
                  {top === 'parallel-3' && (
                    <line
                      x1="430"
                      y1="52"
                      x2="430"
                      y2="208"
                      className={sim.i3MA > 0.05 ? 'flow-pulse-load' : ''}
                      stroke={sim.i3MA > 0.05 ? '#fb923c' : '#475569'}
                      strokeWidth="3.2"
                    />
                  )}

                  {/* Bottom GND return */}
                  <path
                    d="M 430 208 L 80 208 L 80 165"
                    fill="none"
                    className={hasFlow ? 'flow-pulse-return' : ''}
                    stroke="#2dd4bf"
                    strokeWidth="3.8"
                  />

                  <PcbBattery
                    x={80}
                    y={130}
                    label="E₁"
                    voltage={params.e1}
                    selected={selectedPart === 'e1'}
                    onClick={() => setSelectedPart('e1')}
                  />

                  {top === 'led-parallel-trap' ? (
                    <>
                      {!params.separateLedResistors ? (
                        <>
                          <PcbResistor
                            x={145}
                            y={52}
                            label={`R₁ ${formatOhm(params.r1)}`}
                            subLabel={`-${sim.u1.toFixed(2)}V`}
                            selected={selectedPart === 'r1'}
                            onClick={() => setSelectedPart('r1')}
                          />
                          <PcbLed x={220} y={135} color="red" lit={sim.led1Lit} label={`LED1 (${params.vfLed1}V)`} currentMA={sim.i1MA} />
                          <PcbLed x={355} y={135} color="blue" lit={sim.led2Lit} label={`LED2 (${params.vfLed2}V)`} currentMA={sim.i2MA} />
                        </>
                      ) : (
                        <>
                          <PcbResistor x={220} y={92} vertical label={`R₁ ${formatOhm(params.r1)}`} selected={selectedPart === 'r1'} onClick={() => setSelectedPart('r1')} />
                          <PcbLed x={220} y={168} color="red" lit={sim.led1Lit} label="LED1" currentMA={sim.i1MA} />
                          <PcbResistor x={355} y={92} vertical label={`R₂ ${formatOhm(params.r2)}`} selected={selectedPart === 'r2'} onClick={() => setSelectedPart('r2')} />
                          <PcbLed x={355} y={168} color="blue" lit={sim.led2Lit} label="LED2" currentMA={sim.i2MA} />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <PcbResistor
                        x={220}
                        y={130}
                        vertical
                        label={`R₁ ${formatOhm(params.r1)}`}
                        subLabel={`${sim.i1MA.toFixed(1)}mA`}
                        selected={selectedPart === 'r1'}
                        onClick={() => setSelectedPart('r1')}
                      />
                      <PcbResistor
                        x={330}
                        y={130}
                        vertical
                        label={`R₂ ${formatOhm(params.r2)}`}
                        subLabel={`${sim.i2MA.toFixed(1)}mA`}
                        fault={top === 'parallel-2' ? params.faultMode : 'none'}
                        selected={selectedPart === 'r2'}
                        onClick={() => setSelectedPart('r2')}
                      />
                      {top === 'parallel-3' && (
                        <PcbResistor
                          x={430}
                          y={130}
                          vertical
                          label={`R₃ ${formatOhm(params.r3)}`}
                          subLabel={`${sim.i3MA.toFixed(1)}mA`}
                          fault={params.faultMode === 'open' ? 'open' : 'none'}
                          selected={selectedPart === 'r3'}
                          onClick={() => setSelectedPart('r3')}
                        />
                      )}
                    </>
                  )}

                  {/* Node A Manifold Solder Pad */}
                  <circle
                    cx="220"
                    cy="52"
                    r="7"
                    fill="#fbbf24"
                    stroke="#09111a"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onClick={() => setSelectedPart('nodeA')}
                  />
                  <VoltageNodeBadge x={140} y={28} text={`I_tot ${sim.iTotalMA.toFixed(1)}mA`} tone="high" />
                  <VoltageNodeBadge x={255} y={28} text={`Nœud A: ${sim.vA.toFixed(2)}V`} tone="ctrl" />
                  <VoltageNodeBadge x={220} y={230} text="GND 0.00V" tone="return" />
                </g>
              )}

              {/* ================= 5. TWO-MESH MILLMAN NETWORK ================= */}
              {isTwoMesh && (
                <g>
                  <path
                    d="M 75 95 L 75 52 L 445 52 L 445 95 M 260 52 L 260 208 M 75 165 L 75 208 L 445 208 L 445 165"
                    fill="none"
                    stroke="#0d4a31"
                    strokeWidth="7"
                    strokeLinejoin="round"
                  />

                  {/* Left branch M1 */}
                  <path
                    d="M 75 95 L 75 52 L 260 52"
                    fill="none"
                    className={sim.i1MA < -0.05 ? 'flow-pulse-high-rev' : 'flow-pulse-high'}
                    stroke="#fbbf24"
                    strokeWidth="3.6"
                  />
                  {/* Right branch M2 */}
                  <path
                    d="M 445 95 L 445 52 L 260 52"
                    fill="none"
                    className={sim.i2MA < -0.05 ? 'flow-pulse-ctrl-rev' : 'flow-pulse-ctrl'}
                    stroke="#38bdf8"
                    strokeWidth="3.6"
                  />
                  {/* Center R3 drain to GND */}
                  <line
                    x1="260"
                    y1="52"
                    x2="260"
                    y2="208"
                    className={sim.i3MA > 0.05 ? 'flow-pulse-load' : ''}
                    stroke="#fb923c"
                    strokeWidth="3.8"
                  />
                  {/* Return GND paths */}
                  <path
                    d="M 260 208 L 75 208 L 75 165 M 260 208 L 445 208 L 445 165"
                    fill="none"
                    className="flow-pulse-return"
                    stroke="#2dd4bf"
                    strokeWidth="3.4"
                  />

                  <PcbBattery
                    x={75}
                    y={130}
                    label="E₁"
                    voltage={params.e1}
                    selected={selectedPart === 'e1'}
                    onClick={() => setSelectedPart('e1')}
                  />
                  <PcbBattery
                    x={445}
                    y={130}
                    label="E₂"
                    voltage={params.e2}
                    selected={selectedPart === 'e2'}
                    onClick={() => setSelectedPart('e2')}
                  />
                  <PcbResistor
                    x={168}
                    y={52}
                    label={`R₁ ${formatOhm(params.r1)}`}
                    subLabel={`I₁ ${sim.i1MA.toFixed(1)}mA`}
                    selected={selectedPart === 'r1'}
                    onClick={() => setSelectedPart('r1')}
                  />
                  <PcbResistor
                    x={352}
                    y={52}
                    label={`R₂ ${formatOhm(params.r2)}`}
                    subLabel={`I₂ ${sim.i2MA.toFixed(1)}mA`}
                    selected={selectedPart === 'r2'}
                    onClick={() => setSelectedPart('r2')}
                  />
                  <PcbResistor
                    x={260}
                    y={130}
                    vertical
                    label={`R₃ ${formatOhm(params.r3)}`}
                    subLabel={`I₃ ${sim.i3MA.toFixed(1)}mA`}
                    selected={selectedPart === 'r3'}
                    onClick={() => setSelectedPart('r3')}
                  />

                  <circle
                    cx="260"
                    cy="52"
                    r="7.5"
                    fill="#fbbf24"
                    stroke="#09111a"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onClick={() => setSelectedPart('nodeA')}
                  />
                  <VoltageNodeBadge x={260} y={24} text={`V_A = ${sim.vA.toFixed(2)}V`} tone="ctrl" />
                  <VoltageNodeBadge x={260} y={228} text="GND 0.00V" tone="return" />
                </g>
              )}

              {/* ================= 6. WHEATSTONE BRIDGE ================= */}
              {isBridge && (
                <g>
                  <path
                    d="M 75 95 L 75 46 L 415 46 M 415 46 L 415 214 L 75 214 L 75 165 M 225 46 L 225 214 M 225 130 L 415 130"
                    fill="none"
                    stroke="#0d4a31"
                    strokeWidth="7"
                    strokeLinejoin="round"
                  />
                  {/* Supply */}
                  <path
                    d="M 75 95 L 75 46 L 415 46"
                    fill="none"
                    className="flow-pulse-high"
                    stroke="#fbbf24"
                    strokeWidth="3.6"
                  />
                  {/* Left arm */}
                  <line x1="225" y1="46" x2="225" y2="214" className="flow-pulse-ctrl" stroke="#38bdf8" strokeWidth="3.2" />
                  {/* Right arm */}
                  <line x1="415" y1="46" x2="415" y2="214" className="flow-pulse-load" stroke="#fb923c" strokeWidth="3.2" />
                  {/* Cross bridge A <-> B */}
                  <line
                    x1="225"
                    y1="130"
                    x2="415"
                    y2="130"
                    className={
                      sim.balancedBridge
                        ? ''
                        : sim.iBridgeMA >= 0
                        ? 'flow-pulse-danger'
                        : 'flow-pulse-ctrl-rev'
                    }
                    stroke={sim.balancedBridge ? '#34d399' : '#fb7185'}
                    strokeWidth="3.2"
                  />
                  {/* GND return */}
                  <path
                    d="M 415 214 L 75 214 L 75 165"
                    fill="none"
                    className="flow-pulse-return"
                    stroke="#2dd4bf"
                    strokeWidth="3.6"
                  />

                  <PcbBattery
                    x={75}
                    y={130}
                    label="E₁"
                    voltage={params.e1}
                    selected={selectedPart === 'e1'}
                    onClick={() => setSelectedPart('e1')}
                  />

                  {/* Arm resistors */}
                  <PcbResistor x={225} y={84} vertical label={`R₁ ${formatOhm(params.r1)}`} selected={selectedPart === 'r1'} onClick={() => setSelectedPart('r1')} />
                  <PcbResistor x={225} y={176} vertical label={`R₂ ${formatOhm(params.r2)}`} selected={selectedPart === 'r2'} onClick={() => setSelectedPart('r2')} />
                  <PcbResistor x={415} y={84} vertical label={`R₃ ${formatOhm(params.r3)}`} selected={selectedPart === 'r3'} onClick={() => setSelectedPart('r3')} />
                  <PcbResistor x={415} y={176} vertical label={`R_L ${formatOhm(params.rLoad)}`} selected={selectedPart === 'r3'} onClick={() => setSelectedPart('r3')} />

                  {/* Bridge center meter */}
                  <g className="cursor-pointer" onClick={() => setSelectedPart('bridge')}>
                    <circle
                      cx="320"
                      cy="130"
                      r="20"
                      fill="#09111a"
                      stroke={sim.balancedBridge ? '#34d399' : '#fb7185'}
                      strokeWidth="2.2"
                    />
                    <text x="320" y="128" textAnchor="middle" fill={sim.balancedBridge ? '#6ee7b7' : '#fecdd3'} fontSize="8" fontFamily="monospace" fontWeight="700">
                      ΔV_AB
                    </text>
                    <text x="320" y="139" textAnchor="middle" fill="#fef08a" fontSize="8" fontFamily="monospace" fontWeight="700">
                      {(sim.vA - sim.vB).toFixed(2)}V
                    </text>
                  </g>

                  <circle cx="225" cy="130" r="6" fill="#38bdf8" stroke="#09111a" strokeWidth="1.8" />
                  <circle cx="415" cy="130" r="6" fill="#fb923c" stroke="#09111a" strokeWidth="1.8" />
                  <VoltageNodeBadge x={175} y={130} text={`V_A ${sim.vA.toFixed(2)}V`} tone="ctrl" />
                  <VoltageNodeBadge x={465} y={130} text={`V_B ${sim.vB.toFixed(2)}V`} tone="load" />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Interactive Legend & Quick Fault Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-num">
          <div className="flex flex-wrap items-center gap-2 text-stone-100">
            <span className="px-2 py-0.5 rounded bg-stone-900/70 border border-amber-400/50 text-amber-200">
              ▲ {tr(lang, 'Haut potentiel', 'جهد مرتفع', 'High Rail')}
            </span>
            <span className="px-2 py-0.5 rounded bg-stone-900/70 border border-sky-400/50 text-sky-200">
              ● {tr(lang, 'Nœud / Branche', 'عقدة / فرع', 'Node / Branch')}
            </span>
            <span className="px-2 py-0.5 rounded bg-stone-900/70 border border-orange-400/50 text-orange-200">
              ▸ {tr(lang, 'Charge R_L', 'الحمل', 'Load')}
            </span>
            <span className="px-2 py-0.5 rounded bg-stone-900/70 border border-teal-400/50 text-teal-200">
              ▼ {tr(lang, 'Retour GND', 'الراجع للأرضي', 'GND Return')}
            </span>
          </div>

          {onQuickAction && (
            <button
              type="button"
              onClick={() => onQuickAction('cycle-fault')}
              className="px-2.5 py-1 rounded bg-stone-900/85 hover:bg-stone-900 text-amber-300 border border-amber-500/40 cursor-pointer"
            >
              {tr(lang, 'Tester défaut (Ouvert / CC)', 'تجربة عطل (قطع / قصر)', 'Cycle Fault (Open / Short)')}
            </button>
          )}
        </div>
      </div>

      {/* Component Click Inspector */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/70 p-3 text-xs">
        <div className="font-mono-num font-bold text-emerald-700 dark:text-emerald-400">
          {inspector.name}
        </div>
        <p className="text-stone-700 dark:text-stone-300 mt-1 leading-relaxed">
          {inspector[lang]}
        </p>
      </div>
    </div>
  );
};
